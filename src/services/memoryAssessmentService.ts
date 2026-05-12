import { api } from './apiClient';
import { logger } from '../utils/logger';

export interface MemoryItem {
  id: string;
  name: string;
  image: string;
  category: 'object';
}

export type AssessmentType = 'sequence_recall' | 'missing_object';

export interface MemoryAssessmentQuestion {
  id: string;
  type: AssessmentType;
  title: string;
  instruction: string;
  items: MemoryItem[];
  allChoices?: MemoryItem[];
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface PerformanceResult {
  percentage: number;
  finalScore: number;
  level: string;
  recommendations: string[];
}

interface GeneratedMemoryQuestion {
  question: MemoryAssessmentQuestion;
  questionRef: string;
}

interface MemoryAnswerCheckResult {
  isCorrect: boolean;
}

export async function generateMemoryQuestion(
  type: AssessmentType,
  difficulty: number,
): Promise<GeneratedMemoryQuestion | null> {
  try {
    const response = await api.post<GeneratedMemoryQuestion>(
      '/api/quiz-content/memory-assessment/generate',
      { type, difficulty },
    );

    if (!response.success || !response.data) {
      logger.error('Generate memory question error:', response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    logger.error('Generate memory question error:', error);
    return null;
  }
}

export async function checkMemoryAnswer(
  type: AssessmentType,
  submittedAnswer: string | string[],
  questionRef: string,
): Promise<MemoryAnswerCheckResult | null> {
  try {
    const response = await api.post<MemoryAnswerCheckResult>(
      '/api/quiz-content/memory-assessment/check',
      { type, submittedAnswer, questionRef },
    );

    if (!response.success || !response.data) {
      logger.error('Check memory answer error:', response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    logger.error('Check memory answer error:', error);
    return null;
  }
}

export async function evaluateMemoryAssessment(
  correctAnswers: number,
  totalQuestions: number,
  difficulty: number,
): Promise<PerformanceResult | null> {
  try {
    const response = await api.post<{ evaluation: PerformanceResult }>(
      '/api/quiz-content/memory-assessment/evaluate',
      { correctAnswers, totalQuestions, difficulty },
    );

    if (!response.success || !response.data?.evaluation) {
      logger.error('Evaluate memory assessment error:', response.error);
      return null;
    }

    return response.data.evaluation;
  } catch (error) {
    logger.error('Evaluate memory assessment error:', error);
    return null;
  }
}