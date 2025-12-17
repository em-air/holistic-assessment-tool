import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/FloatingBackground';

const ComingSoon: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const quizName = location.state?.quizName || 'This Quiz';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Clock size={64} className="text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg"
          >
            Coming Soon!
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl text-white/90 mb-4 drop-shadow"
          >
            {quizName}
          </motion.p>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-purple-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">We're Working On It!</h3>
              <Sparkles size={24} className="text-purple-600 ml-2" />
            </div>
            <p className="text-gray-600 text-lg mb-6">
              This quiz is currently under development. We're creating an amazing learning experience 
              that will help you master these skills in the most engaging way possible!
            </p>
            <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
              <p className="text-purple-800 font-semibold">
                ✨ Stay tuned for updates and check back soon!
              </p>
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
