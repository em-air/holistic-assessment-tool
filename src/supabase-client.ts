import { createClient } from '@supabase/supabase-js'
import type { 
  Database, 
  Profile, 
  ProfileUpdate,
  QuizResult,
  QuizResultInsert,
  AssessmentSession,
  AssessmentSessionInsert,
  Report,
  ReportInsert,
  QuizMetadata,
  CategoryProgress,
  GradeLevel,
  AssessmentCategory,
  SaveQuizResultParams
} from './types/database'
import { logger } from './utils/logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Supabase Client Configuration
 * 
 * IMPORTANT: Using sessionStorage instead of localStorage for auth storage.
 * This allows multiple users to be logged in on different browser tabs
 * simultaneously without sessions overwriting each other.
 * 
 * Trade-offs:
 * - Each browser tab maintains its own independent session
 * - Closing a tab ends that session (user needs to log in again)
 * - Users can be logged into different accounts in different tabs
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Typed registration data — `role` is intentionally excluded to prevent
 * privilege escalation via user_metadata. Roles are set server-side only.
 */
export interface UserRegistrationData {
  studentName?: string;
  age?: number;
  grade?: string;
  parentEmail?: string;
  studentEmail?: string | null;
}

export const signUp = async (email: string, password: string, userData: UserRegistrationData) => {
  // Destructure to ensure no `role` field leaks into user_metadata
  const { studentName, age, grade, parentEmail, studentEmail } = userData;
  const safeMetadata = { studentName, age, grade, parentEmail, studentEmail };

  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: safeMetadata,
      emailRedirectTo: undefined,
    },
  });

  // If sign-up succeeded and we have a user, create the profile row immediately.
  // The backend auth middleware no longer auto-creates profiles on first request,
  // so the profile must exist before any authenticated API call is made.
  if (!result.error && result.data.user) {
    const userId = result.data.user.id;
    await supabase
      .from('profiles')
      .upsert({
        id: userId,
        student_name: studentName || null,
        age: age || null,
        grade: grade || null,
        parent_email: parentEmail || email,
        student_email: studentEmail || null,
        role: 'student', // always 'student' for self-registration
        assigned_teacher_id: null,
      }, { onConflict: 'id', ignoreDuplicates: true });
    // Note: we ignore profile upsert errors here — the auth succeeded and
    // the backend will surface the PROFILE_MISSING error on the next API call.
  }

  return result;
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

// ============================================
// PROFILE FUNCTIONS
// ============================================
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    logger.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const updateProfile = async (userId: string, updates: ProfileUpdate): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    logger.error('Error updating profile:', error);
    return null;
  }
  return data;
};

// ============================================
// QUIZ RESULTS FUNCTIONS
// ============================================
export const saveQuizResult = async (params: SaveQuizResultParams): Promise<QuizResult | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    logger.error('No authenticated user');
    return null;
  }

  const resultInsert: QuizResultInsert = {
    user_id: user.id,
    quiz_id: params.quizId,
    quiz_name: params.quizName,
    category: params.category,
    subcategory: params.subcategory,
    score: params.score,
    total_questions: params.totalQuestions,
    percentage: Math.round((params.score / params.totalQuestions) * 100),
    time_spent: params.timeSpent || 0,
    grade_level: params.gradeLevel || null,
    additional_data: params.additionalData || {},
  };

  // Upsert to handle retakes (update if exists, insert if new)
  const { data, error } = await supabase
    .from('quiz_results')
    .upsert(resultInsert, { 
      onConflict: 'user_id,quiz_id',
      ignoreDuplicates: false 
    })
    .select()
    .single();

  if (error) {
    logger.error('Error saving quiz result:', error);
    return null;
  }
  
  return data;
};

export const getQuizResults = async (userId: string, category?: AssessmentCategory): Promise<QuizResult[]> => {
  let query = supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error fetching quiz results:', error);
    return [];
  }
  return data || [];
};

export const getQuizResultByQuizId = async (userId: string, quizId: string): Promise<QuizResult | null> => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    logger.error('Error fetching quiz result:', error);
  }
  return data || null;
};

// ============================================
// QUIZ METADATA & ACCESS CONTROL
// ============================================
export const getQuizMetadata = async (): Promise<QuizMetadata[]> => {
  const { data, error } = await supabase
    .from('quiz_metadata')
    .select('*')
    .eq('is_active', true);

  if (error) {
    logger.error('Error fetching quiz metadata:', error);
    return [];
  }
  return data || [];
};

export const getAllowedQuizzes = async (userGrade: GradeLevel): Promise<QuizMetadata[]> => {
  const { data, error } = await supabase
    .from('quiz_metadata')
    .select('*')
    .eq('is_active', true)
    .contains('allowed_grades', [userGrade]);

  if (error) {
    logger.error('Error fetching allowed quizzes:', error);
    return [];
  }
  return data || [];
};

export const canAccessQuiz = async (quizId: string, userGrade: GradeLevel): Promise<boolean> => {
  const { data, error } = await supabase
    .from('quiz_metadata')
    .select('allowed_grades')
    .eq('quiz_id', quizId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    logger.error('Error checking quiz access:', error);
    return false;
  }

  return data.allowed_grades.includes(userGrade);
};

// ============================================
// ASSESSMENT SESSIONS
// ============================================
export const createSession = async (sessionType: 'mind' | 'oral' | 'academic' | 'full'): Promise<AssessmentSession | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const sessionInsert: AssessmentSessionInsert = {
    user_id: user.id,
    session_type: sessionType,
  };

  const { data, error } = await supabase
    .from('assessment_sessions')
    .insert(sessionInsert)
    .select()
    .single();

  if (error) {
    logger.error('Error creating session:', error);
    return null;
  }
  return data;
};

export const updateSession = async (sessionId: string, progress: number, status?: 'in_progress' | 'completed' | 'abandoned'): Promise<AssessmentSession | null> => {
  const updates: any = { overall_progress: progress };
  if (status) {
    updates.status = status;
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('assessment_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    logger.error('Error updating session:', error);
    return null;
  }
  return data;
};

export const getActiveSession = async (userId: string): Promise<AssessmentSession | null> => {
  const { data, error } = await supabase
    .from('assessment_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Error fetching active session:', error);
  }
  return data || null;
};

// ============================================
// PROGRESS FUNCTIONS
// ============================================
export const getUserProgress = async (userId: string): Promise<CategoryProgress[]> => {
  const { data, error } = await supabase
    .rpc('get_user_progress', { target_user_id: userId });

  if (error) {
    logger.error('Error fetching user progress:', error);
    return [];
  }
  return data || [];
};

export const getOverallProgress = async (userId: string): Promise<{
  mindProgress: number;
  oralProgress: number;
  academicProgress: number;
  totalProgress: number;
}> => {
  const progress = await getUserProgress(userId);
  
  const mindCategory = progress.find(p => p.category === 'mind');
  const oralCategory = progress.find(p => p.category === 'oral');
  const academicCategory = progress.find(p => p.category === 'academic');

  const calculatePercentage = (cat: CategoryProgress | undefined) => {
    if (!cat || cat.total_quizzes === 0) return 0;
    return Math.round((cat.completed_quizzes / cat.total_quizzes) * 100);
  };

  const mindProgress = calculatePercentage(mindCategory);
  const oralProgress = calculatePercentage(oralCategory);
  const academicProgress = calculatePercentage(academicCategory);
  
  const totalCompleted = (mindCategory?.completed_quizzes || 0) + 
                         (oralCategory?.completed_quizzes || 0) + 
                         (academicCategory?.completed_quizzes || 0);
  const totalQuizzes = (mindCategory?.total_quizzes || 0) + 
                       (oralCategory?.total_quizzes || 0) + 
                       (academicCategory?.total_quizzes || 0);
  
  const totalProgress = totalQuizzes > 0 ? Math.round((totalCompleted / totalQuizzes) * 100) : 0;

  return { mindProgress, oralProgress, academicProgress, totalProgress };
};

// ============================================
// REPORTS FUNCTIONS
// ============================================
export const saveReport = async (report: ReportInsert): Promise<Report | null> => {
  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
    .single();

  if (error) {
    logger.error('Error saving report:', error);
    return null;
  }
  return data;
};

export const getReports = async (userId: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false });

  if (error) {
    logger.error('Error fetching reports:', error);
    return [];
  }
  return data || [];
};

export const getLatestReport = async (userId: string, reportType?: 'mind' | 'oral' | 'academic' | 'full'): Promise<Report | null> => {
  let query = supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(1);

  if (reportType) {
    query = query.eq('report_type', reportType);
  }

  const { data, error } = await query.single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Error fetching latest report:', error);
  }
  return data || null;
};

// ============================================
// UTILITY: Get complete assessment data for report
// ============================================
export const getReportData = async (userId: string): Promise<{
  profile: Profile | null;
  mindResults: QuizResult[];
  oralResults: QuizResult[];
  academicResults: QuizResult[];
  progress: CategoryProgress[];
}> => {
  const [profile, mindResults, oralResults, academicResults, progress] = await Promise.all([
    getProfile(userId),
    getQuizResults(userId, 'mind'),
    getQuizResults(userId, 'oral'),
    getQuizResults(userId, 'academic'),
    getUserProgress(userId),
  ]);

  return { profile, mindResults, oralResults, academicResults, progress };
};
