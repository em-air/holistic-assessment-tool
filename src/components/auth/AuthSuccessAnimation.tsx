import { motion } from 'framer-motion';

interface AuthSuccessAnimationProps {
    isLogin: boolean;
    studentName?: string;
}

/**
 * Success animation shown after successful login/signup
 */
export const AuthSuccessAnimation = ({ isLogin, studentName }: AuthSuccessAnimationProps) => {
    return (
        <motion.div
            className="fixed inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Floating celebration elements */}
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-4 h-4 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full"
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{
                        x: Math.cos(i * 30 * Math.PI / 180) * 200,
                        y: Math.sin(i * 30 * Math.PI / 180) * 200,
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
                />
            ))}

            <div className="text-center space-y-6">
                {/* Success icon */}
                <motion.div
                    className="mx-auto w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center shadow-xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: [0, 1.2, 1], rotate: [-180, 0, 0] }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <motion.svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <motion.path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                        />
                    </motion.svg>
                </motion.div>

                {/* Success message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-3xl font-bold text-slate-800 mb-3">
                        {isLogin ? 'Welcome Back!' : 'Account Created!'}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-md mx-auto">
                        {isLogin
                            ? `Welcome back! Let's continue your learning journey! 🎉`
                            : `Welcome ${studentName}! Your learning adventure begins now! 🚀`
                        }
                    </p>
                </motion.div>

                {/* Loading indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex items-center justify-center space-x-2"
                >
                    {[0, 0.2, 0.4].map((delay, index) => (
                        <motion.div
                            key={index}
                            className={`w-2 h-2 ${index === 0 ? 'bg-violet-500' : index === 1 ? 'bg-purple-500' : 'bg-indigo-500'
                                } rounded-full`}
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay }}
                        />
                    ))}
                    <span className="ml-3 text-slate-600 font-medium">
                        Taking you to your dashboard...
                    </span>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AuthSuccessAnimation;
