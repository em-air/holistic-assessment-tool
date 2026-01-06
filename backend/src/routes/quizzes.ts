import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { 
  verifySupabaseToken, 
  requireGradeAccess, 
  getGradeFilteredQuizzes,
  isAdmin,
  isTeacher 
} from '../middleware/index.js';
import type { GradeLevel } from '../types/database.js';

const router = Router();

/**
 * GET /api/quizzes
 * List all quizzes user can access (filtered by grade for students)
 */
router.get('/', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const quizzes = await getGradeFilteredQuizzes(
      req.user.grade,
      req.user.role
    );

    // Group by category and subcategory
    const grouped = quizzes.reduce((acc, quiz) => {
      const key = quiz.category;
      if (!acc[key]) {
        acc[key] = {
          category: quiz.category,
          subcategories: {},
        };
      }
      
      if (!acc[key].subcategories[quiz.subcategory]) {
        acc[key].subcategories[quiz.subcategory] = [];
      }
      
      acc[key].subcategories[quiz.subcategory].push({
        quiz_id: quiz.quiz_id,
        quiz_name: quiz.quiz_name,
        allowed_grades: quiz.allowed_grades,
        is_active: quiz.is_active,
      });
      
      return acc;
    }, {} as Record<string, any>);

    res.json({
      success: true,
      quizzes,
      grouped,
      userGrade: req.user.grade,
      totalQuizzes: quizzes.length,
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
});

/**
 * GET /api/quizzes/:quizId
 * Get specific quiz metadata (with grade check)
 */
router.get(
  '/:quizId',
  verifySupabaseToken,
  requireGradeAccess,
  async (req: Request, res: Response) => {
    try {
      const { quizId } = req.params;

      const { data: quiz, error } = await supabaseAdmin
        .from('quiz_metadata')
        .select('*')
        .eq('quiz_id', quizId)
        .single();

      if (error || !quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      res.json({
        success: true,
        quiz,
      });
    } catch (error) {
      console.error('Get quiz error:', error);
      res.status(500).json({ error: 'Failed to get quiz' });
    }
  }
);

/**
 * GET /api/quizzes/:quizId/access
 * Check if user can access quiz (returns boolean)
 */
router.get(
  '/:quizId/access',
  verifySupabaseToken,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { quizId } = req.params;

      // Admin and teacher have access to all
      if (isAdmin(req) || isTeacher(req)) {
        return res.json({
          success: true,
          hasAccess: true,
          reason: 'Admin/Teacher access',
        });
      }

      const { data: quiz, error } = await supabaseAdmin
        .from('quiz_metadata')
        .select('allowed_grades, is_active')
        .eq('quiz_id', quizId)
        .single();

      if (error || !quiz) {
        // Quiz not in metadata - allow access (backward compatibility)
        return res.json({
          success: true,
          hasAccess: true,
          reason: 'Quiz metadata not found - allowing access',
        });
      }

      if (!quiz.is_active) {
        return res.json({
          success: true,
          hasAccess: false,
          reason: 'Quiz is disabled',
        });
      }

      const hasAccess = req.user.grade 
        ? (quiz.allowed_grades as GradeLevel[]).includes(req.user.grade)
        : false;

      res.json({
        success: true,
        hasAccess,
        userGrade: req.user.grade,
        allowedGrades: quiz.allowed_grades,
        reason: hasAccess ? 'Grade match' : 'Grade not in allowed list',
      });
    } catch (error) {
      console.error('Check quiz access error:', error);
      res.status(500).json({ error: 'Failed to check access' });
    }
  }
);

export default router;
