import { api } from './apiClient';
import { logger } from '../utils/logger';
import type { OralLanguageQuestion, QuizCategory } from '../types/quiz';

export type OralLanguageQuizType = Exclude<QuizCategory['id'], 'story-retell'>;

export interface OralLanguageValidationResult {
  correct: boolean;
  correctAnswer: string;
  correctAnswerId?: string;
  feedback?: string;
}

export async function getOralLanguageQuestions(
  type: OralLanguageQuizType,
  level?: number,
): Promise<OralLanguageQuestion[]> {
  try {
    const searchParams = new URLSearchParams({ type });
    if (level !== undefined) {
      searchParams.set('level', String(level));
    }

    const response = await api.get<{ questions: OralLanguageQuestion[] }>(
      `/api/quiz-content/oral-language/questions?${searchParams.toString()}`,
    );

    if (!response.success) {
      logger.error('Get oral language questions error:', response.error);
      return [];
    }

    return response.data?.questions ?? [];
  } catch (error) {
    logger.error('Get oral language questions error:', error);
    return [];
  }
}

export async function validateOralLanguageAnswer(
  questionId: string,
  answerId: string,
): Promise<OralLanguageValidationResult | null> {
  try {
    const response = await api.post<OralLanguageValidationResult>(
      '/api/quiz-content/oral-language/validate',
      { questionId, answerId },
    );

    if (!response.success) {
      logger.error('Validate oral language answer error:', response.error);
      return null;
    }

    return response.data ?? null;
  } catch (error) {
    logger.error('Validate oral language answer error:', error);
    return null;
  }
}