import { api } from './apiClient';
import { logger } from '../utils/logger';

export interface MissingObjectQuestion {
  id: number;
  image: string;
  question: string;
  options: string[];
}

export interface MissingObjectValidationResult {
  correct: boolean;
  correctAnswer: string;
}

export async function getMissingObjectQuestions(): Promise<MissingObjectQuestion[]> {
  try {
    const response = await api.get<{ questions: MissingObjectQuestion[] }>(
      '/api/quiz-content/missing-object/questions',
      { skipAuth: true },
    );

    if (!response.success) {
      logger.error('Get missing object questions error:', response.error);
      return [];
    }

    return response.data?.questions ?? [];
  } catch (error) {
    logger.error('Get missing object questions error:', error);
    return [];
  }
}

export async function validateMissingObjectQuestion(
  questionId: number,
  answer: string,
): Promise<MissingObjectValidationResult | null> {
  try {
    const response = await api.post<MissingObjectValidationResult>(
      '/api/quiz-content/missing-object/validate',
      { questionId, answer },
      { skipAuth: true },
    );

    if (!response.success || !response.data) {
      logger.error('Validate missing object question error:', response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    logger.error('Validate missing object question error:', error);
    return null;
  }
}