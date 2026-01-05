// Progress tracking utilities for mind section quizzes
// User-specific progress tracking - requires authentication

import { supabase } from '../supabase-client';

export interface QuizResult {
  quizId: string;
  quizName: string;
  subcategory: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number; // in seconds
  completedAt: string; // ISO timestamp
  gradeLevel?: string;
  additionalData?: any;
}

export interface ProgressData {
  mindSectionResults: QuizResult[];
  overallProgress: number; // 0-100
  lastUpdated: string;
  userId?: string;
}

// Mind section quiz configurations - Only Mind category quizzes
export const MIND_QUIZZES = [
  {
    id: 'attention-assessment',
    name: 'Attention Questionnaire',
    subcategory: 'attention',
    route: '/attention-assessment'
  },
  {
    id: 'picture-sequence',
    name: 'Picture Sequence',
    subcategory: 'memory',
    route: '/memory-assessment'
  },
  {
    id: 'number-tiles',
    name: 'Number Tiles',
    subcategory: 'memory',
    route: '/memory-quiz'
  },
  {
    id: 'flash-word-quiz',
    name: 'Flash Word Quiz',
    subcategory: 'memory',
    route: '/flash-word-quiz'
  },
  {
    id: 'learning-styles',
    name: 'Learning Style Quiz',
    subcategory: 'learning-style',
    route: '/learning-styles-quiz'
  },
  {
    id: 'analogy-quiz',
    name: 'Analogy Quiz',
    subcategory: 'critical-thinking',
    route: '/analogy-quiz'
  },
  {
    id: 'category-quiz',
    name: 'Category Quiz',
    subcategory: 'critical-thinking',
    route: '/category-quiz'
  },
  {
    id: 'missing-object-quiz',
    name: 'Missing Object',
    subcategory: 'perception',
    route: '/missing-object-quiz'
  },
  {
    id: 'sentence-difference-quiz',
    name: 'Sentence Differences',
    subcategory: 'perception',
    route: '/sentence-difference-quiz'
  },
  {
    id: 'logical-sequencing-quiz',
    name: 'Logical Sequencing',
    subcategory: 'perception',
    route: '/logical-sequencing-quiz'
  }
];

// Get user-specific storage key
function getStorageKey(userId: string): string {
  return `mind-section-progress-${userId}`;
}

// Get current user ID synchronously from cached session
let cachedUserId: string | null = null;
let initPromise: Promise<string | null> | null = null;

// Initialize user ID from session
async function initUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  cachedUserId = session?.user?.id || null;
  console.log('ProgressTracker: Initialized userId:', cachedUserId);
  return cachedUserId;
}

// Ensure user ID is initialized (call this before operations that need user ID)
async function ensureUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  if (!initPromise) {
    initPromise = initUserId();
  }
  return initPromise;
}

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  const newUserId = session?.user?.id || null;
  console.log('ProgressTracker: Auth state changed:', event, newUserId);
  
  // Update cached user ID for any auth event
  cachedUserId = newUserId;
  
  if (event === 'SIGNED_OUT') {
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('mindProgressUpdated', { 
      detail: {
        mindSectionResults: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString()
      }
    }));
  } else if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && newUserId) {
    // Load progress for this user
    ProgressTracker.loadFromDatabase().then(() => {
      console.log('Loaded progress for user:', newUserId);
    });
  }
});

// Initialize on load
initUserId();

export class ProgressTracker {
  // Get current user ID (synchronous, uses cache)
  static getCurrentUserId(): string | null {
    return cachedUserId;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return cachedUserId !== null;
  }

  static getProgress(): ProgressData {
    const userId = this.getCurrentUserId();
    
    // Return empty progress if not authenticated
    if (!userId) {
      return {
        mindSectionResults: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const storageKey = getStorageKey(userId);
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return { ...data, userId };
      } catch (error) {
        console.error('Error parsing progress data:', error);
      }
    }
    
    return {
      mindSectionResults: [],
      overallProgress: 0,
      lastUpdated: new Date().toISOString(),
      userId
    };
  }

  static saveQuizResult(result: QuizResult): void {
    // Try to get user ID, or wait for it if not ready
    this.saveQuizResultAsync(result);
  }

  // Async version that ensures user ID is available
  private static async saveQuizResultAsync(result: QuizResult): Promise<void> {
    // Ensure user ID is initialized
    const userId = await ensureUserId();
    
    if (!userId) {
      console.warn('Cannot save quiz result: User not authenticated');
      return;
    }

    const progress = this.getProgress();
    
    // Remove any existing result for the same quiz
    progress.mindSectionResults = progress.mindSectionResults.filter(
      r => r.quizId !== result.quizId
    );
    
    // Add the new result
    progress.mindSectionResults.push(result);
    
    // Update overall progress
    progress.overallProgress = this.calculateOverallProgress(progress.mindSectionResults);
    progress.lastUpdated = new Date().toISOString();
    
    // Save to user-specific localStorage
    const storageKey = getStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(progress));
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('mindProgressUpdated', { 
      detail: progress 
    }));

    // Also save to database (async, don't block)
    this.saveToDatabase(result);
  }

  // Save quiz result to database in background
  private static async saveToDatabase(result: QuizResult): Promise<void> {
    try {
      const { saveQuizResult } = await import('../services/quizResultsService');
      await saveQuizResult({
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
    } catch (error) {
      console.error('Failed to save to database:', error);
    }
  }

  // Load progress from database (for initial load after login)
  static async loadFromDatabase(): Promise<ProgressData> {
    const userId = this.getCurrentUserId();
    
    if (!userId) {
      return {
        mindSectionResults: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    try {
      const { getQuizResults } = await import('../services/quizResultsService');
      const response = await getQuizResults('mind');
      
      if (response.success && response.results) {
        // Convert database results to local format
        const mindResults: QuizResult[] = response.results.map(r => ({
          quizId: r.quiz_id,
          quizName: r.quiz_name,
          subcategory: r.subcategory,
          score: r.score,
          totalQuestions: r.total_questions,
          percentage: r.percentage,
          timeSpent: r.time_spent || 0,
          completedAt: r.completed_at,
          gradeLevel: r.grade_level,
          additionalData: r.additional_data,
        }));

        const progress: ProgressData = {
          mindSectionResults: mindResults,
          overallProgress: this.calculateOverallProgress(mindResults),
          lastUpdated: new Date().toISOString(),
          userId
        };

        // Save to localStorage for faster access
        const storageKey = getStorageKey(userId);
        localStorage.setItem(storageKey, JSON.stringify(progress));

        // Dispatch event to update UI
        window.dispatchEvent(new CustomEvent('mindProgressUpdated', { 
          detail: progress 
        }));

        return progress;
      }
    } catch (error) {
      console.error('Failed to load from database:', error);
    }

    return this.getProgress();
  }

  static calculateOverallProgress(results: QuizResult[]): number {
    const totalQuizzes = MIND_QUIZZES.length;
    const completedQuizzes = results.length;
    return Math.round((completedQuizzes / totalQuizzes) * 100);
  }

  static getQuizResult(quizId: string): QuizResult | null {
    const progress = this.getProgress();
    return progress.mindSectionResults.find(r => r.quizId === quizId) || null;
  }

  static isQuizCompleted(quizId: string): boolean {
    return this.getQuizResult(quizId) !== null;
  }

  static getCompletedQuizzes(): QuizResult[] {
    const progress = this.getProgress();
    return progress.mindSectionResults;
  }

  static getIncompleteQuizzes(): typeof MIND_QUIZZES {
    const completedIds = this.getCompletedQuizzes().map(r => r.quizId);
    return MIND_QUIZZES.filter(quiz => !completedIds.includes(quiz.id));
  }

  static clearProgress(): void {
    const userId = this.getCurrentUserId();
    
    if (userId) {
      const storageKey = getStorageKey(userId);
      localStorage.removeItem(storageKey);
    }
    
    window.dispatchEvent(new CustomEvent('mindProgressUpdated', { 
      detail: {
        mindSectionResults: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString()
      }
    }));
  }

  static exportProgressData(): string {
    const progress = this.getProgress();
    return JSON.stringify(progress, null, 2);
  }

  static getPerformanceLevel(percentage: number): {
    level: string;
    color: string;
    emoji: string;
    description: string;
  } {
    if (percentage >= 90) {
      return {
        level: 'Excellent',
        color: 'text-green-600',
        emoji: '🌟',
        description: 'Outstanding performance! You have mastered this area.'
      };
    } else if (percentage >= 75) {
      return {
        level: 'Good',
        color: 'text-blue-600',
        emoji: '👍',
        description: 'Great work! You show strong understanding.'
      };
    } else if (percentage >= 60) {
      return {
        level: 'Satisfactory',
        color: 'text-yellow-600',
        emoji: '✋',
        description: 'Good progress! There\'s room for improvement.'
      };
    } else {
      return {
        level: 'Needs Improvement',
        color: 'text-red-600',
        emoji: '💪',
        description: 'Keep practicing! You\'re on the right track.'
      };
    }
  }
}
