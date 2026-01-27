import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface QuizLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    backPath?: string;
    showBackButton?: boolean;
    backgroundGradient?: string;
}

/**
 * Reusable quiz layout wrapper
 * Provides consistent styling and navigation for all quiz pages
 */
export const QuizLayout = ({
    children,
    title,
    subtitle,
    backPath = '/categories',
    showBackButton = true,
    backgroundGradient = 'from-violet-50 via-purple-50 to-indigo-100',
}: QuizLayoutProps) => {
    const navigate = useNavigate();

    return (
        <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient}`}>
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    {showBackButton && (
                        <motion.button
                            onClick={() => navigate(backPath)}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                            whileHover={{ x: -4 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            <span className="font-medium">Back</span>
                        </motion.button>
                    )}

                    <div className="text-center flex-1">
                        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-slate-500">{subtitle}</p>
                        )}
                    </div>

                    {/* Placeholder for right side balance */}
                    {showBackButton && <div className="w-20" />}
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
};

export default QuizLayout;
