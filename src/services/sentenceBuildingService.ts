import { api } from './apiClient';
import { logger } from '../utils/logger';

export interface SentenceBuildingOption {
  id: string;
  text: string;
}

export interface SentenceBuildingQuestion {
  id: string;
  level: number;
  question: string;
  image: string;
  options: SentenceBuildingOption[];
}

export interface SentenceBuildingGradeSummary {
  grade: number;
  title: string;
  description: string;
  difficulty: string;
  color: string;
  questionCount: number;
}

export interface SentenceBuildingGradeData extends SentenceBuildingGradeSummary {
  questions: SentenceBuildingQuestion[];
}

export interface SentenceBuildingValidationResult {
  correct: boolean;
  correctAnswer: string;
  correctAnswerId: string;
  feedback: string;
}

export async function getSentenceBuildingGrades(): Promise<SentenceBuildingGradeSummary[]> {
  try {
    const response = await api.get<{ grades: SentenceBuildingGradeSummary[] }>(
      '/api/quiz-content/sentence-building/grades',
      { skipAuth: true }
    );

    if (!response.success) {
      logger.error('Get sentence-building grades error:', response.error);
      return [];
    }

    return response.data?.grades ?? [];
  } catch (error) {
    logger.error('Get sentence-building grades error:', error);
    return [];
  }
}

export async function getSentenceBuildingQuestions(grade: number): Promise<SentenceBuildingGradeData | null> {
  try {
    const response = await api.get<SentenceBuildingGradeData>(
      `/api/quiz-content/sentence-building/questions/${encodeURIComponent(String(grade))}`,
      { skipAuth: true }
    );

    if (!response.success) {
      logger.error('Get sentence-building questions error:', response.error);
      return null;
    }

    return response.data ?? null;
  } catch (error) {
    logger.error('Get sentence-building questions error:', error);
    return null;
  }
}

export async function validateSentenceBuildingAnswer(
  questionId: string,
  answerId: string,
): Promise<SentenceBuildingValidationResult | null> {
  try {
    const response = await api.post<SentenceBuildingValidationResult>(
      '/api/quiz-content/sentence-building/validate',
      { questionId, answerId },
      { skipAuth: true }
    );

    if (!response.success) {
      logger.error('Validate sentence-building answer error:', response.error);
      return null;
    }

    return response.data ?? null;
  } catch (error) {
    logger.error('Validate sentence-building answer error:', error);
    return null;
  }
}