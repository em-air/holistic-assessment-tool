export interface SentenceDifferenceQuestion {
  id: number;
  sentenceA: string;
  sentenceB: string;
  correctAnswer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const sentenceDifferenceQuestions: SentenceDifferenceQuestion[] = [
  {
    id: 1,
    sentenceA: "The cat is sleeping on the bed.",
    sentenceB: "The cat is sleeping on the chair.",
    correctAnswer: "chair",
    difficulty: 'easy'
  },
  {
    id: 2,
    sentenceA: "I like to eat red apples.",
    sentenceB: "I like to eat green apples.",
    correctAnswer: "green",
    difficulty: 'easy'
  },
  {
    id: 3,
    sentenceA: "The dog runs fast in the park.",
    sentenceB: "The dog walks fast in the park.",
    correctAnswer: "walks",
    difficulty: 'easy'
  },
  {
    id: 4,
    sentenceA: "She reads a book every night.",
    sentenceB: "She reads a book every morning.",
    correctAnswer: "morning",
    difficulty: 'easy'
  },
  {
    id: 5,
    sentenceA: "The blue car drives down the street.",
    sentenceB: "The blue car drives down the road.",
    correctAnswer: "road",
    difficulty: 'easy'
  },
  {
    id: 6,
    sentenceA: "My mother bakes cookies in the kitchen.",
    sentenceB: "My father bakes cookies in the kitchen.",
    correctAnswer: "father",
    difficulty: 'medium'
  },
  {
    id: 7,
    sentenceA: "The children play happily in the garden.",
    sentenceB: "The children play quietly in the garden.",
    correctAnswer: "quietly",
    difficulty: 'medium'
  },
  {
    id: 8,
    sentenceA: "We bought fresh flowers from the store.",
    sentenceB: "We bought fresh vegetables from the store.",
    correctAnswer: "vegetables",
    difficulty: 'medium'
  },
  {
    id: 9,
    sentenceA: "The teacher writes on the blackboard clearly.",
    sentenceB: "The teacher writes on the whiteboard clearly.",
    correctAnswer: "whiteboard",
    difficulty: 'medium'
  },
  {
    id: 10,
    sentenceA: "Birds fly south during the winter months.",
    sentenceB: "Birds fly south during the summer months.",
    correctAnswer: "summer",
    difficulty: 'medium'
  },
  {
    id: 11,
    sentenceA: "The scientist conducted experiments in the laboratory carefully.",
    sentenceB: "The scientist conducted experiments in the laboratory successfully.",
    correctAnswer: "successfully",
    difficulty: 'hard'
  },
  {
    id: 12,
    sentenceA: "Students must complete their assignments before tomorrow's deadline.",
    sentenceB: "Students must complete their assignments after tomorrow's deadline.",
    correctAnswer: "after",
    difficulty: 'hard'
  },
  {
    id: 13,
    sentenceA: "The restaurant serves delicious Mediterranean cuisine every evening.",
    sentenceB: "The restaurant serves delicious Italian cuisine every evening.",
    correctAnswer: "Italian",
    difficulty: 'hard'
  },
  {
    id: 14,
    sentenceA: "Professional athletes train rigorously to maintain their physical strength.",
    sentenceB: "Professional athletes train rigorously to maintain their mental strength.",
    correctAnswer: "mental",
    difficulty: 'hard'
  },
  {
    id: 15,
    sentenceA: "The museum exhibits ancient artifacts from various historical periods.",
    sentenceB: "The museum exhibits modern artifacts from various historical periods.",
    correctAnswer: "modern",
    difficulty: 'hard'
  }
];