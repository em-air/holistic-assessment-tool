-- ============================================
-- Holistic Assessment Tool - Performance Optimization Migration
-- Run this in Supabase SQL Editor after the initial schema
-- ============================================

-- ============================================
-- ADDITIONAL INDEXES FOR QUERY OPTIMIZATION
-- ============================================

-- Composite index for quiz results lookup (user + category + quiz)
-- Speeds up: dashboard queries, category progress calculation
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_category 
  ON public.quiz_results(user_id, category);

-- Composite index for completed quizzes by date
-- Speeds up: recent activity queries, streak calculation
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_completed 
  ON public.quiz_results(user_id, completed_at DESC);

-- Partial index for active quizzes only
-- Speeds up: most quiz listing queries only care about active quizzes
CREATE INDEX IF NOT EXISTS idx_quiz_metadata_active_category 
  ON public.quiz_metadata(category, subcategory) 
  WHERE is_active = true;

-- Index for session lookup by user and status
-- Speeds up: resuming in-progress sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_status 
  ON public.assessment_sessions(user_id, status) 
  WHERE status = 'in_progress';

-- Index for reports by date (for admin dashboards)
CREATE INDEX IF NOT EXISTS idx_reports_date 
  ON public.reports(generated_at DESC);

-- GIN index for JSONB additional_data searches (if needed)
CREATE INDEX IF NOT EXISTS idx_quiz_results_additional_data 
  ON public.quiz_results USING GIN (additional_data);

-- ============================================
-- FUNCTION: Calculate user's overall progress efficiently
-- ============================================
DROP FUNCTION IF EXISTS public.get_user_progress(UUID);
CREATE OR REPLACE FUNCTION public.get_user_progress(p_user_id UUID)
RETURNS TABLE(
  category TEXT,
  completed_count BIGINT,
  total_available BIGINT,
  average_score NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qm.category::TEXT,
    COUNT(DISTINCT qr.quiz_id) as completed_count,
    COUNT(DISTINCT qm.quiz_id) as total_available,
    ROUND(AVG(qr.percentage)::NUMERIC, 2) as average_score
  FROM public.quiz_metadata qm
  LEFT JOIN public.quiz_results qr 
    ON qm.quiz_id = qr.quiz_id 
    AND qr.user_id = p_user_id
  WHERE qm.is_active = true
  GROUP BY qm.category;
END;
$$;

-- ============================================
-- FUNCTION: Get user's recent activity
-- ============================================
DROP FUNCTION IF EXISTS public.get_user_recent_activity(UUID, INT);
CREATE OR REPLACE FUNCTION public.get_user_recent_activity(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE(
  quiz_id TEXT,
  quiz_name TEXT,
  category TEXT,
  score INT,
  percentage INT,
  completed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qr.quiz_id,
    qr.quiz_name,
    qr.category::TEXT,
    qr.score,
    qr.percentage,
    qr.completed_at
  FROM public.quiz_results qr
  WHERE qr.user_id = p_user_id
  ORDER BY qr.completed_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================
-- MATERIALIZED VIEW: Daily statistics (for admin dashboard)
-- Refresh this periodically (e.g., every hour)
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.daily_statistics AS
SELECT 
  DATE(completed_at) as date,
  category,
  COUNT(*) as quiz_completions,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(AVG(percentage)::NUMERIC, 2) as average_score
FROM public.quiz_results
GROUP BY DATE(completed_at), category
ORDER BY date DESC;

-- Index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_statistics_date_category 
  ON public.daily_statistics(date, category);

-- ============================================
-- TRIGGER: Update profile updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- VACUUM and ANALYZE to update statistics
-- Run periodically for optimal query planning
-- ============================================
-- VACUUM ANALYZE public.quiz_results;
-- VACUUM ANALYZE public.quiz_metadata;
-- VACUUM ANALYZE public.profiles;
-- VACUUM ANALYZE public.assessment_sessions;

-- ============================================
-- Grant execute permissions on functions
-- ============================================
GRANT EXECUTE ON FUNCTION public.get_user_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_recent_activity(UUID, INT) TO authenticated;

-- Note: To refresh the materialized view, run:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY public.daily_statistics;
