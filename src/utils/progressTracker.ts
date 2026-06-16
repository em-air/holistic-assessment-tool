// Progress tracking utilities for mind section quizzes
// User-specific progress tracking - requires authentication

import { supabase } from '../supabase-client';
import { logger } from './logger';

export interface QuizResult {
  quizId: string;
  quizName: string;
  /** Defaults to 'mind' when omitted */
  category?: 'mind' | 'oral' | 'academic' | 'learning';
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
  oralSectionResults: QuizResult[];
  academicSectionResults: QuizResult[];
  learningSectionResults: QuizResult[];
  overallProgress: number; // 0-100
  lastUpdated: string;
  userId?: string;
}

// Mind section quiz configurations - Only Mind category quizzes
// Attention/Memory: Attention Questionnaire, Picture Sequence
// Learning Style: Learning Style Quiz
// Critical Thinking: Critical Thinking Test
// Perception: Picture Difference Test, Logical Sequencing, Missing Object
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
    id: 'critical-thinking-quiz',
    name: 'Critical Thinking Test',
    subcategory: 'critical-thinking',
    route: '/analogy-quiz'
  },
  {
    id: 'picture-difference-quiz',
    name: 'Picture Difference Test',
    subcategory: 'perception',
    route: '/picture-difference-quiz'
  },
  {
    id: 'logical-sequencing-quiz',
    name: 'Logical Sequencing',
    subcategory: 'perception',
    route: '/logical-sequencing-quiz'
  },
  {
    id: 'missing-object-quiz',
    name: 'Missing Object',
    subcategory: 'perception',
    route: '/missing-object-quiz'
  },
  {
    id: 'social-emotional',
    name: 'Social-Emotional Learning Quiz',
    subcategory: 'social-emotional',
    route: '/assessments/learning/social-emotional',
  },
  {
    id: 'learning-styles',
    name: 'Learning Preferences Quiz',
    subcategory: 'learning-style',
    route: '/assessments/learning/preferences',
  },
];

// Oral language section quiz configurations
export const ORAL_QUIZZES = [
  { id: 'oral-language-reading', name: 'Reading', subcategory: 'oral-language', route: '/reading-assessment' },
  { id: 'oral-language-sentence-building', name: 'Sentence Building', subcategory: 'oral-language', route: '/oral-language' },
  { id: 'oral-language-story-sequencing', name: 'Story Sequencing', subcategory: 'oral-language', route: '/oral-language' },
  { id: 'story-retell', name: 'Story Retell', subcategory: 'oral-language', route: '/story-retell' },
];

// Academic skills quiz configurations
export const ACADEMIC_QUIZZES = [
  { id: 'spelling-test', name: 'Spelling Test', subcategory: 'spelling', route: '/spelling-grades' },
  { id: 'writing-test', name: 'Writing Test', subcategory: 'writing', route: '/writing-grades' },
  { id: 'vocabulary-matching', name: 'Vocabulary Matching', subcategory: 'vocabulary', route: '/vocabulary-matching' },
];

// Learning assessments (learning-styles and social-emotional moved to MIND_QUIZZES/Cognition)
export const LEARNING_QUIZZES: { id: string; name: string; subcategory: string; route: string }[] = [];

export const ALL_TRACKED_QUIZZES = [
  ...MIND_QUIZZES,
  ...ORAL_QUIZZES,
  ...ACADEMIC_QUIZZES,
  ...LEARNING_QUIZZES,
];

const LEARNING_QUIZ_IDS = new Set(LEARNING_QUIZZES.map(q => q.id));

function isLearningQuizResult(result: QuizResult): boolean {
  return LEARNING_QUIZ_IDS.has(result.quizId);
}

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
  logger.log('ProgressTracker: Initialized userId:', cachedUserId);
  return cachedUserId;
}

// Ensure user ID is initialized (call this before operations that need user ID)
// Includes a timeout to prevent hanging if Supabase is unresponsive
async function ensureUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  if (!initPromise) {
    initPromise = initUserId();
  }
  // Add 5-second timeout to prevent blocking the save chain indefinitely
  try {
    const result = await Promise.race([
      initPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]);
    return result;
  } catch {
    logger.error('ProgressTracker: ensureUserId failed');
    return cachedUserId; // fall back to whatever is cached
  }
}

// Debounce / dedup guard for loadFromDatabase – prevents rapid-fire calls
let _loadInFlight: Promise<any> | null = null;
let _authLoadInFlight: Promise<any> | null = null; // separate guard for auth-triggered loads
let _lastLoadedUserId: string | null = null;

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  const newUserId = session?.user?.id || null;
  logger.log('ProgressTracker: Auth state changed:', event, newUserId);
  
  // Update cached user ID for any auth event
  cachedUserId = newUserId;
  
  if (event === 'SIGNED_OUT') {
    _lastLoadedUserId = null;
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('mindProgressUpdated', { 
      detail: {
        mindSectionResults: [],
        oralSectionResults: [],
        academicSectionResults: [],
        learningSectionResults: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString()
      }
    }));
  } else if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && newUserId) {
    // Skip if we already loaded for this user (avoids duplicate SIGNED_IN events)
    if (_lastLoadedUserId === newUserId) return;
    _lastLoadedUserId = newUserId;
    // Load progress for this user (dedup concurrent auth-triggered loads)
    if (!_authLoadInFlight) {
      _authLoadInFlight = ProgressTracker.loadFromDatabase().then(() => {
        logger.log('Loaded progress for user:', newUserId);
      }).finally(() => { _authLoadInFlight = null; });
    }
  }
});

// Initialize on load
initUserId();

// Mutex to serialize saveQuizResultAsync calls and prevent race conditions
let saveMutex: Promise<void> = Promise.resolve();

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
        oralSectionResults: [],
        academicSectionResults: [],
        learningSectionResults: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const storageKey = getStorageKey(userId);
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return { oralSectionResults: [], academicSectionResults: [], learningSectionResults: [], ...data, userId };
      } catch (error) {
        logger.error('Error parsing progress data:', error);
      }
    }
    
    return {
      mindSectionResults: [],
      oralSectionResults: [],
      academicSectionResults: [],
      learningSectionResults: [],
      overallProgress: 0,
      lastUpdated: new Date().toISOString(),
      userId
    };
  }

  static saveQuizResult(result: QuizResult): void {
    // Serialized: each save waits for the previous one to finish
    // This prevents race conditions where concurrent saves overwrite each other
    saveMutex = saveMutex.then(() => this.saveQuizResultAsync(result)).catch((err) => {
      logger.error('ProgressTracker: saveQuizResult failed for', result.quizId, err);
      // Even if save failed, dispatch event with current progress so UI stays in sync
      try {
        const currentProgress = this.getProgress();
        window.dispatchEvent(new CustomEvent('mindProgressUpdated', { detail: currentProgress }));
      } catch {
        // Last resort: don't let event dispatch failure break the chain
      }
    });
  }

  // Async version that ensures user ID is available
  private static async saveQuizResultAsync(result: QuizResult): Promise<void> {
    // Ensure user ID is initialized
    const userId = await ensureUserId();
    
    if (!userId) {
      logger.warn('Cannot save quiz result: User not authenticated - quiz result will not persist');
      // Dispatch event with current progress so UI can refresh (prompts user to sign in)
      const currentProgress = this.getProgress();
      window.dispatchEvent(new CustomEvent('mindProgressUpdated', { detail: currentProgress }));
      return;
    }

    const progress = this.getProgress();
    let category = result.category || 'mind';
    if (isLearningQuizResult(result)) {
      category = 'learning';
    }

    if (category === 'academic') {
      progress.academicSectionResults = progress.academicSectionResults.filter(
        r => r.quizId !== result.quizId
      );
      progress.academicSectionResults.push(result);
    } else if (category === 'oral') {
      progress.oralSectionResults = progress.oralSectionResults.filter(
        r => r.quizId !== result.quizId
      );
      progress.oralSectionResults.push(result);
    } else if (category === 'learning') {
      progress.learningSectionResults = (progress.learningSectionResults ?? []).filter(
        r => r.quizId !== result.quizId
      );
      progress.learningSectionResults.push({ ...result, category: 'learning' });
    } else {
      progress.mindSectionResults = progress.mindSectionResults.filter(
        r => r.quizId !== result.quizId
      );
      progress.mindSectionResults.push(result);
    }
    
    // Update overall progress
    progress.overallProgress = this.calculateOverallProgress(
      progress.mindSectionResults,
      progress.oralSectionResults,
      progress.academicSectionResults,
      progress.learningSectionResults ?? []
    );
    progress.lastUpdated = new Date().toISOString();
    
    // Save to user-specific localStorage
    const storageKey = getStorageKey(userId);
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch (storageError) {
      logger.error('ProgressTracker: localStorage write failed (quota exceeded?):', storageError);
      // Continue anyway — the in-memory progress object is still valid
      // and we'll still dispatch the event + try the DB save
    }
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('mindProgressUpdated', { 
      detail: progress 
    }));

    // Save to database — await to ensure report will include results
    try {
      await this.saveToDatabase(result);
    } catch (dbError) {
      logger.error('ProgressTracker: database save failed:', dbError);
    }
  }

  // Save quiz result to database with retry for reliability (reports pull from DB)
  private static async saveToDatabase(result: QuizResult): Promise<void> {
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const { saveQuizResult } = await import('../services/quizResultsService');
        const category = isLearningQuizResult(result) ? 'learning' : (result.category || 'mind');
        const response = await saveQuizResult({
          quiz_id: result.quizId,
          quiz_name: result.quizName,
          category: category,
          subcategory: result.subcategory,
          score: result.score,
          total_questions: result.totalQuestions,
          time_spent: result.timeSpent,
          grade_level: result.gradeLevel,
          additional_data: result.additionalData,
        });
        if (response.success) {
          return; // saved successfully
        }
        // If not authenticated, don't retry
        if (response.error === 'Not authenticated') {
          logger.warn('ProgressTracker: DB save skipped — not authenticated');
          return;
        }
        logger.warn(`ProgressTracker: DB save attempt ${attempt + 1} failed:`, response.error);
      } catch (error) {
        logger.error(`ProgressTracker: DB save attempt ${attempt + 1} error:`, error);
      }
      // Wait briefly before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    logger.error('ProgressTracker: All DB save attempts failed for', result.quizId);
  }

  // Load progress from database (for initial load after login)
  // Uses a dedup guard so concurrent calls share the same in-flight request.
  static async loadFromDatabase(): Promise<ProgressData> {
    if (_loadInFlight) return _loadInFlight as Promise<ProgressData>;
    const promise = this._loadFromDatabaseImpl();
    _loadInFlight = promise;
    promise.finally(() => { _loadInFlight = null; });
    return promise;
  }

  private static async _loadFromDatabaseImpl(): Promise<ProgressData> {
    const userId = this.getCurrentUserId();
    
    if (!userId) {
      return {
        mindSectionResults: [],
        oralSectionResults: [],
        academicSectionResults: [],
        learningSectionResults: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    try {
      const { getQuizResults } = await import('../services/quizResultsService');
      
      // Load mind, oral, and academic results in parallel
      const [mindResponse, oralResponse, academicResponse, learningResponse] = await Promise.all([
        getQuizResults('mind'),
        getQuizResults('oral'),
        getQuizResults('academic'),
        getQuizResults('learning'),
      ]);

      const mapResults = (results: any[]): QuizResult[] =>
        results.map(r => ({
          quizId: r.quiz_id,
          quizName: r.quiz_name,
          category: (isLearningQuizResult({ quizId: r.quiz_id } as QuizResult) ? 'learning' : r.category) as QuizResult['category'],
          subcategory: r.subcategory,
          score: r.score,
          totalQuestions: r.total_questions,
          percentage: r.percentage,
          timeSpent: r.time_spent || 0,
          completedAt: r.completed_at,
          gradeLevel: r.grade_level,
          additionalData: r.additional_data,
        }));

      const dbMindResults = mindResponse.success && mindResponse.results
        ? mapResults(mindResponse.results).filter(r => !isLearningQuizResult(r))
        : [];
      const dbOralResults = oralResponse.success && oralResponse.results
        ? mapResults(oralResponse.results)
        : [];
      const dbAcademicResults = academicResponse.success && academicResponse.results
        ? mapResults(academicResponse.results)
        : [];
      const dbLearningResults = learningResponse.success && learningResponse.results
        ? mapResults(learningResponse.results)
        : [];

      // Merge DB results with any local results that haven't synced yet.
      // For each quiz, keep whichever result is newer (by completedAt).
      const localProgress = this.getProgress();

      const mergeResults = (dbResults: QuizResult[], localResults: QuizResult[]): QuizResult[] => {
        const merged = new Map<string, QuizResult>();
        for (const r of dbResults) merged.set(r.quizId, r);
        for (const r of localResults) {
          const existing = merged.get(r.quizId);
          if (!existing || new Date(r.completedAt) > new Date(existing.completedAt)) {
            merged.set(r.quizId, r);
          }
        }
        return Array.from(merged.values());
      };

      // Migrate quizzes that were saved under 'learning' category but now belong in 'mind' (Cognition)
      const migratedIds = new Set(['social-emotional', 'learning-styles']);
      const migratedFromDbLearning = dbLearningResults.filter(r => migratedIds.has(r.quizId));
      const dbLearningFiltered = dbLearningResults.filter(r => !migratedIds.has(r.quizId));
      const migratedFromLocalLearning = (localProgress.learningSectionResults ?? []).filter(r => migratedIds.has(r.quizId));

      const mindResults = mergeResults(
        [...dbMindResults, ...migratedFromDbLearning],
        [
          ...localProgress.mindSectionResults.filter(r => !isLearningQuizResult(r)),
          ...migratedFromLocalLearning,
        ]
      );
      const oralResults = mergeResults(dbOralResults, localProgress.oralSectionResults ?? []);
      const academicResults = mergeResults(dbAcademicResults, localProgress.academicSectionResults ?? []);
      const learningResults = mergeResults(
        dbLearningFiltered,
        [
          ...(localProgress.learningSectionResults ?? []).filter(r => !migratedIds.has(r.quizId)),
          ...localProgress.mindSectionResults.filter(isLearningQuizResult),
        ]
      );

      const progress: ProgressData = {
        mindSectionResults: mindResults,
        oralSectionResults: oralResults,
        academicSectionResults: academicResults,
        learningSectionResults: learningResults,
        overallProgress: this.calculateOverallProgress(mindResults, oralResults, academicResults, learningResults),
        lastUpdated: new Date().toISOString(),
        userId
      };

      // Save merged progress to localStorage
      const storageKey = getStorageKey(userId);
      try {
        localStorage.setItem(storageKey, JSON.stringify(progress));
      } catch (storageError) {
        logger.error('ProgressTracker: localStorage write failed during DB load:', storageError);
      }

      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('mindProgressUpdated', { 
        detail: progress 
      }));

      return progress;
    } catch (error) {
      logger.error('Failed to load from database:', error);
    }

    return this.getProgress();
  }

  static calculateOverallProgress(
    mindResults: QuizResult[],
    oralResults: QuizResult[] = [],
    academicResults: QuizResult[] = [],
    learningResults: QuizResult[] = []
  ): number {
    const totalQuizzes =
      MIND_QUIZZES.length +
      ORAL_QUIZZES.length +
      ACADEMIC_QUIZZES.length +
      LEARNING_QUIZZES.length;
    const mindIds = new Set(MIND_QUIZZES.map(q => q.id));
    const oralIds = new Set(ORAL_QUIZZES.map(q => q.id));
    const acadIds = new Set(ACADEMIC_QUIZZES.map(q => q.id));
    const learningIds = new Set(LEARNING_QUIZZES.map(q => q.id));
    const completedQuizzes =
      mindResults.filter(r => mindIds.has(r.quizId)).length +
      oralResults.filter(r => oralIds.has(r.quizId)).length +
      academicResults.filter(r => acadIds.has(r.quizId)).length +
      learningResults.filter(r => learningIds.has(r.quizId)).length;
    return Math.round((completedQuizzes / totalQuizzes) * 100);
  }

  static getQuizResult(quizId: string): QuizResult | null {
    const progress = this.getProgress();
    return progress.mindSectionResults.find(r => r.quizId === quizId)
      || progress.oralSectionResults.find(r => r.quizId === quizId)
      || progress.academicSectionResults.find(r => r.quizId === quizId)
      || (progress.learningSectionResults ?? []).find(r => r.quizId === quizId)
      || null;
  }

  static isQuizCompleted(quizId: string): boolean {
    return this.getQuizResult(quizId) !== null;
  }

  static getCompletedQuizzes(): QuizResult[] {
    const progress = this.getProgress();
    return [
      ...progress.mindSectionResults,
      ...progress.oralSectionResults,
      ...progress.academicSectionResults,
      ...(progress.learningSectionResults ?? []),
    ];
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
        oralSectionResults: [],
        academicSectionResults: [],
        learningSectionResults: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString()
      }
    }));

    // Also delete from the database so results don't reappear on reload
    this.clearFromDatabase();
  }

  private static async clearFromDatabase(): Promise<void> {
    try {
      const { deleteAllResults } = await import('../services/quizResultsService');
      const result = await deleteAllResults(['mind', 'oral', 'academic', 'learning']);
      if (!result.success) {
        logger.error('Failed to clear results from database:', result.error);
      }
    } catch (error) {
      logger.error('Error clearing results from database:', error);
    }
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
