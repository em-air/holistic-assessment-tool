import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/FloatingBackground';
import { enhancedTTS, phoneticSoundMap } from '../utils/enhancedTTS';
import { ProgressTracker } from '../utils/progressTracker';
import { logger } from '../utils/logger';
import { ROUTES, categoryRoute } from '../routes';

interface PhonicsQuestion {
  id: number;
  letter: string;
  options: string[];
  correctAnswer: string;
  grade: number;
}

const phonicsQuestions: PhonicsQuestion[] = [
  // Grade 1 Questions - Basic consonants
  { id: 1, letter: 'm', options: ['/m/', '/s/', '/t/'], correctAnswer: '/m/', grade: 1 },
  { id: 2, letter: 'p', options: ['/b/', '/p/', '/g/'], correctAnswer: '/p/', grade: 1 },
  { id: 3, letter: 't', options: ['/t/', '/d/', '/n/'], correctAnswer: '/t/', grade: 1 },
  { id: 4, letter: 's', options: ['/s/', '/f/', '/sh/'], correctAnswer: '/s/', grade: 1 },
  { id: 5, letter: 'b', options: ['/b/', '/d/', '/p/'], correctAnswer: '/b/', grade: 1 },
  { id: 6, letter: 'r', options: ['/r/', '/l/', '/w/'], correctAnswer: '/r/', grade: 1 },
  { id: 7, letter: 'n', options: ['/n/', '/m/', '/ng/'], correctAnswer: '/n/', grade: 1 },
  { id: 8, letter: 'f', options: ['/f/', '/v/', '/th/'], correctAnswer: '/f/', grade: 1 },
  { id: 9, letter: 'd', options: ['/d/', '/t/', '/b/'], correctAnswer: '/d/', grade: 1 },
  { id: 10, letter: 'g', options: ['/g/', '/k/', '/j/'], correctAnswer: '/g/', grade: 1 },
  { id: 11, letter: 'h', options: ['/h/', '/f/', '/th/'], correctAnswer: '/h/', grade: 1 },
  { id: 12, letter: 'l', options: ['/l/', '/r/', '/w/'], correctAnswer: '/l/', grade: 1 },
  { id: 13, letter: 'k', options: ['/k/', '/g/', '/c/'], correctAnswer: '/k/', grade: 1 },
  { id: 14, letter: 'v', options: ['/v/', '/f/', '/b/'], correctAnswer: '/v/', grade: 1 },
  { id: 15, letter: 'w', options: ['/w/', '/v/', '/y/'], correctAnswer: '/w/', grade: 1 },

  // Grade 2 Questions - Digraphs and blends
  { id: 16, letter: 'ch', options: ['/ch/', '/c/', '/th/'], correctAnswer: '/ch/', grade: 2 },
  { id: 17, letter: 'sh', options: ['/sh/', '/c/', '/s/'], correctAnswer: '/sh/', grade: 2 },
  { id: 18, letter: 'th', options: ['/th/', '/f/', '/s/'], correctAnswer: '/th/', grade: 2 },
  { id: 19, letter: 'wh', options: ['/wh/', '/v/', '/h/'], correctAnswer: '/wh/', grade: 2 },
  { id: 20, letter: 'ck', options: ['/k/', '/ch/', '/sh/'], correctAnswer: '/k/', grade: 2 },
  { id: 21, letter: 'ng', options: ['/ng/', '/n/', '/g/'], correctAnswer: '/ng/', grade: 2 },
  { id: 22, letter: 'qu', options: ['/kw/', '/k/', '/w/'], correctAnswer: '/kw/', grade: 2 },
  { id: 23, letter: 'ph', options: ['/f/', '/p/', '/h/'], correctAnswer: '/f/', grade: 2 },
  { id: 24, letter: 'y', options: ['/y/', '/i/', '/j/'], correctAnswer: '/y/', grade: 2 },
  { id: 25, letter: 'z', options: ['/z/', '/c/', '/sh/'], correctAnswer: '/z/', grade: 2 },
  { id: 26, letter: 'j', options: ['/j/', '/g/', '/y/'], correctAnswer: '/j/', grade: 2 },
  { id: 27, letter: 'c', options: ['/k/', '/s/', '/ch/'], correctAnswer: '/k/', grade: 2 },
  { id: 28, letter: 'x', options: ['/ks/', '/z/', '/s/'], correctAnswer: '/ks/', grade: 2 },

  // Grade 3 Questions - Complex patterns
  { id: 29, letter: 'ough', options: ['/uf/', '/ough/', '/og/'], correctAnswer: '/ough/', grade: 3 },
  { id: 30, letter: 'eigh', options: ['/ay/', '/ee/', '/i/'], correctAnswer: '/ay/', grade: 3 },
  { id: 31, letter: 'tion', options: ['/shun/', '/tion/', '/shon/'], correctAnswer: '/tion/', grade: 3 },
  { id: 32, letter: 'sion', options: ['/zhun/', '/shun/', '/sion/'], correctAnswer: '/sion/', grade: 3 },
  { id: 33, letter: 'ight', options: ['/it/', '/ight/', '/yt/'], correctAnswer: '/ight/', grade: 3 },
  { id: 34, letter: 'aught', options: ['/awt/', '/aut/', '/aught/'], correctAnswer: '/awt/', grade: 3 },
  { id: 35, letter: 'dge', options: ['/j/', '/d/', '/g/'], correctAnswer: '/j/', grade: 3 }
];

const PhonicsQuiz: React.FC = () => {
  const navigate = useNavigate(); 
  const { categoryId } = useParams();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<PhonicsQuestion[]>([]);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Save quiz results when completed
  useEffect(() => {
    if (showResults && currentQuestions.length > 0 && selectedGrade) {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const percentage = Math.round((score / currentQuestions.length) * 100);
      
      ProgressTracker.saveQuizResult({
        quizId: 'phonics-quiz',
        quizName: `Phonics Awareness - Grade ${selectedGrade}`,
        category: 'oral',
        subcategory: 'phonics',
        score,
        totalQuestions: currentQuestions.length,
        percentage,
        timeSpent,
        completedAt: new Date().toISOString(),
        gradeLevel: `Grade ${selectedGrade}`,
      });
    }
  }, [showResults, score, currentQuestions.length, selectedGrade]);

  useEffect(() => {
    if (selectedGrade) {
      const questionsForGrade = phonicsQuestions.filter(q => q.grade === selectedGrade);
      setCurrentQuestions(questionsForGrade);
    }
  }, [selectedGrade]);

  // Load voices when component mounts
  useEffect(() => {
    enhancedTTS.preloadVoices().then(() => {
      logger.log('Available voices:', enhancedTTS.listVoices());
    });
    
    return () => {
      enhancedTTS.cancel();
    };
  }, []);

  const handleGradeSelection = (grade: number) => {
    setSelectedGrade(grade);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    startTimeRef.current = Date.now();  // Reset timer on grade selection
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return; // Prevent multiple selections during feedback

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const currentQuestion = currentQuestions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      // Play success sound (you can add actual audio here)
      logger.log('Correct answer! Playing success sound...');
    } else {
      // Play error sound (you can add actual audio here)
      logger.log('Incorrect answer! Playing error sound...');
    }

    // Auto-advance to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setShowResults(true);
      }
    }, 1500);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      enhancedTTS.cancel();
      setIsPlayingSound(false);
    }
  };

  const playLetterSound = async (letter: string) => {
    const soundToSpeak = phoneticSoundMap[letter] || letter;
    
    setIsPlayingSound(true);
    
    try {
      await enhancedTTS.speak(soundToSpeak, {
        rate: 0.75,
        pitch: 1.15,
        volume: 1.0
      });
    } catch (error) {
      logger.error('Error playing sound:', error);
    } finally {
      setIsPlayingSound(false);
    }
  };

  const resetQuiz = () => {
    setSelectedGrade(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setShowResults(false);
    setCurrentQuestions([]);
    setIsPlayingSound(false);
    enhancedTTS.cancel();
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Grade Selection Screen
  if (!selectedGrade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 relative overflow-hidden">
        <FloatingBackground />
        
        <div className="relative z-10 p-6">
          <button
            onClick={() => navigate(categoryRoute(categoryId!))}
            className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Back to Category</span>
          </button>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 max-w-md w-full"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Phonics Awareness</h1>
              <p className="text-gray-600">Choose your grade level to begin</p>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleGradeSelection(grade)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-6 rounded-lg font-bold text-xl transition-colors duration-200 transform hover:scale-105"
                >
                  Grade {grade}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const percentage = Math.round((score / currentQuestions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 relative overflow-hidden">
        <FloatingBackground />
        
        <div className="relative z-10 p-6">
          <button
            onClick={() => navigate(categoryRoute(categoryId!))}
            className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Back to Category</span>
          </button>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 max-w-md w-full text-center"
          >
            <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎉</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h1>
            
            <div className="text-6xl font-bold text-yellow-600 mb-4">
              {score}/{currentQuestions.length}
            </div>
            
            <p className="text-xl text-gray-700 mb-2">
              You got {score} out of {currentQuestions.length} correct
            </p>
            
            <p className="text-lg text-gray-600 mb-8">
              That's {percentage}%!
            </p>

            <div className="space-y-4">
              <button
                onClick={resetQuiz}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg font-bold transition-colors duration-200"
              >
                Try Another Grade
              </button>
              
              <button
                onClick={() => navigate(ROUTES.CATEGORIES)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-bold transition-colors duration-200"
              >
                Back to Categories
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 p-6">
        <button
          onClick={() => navigate(categoryRoute(categoryId!))}
          className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span>Back to Category</span>
        </button>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pb-20">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 max-w-lg w-full"
        >
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
              <div className="flex items-center space-x-2">
                <span>Grade {selectedGrade} Phonics</span>
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={showFeedback}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                    title="Go to previous question"
                  >
                    <ArrowLeft size={16} />
                    <span className="text-xs">Back</span>
                  </button>
                )}
              </div>
              <span>{currentQuestionIndex + 1} of {currentQuestions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Click the speaker to hear the sound, then select the correct answer
            </h2>
            
            <div className="bg-yellow-100 rounded-2xl p-8 mb-4">
              {/* Large Speaker Button */}
              <button
                onClick={() => playLetterSound(currentQuestion?.letter || '')}
                disabled={isPlayingSound}
                className={`
                  text-white p-8 rounded-full transition-all duration-200 transform shadow-lg
                  ${isPlayingSound 
                    ? 'bg-yellow-600 animate-pulse cursor-not-allowed' 
                    : 'bg-yellow-500 hover:bg-yellow-600 hover:scale-110 cursor-pointer'
                  }
                `}
                title={isPlayingSound ? "Playing sound..." : "Click to hear the sound"}
              >
                <Volume2 size={48} />
              </button>
              
              <p className="text-gray-600 mt-4 text-sm">
                {isPlayingSound ? "Playing sound..." : "Click the speaker to hear the sound"}
              </p>
            </div>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              const isIncorrect = isSelected && !isCorrect && showFeedback;
              const shouldShowCorrect = showFeedback && isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showFeedback}
                  className={`
                    py-4 px-6 rounded-lg font-bold text-xl transition-all duration-200 border-2
                    ${!showFeedback ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800 hover:scale-105' : ''}
                    ${shouldShowCorrect ? 'bg-green-500 border-green-600 text-white' : ''}
                    ${isIncorrect ? 'bg-red-500 border-red-600 text-white' : ''}
                    ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Score Display */}
          <div className="mt-6 text-center text-gray-600">
            Score: {score}/{currentQuestions.length}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PhonicsQuiz;
