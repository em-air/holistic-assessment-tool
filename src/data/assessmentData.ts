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
        questions: []
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
    description: 'Evaluate oral language and reading skills.',
    color: 'oral',
    subcategories: [
      {
        id: 'sentence-building',
        title: 'Sentence Building',
        color: 'bg-blue-500',
        questions: []
      },
      {
        id: 'story-retell',
        title: 'Story Retell',
        color: 'bg-indigo-500',
        questions: []
      },
      {
        id: 'reading',
        title: 'Reading',
        color: 'bg-orange-500',
        questions: []
      },
      {
        id: 'story-sequencing',
        title: 'Story Sequencing',
        color: 'bg-purple-500',
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