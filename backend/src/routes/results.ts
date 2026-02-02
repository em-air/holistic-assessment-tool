import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { verifySupabaseToken, requireGradeAccess } from '../middleware/index.js';
import type { QuizResultInsert, AssessmentCategory } from '../types/database.js';

const router = Router();

// Validation schema for quiz results
const saveResultSchema = z.object({
  quiz_id: z.string().min(1),
  quiz_name: z.string().min(1),
  category: z.enum(['mind', 'oral', 'academic']),
  subcategory: z.string().min(1),
  score: z.number().int().min(0),
  total_questions: z.number().int().min(1),
  time_spent: z.number().int().min(0).optional(),
  grade_level: z.string().optional().nullable(),
  additional_data: z.record(z.any()).optional(),
});

/**
 * POST /api/results
 * Save a quiz result
 */
router.post('/', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const validationResult = saveResultSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const data = validationResult.data;
    const percentage = Math.round((data.score / data.total_questions) * 100);

    const resultInsert: QuizResultInsert = {
      user_id: req.user.id,
      quiz_id: data.quiz_id,
      quiz_name: data.quiz_name,
      category: data.category,
      subcategory: data.subcategory,
      score: data.score,
      total_questions: data.total_questions,
      percentage,
      time_spent: data.time_spent || 0,
      grade_level: data.grade_level || req.user.grade,
      additional_data: data.additional_data || {},
    };

    // Upsert - update if quiz already taken, insert if new
    const { data: result, error } = await supabaseAdmin
      .from('quiz_results')
      .upsert(resultInsert, {
        onConflict: 'user_id,quiz_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Save result error:', error);
      return res.status(500).json({ error: 'Failed to save result' });
    }

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Save result error:', error);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

/**
 * GET /api/results
 * Get all results for current user
 */
router.get('/', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: results, error } = await supabaseAdmin
      .from('quiz_results')
      .select('*')
      .eq('user_id', req.user.id)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Get results error:', error);
      return res.status(500).json({ error: 'Failed to get results' });
    }

    res.json({
      success: true,
      results: results || [],
      count: results?.length || 0,
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

/**
 * GET /api/results/category/:category
 * Get results by category
 */
router.get('/category/:category', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { category } = req.params;
    
    if (!['mind', 'oral', 'academic'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const { data: results, error } = await supabaseAdmin
      .from('quiz_results')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('category', category as AssessmentCategory)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Get category results error:', error);
      return res.status(500).json({ error: 'Failed to get results' });
    }

    res.json({
      success: true,
      category,
      results: results || [],
      count: results?.length || 0,
    });
  } catch (error) {
    console.error('Get category results error:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

/**
 * GET /api/results/:quizId
 * Get specific quiz result
 */
router.get('/:quizId', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { quizId } = req.params;

    const { data: result, error } = await supabaseAdmin
      .from('quiz_results')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('quiz_id', quizId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Get result error:', error);
      return res.status(500).json({ error: 'Failed to get result' });
    }

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ error: 'Failed to get result' });
  }
});

/**
 * DELETE /api/results/:quizId
 * Delete/reset a quiz result (for retakes)
 */
router.delete('/:quizId', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { quizId } = req.params;

    const { error } = await supabaseAdmin
      .from('quiz_results')
      .delete()
      .eq('user_id', req.user.id)
      .eq('quiz_id', quizId);

    if (error) {
      console.error('Delete result error:', error);
      return res.status(500).json({ error: 'Failed to delete result' });
    }

    res.json({
      success: true,
      message: 'Result deleted successfully',
    });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({ error: 'Failed to delete result' });
  }
});

/**
 * DELETE /api/results/category/:category
 * Delete all quiz results for a category
 */
router.delete('/category/:category', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { category } = req.params;
    
    if (!['mind', 'oral', 'academic'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const { error } = await supabaseAdmin
      .from('quiz_results')
      .delete()
      .eq('user_id', req.user.id)
      .eq('category', category as AssessmentCategory);

    if (error) {
      console.error('Delete category results error:', error);
      return res.status(500).json({ error: 'Failed to delete results' });
    }

    res.json({
      success: true,
      message: `All ${category} results deleted successfully`,
    });
  } catch (error) {
    console.error('Delete category results error:', error);
    res.status(500).json({ error: 'Failed to delete results' });
  }
});

export default router;
