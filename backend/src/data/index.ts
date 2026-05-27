/**
 * Backend Quiz Data - Master Index
 * 
 * This file exports all quiz data and provides unified helper functions.
 * All answers are stored here on the backend and NEVER sent to the frontend
 * until after the user submits their answer.
 * 
 * SECURITY: This data should only be accessed by backend routes
 */

// Quiz data now lives in the database (questions table).
// The following files remain for config/dynamic use only.
export * from './quizAccessRules.js';
export * as MemoryAssessmentData from './memoryAssessmentData.js';

// Types for quiz sessions
export interface QuizSession {
  sessionId: string;
  userId: string;
  quizType: string;
  grade?: number;
  startTime: number;
  isComplete: boolean;
  answers: Map<string, unknown>;
  questionIds: string[];
}

// Unified quiz types
export type QuizType = 
  | 'spelling'
  | 'writing'
  | 'story-retell'
  | 'oral-language'
  | 'vocabulary'
  | 'learning-styles'
  | 'critical-thinking'
  | 'attention-memory'
  | 'logical-sequencing'
  | 'memory-assessment'
  | 'spot-the-difference'
  | 'sentence-difference';

// Quiz metadata
export interface QuizMetadata {
  type: QuizType;
  name: string;
  category: string;
  subcategory: string;
  hasGradeLevels: boolean;
  availableGrades?: number[];
}

export const quizMetadata: Record<QuizType, QuizMetadata> = {
  'spelling': {
    type: 'spelling',
    name: 'Spelling Test',
    category: 'academic',
    subcategory: 'spelling',
    hasGradeLevels: true,
    availableGrades: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  'writing': {
    type: 'writing',
    name: 'Writing Assessment',
    category: 'academic',
    subcategory: 'writing',
    hasGradeLevels: true,
    availableGrades: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  'story-retell': {
    type: 'story-retell',
    name: 'Story Retell',
    category: 'oral',
    subcategory: 'story-retell',
    hasGradeLevels: true,
    availableGrades: [1, 2, 3, 4],
  },
  'oral-language': {
    type: 'oral-language',
    name: 'Oral Language Assessment',
    category: 'oral',
    subcategory: 'oral-language',
    hasGradeLevels: false,
  },
  'vocabulary': {
    type: 'vocabulary',
    name: 'Vocabulary Matching',
    category: 'oral',
    subcategory: 'vocabulary',
    hasGradeLevels: true,
    availableGrades: [1, 2, 3, 4, 5, 6],
  },
  'learning-styles': {
    type: 'learning-styles',
    name: 'Learning Styles Quiz',
    category: 'mind',
    subcategory: 'learning-styles',
    hasGradeLevels: false,
  },
  'critical-thinking': {
    type: 'critical-thinking',
    name: 'Critical Thinking Assessment',
    category: 'mind',
    subcategory: 'critical-thinking',
    hasGradeLevels: false,
  },
  'attention-memory': {
    type: 'attention-memory',
    name: 'Attention & Memory Quiz',
    category: 'mind',
    subcategory: 'attention-memory',
    hasGradeLevels: false,
  },
  'logical-sequencing': {
    type: 'logical-sequencing',
    name: 'Logical Sequencing',
    category: 'mind',
    subcategory: 'logical-sequencing',
    hasGradeLevels: true,
    availableGrades: [1, 2, 3, 4],
  },
  'memory-assessment': {
    type: 'memory-assessment',
    name: 'Memory Assessment',
    category: 'mind',
    subcategory: 'attention-memory',
    hasGradeLevels: false,
  },
  'spot-the-difference': {
    type: 'spot-the-difference',
    name: 'Spot the Difference',
    category: 'mind',
    subcategory: 'perception',
    hasGradeLevels: true,
    availableGrades: [1, 2, 3],
  },
  'sentence-difference': {
    type: 'sentence-difference',
    name: 'Sentence Difference',
    category: 'mind',
    subcategory: 'attention-memory',
    hasGradeLevels: false,
  },
};

export function getQuizMetadata(type: QuizType): QuizMetadata | undefined {
  return quizMetadata[type];
}

export function getAllQuizTypes(): QuizType[] {
  return Object.keys(quizMetadata) as QuizType[];
}
