/**
 * Quiz Results Service
 * Syncs quiz results between frontend and backend database
 */

import { supabase } from '../supabase-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface QuizResultData {
  quiz_id: string;
  quiz_name: string;
  category: 'mind' | 'oral' | 'academic';
  subcategory: string;
  score: number;
  total_questions: number;
  time_spent?: number;
  grade_level?: string;
  additional_data?: Record<string, any>;
}

export interface SavedQuizResult extends QuizResultData {
  id: string;
  user_id: string;
  percentage: number;
  completed_at: string;
}

/**
 * Get the current user's access token
 */
async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Save a quiz result to the database
 */
export async function saveQuizResult(result: QuizResultData): Promise<{ success: boolean; result?: SavedQuizResult; error?: string }> {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.log('Not authenticated - skipping database save');
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${API_BASE_URL}/api/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(result),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to save quiz result:', errorData);
      return { success: false, error: errorData.error || 'Failed to save result' };
    }

    const data = await response.json();
    console.log('Quiz result saved to database:', data.result?.id);
    return { success: true, result: data.result };
  } catch (error: any) {
    console.error('Error saving quiz result:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all quiz results for the current user from the database
 */
export async function getQuizResults(category?: 'mind' | 'oral' | 'academic'): Promise<{ success: boolean; results?: SavedQuizResult[]; error?: string }> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const url = category 
      ? `${API_BASE_URL}/api/results?category=${category}`
      : `${API_BASE_URL}/api/results`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Failed to get results' };
    }

    const data = await response.json();
    return { success: true, results: data.results };
  } catch (error: any) {
    console.error('Error fetching quiz results:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sync local progress with database (upload local results that aren't in DB)
 */
export async function syncLocalToDatabase(): Promise<{ synced: number; errors: number }> {
  const token = await getAccessToken();
  if (!token) {
    return { synced: 0, errors: 0 };
  }

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

    console.log(`Synced ${synced} results to database, ${errors} errors`);
    return { synced, errors };
  } catch (error) {
    console.error('Error syncing to database:', error);
    return { synced: 0, errors: 1 };
  }
}
