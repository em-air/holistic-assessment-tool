/**
 * Quiz Access Rules Configuration
 * 
 * Centralized configuration for grade-based quiz access control.
 * This file defines which grades can access which categories and quizzes.
 */

import type { GradeLevel } from '../types/database.js';

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
    // Mind category available for all grades
    allowedGrades: [1, 2, 3, 4, 5, 6, 7, 8],
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
      'phonics': { grades: [1, 2, 3, 4] },
    }
  }
};

// ============================================
// ACCESS CHECK FUNCTIONS
// ============================================

/**
 * Parse grade string to number
 */
export function parseGradeNumber(grade: GradeLevel | string | null): number {
  if (!grade) return 0;
  if (typeof grade === 'number') return grade;
  const match = grade.match(/Grade\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Check if a user can access a category at all
 */
export function canAccessCategory(
  userGrade: number,
  category: string,
  userRole: string = 'student'
): boolean {
  // Admin and teacher can access everything
  if (userRole === 'admin' || userRole === 'teacher') {
    return true;
  }

  const rules = QUIZ_ACCESS_RULES[category];
  if (!rules) return true; // No rules = allow access

  return rules.allowedGrades.includes(userGrade);
}

/**
 * Check if a user can access a specific subcategory
 */
export function canAccessSubcategory(
  userGrade: number,
  category: string,
  subcategory: string,
  userRole: string = 'student'
): boolean {
  // Admin and teacher can access everything
  if (userRole === 'admin' || userRole === 'teacher') {
    return true;
  }

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
  userGrade: number,
  category: string,
  subcategory: string,
  quizGrade: number,
  userRole: string = 'student'
): boolean {
  // Admin and teacher can access everything
  if (userRole === 'admin' || userRole === 'teacher') {
    return true;
  }

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
    return subRules.grades.includes(quizGrade) && userGrade <= quizGrade;
  }

  // Check max grade limit
  if (subRules.maxGrade && quizGrade > subRules.maxGrade) {
    return false;
  }

  return true;
}

/**
 * Get list of accessible quiz grades for a user
 */
export function getAccessibleGrades(
  userGrade: number,
  category: string,
  subcategory: string,
  availableGrades: number[],
  userRole: string = 'student'
): { accessible: number[]; locked: number[] } {
  const accessible: number[] = [];
  const locked: number[] = [];

  for (const grade of availableGrades) {
    if (canAccessQuizGrade(userGrade, category, subcategory, grade, userRole)) {
      accessible.push(grade);
    } else {
      locked.push(grade);
    }
  }

  return { accessible, locked };
}

/**
 * Get reason why a quiz is locked
 */
export function getLockedReason(
  userGrade: number,
  category: string,
  subcategory: string,
  quizGrade: number,
  userRole: string = 'student'
): string | null {
  if (userRole === 'admin' || userRole === 'teacher') {
    return null; // Never locked for admin/teacher
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
  userGrade: number,
  category: string
): string | null {
  const rules = QUIZ_ACCESS_RULES[category];
  if (!rules) return null;

  if (!rules.allowedGrades.includes(userGrade)) {
    const maxGrade = Math.max(...rules.allowedGrades);
    return `This section is designed for Grades 1-${maxGrade}. It is not available for Grade ${userGrade} students.`;
  }

  return null;
}
