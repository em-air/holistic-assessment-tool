-- Add 'learning' as a valid quiz result category for Learning Preferences and SEL quizzes.
ALTER TABLE public.quiz_results DROP CONSTRAINT IF EXISTS quiz_results_category_check;
ALTER TABLE public.quiz_results
  ADD CONSTRAINT quiz_results_category_check
  CHECK (category IN ('mind', 'oral', 'academic', 'learning'));

ALTER TABLE public.quiz_metadata DROP CONSTRAINT IF EXISTS quiz_metadata_category_check;
ALTER TABLE public.quiz_metadata
  ADD CONSTRAINT quiz_metadata_category_check
  CHECK (category IN ('mind', 'oral', 'academic', 'learning'));

-- Move legacy learning-styles rows from mind -> learning when present.
UPDATE public.quiz_results
SET category = 'learning'
WHERE quiz_id IN ('learning-styles', 'social-emotional')
  AND category = 'mind';
