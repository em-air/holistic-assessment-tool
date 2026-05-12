import { api } from './apiClient';
import { logger } from '../utils/logger';

export interface VocabularyMatchingQuestion {
  id: string;
  word: string;
  definition: string;
}

export interface VocabularyMatchingLevelSummary {
  level: number;
  questionCount: number;
}

export interface VocabularyMatchingGradeSummary {
  grade: number;
  levels: VocabularyMatchingLevelSummary[];
}

export async function getVocabularyMatchingGrades(): Promise<VocabularyMatchingGradeSummary[]> {
  try {
    const response = await api.get<{ grades: VocabularyMatchingGradeSummary[] }>(
      '/api/quiz-content/vocabulary-matching/grades',
      { skipAuth: true },
    );

    if (!response.success) {
      logger.error('Get vocabulary matching grades error:', response.error);
      return [];
    }

    return response.data?.grades ?? [];
  } catch (error) {
    logger.error('Get vocabulary matching grades error:', error);
    return [];
  }
}

export async function getVocabularyMatchingQuestions(
  grade: number,
  level: number,
): Promise<VocabularyMatchingQuestion[]> {
  try {
    const response = await api.get<{ questions: VocabularyMatchingQuestion[] }>(
      `/api/quiz-content/vocabulary-matching/questions?grade=${encodeURIComponent(String(grade))}&level=${encodeURIComponent(String(level))}`,
      { skipAuth: true },
    );

    if (!response.success) {
      logger.error('Get vocabulary matching questions error:', response.error);
      return [];
    }

    return response.data?.questions ?? [];
  } catch (error) {
    logger.error('Get vocabulary matching questions error:', error);
    return [];
  }
}