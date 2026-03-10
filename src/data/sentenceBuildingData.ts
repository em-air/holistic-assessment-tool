// Sentence Building Quiz Data - 4 Grade Levels with increasing difficulty
// Grade 1: Simple identification ("Who/What is in the picture?")
// Grade 2: Actions and descriptions ("What is happening?")
// Grade 3: Cause/effect and forming complete sentences
// Grade 4: Complex sentences, inference, and paragraph-level comprehension

export interface SentenceBuildingOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface SentenceBuildingQuestion {
  id: string;
  level: number;
  question: string;
  image: string;
  options: SentenceBuildingOption[];
  feedback: {
    correct: string;
    incorrect: string;
  };
}

export interface SentenceBuildingGradeData {
  grade: number;
  title: string;
  description: string;
  difficulty: string;
  color: string;
  questions: SentenceBuildingQuestion[];
}

// ─── Grade 1: Simple Identification (original quiz questions) ───────
// These are the pre-existing sentence building questions
export const grade1Questions: SentenceBuildingQuestion[] = [
  {
    id: 'g1_sb_1',
    level: 1,
    question: 'Who is in the picture?',
    image: 'https://cdn.pixabay.com/photo/2019/10/18/19/50/boy-and-dog-in-field-4560039_1280.jpg',
    options: [
      { id: 'a', text: 'A boy', isCorrect: true },
      { id: 'b', text: 'A girl', isCorrect: false },
      { id: 'c', text: 'A man', isCorrect: false }
    ],
    feedback: {
      correct: 'Right! There is a boy in the picture.',
      incorrect: 'Look carefully - there is a boy in the picture!'
    }
  },
  {
    id: 'g1_sb_2',
    level: 1,
    question: 'What is the boy doing?',
    image: 'https://cdn.pixabay.com/photo/2023/07/18/12/56/little-boy-8134737_1280.jpg',
    options: [
      { id: 'a', text: 'Playing with the dog', isCorrect: false },
      { id: 'b', text: 'Feeding the dog', isCorrect: true },
      { id: 'c', text: 'Walking the dog', isCorrect: false }
    ],
    feedback: {
      correct: 'Excellent! The boy is feeding the dog.',
      incorrect: 'The boy is giving food to the dog!'
    }
  },
  {
    id: 'g1_sb_3',
    level: 1,
    question: 'Why do you think he is doing that?',
    image: 'https://cdn.pixabay.com/photo/2018/06/12/15/08/question-mark-3470783_1280.jpg',
    options: [
      { id: 'a', text: 'Because the dog is hungry', isCorrect: true },
      { id: 'b', text: 'Because he is bored', isCorrect: false },
      { id: 'c', text: 'Because it is raining', isCorrect: false }
    ],
    feedback: {
      correct: 'Great thinking! Dogs need food when they are hungry.',
      incorrect: 'Think about why animals need food!'
    }
  }
];

// ─── Grade 2: Actions and Descriptions ──────────────────────────────
// Describing what people/animals are doing using simple sentences
export const grade2Questions: SentenceBuildingQuestion[] = [
  {
    id: 'g2_sb_1',
    level: 2,
    question: 'Which sentence best describes the picture?',
    image: 'https://cdn.pixabay.com/photo/2016/11/29/03/36/child-1867463_1280.jpg',
    options: [
      { id: 'a', text: 'The child is sleeping.', isCorrect: false },
      { id: 'b', text: 'The child is reading a book.', isCorrect: true },
      { id: 'c', text: 'The child is eating lunch.', isCorrect: false }
    ],
    feedback: {
      correct: 'That\'s right! The child is reading a book.',
      incorrect: 'Look closely — the child has a book and is reading it!'
    }
  },
  {
    id: 'g2_sb_2',
    level: 2,
    question: 'What are the children doing?',
    image: 'https://cdn.pixabay.com/photo/2016/11/22/19/25/children-1850141_1280.jpg',
    options: [
      { id: 'a', text: 'They are running in a race.', isCorrect: false },
      { id: 'b', text: 'They are playing together.', isCorrect: true },
      { id: 'c', text: 'They are going to school.', isCorrect: false }
    ],
    feedback: {
      correct: 'Good job! The children are playing together.',
      incorrect: 'The children are having fun and playing together!'
    }
  },
  {
    id: 'g2_sb_3',
    level: 2,
    question: 'Pick the sentence that tells what is happening.',
    image: 'https://cdn.pixabay.com/photo/2017/06/24/02/56/art-2437545_1280.jpg',
    options: [
      { id: 'a', text: 'Someone is painting a picture.', isCorrect: true },
      { id: 'b', text: 'Someone is writing a letter.', isCorrect: false },
      { id: 'c', text: 'Someone is cooking food.', isCorrect: false }
    ],
    feedback: {
      correct: 'Correct! Someone is painting a picture.',
      incorrect: 'Look at the brushes and colours — someone is painting!'
    }
  },
  {
    id: 'g2_sb_4',
    level: 2,
    question: 'What is the dog doing in this picture?',
    image: 'https://cdn.pixabay.com/photo/2020/03/31/19/20/dog-4988985_1280.jpg',
    options: [
      { id: 'a', text: 'The dog is eating.', isCorrect: false },
      { id: 'b', text: 'The dog is sleeping.', isCorrect: false },
      { id: 'c', text: 'The dog is running.', isCorrect: true }
    ],
    feedback: {
      correct: 'Yes! The dog is running fast.',
      incorrect: 'Watch the dog — it is running!'
    }
  },
  {
    id: 'g2_sb_5',
    level: 2,
    question: 'Choose the sentence that matches the picture.',
    image: 'https://cdn.pixabay.com/photo/2017/02/15/00/48/father-and-son-2067399_1280.jpg',
    options: [
      { id: 'a', text: 'The father is cooking dinner.', isCorrect: false },
      { id: 'b', text: 'The father and son are spending time together.', isCorrect: true },
      { id: 'c', text: 'The boy is doing homework.', isCorrect: false }
    ],
    feedback: {
      correct: 'That\'s right! The father and son are together.',
      incorrect: 'Look at the picture — the father and son are spending time together!'
    }
  }
];

// ─── Grade 3: Cause/Effect and Complete Sentences ───────────────────
// Reasoning about why things happen, predictions, and proper sentence structure
export const grade3Questions: SentenceBuildingQuestion[] = [
  {
    id: 'g3_sb_1',
    level: 3,
    question: 'What will probably happen next?',
    image: 'https://cdn.pixabay.com/photo/2016/10/16/16/33/rain-1745486_1280.jpg',
    options: [
      { id: 'a', text: 'The children will go swimming.', isCorrect: false },
      { id: 'b', text: 'The children will play outside.', isCorrect: false },
      { id: 'c', text: 'The children will need an umbrella.', isCorrect: true }
    ],
    feedback: {
      correct: 'Good reasoning! It is raining, so they will need an umbrella.',
      incorrect: 'It is raining — they will need an umbrella to stay dry!'
    }
  },
  {
    id: 'g3_sb_2',
    level: 3,
    question: 'Which sentence uses the correct word order?',
    image: 'https://cdn.pixabay.com/photo/2017/08/07/14/02/cat-2604214_1280.jpg',
    options: [
      { id: 'a', text: 'On the fence the cat sat.', isCorrect: false },
      { id: 'b', text: 'The cat sat on the fence and watched the birds.', isCorrect: true },
      { id: 'c', text: 'Sat the cat fence on.', isCorrect: false }
    ],
    feedback: {
      correct: 'Perfect! "The cat sat on the fence and watched the birds" is a well-formed sentence.',
      incorrect: 'A good sentence starts with the subject: "The cat sat on the fence and watched the birds."'
    }
  },
  {
    id: 'g3_sb_3',
    level: 3,
    question: 'How does the girl in the picture feel? Pick the best sentence.',
    image: 'https://cdn.pixabay.com/photo/2017/06/23/04/49/sad-2433730_1280.jpg',
    options: [
      { id: 'a', text: 'The girl feels excited because she won a prize.', isCorrect: false },
      { id: 'b', text: 'The girl feels sad because something upset her.', isCorrect: true },
      { id: 'c', text: 'The girl feels sleepy because it is late.', isCorrect: false }
    ],
    feedback: {
      correct: 'Good observation! The girl looks sad because something upset her.',
      incorrect: 'Look at her expression — she looks sad because something upset her.'
    }
  },
  {
    id: 'g3_sb_4',
    level: 3,
    question: 'Why is the woman smiling in this picture?',
    image: 'https://cdn.pixabay.com/photo/2015/01/08/18/30/entrepreneur-593371_1280.jpg',
    options: [
      { id: 'a', text: 'Because she lost her phone.', isCorrect: false },
      { id: 'b', text: 'Because she finished her work successfully.', isCorrect: true },
      { id: 'c', text: 'Because she is tired from running.', isCorrect: false }
    ],
    feedback: {
      correct: 'Nice! She looks happy because she finished her work.',
      incorrect: 'Look at her face — she is smiling because she finished her work!'
    }
  },
  {
    id: 'g3_sb_5',
    level: 3,
    question: 'Choose the best sentence: The bird is sitting on the branch. It starts to sing.',
    image: 'https://cdn.pixabay.com/photo/2018/08/22/22/51/bird-3624167_1280.jpg',
    options: [
      { id: 'a', text: 'The bird sat on the branch and started to sing.', isCorrect: true },
      { id: 'b', text: 'Started to sing the bird on the branch.', isCorrect: false },
      { id: 'c', text: 'The branch had a bird and it sing.', isCorrect: false }
    ],
    feedback: {
      correct: 'Well done! You combined the two ideas into one clear sentence.',
      incorrect: 'The best way to combine them is: "The bird sat on the branch and started to sing."'
    }
  }
];

// ─── Grade 4: Complex Sentences and Inference ───────────────────────
// Multi-clause sentences, inference from context, figurative language, paragraph comprehension
export const grade4Questions: SentenceBuildingQuestion[] = [
  {
    id: 'g4_sb_1',
    level: 4,
    question: 'Which sentence best combines these two ideas? "The boy was tired." "He kept running."',
    image: 'https://cdn.pixabay.com/photo/2015/01/26/22/40/child-613199_1280.jpg',
    options: [
      { id: 'a', text: 'The boy was tired and he kept running.', isCorrect: false },
      { id: 'b', text: 'Although the boy was tired, he kept running.', isCorrect: true },
      { id: 'c', text: 'The boy was tired so he kept running.', isCorrect: false }
    ],
    feedback: {
      correct: 'Excellent! "Although" shows contrast — he was tired but didn\'t stop.',
      incorrect: '"Although the boy was tired, he kept running" best combines the contrasting ideas.'
    }
  },
  {
    id: 'g4_sb_2',
    level: 4,
    question: 'Read the passage: "The sky turned dark. The wind started blowing. Leaves flew everywhere." What is the best concluding sentence?',
    image: 'https://cdn.pixabay.com/photo/2018/01/30/17/47/dramatic-3119548_1280.jpg',
    options: [
      { id: 'a', text: 'A big storm was coming.', isCorrect: true },
      { id: 'b', text: 'It was time for breakfast.', isCorrect: false },
      { id: 'c', text: 'The children went swimming.', isCorrect: false }
    ],
    feedback: {
      correct: 'Great inference! Dark sky, wind, and flying leaves mean a storm is coming.',
      incorrect: 'Think about what dark skies, wind, and flying leaves usually mean — a storm!'
    }
  },
  {
    id: 'g4_sb_3',
    level: 4,
    question: 'Which sentence uses a simile correctly?',
    image: 'https://cdn.pixabay.com/photo/2014/11/21/17/19/cheetah-540624_1280.jpg',
    options: [
      { id: 'a', text: 'The cheetah runs very fast in the jungle.', isCorrect: false },
      { id: 'b', text: 'The cheetah is as fast as lightning when it chases its prey.', isCorrect: true },
      { id: 'c', text: 'The cheetah is a fast animal that lives in Africa.', isCorrect: false }
    ],
    feedback: {
      correct: 'Well done! "As fast as lightning" is a simile that compares the cheetah\'s speed to lightning.',
      incorrect: 'A simile compares two things using "as" or "like." "As fast as lightning" is the simile here.'
    }
  },
  {
    id: 'g4_sb_4',
    level: 4,
    question: 'Rearrange these words into the best sentence: "the / garden / carefully / the / watered / farmer / his"',
    image: 'https://cdn.pixabay.com/photo/2016/08/11/08/04/vegetables-1584999_1280.jpg',
    options: [
      { id: 'a', text: 'The farmer his garden carefully watered.', isCorrect: false },
      { id: 'b', text: 'Carefully the garden watered his farmer.', isCorrect: false },
      { id: 'c', text: 'The farmer carefully watered his garden.', isCorrect: true }
    ],
    feedback: {
      correct: 'Perfect! "The farmer carefully watered his garden" follows correct sentence structure.',
      incorrect: 'The correct order is: "The farmer carefully watered his garden."'
    }
  },
  {
    id: 'g4_sb_5',
    level: 4,
    question: '"Maria studied hard for weeks. On the day of the test, she smiled as she read the questions." What can you infer?',
    image: 'https://cdn.pixabay.com/photo/2015/11/19/21/14/glasses-1052023_1280.jpg',
    options: [
      { id: 'a', text: 'Maria did not understand the test.', isCorrect: false },
      { id: 'b', text: 'Maria felt confident because she was well prepared.', isCorrect: true },
      { id: 'c', text: 'Maria was nervous about the test.', isCorrect: false }
    ],
    feedback: {
      correct: 'Excellent inference! She studied hard and smiled — she felt confident and prepared.',
      incorrect: 'She studied hard and smiled when reading the questions — this means she felt confident!'
    }
  }
];

// ─── Grade-level metadata ───────────────────────────────────────────

export const sentenceBuildingGrades: SentenceBuildingGradeData[] = [
  {
    grade: 1,
    title: 'Grade 1',
    description: 'Identify and describe what you see in pictures',
    difficulty: 'Beginner',
    color: 'from-green-400 to-blue-500',
    questions: grade1Questions,
  },
  {
    grade: 2,
    title: 'Grade 2',
    description: 'Describe actions and events using simple sentences',
    difficulty: 'Easy',
    color: 'from-blue-400 to-purple-500',
    questions: grade2Questions,
  },
  {
    grade: 3,
    title: 'Grade 3',
    description: 'Explain cause and effect and build complete sentences',
    difficulty: 'Medium',
    color: 'from-purple-400 to-pink-500',
    questions: grade3Questions,
  },
  {
    grade: 4,
    title: 'Grade 4',
    description: 'Combine ideas, make inferences, and use complex sentences',
    difficulty: 'Advanced',
    color: 'from-pink-400 to-red-500',
    questions: grade4Questions,
  },
];

// ─── Helper functions ───────────────────────────────────────────────

export const getQuestionsForGrade = (grade: number): SentenceBuildingQuestion[] => {
  switch (grade) {
    case 1: return grade1Questions;
    case 2: return grade2Questions;
    case 3: return grade3Questions;
    case 4: return grade4Questions;
    default: return grade1Questions;
  }
};

export const getGradeData = (grade: number): SentenceBuildingGradeData | undefined => {
  return sentenceBuildingGrades.find(g => g.grade === grade);
};
