import { api } from './apiClient';
import { logger } from '../utils/logger';

export interface AttentionControlQuestion {
  id: number;
  subscale: 'focusing' | 'shifting';
  kidFriendlyQuestion: string;
  example?: string;
  type: 'rating';
  options: number[];
}

export interface AttentionResults {
  focusingScore: number;
  shiftingScore: number;
  totalScore: number;
  focusingPercentage: number;
  shiftingPercentage: number;
  totalPercentage: number;
  interpretation: {
    focusing: { level: string; description: string };
    shifting: { level: string; description: string };
    overall: { level: string; description: string };
    recommendations: string[];
  };
}

interface AttentionCalculationResponse {
  scores: {
    focusing: { raw: number; count: number };
    shifting: { raw: number; count: number };
    total: { raw: number; percentage: number };
  };
  interpretation: {
    focusing: { level: string; description: string };
    shifting: { level: string; description: string };
    overall: { level: string; description: string };
  };
  recommendations: string[];
}

export async function getAttentionControlQuestions(): Promise<AttentionControlQuestion[]> {
  try {
    const response = await api.get<{ questions: AttentionControlQuestion[] }>(
      '/api/quiz-content/attention-control/questions',
      { skipAuth: true },
    );

    if (!response.success) {
      logger.error('Get attention control questions error:', response.error);
      return [];
    }

    return response.data?.questions ?? [];
  } catch (error) {
    logger.error('Get attention control questions error:', error);
    return [];
  }
}

export async function calculateAttentionAssessmentResults(
  responses: Record<number, number>,
): Promise<AttentionResults | null> {
  try {
    const response = await api.post<AttentionCalculationResponse>(
      '/api/quiz-content/attention-control/calculate',
      { responses },
    );

    if (!response.success || !response.data) {
      logger.error('Calculate attention assessment results error:', response.error);
      return null;
    }

    const { scores, interpretation, recommendations } = response.data;
    return {
      focusingScore: scores.focusing.raw,
      shiftingScore: scores.shifting.raw,
      totalScore: scores.total.raw,
      focusingPercentage: Math.round((scores.focusing.raw / (scores.focusing.count * 4)) * 100),
      shiftingPercentage: Math.round((scores.shifting.raw / (scores.shifting.count * 4)) * 100),
      totalPercentage: Math.round(scores.total.percentage),
      interpretation: {
        focusing: interpretation.focusing,
        shifting: interpretation.shifting,
        overall: interpretation.overall,
        recommendations,
      },
    };
  } catch (error) {
    logger.error('Calculate attention assessment results error:', error);
    return null;
  }
}