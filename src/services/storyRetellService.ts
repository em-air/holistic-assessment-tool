import { api } from './apiClient';
import { logger } from '../utils/logger';
import type { StoryRetellQuestion } from '../types/quiz';

export interface StoryRetellValidationResult {
  beginningCorrect: boolean;
  middleCorrect: boolean;
  endCorrect: boolean;
}

export async function getStoryRetellStories(grade: number): Promise<StoryRetellQuestion[]> {
  try {
    const response = await api.get<{ stories: StoryRetellQuestion[] }>(
      `/api/quiz-content/story-retell/stories/${encodeURIComponent(String(grade))}`,
    );

    if (!response.success) {
      logger.error('Get story retell stories error:', response.error);
      return [];
    }

    return response.data?.stories ?? [];
  } catch (error) {
    logger.error('Get story retell stories error:', error);
    return [];
  }
}

export async function validateStoryRetellAnswers(
  storyId: number,
  beginningId: string,
  middleId: string,
  endId: string,
): Promise<StoryRetellValidationResult | null> {
  try {
    const response = await api.post<StoryRetellValidationResult>(
      '/api/quiz-content/story-retell/validate',
      { storyId, beginningId, middleId, endId },
    );

    if (!response.success || !response.data) {
      logger.error('Validate story retell answers error:', response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    logger.error('Validate story retell answers error:', error);
    return null;
  }
}