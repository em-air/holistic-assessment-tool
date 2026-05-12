import { api } from './apiClient';
import { logger } from '../utils/logger';

export interface WritingTopic {
  id: string;
  title: string;
  prompt: string;
  description: string;
  wordCount: {
    min: number;
    max: number;
  };
  criteria: string[];
}

export interface WritingRubricLevel {
  excellent: string;
  good: string;
  needs_improvement: string;
}

export interface GradeWritingData {
  grade: number;
  topics: WritingTopic[];
  skillFocus: string[];
  rubric: Record<string, WritingRubricLevel>;
}

export interface WritingGradeSummary {
  grade: number;
  topicCount: number;
  skillFocus: string[];
  wordCount: {
    min: number;
    max: number;
  };
}

export async function getWritingGrades(): Promise<WritingGradeSummary[]> {
  try {
    const response = await api.get<{ grades: WritingGradeSummary[] }>(
      '/api/quiz-content/writing/grades',
      { skipAuth: true }
    );

    if (!response.success) {
      logger.error('Get writing grades error:', response.error);
      return [];
    }

    return response.data?.grades ?? [];
  } catch (error) {
    logger.error('Get writing grades error:', error);
    return [];
  }
}

export async function getWritingTopics(grade: number): Promise<GradeWritingData | null> {
  try {
    const response = await api.get<GradeWritingData>(
      `/api/quiz-content/writing/topics/${encodeURIComponent(String(grade))}`
    );

    if (!response.success) {
      logger.error('Get writing topics error:', response.error);
      return null;
    }

    return response.data ?? null;
  } catch (error) {
    logger.error('Get writing topics error:', error);
    return null;
  }
}