import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Volume2 } from 'lucide-react';
import FloatingBackground from '../components/FloatingBackground';
import { ROUTES, categoryRoute, phonicsQuizRoute } from '../routes';

const PhonicsQuizSelection: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();

  const quizzes = [
    {
      id: 'phonics-awareness',
      title: 'Phonics Awareness',
      description: 'Match letters with their sounds',
      icon: BookOpen,
      route: phonicsQuizRoute(categoryId!),
      color: 'from-blue-500 to-purple-600',
      difficulty: 'Grades 1-4'
    },
    {
      id: 'starting-ending-sounds',
      title: 'Beginning & Ending Sounds',
      description: 'Identify beginning and ending sounds in words',
      icon: Volume2,
      route: ROUTES.STARTING_ENDING_SOUND,
      color: 'from-green-500 to-blue-600',
      difficulty: 'Grades 1-4'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 relative overflow-hidden">
      <FloatingBackground />
      
      {/* Header with back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate(categoryRoute(categoryId!), { replace: true })}
          className="group flex items-center space-x-2 px-4 py-2 text-white bg-black/20 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-black/30 hover:shadow-md transform hover:scale-105"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">back</span>
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Phonics Awareness
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose a quiz to test your phonics skills
            </p>
          </div>

          {/* Quiz Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {quizzes.map((quiz, index) => {
              const Icon = quiz.icon;
              return (
                <div
                  key={quiz.id}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => navigate(quiz.route)}
                >
                  <div className="bg-white rounded-3xl shadow-lg p-8 h-full border-2 border-transparent group-hover:border-blue-300 transition-all duration-300">
                    {/* Quiz Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${quiz.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={32} className="text-white" />
                    </div>

                    {/* Quiz Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {quiz.title}
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {quiz.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {quiz.description}
                      </p>
                    </div>

                    {/* Quiz Number Badge */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>

                    {/* Hover Arrow */}
                    <div className="flex justify-end mt-6">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowLeft size={20} className="rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Complete both quizzes to master phonics awareness skills
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonicsQuizSelection;