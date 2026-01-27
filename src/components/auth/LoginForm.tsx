import { motion, AnimatePresence } from 'framer-motion';
import { Input, PasswordInput } from '../common';

interface LoginFormProps {
    formData: {
        email: string;
        password: string;
    };
    errors: Record<string, string>;
    isLoading: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

/**
 * Login form component with email and password fields
 */
export const LoginForm = ({
    formData,
    errors,
    isLoading,
    onInputChange,
    onSubmit,
}: LoginFormProps) => {
    return (
        <motion.form
            onSubmit={onSubmit}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-6"
        >
            <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={onInputChange}
                error={errors.email}
            />

            <PasswordInput
                name="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={onInputChange}
                error={errors.password}
            />

            {/* General error */}
            <AnimatePresence>
                {errors.general && (
                    <motion.div
                        className="bg-red-50 border border-red-200 rounded-xl p-3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <p className="text-red-600 text-sm">{errors.general}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
                type="submit"
                disabled={isLoading}
                className="group relative w-full px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-violet-500/25 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center space-x-2">
                    {isLoading ? (
                        <>
                            <motion.div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <span>Sign In</span>
                            <svg
                                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </>
                    )}
                </div>
            </motion.button>
        </motion.form>
    );
};

export default LoginForm;
