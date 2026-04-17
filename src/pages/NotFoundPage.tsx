import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * NotFoundPage — displayed when the user navigates to an unknown route.
 * Uses React Router's <Link> so the base path (/holistic-assessment-tool) is respected.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center"
      >
        {/* Big 404 */}
        <div className="text-8xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-2 select-none">
          404
        </div>

        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          Oops! The page you're looking for doesn't exist or may have moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
