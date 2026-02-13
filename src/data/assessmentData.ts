import { AssessmentCategory } from '../types';

export const assessmentCategories: AssessmentCategory[] = [
  {
    id: 'mind',
    title: 'Cognition',
    description: 'Assess memory, focus, comprehension, and critical thinking.',
    color: 'mind',
    subcategories: [
      {
        id: 'attention',
        title: 'Attention/Memory',
        color: 'bg-purple-500',
        questions : [
  // Focusing (1–6)
  {
    id: 1,
    subscale: "Focusing",
    question: "I can keep my mind on my homework.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: false
  },
  {
    id: 2,
    subscale: "Focusing",
    question: "I get easily distracted when I'm doing something important.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: true
  },
  {
    id: 3,
    subscale: "Focusing",
    question: "I can concentrate even when something fun is happening around me.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: false
  },
  {
    id: 4,
    subscale: "Focusing",
    question: "It is hard for me to pay attention for long.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: true
  },
  {
    id: 5,
    subscale: "Focusing",
    question: "I keep working on something until it’s finished.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: false
  },
  {
    id: 6,
    subscale: "Focusing",
    question: "I get bored and stop trying.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: true
  },

  // Shifting (7–13)
  {
    id: 7,
    subscale: "Shifting",
    question: "I can stop thinking about something that’s bothering me.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: false
  },
  {
    id: 8,
    subscale: "Shifting",
    question: "I can easily change from one activity to another.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: false
  },
  {
    id: 9,
    subscale: "Shifting",
    question: "If something bad happens, I can think about something else.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: false
  },
  {
    id: 10,
    subscale: "Shifting",
    question: "I have a hard time moving on when something upsets me.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: true
  },
  {
    id: 11,
    subscale: "Shifting",
    question: "I can forget about something even if it made me sad.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: false
  },
  {
    id: 12,
    subscale: "Shifting",
    question: "I can change what I’m doing easily if I need to.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: false
  },
  {
    id: 13,
    subscale: "Shifting",
    question: "It’s hard for me to stop thinking about something once I start.",
    type: "rating",
    options: [1, 2, 3, 4, 5],
    reverse: true
  }
],

      },
      {
        id: 'learning-style',
        title: 'Learning Style',
        color: 'bg-purple-400',
        questions: []
      },
    
      {
        id: 'critical-thinking',
        title: 'Critical Thinking',
        color: 'bg-green-500',
        questions: []
      },
      {
        id: 'perception',
        title: 'Perception',
        color: 'bg-blue-500',
        questions: []
      }
    ]
  },
  {
    id: 'oral-skills',
    title: 'Oral Skills',
    description: 'Evaluate oral language, reading, phonics awareness, and blending.',
    color: 'oral',
    subcategories: [
      {
        id: 'oral-language',
        title: 'Oral Language',
        color: 'bg-blue-500',
        questions: []
      },
      {
        id: 'reading',
        title: 'Reading',
        color: 'bg-orange-500',
        questions: []
      },
      {
        id: 'phonics-awareness',
        title: 'Phonics Awareness',
        color: 'bg-yellow-500',
        questions: []
      },
      {
        id: 'blending',
        title: 'Blending and Segmenting',
        color: 'bg-green-500',
        questions: []
      }
    ]
  },
  {
    id: 'academic-skills',
    title: 'Academic Skills',
    description: 'Evaluate writing, sentence formation, spelling, and math skills.',
    color: 'academic',
    subcategories: [
      {
        id: 'writing',
        title: 'Writing',
        color: 'bg-yellow-500',
        questions: []
      },
      {
        id: 'sentence-formation',
  title: 'Vocabulary',
        color: 'bg-pink-500',
        questions: []
      },
      {
        id: 'spelling',
        title: 'Spelling',
        color: 'bg-purple-500',
        questions: []
      },
      {
       id: 'assessment-generator',
      title: 'AI Assessment Generator',
      color: 'bg-green-500',
      questions: []

      }
    ]
  }
];