import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Delete, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgressTracker } from '../utils/progressTracker';
import AssessmentProgressBar from '../components/AssessmentProgressBar';
import MindSectionReport from '../components/MindSectionReport';
import { ROUTES } from '../routes';
import FloatingBackground from '../components/FloatingBackground';
import {
  getFlashWordGrades,
  getFlashWordQuestions,
  type FlashWord,
  type FlashWordGradeSummary,
  type GradeLevel,
} from '../services/flashWordService';

// Virtual keyboard layout (3 rows)
const keyboardRows = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
  ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
];

const FlashWordQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [gradeOptions, setGradeOptions] = useState<FlashWordGradeSummary[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Grade selection state
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);

  // Quiz state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWords, setCurrentWords] = useState<FlashWord[]>([]);
  const [showFlashCard, setShowFlashCard] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = React.useRef(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [showReport, setShowReport] = useState(false);
  const [gamePhase, setGamePhase] = useState<'ready' | 'showing' | 'input' | 'feedback'>('ready');

  React.useEffect(() => {
    const loadGrades = async () => {
      setIsLoadingGrades(true);
      setLoadError(null);

      const grades = await getFlashWordGrades();
      if (grades.length === 0) {
        setLoadError('Flash word content is unavailable right now.');
      } else {
        setGradeOptions(grades);
      }

      setIsLoadingGrades(false);
    };

    void loadGrades();
  }, []);

  // Handle grade selection
  const handleGradeSelect = async (grade: GradeLevel) => {
    setIsLoadingWords(true);
    setLoadError(null);

    const words = await getFlashWordQuestions(grade);
    if (words.length === 0) {
      setLoadError('Flash word questions are unavailable right now.');
      setIsLoadingWords(false);
      return;
    }

    setSelectedGrade(grade);
    setCurrentWords(words);
    setCurrentWordIndex(0);
    setScore(0);
    scoreRef.current = 0;
    setTotalAttempts(0);
    setIsComplete(false);
    setGamePhase('ready');
    setIsLoadingWords(false);
  };

  // Start showing flash card
  const startFlashCard = () => {
    setShowFlashCard(true);
    setGamePhase('showing');
    setUserInput('');
    setShowFeedback(false);

    // Hide flash card after exactly 1000ms
    setTimeout(() => {
      setShowFlashCard(false);
      setGamePhase('input');
    }, 1000);
  };

  // Handle virtual keyboard input
  const handleKeyPress = (letter: string) => {
    if (gamePhase === 'input' && !showFeedback) {
      setUserInput(prev => prev + letter.toLowerCase());
    }
  };

  // Handle delete/backspace
  const handleDelete = () => {
    if (gamePhase === 'input' && !showFeedback) {
      setUserInput(prev => prev.slice(0, -1));
    }
  };

  // Handle clear all
  const handleClear = () => {
    if (gamePhase === 'input' && !showFeedback) {
      setUserInput('');
    }
  };

  // Handle submit answer
  const handleSubmit = () => {
    if (gamePhase !== 'input' || showFeedback || userInput.trim() === '') return;

    const currentWord = currentWords[currentWordIndex];
    const isAnswerCorrect = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();

    setTotalAttempts(prev => prev + 1);
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    setGamePhase('feedback');

    if (isAnswerCorrect) {
      setScore(prev => {
        const newScore = prev + 1;
        scoreRef.current = newScore;
        return newScore;
      });
      setFeedbackMessage('Correct! Great memory! 🌟');
    } else {
      setFeedbackMessage(`Not quite! The word was: ${currentWord.word}`);
    }

    // Always auto-advance after 1.5 seconds
    setTimeout(() => {
      setShowFeedback(false);
      setUserInput('');
      if (currentWordIndex < currentWords.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
        setGamePhase('ready');
      } else {
        // Quiz complete
        setIsComplete(true);
        saveResults();
      }
    }, 1500);
  };

  // Save results to progress tracker
  const saveResults = () => {
    const finalScore = scoreRef.current;
    const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
    const percentage = Math.round((finalScore / currentWords.length) * 100);

    ProgressTracker.saveQuizResult({
      quizId: 'flash-word-quiz',
      quizName: 'Flash Word Quiz',
      subcategory: 'memory',
      score: finalScore,
      totalQuestions: currentWords.length,
      percentage: percentage,
      timeSpent: timeSpent,
      completedAt: new Date().toISOString(),
      gradeLevel: selectedGrade?.replace('grade', '') || '1'
    });
  };

  // Get grade display name
  const getGradeDisplay = (grade: GradeLevel): string => {
    return grade.replace('grade', 'Grade ');
  };

  // Grade selection screen
  if (!selectedGrade) {
    return (
      <div className="min-h-screen bg-pink-50 relative overflow-hidden py-8">
        <FloatingBackground />
        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(ROUTES.ATTENTION_MEMORY)}
              className="group flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white/60 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-white/80 hover:shadow-md transform hover:scale-105"
            >
              <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <AssessmentProgressBar onShowReport={() => setShowReport(true)} />
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Flash Word Memory</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Train your visual memory and spelling skills! See a word flash for just 1 second, then spell it from memory.
            </p>
          </div>

          {/* Grade Selection */}
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-white text-xl mb-8">Choose your grade level:</p>
            {isLoadingGrades && (
              <div className="text-center text-white/90 mb-6">Loading grade options...</div>
            )}
            {isLoadingWords && (
              <div className="text-center text-white/90 mb-6">Loading words...</div>
            )}
            {loadError && (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center text-white mb-6">
                {loadError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gradeOptions.map((option) => (
                <motion.button
                  key={option.grade}
                  onClick={() => void handleGradeSelect(option.grade)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {getGradeDisplay(option.grade)}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {option.showImage ? 'Image + Word shown' : 'Word only'}
                  </p>
                  <p className="text-white/70 text-xs mt-2">
                    {option.questionCount} words
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Report Modal */}
          {showReport && (
            <MindSectionReport onClose={() => setShowReport(false)} />
          )}
        </div>
      </div>
    );
  }

  // Quiz complete screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-green-50 relative overflow-hidden flex items-center justify-center p-4">
        <FloatingBackground />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative z-10"
        >
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
          <p className="text-xl text-gray-700 mb-6">
            You spelled <span className="font-bold text-green-600">{score}</span> out of{' '}
            <span className="font-bold">{currentWords.length}</span> words correctly!
          </p>
          <p className="text-gray-600 mb-8">
            Total attempts: {totalAttempts}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setSelectedGrade(null);
                setCurrentWordIndex(0);
                setScore(0);
                setTotalAttempts(0);
                setIsComplete(false);
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(ROUTES.ATTENTION_MEMORY)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Back to Cognition
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentWord = currentWords[currentWordIndex];
  const selectedGradeSummary = gradeOptions.find((option) => option.grade === selectedGrade);
  const showImage = selectedGradeSummary?.showImage ?? false;
  const showWordText = true; // Always show word text for all grades

  return (
    <div className="min-h-screen bg-indigo-50 relative overflow-hidden">
      <FloatingBackground />
      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <button
          onClick={() => setSelectedGrade(null)}
          className="group flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white/60 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-white/80 hover:shadow-md transform hover:scale-105"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back</span>
        </button>

        <div className="text-gray-700 text-lg font-medium">
          {getGradeDisplay(selectedGrade)} - Word {currentWordIndex + 1} of {currentWords.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-4 relative z-10">
        <div className="bg-white/40 rounded-full h-2">
          <div
            className="bg-indigo-500 rounded-full h-2 transition-all duration-300"
            style={{ width: `${((currentWordIndex + 1) / currentWords.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* Flash Card Area */}
            <div className="flex flex-col items-center space-y-6">

              {/* Flash Card */}
              <div className="relative w-80 h-80">
                <AnimatePresence>
                  {showFlashCard && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6"
                    >
                      {showImage && (
                        <img
                          src={currentWord.image}
                          alt={currentWord.word}
                          className="w-40 h-40 object-cover rounded-2xl mb-4"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x200/f0f0f0/999999?text=Image";
                          }}
                        />
                      )}
                      {showWordText && (
                        <h2 className="text-3xl font-bold text-gray-800">{currentWord.word}</h2>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Ready/Placeholder State */}
                {gamePhase === 'ready' && (
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                    <button
                      onClick={startFlashCard}
                      className="bg-white text-purple-600 font-bold py-4 px-8 rounded-2xl text-xl hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      Show Flash Card
                    </button>
                  </div>
                )}

                {/* Input State Placeholder */}
                {gamePhase === 'input' && !showFlashCard && (
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-6xl mb-4">🤔</div>
                      <p className="text-xl">What word did you see?</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Start Button */}
              {gamePhase === 'ready' && (
                <p className="text-white/80 text-center">
                  Ready? The word will flash for just 1 second!
                </p>
              )}
            </div>

            {/* Input and Keyboard Area */}
            <div className="flex flex-col items-center space-y-6">

              {/* Input Display */}
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Spell the word:</h3>
                  <div className="bg-gray-100 rounded-xl p-4 min-h-[3rem] flex items-center justify-center">
                    <span className="text-2xl font-mono text-gray-800 tracking-wider">
                      {userInput || (gamePhase === 'input' ? '|' : '')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {gamePhase === 'input' && (
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={handleClear}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-400 hover:bg-red-500 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Delete size={20} />
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={userInput.trim() === ''}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Check size={20} />
                    </button>
                  </div>
                )}

                {/* Feedback */}
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {feedbackMessage}
                    {!isCorrect && (
                      <div className="text-sm mt-1">
                        The word was: <strong>{currentWord.word}</strong>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Virtual Keyboard */}
              {gamePhase === 'input' && !showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-4"
                >
                  <div className="space-y-2">
                    {keyboardRows.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center space-x-1">
                        {row.map((letter) => (
                          <button
                            key={letter}
                            onClick={() => handleKeyPress(letter)}
                            className="w-12 h-12 bg-white hover:bg-gray-100 text-gray-800 font-bold rounded-lg transition-colors shadow-sm hover:shadow-md"
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
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

export default FlashWordQuiz;