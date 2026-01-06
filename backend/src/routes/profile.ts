import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { verifySupabaseToken, requireRole, isAdmin } from '../middleware/index.js';
import type { ProfileUpdate, GradeLevel } from '../types/database.js';

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  student_name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(5).max(18).optional(),
  grade: z.enum([
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
    'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'
  ] as const).optional(),
  parent_email: z.string().email().optional(),
});

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
      success: true,
      profile: req.user.profile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * PUT /api/profile
 * Update current user's profile
 */
router.put('/', verifySupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const validationResult = updateProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const updates: ProfileUpdate = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    } as ProfileUpdate;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/profile/:userId
 * Get any user's profile (admin/teacher only)
 */
router.get(
  '/:userId',
  verifySupabaseToken,
  requireRole(['admin', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      // Teachers can only view their assigned students
      if (req.user?.role === 'teacher') {
        const { data: student, error: checkError } = await supabaseAdmin
          .from('profiles')
          .select('assigned_teacher_id')
          .eq('id', userId)
          .single();

        if (checkError || student?.assigned_teacher_id !== req.user.id) {
          return res.status(403).json({ 
            error: 'You can only view your assigned students' 
          });
        }
      }

      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json({
        success: true,
        profile,
      });
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }
);

export default router;
