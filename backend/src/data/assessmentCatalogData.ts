export interface AssessmentCatalogQuestion {
  id: number;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'rating';
  options?: string[] | number[];
  correctAnswer?: string | number;
  points?: number;
  subscale?: string;
  reverse?: boolean;
}

export interface AssessmentCatalogSubcategory {
  id: string;
  title: string;
  color: string;
  available: boolean;
  questions: AssessmentCatalogQuestion[];
}

export interface AssessmentCatalogCategory {
  id: string;
  title: string;
  description: string;
  color: string;
  subcategories: AssessmentCatalogSubcategory[];
}

export const assessmentCatalog: AssessmentCatalogCategory[] = [
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
        available: true,
        questions: [],
      },
      {
        id: 'learning-style',
        title: 'Learning Style',
        color: 'bg-purple-400',
        available: true,
        questions: [],
      },
      {
        id: 'critical-thinking',
        title: 'Critical Thinking',
        color: 'bg-green-500',
        available: true,
        questions: [],
      },
      {
        id: 'perception',
        title: 'Perception',
        color: 'bg-blue-500',
        available: true,
        questions: [],
      },
    ],
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
        available: true,
        questions: [],
      },
      {
        id: 'story-retell',
        title: 'Story Retell',
        color: 'bg-indigo-500',
        available: true,
        questions: [],
      },
      {
        id: 'reading',
        title: 'Reading',
        color: 'bg-orange-500',
        available: true,
        questions: [],
      },
      {
        id: 'story-sequencing',
        title: 'Story Sequencing',
        color: 'bg-purple-500',
        available: true,
        questions: [],
      },
    ],
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
        available: true,
        questions: [],
      },
      {
        id: 'sentence-formation',
        title: 'Vocabulary',
        color: 'bg-pink-500',
        available: true,
        questions: [],
      },
      {
        id: 'spelling',
        title: 'Spelling',
        color: 'bg-purple-500',
        available: true,
        questions: [],
      },
      {
        id: 'assessment-generator',
        title: 'AI Assessment Generator',
        color: 'bg-green-500',
        available: true,
        questions: [],
      },
    ],
  },
];

export const getAssessmentCatalog = (): AssessmentCatalogCategory[] => {
  return assessmentCatalog;
};

export const getAssessmentCatalogCategory = (categoryId: string): AssessmentCatalogCategory | undefined => {
  return assessmentCatalog.find((category) => category.id === categoryId);
};