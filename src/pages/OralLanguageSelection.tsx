import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface OralLanguageOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

const OralLanguageSelection: React.FC = () => {
  const navigate = useNavigate();

  const oralLanguageOptions: OralLanguageOption[] = [
    {
      id: 'vocabulary-naming',
      title: 'XXXXXXXXXX X XXXXXX (XXXX XX!)',
      subtitle: 'XXXXXXXXXX',
      description: 'XXXXXXXX XXX XXXX XXXXXXX, XXXXXXX, XXX XXXXXXXXXX',
      icon: '🏷️',
      route: '/vocabulary-matching',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'sentence-building',
      title: 'XXXXXXXX XXXXXXXX (XXXXXXX XXXX)',
      subtitle: 'XXXXXXXX XXXXXXXXX',
      description: 'XXXXXXXXXX XXXXXXXX XXXXXXXXX XXX XXXXXXX XXXX XXXXXXXX',
      icon: '💬',
      route: '/oral-language-quiz',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'story-sequencing',
      title: 'XXXXX XXXXXXXXXX (XXX XX XXXXX)',
      subtitle: 'XXXXXXXXX XXXXXXXXXX',
      description: 'XXXXXXX XXXXXXXX XX XXX XXXXXXX XXXXX XXXXXXXX',
      icon: '📖',
      route: '/oral-language-quiz',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'story-retell',
      title: 'XXXXX XXXXXX',
      subtitle: 'XXXXXXXXX XXXXXX',
      description: 'XXXX X XXXXX XXX XXXXXX XX XXXXX XXXXXXXXX, XXXXXX, XXX XXX',
      icon: '📚',
      route: '/story-retell-quiz',
      color: 'from-indigo-400 to-indigo-600'
    }
  ];

  const handleOptionClick = (option: OralLanguageOption) => {
    if (option.route === '/oral-language-quiz') {
      // Pass category ID in navigation state
      navigate(option.route, { state: { categoryId: option.id } });
    } else {
      navigate(option.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Oral Language Assessments
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose an assessment to evaluate oral language comprehension and expression skills
          </p>
        </motion.div>

        {/* Assessment Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {oralLanguageOptions.map((option, index) => {
            const isDisabled = true; // All oral language quizzes are disabled
            return (
              <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              onClick={() => !isDisabled && handleOptionClick(option)}
              className={`bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 border-2 border-gray-100 ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl'
              }`}
            >
              {/* Icon & Title */}
              <div className="text-center mb-6">
                <div className={`w-20 h-20 bg-gradient-to-r ${option.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <span className="text-4xl">{option.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  {option.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded mb-2">
                  ({option.subtitle})
                </p>
                <p className="text-gray-600 text-sm">
                  {option.description}
                </p>
              </div>

              {/* Start Button */}
              <motion.button
                whileHover={isDisabled ? {} : { scale: 1.05 }}
                whileTap={isDisabled ? {} : { scale: 0.95 }}
                className={`w-full bg-gradient-to-r ${option.color} text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isDisabled}
              >
                {isDisabled ? 'Coming Soon' : 'Start Assessment'}
              </motion.button>
            </motion.div>
            );
          })}
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            ← Back to Categories
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default OralLanguageSelection;
