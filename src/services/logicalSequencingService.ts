import { api } from './apiClient';
import { logger } from '../utils/logger';
import type { SequencingQuestion } from '../types/quiz';

export interface LogicalSequencingCheckResult {
  isCorrect: boolean;
  correctOrder?: number[];
}

export async function getLogicalSequencingQuestions(grade: number): Promise<SequencingQuestion[]> {
  try {
    const response = await api.get<{ questions: SequencingQuestion[] }>(
      `/api/quiz-content/logical-sequencing/grade/${encodeURIComponent(String(grade))}`,
      { skipAuth: true },
    );

    if (!response.success) {
      logger.error('Get logical sequencing questions error:', response.error);
      return [];
    }

    return response.data?.questions ?? [];
  } catch (error) {
    logger.error('Get logical sequencing questions error:', error);
    return [];
  }
}

export async function checkLogicalSequencingAnswer(
  questionId: number,
  submittedOrder: number[],
): Promise<LogicalSequencingCheckResult | null> {
  try {
    const response = await api.post<LogicalSequencingCheckResult>(
      '/api/quiz-content/logical-sequencing/check',
      { questionId, submittedOrder },
    );

    if (!response.success) {
      logger.error('Check logical sequencing answer error:', response.error);
      return null;
    }

    return response.data ?? null;
  } catch (error) {
    logger.error('Check logical sequencing answer error:', error);
    return null;
  }
}