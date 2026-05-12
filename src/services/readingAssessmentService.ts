import { api } from './apiClient';
import { logger } from '../utils/logger';

export type ReadingSeason = 'Fall' | 'Winter' | 'Spring';
export type ReadingTargetRange = [number, number];
export type ReadingTargetRates = Record<ReadingSeason, ReadingTargetRange>;
export type ReadingTargetRateMap = Record<number, ReadingTargetRates>;

export interface ReadingAssessmentContent {
  title: string;
  text: string;
}

export interface ReadingAssessmentContentResponse {
  content: ReadingAssessmentContent;
  allTargetRates: ReadingTargetRateMap;
}

export async function getReadingAssessmentContent(
  grade: number,
): Promise<ReadingAssessmentContentResponse | null> {
  try {
    const response = await api.get<ReadingAssessmentContentResponse>(
      `/api/quiz-content/reading-assessment/content/${grade}`,
      { skipAuth: true },
    );

    if (!response.success || !response.data) {
      logger.error('Get reading assessment content error:', response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    logger.error('Get reading assessment content error:', error);
    return null;
  }
}