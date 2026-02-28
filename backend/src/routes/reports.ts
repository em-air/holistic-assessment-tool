import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { verifySupabaseToken, requireRole, isAdmin } from '../middleware/index.js';
import { 
  generateEnglishPDF,
  generateArabicPDF,
  generateReportPDF, 
  sendReportEmail, 
  uploadPDF, 
  getSignedUrl, 
  deletePDF 
} from '../services/index.js';
import type { ReportInsert, ReportType } from '../types/database.js';

const router = Router();

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
      send_email: z.boolean().optional().default(false),
      email_recipients: z.array(z.string().email()).optional(),
    });

    const validation = generateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { report_type, send_email, email_recipients } = validation.data;

    // Fetch all quiz results
    const [mindResults, oralResults, academicResults] = await Promise.all([
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
    ]);

    // Filter by report type
    const reportData = {
      profile: req.user.profile,
      mindResults: report_type === 'full' || report_type === 'mind' ? mindResults : [],
      oralResults: report_type === 'full' || report_type === 'oral' ? oralResults : [],
      academicResults: report_type === 'full' || report_type === 'academic' ? academicResults : [],
      generatedAt: new Date(),
    };

    // Generate English PDF
    const pdfBuffer = await generateEnglishPDF(reportData);

    // Generate Arabic PDF
    let pdfBufferAr: Buffer | null = null;
    try {
      pdfBufferAr = await generateArabicPDF(reportData);
    } catch (err) {
      console.warn('Arabic PDF generation failed (font may be unavailable):', err);
    }

    // Upload English PDF to storage
    const storageResult = await uploadPDF(req.user.id, pdfBuffer, `en_${report_type}`);
    if (!storageResult) {
      return res.status(500).json({ error: 'Failed to upload report' });
    }

    // Upload Arabic PDF to storage
    let storageResultAr: { path: string } | null = null;
    if (pdfBufferAr) {
      storageResultAr = await uploadPDF(req.user.id, pdfBufferAr, `ar_${report_type}`);
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
      console.error('Save report error:', insertError);
      return res.status(500).json({ error: 'Failed to save report record' });
    }

    // Send email if requested
    let emailResult = null;
    if (send_email) {
      const recipients = email_recipients?.length 
        ? email_recipients 
        : req.user.profile.parent_email 
          ? [req.user.profile.parent_email]
          : [];

      if (recipients.length > 0) {
        emailResult = await sendReportEmail({
          to: recipients,
          studentName: req.user.profile.student_name || 'Student',
          pdfBuffer,
          reportDate: new Date().toLocaleDateString(),
        });

        // Update emailed_to
        if (emailResult.success) {
          await supabaseAdmin
            .from('reports')
            .update({ emailed_to: recipients })
            .eq('id', report.id);
        }
      }
    }

    // Get download URLs
    const downloadUrl = await getSignedUrl(storageResult.path);
    const downloadUrlAr = storageResultAr ? await getSignedUrl(storageResultAr.path) : undefined;

    res.json({
      success: true,
      report,
      downloadUrl,
      downloadUrlAr,
      emailSent: emailResult?.success || false,
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

/**
 * POST /api/reports/send-email
 * Send a text-only email report (no PDF attachment)
 */
router.post('/send-email', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const emailSchema = z.object({
      student_name: z.string().min(1),
      recipient_email: z.string().email(),
      report_summary: z.object({
        mindScore: z.number().optional(),
        oralScore: z.number().optional(),
        academicScore: z.number().optional(),
        totalQuizzes: z.number().optional(),
      }).optional(),
    });

    const validation = emailSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { student_name, recipient_email, report_summary } = validation.data;

    // Fetch quiz results for summary if not provided
    let summary = report_summary;
    if (!summary) {
      const [mindResults, oralResults, academicResults] = await Promise.all([
        supabaseAdmin
          .from('quiz_results')
          .select('percentage')
          .eq('user_id', req.user.id)
          .eq('category', 'mind')
          .then(r => r.data || []),
        supabaseAdmin
          .from('quiz_results')
          .select('percentage')
          .eq('user_id', req.user.id)
          .eq('category', 'oral')
          .then(r => r.data || []),
        supabaseAdmin
          .from('quiz_results')
          .select('percentage')
          .eq('user_id', req.user.id)
          .eq('category', 'academic')
          .then(r => r.data || []),
      ]);

      const calcAvg = (results: { percentage: number }[]) => 
        results.length > 0 
          ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) 
          : 0;

      summary = {
        mindScore: calcAvg(mindResults),
        oralScore: calcAvg(oralResults),
        academicScore: calcAvg(academicResults),
        totalQuizzes: mindResults.length + oralResults.length + academicResults.length,
      };
    }

    // Send text-only email using Resend
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'Assessment Tool <onboarding@resend.dev>',
      to: [recipient_email],
      subject: `Holistic Assessment Report for ${student_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .score-box { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #6366f1; }
            .score-title { font-weight: bold; color: #374151; }
            .score-value { font-size: 24px; color: #6366f1; font-weight: bold; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding: 20px; }
            .cta { background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Assessment Report</h1>
            <p>Holistic Assessment Tool - Bloom Tutoring</p>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Here is the assessment summary for <strong>${student_name}</strong>, generated on ${new Date().toLocaleDateString()}.</p>
            
            <h3>📈 Score Summary</h3>
            
            <div class="score-box">
              <div class="score-title">🧠 Mind Skills</div>
              <div class="score-value">${summary.mindScore || 0}%</div>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Attention, Memory, Critical Thinking, Perception</p>
            </div>
            
            <div class="score-box">
              <div class="score-title">🗣️ Oral Skills</div>
              <div class="score-value">${summary.oralScore || 0}%</div>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Language, Reading, Phonics, Blending</p>
            </div>
            
            <div class="score-box">
              <div class="score-title">📚 Academic Skills</div>
              <div class="score-value">${summary.academicScore || 0}%</div>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Writing, Vocabulary, Spelling</p>
            </div>
            
            <p style="margin-top: 20px;"><strong>Total Quizzes Completed:</strong> ${summary.totalQuizzes || 0}</p>
            
            <p style="margin-top: 20px;">For a detailed PDF report with personalized recommendations, please log in to the assessment portal.</p>
            
            <div class="footer">
              <p>This is an automated email from the Holistic Assessment Tool.</p>
              <p>© ${new Date().getFullYear()} Bloom Tutoring</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      message: 'Email sent successfully',
      emailId: data?.id,
    });
  } catch (error: any) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
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
      console.error('Get reports error:', error);
      return res.status(500).json({ error: 'Failed to get reports' });
    }

    res.json({
      success: true,
      reports: reports || [],
      count: reports?.length || 0,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * GET /api/reports/:reportId
 * Get report metadata
 */
router.get('/:reportId', verifySupabaseToken, async (req: Request, res: Response) => {
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
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to get report' });
  }
});

/**
 * GET /api/reports/:reportId/download
 * Get signed download URL for report PDF
 */
router.get('/:reportId/download', verifySupabaseToken, async (req: Request, res: Response) => {
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
    console.error('Download report error:', error);
    res.status(500).json({ error: 'Failed to get download URL' });
  }
});

/**
 * POST /api/reports/:reportId/email
 * Email report to specified recipients
 */
router.post('/:reportId/email', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { reportId } = req.params;

    const emailSchema = z.object({
      recipients: z.array(z.string().email()).min(1),
    });

    const validation = emailSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error || !report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check ownership
    if (report.user_id !== req.user.id && !isAdmin(req)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Download PDF from storage
    const { data: pdfData, error: downloadError } = await supabaseAdmin.storage
      .from(process.env.REPORTS_BUCKET || 'reports')
      .download(report.pdf_url);

    if (downloadError || !pdfData) {
      return res.status(500).json({ error: 'Failed to retrieve report PDF' });
    }

    const pdfBuffer = Buffer.from(await pdfData.arrayBuffer());

    // Send email
    const emailResult = await sendReportEmail({
      to: validation.data.recipients,
      studentName: req.user.profile.student_name || 'Student',
      pdfBuffer,
      reportDate: new Date(report.generated_at).toLocaleDateString(),
    });

    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send email', details: emailResult.error });
    }

    // Update emailed_to list
    const currentEmails = report.emailed_to || [];
    const newEmails = [...new Set([...currentEmails, ...validation.data.recipients])];

    await supabaseAdmin
      .from('reports')
      .update({ emailed_to: newEmails })
      .eq('id', reportId);

    res.json({
      success: true,
      message: 'Report emailed successfully',
      emailId: emailResult.id,
      recipients: validation.data.recipients,
    });
  } catch (error) {
    console.error('Email report error:', error);
    res.status(500).json({ error: 'Failed to email report' });
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
        console.error('Delete report error:', deleteError);
        return res.status(500).json({ error: 'Failed to delete report' });
      }

      res.json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({ error: 'Failed to delete report' });
    }
  }
);

export default router;
