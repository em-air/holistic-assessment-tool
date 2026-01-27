import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { ReactNode } from 'react';

interface QuizFeedbackProps {
    isCorrect: boolean;
    correctMessage?: string;
    incorrectMessage?: string;
    points?: number;
    customContent?: ReactNode;
}

/**
 * Reusable Quiz Feedback component
 * Shows animated correct/incorrect feedback after answering
 */
export const QuizFeedback = ({
    isCorrect,
    correctMessage = 'Excellent! Great job!',
    incorrectMessage = 'Not quite right. Try again!',
    points,
    customContent,
}: QuizFeedbackProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="text-center"
        >
            <div
                className={`rounded-2xl p-6 shadow-xl border-2 max-w-md mx-auto ${isCorrect
                        ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300'
                        : 'bg-gradient-to-br from-red-50 to-orange-100 border-red-300'
                    }`}
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}
                >
                    {isCorrect ? (
                        <Check className="w-8 h-8 text-white" />
                    ) : (
                        <X className="w-8 h-8 text-white" />
                    )}
                </motion.div>

                {/* Message */}
                <h3
                    className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}
                >
                    {isCorrect ? correctMessage : incorrectMessage}
                </h3>

                {/* Points (if applicable) */}
                {isCorrect && points !== undefined && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-green-600 text-lg font-medium"
                    >
                        +{points} points
                    </motion.p>
                )}

                {/* Custom content */}
                {customContent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4"
                    >
                        {customContent}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default QuizFeedback;
