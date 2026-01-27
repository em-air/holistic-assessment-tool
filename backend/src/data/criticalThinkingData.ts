/**
 * Backend Quiz Data - Critical Thinking
 * 
 * Critical thinking questions (analogies, categories, etc.)
 */

export interface CriticalThinkingQuestion {
  id: string;
  type: 'analogy' | 'category' | 'sequence' | 'odd-one-out';
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const criticalThinkingQuestions: CriticalThinkingQuestion[] = [
  // Analogies
  {
    id: 'ct-1',
    type: 'analogy',
    question: 'Bird is to fly as fish is to ___',
    options: [
      { id: 'a', text: 'swim', isCorrect: true },
      { id: 'b', text: 'walk', isCorrect: false },
      { id: 'c', text: 'run', isCorrect: false },
      { id: 'd', text: 'jump', isCorrect: false }
    ],
    explanation: 'Birds fly in the air, fish swim in water.',
    difficulty: 'easy'
  },
  {
    id: 'ct-2',
    type: 'analogy',
    question: 'Hot is to cold as day is to ___',
    options: [
      { id: 'a', text: 'night', isCorrect: true },
      { id: 'b', text: 'morning', isCorrect: false },
      { id: 'c', text: 'afternoon', isCorrect: false },
      { id: 'd', text: 'evening', isCorrect: false }
    ],
    explanation: 'Hot and cold are opposites, just like day and night.',
    difficulty: 'easy'
  },
  // Categories
  {
    id: 'ct-3',
    type: 'category',
    question: 'Which group contains only fruits?',
    options: [
      { id: 'a', text: 'Apple, Banana, Carrot', isCorrect: false },
      { id: 'b', text: 'Apple, Banana, Orange', isCorrect: true },
      { id: 'c', text: 'Apple, Lettuce, Orange', isCorrect: false },
      { id: 'd', text: 'Carrot, Banana, Potato', isCorrect: false }
    ],
    explanation: 'Apple, Banana, and Orange are all fruits. Carrot, Lettuce, and Potato are vegetables.',
    difficulty: 'easy'
  },
  // Odd one out
  {
    id: 'ct-4',
    type: 'odd-one-out',
    question: 'Which one does not belong? Dog, Cat, Bird, Chair',
    options: [
      { id: 'a', text: 'Dog', isCorrect: false },
      { id: 'b', text: 'Cat', isCorrect: false },
      { id: 'c', text: 'Bird', isCorrect: false },
      { id: 'd', text: 'Chair', isCorrect: true }
    ],
    explanation: 'Dog, Cat, and Bird are all animals. Chair is furniture.',
    difficulty: 'easy'
  },
  // Sequences
  {
    id: 'ct-5',
    type: 'sequence',
    question: 'What comes next? 2, 4, 6, 8, ___',
    options: [
      { id: 'a', text: '10', isCorrect: true },
      { id: 'b', text: '9', isCorrect: false },
      { id: 'c', text: '12', isCorrect: false },
      { id: 'd', text: '11', isCorrect: false }
    ],
    explanation: 'The pattern adds 2 each time: 2+2=4, 4+2=6, 6+2=8, 8+2=10',
    difficulty: 'easy'
  }
];

/**
 * Get questions by type
 */
export const getCriticalThinkingQuestions = (
  type?: 'analogy' | 'category' | 'sequence' | 'odd-one-out',
  difficulty?: 'easy' | 'medium' | 'hard'
): CriticalThinkingQuestion[] => {
  let filtered = criticalThinkingQuestions;
  
  if (type) filtered = filtered.filter(q => q.type === type);
  if (difficulty) filtered = filtered.filter(q => q.difficulty === difficulty);
  
  return filtered;
};

/**
 * Get question for frontend
 */
export const getCriticalThinkingQuestionForFrontend = (questionId: string): {
  id: string;
  type: string;
  question: string;
  difficulty: string;
  options: { id: string; text: string }[];
} | undefined => {
  const question = criticalThinkingQuestions.find(q => q.id === questionId);
  if (!question) return undefined;
  
  return {
    id: question.id,
    type: question.type,
    question: question.question,
    difficulty: question.difficulty,
    options: question.options.map(o => ({ id: o.id, text: o.text })).sort(() => Math.random() - 0.5),
  };
};

/**
 * Validate answer
 */
export const validateCriticalThinkingAnswer = (questionId: string, answerId: string): {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
} => {
  const question = criticalThinkingQuestions.find(q => q.id === questionId);
  if (!question) return { correct: false, correctAnswer: '', explanation: '' };
  
  const correctOption = question.options.find(o => o.isCorrect);
  const userOption = question.options.find(o => o.id === answerId);
  
  return {
    correct: userOption?.isCorrect || false,
    correctAnswer: correctOption?.text || '',
    explanation: question.explanation || '',
  };
};
