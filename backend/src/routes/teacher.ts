import logger from '../lib/logger.js';
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { verifySupabaseToken, requireRole, getGradeFilteredQuizzes } from '../middleware/index.js';
import { getSignedUrl } from '../services/index.js';

const router = Router();

// All teacher routes require authentication and teacher role
router.use(verifySupabaseToken, requireRole(['teacher', 'admin']));

/**
 * GET /api/teacher/students
 * List students assigned to this teacher
 */
router.get('/students', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let query = supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'student');

    // If teacher (not admin), only show assigned students
    if (req.user.role === 'teacher') {
      query = query.eq('assigned_teacher_id', req.user.id);
    }

    const { data: students, error } = await query
      .order('student_name', { ascending: true });

    if (error) {
      logger.error(error, 'Get students error:');
      return res.status(500).json({ error: 'Failed to get students' });
    }

    res.json({
      success: true,
      students: students || [],
      count: students?.length || 0,
    });
  } catch (error) {
    logger.error(error, 'Get students error:');
    res.status(500).json({ error: 'Failed to get students' });
  }
});

/**
 * GET /api/teacher/students/:studentId/progress
 * View student's progress
 */
router.get('/students/:studentId/progress', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { studentId } = req.params;

    // Verify access to this student
    if (req.user.role === 'teacher') {
      const { data: student, error: studentError } = await supabaseAdmin
        .from('profiles')
        .select('assigned_teacher_id, grade')
        .eq('id', studentId)
        .single();

      if (studentError || student?.assigned_teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied to this student' });
      }
    }

    // Get student profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    if (profileError) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get quiz results
    const { data: results, error: resultsError } = await supabaseAdmin
      .from('quiz_results')
      .select('*')
      .eq('user_id', studentId)
      .order('completed_at', { ascending: false });

    if (resultsError) {
      logger.error(resultsError, 'Get student results error:');
      return res.status(500).json({ error: 'Failed to get results' });
    }

    // Get available quizzes for student's grade
    const availableQuizzes = await getGradeFilteredQuizzes(
      profile.grade,
      'student'
    );

    // Calculate progress
    const completedQuizIds = new Set(results?.map(r => r.quiz_id) || []);
    
    const progress = {
      mind: { completed: 0, total: 0, avgScore: 0 },
      oral: { completed: 0, total: 0, avgScore: 0 },
      academic: { completed: 0, total: 0, avgScore: 0 },
    };

    availableQuizzes.forEach(quiz => {
      const cat = quiz.category as keyof typeof progress;
      if (progress[cat]) {
        progress[cat].total++;
        if (completedQuizIds.has(quiz.quiz_id)) {
          progress[cat].completed++;
        }
      }
    });

    // Calculate average scores
    results?.forEach(r => {
      const cat = r.category as keyof typeof progress;
      if (progress[cat]) {
        progress[cat].avgScore += r.percentage;
      }
    });

    Object.keys(progress).forEach(cat => {
      const p = progress[cat as keyof typeof progress];
      if (p.completed > 0) {
        p.avgScore = Math.round(p.avgScore / p.completed);
      }
    });

    // Overall progress
    const totalCompleted = results?.length || 0;
    const totalQuizzes = availableQuizzes.length;
    const overallPercentage = totalQuizzes > 0 
      ? Math.round((totalCompleted / totalQuizzes) * 100) 
      : 0;
    const overallAvgScore = totalCompleted > 0
      ? Math.round(results!.reduce((sum, r) => sum + r.percentage, 0) / totalCompleted)
      : 0;

    res.json({
      success: true,
      student: {
        id: profile.id,
        name: profile.student_name,
        grade: profile.grade,
        age: profile.age,
      },
      progress,
      overall: {
        completed: totalCompleted,
        total: totalQuizzes,
        percentage: overallPercentage,
        avgScore: overallAvgScore,
      },
      recentResults: results?.slice(0, 10) || [],
    });
  } catch (error) {
    logger.error(error, 'Get student progress error:');
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

/**
 * GET /api/teacher/students/:studentId/reports
 * View/download student's reports
 */
router.get('/students/:studentId/reports', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { studentId } = req.params;

    // Verify access to this student
    if (req.user.role === 'teacher') {
      const { data: student, error: studentError } = await supabaseAdmin
        .from('profiles')
        .select('assigned_teacher_id')
        .eq('id', studentId)
        .single();

      if (studentError || student?.assigned_teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied to this student' });
      }
    }

    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('user_id', studentId)
      .order('generated_at', { ascending: false });

    if (error) {
      logger.error(error, 'Get student reports error:');
      return res.status(500).json({ error: 'Failed to get reports' });
    }

    // Add download URLs
    const reportsWithUrls = await Promise.all(
      (reports || []).map(async (report) => {
        const downloadUrl = await getSignedUrl(report.pdf_url);
        return { ...report, downloadUrl };
      })
    );

    res.json({
      success: true,
      reports: reportsWithUrls,
      count: reportsWithUrls.length,
    });
  } catch (error) {
    logger.error(error, 'Get student reports error:');
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * GET /api/teacher/summary
 * Get summary of all assigned students' progress
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get assigned students
    let studentsQuery = supabaseAdmin
      .from('profiles')
      .select('id, student_name, grade')
      .eq('role', 'student');

    if (req.user.role === 'teacher') {
      studentsQuery = studentsQuery.eq('assigned_teacher_id', req.user.id);
    }

    const { data: students, error: studentsError } = await studentsQuery;

    if (studentsError) {
      logger.error(studentsError, 'Get students error:');
      return res.status(500).json({ error: 'Failed to get students' });
    }

    // Get quiz results for all students
    const studentIds = students?.map(s => s.id) || [];
    
    let resultsData: any[] = [];
    if (studentIds.length > 0) {
      const { data: results, error: resultsError } = await supabaseAdmin
        .from('quiz_results')
        .select('user_id, percentage, category')
        .in('user_id', studentIds);

      if (!resultsError) {
        resultsData = results || [];
      }
    }

    // Calculate summary per student
    const studentSummaries = students?.map(student => {
      const studentResults = resultsData.filter(r => r.user_id === student.id);
      const quizzesCompleted = studentResults.length;
      const avgScore = quizzesCompleted > 0
        ? Math.round(studentResults.reduce((sum, r) => sum + r.percentage, 0) / quizzesCompleted)
        : 0;

      return {
        id: student.id,
        name: student.student_name,
        grade: student.grade,
        quizzesCompleted,
        avgScore,
      };
    }) || [];

    // Overall stats
    const totalStudents = students?.length || 0;
    const totalQuizzes = resultsData.length;
    const avgScoreAll = totalQuizzes > 0
      ? Math.round(resultsData.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes)
      : 0;

    res.json({
      success: true,
      summary: {
        totalStudents,
        totalQuizzesCompleted: totalQuizzes,
        averageScore: avgScoreAll,
      },
      students: studentSummaries,
    });
  } catch (error) {
    logger.error(error, 'Get teacher summary error:');
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

export default router;
