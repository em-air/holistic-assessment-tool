import { api } from './apiClient';
import { logger } from '../utils/logger';
import type { AssessmentCategory } from '../types';

// ============================================================================
// TEMPORARILY HIDDEN: ACADEMIC SKILLS SECTION
// To re-add it: delete 'academic-skills' from HIDDEN_CATEGORY_IDS below
// (or empty the array, and remove the filter in getAssessmentCatalog).
// While hidden, its card doesn't render and /category/academic-skills 404s.
// ============================================================================
const HIDDEN_CATEGORY_IDS = ['academic-skills'];

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
    // HIDDEN: see HIDDEN_CATEGORY_IDS above to re-add Academic Skills
    return categories.filter((category) => !HIDDEN_CATEGORY_IDS.includes(category.id));
  } catch (error) {
    logger.error('Get assessment catalog error:', error);
    return [];
  }
}