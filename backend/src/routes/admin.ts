import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { verifySupabaseToken, requireRole } from '../middleware/index.js';
import type { UserRole, QuizMetadataInsert, GradeLevel } from '../types/database.js';

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
      console.error('Get users error:', error);
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
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

/**
 * GET /api/admin/users/:userId/results
 * Get any user's quiz results
 */
router.get('/users/:userId/results', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const category = req.query.category as string | undefined;

    let query = supabaseAdmin
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (category && ['mind', 'oral', 'academic'].includes(category)) {
      query = query.eq('category', category);
    }

    const { data: results, error } = await query;

    if (error) {
      console.error('Get user results error:', error);
      return res.status(500).json({ error: 'Failed to get results' });
    }

    res.json({
      success: true,
      results: results || [],
      count: results?.length || 0,
    });
  } catch (error) {
    console.error('Get user results error:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

/**
 * GET /api/admin/users/:userId/reports
 * Get any user's reports
 */
router.get('/users/:userId/reports', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Get user reports error:', error);
      return res.status(500).json({ error: 'Failed to get reports' });
    }

    res.json({
      success: true,
      reports: reports || [],
      count: reports?.length || 0,
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * PUT /api/admin/users/:userId/role
 * Change user role
 */
router.put('/users/:userId/role', async (req: Request, res: Response) => {
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
      console.error('Update role error:', error);
      return res.status(500).json({ error: 'Failed to update role' });
    }

    res.json({
      success: true,
      profile,
      message: `Role updated to ${validation.data.role}`,
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

/**
 * GET /api/admin/analytics
 * Get aggregate statistics
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    // Get user counts by role
    const { data: userStats, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('role');

    if (userError) throw userError;

    const roleCounts = {
      student: 0,
      teacher: 0,
      admin: 0,
      total: userStats?.length || 0,
    };

    userStats?.forEach(u => {
      if (u.role in roleCounts) {
        roleCounts[u.role as keyof typeof roleCounts]++;
      }
    });

    // Get quiz completion stats
    const { data: quizStats, error: quizError } = await supabaseAdmin
      .from('quiz_results')
      .select('category, percentage');

    if (quizError) throw quizError;

    const categoryStats: Record<string, { count: number; avgScore: number }> = {
      mind: { count: 0, avgScore: 0 },
      oral: { count: 0, avgScore: 0 },
      academic: { count: 0, avgScore: 0 },
    };

    quizStats?.forEach(q => {
      if (q.category in categoryStats) {
        categoryStats[q.category].count++;
        categoryStats[q.category].avgScore += q.percentage;
      }
    });

    // Calculate averages
    Object.keys(categoryStats).forEach(cat => {
      const stats = categoryStats[cat];
      if (stats.count > 0) {
        stats.avgScore = Math.round(stats.avgScore / stats.count);
      }
    });

    // Get report counts
    const { count: reportCount } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      analytics: {
        users: roleCounts,
        quizzes: {
          total: quizStats?.length || 0,
          byCategory: categoryStats,
        },
        reports: {
          total: reportCount || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
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
      console.error('Create quiz error:', error);
      return res.status(500).json({ error: 'Failed to create quiz metadata' });
    }

    res.json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to create quiz metadata' });
  }
});

/**
 * DELETE /api/admin/quizzes/:quizId
 * Disable a quiz (soft delete)
 */
router.delete('/quizzes/:quizId', async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    const { data: quiz, error } = await supabaseAdmin
      .from('quiz_metadata')
      .update({ is_active: false })
      .eq('quiz_id', quizId)
      .select()
      .single();

    if (error) {
      console.error('Disable quiz error:', error);
      return res.status(500).json({ error: 'Failed to disable quiz' });
    }

    res.json({
      success: true,
      quiz,
      message: 'Quiz disabled successfully',
    });
  } catch (error) {
    console.error('Disable quiz error:', error);
    res.status(500).json({ error: 'Failed to disable quiz' });
  }
});

/**
 * POST /api/admin/users/:userId/assign-teacher
 * Assign a teacher to a student
 */
router.post('/users/:userId/assign-teacher', async (req: Request, res: Response) => {
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
      console.error('Assign teacher error:', error);
      return res.status(500).json({ error: 'Failed to assign teacher' });
    }

    res.json({
      success: true,
      profile,
      message: validation.data.teacher_id 
        ? 'Teacher assigned successfully' 
        : 'Teacher assignment removed',
    });
  } catch (error) {
    console.error('Assign teacher error:', error);
    res.status(500).json({ error: 'Failed to assign teacher' });
  }
});

/**
 * GET /api/admin/reports
 * Get ALL reports with student info (for admin dashboard)
 */
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
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

    // Apply filters
    if (reportType && ['mind', 'oral', 'academic', 'full'].includes(reportType)) {
      query = query.eq('report_type', reportType);
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
      console.error('Get all reports error:', error);
      return res.status(500).json({ error: 'Failed to get reports' });
    }

    // If search is provided, filter by student name (post-fetch filtering)
    let filteredReports = reports || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredReports = filteredReports.filter((r: any) => 
        r.profiles?.student_name?.toLowerCase().includes(searchLower) ||
        r.profiles?.parent_email?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      reports: filteredReports,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * GET /api/admin/reports/:reportId/download
 * Generate and download PDF for a report
 */
router.get('/reports/:reportId/download', async (req: Request, res: Response) => {
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
      console.error('Fetch quiz results error:', resultsError);
    }

    // Generate PDF with the data
    const { generateReportPDF } = await import('../services/pdfGenerator.js');
    
    const reportData = {
      profile: report.profiles || { student_name: 'Student' },
      mindResults: (quizResults || []).filter((r: any) => r.category === 'mind'),
      oralResults: (quizResults || []).filter((r: any) => r.category === 'oral'),
      academicResults: (quizResults || []).filter((r: any) => r.category === 'academic'),
      generatedAt: new Date(report.generated_at),
    };

    const pdfBuffer = await generateReportPDF(reportData);

    // Set headers for PDF download
    const studentName = report.profiles?.student_name || 'Student';
    const dateStr = new Date(report.generated_at).toISOString().split('T')[0];
    const filename = `${studentName.replace(/\s+/g, '_')}_Report_${dateStr}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;
