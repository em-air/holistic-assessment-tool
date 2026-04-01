import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AssessmentProgressBar from '../components/AssessmentProgressBar';
import MindSectionReport from '../components/MindSectionReport';
import { ROUTES } from '../routes';

const CriticalThinkingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showReport, setShowReport] = useState(false);

  const quizTypes = [
    {
      id: 'analogy',
      title: 'Analogy Quiz',
      subtitle: 'Logical Reasoning',
      description: 'Train logical reasoning through comparison and relationship questions',
      icon: Brain,
      color: 'from-purple-400 to-pink-500',
      route: ROUTES.ANALOGY_QUIZ,
      features: [
        'If-then relationships',
        'Comparative logic',
        'Abstract reasoning',
        '4 grade levels'
      ],
      emoji: '🧩'
    },
    {
      id: 'category',
      title: 'Category Quiz',
      subtitle: 'Classification',
      description: 'Develop classification skills through drag-and-drop sorting challenges',
      icon: Target,
      color: 'from-green-400 to-teal-500',
      route: ROUTES.CATEGORY_QUIZ,
      features: [
        'Drag & drop sorting',
        'Classification skills',
        'Visual feedback',
        '4 grade levels'
      ],
      emoji: '🧺'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all duration-300 ease-out hover:text-purple-100 hover:bg-white/20 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back</span>
          </button>

          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Critical Thinking</h1>
            <p className="text-purple-100">Choose your thinking challenge!</p>
          </div>

          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Progress Bar for Mind Section */}
        <div className="mb-6">
          <AssessmentProgressBar
            onShowReport={() => setShowReport(true)}
          />
        </div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-8 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sharpen Your Cognition! 🧠
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Critical thinking helps you solve problems, make connections, and understand relationships.
            Choose between analogy puzzles that test logical reasoning or category sorting that develops classification skills.
          </p>
        </motion.div>

        {/* Quiz Type Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {quizTypes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300"
            >
              {/* Quiz Icon & Title */}
              <div className="text-center mb-6">
                <div className={`w-20 h-20 bg-gradient-to-r ${quiz.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <span className="text-3xl">{quiz.emoji}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  {quiz.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded mb-2">
                  ({quiz.subtitle})
                </p>
                <p className="text-gray-600">
                  {quiz.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <quiz.icon size={18} className="mr-2" />
                  What you'll practice:
                </h4>
                <ul className="space-y-2">
                  {quiz.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Grade Levels Preview */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">Grade Levels:</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((grade) => (
                    <div key={grade} className="text-center">
                      <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 mb-1">
                        {grade}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(quiz.route)}
                className={`w-full py-4 bg-gradient-to-r ${quiz.color} text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                Start {quiz.title}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-2">💡 Pro Tip</h3>
            <p className="text-gray-600 text-sm">
              Start with Grade 1 if you're new to these types of puzzles, or jump to your grade level for an appropriate challenge.
              You can always change the difficulty level within each quiz!
            </p>
          </div>
        </motion.div>

        {/* Report Modal */}
        {showReport && (
          <MindSectionReport onClose={() => setShowReport(false)} />
        )}
      </div>
    </div>
  );
};

export default CriticalThinkingPage;