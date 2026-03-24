-- ============================================
-- Holistic Assessment Tool Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT,
  age INTEGER CHECK (age >= 5 AND age <= 18),
  grade TEXT CHECK (grade IN ('Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8')),
  parent_email TEXT,
  student_email TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  assigned_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for teacher lookups
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_teacher ON public.profiles(assigned_teacher_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_grade ON public.profiles(grade);

-- ============================================
-- QUIZ METADATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.quiz_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id TEXT UNIQUE NOT NULL,
  quiz_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mind', 'oral', 'academic')),
  subcategory TEXT NOT NULL,
  allowed_grades TEXT[] NOT NULL DEFAULT ARRAY['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_metadata_category ON public.quiz_metadata(category);
CREATE INDEX IF NOT EXISTS idx_quiz_metadata_active ON public.quiz_metadata(is_active);

-- ============================================
-- QUIZ RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  quiz_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mind', 'oral', 'academic')),
  subcategory TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  time_spent INTEGER NOT NULL DEFAULT 0,
  grade_level TEXT,
  additional_data JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quiz_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_category ON public.quiz_results(category);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed ON public.quiz_results(completed_at);

-- ============================================
-- ASSESSMENT SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('mind', 'oral', 'academic', 'full')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  overall_progress INTEGER NOT NULL DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.assessment_sessions(status);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.assessment_sessions(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('mind', 'oral', 'academic', 'full')),
  pdf_url TEXT NOT NULL,
  emailed_to TEXT[] DEFAULT ARRAY[]::TEXT[],
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_generated ON public.reports(generated_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Teachers can view assigned students" ON public.profiles
  FOR SELECT USING (
    assigned_teacher_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Quiz metadata policies
CREATE POLICY "Anyone can view active quizzes" ON public.quiz_metadata
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage quizzes" ON public.quiz_metadata
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Quiz results policies
CREATE POLICY "Users can view own results" ON public.quiz_results
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own results" ON public.quiz_results
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own results" ON public.quiz_results
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own results" ON public.quiz_results
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all results" ON public.quiz_results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Teachers can view assigned student results" ON public.quiz_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = quiz_results.user_id 
      AND assigned_teacher_id = auth.uid()
    )
  );

-- Assessment sessions policies
CREATE POLICY "Users can manage own sessions" ON public.assessment_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions" ON public.assessment_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Reports policies
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own reports" ON public.reports
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all reports" ON public.reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Teachers can view assigned student reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = reports.user_id 
      AND assigned_teacher_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, student_name, age, grade, parent_email, student_email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'studentName',
    (NEW.raw_user_meta_data->>'age')::INTEGER,
    NEW.raw_user_meta_data->>'grade',
    COALESCE(NEW.raw_user_meta_data->>'parentEmail', NEW.email),
    NEW.raw_user_meta_data->>'studentEmail',
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE BUCKET FOR REPORTS
-- ============================================
-- Run this in Supabase Dashboard > Storage > New Bucket
-- Bucket name: reports
-- Public: false (private)

-- ============================================
-- HELPER FUNCTION: Get user progress
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_progress(target_user_id UUID)
RETURNS TABLE (
  category TEXT,
  completed_quizzes BIGINT,
  total_quizzes BIGINT,
  average_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH user_grade AS (
    SELECT grade FROM public.profiles WHERE id = target_user_id
  ),
  available_quizzes AS (
    SELECT qm.quiz_id, qm.category
    FROM public.quiz_metadata qm, user_grade ug
    WHERE qm.is_active = true
    AND (ug.grade = ANY(qm.allowed_grades) OR ug.grade IS NULL)
  ),
  completed AS (
    SELECT qr.quiz_id, qr.category, qr.percentage
    FROM public.quiz_results qr
    WHERE qr.user_id = target_user_id
  )
  SELECT 
    aq.category,
    COUNT(DISTINCT c.quiz_id) as completed_quizzes,
    COUNT(DISTINCT aq.quiz_id) as total_quizzes,
    COALESCE(AVG(c.percentage), 0) as average_score
  FROM available_quizzes aq
  LEFT JOIN completed c ON aq.quiz_id = c.quiz_id
  GROUP BY aq.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_progress(UUID) TO authenticated;

-- ============================================
-- DONE!
-- ============================================
-- After running this script:
-- 1. Create a storage bucket called 'reports' (private)
-- 2. Run the seed script: npm run seed
-- 3. Create an admin user and update their role:
--    UPDATE public.profiles SET role = 'admin' WHERE id = 'your-user-id';
