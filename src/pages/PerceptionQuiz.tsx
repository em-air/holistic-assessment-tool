import React, { useState } from 'react';
import { ArrowLeft, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MindSectionReport from '../components/MindSectionReport';
import FloatingBackground from '../components/FloatingBackground';
import { ROUTES } from '../routes';

const PerceptionQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [showReport, setShowReport] = useState(false);

  const perceptionQuizzes = [
    {
      id: 'missing-object',
      title: 'Missing Object Quiz',
      description: 'identify what is missing from pictures',
      icon: Eye,
      route: ROUTES.MISSING_OBJECT_QUIZ_FLAT,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:border-blue-400'
    },
    {
      id: 'sentence-difference',
      title: 'Find the Difference',
      description: 'spot the single word that differs between two sentences',
      icon: FileText,
      route: ROUTES.SENTENCE_DIFFERENCE_QUIZ_FLAT,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:border-purple-400'
    }
  ];

  const handleQuizSelect = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-8">
      <FloatingBackground />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(ROUTES.CATEGORY_MIND)}
            className="group flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white/70 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-white/90 hover:shadow-md transform hover:scale-105"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">back to cognition</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            perception quizzes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            test your ability to notice details and spot differences
          </p>
        </div>

        {/* Quiz Selection */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {perceptionQuizzes.map((quiz) => {
              const IconComponent = quiz.icon;
              return (
                <button
                  key={quiz.id}
                  onClick={() => handleQuizSelect(quiz.route)}
                  className={`group ${quiz.bgColor} ${quiz.borderColor} ${quiz.hoverColor} border-2 rounded-3xl p-8 transition-all duration-300 ease-out hover:shadow-xl transform hover:scale-105 hover:-translate-y-2 text-left w-full`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`bg-gradient-to-r ${quiz.color} p-4 rounded-2xl shadow-lg`}>
                      <IconComponent size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-gray-900">
                        {quiz.title}
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed group-hover:text-gray-700">
                        {quiz.description}
                      </p>
                      <div className="mt-4">
                        <span className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                          start quiz
                          <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <MindSectionReport onClose={() => setShowReport(false)} />
      )}
    </div>
  );
};

export default PerceptionQuiz;