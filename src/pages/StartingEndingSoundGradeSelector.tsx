import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import FloatingBackground from '../components/FloatingBackground';

const StartingEndingSoundGradeSelector: React.FC = () => {
  const navigate = useNavigate();

  const grades = [
    { 
      grade: 1, 
      title: 'Grade 1', 
      description: 'Simple sounds - cat, dog, sun', 
      color: 'from-green-400 to-blue-500',
      difficulty: 'Beginner'
    },
    { 
      grade: 2, 
      title: 'Grade 2', 
      description: 'Basic blends - ring, shell, lamp', 
      color: 'from-blue-400 to-purple-500',
      difficulty: 'Easy'
    },
    { 
      grade: 3, 
      title: 'Grade 3', 
      description: 'Complex words - elephant, shadow', 
      color: 'from-purple-400 to-pink-500',
      difficulty: 'Medium'
    },
    { 
      grade: 4, 
      title: 'Grade 4', 
      description: 'Advanced blends - tractor, butterfly', 
      color: 'from-pink-400 to-red-500',
      difficulty: 'Hard'
    }
  ];

  const handleGradeSelect = (grade: number) => {
    navigate(`/starting-ending-sound-quiz/${grade}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 relative overflow-hidden">
      <FloatingBackground />
      
      {/* Header with back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate('/phonics-quiz-selection/oral-skills')}
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
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <BookOpen size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Beginning & Ending Sounds
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your grade level to begin
            </p>
          </div>

          {/* Grade Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {grades.map((gradeInfo) => (
              <div
                key={gradeInfo.grade}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => handleGradeSelect(gradeInfo.grade)}
              >
                <div className="bg-white rounded-3xl shadow-lg p-6 h-full border-2 border-transparent group-hover:border-blue-300 transition-all duration-300 relative overflow-hidden">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradeInfo.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Grade number */}
                    <div className="text-center mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${gradeInfo.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-2xl font-bold text-white">{gradeInfo.grade}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {gradeInfo.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <div className="text-center space-y-2">
                      <div className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        {gradeInfo.difficulty}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {gradeInfo.description}
                      </p>
                    </div>

                    {/* Hover Arrow */}
                    <div className="flex justify-center mt-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <ArrowLeft size={16} className="rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="text-center mt-12">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How to Play</h3>
              <p className="text-gray-600 text-sm">
                Listen to the word, look at the picture, and identify the beginning or ending sound. 
                No spelling is shown - use your ears and phonics knowledge!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartingEndingSoundGradeSelector;