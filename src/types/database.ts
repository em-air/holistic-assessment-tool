/**
 * Database types for Supabase
 * 
 * This file contains all shared types for database operations.
 * Keep in sync with backend/src/types/database.ts
 */

// ============================================
// ENUMS & BASIC TYPES
// ============================================

export type GradeLevel = 
  | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4'
  | 'Grade 5' | 'Grade 6' | 'Grade 7' | 'Grade 8';

export type UserRole = 'student' | 'teacher' | 'admin';

export type AssessmentCategory = 'mind' | 'oral' | 'academic';

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export type ReportType = 'mind' | 'oral' | 'academic' | 'full';

// ============================================
// PROFILE
// ============================================

export interface Profile {
  id: string;
  student_name: string | null;
  age: number | null;
  grade: GradeLevel | null;
  parent_email: string | null;
  student_email: string | null;
  role: UserRole;
  assigned_teacher_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  student_name?: string;
  age?: number;
  grade?: GradeLevel;
  parent_email?: string;
  student_email?: string;
  role?: UserRole;
  assigned_teacher_id?: string | null;
}

// ============================================
// QUIZ RESULTS
// ============================================

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  quiz_name: string;
  category: AssessmentCategory;
  subcategory: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent: number;
  grade_level: string | null;
  additional_data: Record<string, any>;
  completed_at: string;
}

export interface QuizResultInsert {
  user_id: string;
  quiz_id: string;
  quiz_name: string;
  category: AssessmentCategory;
  subcategory: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent?: number;
  grade_level?: string | null;
  additional_data?: Record<string, any>;
}

// Frontend-specific helper type for saving quiz results
export interface SaveQuizResultParams {
  quizId: string;
  quizName: string;
  category: AssessmentCategory;
  subcategory: string;
  score: number;
  totalQuestions: number;
  timeSpent?: number;
  gradeLevel?: string;
  additionalData?: Record<string, any>;
}

// ============================================
// ASSESSMENT SESSIONS
// ============================================

export interface AssessmentSession {
  id: string;
  user_id: string;
  session_type: ReportType;
  status: SessionStatus;
  overall_progress: number;
  started_at: string;
  completed_at: string | null;
}

export interface AssessmentSessionInsert {
  user_id: string;
  session_type: ReportType;
}

// ============================================
// REPORTS
// ============================================

export interface Report {
  id: string;
  user_id: string;
  session_id: string | null;
  report_type: ReportType;
  pdf_url: string;
  emailed_to: string[] | null;
  generated_at: string;
}

export interface ReportInsert {
  user_id: string;
  session_id?: string | null;
  report_type: ReportType;
  pdf_url: string;
  emailed_to?: string[];
}

// ============================================
// QUIZ METADATA
// ============================================

export interface QuizMetadata {
  id: string;
  quiz_id: string;
  quiz_name: string;
  category: AssessmentCategory;
  subcategory: string;
  allowed_grades: GradeLevel[];
  is_active: boolean;
  created_at: string;
}

export interface QuizMetadataInsert {
  quiz_id: string;
  quiz_name: string;
  category: AssessmentCategory;
  subcategory: string;
  allowed_grades: GradeLevel[];
  is_active?: boolean;
}

// ============================================
// CATEGORY PROGRESS
// ============================================

export interface CategoryProgress {
  category: AssessmentCategory;
  completed_quizzes: number;
  total_quizzes: number;
  average_score: number;
}

// ============================================
// SUPABASE DATABASE SCHEMA
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: ProfileUpdate;
      };
      quiz_results: {
        Row: QuizResult;
        Insert: QuizResultInsert;
        Update: Partial<QuizResultInsert>;
      };
      assessment_sessions: {
        Row: AssessmentSession;
        Insert: AssessmentSessionInsert;
        Update: Partial<AssessmentSession>;
      };
      reports: {
        Row: Report;
        Insert: ReportInsert;
        Update: Partial<ReportInsert>;
      };
      quiz_metadata: {
        Row: QuizMetadata;
        Insert: QuizMetadataInsert;
        Update: Partial<QuizMetadataInsert>;
      };
    };
  };
}
