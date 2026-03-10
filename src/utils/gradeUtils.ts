import type { GradeLevel } from '../types/database';

// ============================================
// ACCESS RULES CONFIGURATION
// ============================================

export interface SubcategoryRules {
  maxGrade?: number;      // Maximum grade that can access (inclusive)
  minGrade?: number;      // Minimum grade that can access (inclusive)
  grades?: number[];      // Specific grades allowed (overrides min/max)
}

export interface CategoryRules {
  allowedGrades: number[];     // Grades that can access this category
  ownGradeOnly?: boolean;      // If true, students can only access their own grade's quizzes
  subcategories: Record<string, SubcategoryRules>;
}

export const QUIZ_ACCESS_RULES: Record<string, CategoryRules> = {
  mind: {
    // Mind category only available for grades 1-5
    allowedGrades: [1, 2, 3, 4, 5],
    ownGradeOnly: false,
    subcategories: {
      'attention-memory': { maxGrade: 5 },
      'learning-styles': { maxGrade: 5 },
      'critical-thinking': { maxGrade: 5 },
      'perception': { maxGrade: 5 },
      'logical-sequencing': { maxGrade: 5 },
    }
  },
  oral: {
    // Oral category - varies by subcategory
    allowedGrades: [1, 2, 3, 4, 5, 6],
    ownGradeOnly: false,
    subcategories: {
      'story-retell': { maxGrade: 4 },
      'oral-language': { maxGrade: 4 },
      'sentence-building': { maxGrade: 4 },
      'vocabulary': { maxGrade: 6 },
      'flash-words': { maxGrade: 3 },
    }
  },
  academic: {
    // Academic - all grades but own grade only
    allowedGrades: [1, 2, 3, 4, 5, 6, 7, 8],
    ownGradeOnly: true,
    subcategories: {
      'spelling': { grades: [1, 2, 3, 4, 5, 6, 7, 8] },
      'writing': { grades: [1, 2, 3, 4, 5, 6, 7, 8] },
      'reading': { grades: [1, 2, 3, 4, 5, 6, 7, 8] },
      'blending-segmenting': { grades: [1, 2, 3] },
      'phonics': { grades: [1, 2, 3, 4] },
      'starting-ending-sounds': { grades: [1, 2, 3] },
    }
  }
};

// ============================================
// BASIC GRADE UTILITIES
// ============================================

/**
 * Extract numeric grade from grade level string (e.g., "Grade 1" -> 1)
 */
export function getNumericGrade(grade: GradeLevel | string | null): number | null {
  if (!grade) return null;
  if (typeof grade === 'number') return grade;
  const match = grade.match(/Grade\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Check if a user with a specific grade can access a quiz grade level
 * Students can only access their own grade level
 * Admins can access all grades
 * @deprecated Use canAccessQuizGrade instead for category-aware checking
 */
export function canAccessGrade(
  userGrade: GradeLevel | string | null, 
  quizGrade: number,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) return true;
  
  const numericUserGrade = getNumericGrade(userGrade);
  if (numericUserGrade === null) return true; // If no grade set, allow all (guest mode)
  
  return numericUserGrade === quizGrade;
}

/**
 * Filter an array of grade data to only include grades the user can access
 */
export function filterByUserGrade<T extends { grade: number }>(
  data: T[],
  userGrade: GradeLevel | string | null,
  isAdmin: boolean = false
): T[] {
  if (isAdmin || !userGrade) return data;
  
  const numericUserGrade = getNumericGrade(userGrade);
  if (numericUserGrade === null) return data;
  
  return data.filter(item => item.grade === numericUserGrade);
}

/**
 * Get display name for grade restriction message
 */
export function getGradeRestrictionMessage(userGrade: GradeLevel | string | null): string {
  if (!userGrade) return '';
  return `You can only access ${userGrade} content.`;
}

// ============================================
// CATEGORY-AWARE ACCESS FUNCTIONS
// ============================================

/**
 * Check if a user can access a category at all
 */
export function canAccessCategory(
  userGrade: number | null,
  category: string,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) return true;
  if (userGrade === null) return true; // Guest mode

  const rules = QUIZ_ACCESS_RULES[category];
  if (!rules) return true; // No rules = allow access

  return rules.allowedGrades.includes(userGrade);
}

/**
 * Check if a user can access a specific subcategory
 */
export function canAccessSubcategory(
  userGrade: number | null,
  category: string,
  subcategory: string,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) return true;
  if (userGrade === null) return true;

  const categoryRules = QUIZ_ACCESS_RULES[category];
  if (!categoryRules) return true;

  // First check category access
  if (!categoryRules.allowedGrades.includes(userGrade)) {
    return false;
  }

  // Then check subcategory rules
  const subRules = categoryRules.subcategories[subcategory];
  if (!subRules) return true;

  // Check specific grades list
  if (subRules.grades) {
    return subRules.grades.includes(userGrade);
  }

  // Check min/max grade
  if (subRules.minGrade && userGrade < subRules.minGrade) return false;
  if (subRules.maxGrade && userGrade > subRules.maxGrade) return false;

  return true;
}

/**
 * Check if a user can access a specific quiz grade level
 */
export function canAccessQuizGrade(
  userGrade: number | null,
  category: string,
  subcategory: string,
  quizGrade: number,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) return true;
  if (userGrade === null) return true;

  const categoryRules = QUIZ_ACCESS_RULES[category];
  if (!categoryRules) return true;

  // First check category access
  if (!categoryRules.allowedGrades.includes(userGrade)) {
    return false;
  }

  // For "ownGradeOnly" categories, user can only access their own grade
  if (categoryRules.ownGradeOnly) {
    return userGrade === quizGrade;
  }

  // Check subcategory rules for the quiz grade
  const subRules = categoryRules.subcategories[subcategory];
  if (!subRules) return true;

  // Check specific grades list
  if (subRules.grades) {
    return subRules.grades.includes(quizGrade);
  }

  // Check max grade limit
  if (subRules.maxGrade && quizGrade > subRules.maxGrade) {
    return false;
  }

  return true;
}

/**
 * Get list of accessible and locked quiz grades for a user
 */
export function getAccessibleGrades(
  userGrade: number | null,
  category: string,
  subcategory: string,
  availableGrades: number[],
  isAdmin: boolean = false
): { accessible: number[]; locked: number[] } {
  const accessible: number[] = [];
  const locked: number[] = [];

  for (const grade of availableGrades) {
    if (canAccessQuizGrade(userGrade, category, subcategory, grade, isAdmin)) {
      accessible.push(grade);
    } else {
      locked.push(grade);
    }
  }

  return { accessible, locked };
}

/**
 * Get reason why a quiz grade is locked
 */
export function getLockedReason(
  userGrade: number | null,
  category: string,
  subcategory: string,
  quizGrade: number,
  isAdmin: boolean = false
): string | null {
  if (isAdmin || userGrade === null) {
    return null; // Never locked for admin or guests
  }

  const categoryRules = QUIZ_ACCESS_RULES[category];
  if (!categoryRules) return null;

  // Category not accessible
  if (!categoryRules.allowedGrades.includes(userGrade)) {
    return `This section is not available for Grade ${userGrade} students.`;
  }

  // Own grade only
  if (categoryRules.ownGradeOnly && userGrade !== quizGrade) {
    return `You can only access Grade ${userGrade} content.`;
  }

  // Subcategory restrictions
  const subRules = categoryRules.subcategories[subcategory];
  if (subRules?.maxGrade && quizGrade > subRules.maxGrade) {
    return `This quiz is only available up to Grade ${subRules.maxGrade}.`;
  }

  if (subRules?.grades && !subRules.grades.includes(quizGrade)) {
    return `This quiz is not available for Grade ${quizGrade}.`;
  }

  return null;
}

/**
 * Get category access message for users who can't access
 */
export function getCategoryBlockedMessage(
  userGrade: number | null,
  category: string
): string | null {
  if (userGrade === null) return null;
  
  const rules = QUIZ_ACCESS_RULES[category];
  if (!rules) return null;

  if (!rules.allowedGrades.includes(userGrade)) {
    const maxGrade = Math.max(...rules.allowedGrades);
    return `This section is designed for Grades 1-${maxGrade}. It is not available for Grade ${userGrade} students.`;
  }

  return null;
}

/**
 * Check if a grade should show a lock icon in grade selectors
 */
export function isGradeLocked(
  userGrade: number | null,
  category: string,
  subcategory: string,
  quizGrade: number,
  isAdmin: boolean = false
): boolean {
  return !canAccessQuizGrade(userGrade, category, subcategory, quizGrade, isAdmin);
}
