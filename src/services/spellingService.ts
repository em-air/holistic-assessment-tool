import { api } from './apiClient';
import { logger } from '../utils/logger';

export interface SpellingGradeInfo {
  grade: number;
  description: string;
  wordCount: number;
}

export interface SpellingWordMeta {
  index: number;
  wordId: string;
  difficulty: string;
  hint?: string;
}

export interface SpellingStartResult {
  sessionId: string;
  totalWords: number;
  gradeDescription: string;
  words: SpellingWordMeta[];
}

export interface SpellingSubmitResult {
  correct: boolean;
  correctWord: string;
  userAnswer: string;
  answersSubmitted: number;
  totalWords: number;
}

export interface SpellingSessionResult {
  wordId: string;
  userAnswer?: string;
  correctWord: string;
  isCorrect: boolean;
}

export interface SpellingCompleteResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  grade: number;
  results: SpellingSessionResult[];
}

export async function getSpellingGrades(): Promise<SpellingGradeInfo[]> {
  try {
    const response = await api.get<{ grades: SpellingGradeInfo[] }>(
      '/api/quiz-content/spelling/grades',
      { skipAuth: true },
    );

    if (!response.success) {
      logger.error('Get spelling grades error:', response.error);
      return [];
    }

    return response.data?.grades ?? [];
  } catch (error) {
    logger.error('Get spelling grades error:', error);
    return [];
  }
}

export async function startSpellingSession(
  grade: number,
  wordCount = 10,
): Promise<SpellingStartResult | null> {
  try {
    const response = await api.post<SpellingStartResult>(
      '/api/quiz-content/spelling/start',
      { grade, quizType: 'spelling', wordCount },
    );

    if (!response.success || !response.data?.sessionId) {
      logger.error('Start spelling session error:', response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    logger.error('Start spelling session error:', error);
    return null;
  }
}

export async function submitSpellingAnswer(
  sessionId: string,
  wordId: string,
  answer: string,
): Promise<SpellingSubmitResult | null> {
  try {
    const response = await api.post<SpellingSubmitResult>(
      '/api/quiz-content/spelling/submit-answer',
      { sessionId, wordId, answer },
    );

    if (!response.success || !response.data) {
      logger.error('Submit spelling answer error:', response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    logger.error('Submit spelling answer error:', error);
    return null;
  }
}

export async function completeSpellingSession(sessionId: string): Promise<SpellingCompleteResult | null> {
  try {
    const response = await api.post<SpellingCompleteResult>(
      '/api/quiz-content/spelling/complete',
      { sessionId },
    );

    if (!response.success || !response.data) {
      logger.error('Complete spelling session error:', response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    logger.error('Complete spelling session error:', error);
    return null;
  }
}

export async function speakSpellingWord(sessionId: string, wordId: string): Promise<string | null> {
  try {
    const response = await api.post<{ word: string }>(
      '/api/quiz-content/spelling/speak',
      { sessionId, wordId },
    );

    if (!response.success || !response.data?.word) {
      logger.error('Speak spelling word error:', response.error);
      return null;
    }

    return response.data.word;
  } catch (error) {
    logger.error('Speak spelling word error:', error);
    return null;
  }
}