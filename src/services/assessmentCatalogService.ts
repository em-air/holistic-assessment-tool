import { api } from './apiClient';
import { logger } from '../utils/logger';
import type { AssessmentCategory } from '../types';

// Trial mode: hide these categories from the catalog entirely so their
// cards don't render and direct navigation to them 404s via CategoryPage.
const HIDDEN_CATEGORY_IDS = ['oral-skills', 'academic-skills'];

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

    const categories = response.data?.categories ?? [];
    return categories.filter((category) => !HIDDEN_CATEGORY_IDS.includes(category.id));
  } catch (error) {
    logger.error('Get assessment catalog error:', error);
    return [];
  }
}