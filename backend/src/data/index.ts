/**
 * Backend Quiz Data - Master Index
 * 
 * This file exports all quiz data and provides unified helper functions.
 * All answers are stored here on the backend and NEVER sent to the frontend
 * until after the user submits their answer.
 * 
 * SECURITY: This data should only be accessed by backend routes
 */

// Export quiz data modules with namespaced imports for modules with conflicting names
export * from './spellingData.js';
export * from './writingData.js';
export * from './storyRetellData.js';
export * from './oralLanguageData.js';
export * from './vocabularyData.js';
export * from './vocabularyMatchingData.js';
export * from './blendingData.js';
export * from './learningStylesData.js';
export * from './criticalThinkingData.js';
export * from './flashWordData.js';
export * from './missingObjectData.js';
export * from './readingAssessmentData.js';
export * from './quizAccessRules.js';

// Namespaced exports for modules with overlapping function names
export * as LogicalSequencingData from './logicalSequencingData.js';
export * as AttentionControlData from './attentionControlData.js';
export * as MemoryAssessmentData from './memoryAssessmentData.js';
export * as StartingEndingSoundData from './startingEndingSoundData.js';
export * as SpotTheDifferenceData from './spotTheDifferenceData.js';
export * as SentenceDifferenceData from './sentenceDifferenceData.js';

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
  | 'blending'
  | 'segmenting'
  | 'learning-styles'
  | 'critical-thinking'
  | 'attention-memory'
  | 'logical-sequencing'
  | 'memory-assessment'
  | 'starting-ending-sounds'
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
  'blending': {
    type: 'blending',
    name: 'Blending Quiz',
    category: 'academic',
    subcategory: 'blending-segmenting',
    hasGradeLevels: true,
    availableGrades: [1, 2, 3],
  },
  'segmenting': {
    type: 'segmenting',
    name: 'Segmenting Quiz',
    category: 'academic',
    subcategory: 'blending-segmenting',
    hasGradeLevels: true,
    availableGrades: [1, 2, 3],
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
  'starting-ending-sounds': {
    type: 'starting-ending-sounds',
    name: 'Beginning & Ending Sounds',
    category: 'academic',
    subcategory: 'starting-ending-sounds',
    hasGradeLevels: true,
    availableGrades: [1, 2, 3, 4],
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
