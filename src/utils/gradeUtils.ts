import type { GradeLevel } from '../types/database';

/**
 * Extract numeric grade from grade level string (e.g., "Grade 1" -> 1)
 */
export function getNumericGrade(grade: GradeLevel | string | null): number | null {
  if (!grade) return null;
  const match = grade.match(/Grade\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Check if a user with a specific grade can access a quiz grade level
 * Students can only access their own grade level
 * Admins can access all grades
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
