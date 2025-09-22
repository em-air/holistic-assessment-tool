import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion, QuizOption } from '../data/learningStylesData';

interface QuestionCardProps {
  question: QuizQuestion;
  selectedOption: string | null;
  onSelectOption: (optionId: string) => void;
  language: 'en' | 'ar';
  questionNumber: number;
  totalQuestions: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelectOption,
  language,
  questionNumber,
  totalQuestions
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleOptionClick = (optionId: string) => {
    onSelectOption(optionId);
    setShowFeedback(true);
    
    // Hide feedback after animation
    setTimeout(() => {
      setShowFeedback(false);
    }, 800);
  };

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8 mb-8"
      >
        {/* Question */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl md:text-2xl font-bold text-gray-800 mb-8 text-center leading-relaxed"
        >
          {question.question[language]}
        </motion.h2>

        {/* Options */}
        <div className="space-y-4">
          {question.options.map((option: QuizOption, index: number) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOptionClick(option.id)}
              className={`
                w-full p-6 rounded-xl border-2 transition-all duration-300 text-left
                ${selectedOption === option.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                group relative overflow-hidden
              `}
            >
              <div className="flex items-center">
                {/* Option Letter */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-4 transition-all duration-300
                    ${selectedOption === option.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                    }
                  `}
                >
                  {getOptionLetter(index)}
                </div>
                
                {/* Option Text */}
                <span
                  className={`
                    text-lg font-medium transition-all duration-300
                    ${selectedOption === option.id
                      ? 'text-blue-700'
                      : 'text-gray-700 group-hover:text-gray-800'
                    }
                  `}
                >
                  {option.text[language]}
                </span>
              </div>

              {/* Selection Indicator */}
              {selectedOption === option.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4"
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Feedback Animation */}
      <AnimatePresence>
        {showFeedback && selectedOption && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl border-4 border-yellow-400">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="text-6xl mb-4 text-center"
              >
                ⭐
              </motion.div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Great Choice!</h3>
                <p className="text-gray-600">Your answer has been recorded</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionCard;