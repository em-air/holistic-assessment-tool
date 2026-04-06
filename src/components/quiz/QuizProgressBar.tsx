import { motion } from 'framer-motion';

interface QuizProgressBarProps {
    currentQuestion: number;
    totalQuestions: number;
    showQuestionCount?: boolean;
}

/**
 * Reusable progress bar for quizzes
 * Shows visual progress through quiz questions
 */
export const QuizProgressBar = ({
    currentQuestion,
    totalQuestions,
    showQuestionCount = true,
}: QuizProgressBarProps) => {
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;

    return (
        <div className="mb-6">
            {showQuestionCount && (
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>
                        Question {currentQuestion + 1} of {totalQuestions}
                    </span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
            )}
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <motion.div
                    className="h-full bg-violet-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
};

export default QuizProgressBar;
