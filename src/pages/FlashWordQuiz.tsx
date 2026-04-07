import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Delete, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgressTracker } from '../utils/progressTracker';
import AssessmentProgressBar from '../components/AssessmentProgressBar';
import MindSectionReport from '../components/MindSectionReport';
import { ROUTES } from '../routes';

// Flash word data structure
interface FlashWord {
  id: number;
  image: string;
  word: string;
}

// Grade levels for selection
type GradeLevel = 'grade1' | 'grade2' | 'grade3' | 'grade4';

// Word bank with grade-specific difficulty
const wordBank = {
  grade1: [
    { id: 1, image: 'https://images.unsplash.com/vector-1741847236185-27b1ff478511?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2F0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600', word: 'cat' },
    { id: 2, image: 'https://images.unsplash.com/vector-1740286698618-7f01b97f6899?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', word: 'dog' },
    { id: 3, image: 'https://images.unsplash.com/vector-1738925311171-6897d223702e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', word: 'sun' },
    { id: 4, image: 'https://plus.unsplash.com/premium_vector-1718166509477-327bc1cba9f9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGJhbGx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600', word: 'ball' },
    { id: 5, image: 'https://plus.unsplash.com/premium_vector-1731660866896-69378f2b9a6a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', word: 'tree' },
    { id: 6, image: 'https://plus.unsplash.com/premium_vector-1727952231396-e301fbf4ef1b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Ym9va3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', word: 'book' },
    { id: 7, image: 'https://images.unsplash.com/vector-1743702228669-15c868db27e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600', word: 'car' },
    { id: 8, image: 'https://plus.unsplash.com/premium_vector-1711987775501-7f3b47be125d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aGF0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600', word: 'hat' }
  ] as FlashWord[],

  grade2: [
    { id: 1, image: 'https://plus.unsplash.com/premium_vector-1727952230707-372d1ba06834?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8d2F0ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600', word: 'water' },
    { id: 2, image: 'https://plus.unsplash.com/premium_vector-1682304496080-70b295c04782?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGpveXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', word: 'happy' },
    { id: 3, image: 'https://plus.unsplash.com/premium_vector-1721890983105-625c0d32045f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600', word: 'house' },
    { id: 4, image: 'https://plus.unsplash.com/premium_vector-1721918267898-1723de525ab3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGZsb3dlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', word: 'flower' },
    { id: 5, image: 'https://source.unsplash.com/200x200/?yellow', word: 'yellow' },
    { id: 6, image: 'https://plus.unsplash.com/premium_vector-1733389194552-e60c558f76be?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764', word: 'friend' },
    { id: 7, image: 'https://images.unsplash.com/vector-1740296579124-fea8e9995120?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmFtaWx5fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600', word: 'family' },
    { id: 8, image: 'https://images.unsplash.com/vector-1740296579124-fea8e9995120?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmFtaWx5fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600', word: 'apple' }
  ] as FlashWord[],

  grade3: [
    { id: 1, image: 'https://source.unsplash.com/200x200/?between', word: 'between' },
    { id: 2, image: 'https://source.unsplash.com/200x200/?animal', word: 'animal' },
    { id: 3, image: 'https://source.unsplash.com/200x200/?follow', word: 'follow' },
    { id: 4, image: 'https://source.unsplash.com/200x200/?mother', word: 'mother' },
    { id: 5, image: 'https://source.unsplash.com/200x200/?school', word: 'school' },
    { id: 6, image: 'https://source.unsplash.com/200x200/?picture', word: 'picture' },
    { id: 7, image: 'https://source.unsplash.com/200x200/?kitchen', word: 'kitchen' },
    { id: 8, image: 'https://source.unsplash.com/200x200/?garden', word: 'garden' }
  ] as FlashWord[],

  grade4: [
    { id: 1, image: 'https://source.unsplash.com/200x200/?because', word: 'because' },
    { id: 2, image: 'https://source.unsplash.com/200x200/?beautiful', word: 'beautiful' },
    { id: 3, image: 'https://source.unsplash.com/200x200/?another', word: 'another' },
    { id: 4, image: 'https://source.unsplash.com/200x200/?different', word: 'different' },
    { id: 5, image: 'https://source.unsplash.com/200x200/?thought', word: 'thought' },
    { id: 6, image: 'https://source.unsplash.com/200x200/?important', word: 'important' },
    { id: 7, image: 'https://source.unsplash.com/200x200/?remember', word: 'remember' },
    { id: 8, image: 'https://source.unsplash.com/200x200/?surprise', word: 'surprise' }
  ] as FlashWord[]
};

// Virtual keyboard layout (3 rows)
const keyboardRows = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
  ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
];

const FlashWordQuiz: React.FC = () => {
  const navigate = useNavigate();

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

  // Handle grade selection
  const handleGradeSelect = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    const words = wordBank[grade];
    setCurrentWords(words);
    setCurrentWordIndex(0);
    setScore(0);
    scoreRef.current = 0;
    setTotalAttempts(0);
    setIsComplete(false);
    setGamePhase('ready');
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
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(ROUTES.ATTENTION_MEMORY)}
              className="group flex items-center space-x-2 px-4 py-2 text-white bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-white/30 hover:shadow-md transform hover:scale-105"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.keys(wordBank).map((grade) => (
                <motion.button
                  key={grade}
                  onClick={() => handleGradeSelect(grade as GradeLevel)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {getGradeDisplay(grade as GradeLevel)}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {grade === 'grade1' || grade === 'grade2' ? 'Image + Word shown' : 'Word only'}
                  </p>
                  <p className="text-white/70 text-xs mt-2">
                    {wordBank[grade as GradeLevel].length} words
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
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
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
              onClick={() => navigate(ROUTES.ATTENTION_MEMORY, { replace: true })}
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
  const showImage = selectedGrade === 'grade1' || selectedGrade === 'grade2';
  const showWordText = true; // Always show word text for all grades

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => navigate(ROUTES.ATTENTION_MEMORY)}
          className="group flex items-center space-x-2 px-4 py-2 text-white bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-white/30 hover:shadow-md transform hover:scale-105"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back</span>
        </button>

        <div className="text-white text-lg font-medium">
          {getGradeDisplay(selectedGrade)} - Word {currentWordIndex + 1} of {currentWords.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-4">
        <div className="bg-white/20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${((currentWordIndex + 1) / currentWords.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
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