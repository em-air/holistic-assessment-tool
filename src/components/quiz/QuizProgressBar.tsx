import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n';

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
    const { t } = useLanguage();
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;

    return (
        <div className="mb-6">
            {showQuestionCount && (
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>
                        {t('quiz.question')} {currentQuestion + 1} {t('quiz.of')} {totalQuestions}
                    </span>
                    <span>{Math.round(progress)}% {t('quiz.complete')}</span>
                </div>
            )}
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
};

export default QuizProgressBar;
