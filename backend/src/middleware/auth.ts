import logger from '../lib/logger.js';
import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import type { Profile, UserRole, GradeLevel } from '../types/database.js';

/**
 * Middleware to verify Supabase JWT token and attach user to request
 */
export const verifySupabaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT with Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch user profile to get role and grade
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Profile might not exist yet - create a default one
      const newProfile: Omit<Profile, 'created_at' | 'updated_at'> = {
        id: user.id,
        student_name: user.user_metadata?.studentName || null,
        age: user.user_metadata?.age || null,
        grade: user.user_metadata?.grade || null,
        parent_email: user.user_metadata?.parentEmail || user.email || null,
        student_email: user.user_metadata?.studentEmail || null,
        role: 'student',
        assigned_teacher_id: null,
      };

      const { data: createdProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .upsert(newProfile)
        .select()
        .single();

      if (createError) {
        logger.error(createError, 'Error creating profile:');
        return res.status(500).json({ error: 'Failed to create user profile' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: createdProfile.role as UserRole,
        grade: createdProfile.grade as GradeLevel | null,
        profile: createdProfile as Profile,
      };
    } else {
      req.user = {
        id: user.id,
        email: user.email,
        role: profile.role as UserRole,
        grade: profile.grade as GradeLevel | null,
        profile: profile as Profile,
      };
    }

    next();
  } catch (error) {
    logger.error(error, 'Auth middleware error:');
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to require specific roles
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = (req: Request): boolean => {
  return req.user?.role === 'admin';
};

/**
 * Check if user is teacher
 */
export const isTeacher = (req: Request): boolean => {
  return req.user?.role === 'teacher';
};

/**
 * Check if user is student
 */
export const isStudent = (req: Request): boolean => {
  return req.user?.role === 'student';
};
