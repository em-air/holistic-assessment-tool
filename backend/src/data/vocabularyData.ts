/**
 * Backend Quiz Data - Vocabulary Matching
 * 
 * Vocabulary words and definitions by level.
 * SECURITY: Correct answers are never exposed until submission.
 */

export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  level: number;
  options: { id: string; text: string; isCorrect: boolean }[];
}

export const vocabularyWords: VocabularyWord[] = [
  // Level 1 - Basic
  {
    id: 'v1-1',
    word: 'happy',
    definition: 'Feeling good or pleased',
    example: 'She was happy to see her friend.',
    level: 1,
    options: [
      { id: 'a', text: 'Feeling good or pleased', isCorrect: true },
      { id: 'b', text: 'Feeling tired or sleepy', isCorrect: false },
      { id: 'c', text: 'Feeling hungry or thirsty', isCorrect: false },
    ]
  },
  {
    id: 'v1-2',
    word: 'big',
    definition: 'Large in size',
    example: 'The elephant is a big animal.',
    level: 1,
    options: [
      { id: 'a', text: 'Small in size', isCorrect: false },
      { id: 'b', text: 'Large in size', isCorrect: true },
      { id: 'c', text: 'Fast moving', isCorrect: false },
    ]
  },
  {
    id: 'v1-3',
    word: 'run',
    definition: 'To move fast on your feet',
    example: 'The dog likes to run in the park.',
    level: 1,
    options: [
      { id: 'a', text: 'To move fast on your feet', isCorrect: true },
      { id: 'b', text: 'To sit very still', isCorrect: false },
      { id: 'c', text: 'To sleep all day', isCorrect: false },
    ]
  },
  // Level 2 - Intermediate
  {
    id: 'v2-1',
    word: 'curious',
    definition: 'Wanting to learn or know more',
    example: 'The curious cat looked at the new toy.',
    level: 2,
    options: [
      { id: 'a', text: 'Feeling scared or afraid', isCorrect: false },
      { id: 'b', text: 'Wanting to learn or know more', isCorrect: true },
      { id: 'c', text: 'Feeling very tired', isCorrect: false },
    ]
  },
  {
    id: 'v2-2',
    word: 'examine',
    definition: 'To look at something carefully',
    example: 'The doctor will examine your ears.',
    level: 2,
    options: [
      { id: 'a', text: 'To throw away', isCorrect: false },
      { id: 'b', text: 'To hide something', isCorrect: false },
      { id: 'c', text: 'To look at something carefully', isCorrect: true },
    ]
  },
  {
    id: 'v2-3',
    word: 'ancient',
    definition: 'Very old, from long ago',
    example: 'The ancient castle was built 500 years ago.',
    level: 2,
    options: [
      { id: 'a', text: 'Brand new', isCorrect: false },
      { id: 'b', text: 'Very old, from long ago', isCorrect: true },
      { id: 'c', text: 'Very small', isCorrect: false },
    ]
  },
  // Level 3 - Advanced
  {
    id: 'v3-1',
    word: 'persevere',
    definition: 'To keep trying even when things are difficult',
    example: 'She had to persevere to learn the hard math problem.',
    level: 3,
    options: [
      { id: 'a', text: 'To keep trying even when things are difficult', isCorrect: true },
      { id: 'b', text: 'To give up quickly', isCorrect: false },
      { id: 'c', text: 'To ask for help immediately', isCorrect: false },
    ]
  },
  {
    id: 'v3-2',
    word: 'magnificent',
    definition: 'Extremely beautiful or impressive',
    example: 'The fireworks display was magnificent.',
    level: 3,
    options: [
      { id: 'a', text: 'Very small and quiet', isCorrect: false },
      { id: 'b', text: 'Boring and uninteresting', isCorrect: false },
      { id: 'c', text: 'Extremely beautiful or impressive', isCorrect: true },
    ]
  },
  {
    id: 'v3-3',
    word: 'hypothesis',
    definition: 'An educated guess that can be tested',
    example: 'The scientist made a hypothesis about the experiment.',
    level: 3,
    options: [
      { id: 'a', text: 'A proven fact', isCorrect: false },
      { id: 'b', text: 'An educated guess that can be tested', isCorrect: true },
      { id: 'c', text: 'A type of machine', isCorrect: false },
    ]
  }
];

/**
 * Get vocabulary words by level
 */
export const getVocabularyByLevel = (level: number): VocabularyWord[] => {
  return vocabularyWords.filter(w => w.level === level);
};

/**
 * Get word for frontend (without correct answer marked)
 */
export const getVocabularyWordForFrontend = (wordId: string): {
  id: string;
  word: string;
  example: string;
  level: number;
  options: { id: string; text: string }[];
} | undefined => {
  const word = vocabularyWords.find(w => w.id === wordId);
  if (!word) return undefined;
  
  // Shuffle and return options without isCorrect flag
  return {
    id: word.id,
    word: word.word,
    example: word.example,
    level: word.level,
    options: word.options
      .map(o => ({ id: o.id, text: o.text }))
      .sort(() => Math.random() - 0.5),
  };
};

/**
 * Validate vocabulary answer
 */
export const validateVocabularyAnswer = (wordId: string, answerId: string): {
  correct: boolean;
  correctDefinition: string;
} => {
  const word = vocabularyWords.find(w => w.id === wordId);
  if (!word) {
    return { correct: false, correctDefinition: '' };
  }
  
  const correctOption = word.options.find(o => o.isCorrect);
  const userOption = word.options.find(o => o.id === answerId);
  
  return {
    correct: userOption?.isCorrect || false,
    correctDefinition: correctOption?.text || word.definition,
  };
};
