import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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

// Comprehensive grade-specific writing rubrics
const GRADE_RUBRICS = {
  1: {
    maxScore: 18,
    criteria: {
      ideas: {
        excellent: "Student writes about a clear topic with 2-3 simple details. Ideas make sense and stick to the topic.",
        proficient: "Student writes about a topic with 1-2 details. Most ideas relate to the topic.",
        developing: "Student has an idea but details are unclear or don't always match the topic.",
        beginning: "Topic is unclear or hard to understand. Few or no supporting details."
      },
      organization: {
        excellent: "Writing has a clear beginning, middle, and end. Ideas are in logical order.",
        proficient: "Writing has most parts (beginning, middle, end) and ideas mostly make sense in order.",
        developing: "Writing has some organization but may be missing a beginning or ending.",
        beginning: "Ideas seem mixed up or don't follow a clear order."
      },
      voice: {
        excellent: "Writing shows personality and the student seems interested in the topic.",
        proficient: "Writing shows some personality or interest in the topic.",
        developing: "Writing shows a little personality but could be more interesting.",
        beginning: "Writing lacks personality or doesn't show interest in the topic."
      },
      wordChoice: {
        excellent: "Student uses interesting words and describes things clearly. Word choice is appropriate.",
        proficient: "Student uses some good describing words and most words are appropriate.",
        developing: "Student uses simple words but they make sense. Some repetition of basic words.",
        beginning: "Student uses very simple or incorrect words. Hard to understand meaning."
      },
      sentenceFluency: {
        excellent: "Sentences are complete and easy to read aloud. Different sentence beginnings.",
        proficient: "Most sentences are complete and readable. Some variety in sentence structure.",
        developing: "Some sentences are complete but may be choppy or all start the same way.",
        beginning: "Many incomplete sentences or sentences that don't make sense."
      },
      conventions: {
        excellent: "Correct spelling of simple words, capital letters, and periods. Very few errors.",
        proficient: "Mostly correct spelling, capitals, and periods. A few minor errors.",
        developing: "Some correct spelling and punctuation, but several errors that don't interfere with meaning.",
        beginning: "Many spelling and punctuation errors that make writing hard to read."
      }
    },
    developmentalExpectations: "Grade 1 students are beginning writers who focus on expressing simple ideas clearly. They should write 2-3 sentences about familiar topics with basic organization and use simple words they know how to spell."
  },
  
  2: {
    maxScore: 18,
    criteria: {
      ideas: {
        excellent: "Clear main idea with 3-4 supporting details. Writing stays focused on the topic throughout.",
        proficient: "Has a main idea with 2-3 supporting details. Mostly stays on topic.",
        developing: "Main idea is somewhat clear with 1-2 details. May wander from topic occasionally.",
        beginning: "Main idea is unclear or hard to identify. Limited or no supporting details."
      },
      organization: {
        excellent: "Clear beginning, middle, and end. Ideas flow logically with smooth transitions.",
        proficient: "Has beginning, middle, and end. Ideas are mostly in logical order.",
        developing: "Some organization present but may lack clear beginning or ending.",
        beginning: "Little organization evident. Ideas presented randomly."
      },
      voice: {
        excellent: "Strong personal voice comes through. Writing is engaging and shows enthusiasm.",
        proficient: "Some personal voice evident. Writing shows interest in the topic.",
        developing: "Occasional glimpses of personal voice. Generally neutral tone.",
        beginning: "Little to no personal voice. Writing lacks engagement."
      },
      wordChoice: {
        excellent: "Uses varied vocabulary and descriptive words. Words are precise and effective.",
        proficient: "Uses some interesting words and descriptive language appropriately.",
        developing: "Uses simple but appropriate words. Some repetition of common words.",
        beginning: "Very limited vocabulary. Overuse of simple, basic words."
      },
      sentenceFluency: {
        excellent: "Sentences flow smoothly with varied beginnings and lengths. Easy to read aloud.",
        proficient: "Most sentences flow well with some variety in structure.",
        developing: "Some sentences flow but may be choppy or repetitive in structure.",
        beginning: "Sentences are choppy or difficult to read smoothly."
      },
      conventions: {
        excellent: "Strong control of spelling, capitalization, and punctuation. Very few errors.",
        proficient: "Good control of basic conventions. Minor errors don't interfere with meaning.",
        developing: "Developing control of conventions. Some errors but meaning is still clear.",
        beginning: "Limited control of conventions. Errors interfere with understanding."
      }
    },
    developmentalExpectations: "Grade 2 students should write multiple sentences (4-6) with clear ideas and basic story structure. They begin to use more descriptive words and show more control over spelling and punctuation."
  },

  3: {
    maxScore: 24,
    criteria: {
      ideas: {
        excellent: "Focused topic with rich details and examples. Ideas are original and well-developed.",
        proficient: "Clear topic with adequate supporting details. Ideas are developed sufficiently.",
        developing: "Topic is identifiable with some details, but needs more development.",
        beginning: "Topic is unclear or lacks adequate supporting details."
      },
      organization: {
        excellent: "Strong organizational structure with clear introduction, body, and conclusion. Smooth transitions.",
        proficient: "Good organization with identifiable introduction, body, and conclusion.",
        developing: "Some organizational structure present but may lack clear transitions.",
        beginning: "Weak organizational structure. Difficult to follow the flow of ideas."
      },
      voice: {
        excellent: "Distinctive voice that connects with the audience. Shows personality and engagement.",
        proficient: "Clear voice that is appropriate for the purpose and audience.",
        developing: "Some evidence of voice but may be inconsistent or unclear.",
        beginning: "Little evidence of voice. Writing lacks personality or engagement."
      },
      wordChoice: {
        excellent: "Rich, varied vocabulary. Words are precise, engaging, and enhance meaning.",
        proficient: "Good word choice with some variety. Words are appropriate and clear.",
        developing: "Adequate word choice but limited variety. Some words may be imprecise.",
        beginning: "Limited vocabulary. Word choice interferes with clarity and meaning."
      },
      sentenceFluency: {
        excellent: "Sentences are varied in length and structure. Writing has natural rhythm and flow.",
        proficient: "Sentences flow well with some variety in structure and length.",
        developing: "Some sentence variety but may be choppy or repetitive in places.",
        beginning: "Little sentence variety. Writing is choppy and difficult to read smoothly."
      },
      conventions: {
        excellent: "Excellent control of spelling, grammar, punctuation, and capitalization.",
        proficient: "Good control of conventions. Minor errors don't distract from meaning.",
        developing: "Developing control of conventions. Some errors but meaning is clear.",
        beginning: "Limited control of conventions. Errors interfere with communication."
      }
    },
    developmentalExpectations: "Grade 3 students should write well-organized paragraphs with clear topic sentences and supporting details. They begin to use more complex sentence structures and show increasing control over writing conventions."
  },

  4: {
    maxScore: 24,
    criteria: {
      ideas: {
        excellent: "Well-focused topic with rich, relevant details. Ideas are insightful and well-elaborated.",
        proficient: "Clear focus with good supporting details. Ideas are adequately developed.",
        developing: "Generally focused with some supporting details, but needs more elaboration.",
        beginning: "Lacks focus or adequate development of ideas."
      },
      organization: {
        excellent: "Strong organizational pattern with effective introduction, well-sequenced body, and satisfying conclusion.",
        proficient: "Clear organizational pattern with introduction, body, and conclusion.",
        developing: "Some organizational pattern evident but may lack clear structure in places.",
        beginning: "Weak organizational pattern. Structure is unclear or ineffective."
      },
      voice: {
        excellent: "Strong, engaging voice appropriate for audience and purpose. Shows genuine involvement.",
        proficient: "Clear voice that connects with the audience and suits the purpose.",
        developing: "Some voice evident but may be inconsistent or not fully developed.",
        beginning: "Limited voice. Writing lacks engagement or connection with audience."
      },
      wordChoice: {
        excellent: "Sophisticated vocabulary used effectively. Words are precise, varied, and enhance meaning.",
        proficient: "Good vocabulary with effective word choice. Words are clear and appropriate.",
        developing: "Adequate vocabulary with some effective word choices.",
        beginning: "Limited vocabulary that interferes with clarity and effectiveness."
      },
      sentenceFluency: {
        excellent: "Excellent sentence variety and rhythm. Writing flows smoothly and is easy to read.",
        proficient: "Good sentence variety with smooth flow and natural rhythm.",
        developing: "Some sentence variety but flow may be uneven in places.",
        beginning: "Limited sentence variety. Writing is choppy or difficult to follow."
      },
      conventions: {
        excellent: "Excellent control of all writing conventions. Errors are rare and don't interfere.",
        proficient: "Good control of conventions. Few errors that don't distract from meaning.",
        developing: "Adequate control of most conventions with some distracting errors.",
        beginning: "Limited control of conventions. Errors interfere with communication."
      }
    },
    developmentalExpectations: "Grade 4 students should write multi-paragraph compositions with clear main ideas and supporting details. They demonstrate increasing sophistication in word choice and sentence structure while maintaining good control of writing conventions."
  },

  5: {
    maxScore: 30,
    criteria: {
      ideas: {
        excellent: "Exceptionally clear focus with rich, relevant, and insightful details. Ideas are original and thoroughly developed.",
        proficient: "Clear, focused topic with relevant supporting details and good development.",
        developing: "Generally focused with adequate details, but may need more depth or relevance.",
        beginning: "Lacks clear focus or sufficient development of ideas."
      },
      organization: {
        excellent: "Sophisticated organizational structure with compelling introduction, well-developed body, and effective conclusion.",
        proficient: "Clear organizational structure with effective introduction, body, and conclusion.",
        developing: "Generally well-organized but may have weak transitions or unclear structure.",
        beginning: "Poor organization that interferes with understanding."
      },
      voice: {
        excellent: "Distinctive, engaging voice that strongly connects with audience. Shows genuine passion and involvement.",
        proficient: "Clear voice appropriate for audience and purpose. Shows engagement with topic.",
        developing: "Some voice evident but may not consistently connect with audience.",
        beginning: "Limited or inappropriate voice for the audience and purpose."
      },
      wordChoice: {
        excellent: "Exceptional vocabulary that is precise, varied, and powerful. Enhances meaning significantly.",
        proficient: "Strong vocabulary with effective, precise word choices that enhance meaning.",
        developing: "Adequate vocabulary with some effective word choices.",
        beginning: "Limited vocabulary that interferes with clarity and impact."
      },
      sentenceFluency: {
        excellent: "Exceptional sentence variety and rhythm. Writing flows beautifully and is engaging to read.",
        proficient: "Good sentence variety with smooth, natural flow and rhythm.",
        developing: "Some sentence variety but flow may be inconsistent.",
        beginning: "Limited sentence variety with choppy or awkward flow."
      },
      conventions: {
        excellent: "Exceptional control of all writing conventions enhances readability.",
        proficient: "Strong control of conventions with few minor errors.",
        developing: "Good control of most conventions with some noticeable errors.",
        beginning: "Limited control of conventions that interferes with communication."
      }
    },
    developmentalExpectations: "Grade 5 students should write well-organized, multi-paragraph compositions with sophisticated ideas and varied sentence structures. They should demonstrate strong control of writing conventions and begin to develop a more mature writing voice."
  },

  6: {
    maxScore: 30,
    criteria: {
      ideas: {
        excellent: "Highly focused with exceptionally rich, relevant details. Ideas are insightful, original, and thoroughly developed.",
        proficient: "Well-focused with strong supporting details and good development of ideas.",
        developing: "Generally focused with adequate supporting details but may lack depth.",
        beginning: "Lacks clear focus or adequate development. Ideas may be superficial."
      },
      organization: {
        excellent: "Sophisticated organizational structure that enhances the message. Seamless transitions and compelling flow.",
        proficient: "Clear, logical organization with effective transitions and good flow.",
        developing: "Generally well-organized but may have some unclear transitions or weak spots.",
        beginning: "Poor organization that makes the writing difficult to follow."
      },
      voice: {
        excellent: "Powerful, distinctive voice that captivates the audience. Shows deep engagement and authenticity.",
        proficient: "Strong voice that effectively connects with the audience and purpose.",
        developing: "Some voice evident but may not consistently engage the audience.",
        beginning: "Limited voice that doesn't connect well with audience or purpose."
      },
      wordChoice: {
        excellent: "Exceptional vocabulary that is precise, sophisticated, and enhances meaning powerfully.",
        proficient: "Strong vocabulary with precise, effective word choices that enhance meaning.",
        developing: "Good vocabulary with generally effective word choices.",
        beginning: "Limited vocabulary that interferes with clarity and effectiveness."
      },
      sentenceFluency: {
        excellent: "Exceptional sentence craftsmanship with sophisticated variety and beautiful rhythm.",
        proficient: "Strong sentence variety with smooth, engaging flow and good rhythm.",
        developing: "Good sentence variety but flow may be inconsistent in places.",
        beginning: "Limited sentence variety with choppy or monotonous flow."
      },
      conventions: {
        excellent: "Exceptional command of all writing conventions enhances readability and professionalism.",
        proficient: "Strong command of conventions with very few minor errors.",
        developing: "Good command of most conventions with some errors that don't interfere significantly.",
        beginning: "Limited command of conventions that interferes with communication."
      }
    },
    developmentalExpectations: "Grade 6 students should write sophisticated, well-organized compositions with mature ideas and varied, complex sentence structures. They should demonstrate strong control of all writing conventions and develop a distinctive writing voice."
  },

  7: {
    maxScore: 36,
    criteria: {
      ideas: {
        excellent: "Exceptional focus with profound, insightful ideas. Rich, relevant details that demonstrate deep understanding.",
        proficient: "Strong focus with well-developed, insightful ideas and relevant supporting details.",
        developing: "Generally focused with adequate ideas and details, but may lack depth or insight.",
        beginning: "Lacks clear focus or depth. Ideas are superficial or inadequately developed."
      },
      organization: {
        excellent: "Sophisticated, seamless organization that powerfully enhances the message and engages the reader.",
        proficient: "Clear, logical organization with effective structure and smooth transitions.",
        developing: "Generally well-organized but may have some structural weaknesses or unclear transitions.",
        beginning: "Poor organization that significantly interferes with understanding and readability."
      },
      voice: {
        excellent: "Compelling, authentic voice that powerfully connects with audience. Shows passion and deep engagement.",
        proficient: "Strong, clear voice that effectively engages the audience and suits the purpose.",
        developing: "Some voice evident but may not consistently engage or may be inappropriate for purpose.",
        beginning: "Limited or inappropriate voice that fails to connect with audience."
      },
      wordChoice: {
        excellent: "Exceptional vocabulary that is precise, sophisticated, and powerfully enhances meaning and tone.",
        proficient: "Strong vocabulary with precise, effective choices that enhance meaning and clarity.",
        developing: "Good vocabulary with generally appropriate choices, though may lack precision or sophistication.",
        beginning: "Limited vocabulary that interferes with clarity, precision, and effectiveness."
      },
      sentenceFluency: {
        excellent: "Exceptional sentence craftsmanship with sophisticated variety, beautiful rhythm, and engaging flow.",
        proficient: "Strong sentence variety with smooth flow, good rhythm, and engaging readability.",
        developing: "Good sentence structure with some variety, but flow may be inconsistent.",
        beginning: "Limited sentence variety with choppy, monotonous, or awkward flow."
      },
      conventions: {
        excellent: "Flawless command of all writing conventions enhances readability and demonstrates sophistication.",
        proficient: "Strong command of conventions with very few errors that don't interfere with meaning.",
        developing: "Good command of most conventions with some errors that may occasionally distract.",
        beginning: "Limited command of conventions with frequent errors that interfere with communication."
      }
    },
    developmentalExpectations: "Grade 7 students should write sophisticated, multi-paragraph compositions with complex ideas, varied sentence structures, and mature vocabulary. They should demonstrate mastery of writing conventions and develop a strong, authentic voice appropriate for different audiences and purposes."
  },

  8: {
    maxScore: 36,
    criteria: {
      ideas: {
        excellent: "Exceptional focus with profound, original insights. Rich, compelling details that demonstrate sophisticated understanding.",
        proficient: "Strong focus with well-developed, thoughtful ideas and compelling supporting details.",
        developing: "Generally focused with adequate development, but may lack originality or sophisticated insight.",
        beginning: "Lacks clear focus or sophistication. Ideas are basic or inadequately developed."
      },
      organization: {
        excellent: "Masterful organization that powerfully enhances meaning. Seamless structure with sophisticated transitions.",
        proficient: "Clear, logical organization with effective structure and smooth, purposeful transitions.",
        developing: "Generally well-organized but may lack sophisticated structure or have some unclear transitions.",
        beginning: "Poor organization that significantly interferes with meaning and readability."
      },
      voice: {
        excellent: "Powerful, distinctive voice that captivates and persuades. Shows sophisticated awareness of audience.",
        proficient: "Strong, engaging voice that effectively connects with audience and achieves purpose.",
        developing: "Some voice evident but may not consistently engage audience or achieve full purpose.",
        beginning: "Limited voice that fails to engage audience or achieve the intended purpose."
      },
      wordChoice: {
        excellent: "Exceptional vocabulary that is precise, sophisticated, and powerfully enhances meaning, tone, and impact.",
        proficient: "Strong, varied vocabulary with precise choices that effectively enhance meaning and tone.",
        developing: "Good vocabulary with generally effective choices, but may lack consistent precision or sophistication.",
        beginning: "Limited vocabulary that interferes with clarity, precision, and overall effectiveness."
      },
      sentenceFluency: {
        excellent: "Masterful sentence craftsmanship with sophisticated variety, beautiful rhythm, and compelling flow.",
        proficient: "Strong sentence variety with smooth flow, engaging rhythm, and excellent readability.",
        developing: "Good sentence structure with adequate variety, but flow may occasionally be inconsistent.",
        beginning: "Limited sentence variety with choppy, repetitive, or awkward construction."
      },
      conventions: {
        excellent: "Flawless command of all conventions enhances sophistication and demonstrates mastery.",
        proficient: "Strong command of all conventions with rare minor errors that don't affect meaning.",
        developing: "Good command of most conventions with some errors that may occasionally distract.",
        beginning: "Limited command of conventions with errors that interfere with communication and readability."
      }
    },
    developmentalExpectations: "Grade 8 students should write sophisticated, well-crafted compositions with complex, original ideas and mature expression. They should demonstrate mastery of all writing conventions and develop a powerful, authentic voice that effectively engages different audiences for various purposes."
  }
};

export async function evaluateWritingWithGemini(
  studentResponse: string,
  grade: number,
  prompt: string
): Promise<WritingEvaluation> {
  try {
    const rubric = GRADE_RUBRICS[grade as keyof typeof GRADE_RUBRICS];
    
    if (!rubric) {
      throw new Error(`No rubric found for grade ${grade}`);
    }

    const evaluationPrompt = `
You are an expert elementary and middle school writing teacher evaluating a Grade ${grade} student's writing response. Please provide a comprehensive, constructive evaluation.

WRITING PROMPT: "${prompt}"

STUDENT RESPONSE: "${studentResponse}"

GRADE ${grade} DEVELOPMENTAL EXPECTATIONS:
${rubric.developmentalExpectations}

EVALUATION CRITERIA (Each scored 0-6 points):

1. IDEAS & CONTENT (0-6 points):
   - Excellent (5-6): ${rubric.criteria.ideas.excellent}
   - Proficient (3-4): ${rubric.criteria.ideas.proficient}  
   - Developing (1-2): ${rubric.criteria.ideas.developing}
   - Beginning (0): ${rubric.criteria.ideas.beginning}

2. ORGANIZATION (0-6 points):
   - Excellent (5-6): ${rubric.criteria.organization.excellent}
   - Proficient (3-4): ${rubric.criteria.organization.proficient}
   - Developing (1-2): ${rubric.criteria.organization.developing}
   - Beginning (0): ${rubric.criteria.organization.beginning}

3. VOICE & STYLE (0-6 points):
   - Excellent (5-6): ${rubric.criteria.voice.excellent}
   - Proficient (3-4): ${rubric.criteria.voice.proficient}
   - Developing (1-2): ${rubric.criteria.voice.developing}
   - Beginning (0): ${rubric.criteria.voice.beginning}

4. WORD CHOICE (0-6 points):
   - Excellent (5-6): ${rubric.criteria.wordChoice.excellent}
   - Proficient (3-4): ${rubric.criteria.wordChoice.proficient}
   - Developing (1-2): ${rubric.criteria.wordChoice.developing}
   - Beginning (0): ${rubric.criteria.wordChoice.beginning}

5. SENTENCE FLUENCY (0-6 points):
   - Excellent (5-6): ${rubric.criteria.sentenceFluency.excellent}
   - Proficient (3-4): ${rubric.criteria.sentenceFluency.proficient}
   - Developing (1-2): ${rubric.criteria.sentenceFluency.developing}
   - Beginning (0): ${rubric.criteria.sentenceFluency.beginning}

6. CONVENTIONS (0-6 points):
   - Excellent (5-6): ${rubric.criteria.conventions.excellent}
   - Proficient (3-4): ${rubric.criteria.conventions.proficient}
   - Developing (1-2): ${rubric.criteria.conventions.developing}
   - Beginning (0): ${rubric.criteria.conventions.beginning}

INSTRUCTIONS:
- Evaluate this Grade ${grade} student's writing with encouragement and constructive feedback
- Consider the student's developmental stage and grade-level expectations
- Be specific about strengths and areas for growth
- Provide actionable suggestions for improvement
- Use encouraging, supportive language appropriate for a ${grade === 1 ? 'first grader' : `${grade}th grader`}

Please respond with a JSON object in this exact format:

{
  "overallScore": [total points earned],
  "maxScore": ${rubric.maxScore},
  "grade": "${grade}",
  "feedback": "[2-3 sentences of overall encouraging feedback]",
  "strengths": ["[specific strength 1]", "[specific strength 2]", "[specific strength 3]"],
  "areasForImprovement": ["[specific area 1]", "[specific area 2]"],
  "scores": {
    "ideas": [0-6 score],
    "organization": [0-6 score], 
    "voice": [0-6 score],
    "wordChoice": [0-6 score],
    "sentenceFluency": [0-6 score],
    "conventions": [0-6 score]
  },
  "suggestions": ["[specific, actionable suggestion 1]", "[specific, actionable suggestion 2]", "[specific, actionable suggestion 3]"]
}
`;

    const result = await model.generateContent(evaluationPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response');
    }
    
    const evaluation: WritingEvaluation = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    if (!evaluation.scores || !evaluation.feedback || !evaluation.strengths) {
      throw new Error('Invalid evaluation structure received from Gemini');
    }
    
    return evaluation;
    
  } catch (error) {
    console.error('Error evaluating writing with Gemini:', error);
    
    // Fallback evaluation
    return {
      overallScore: 15,
      maxScore: GRADE_RUBRICS[grade as keyof typeof GRADE_RUBRICS]?.maxScore || 24,
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
}