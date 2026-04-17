// Main Components Barrel Export
// Import from subfolders for cleaner organization

// Common UI Components
export * from './common';

// Auth Components
export * from './auth';

// Quiz Components
export * from './quiz';

// Re-export individual components that haven't been moved yet
export { default as FloatingBackground } from './FloatingBackground';
export { default as NavigationBar } from './NavigationBar';
export { default as ResultScreen } from './ResultScreen';
export { default as CategoryCard } from './CategoryCard';
export { default as QuestionCard } from './QuestionCard';
export { default as FeedbackMessage } from './FeedbackMessage';
export { default as ProtectedRoute } from './ProtectedRoute';
