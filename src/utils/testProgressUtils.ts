// Testing utilities for progress tracking
import { ProgressTracker } from './progressTracker';
import { logger } from './logger';

export const addTestResults = () => {
  // Add some sample results
  ProgressTracker.saveQuizResult({
    quizId: 'analogy-quiz',
    quizName: 'Analogy Quiz',
    subcategory: 'critical-thinking',
    score: 4,
    totalQuestions: 5,
    percentage: 80,
    timeSpent: 120,
    completedAt: new Date().toISOString(),
    gradeLevel: 'grade2'
  });

  ProgressTracker.saveQuizResult({
    quizId: 'learning-styles',
    quizName: 'Learning Styles Quiz',
    subcategory: 'learning-style',
    score: 8,
    totalQuestions: 12,
    percentage: 67,
    timeSpent: 180,
    completedAt: new Date().toISOString(),
    additionalData: {
      dominantStyle: 'visual',
      allScores: [
        { style: 'visual', score: 8, percentage: 67 },
        { style: 'auditory', score: 3, percentage: 25 },
        { style: 'reading-writing', score: 1, percentage: 8 }
      ]
    }
  });

  ProgressTracker.saveQuizResult({
    quizId: 'perception-quiz',
    quizName: 'Perception Quiz',
    subcategory: 'perception',
    score: 9,
    totalQuestions: 10,
    percentage: 90,
    timeSpent: 300,
    completedAt: new Date().toISOString()
  });

  logger.log('Test results added!');
};

export const clearTestResults = () => {
  ProgressTracker.clearProgress();
  logger.log('All progress cleared!');
};

// Add to window for easy console access
declare global {
  interface Window {
    addTestResults: () => void;
    clearTestResults: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.addTestResults = addTestResults;
  window.clearTestResults = clearTestResults;
}