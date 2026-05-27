import { api } from './apiClient';
import { logger } from '../utils/logger';

export type LearningStyleId = 'visual' | 'auditory' | 'reading-writing';

export type LearningStyleResultId =
  | 'visual'
  | 'auditory'
  | 'reading-writing'
  | 'mixed-visual-auditory'
  | 'mixed-visual-reading-writing'
  | 'mixed-auditory-reading-writing'
  | 'mixed-all';

export interface LearningStyleOption {
  id: string;
  text: {
    en: string;
    ar: string;
  };
  style: LearningStyleId;
}

export interface LearningStyleQuestion {
  id: string;
  category: string;
  question: {
    en: string;
    ar: string;
  };
  options: LearningStyleOption[];
}

export interface LearningStyleCalculation {
  visual: number;
  auditory: number;
  'reading-writing': number;
  dominantStyle: LearningStyleId;
  result: LearningStyleResultId;
}

export async function getLearningStyleQuestions(): Promise<LearningStyleQuestion[]> {
  try {
    const response = await api.get<{ questions: LearningStyleQuestion[] }>(
      '/api/quiz-content/learning-styles/questions',
      { skipAuth: true }
    );

    if (!response.success) {
      logger.error('Get learning styles questions error:', response.error);
      return [];
    }

    return response.data?.questions ?? [];
  } catch (error) {
    logger.error('Get learning styles questions error:', error);
    return [];
  }
}

export async function calculateLearningStyle(answers: Record<string, string>): Promise<LearningStyleCalculation | null> {
  try {
    const response = await api.post<LearningStyleCalculation>(
      '/api/quiz-content/learning-styles/calculate',
      { answers },
      { skipAuth: true }
    );

    if (!response.success) {
      logger.error('Calculate learning style error:', response.error);
      return null;
    }

    return response.data ?? null;
  } catch (error) {
    logger.error('Calculate learning style error:', error);
    return null;
  }
}