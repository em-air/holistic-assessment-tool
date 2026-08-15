import { api } from './apiClient';
import { logger } from '../utils/logger';
import type { AssessmentCategory } from '../types';

export async function getAssessmentCatalog(): Promise<AssessmentCategory[]> {
  try {
    const response = await api.get<{ categories: AssessmentCategory[] }>(
      '/api/quiz-content/assessment-catalog',
      { skipAuth: true }
    );

    if (!response.success) {
      logger.error('Get assessment catalog error:', response.error);
      return [];
    }

    return response.data?.categories ?? [];
  } catch (error) {
    logger.error('Get assessment catalog error:', error);
    return [];
  }
}