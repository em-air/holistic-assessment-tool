/**
 * Assessment API - Frontend client for assessment generation
 * 
 * SECURITY: All Gemini API calls are now routed through the backend
 * to keep API keys secure and not exposed in client-side code.
 */

import { supabase } from '../supabase-client';
import logger from './logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AssessmentRequest {
  grade: number;
  curriculum: string;
  subject: string;
  difficulty: 'easy' | 'intermediate' | 'hard';
  duration: number;
  topics: string[];
  includeAnswerKey: boolean;
}

interface AssessmentResponse {
  success: boolean;
  assessment: string;
  error?: string;
}

/**
 * Get the current user's access token for API calls
 */
async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Generate an assessment using Gemini AI via the backend
 */
export const generateAssessmentWithGemini = async (request: AssessmentRequest): Promise<AssessmentResponse> => {
  try {
    const token = await getAccessToken();
    if (!token) {
      return {
        success: false,
        assessment: '',
        error: 'Please sign in to generate assessments.',
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/ai/generate-assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('Assessment generation API error:', errorData);
      return {
        success: false,
        assessment: '',
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const data = await response.json();
    
    if (data.success && data.assessment) {
      return {
        success: true,
        assessment: data.assessment,
      };
    }

    return {
      success: false,
      assessment: '',
      error: data.error || 'Failed to generate assessment',
    };
  } catch (error) {
    logger.error('Error generating assessment:', error);
    return {
      success: false,
      assessment: '',
      error: error instanceof Error ? error.message : 'Failed to generate assessment',
    };
  }
};

/**
 * Mock function as fallback for testing without backend
 */
export const generateMockAssessment = (request: AssessmentRequest): Promise<AssessmentResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockAssessment = `# Grade ${request.grade} ${request.subject} Assessment
**Curriculum:** ${request.curriculum}
**Difficulty:** ${request.difficulty}
**Duration:** ${request.duration} minutes
**Topics:** ${request.topics.join(', ')}

## Section A: Multiple Choice (10 points)
1. Which of the following represents the number 45 in expanded form?
   a) 4 + 5
   b) 40 + 5
   c) 4 × 5
   d) 45 × 1

2. What is the value of 7 × 8?
   a) 54
   b) 56
   c) 58
   d) 60

3. Complete the pattern: 2, 4, 6, 8, __, __
   a) 10, 12
   b) 9, 10
   c) 12, 14
   d) 16, 18

## Section B: Short Answer (15 points)
1. Solve: 234 + 167 = ?

2. Round 3,847 to the nearest hundred.

3. If a rectangle has a length of 12 cm and width of 8 cm, what is its area?

## Section C: Problem Solving (25 points)
1. Sarah has 24 stickers. She wants to share them equally among 6 friends. How many stickers will each friend get? Show your work.

2. A rectangular garden is 8 meters long and 5 meters wide. What is the perimeter of the garden? Explain your answer.

3. In a class of 30 students, 18 students like math and 12 students like science. If 8 students like both subjects, how many students like neither subject?

${request.includeAnswerKey ? `
## Answer Key

**Section A:**
1. b) 40 + 5
2. b) 56  
3. a) 10, 12

**Section B:**
1. 401
2. 3,800
3. 96 square cm

**Section C:**
1. 4 stickers each friend (24 ÷ 6 = 4)
2. 26 meters (Perimeter = 2 × (length + width) = 2 × (8 + 5) = 2 × 13 = 26)
3. 8 students like neither (Total - (Math only + Science only + Both) = 30 - (10 + 4 + 8) = 8)
` : ''}`;

      resolve({
        success: true,
        assessment: mockAssessment,
      });
    }, 2000);
  });
};

export default { generateAssessmentWithGemini, generateMockAssessment };
