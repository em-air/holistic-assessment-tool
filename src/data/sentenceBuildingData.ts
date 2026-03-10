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
// Describing what people/animals are doing — requires choosing between similar-sounding actions
export const grade2Questions: SentenceBuildingQuestion[] = [
  {
    id: 'g2_sb_1',
    level: 2,
    question: 'Which sentence best describes what the child is doing and where?',
    image: 'https://cdn.pixabay.com/photo/2016/11/29/03/36/child-1867463_1280.jpg',
    options: [
      { id: 'a', text: 'The child is resting in the living room.', isCorrect: false },
      { id: 'b', text: 'The child is quietly reading a book indoors.', isCorrect: true },
      { id: 'c', text: 'The child is looking at pictures in a magazine.', isCorrect: false },
      { id: 'd', text: 'The child is writing in a notebook.', isCorrect: false }
    ],
    feedback: {
      correct: 'That\'s right! The child is quietly reading a book.',
      incorrect: 'Look closely — the child is holding a book and reading it, not just looking at pictures!'
    }
  },
  {
    id: 'g2_sb_2',
    level: 2,
    question: 'Pick the sentence that best tells what the children are doing and how they feel.',
    image: 'https://cdn.pixabay.com/photo/2016/11/22/19/25/children-1850141_1280.jpg',
    options: [
      { id: 'a', text: 'The children are racing each other to win.', isCorrect: false },
      { id: 'b', text: 'The children are happily playing together outside.', isCorrect: true },
      { id: 'c', text: 'The children are walking to school with their bags.', isCorrect: false },
      { id: 'd', text: 'The children are waiting for their parents.', isCorrect: false }
    ],
    feedback: {
      correct: 'Good job! The children are happily playing together outside.',
      incorrect: 'Notice their expressions — they look happy and they are playing, not racing or waiting!'
    }
  },
  {
    id: 'g2_sb_3',
    level: 2,
    question: 'Choose the sentence that tells both what is happening and what tools are being used.',
    image: 'https://cdn.pixabay.com/photo/2017/06/24/02/56/art-2437545_1280.jpg',
    options: [
      { id: 'a', text: 'Someone is drawing with a pencil on paper.', isCorrect: false },
      { id: 'b', text: 'Someone is painting a picture using brushes and colours.', isCorrect: true },
      { id: 'c', text: 'Someone is colouring in a colouring book.', isCorrect: false },
      { id: 'd', text: 'Someone is making a craft with glue.', isCorrect: false }
    ],
    feedback: {
      correct: 'Correct! They are painting with brushes and colours, not just drawing.',
      incorrect: 'Look at the brushes and paint — this is painting, not drawing or colouring!'
    }
  },
  {
    id: 'g2_sb_4',
    level: 2,
    question: 'Which sentence describes both what the dog is doing and where?',
    image: 'https://cdn.pixabay.com/photo/2020/03/31/19/20/dog-4988985_1280.jpg',
    options: [
      { id: 'a', text: 'The dog is playing fetch in the garden.', isCorrect: false },
      { id: 'b', text: 'The dog is walking slowly on the path.', isCorrect: false },
      { id: 'c', text: 'The dog is running quickly across the ground.', isCorrect: true },
      { id: 'd', text: 'The dog is jumping over a fence.', isCorrect: false }
    ],
    feedback: {
      correct: 'Yes! The dog is running quickly — not walking or jumping.',
      incorrect: 'Look at the dog\'s legs and speed — it is running quickly, not walking or jumping!'
    }
  },
  {
    id: 'g2_sb_5',
    level: 2,
    question: 'Which sentence best describes what is happening between the two people?',
    image: 'https://cdn.pixabay.com/photo/2017/02/15/00/48/father-and-son-2067399_1280.jpg',
    options: [
      { id: 'a', text: 'The man is teaching the boy a lesson.', isCorrect: false },
      { id: 'b', text: 'The father and son are enjoying time together.', isCorrect: true },
      { id: 'c', text: 'The boy is talking to a stranger.', isCorrect: false },
      { id: 'd', text: 'The father is scolding the boy.', isCorrect: false }
    ],
    feedback: {
      correct: 'That\'s right! The father and son are enjoying time together.',
      incorrect: 'Look at their expressions — they both look happy, so they are enjoying time together!'
    }
  }
];

// ─── Grade 3: Cause/Effect and Complete Sentences ───────────────────
// Reasoning about why things happen, predictions, combining sentences, and proper structure
export const grade3Questions: SentenceBuildingQuestion[] = [
  {
    id: 'g3_sb_1',
    level: 3,
    question: 'Look at the picture. What will most likely happen next, and why?',
    image: 'https://cdn.pixabay.com/photo/2016/10/16/16/33/rain-1745486_1280.jpg',
    options: [
      { id: 'a', text: 'The children will go swimming because they love water.', isCorrect: false },
      { id: 'b', text: 'The children will keep playing because rain is fun.', isCorrect: false },
      { id: 'c', text: 'The children will go inside or find an umbrella because it is raining.', isCorrect: true },
      { id: 'd', text: 'The children will water the garden since it needs rain.', isCorrect: false }
    ],
    feedback: {
      correct: 'Good reasoning! Rain means they need shelter or an umbrella.',
      incorrect: 'When it rains, people usually go inside or use an umbrella to stay dry!'
    }
  },
  {
    id: 'g3_sb_2',
    level: 3,
    question: 'Which sentence has the correct structure and gives the most detail?',
    image: 'https://cdn.pixabay.com/photo/2017/08/07/14/02/cat-2604214_1280.jpg',
    options: [
      { id: 'a', text: 'On the wooden fence, sat the cat quietly.', isCorrect: false },
      { id: 'b', text: 'The cat sat quietly on the fence while it watched the birds fly by.', isCorrect: true },
      { id: 'c', text: 'Sat the cat on fence and birds watched.', isCorrect: false },
      { id: 'd', text: 'The fence had a cat and the birds was flying.', isCorrect: false }
    ],
    feedback: {
      correct: 'Perfect! This sentence has correct structure, detail, and proper tense.',
      incorrect: 'The best sentence uses correct order and grammar: "The cat sat quietly on the fence while it watched the birds fly by."'
    }
  },
  {
    id: 'g3_sb_3',
    level: 3,
    question: 'Look at the girl\'s face. Which sentence best explains both how she feels and a possible reason?',
    image: 'https://cdn.pixabay.com/photo/2017/06/23/04/49/sad-2433730_1280.jpg',
    options: [
      { id: 'a', text: 'The girl feels bored because she has nothing to do.', isCorrect: false },
      { id: 'b', text: 'The girl looks upset because something made her feel sad.', isCorrect: true },
      { id: 'c', text: 'The girl feels tired because she stayed up too late.', isCorrect: false },
      { id: 'd', text: 'The girl is angry because someone took her toy.', isCorrect: false }
    ],
    feedback: {
      correct: 'Good observation! Her expression shows sadness, not boredom or tiredness.',
      incorrect: 'Look at her eyes and mouth — she looks upset and sad, which is different from being bored, tired, or angry.'
    }
  },
  {
    id: 'g3_sb_4',
    level: 3,
    question: 'The woman is smiling at her desk. Which sentence gives the best reason using "because"?',
    image: 'https://cdn.pixabay.com/photo/2015/01/08/18/30/entrepreneur-593371_1280.jpg',
    options: [
      { id: 'a', text: 'The woman is smiling because she is at her desk.', isCorrect: false },
      { id: 'b', text: 'The woman feels proud because she completed an important task.', isCorrect: true },
      { id: 'c', text: 'The woman is happy because the weather is nice today.', isCorrect: false },
      { id: 'd', text: 'The woman is laughing because someone told her a joke.', isCorrect: false }
    ],
    feedback: {
      correct: 'Nice! She is at her desk and looks satisfied — she completed her work.',
      incorrect: 'She is at her desk looking satisfied — the best reason is that she completed an important task, not just that she is sitting there.'
    }
  },
  {
    id: 'g3_sb_5',
    level: 3,
    question: 'Combine these two ideas into one correct sentence: "The bird is sitting on the branch." "It begins to sing a beautiful song."',
    image: 'https://cdn.pixabay.com/photo/2018/08/22/22/51/bird-3624167_1280.jpg',
    options: [
      { id: 'a', text: 'The bird sat on the branch and began to sing a beautiful song.', isCorrect: true },
      { id: 'b', text: 'Sitting on the branch, began singing a beautiful song the bird.', isCorrect: false },
      { id: 'c', text: 'The branch had a bird and it begin to sing beautiful.', isCorrect: false },
      { id: 'd', text: 'A beautiful song was sang by the bird on the branch sitting.', isCorrect: false }
    ],
    feedback: {
      correct: 'Well done! You chose the sentence that correctly combines both ideas with proper grammar.',
      incorrect: 'The correct combination is: "The bird sat on the branch and began to sing a beautiful song."'
    }
  }
];

// ─── Grade 4: Complex Sentences and Inference ───────────────────────
// Multi-clause sentences, inference, figurative language, paragraph comprehension, tricky distractors
export const grade4Questions: SentenceBuildingQuestion[] = [
  {
    id: 'g4_sb_1',
    level: 4,
    question: 'Which sentence best combines these contrasting ideas? "The boy was exhausted from practice." "He refused to stop running."',
    image: 'https://cdn.pixabay.com/photo/2015/01/26/22/40/child-613199_1280.jpg',
    options: [
      { id: 'a', text: 'The boy was exhausted from practice and he refused to stop running.', isCorrect: false },
      { id: 'b', text: 'Even though the boy was exhausted from practice, he refused to stop running.', isCorrect: true },
      { id: 'c', text: 'The boy was exhausted from practice, so he refused to stop running.', isCorrect: false },
      { id: 'd', text: 'Because the boy was exhausted from practice, he refused to stop running.', isCorrect: false }
    ],
    feedback: {
      correct: 'Excellent! "Even though" correctly shows that the two ideas contrast — exhaustion versus determination.',
      incorrect: '"So" and "because" show cause-and-effect, but these ideas contrast. "Even though" is the right connector for opposing ideas.'
    }
  },
  {
    id: 'g4_sb_2',
    level: 4,
    question: 'Read the passage: "The sky turned dark grey. The wind picked up speed and howled through the trees. Leaves and small branches flew across the road." Which concluding sentence fits best and uses the most precise language?',
    image: 'https://cdn.pixabay.com/photo/2018/01/30/17/47/dramatic-3119548_1280.jpg',
    options: [
      { id: 'a', text: 'It was getting a bit windy outside.', isCorrect: false },
      { id: 'b', text: 'A severe storm was approaching the area quickly.', isCorrect: true },
      { id: 'c', text: 'The weather was going to change soon.', isCorrect: false },
      { id: 'd', text: 'It looked like it might rain later in the afternoon.', isCorrect: false }
    ],
    feedback: {
      correct: 'Great inference! The strong details (howling wind, flying branches) point to a severe storm, not just a light change in weather.',
      incorrect: 'The passage describes intense conditions — howling wind and flying branches mean a severe storm, not just "a bit windy" or "might rain."'
    }
  },
  {
    id: 'g4_sb_3',
    level: 4,
    question: 'Which sentence contains a simile, and which contains a metaphor? Pick the one that uses a simile.',
    image: 'https://cdn.pixabay.com/photo/2014/11/21/17/19/cheetah-540624_1280.jpg',
    options: [
      { id: 'a', text: 'The cheetah was a bolt of lightning streaking across the savanna.', isCorrect: false },
      { id: 'b', text: 'The cheetah moved like a flash of lightning as it chased its prey across the plains.', isCorrect: true },
      { id: 'c', text: 'The cheetah is the fastest land animal and can reach incredible speeds.', isCorrect: false },
      { id: 'd', text: 'Lightning struck as the cheetah raced across the open field.', isCorrect: false }
    ],
    feedback: {
      correct: 'Well done! "Like a flash of lightning" uses "like" to compare — that\'s a simile. Option A is a metaphor ("was a bolt of lightning").',
      incorrect: 'A simile uses "like" or "as" to compare. "Moved like a flash of lightning" is a simile. "Was a bolt of lightning" is a metaphor — it says the cheetah IS lightning.'
    }
  },
  {
    id: 'g4_sb_4',
    level: 4,
    question: 'Rearrange these words into the best sentence: "every / the / his / morning / watered / carefully / farmer / vegetables / before / sunrise"',
    image: 'https://cdn.pixabay.com/photo/2016/08/11/08/04/vegetables-1584999_1280.jpg',
    options: [
      { id: 'a', text: 'Every morning the farmer watered carefully his vegetables before sunrise.', isCorrect: false },
      { id: 'b', text: 'The farmer carefully watered his vegetables every morning before sunrise.', isCorrect: true },
      { id: 'c', text: 'Before sunrise every morning carefully the farmer his vegetables watered.', isCorrect: false },
      { id: 'd', text: 'Every morning before sunrise his vegetables the farmer carefully watered.', isCorrect: false }
    ],
    feedback: {
      correct: 'Perfect! This sentence places the subject, adverb, verb, object, and time phrases in correct English order.',
      incorrect: 'The correct order is: "The farmer carefully watered his vegetables every morning before sunrise." The adverb "carefully" goes right before the verb.'
    }
  },
  {
    id: 'g4_sb_5',
    level: 4,
    question: '"Maria had studied hard for weeks. On the day of the test, she smiled as she read the questions. But when she reached the last page, her smile faded." What can you infer?',
    image: 'https://cdn.pixabay.com/photo/2015/11/19/21/14/glasses-1052023_1280.jpg',
    options: [
      { id: 'a', text: 'Maria was confident throughout the entire test.', isCorrect: false },
      { id: 'b', text: 'Maria found the last section surprising or difficult even though she had prepared well.', isCorrect: true },
      { id: 'c', text: 'Maria did not study hard enough for the test.', isCorrect: false },
      { id: 'd', text: 'Maria was nervous from the very beginning of the test.', isCorrect: false }
    ],
    feedback: {
      correct: 'Excellent inference! She was confident at first (smiled) but the last page changed that (smile faded) — something unexpected appeared.',
      incorrect: 'She smiled at first (confident), but her smile faded on the last page. This means something on the last page was surprising or difficult — not that she was nervous the whole time.'
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
