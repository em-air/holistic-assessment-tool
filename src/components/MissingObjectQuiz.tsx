import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressTracker } from '../utils/progressTracker';
import { ROUTES } from '../routes';

interface Question {
  id: number;
  image: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

const questions: Question[] = [
  {
    id: 1,
    image: "https://media.istockphoto.com/id/184304316/photo/clear-blue-sky-background-with-scattered-clouds.jpg?s=612x612&w=0&k=20&c=oGOHpTuDsHFdnYkGDloZIBWY_S78oY8KO_BUFUn3Am0=",
    question: "what is missing from this picture?",
    options: ["a tree", "the sun", "a car"],
    correctAnswer: "the sun",
  },
  {
    id: 2,
    image: "data:image/jpeg;base64,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",
    question: "what is missing from this person?",
    options: ["a hat", "a shoe", "a glove"],
    correctAnswer: "a shoe",
  },
  {
    id: 3,
    image: "https://i.redd.it/lfksd5y0xgx41.jpg",
    question: "what part is missing from this animal?",
    options: ["an ear", "a tail", "a paw"],
    correctAnswer: "an ear",
  },
  {
    id: 4,
    image: "https://i.pinimg.com/736x/da/5e/1b/da5e1ba6933edeef5ba0af8361e9d94b.jpg",
    question: "what is missing from the table?",
    options: ["a leg", "a plate", "a chair"],
    correctAnswer: "a leg",
  },
  {
    id: 5,
    image: "https://content.mycutegraphics.com/graphics/household/clock-without-hands.png",
    question: "what is missing from this clock?",
    options: ["a number", "a hand", "a frame"],
    correctAnswer: "a hand",
  },
  {
    id: 6,
    image: "https://www.pngkey.com/png/detail/183-1834807_clipart-smile-cartoon-face-cartoon-face-without-nose.png",
    question: "what is missing from this face?",
    options: ["a nose", "an ear", "a hat"],
    correctAnswer: "a nose",
  },
  {
    id: 7,
    image: "https://c7.alamy.com/comp/KK6PGC/violet-modern-cartoon-colored-cabriolet-car-isolated-on-transparent-KK6PGC.jpg",
    question: "what is missing from this car?",
    options: ["a door", "tires", "windows"],
    correctAnswer: "windows",
  },
  {
    id: 8,
    image: "https://previews.123rf.com/images/markusgann/markusgann0806/markusgann080600081/3189361-a-photography-of-a-house-without-door-and-windows.jpg",
    question: "what is missing from this house?",
    options: ["a door", "a window", "a roof"],
    correctAnswer: "a door",
  },
  {
    id:9,
    image: "https://cdn.outsideonline.com/wp-content/uploads/2022/11/Soja-1024x640.jpg",
    question: "what is missing from this bicycle?",
    options: ["a seat", "a handlebar", "wheels"],
    correctAnswer: "a handlebar",
  }
];

const MissingObjectQuiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const navigate = useNavigate();

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return; // Prevent multiple selections

    setSelectedAnswer(answer);

    if (answer === currentQuestion.correctAnswer) {
      setFeedbackMessage("great job! that's right.");
      setScore(score + 1);
    } else {
      setFeedbackMessage(`not quite. the answer was: ${currentQuestion.correctAnswer}`);
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
    navigate(ROUTES.CATEGORY_MIND);
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

  if (isQuizComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
      <div className="bg-white rounded-3xl shadow-lg p-6 max-w-2xl w-full">
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
