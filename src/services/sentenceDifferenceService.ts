import { api } from './apiClient';
import { logger } from '../utils/logger';

export interface SentenceDifferenceQuestion {
  id: number;
  sentenceA: string;
  sentenceB: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function getSentenceDifferenceQuestions(): Promise<SentenceDifferenceQuestion[]> {
  try {
    const response = await api.get<{ questions: SentenceDifferenceQuestion[] }>(
      '/api/quiz-content/sentence-difference/questions',
      { skipAuth: true },
    );

    if (!response.success) {
      logger.error('Get sentence difference questions error:', response.error);
      return [];
    }

    return response.data?.questions ?? [];
  } catch (error) {
    logger.error('Get sentence difference questions error:', error);
    return [];
  }
}