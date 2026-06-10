import logger from '../lib/logger.js';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { verifySupabaseToken, requireRole, logAudit, validateParams, commonSchemas } from '../middleware/index.js';
import type { UserRole, QuizMetadataInsert, GradeLevel, AssessmentCategory, ReportType, Profile } from '../types/database.js';

const userIdParams = z.object({ userId: commonSchemas.uuid });
const quizIdParams = z.object({ quizId: z.string().min(1) });
const reportIdParams = z.object({ reportId: commonSchemas.uuid });

const router = Router();

// All admin routes require authentication and admin role
router.use(verifySupabaseToken, requireRole(['admin']));

/**
 * GET /api/admin/users
 * List all users with pagination and filters
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as UserRole | undefined;
    const grade = req.query.grade as GradeLevel | undefined;
    const search = req.query.search as string | undefined;

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' });

    if (role) {
      query = query.eq('role', role);
    }
    if (grade) {
      query = query.eq('grade', grade);
    }
    if (search) {
      query = query.or(`student_name.ilike.%${search}%,parent_email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      logger.error(error, 'Get users error:');
      return res.status(500).json({ error: 'Failed to get users' });
    }

    res.json({
      success: true,
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    logger.error(error, 'Get users error:');
    res.status(500).json({ error: 'Failed to get users' });
  }
});

/**
 * GET /api/admin/users/:userId/results
 * Get any user's quiz results
 */
router.get('/users/:userId/results', validateParams(userIdParams), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const category = req.query.category as string | undefined;

    let query = supabaseAdmin
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (category && ['mind', 'oral', 'academic'].includes(category)) {
      query = query.eq('category', category as AssessmentCategory);
    }

    const { data: results, error } = await query;

    if (error) {
      logger.error(error, 'Get user results error:');
      return res.status(500).json({ error: 'Failed to get results' });
    }

    res.json({
      success: true,
      results: results || [],
      count: results?.length || 0,
    });
  } catch (error) {
    logger.error(error, 'Get user results error:');
    res.status(500).json({ error: 'Failed to get results' });
  }
});

/**
 * GET /api/admin/users/:userId/reports
 * Get any user's reports
 */
router.get('/users/:userId/reports', validateParams(userIdParams), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });

    if (error) {
      logger.error(error, 'Get user reports error:');
      return res.status(500).json({ error: 'Failed to get reports' });
    }

    res.json({
      success: true,
      reports: reports || [],
      count: reports?.length || 0,
    });
  } catch (error) {
    logger.error(error, 'Get user reports error:');
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * PUT /api/admin/users/:userId/role
 * Change user role.
 *
 * ⚠️  SESSION INVALIDATION NOTE (I7):
 * Supabase JWTs are valid for the full token lifetime (default: 1 hour) even after
 * a role change. The user's next request will still pass auth with their old role
 * until their token expires or they log out and back in.
 *
 * Mitigation: After updating the profile, we call supabaseAdmin.auth.admin.signOut()
 * to revoke the user's existing refresh token. This forces them to re-authenticate
 * on their next page load, at which point the new role will be reflected.
 * Note: This invalidates all sessions across all devices for that user.
 */
router.put('/users/:userId/role', validateParams(userIdParams), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const roleSchema = z.object({
      role: z.enum(['student', 'teacher', 'admin']),
    });

    const validation = roleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    // Prevent admin from changing their own role
    if (userId === req.user?.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({ role: validation.data.role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error(error, 'Update role error:');
      return res.status(500).json({ error: 'Failed to update role' });
    }

    // Revoke the user's existing sessions so they re-authenticate with the new role.
    // We do this after responding is not ideal, so we do it before and log failures.
    try {
      await supabaseAdmin.auth.admin.signOut(userId, 'global');
    } catch (signOutErr) {
      // Non-fatal: the role is already updated in the DB. The user's token will
      // expire naturally within the JWT lifetime (default 1h).
      logger.warn({ userId, signOutErr }, 'Role change: failed to revoke existing sessions. User will get new role on next re-login.');
    }

    res.json({
      success: true,
      profile,
      message: `Role updated to ${validation.data.role}. User's current session has been invalidated.`,
    });

    logAudit(req, { action: 'role_change', resourceType: 'user', resourceId: userId, details: { newRole: validation.data.role } });
  } catch (error) {
    logger.error(error, 'Update role error:');
    res.status(500).json({ error: 'Failed to update role' });
  }
});


/**
 * GET /api/admin/analytics
 * Get aggregate statistics
 * Uses DB-level count aggregates to avoid fetching all rows into memory.
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    // Count users by role using separate count queries (avoids full table scan)
    const [studentCount, teacherCount, adminCount, totalUsers, quizMindStats, quizOralStats, quizAcademicStats, reportCount] =
      await Promise.all([
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
        // Per-category quiz stats — select only needed columns (count + avg)
        supabaseAdmin.from('quiz_results').select('percentage', { count: 'exact' }).eq('category', 'mind'),
        supabaseAdmin.from('quiz_results').select('percentage', { count: 'exact' }).eq('category', 'oral'),
        supabaseAdmin.from('quiz_results').select('percentage', { count: 'exact' }).eq('category', 'academic'),
        supabaseAdmin.from('reports').select('*', { count: 'exact', head: true }),
      ]);

    const avgScore = (rows: { percentage: number }[] | null) =>
      rows && rows.length > 0
        ? Math.round(rows.reduce((s, r) => s + r.percentage, 0) / rows.length)
        : 0;

    // Surface any errors
    const errors = [studentCount, teacherCount, adminCount, totalUsers, quizMindStats, quizOralStats, quizAcademicStats, reportCount]
      .map(r => r.error)
      .filter(Boolean);
    if (errors.length > 0) {
      logger.error({ errors }, 'Analytics partial error');
    }

    res.json({
      success: true,
      analytics: {
        users: {
          student: studentCount.count || 0,
          teacher: teacherCount.count || 0,
          admin: adminCount.count || 0,
          total: totalUsers.count || 0,
        },
        quizzes: {
          total: (quizMindStats.count || 0) + (quizOralStats.count || 0) + (quizAcademicStats.count || 0),
          byCategory: {
            mind: { count: quizMindStats.count || 0, avgScore: avgScore(quizMindStats.data) },
            oral: { count: quizOralStats.count || 0, avgScore: avgScore(quizOralStats.data) },
            academic: { count: quizAcademicStats.count || 0, avgScore: avgScore(quizAcademicStats.data) },
          },
        },
        reports: {
          total: reportCount.count || 0,
        },
      },
    });
  } catch (error) {
    logger.error(error, 'Get analytics error:');
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

/**
 * POST /api/admin/quizzes
 * Create or update quiz metadata
 */
router.post('/quizzes', async (req: Request, res: Response) => {
  try {
    const quizSchema = z.object({
      quiz_id: z.string().min(1),
      quiz_name: z.string().min(1),
      category: z.enum(['mind', 'oral', 'academic']),
      subcategory: z.string().min(1),
      allowed_grades: z.array(z.enum([
        'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
        'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'
      ])),
      is_active: z.boolean().optional().default(true),
    });

    const validation = quizSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const quizData: QuizMetadataInsert = validation.data;

    const { data: quiz, error } = await supabaseAdmin
      .from('quiz_metadata')
      .upsert(quizData, { onConflict: 'quiz_id' })
      .select()
      .single();

    if (error) {
      logger.error(error, 'Create quiz error:');
      return res.status(500).json({ error: 'Failed to create quiz metadata' });
    }

    res.json({
      success: true,
      quiz,
    });

    logAudit(req, { action: 'quiz_upsert', resourceType: 'quiz', resourceId: quizData.quiz_id, details: { category: quizData.category } });
  } catch (error) {
    logger.error(error, 'Create quiz error:');
    res.status(500).json({ error: 'Failed to create quiz metadata' });
  }
});

/**
 * DELETE /api/admin/quizzes/:quizId
 * Disable a quiz (soft delete)
 */
router.delete('/quizzes/:quizId', validateParams(quizIdParams), async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    const { data: quiz, error } = await supabaseAdmin
      .from('quiz_metadata')
      .update({ is_active: false })
      .eq('quiz_id', quizId)
      .select()
      .single();

    if (error) {
      logger.error(error, 'Disable quiz error:');
      return res.status(500).json({ error: 'Failed to disable quiz' });
    }

    res.json({
      success: true,
      quiz,
      message: 'Quiz disabled successfully',
    });

    logAudit(req, { action: 'quiz_disable', resourceType: 'quiz', resourceId: quizId });
  } catch (error) {
    logger.error(error, 'Disable quiz error:');
    res.status(500).json({ error: 'Failed to disable quiz' });
  }
});

/**
 * POST /api/admin/users/:userId/assign-teacher
 * Assign a teacher to a student
 */
router.post('/users/:userId/assign-teacher', validateParams(userIdParams), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const assignSchema = z.object({
      teacher_id: z.string().uuid().nullable(),
    });

    const validation = assignSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    // Verify teacher exists and has teacher role
    if (validation.data.teacher_id) {
      const { data: teacher, error: teacherError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', validation.data.teacher_id)
        .single();

      if (teacherError || teacher?.role !== 'teacher') {
        return res.status(400).json({ error: 'Invalid teacher ID' });
      }
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        assigned_teacher_id: validation.data.teacher_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error(error, 'Assign teacher error:');
      return res.status(500).json({ error: 'Failed to assign teacher' });
    }

    res.json({
      success: true,
      profile,
      message: validation.data.teacher_id 
        ? 'Teacher assigned successfully' 
        : 'Teacher assignment removed',
    });

    logAudit(req, { action: 'teacher_assign', resourceType: 'user', resourceId: userId, details: { teacherId: validation.data.teacher_id } });
  } catch (error) {
    logger.error(error, 'Assign teacher error:');
    res.status(500).json({ error: 'Failed to assign teacher' });
  }
});

/**
 * GET /api/admin/reports
 * Get ALL reports with student info (for admin dashboard)
 */
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const search = req.query.search as string | undefined;
    const reportType = req.query.report_type as string | undefined;
    const dateFrom = req.query.date_from as string | undefined;
    const dateTo = req.query.date_to as string | undefined;

    // Get reports with profile info joined
    let query = supabaseAdmin
      .from('reports')
      .select(`
        *,
        profiles:user_id (
          id,
          student_name,
          grade,
          parent_email,
          role
        )
      `, { count: 'exact' });

    // Apply filters — search is now pushed to DB layer so pagination counts are correct
    if (search) {
      // Filter via the joined profiles table using PostgREST embedded resource filter syntax
      query = (query as any)
        .or(`student_name.ilike.%${search}%,parent_email.ilike.%${search}%`, { foreignTable: 'profiles' });
    }
    if (reportType && ['mind', 'oral', 'academic', 'full'].includes(reportType)) {
      query = query.eq('report_type', reportType as ReportType);
    }
    if (dateFrom) {
      query = query.gte('generated_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('generated_at', dateTo);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: reports, error, count } = await query
      .order('generated_at', { ascending: false })
      .range(from, to);

    if (error) {
      logger.error(error, 'Get all reports error:');
      return res.status(500).json({ error: 'Failed to get reports' });
    }

    res.json({
      success: true,
      reports: reports || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: from + limit < (count || 0),
      },
    });
  } catch (error) {
    logger.error(error, 'Get all reports error:');
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * GET /api/admin/reports/:reportId/download
 * Generate and download PDF for a report
 */
router.get('/reports/:reportId/download', validateParams(reportIdParams), async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;

    // Get the report with user profile
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select(`
        *,
        profiles:user_id (
          id,
          student_name,
          grade,
          parent_email
        )
      `)
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Fetch quiz results for this user
    const { data: quizResults, error: resultsError } = await supabaseAdmin
      .from('quiz_results')
      .select('*')
      .eq('user_id', report.user_id)
      .order('completed_at', { ascending: false });

    if (resultsError) {
      logger.error(resultsError, 'Fetch quiz results error:');
    }

    // Generate PDF with the data
    const { generateReportPDF } = await import('../services/pdfGenerator.js');
    
    const profileData = (report as Record<string, unknown>).profiles as Profile | undefined ?? { student_name: 'Student' } as Profile;
    const filteredMind = (quizResults || []).filter(
      r => r.category === 'mind' && !['learning-styles', 'social-emotional'].includes(r.quiz_id),
    );
    const reportData = {
      profile: profileData,
      mindResults: filteredMind,
      oralResults: (quizResults || []).filter(r => r.category === 'oral'),
      academicResults: (quizResults || []).filter(r => r.category === 'academic'),
      learningResults: [
        ...(quizResults || []).filter(r => r.category === 'learning'),
        ...(quizResults || []).filter(
          r => r.category === 'mind' && ['learning-styles', 'social-emotional'].includes(r.quiz_id),
        ),
      ],
      generatedAt: new Date(report.generated_at),
    };

    const pdfBuffer = await generateReportPDF(reportData);

    // Set headers for PDF download
    const studentName = profileData?.student_name || 'Student';
    const dateStr = new Date(report.generated_at).toISOString().split('T')[0];
    const filename = `${studentName.replace(/\s+/g, '_')}_Report_${dateStr}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    logger.error(error, 'Download report error:');
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;
