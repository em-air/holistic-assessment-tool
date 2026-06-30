import logger from '../lib/logger.js';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { verifySupabaseToken, requireRole, isAdmin, validateParams, commonSchemas } from '../middleware/index.js';
import {
  generateEnglishPDF,
  generateReportPDF,
  uploadPDF,
  getSignedUrl,
  deletePDF
} from '../services/index.js';
import type { ReportInsert, ReportType } from '../types/database.js';

const router = Router();

const reportIdParams = z.object({ reportId: commonSchemas.uuid });
/**
 * POST /api/reports/generate
 * Generate PDF report (mind + oral + academic)
 */
router.post('/generate', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const generateSchema = z.object({
      report_type: z.enum(['mind', 'oral', 'academic', 'full']).default('full'),
      audience: z.enum(['parent', 'teacher']).default('parent'),
      language: z.enum(['english']).default('english'),
    });

    const validation = generateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { report_type, audience } = validation.data;

    // Fetch all quiz results
    const [mindResults, oralResults, academicResults, learningResults] = await Promise.all([
      supabaseAdmin
        .from('quiz_results')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('category', 'mind')
        .then(r => r.data || []),
      supabaseAdmin
        .from('quiz_results')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('category', 'oral')
        .then(r => r.data || []),
      supabaseAdmin
        .from('quiz_results')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('category', 'academic')
        .then(r => r.data || []),
      supabaseAdmin
        .from('quiz_results')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('category', 'learning')
        .then(r => r.data || []),
    ]);

    // Both learning-styles and social-emotional are Cognition quizzes (same as progress bar).
    // Pull any copies still in the learning bucket (saved before category migration).
    const COGNITION_IDS = ['learning-styles', 'social-emotional'];
    const filteredMindResults = [
      ...mindResults,
      ...learningResults.filter(
        r => COGNITION_IDS.includes(r.quiz_id) && !mindResults.some(m => m.quiz_id === r.quiz_id)
      ),
    ];
    // Only truly "learning" category rows (none expected now, kept for safety)
    const mergedLearningResults = learningResults.filter(r => !COGNITION_IDS.includes(r.quiz_id));

    // Filter by report type
    const reportData = {
      profile: req.user.profile,
      mindResults: report_type === 'full' || report_type === 'mind' ? filteredMindResults : [],
      oralResults: report_type === 'full' || report_type === 'oral' ? oralResults : [],
      academicResults: report_type === 'full' || report_type === 'academic' ? academicResults : [],
      learningResults: report_type === 'full' ? mergedLearningResults : [],
      generatedAt: new Date(),
      audience,
    };

    const pdfBuffer = await generateEnglishPDF(reportData);
    const storageResult = await uploadPDF(req.user.id, pdfBuffer, `en_${audience}_${report_type}`);
    if (!storageResult) {
      return res.status(500).json({ error: 'Failed to upload report' });
    }

    // Save report record
    const reportInsert: ReportInsert = {
      user_id: req.user.id,
      report_type: report_type as ReportType,
      pdf_url: storageResult.path,
      emailed_to: [],
    };

    const { data: report, error: insertError } = await supabaseAdmin
      .from('reports')
      .insert(reportInsert)
      .select()
      .single();

    if (insertError) {
      logger.error(insertError, 'Save report error:');
      return res.status(500).json({ error: 'Failed to save report record' });
    }

    const downloadUrl = await getSignedUrl(storageResult.path);

    res.json({
      success: true,
      report,
      downloadUrl,
    });
  } catch (error) {
    logger.error(error, 'Generate report error:');
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

/**
 * GET /api/reports
 * List all reports for current user
 */
router.get('/', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('user_id', req.user.id)
      .order('generated_at', { ascending: false });

    if (error) {
      logger.error(error, 'Get reports error:');
      return res.status(500).json({ error: 'Failed to get reports' });
    }

    res.json({
      success: true,
      reports: reports || [],
      count: reports?.length || 0,
    });
  } catch (error) {
    logger.error(error, 'Get reports error:');
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * GET /api/reports/:reportId
 * Get report metadata
 */
router.get('/:reportId', verifySupabaseToken, validateParams(reportIdParams), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { reportId } = req.params;

    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error || !report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check ownership (unless admin)
    if (report.user_id !== req.user.id && !isAdmin(req)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    logger.error(error, 'Get report error:');
    res.status(500).json({ error: 'Failed to get report' });
  }
});

/**
 * GET /api/reports/:reportId/download
 * Get signed download URL for report PDF
 */
router.get('/:reportId/download', verifySupabaseToken, validateParams(reportIdParams), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { reportId } = req.params;

    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error || !report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check ownership (unless admin or assigned teacher)
    if (report.user_id !== req.user.id && !isAdmin(req)) {
      // Check if teacher is assigned to this student
      if (req.user.role === 'teacher') {
        const { data: student } = await supabaseAdmin
          .from('profiles')
          .select('assigned_teacher_id')
          .eq('id', report.user_id)
          .single();

        if (student?.assigned_teacher_id !== req.user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const downloadUrl = await getSignedUrl(report.pdf_url);
    if (!downloadUrl) {
      return res.status(500).json({ error: 'Failed to generate download URL' });
    }

    res.json({
      success: true,
      downloadUrl,
      expiresIn: 3600, // 1 hour
    });
  } catch (error) {
    logger.error(error, 'Download report error:');
    res.status(500).json({ error: 'Failed to get download URL' });
  }
});

/**
 * DELETE /api/reports/:reportId
 * Delete report (admin only)
 */
router.delete(
  '/:reportId',
  verifySupabaseToken,
  requireRole(['admin']),
  validateParams(reportIdParams),
  async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;

      const { data: report, error: fetchError } = await supabaseAdmin
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (fetchError || !report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Delete from storage
      await deletePDF(report.pdf_url);

      // Delete from database
      const { error: deleteError } = await supabaseAdmin
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (deleteError) {
        logger.error(deleteError, 'Delete report error:');
        return res.status(500).json({ error: 'Failed to delete report' });
      }

      res.json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error) {
      logger.error(error, 'Delete report error:');
      res.status(500).json({ error: 'Failed to delete report' });
    }
  }
);

export default router;
