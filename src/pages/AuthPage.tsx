import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthSuccessAnimation, LoginForm, SignupForm } from '../components/auth';
import { useAuthForm } from '../hooks/useAuthForm';
import { ROUTES } from '../routes';

/**
 * AuthPage - Refactored
 * 
 * This page now composes smaller components instead of containing all logic inline.
 * Reduced from 785 lines to ~150 lines.
 * 
 * Components used:
 * - AuthSuccessAnimation: Success celebration after auth
 * - LoginForm: Login form fields and submission
 * - SignupForm: Signup form fields and submission
 * 
 * Hooks used:
 * - useAuthForm: All form logic, validation, and state
 */
const AuthPage = () => {
  const navigate = useNavigate();
  const {
    isLogin,
    isLoading,
    showSuccess,
    errors,
    formData,
    handleInputChange,
    handleSubmit,
    toggleMode,
  } = useAuthForm();

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <AuthSuccessAnimation
            isLogin={isLogin}
            studentName={formData.studentName}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="min-h-screen bg-emerald-500 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Back button */}
        <div className="absolute top-6 left-6 z-50">
          <motion.button
            onClick={() => navigate(ROUTES.HOME)}
            className="group flex items-center space-x-2 px-4 py-2 text-slate-700 rounded-lg transition-colors duration-200 hover:text-slate-800 hover:bg-white/50 border border-slate-200"
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </motion.button>
        </div>

        {/* Main content */}
        <div className="flex items-center justify-center min-h-screen px-4 py-8 relative z-10">
          <motion.div className="w-full max-w-md" layout>
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="flex justify-center mb-4"
              >
                <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                  <div className="w-6 h-6 bg-white rounded" />
                </div>
              </motion.div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Welcome to Holistic Assessment
              </h1>
              <p className="text-slate-600">
                {isLogin
                  ? 'Sign in to continue your learning journey'
                  : 'Create your student account to get started'}
              </p>
            </motion.div>

            {/* Form container */}
            <motion.div
              className="bg-white rounded-xl p-8 shadow-card border border-slate-100"
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Toggle buttons */}
              <div className="flex mb-8 bg-violet-100/50 rounded-xl p-1">
                <motion.button
                  onClick={() => !isLogin && toggleMode()}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${isLogin
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                    }`}
                  whileHover={!isLogin ? { scale: 1.02 } : {}}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  onClick={() => isLogin && toggleMode()}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${!isLogin
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                    }`}
                  whileHover={isLogin ? { scale: 1.02 } : {}}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Up
                </motion.button>
              </div>

              {/* Forms */}
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <LoginForm
                    key="login"
                    formData={formData}
                    errors={errors}
                    isLoading={isLoading}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                  />
                ) : (
                  <SignupForm
                    key="signup"
                    formData={formData}
                    errors={errors}
                    isLoading={isLoading}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                  />
                )}
              </AnimatePresence>

              {/* Footer */}
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-slate-600">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <motion.button
                    onClick={toggleMode}
                    className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </motion.button>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default AuthPage;