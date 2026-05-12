import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressTracker } from '../utils/progressTracker';
import { ROUTES } from '../routes';
import FloatingBackground from './FloatingBackground';
import {
  getMissingObjectQuestions,
  validateMissingObjectQuestion,
  type MissingObjectQuestion,
} from '../services/missingObjectService';

const MissingObjectQuiz: React.FC = () => {
  const [questions, setQuestions] = useState<MissingObjectQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const navigate = useNavigate();

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError(null);

      const loadedQuestions = await getMissingObjectQuestions();
      if (loadedQuestions.length === 0) {
        setError('Missing object questions are unavailable right now.');
      } else {
        setQuestions(loadedQuestions);
      }

      setLoading(false);
    };

    void loadQuestions();
  }, []);

  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer || !currentQuestion) return;

    setSelectedAnswer(answer);

    const result = await validateMissingObjectQuestion(currentQuestion.id, answer);
    if (!result) {
      setFeedbackMessage('Unable to validate your answer right now.');
      setShowNext(true);
      return;
    }

    if (result.correct) {
      setFeedbackMessage("great job! that's right.");
      setScore(score + 1);
    } else {
      setFeedbackMessage(`not quite. the answer was: ${result.correctAnswer}`);
    }

    setShowNext(true);

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setFeedbackMessage("");
      setShowNext(false);
    } else {
      setIsQuizComplete(true);
    }
  };
  const handleFinish = () => {
    // Save quiz result to progress tracker
    const percentage = Math.round((score / questions.length) * 100);
    ProgressTracker.saveQuizResult({
      quizId: 'missing-object-quiz',
      quizName: 'Perception Quiz',
      subcategory: 'perception',
      score: score,
      totalQuestions: questions.length,
      percentage: percentage,
      timeSpent: Math.round((new Date().getTime() - startTime.getTime()) / 1000),
      completedAt: new Date().toISOString()
    });

    // Route back to mind category
    navigate(ROUTES.CATEGORY_MIND, { replace: true });
  };

  const resetForRetry = () => {
    setSelectedAnswer(null);
    setFeedbackMessage("");
  };

  useEffect(() => {
    // Reset state when feedback clears
    if (!feedbackMessage && selectedAnswer) {
      resetForRetry();
    }
  }, [feedbackMessage, selectedAnswer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-teal-50 relative overflow-hidden p-4">
        <FloatingBackground />
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center relative z-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading missing object quiz</h2>
          <p className="text-gray-600">Fetching question content...</p>
        </div>
      </div>
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-teal-50 relative overflow-hidden p-4">
        <FloatingBackground />
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center relative z-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Unavailable</h2>
          <p className="text-gray-600 mb-6">{error ?? 'Missing object questions could not be loaded.'}</p>
          <button
            onClick={() => navigate(ROUTES.PERCEPTION_SELECTION)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (isQuizComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-teal-50 relative overflow-hidden p-4">
        <FloatingBackground />
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center relative z-10">
          <h2 className="text-3xl font-bold text-purple-600 mb-4">quiz complete!</h2>
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-xl text-gray-700 mb-6">
            you got <span className="font-bold text-green-600">{score}</span> out of{" "}
            <span className="font-bold">{questions.length}</span> correct!
          </p>
          <button
            onClick={handleFinish}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-teal-50 relative overflow-hidden p-4">
      <FloatingBackground />
      <div className="bg-white rounded-3xl shadow-lg p-6 max-w-2xl w-full relative z-10">
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

        {/* Image */}
        <div className="mb-6 bg-gray-100 rounded-2xl p-4">
          <img
            src={currentQuestion.image}
            alt="missing object puzzle"
            className="w-full max-h-80 object-contain rounded-2xl shadow-md mx-auto"
            onError={(e) => {
              // Fallback for broken images
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300/f0f0f0/999999?text=Image+Loading...";
            }}
          />
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-4 mb-6">
          {currentQuestion.options.map((option) => {
            let buttonClass = "w-full p-4 text-left rounded-2xl border-2 transition-all duration-200 text-lg font-medium ";
            
            if (selectedAnswer) {
              if (option === currentQuestion.correctAnswer) {
                buttonClass += "bg-green-100 border-green-500 text-green-700";
              } else if (selectedAnswer === option) {
                buttonClass += "bg-red-100 border-red-500 text-red-700";
              } else {
                buttonClass += "bg-gray-50 border-gray-200 text-gray-400";
              }
            } else {
              buttonClass += "bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer text-gray-800";
            }

            const isDisabled = !!selectedAnswer;

            return (
              <button
                key={option}
                onClick={() => !isDisabled && handleAnswerSelect(option)}
                disabled={isDisabled}
                className={buttonClass}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {feedbackMessage && (
          <div className="text-center mb-4">
            <p
              className={`text-xl font-bold ${
                feedbackMessage.includes("great job")
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
  );
};

export default MissingObjectQuiz;
