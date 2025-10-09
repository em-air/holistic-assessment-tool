import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PerceptionQuiz: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-400 to-pink-500 py-8">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/categories')}
            className="group flex items-center space-x-2 px-4 py-2 text-stone-600 rounded-lg transition-all duration-300 ease-out hover:text-purple-700 hover:bg-white/50 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Categories</span>
          </button>
        </div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/20 max-w-2xl mx-auto">
            <Brain className="w-20 h-20 text-purple-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-4">
              Perception Quiz
            </h1>
            <p className="text-xl text-stone-600 mb-8">
              This section is currently under development.
            </p>
            <p className="text-lg text-stone-500">
              Perception activities will be available soon!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PerceptionQuiz;