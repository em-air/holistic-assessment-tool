/**
 * Quiz Type Definitions
 *
 * Shared type definitions for quiz components.
 * These types define the shape of data received from the backend API.
 * No answer data is included — answers are validated server-side.
 */

// ============================================
// CRITICAL THINKING
// ============================================

export type GradeLevel = 'grade1' | 'grade2' | 'grade3' | 'grade4';

export interface AnalogyQuestion {
  id: string;
  type?: string;
  question: string;
  image?: string;
  difficulty?: string;
  choices?: string[];
  options?: { id: string; text: string }[];
  correctAnswer?: number;
  explanation?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
  correctCategory?: string;
}

export interface CategoryQuestion {
  id: string;
  instruction: string;
  categories: string[];
  items: CategoryItem[];
}

// ============================================
// SPELLING
// ============================================

export interface SpellingWord {
  id: string;
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

export interface GradeSpellingData {
  grade: number;
  words: SpellingWord[];
  description: string;
}

// ============================================
// ORAL LANGUAGE
// ============================================

export interface OralLanguageOption {
  id: string;
  text: string;
  image?: string;
  isCorrect?: boolean;
}

export interface SequenceImage {
  id: string;
  image: string;
  correctOrder?: number;
  description?: string;
}

export interface OralLanguageQuestion {
  id: string;
  type: 'vocabulary' | 'sentence-building' | 'storytelling' | 'story-retell';
  level: number;
  question: string;
  image: string;
  options: OralLanguageOption[];
  sequenceImages?: SequenceImage[];
  correctSequence?: string[];
  feedback?: {
    correct: string;
    incorrect: string;
  };
}

export interface QuizCategory {
  id: 'vocabulary' | 'sentence-building' | 'storytelling' | 'story-retell';
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  icon: string;
  color: string;
  questions: OralLanguageQuestion[];
}

// ============================================
// LOGICAL SEQUENCING
// ============================================

export interface SequencingQuestion {
  id: number;
  title: string;
  sentences: string[];
  correctOrder?: number[];
  grade: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  hint?: string;
}

// ============================================
// SPOT THE DIFFERENCE
// ============================================

export interface Difference {
  x: number;
  y: number;
  radius: number;
}

export interface SceneConfig {
  sceneType: 'playground' | 'bedroom' | 'kitchen' | 'classroom' | 'toys' | 'garden';
  differencesA: string[];
  differencesB: string[];
}

export interface GameLevel {
  id: number;
  grade: number;
  imageA: string;
  imageB: string;
  differences: Difference[];
  sceneConfig: SceneConfig;
  useCartoonScene: boolean;
}

export interface GameLevelWithScene extends GameLevel {
  sceneConfig: SceneConfig;
  useCartoonScene: boolean;
}

// ============================================
// STARTING / ENDING SOUNDS
// ============================================

export interface SoundQuestion {
  id: number;
  word: string;
  imageUrl: string;
  audioUrl: string;
  grade: number;
  difficulty: 'easy' | 'medium' | 'hard';
  beginningSound: string;
  endingSound: string;
  category: 'cvc' | 'cvcc' | 'blend' | 'digraph';
}

export interface QuestionData {
  question: SoundQuestion;
  questionType: 'beginning' | 'ending';
  correctAnswer: string;
  options: string[];
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  questionsData: {
    questionId: number;
    word: string;
    questionType: 'beginning' | 'ending';
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

// ============================================
// STORY RETELL
// ============================================

export interface StoryRetellOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface StoryRetellQuestion {
  id: number;
  title: string;
  story: string;
  grade: number;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  wordCount: number;
  beginningOptions: StoryRetellOption[];
  middleOptions: StoryRetellOption[];
  endOptions: StoryRetellOption[];
  expectedElements?: {
    beginning: string[];
    middle: string[];
    end: string[];
    keyCharacters: string[];
    mainEvents: string[];
  };
}

export interface RetellResponse {
  questionId: number;
  beginning: string;
  middle: string;
  end: string;
  timeSpent: number;
  completedAt: string;
}

export interface RetellEvaluation {
  questionId: number;
  scores: {
    beginning: number;
    middle: number;
    end: number;
    keyCharacters: number;
    mainEvents: number;
  };
  totalScore: number;
  percentage: number;
  feedback: string;
}
