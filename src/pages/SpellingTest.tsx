import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { getWordsByGrade, getGradeDescription, SpellingWord } from '../data/spellingData';
import { saveQuizResult } from '../services/quizResultsService';
import { logger } from '../utils/logger';

interface SpellingTestState {
  currentWordIndex: number;
  answers: { [wordId: string]: string };
  showResults: boolean;
  score: number;
}

interface SpellingResults {
  word: string;
  userAnswer: string;
  isCorrect: boolean;
}

const SpellingTest: React.FC = () => {
  const { grade } = useParams<{ grade: string }>();
  const navigate = useNavigate();
  const [words, setWords] = useState<SpellingWord[]>([]);
  const [testState, setTestState] = useState<SpellingTestState>({
    currentWordIndex: 0,
    answers: {},
    showResults: false,
    score: 0
  });
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Save quiz results to database when quiz is completed
  useEffect(() => {
    if (testState.showResults && words.length > 0 && grade) {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const correctCount = words.filter(word => 
        (testState.answers[word.id] || '').toLowerCase().trim() === word.word.toLowerCase().trim()
      ).length;
      
      saveQuizResult({
        quiz_id: 'spelling-test',
        quiz_name: `Spelling Test - Grade ${grade}`,
        category: 'academic',
        subcategory: 'spelling',
        score: correctCount,
        total_questions: words.length,
        time_spent: timeSpent,
        grade_level: `Grade ${grade}`,
      }).then(result => {
        if (result.success) {
          logger.log('Spelling Test result saved to database');
        }
      }).catch(err => {
        logger.error('Failed to save Spelling Test result:', err);
      });
    }
  }, [testState.showResults, testState.answers, words, grade]);

  useEffect(() => {
    if (grade) {
      const gradeWords = getWordsByGrade(parseInt(grade));
      startTimeRef.current = Date.now();  // Reset timer when grade loads
      setWords(gradeWords);
    }
  }, [grade]);

  // Text-to-speech functionality with female voice
  const speakWord = (word: string) => {
    if (isPlaying) return;

    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(word);
    
    // Set female voice preferences
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('hazel') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen')
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.rate = 0.7; // Slower for better comprehension
    utterance.pitch = 1.2; // Slightly higher pitch
    utterance.volume = 1;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    speechSynthesis.speak(utterance);
  };

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      speechSynthesis.getVoices();
    };
    
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleAnswerChange = (wordId: string, answer: string) => {
    if (wordId === words[testState.currentWordIndex]?.id) {
      setCurrentAnswer(answer);
    }
    setTestState(prev => ({
      ...prev,
      answers: { ...prev.answers, [wordId]: answer }
    }));
  };

  const goToNextWord = () => {
    if (testState.currentWordIndex < words.length - 1) {
      setTestState(prev => ({
        ...prev,
        currentWordIndex: prev.currentWordIndex + 1
      }));
      setCurrentAnswer(testState.answers[words[testState.currentWordIndex + 1]?.id] || '');
    }
  };

  const goToPreviousWord = () => {
    if (testState.currentWordIndex > 0) {
      setTestState(prev => ({
        ...prev,
        currentWordIndex: prev.currentWordIndex - 1
      }));
      setCurrentAnswer(testState.answers[words[testState.currentWordIndex - 1]?.id] || '');
    }
  };

  const submitTest = () => {
    let correctAnswers = 0;
    words.forEach(word => {
      const userAnswer = testState.answers[word.id] || '';
      if (userAnswer.toLowerCase().trim() === word.word.toLowerCase().trim()) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / words.length) * 100);
    setTestState(prev => ({
      ...prev,
      showResults: true,
      score
    }));
  };

  const getResults = (): SpellingResults[] => {
    return words.map(word => ({
      word: word.word,
      userAnswer: testState.answers[word.id] || '',
      isCorrect: (testState.answers[word.id] || '').toLowerCase().trim() === word.word.toLowerCase().trim()
    }));
  };

  const restartTest = () => {
    setTestState({
      currentWordIndex: 0,
      answers: {},
      showResults: false,
      score: 0
    });
    setCurrentAnswer('');
  };

  if (!grade || words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Spelling Test...</h2>
          <button
            onClick={() => navigate('/spelling-grades')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
          >
            Back to Grade Selection
          </button>
        </div>
      </div>
    );
  }

  const currentWord = words[testState.currentWordIndex];
  const progress = ((testState.currentWordIndex + 1) / words.length) * 100;

  if (testState.showResults) {
    const results = getResults();
    const correctCount = results.filter(r => r.isCorrect).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">
              {testState.score >= 80 ? '🎉' : testState.score >= 60 ? '😊' : '💪'}
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Test Complete!</h1>
            <h2 className="text-2xl font-semibold text-purple-600 mb-4">
              Grade {grade} Spelling Test
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg inline-block">
              <div className="text-3xl font-bold text-gray-800 mb-2">{correctCount}/{words.length}</div>
              <div className="text-lg text-gray-600">Score: {testState.score}%</div>
            </div>
          </motion.div>

          {/* Results List */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Answers:</h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    result.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`text-2xl mr-3 ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {result.isCorrect ? '✅' : '❌'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          Correct: <span className="text-purple-600">{result.word}</span>
                        </div>
                        <div className="text-gray-600">
                          Your answer: <span className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {result.userAnswer || '(no answer)'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => speakWord(result.word)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors"
                      disabled={isPlaying}
                    >
                      🔊
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={restartTest}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              Take Test Again
            </button>
            <button
              onClick={() => navigate('/spelling-grades')}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors shadow-lg"
            >
              Choose Different Grade
            </button>
            <button
              onClick={() => navigate('/category/academic')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              Back to Academic Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Grade {grade} Spelling Test</h1>
          <p className="text-gray-600 mb-4">{getGradeDescription(parseInt(grade || '1'))}</p>
          
          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-sm text-gray-600">
            Question {testState.currentWordIndex + 1} of {words.length}
          </div>
        </motion.div>

        {/* Current Word Test */}
        <AnimatePresence mode="wait">
          <motion.div
            key={testState.currentWordIndex}
            className="bg-white rounded-2xl p-8 shadow-lg mb-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Listen to the word and spell it:
              </h2>
              
              {/* Speaker Button */}
              <motion.button
                onClick={() => speakWord(currentWord.word)}
                disabled={isPlaying}
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl mb-6 transition-all duration-200 ${
                  isPlaying
                    ? 'bg-purple-200 text-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 shadow-lg'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? '⏸️' : '🔊'}
              </motion.button>
              
              <div className="mb-4 text-sm text-gray-500">
                {isPlaying ? 'Playing word...' : 'Click the speaker to hear the word'}
              </div>

              {/* Input Field */}
              <div className="mb-6">
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(currentWord.id, e.target.value)}
                  placeholder="Type your spelling here..."
                  className="w-full max-w-md px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* Difficulty Indicator */}
              <div className="mb-6">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  currentWord.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  currentWord.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentWord.difficulty.charAt(0).toUpperCase() + currentWord.difficulty.slice(1)} Word
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={goToPreviousWord}
            disabled={testState.currentWordIndex === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              testState.currentWordIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
            }`}
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {words.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === testState.currentWordIndex
                    ? 'bg-purple-600'
                    : testState.answers[words[index]?.id]
                    ? 'bg-green-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {testState.currentWordIndex === words.length - 1 ? (
            <button
              onClick={submitTest}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
            >
              Submit Test
            </button>
          ) : (
            <button
              onClick={goToNextWord}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
            >
              Next →
            </button>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/spelling-grades')}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
          >
            ← Back to Grade Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpellingTest;