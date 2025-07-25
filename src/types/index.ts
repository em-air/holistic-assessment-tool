export interface QuizQuestion {
  id: number;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'rating';
  options?: string[] | number[];
  correctAnswer?: string | number;
  points?: number;
  subscale?: string; // 
  reverse?: boolean; 
}
export interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  category: string;
  subcategory: string;
}

export interface AssessmentCategory {
  id: string;
  title: string;
  description: string;
  color: string;
  subcategories: AssessmentSubcategory[];
}

export interface AssessmentSubcategory {
  id: string;
  title: string;
  color: string;
  questions: QuizQuestion[];
}