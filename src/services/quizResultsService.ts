/**
 * Quiz Results Service
 * Syncs quiz results between frontend and backend database
 */

import { api } from './apiClient';
import { logger } from '../utils/logger';

export interface QuizResultData {
  quiz_id: string;
  quiz_name: string;
  category: 'mind' | 'oral' | 'academic';
  subcategory: string;
  score: number;
  total_questions: number;
  time_spent?: number;
  grade_level?: string;
  additional_data?: Record<string, unknown>;
}

export interface SavedQuizResult extends QuizResultData {
  id: string;
  user_id: string;
  percentage: number;
  completed_at: string;
}

/**
 * Save a quiz result to the database
 */
export async function saveQuizResult(result: QuizResultData): Promise<{ success: boolean; result?: SavedQuizResult; error?: string }> {
  try {
    const response = await api.post<{ success: boolean; result: SavedQuizResult }>('/api/results', result);
    if (!response.success) {
      logger.error('Failed to save quiz result:', response.error);
      return { success: false, error: response.error?.message || 'Failed to save result' };
    }
    logger.log('Quiz result saved to database:', response.data?.result?.id);
    return { success: true, result: response.data?.result };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error('Error saving quiz result:', error);
    return { success: false, error: msg };
  }
}

/**
 * Get all quiz results for the current user from the database
 */
export async function getQuizResults(category?: 'mind' | 'oral' | 'academic'): Promise<{ success: boolean; results?: SavedQuizResult[]; error?: string }> {
  try {
    const endpoint = category ? `/api/results?category=${category}` : '/api/results';
    const response = await api.get<{ results: SavedQuizResult[] }>(endpoint);
    if (!response.success) {
      return { success: false, error: response.error?.message || 'Failed to get results' };
    }
    return { success: true, results: response.data?.results };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching quiz results:', error);
    return { success: false, error: msg };
  }
}

/**
 * Delete all quiz results for the given categories from the database
 */
export async function deleteAllResults(categories: Array<'mind' | 'oral' | 'academic'> = ['mind', 'oral']): Promise<{ success: boolean; error?: string }> {
  try {
    const results = await Promise.allSettled(
      categories.map(cat => api.delete(`/api/results/category/${cat}`))
    );

    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
    if (failed.length > 0) {
      logger.error('Some category deletes failed:', failed);
      return { success: false, error: `Failed to delete ${failed.length} category(ies)` };
    }

    logger.log('All quiz results deleted from database');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error('Error deleting all results:', error);
    return { success: false, error: msg };
  }
}

/**
 * Sync local progress with database (upload local results that aren't in DB)
 */
export async function syncLocalToDatabase(): Promise<{ synced: number; errors: number }> {
  // Get local progress
  const localProgress = localStorage.getItem('mind-section-progress');
  if (!localProgress) {
    return { synced: 0, errors: 0 };
  }

  try {
    const progress = JSON.parse(localProgress);
    const localResults = progress.mindSectionResults || [];
    
    let synced = 0;
    let errors = 0;

    for (const result of localResults) {
      const saveResult = await saveQuizResult({
        quiz_id: result.quizId,
        quiz_name: result.quizName,
        category: 'mind',
        subcategory: result.subcategory,
        score: result.score,
        total_questions: result.totalQuestions,
        time_spent: result.timeSpent,
        grade_level: result.gradeLevel,
        additional_data: result.additionalData,
      });

      if (saveResult.success) {
        synced++;
      } else {
        errors++;
      }
    }

    logger.log(`Synced ${synced} results to database, ${errors} errors`);
    return { synced, errors };
  } catch (error) {
    logger.error('Error syncing to database:', error);
    return { synced: 0, errors: 1 };
  }
}
