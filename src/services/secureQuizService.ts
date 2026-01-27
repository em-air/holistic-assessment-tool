/**
 * Secure Quiz Content Service
 * 
 * This service handles fetching quiz content from the backend API.
 * Quiz questions and answers are now stored securely on the backend.
 * 
 * SECURITY: No answers are exposed in the frontend code.
 */

import { supabase } from '../supabase-client';
import logger from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get the current user's access token for API calls
 */
async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Types
export interface SpellingWord {
  index: number;
  wordId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

export interface SpellingSession {
  sessionId: string;
  totalWords: number;
  gradeDescription: string;
  words: SpellingWord[];
}

export interface SpellingAnswerResult {
  correct: boolean;
  correctWord: string;
  userAnswer: string;
  answersSubmitted: number;
  totalWords: number;
}

export interface SpellingQuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  grade: number;
  results: Array<{
    wordId: string;
    userAnswer: string | undefined;
    correctWord: string;
    isCorrect: boolean;
  }>;
}

export interface GradeInfo {
  grade: number;
  description: string;
  wordCount: number;
}

/**
 * Get available spelling grades
 */
export async function getSpellingGrades(): Promise<GradeInfo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quiz-content/spelling/grades`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch grades');
    }

    const data = await response.json();
    return data.grades;
  } catch (error) {
    logger.error('Get spelling grades error:', error);
    return [];
  }
}

/**
 * Start a new spelling quiz session
 */
export async function startSpellingSession(
  grade: number,
  wordCount: number = 10
): Promise<SpellingSession | null> {
  try {
    const token = await getAccessToken();
    if (!token) {
      logger.warn('User not authenticated for spelling quiz');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/quiz-content/spelling/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        grade,
        quizType: 'spelling',
        wordCount,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('Start spelling session error:', error);
      return null;
    }

    const data = await response.json();
    return {
      sessionId: data.sessionId,
      totalWords: data.totalWords,
      gradeDescription: data.gradeDescription,
      words: data.words,
    };
  } catch (error) {
    logger.error('Start spelling session error:', error);
    return null;
  }
}

/**
 * Get word audio (speak the word)
 */
export async function getSpellingWordAudio(
  sessionId: string,
  wordId: string
): Promise<string | null> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/quiz-content/spelling/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
        wordId,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.word; // The actual word for TTS
  } catch (error) {
    logger.error('Get word audio error:', error);
    return null;
  }
}

/**
 * Submit an answer for a spelling word
 */
export async function submitSpellingAnswer(
  sessionId: string,
  wordId: string,
  answer: string
): Promise<SpellingAnswerResult | null> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/quiz-content/spelling/submit-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
        wordId,
        answer,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('Submit answer error:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    logger.error('Submit answer error:', error);
    return null;
  }
}

/**
 * Complete a spelling quiz session and get final results
 */
export async function completeSpellingSession(
  sessionId: string
): Promise<SpellingQuizResult | null> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/quiz-content/spelling/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('Complete session error:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    logger.error('Complete session error:', error);
    return null;
  }
}
