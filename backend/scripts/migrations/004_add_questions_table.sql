-- ============================================
-- Migration 004: Questions Table
-- Stores all quiz question content and answer
-- data for all 19 quiz types.
--
-- Security model:
--   content     → sent to frontend (no answers)
--   answer_data → server-only, NEVER returned to clients
--   Backend uses service_role key (bypasses RLS)
--   Regular users have no direct access
-- ============================================

CREATE TABLE IF NOT EXISTS public.questions (
  id           TEXT    NOT NULL,
  quiz_type    TEXT    NOT NULL CHECK (quiz_type IN (
                 'spelling', 'vocabulary', 'vocabulary-matching',
                 'missing-object', 'flash-words',
                 'reading-assessment', 'story-retell', 'critical-thinking',
                 'learning-styles', 'sentence-building', 'writing',
                 'oral-language', 'logical-sequencing', 'attention-control',
                 'memory-assessment',
                 'spot-the-difference', 'sentence-difference'
               )),
  grade        TEXT    CHECK (grade IN (
                 'Grade 1','Grade 2','Grade 3','Grade 4',
                 'Grade 5','Grade 6','Grade 7','Grade 8'
               )),
  difficulty   TEXT    CHECK (difficulty IN ('easy','medium','hard')),
  order_index  INTEGER NOT NULL DEFAULT 0,
  content      JSONB   NOT NULL DEFAULT '{}',
  answer_data  JSONB   NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (quiz_type, id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_questions_quiz_type
  ON public.questions(quiz_type);

CREATE INDEX IF NOT EXISTS idx_questions_quiz_type_grade
  ON public.questions(quiz_type, grade);

CREATE INDEX IF NOT EXISTS idx_questions_grade
  ON public.questions(grade);

CREATE INDEX IF NOT EXISTS idx_questions_order
  ON public.questions(quiz_type, grade, order_index);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- All question retrieval goes through the backend API which uses the
-- service_role key — bypasses RLS entirely. These policies give admins
-- direct dashboard access and block direct anonymous/user JWT access.

CREATE POLICY "Admins can view questions" ON public.questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage questions" ON public.questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
