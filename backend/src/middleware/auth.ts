import logger from '../lib/logger.js';
import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import type { Profile, UserRole, GradeLevel } from '../types/database.js';

/**
 * Middleware to verify Supabase JWT token and attach user to request.
 *
 * Profile creation is intentionally NOT performed here.
 * Profiles must be created at registration time (via the AuthPage sign-up
 * flow or a Supabase `on_auth_user_created` trigger in the database).
 * Creating a profile here would cause a DB write on every request burst
 * for new users and introduce race conditions under concurrent load.
 *
 * If a profile is missing, we return 401 so the client can redirect to
 * the registration/profile-setup flow.
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
      // Profile doesn't exist — this means registration was incomplete.
      // Do NOT create it here; that would cause a write on every request
      // for all new users and introduces concurrency issues.
      // The client should complete the profile-setup / registration flow.
      logger.warn({ userId: user.id }, 'Auth: profile missing — registration incomplete');
      return res.status(401).json({ 
        error: 'User profile not found. Please complete registration.',
        code: 'PROFILE_MISSING',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role as UserRole,
      grade: profile.grade as GradeLevel | null,
      profile: profile as Profile,
    };

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
