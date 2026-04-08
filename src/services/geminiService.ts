/**
 * Gemini Service - Frontend client that calls the backend AI API
 * 
 * SECURITY: All Gemini API calls are now routed through the backend
 * to keep API keys secure and not exposed in client-side code.
 */

import { supabase } from '../supabase-client';
import logger from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface WritingEvaluation {
  overallScore: number;
  maxScore: number;
  grade: string;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  scores: {
    ideas: number;
    organization: number;
    voice: number;
    wordChoice: number;
    sentenceFluency: number;
    conventions: number;
  };
  suggestions: string[];
}

/**
 * Get the current user's access token for API calls
 */
async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Evaluate a student's writing using Gemini AI via the backend
 * 
 * @param studentResponse - The student's written response
 * @param grade - The student's grade level (1-8)
 * @param prompt - The writing prompt that was given
 * @returns WritingEvaluation object with scores and feedback
 */
export async function evaluateWritingWithGemini(
  studentResponse: string,
  grade: number,
  prompt: string
): Promise<WritingEvaluation> {
  try {
    const token = await getAccessToken();
    if (!token) {
      logger.warn('User not authenticated for writing evaluation');
      return getFallbackEvaluation(grade);
    }

    const response = await fetch(`${API_BASE_URL}/api/ai/evaluate-writing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        studentResponse,
        grade,
        prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('Writing evaluation API error:', errorData);
      return getFallbackEvaluation(grade);
    }

    const data = await response.json();
    
    if (data.success && data.evaluation) {
      if (data.fallback) {
        logger.warn('AI evaluation returned fallback — GEMINI_API_KEY may not be configured on the server');
      }
      return data.evaluation;
    }

    return getFallbackEvaluation(grade);
  } catch (error) {
    logger.error('Error evaluating writing:', error);
    return getFallbackEvaluation(grade);
  }
}

/**
 * Get max score for a grade level
 */
function getMaxScoreForGrade(_grade: number): number {
  return 36;
}

/**
 * Fallback evaluation when the AI service is unavailable
 */
function getFallbackEvaluation(grade: number): WritingEvaluation {
  return {
    overallScore: 15,
    maxScore: getMaxScoreForGrade(grade),
    grade: grade.toString(),
    feedback: "Thank you for your writing! I'm having trouble analyzing it right now, but keep practicing your writing skills.",
    strengths: ["You completed the writing task", "You shared your ideas", "You tried your best"],
    areasForImprovement: ["Keep practicing writing", "Focus on clear ideas"],
    scores: {
      ideas: 3,
      organization: 3,
      voice: 2,
      wordChoice: 2,
      sentenceFluency: 3,
      conventions: 2
    },
    suggestions: [
      "Keep writing every day to improve your skills",
      "Read your work out loud to check if it makes sense",
      "Ask a teacher or parent to help you with spelling and punctuation"
    ]
  };
}
