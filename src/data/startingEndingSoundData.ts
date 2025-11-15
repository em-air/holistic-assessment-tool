export interface SoundQuestion {
  id: number;
  word: string;
  imageUrl: string;
  audioUrl: string;
  grade: number;
  difficulty: 'easy' | 'medium' | 'hard';
  beginningSound: string;
  endingSound: string;
  category: 'cvc' | 'cvcc' | 'blend' | 'digraph';
}

export interface QuestionData {
  question: SoundQuestion;
  questionType: 'beginning' | 'ending';
  correctAnswer: string;
  options: string[];
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timePerQuestion: number[];
  totalTime: number;
  percentage: number;
  grade: number;
}

// Grade 1-2 words (CVC and simple CVCC)
export const grade12Words: SoundQuestion[] = [
  {
    id: 1,
    word: 'cat',
    imageUrl: 'https://cdn.pixabay.com/photo/2018/01/03/19/17/cat-3059075_1280.jpg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 1,
    difficulty: 'easy',
    beginningSound: 'c',
    endingSound: 't',
    category: 'cvc'
  },
  {
    id: 2,
    word: 'dog',
    imageUrl: 'https://cdn.pixabay.com/photo/2018/03/18/18/06/australian-shepherd-3237735_1280.jpg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 1,
    difficulty: 'easy',
    beginningSound: 'd',
    endingSound: 'g',
    category: 'cvc'
  },
  {
    id: 3,
    word: 'fish',
    imageUrl: 'https://cdn.pixabay.com/photo/2016/12/31/21/22/discus-fish-1943755_1280.jpg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 1,
    difficulty: 'easy',
    beginningSound: 'f',
    endingSound: 'sh',
    category: 'cvcc'
  },
  {
    id: 4,
    word: 'hat',
    imageUrl: 'https://cdn.pixabay.com/photo/2016/09/16/19/28/hat-1674950_1280.png',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 1,
    difficulty: 'easy',
    beginningSound: 'h',
    endingSound: 't',
    category: 'cvc'
  },
  {
    id: 5,
    word: 'sun',
    imageUrl: 'https://cdn.pixabay.com/photo/2014/03/26/17/50/sunset-298850_1280.jpg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 2,
    difficulty: 'easy',
    beginningSound: 's',
    endingSound: 'n',
    category: 'cvc'
  },
  {
    id: 6,
    word: 'map',
    imageUrl: 'https://cdn.pixabay.com/photo/2017/06/14/08/20/map-of-the-world-2401458_1280.jpg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 2,
    difficulty: 'easy',
    beginningSound: 'm',
    endingSound: 'p',
    category: 'cvc'
  },
  {
    id: 7,
    word: 'ring',
    imageUrl: 'https://cdn.pixabay.com/photo/2018/05/21/04/35/ring-3417372_1280.png',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 2,
    difficulty: 'medium',
    beginningSound: 'r',
    endingSound: 'ng',
    category: 'cvcc'
  },
  {
    id: 8,
    word: 'shell',
    imageUrl: 'https://images.pexels.com/photos/157517/pexels-photo-157517.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 2,
    difficulty: 'medium',
    beginningSound: 'sh',
    endingSound: 'l',
    category: 'cvcc'
  },
  {
    id: 9,
    word: 'lamp',
    imageUrl: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 2,
    difficulty: 'medium',
    beginningSound: 'l',
    endingSound: 'mp',
    category: 'cvcc'
  },
  {
    id: 10,
    word: 'hand',
    imageUrl: 'https://images.pexels.com/photos/4870970/pexels-photo-4870970.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 2,
    difficulty: 'medium',
    beginningSound: 'h',
    endingSound: 'nd',
    category: 'cvcc'
  }
];

// Grade 3-4 words (Complex blends and digraphs)
export const grade34Words: SoundQuestion[] = [
  {
    id: 11,
    word: 'elephant',
    imageUrl: 'https://images.pexels.com/photos/1054655/pexels-photo-1054655.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 3,
    difficulty: 'medium',
    beginningSound: 'e',
    endingSound: 't',
    category: 'blend'
  },
  {
    id: 12,
    word: 'branch',
    imageUrl: 'https://images.pexels.com/photos/754738/pexels-photo-754738.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 3,
    difficulty: 'hard',
    beginningSound: 'br',
    endingSound: 'ch',
    category: 'blend'
  },
  {
    id: 13,
    word: 'shadow',
    imageUrl: 'https://images.pexels.com/photos/4850290/pexels-photo-4850290.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 3,
    difficulty: 'hard',
    beginningSound: 'sh',
    endingSound: 'ow',
    category: 'digraph'
  },
  {
    id: 14,
    word: 'pillow',
    imageUrl: 'https://images.pexels.com/photos/1248583/pexels-photo-1248583.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 3,
    difficulty: 'medium',
    beginningSound: 'p',
    endingSound: 'ow',
    category: 'blend'
  },
  {
    id: 15,
    word: 'tractor',
    imageUrl: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 4,
    difficulty: 'hard',
    beginningSound: 'tr',
    endingSound: 'r',
    category: 'blend'
  },
  {
    id: 16,
    word: 'dolphin',
    imageUrl: 'https://images.pexels.com/photos/225869/pexels-photo-225869.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 4,
    difficulty: 'hard',
    beginningSound: 'd',
    endingSound: 'n',
    category: 'digraph'
  },
  {
    id: 17,
    word: 'sandwich',
    imageUrl: 'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 4,
    difficulty: 'hard',
    beginningSound: 's',
    endingSound: 'ch',
    category: 'digraph'
  },
  {
    id: 18,
    word: 'string',
    imageUrl: 'https://images.pexels.com/photos/845263/pexels-photo-845263.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 4,
    difficulty: 'hard',
    beginningSound: 'str',
    endingSound: 'ng',
    category: 'blend'
  },
  {
    id: 19,
    word: 'chicken',
    imageUrl: 'https://images.pexels.com/photos/1769279/pexels-photo-1769279.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 3,
    difficulty: 'hard',
    beginningSound: 'ch',
    endingSound: 'n',
    category: 'digraph'
  },
  {
    id: 20,
    word: 'butterfly',
    imageUrl: 'https://images.pexels.com/photos/66877/butterfly-exotic-south-america-amazon-66877.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    grade: 4,
    difficulty: 'hard',
    beginningSound: 'b',
    endingSound: 'y',
    category: 'blend'
  }
];

// Common sound distractors for generating incorrect options
export const commonSounds = [
  // Single consonants
  'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z',
  // Vowels
  'a', 'e', 'i', 'o', 'u',
  // Digraphs
  'sh', 'ch', 'th', 'wh', 'ph', 'ck',
  // Blends
  'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw',
  // Ending sounds
  'ng', 'nk', 'mp', 'nd', 'nt', 'st', 'sk', 'sp', 'lk', 'lp', 'lt', 'ft', 'pt'
];

export const getAllWords = (): SoundQuestion[] => {
  return [...grade12Words, ...grade34Words];
};

export const getWordsByGrade = (grade: number): SoundQuestion[] => {
  if (grade <= 2) {
    return grade12Words;
  } else {
    return grade34Words;
  }
};