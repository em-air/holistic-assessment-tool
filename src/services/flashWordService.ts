import { api } from './apiClient';
import { logger } from '../utils/logger';

export type GradeLevel = 'grade1' | 'grade2' | 'grade3' | 'grade4';

export interface FlashWord {
  id: number;
  image: string;
  word: string;
}

export interface FlashWordGradeSummary {
  grade: GradeLevel;
  questionCount: number;
  showImage: boolean;
}

export async function getFlashWordGrades(): Promise<FlashWordGradeSummary[]> {
  try {
    const response = await api.get<{ grades: FlashWordGradeSummary[] }>(
      '/api/quiz-content/flash-word/grades',
      { skipAuth: true },
    );

    if (!response.success) {
      logger.error('Get flash word grades error:', response.error);
      return [];
    }

    return response.data?.grades ?? [];
  } catch (error) {
    logger.error('Get flash word grades error:', error);
    return [];
  }
}

export async function getFlashWordQuestions(grade: GradeLevel): Promise<FlashWord[]> {
  try {
    const response = await api.get<{ words: FlashWord[] }>(
      `/api/quiz-content/flash-word/questions/${encodeURIComponent(grade)}`,
      { skipAuth: true },
    );

    if (!response.success) {
      logger.error('Get flash word questions error:', response.error);
      return [];
    }

    return response.data?.words ?? [];
  } catch (error) {
    logger.error('Get flash word questions error:', error);
    return [];
  }
}