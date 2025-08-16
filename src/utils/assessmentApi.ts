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

// Gemini API integration
export const generateAssessmentWithGemini = async (request: AssessmentRequest): Promise<AssessmentResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      assessment: '',
      error: 'Gemini API key not found. Please check your environment variables.',
    };
  }

  try {
    const prompt = `Create a ${request.difficulty} test for grade ${request.grade} (${request.curriculum} curriculum) for ${request.subject}.
Duration: ${request.duration} minutes
Topics: ${request.topics.length ? request.topics.join(', ') : 'All grade-level topics'}

Please create a comprehensive assessment with the following structure:
- Multiple choice questions (3-5 questions)
- Short answer questions (2-4 questions) 
- Problem solving questions (2-3 questions)
- Clear section headers
- Appropriate difficulty for grade ${request.grade}
- Professional formatting

${request.includeAnswerKey ? 'Include a complete answer key with explanations at the end.' : 'Do not include an answer key.'}

Format the response as markdown with clear section headers.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return {
        success: true,
        assessment: data.candidates[0].content.parts[0].text,
      };
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error generating assessment with Gemini:', error);
    return {
      success: false,
      assessment: '',
      error: error instanceof Error ? error.message : 'Failed to generate assessment',
    };
  }
};

// Keep the mock function as fallback
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
