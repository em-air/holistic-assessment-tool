-- ============================================
-- Migration 005: Add category-quiz and memory-items to quiz_type constraint
-- ============================================

-- Drop the old quiz_type check and recreate with the two new types
ALTER TABLE public.questions
  DROP CONSTRAINT IF EXISTS questions_quiz_type_check;

ALTER TABLE public.questions
  ADD CONSTRAINT questions_quiz_type_check
  CHECK (quiz_type IN (
    'spelling', 'vocabulary', 'vocabulary-matching',
    'missing-object', 'flash-words',
    'reading-assessment', 'story-retell', 'critical-thinking',
    'learning-styles', 'sentence-building', 'writing',
    'oral-language', 'logical-sequencing', 'attention-control',
    'memory-assessment', 'memory-items',
    'spot-the-difference', 'sentence-difference',
    'category-quiz'
  ));
