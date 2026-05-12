import type { NavigateFunction } from 'react-router-dom';
import { ROUTES, readingAssessmentRoute, quizRoute } from '../routes';

interface AssessmentNavigationTarget {
  path: string;
  state?: Record<string, string>;
}

export function getAssessmentSubcategoryTarget(
  categoryId: string,
  subcategoryId: string,
): AssessmentNavigationTarget {
  switch (subcategoryId) {
    case 'assessment-generator':
      return { path: ROUTES.ASSESSMENT_GENERATOR };
    case 'reading':
      return { path: readingAssessmentRoute(categoryId) };
    case 'sentence-formation':
      return { path: ROUTES.VOCABULARY_MATCHING };
    case 'learning-style':
      return { path: ROUTES.LEARNING_STYLES_QUIZ };
    case 'perception':
      return { path: ROUTES.PERCEPTION_SELECTION };
    case 'spelling':
      return { path: ROUTES.SPELLING_GRADES };
    case 'writing':
      return { path: ROUTES.WRITING_GRADES };
    case 'attention':
      return { path: ROUTES.ATTENTION_MEMORY };
    case 'oral-language':
      return { path: ROUTES.ORAL_LANGUAGE_SELECTION };
    case 'sentence-building':
      return { path: ROUTES.ORAL_SENTENCE_BUILDING, state: { categoryId: 'sentence-building' } };
    case 'story-sequencing':
      return { path: ROUTES.ORAL_STORY_SEQUENCING, state: { categoryId: 'story-sequencing' } };
    case 'story-retell':
      return { path: ROUTES.ORAL_STORY_RETELL };
    case 'critical-thinking':
      return { path: ROUTES.CRITICAL_THINKING_SELECTION };
    default:
      return { path: quizRoute(categoryId, subcategoryId) };
  }
}

export function navigateToAssessmentSubcategory(
  navigate: NavigateFunction,
  categoryId: string,
  subcategoryId: string,
): void {
  const target = getAssessmentSubcategoryTarget(categoryId, subcategoryId);

  if (target.state) {
    navigate(target.path, { state: target.state });
    return;
  }

  navigate(target.path);
}