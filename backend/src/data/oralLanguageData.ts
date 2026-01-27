/**
 * Backend Quiz Data - Oral Language
 * 
 * Vocabulary, sentence-building, and storytelling questions.
 */

export interface OralLanguageOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface OralLanguageQuestion {
  id: string;
  type: 'vocabulary' | 'sentence-building' | 'storytelling';
  level: number;
  question: string;
  image: string;
  options: OralLanguageOption[];
}

export const oralLanguageQuestions: OralLanguageQuestion[] = [
  // Vocabulary Level 1
  {
    id: 'vocab_1_1',
    type: 'vocabulary',
    level: 1,
    question: 'What is this?',
    image: 'https://media.istockphoto.com/id/1439436349/photo/red-apple-isolated-on-white-background.jpg',
    options: [
      { id: 'a', text: 'Apple', isCorrect: true },
      { id: 'b', text: 'Orange', isCorrect: false },
      { id: 'c', text: 'Banana', isCorrect: false }
    ]
  },
  {
    id: 'vocab_1_2',
    type: 'vocabulary',
    level: 1,
    question: 'What is this?',
    image: 'https://media.istockphoto.com/id/2124102567/photo/orange-fruit-with-leaf.jpg',
    options: [
      { id: 'a', text: 'Orange', isCorrect: true },
      { id: 'b', text: 'Apple', isCorrect: false },
      { id: 'c', text: 'Banana', isCorrect: false }
    ]
  },
  // Sentence Building Level 2
  {
    id: 'sentence_2_1',
    type: 'sentence-building',
    level: 2,
    question: 'What is the boy doing?',
    image: 'https://cdn.pixabay.com/photo/2023/07/18/12/56/little-boy-8134737_1280.jpg',
    options: [
      { id: 'a', text: 'Playing with the dog', isCorrect: false },
      { id: 'b', text: 'Feeding the dog', isCorrect: true },
      { id: 'c', text: 'Walking the dog', isCorrect: false }
    ]
  }
];

/**
 * Get questions by type and level
 */
export const getOralLanguageQuestions = (
  type?: 'vocabulary' | 'sentence-building' | 'storytelling',
  level?: number
): OralLanguageQuestion[] => {
  let filtered = oralLanguageQuestions;
  
  if (type) {
    filtered = filtered.filter(q => q.type === type);
  }
  if (level !== undefined) {
    filtered = filtered.filter(q => q.level === level);
  }
  
  return filtered;
};

/**
 * Get question for frontend (options without isCorrect)
 */
export const getOralLanguageQuestionForFrontend = (questionId: string): {
  id: string;
  type: string;
  level: number;
  question: string;
  image: string;
  options: { id: string; text: string }[];
} | undefined => {
  const question = oralLanguageQuestions.find(q => q.id === questionId);
  if (!question) return undefined;
  
  return {
    id: question.id,
    type: question.type,
    level: question.level,
    question: question.question,
    image: question.image,
    options: question.options.map(o => ({ id: o.id, text: o.text })).sort(() => Math.random() - 0.5),
  };
};

/**
 * Validate answer
 */
export const validateOralLanguageAnswer = (questionId: string, answerId: string): {
  correct: boolean;
  correctAnswer: string;
} => {
  const question = oralLanguageQuestions.find(q => q.id === questionId);
  if (!question) return { correct: false, correctAnswer: '' };
  
  const correctOption = question.options.find(o => o.isCorrect);
  const userOption = question.options.find(o => o.id === answerId);
  
  return {
    correct: userOption?.isCorrect || false,
    correctAnswer: correctOption?.text || '',
  };
};
