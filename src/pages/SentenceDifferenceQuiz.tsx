import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle } from 'lucide-react';
import { ProgressTracker } from '../utils/progressTracker';
import { ROUTES } from '../routes';
import FloatingBackground from '../components/FloatingBackground';
import {
  getSentenceDifferenceQuestions,
  type SentenceDifferenceQuestion,
} from '../services/sentenceDifferenceService';

const SentenceDifferenceQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<SentenceDifferenceQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedWordsA, setSelectedWordsA] = useState<number[]>([]);
  const [selectedWordsB, setSelectedWordsB] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [startTime] = useState<Date>(new Date());

  const currentQuestion = questions[currentQuestionIndex];

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const loadedQuestions = await getSentenceDifferenceQuestions();
        if (loadedQuestions.length > 0) {
          const shuffled = [...loadedQuestions].sort(() => Math.random() - 0.5);
          setQuestions(shuffled.slice(0, 10)); // Limit to 10 questions
        } else {
          throw new Error('No sentence difference questions are available.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Find the indices of different words between sentences
  const getDifferentWordIndices = (question: SentenceDifferenceQuestion): { indicesA: number[], indicesB: number[] } => {
    const wordsA = question.sentenceA.toLowerCase().replace(/[.,!?]/g, '').split(' ');
    const wordsB = question.sentenceB.toLowerCase().replace(/[.,!?]/g, '').split(' ');

    const indicesA: number[] = [];
    const indicesB: number[] = [];

    for (let i = 0; i < Math.max(wordsA.length, wordsB.length); i++) {
      if (wordsA[i] !== wordsB[i]) {
        if (wordsA[i]) indicesA.push(i);
        if (wordsB[i]) indicesB.push(i);
      }
    }

    return { indicesA, indicesB };
  };

  const handleWordClick = (sentenceType: 'A' | 'B', wordIndex: number) => {
    if (showNext || !currentQuestion) return;

    if (sentenceType === 'A') {
      if (selectedWordsA.includes(wordIndex)) {
        setSelectedWordsA(selectedWordsA.filter(i => i !== wordIndex));
      } else {
        setSelectedWordsA([...selectedWordsA, wordIndex]);
      }
    } else {
      if (selectedWordsB.includes(wordIndex)) {
        setSelectedWordsB(selectedWordsB.filter(i => i !== wordIndex));
      } else {
        setSelectedWordsB([...selectedWordsB, wordIndex]);
      }
    }
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;

    const { indicesA, indicesB } = getDifferentWordIndices(currentQuestion);

    const selectedCorrectA = indicesA.every(index => selectedWordsA.includes(index));
    const selectedCorrectB = indicesB.every(index => selectedWordsB.includes(index));
    const noExtraSelections = selectedWordsA.length === indicesA.length && selectedWordsB.length === indicesB.length;

    if (selectedCorrectA && selectedCorrectB && noExtraSelections) {
      setFeedbackMessage("excellent! you found all the differences.");
      setScore(score + 1);
      setShowNext(true);

      setTimeout(() => {
        handleNext();
      }, 2000);
    } else if (selectedWordsA.length > 0 || selectedWordsB.length > 0) {
      setFeedbackMessage("not quite right. keep looking for the differences!");
    }
  };

  useEffect(() => {
    if (currentQuestion) {
      checkAnswer();
    }
  }, [selectedWordsA, selectedWordsB]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedWordsA([]);
      setSelectedWordsB([]);
      setFeedbackMessage("");
      setShowNext(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleFinish = () => {
    const percentage = Math.round((score / questions.length) * 100);
    ProgressTracker.saveQuizResult({
      quizId: 'sentence-difference-quiz',
      quizName: 'Sentence Difference Quiz',
      subcategory: 'perception',
      score: score,
      totalQuestions: questions.length,
      percentage: percentage,
      timeSpent: Math.round((new Date().getTime() - startTime.getTime()) / 1000),
      completedAt: new Date().toISOString()
    });

    navigate(ROUTES.PERCEPTION_SELECTION);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to Load</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(ROUTES.PERCEPTION_SELECTION)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isQuizComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-purple-600 mb-4">quiz complete!</h2>
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-xl text-gray-700 mb-6">
            you identified <span className="font-bold text-green-600">{score}</span> out of{" "}
            <span className="font-bold">{questions.length}</span> differences correctly!
          </p>
          <div className="mb-6">
            <div className="text-lg text-gray-600">
              accuracy: <span className="font-bold text-blue-600">{Math.round((score / questions.length) * 100)}%</span>
            </div>
          </div>
          <button
            onClick={handleFinish}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
          >
            continue
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 relative overflow-hidden p-4">
      <FloatingBackground />
      {/* Header with back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate(ROUTES.PERCEPTION_SELECTION)}
          className="group flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white/60 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-white/80 hover:shadow-md transform hover:scale-105"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">back</span>
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-3xl shadow-lg p-6 max-w-4xl w-full">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 font-medium">
                question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-600 font-medium">
                score: {score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">find the differences</h1>
            <p className="text-lg text-gray-600">
              read both sentences carefully and click on the words that are different
            </p>
          </div>

          {/* Sentences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
              <div className="text-sm text-yellow-700 font-medium mb-2">sentence a:</div>
              <div className="text-xl text-gray-800 leading-relaxed">
                {currentQuestion.sentenceA.split(' ').map((word, index) => (
                  <span
                    key={index}
                    onClick={() => handleWordClick('A', index)}
                    className={`cursor-pointer hover:bg-yellow-200 px-1 rounded transition-colors ${selectedWordsA.includes(index) ? 'bg-blue-300 text-blue-800' : ''
                      }`}
                  >
                    {word}{index < currentQuestion.sentenceA.split(' ').length - 1 ? ' ' : ''}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
              <div className="text-sm text-blue-700 font-medium mb-2">sentence b:</div>
              <div className="text-xl text-gray-800 leading-relaxed">
                {currentQuestion.sentenceB.split(' ').map((word, index) => (
                  <span
                    key={index}
                    onClick={() => handleWordClick('B', index)}
                    className={`cursor-pointer hover:bg-blue-200 px-1 rounded transition-colors ${selectedWordsB.includes(index) ? 'bg-blue-300 text-blue-800' : ''
                      }`}
                  >
                    {word}{index < currentQuestion.sentenceB.split(' ').length - 1 ? ' ' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mb-6">
            <p className="text-lg text-gray-600">
              click on the words that are different between the two sentences
            </p>
          </div>

          {/* Feedback */}
          {feedbackMessage && (
            <div className="text-center mb-4">
              <p
                className={`text-xl font-bold ${feedbackMessage.includes("excellent")
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {feedbackMessage}
              </p>
            </div>
          )}

          {/* Next button (only shown after correct answer) */}
          {showNext && (
            <div className="text-center">
              <button
                onClick={handleNext}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors shadow-lg"
              >
                {currentQuestionIndex < questions.length - 1 ? "next question" : "finish quiz"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentenceDifferenceQuiz;