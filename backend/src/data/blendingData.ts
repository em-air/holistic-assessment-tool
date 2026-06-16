/**
 * Backend Quiz Data - Blending Quiz
 * 
 * Phonics blending questions by grade level.
 * SECURITY: Answers are never sent until after submission.
 */

export interface BlendingQuestion {
  id: number;
  sounds: string[];  // Individual sounds to blend
  word: string;      // This is the ANSWER - never expose before submission
  grade: number;
}

export const blendingQuestions: BlendingQuestion[] = [
  // Grade 1 Questions - Simple CVC words
  { id: 1, sounds: ['/t/', '/a/', '/p/'], word: 'tap', grade: 1 },
  { id: 2, sounds: ['/c/', '/a/', '/t/'], word: 'cat', grade: 1 },
  { id: 3, sounds: ['/d/', '/o/', '/g/'], word: 'dog', grade: 1 },
  { id: 4, sounds: ['/s/', '/u/', '/n/'], word: 'sun', grade: 1 },
  { id: 5, sounds: ['/b/', '/e/', '/d/'], word: 'bed', grade: 1 },
  { id: 6, sounds: ['/m/', '/a/', '/p/'], word: 'map', grade: 1 },
  { id: 7, sounds: ['/r/', '/u/', '/g/'], word: 'rug', grade: 1 },
  { id: 8, sounds: ['/p/', '/i/', '/g/'], word: 'pig', grade: 1 },
  { id: 9, sounds: ['/b/', '/u/', '/s/'], word: 'bus', grade: 1 },
  { id: 10, sounds: ['/h/', '/a/', '/t/'], word: 'hat', grade: 1 },

  // Grade 2 Questions - CCVC and CVCC words
  { id: 11, sounds: ['/sh/', '/o/', '/p/'], word: 'shop', grade: 2 },
  { id: 12, sounds: ['/s/', '/t/', '/o/', '/p/'], word: 'stop', grade: 2 },
  { id: 13, sounds: ['/b/', '/l/', '/u/', '/e/'], word: 'blue', grade: 2 },
  { id: 14, sounds: ['/g/', '/r/', '/a/', '/s/', '/s/'], word: 'grass', grade: 2 },
  { id: 15, sounds: ['/t/', '/r/', '/u/', '/ck/'], word: 'truck', grade: 2 },
  { id: 16, sounds: ['/s/', '/p/', '/e/', '/l/', '/l/'], word: 'spell', grade: 2 },
  { id: 17, sounds: ['/th/', '/i/', '/ng/'], word: 'thing', grade: 2 },
  { id: 18, sounds: ['/wh/', '/e/', '/n/'], word: 'when', grade: 2 },
  { id: 19, sounds: ['/ch/', '/a/', '/i/', '/n/'], word: 'chain', grade: 2 },
  { id: 20, sounds: ['/s/', '/n/', '/a/', '/ck/'], word: 'snack', grade: 2 },

  // Grade 3 Questions - Complex blends and multisyllabic
  { id: 21, sounds: ['/h/', '/ou/', '/s/', '/e/'], word: 'house', grade: 3 },
  { id: 22, sounds: ['/s/', '/t/', '/r/', '/ong/'], word: 'strong', grade: 3 },
  { id: 23, sounds: ['/s/', '/p/', '/r/', '/i/', '/ng/'], word: 'spring', grade: 3 },
  { id: 24, sounds: ['/th/', '/r/', '/ough/'], word: 'through', grade: 3 },
  { id: 25, sounds: ['/s/', '/qu/', '/a/', '/r/', '/e/'], word: 'square', grade: 3 },
  { id: 26, sounds: ['/s/', '/c/', '/r/', '/a/', '/tch/'], word: 'scratch', grade: 3 },
  { id: 27, sounds: ['/f/', '/r/', '/i/', '/ght/'], word: 'fright', grade: 3 },
  { id: 28, sounds: ['/s/', '/p/', '/l/', '/a/', '/sh/'], word: 'splash', grade: 3 },
  { id: 29, sounds: ['/s/', '/t/', '/r/', '/ai/', '/ght/'], word: 'straight', grade: 3 },
  { id: 30, sounds: ['/c/', '/h/', '/a/', '/m/', '/p/', '/ion/'], word: 'champion', grade: 3 }
];

/**
 * Get blending questions for a specific grade
 */
export const getBlendingQuestionsByGrade = (grade: number): BlendingQuestion[] => {
  return blendingQuestions.filter(q => q.grade === grade);
};

/**
 * Get question metadata (without answer) for frontend
 */
export const getBlendingQuestionForFrontend = (questionId: number): {
  id: number;
  sounds: string[];
  grade: number;
} | undefined => {
  const question = blendingQuestions.find(q => q.id === questionId);
  if (!question) return undefined;
  
  // Return without the answer
  return {
    id: question.id,
    sounds: question.sounds,
    grade: question.grade,
  };
};

/**
 * Validate a blending answer
 */
export const validateBlendingAnswer = (questionId: number, answer: string): {
  correct: boolean;
  correctWord: string;
} => {
  const question = blendingQuestions.find(q => q.id === questionId);
  if (!question) {
    return { correct: false, correctWord: '' };
  }
  
  return {
    correct: answer.toLowerCase().trim() === question.word.toLowerCase(),
    correctWord: question.word,
  };
};

/**
 * Get available grades
 */
export const getBlendingGrades = (): { grade: number; questionCount: number }[] => {
  const grades = [1, 2, 3];
  return grades.map(grade => ({
    grade,
    questionCount: blendingQuestions.filter(q => q.grade === grade).length,
  }));
};
