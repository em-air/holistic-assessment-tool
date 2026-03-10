import logger from '../lib/logger.js';
import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import type { GradeLevel } from '../types/database.js';
import { isAdmin, isTeacher } from './auth.js';

/**
 * Parse grade string to number for comparison
 * "Grade 3" -> 3
 */
export const parseGradeNumber = (grade: GradeLevel | string | null): number => {
  if (!grade) return 0;
  const match = grade.match(/Grade (\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
};

/**
 * Check if a user can access a specific grade level quiz
 */
export const canAccessGrade = (
  userGrade: GradeLevel | null,
  allowedGrades: GradeLevel[],
  userRole: string
): boolean => {
  // Admin and teacher can access all grades
  if (userRole === 'admin' || userRole === 'teacher') {
    return true;
  }

  // Student must have their grade in allowed grades
  if (!userGrade) {
    return false;
  }

  return allowedGrades.includes(userGrade);
};

/**
 * Middleware to check if user can access a specific quiz by grade
 */
export const requireGradeAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Admin and teacher bypass grade restrictions
    if (isAdmin(req) || isTeacher(req)) {
      return next();
    }

    const quizId = req.params.quizId;
    if (!quizId) {
      return res.status(400).json({ error: 'Quiz ID required' });
    }

    // Fetch quiz metadata to check allowed grades
    const { data: quizMeta, error } = await supabaseAdmin
      .from('quiz_metadata')
      .select('allowed_grades, is_active')
      .eq('quiz_id', quizId)
      .single();

    if (error || !quizMeta) {
      // If quiz metadata doesn't exist, allow access (backward compatibility)
      logger.warn(`Quiz metadata not found for: ${quizId}`);
      return next();
    }

    if (!quizMeta.is_active) {
      return res.status(403).json({ error: 'This quiz is currently disabled' });
    }

    const hasAccess = canAccessGrade(
      req.user.grade,
      quizMeta.allowed_grades as GradeLevel[],
      req.user.role
    );

    if (!hasAccess) {
      return res.status(403).json({
        error: 'You do not have access to this quiz',
        message: `This quiz is for ${quizMeta.allowed_grades.join(', ')}`,
        userGrade: req.user.grade,
      });
    }

    next();
  } catch (error) {
    logger.error(error, 'Grade access check error:');
    res.status(500).json({ error: 'Failed to check quiz access' });
  }
};

/**
 * Get all quizzes filtered by user's grade
 */
export const getGradeFilteredQuizzes = async (
  userGrade: GradeLevel | null,
  userRole: string
) => {
  const { data: quizzes, error } = await supabaseAdmin
    .from('quiz_metadata')
    .select('*')
    .eq('is_active', true);

  if (error) {
    throw error;
  }

  // Admin and teacher see all quizzes
  if (userRole === 'admin' || userRole === 'teacher') {
    return quizzes;
  }

  // Filter quizzes for student by their grade
  if (!userGrade) {
    return [];
  }

  return quizzes?.filter(quiz => 
    (quiz.allowed_grades as GradeLevel[]).includes(userGrade)
  ) || [];
};
