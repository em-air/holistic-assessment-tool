export interface SpellingWord {
  id: string;
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

export interface GradeSpellingData {
  grade: number;
  words: SpellingWord[];
  description: string;
}

export const spellingData: GradeSpellingData[] = [
  {
    grade: 1,
    description: "Simple 3-4 letter words with basic phonics",
    words: [
      { id: "g1-1", word: "cat", difficulty: "easy" },
      { id: "g1-2", word: "dog", difficulty: "easy" },
      { id: "g1-3", word: "sun", difficulty: "easy" },
      { id: "g1-4", word: "hat", difficulty: "easy" },
      { id: "g1-5", word: "run", difficulty: "easy" },
      { id: "g1-6", word: "big", difficulty: "easy" },
      { id: "g1-7", word: "red", difficulty: "easy" },
      { id: "g1-8", word: "fun", difficulty: "easy" },
      { id: "g1-9", word: "top", difficulty: "easy" },
      { id: "g1-10", word: "bag", difficulty: "easy" }
    ]
  },
  {
    grade: 2,
    description: "4-5 letter words with simple consonant blends",
    words: [
      { id: "g2-1", word: "play", difficulty: "easy" },
      { id: "g2-2", word: "tree", difficulty: "easy" },
      { id: "g2-3", word: "frog", difficulty: "easy" },
      { id: "g2-4", word: "stop", difficulty: "easy" },
      { id: "g2-5", word: "jump", difficulty: "medium" },
      { id: "g2-6", word: "swim", difficulty: "easy" },
      { id: "g2-7", word: "green", difficulty: "medium" },
      { id: "g2-8", word: "chair", difficulty: "medium" },
      { id: "g2-9", word: "milk", difficulty: "easy" },
      { id: "g2-10", word: "book", difficulty: "easy" }
    ]
  },
  {
    grade: 3,
    description: "5-6 letter words with digraphs and basic suffixes",
    words: [
      { id: "g3-1", word: "happy", difficulty: "easy" },
      { id: "g3-2", word: "school", difficulty: "medium" },
      { id: "g3-3", word: "friend", difficulty: "medium" },
      { id: "g3-4", word: "yellow", difficulty: "medium" },
      { id: "g3-5", word: "jumped", difficulty: "medium" },
      { id: "g3-6", word: "sister", difficulty: "medium" },
      { id: "g3-7", word: "mother", difficulty: "medium" },
      { id: "g3-8", word: "animal", difficulty: "medium" },
      { id: "g3-9", word: "garden", difficulty: "medium" },
      { id: "g3-10", word: "window", difficulty: "medium" }
    ]
  },
  {
    grade: 4,
    description: "6-7 letter words with more complex patterns",
    words: [
      { id: "g4-1", word: "wonderful", difficulty: "medium" },
      { id: "g4-2", word: "birthday", difficulty: "medium" },
      { id: "g4-3", word: "elephant", difficulty: "medium" },
      { id: "g4-4", word: "question", difficulty: "hard" },
      { id: "g4-5", word: "because", difficulty: "hard" },
      { id: "g4-6", word: "different", difficulty: "hard" },
      { id: "g4-7", word: "remember", difficulty: "hard" },
      { id: "g4-8", word: "together", difficulty: "hard" },
      { id: "g4-9", word: "children", difficulty: "medium" },
      { id: "g4-10", word: "favorite", difficulty: "hard" }
    ]
  },
  {
    grade: 5,
    description: "7-8 letter words with prefixes and suffixes",
    words: [
      { id: "g5-1", word: "beautiful", difficulty: "hard" },
      { id: "g5-2", word: "important", difficulty: "hard" },
      { id: "g5-3", word: "dangerous", difficulty: "hard" },
      { id: "g5-4", word: "exciting", difficulty: "medium" },
      { id: "g5-5", word: "surprise", difficulty: "hard" },
      { id: "g5-6", word: "excellent", difficulty: "hard" },
      { id: "g5-7", word: "computer", difficulty: "medium" },
      { id: "g5-8", word: "magazine", difficulty: "hard" },
      { id: "g5-9", word: "library", difficulty: "medium" },
      { id: "g5-10", word: "vacation", difficulty: "medium" }
    ]
  },
  {
    grade: 6,
    description: "8-9 letter words with advanced patterns",
    words: [
      { id: "g6-1", word: "knowledge", difficulty: "hard" },
      { id: "g6-2", word: "necessary", difficulty: "hard" },
      { id: "g6-3", word: "character", difficulty: "hard" },
      { id: "g6-4", word: "adventure", difficulty: "hard" },
      { id: "g6-5", word: "dictionary", difficulty: "hard" },
      { id: "g6-6", word: "environment", difficulty: "hard" },
      { id: "g6-7", word: "government", difficulty: "hard" },
      { id: "g6-8", word: "photograph", difficulty: "hard" },
      { id: "g6-9", word: "immediately", difficulty: "hard" },
      { id: "g6-10", word: "successful", difficulty: "hard" }
    ]
  },
  {
    grade: 7,
    description: "9-10 letter words with complex spelling patterns",
    words: [
      { id: "g7-1", word: "responsibility", difficulty: "hard" },
      { id: "g7-2", word: "independent", difficulty: "hard" },
      { id: "g7-3", word: "opportunity", difficulty: "hard" },
      { id: "g7-4", word: "Mediterranean", difficulty: "hard" },
      { id: "g7-5", word: "appreciation", difficulty: "hard" },
      { id: "g7-6", word: "administration", difficulty: "hard" },
      { id: "g7-7", word: "professional", difficulty: "hard" },
      { id: "g7-8", word: "temperature", difficulty: "hard" },
      { id: "g7-9", word: "mathematics", difficulty: "hard" },
      { id: "g7-10", word: "encyclopedia", difficulty: "hard" }
    ]
  },
  {
    grade: 8,
    description: "Advanced vocabulary with challenging spelling patterns",
    words: [
      { id: "g8-1", word: "extraordinary", difficulty: "hard" },
      { id: "g8-2", word: "sophisticated", difficulty: "hard" },
      { id: "g8-3", word: "psychological", difficulty: "hard" },
      { id: "g8-4", word: "entrepreneur", difficulty: "hard" },
      { id: "g8-5", word: "parliamentary", difficulty: "hard" },
      { id: "g8-6", word: "comprehension", difficulty: "hard" },
      { id: "g8-7", word: "distinguished", difficulty: "hard" },
      { id: "g8-8", word: "approximately", difficulty: "hard" },
      { id: "g8-9", word: "conscientious", difficulty: "hard" },
      { id: "g8-10", word: "concentration", difficulty: "hard" }
    ]
  }
];

export const getWordsByGrade = (grade: number): SpellingWord[] => {
  const gradeData = spellingData.find(g => g.grade === grade);
  return gradeData ? gradeData.words : [];
};

export const getGradeDescription = (grade: number): string => {
  const gradeData = spellingData.find(g => g.grade === grade);
  return gradeData ? gradeData.description : "";
};