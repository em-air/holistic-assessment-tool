import logger from '../lib/logger.js';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { verifySupabaseToken, getGradeFilteredQuizzes } from '../middleware/index.js';
import type { AssessmentCategory, CategoryProgress } from '../types/database.js';

const router = Router();

/**
 * GET /api/progress
 * Get overall progress (mind, oral, academic percentages)
 */
router.get('/', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get all available quizzes for this user
    const availableQuizzes = await getGradeFilteredQuizzes(
      req.user.grade,
      req.user.role
    );

    // Get all completed quiz results
    const { data: results, error } = await supabaseAdmin
      .from('quiz_results')
      .select('quiz_id, category, percentage')
      .eq('user_id', req.user.id);

    if (error) {
      logger.error(error, 'Get progress error:');
      return res.status(500).json({ error: 'Failed to get progress' });
    }

    const completedQuizIds = new Set(results?.map(r => r.quiz_id) || []);

    // Calculate progress per category
    const categories: AssessmentCategory[] = ['mind', 'oral', 'academic'];
    const progress: Record<string, { completed: number; total: number; percentage: number; averageScore: number }> = {};

    for (const category of categories) {
      const categoryQuizzes = availableQuizzes.filter(q => q.category === category);
      const categoryResults = results?.filter(r => r.category === category) || [];
      const completed = categoryResults.length;
      const total = categoryQuizzes.length;
      const averageScore = categoryResults.length > 0
        ? Math.round(categoryResults.reduce((sum, r) => sum + r.percentage, 0) / categoryResults.length)
        : 0;

      progress[category] = {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        averageScore,
      };
    }

    // Overall progress
    const totalCompleted = results?.length || 0;
    const totalQuizzes = availableQuizzes.length;
    const overallPercentage = totalQuizzes > 0 
      ? Math.round((totalCompleted / totalQuizzes) * 100) 
      : 0;
    const overallAverageScore = results?.length 
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : 0;

    res.json({
      success: true,
      progress,
      overall: {
        completed: totalCompleted,
        total: totalQuizzes,
        percentage: overallPercentage,
        averageScore: overallAverageScore,
      },
      userGrade: req.user.grade,
    });
  } catch (error) {
    logger.error(error, 'Get progress error:');
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

/**
 * GET /api/progress/detailed
 * Get category-by-category breakdown with subcategories
 */
router.get('/detailed', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get all available quizzes for this user
    const availableQuizzes = await getGradeFilteredQuizzes(
      req.user.grade,
      req.user.role
    );

    // Get all completed quiz results with full data
    const { data: results, error } = await supabaseAdmin
      .from('quiz_results')
      .select('*')
      .eq('user_id', req.user.id)
      .order('completed_at', { ascending: false });

    if (error) {
      logger.error(error, 'Get detailed progress error:');
      return res.status(500).json({ error: 'Failed to get progress' });
    }

    const resultMap = new Map(results?.map(r => [r.quiz_id, r]) || []);

    // Build detailed breakdown
    const categories: AssessmentCategory[] = ['mind', 'oral', 'academic'];
    const detailed: Record<string, any> = {};

    for (const category of categories) {
      const categoryQuizzes = availableQuizzes.filter(q => q.category === category);
      const subcategories: Record<string, {
        name: string;
        quizzes: Array<{ quiz_id: string; quiz_name: string; completed: boolean; score: number | null; completedAt: string | null }>;
        completed: number;
        total: number;
        averageScore: number;
        percentage?: number;
      }> = {};

      for (const quiz of categoryQuizzes) {
        if (!subcategories[quiz.subcategory]) {
          subcategories[quiz.subcategory] = {
            name: quiz.subcategory,
            quizzes: [],
            completed: 0,
            total: 0,
            averageScore: 0,
          };
        }

        const result = resultMap.get(quiz.quiz_id);
        subcategories[quiz.subcategory].quizzes.push({
          quiz_id: quiz.quiz_id,
          quiz_name: quiz.quiz_name,
          completed: !!result,
          score: result?.percentage || null,
          completedAt: result?.completed_at || null,
        });

        subcategories[quiz.subcategory].total++;
        if (result) {
          subcategories[quiz.subcategory].completed++;
        }
      }

      // Calculate average scores for subcategories
      for (const subcat of Object.values(subcategories)) {
        const completedQuizzes = subcat.quizzes.filter(q => q.completed);
        subcat.averageScore = completedQuizzes.length > 0
          ? Math.round(completedQuizzes.reduce((sum, q) => sum + (q.score ?? 0), 0) / completedQuizzes.length)
          : 0;
        subcat.percentage = subcat.total > 0
          ? Math.round((subcat.completed / subcat.total) * 100)
          : 0;
      }

      const categoryCompleted = Object.values(subcategories).reduce((sum, s) => sum + s.completed, 0);
      const categoryTotal = Object.values(subcategories).reduce((sum, s) => sum + s.total, 0);

      detailed[category] = {
        subcategories,
        completed: categoryCompleted,
        total: categoryTotal,
        percentage: categoryTotal > 0 ? Math.round((categoryCompleted / categoryTotal) * 100) : 0,
      };
    }

    res.json({
      success: true,
      detailed,
      userGrade: req.user.grade,
    });
  } catch (error) {
    logger.error(error, 'Get detailed progress error:');
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

/**
 * POST /api/progress/sessions
 * Start a new assessment session
 */
router.post('/sessions', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const sessionTypeSchema = z.object({
      session_type: z.enum(['mind', 'oral', 'academic', 'full']),
    });

    const validation = sessionTypeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid session type',
        details: validation.error.errors,
      });
    }

    const { data: session, error } = await supabaseAdmin
      .from('assessment_sessions')
      .insert({
        user_id: req.user.id,
        session_type: validation.data.session_type,
      })
      .select()
      .single();

    if (error) {
      logger.error(error, 'Create session error:');
      return res.status(500).json({ error: 'Failed to create session' });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    logger.error(error, 'Create session error:');
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * GET /api/progress/sessions/active
 * Get active session if exists
 */
router.get('/sessions/active', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: session, error } = await supabaseAdmin
      .from('assessment_sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error(error, 'Get active session error:');
      return res.status(500).json({ error: 'Failed to get session' });
    }

    res.json({
      success: true,
      session: session || null,
      hasActiveSession: !!session,
    });
  } catch (error) {
    logger.error(error, 'Get active session error:');
    res.status(500).json({ error: 'Failed to get session' });
  }
});

/**
 * PUT /api/progress/sessions/:sessionId
 * Update session progress
 */
router.put('/sessions/:sessionId', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { sessionId } = req.params;

    const updateSchema = z.object({
      overall_progress: z.number().int().min(0).max(100).optional(),
      status: z.enum(['in_progress', 'completed', 'abandoned']).optional(),
    });

    const validation = updateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const updates: any = { ...validation.data };
    if (updates.status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data: session, error } = await supabaseAdmin
      .from('assessment_sessions')
      .update(updates)
      .eq('id', sessionId)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      logger.error(error, 'Update session error:');
      return res.status(500).json({ error: 'Failed to update session' });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    logger.error(error, 'Update session error:');
    res.status(500).json({ error: 'Failed to update session' });
  }
});

export default router;
