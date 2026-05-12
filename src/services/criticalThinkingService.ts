import { api } from './apiClient';
import { logger } from '../utils/logger';
import type { AnalogyQuestion, CategoryQuestion, GradeLevel } from '../types/quiz';

export interface CriticalThinkingValidationResult {
  correct: boolean;
  correctAnswer?: string;
  explanation?: string;
}

export interface CategoryPlacementValidationResult {
  correct: boolean;
  correctCategory: string;
}

export async function getAnalogyQuestions(): Promise<AnalogyQuestion[]> {
  try {
    const response = await api.get<{ questions: AnalogyQuestion[] }>(
      '/api/quiz-content/critical-thinking/questions?type=analogy',
    );

    if (!response.success) {
      logger.error('Get analogy questions error:', response.error);
      return [];
    }

    return response.data?.questions ?? [];
  } catch (error) {
    logger.error('Get analogy questions error:', error);
    return [];
  }
}

export async function validateCriticalThinkingAnswer(
  questionId: string,
  answerId: string,
): Promise<CriticalThinkingValidationResult | null> {
  try {
    const response = await api.post<CriticalThinkingValidationResult>(
      '/api/quiz-content/critical-thinking/validate',
      { questionId, answerId },
    );

    if (!response.success) {
      logger.error('Validate critical thinking answer error:', response.error);
      return null;
    }

    return response.data ?? null;
  } catch (error) {
    logger.error('Validate critical thinking answer error:', error);
    return null;
  }
}

export async function getCategoryQuestions(grade: GradeLevel): Promise<CategoryQuestion[]> {
  try {
    const response = await api.get<{ questions: CategoryQuestion[] }>(
      `/api/quiz-content/critical-thinking/category-questions?grade=${encodeURIComponent(grade)}`,
    );

    if (!response.success) {
      logger.error('Get category questions error:', response.error);
      return [];
    }

    return response.data?.questions ?? [];
  } catch (error) {
    logger.error('Get category questions error:', error);
    return [];
  }
}

export async function validateCategoryPlacement(
  questionId: string,
  itemId: string,
  droppedCategory: string,
  grade: GradeLevel,
): Promise<CategoryPlacementValidationResult | null> {
  try {
    const response = await api.post<CategoryPlacementValidationResult>(
      '/api/quiz-content/critical-thinking/category-validate',
      { questionId, itemId, droppedCategory, grade },
    );

    if (!response.success) {
      logger.error('Validate category placement error:', response.error);
      return null;
    }

    return response.data ?? null;
  } catch (error) {
    logger.error('Validate category placement error:', error);
    return null;
  }
}