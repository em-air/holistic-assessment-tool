// Progress tracking utilities for mind section quizzes

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

const PROGRESS_STORAGE_KEY = 'mind-section-progress';

export class ProgressTracker {
  static getProgress(): ProgressData {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing progress data:', error);
      }
    }
    
    return {
      mindSectionResults: [],
      overallProgress: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  static saveQuizResult(result: QuizResult): void {
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
    
    // Save to localStorage
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('mindProgressUpdated', { 
      detail: progress 
    }));
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
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
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