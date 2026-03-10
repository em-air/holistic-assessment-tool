// Database types for Supabase
export type GradeLevel = 
  | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4'
  | 'Grade 5' | 'Grade 6' | 'Grade 7' | 'Grade 8';

export type UserRole = 'student' | 'teacher' | 'admin';

export type AssessmentCategory = 'mind' | 'oral' | 'academic';

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export type ReportType = 'mind' | 'oral' | 'academic' | 'full';

// Profile table
export type Profile = {
  id: string;
  student_name: string | null;
  age: number | null;
  grade: GradeLevel | null;
  parent_email: string | null;
  role: UserRole;
  assigned_teacher_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = {
  student_name?: string;
  age?: number;
  grade?: GradeLevel;
  parent_email?: string;
  role?: UserRole;
  assigned_teacher_id?: string | null;
};

// Quiz Results table
export type QuizResult = {
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
};

export type QuizResultInsert = {
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
};

// Assessment Sessions table
export type AssessmentSession = {
  id: string;
  user_id: string;
  session_type: ReportType;
  status: SessionStatus;
  overall_progress: number;
  started_at: string;
  completed_at: string | null;
};

export type AssessmentSessionInsert = {
  user_id: string;
  session_type: ReportType;
};

// Reports table
export type Report = {
  id: string;
  user_id: string;
  session_id: string | null;
  report_type: ReportType;
  pdf_url: string;
  emailed_to: string[] | null;
  generated_at: string;
};

export type ReportInsert = {
  user_id: string;
  session_id?: string | null;
  report_type: ReportType;
  pdf_url: string;
  emailed_to?: string[];
};

// Quiz Metadata table
export type QuizMetadata = {
  id: string;
  quiz_id: string;
  quiz_name: string;
  category: AssessmentCategory;
  subcategory: string;
  allowed_grades: GradeLevel[];
  is_active: boolean;
  created_at: string;
};

export type QuizMetadataInsert = {
  quiz_id: string;
  quiz_name: string;
  category: AssessmentCategory;
  subcategory: string;
  allowed_grades: GradeLevel[];
  is_active?: boolean;
};

// Category Progress
export type CategoryProgress = {
  category: AssessmentCategory;
  completed_quizzes: number;
  total_quizzes: number;
  average_score: number;
};

// Database schema type for Supabase client
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: ProfileUpdate;
        Relationships: [];
      };
      quiz_results: {
        Row: QuizResult;
        Insert: QuizResultInsert;
        Update: Partial<QuizResultInsert>;
        Relationships: [];
      };
      assessment_sessions: {
        Row: AssessmentSession;
        Insert: AssessmentSessionInsert;
        Update: Partial<AssessmentSession>;
        Relationships: [];
      };
      reports: {
        Row: Report;
        Insert: ReportInsert;
        Update: Partial<ReportInsert>;
        Relationships: [];
      };
      quiz_metadata: {
        Row: QuizMetadata;
        Insert: QuizMetadataInsert;
        Update: Partial<QuizMetadataInsert>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Express Request extension
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role: UserRole;
        grade: GradeLevel | null;
        profile: Profile;
      };
    }
  }
}
