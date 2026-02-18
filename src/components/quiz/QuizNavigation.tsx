import React from 'react';
import { motion } from 'framer-motion';

interface QuizNavigationProps {
    currentIndex: number;
    totalQuestions: number;
    onPrevious: () => void;
    onNext: () => void;
    onSubmit: () => void;
    isLastQuestion: boolean;
    answeredIndices?: number[];
    className?: string;
}

/**
 * QuizNavigation - Previous/Next navigation with question dots
 */
export const QuizNavigation: React.FC<QuizNavigationProps> = ({
    currentIndex,
    totalQuestions,
    onPrevious,
    onNext,
    onSubmit,
    isLastQuestion,
    answeredIndices = [],
    className = '',
}) => {
    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4">
                <motion.button
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${currentIndex === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                    whileTap={{ scale: currentIndex === 0 ? 1 : 0.95 }}
                >
                    ← Previous
                </motion.button>

                {isLastQuestion ? (
                    <motion.button
                        onClick={onSubmit}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Submit ✓
                    </motion.button>
                ) : (
                    <motion.button
                        onClick={onNext}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Next →
                    </motion.button>
                )}
            </div>

            {/* Question Dots */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {Array.from({ length: totalQuestions }).map((_, index) => (
                    <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentIndex
                                ? 'bg-purple-600 ring-2 ring-purple-300'
                                : answeredIndices.includes(index)
                                    ? 'bg-green-500'
                                    : 'bg-gray-300'
                            }`}
                        title={`Question ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default QuizNavigation;
