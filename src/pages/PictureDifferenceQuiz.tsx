import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProgressTracker } from '../utils/progressTracker';
import { ROUTES } from '../routes';
import FloatingBackground from '../components/FloatingBackground';

interface PictureDifferencePair {
  id: number;
  imageA: string;
  imageB: string;
  hasDifference: boolean;
}

const QUESTIONS: PictureDifferencePair[] = [
  { id: 1, imageA: 'https://i.postimg.cc/VkJ6GyG9/05098f55-883b-4147-8d3d-d4841d7d6da3.jpg', imageB: 'https://i.postimg.cc/QMxr4cdx/diff1.png', hasDifference: true },
  { id: 2, imageA: 'https://i.postimg.cc/VkX6Q9wC/cls1.avif', imageB: 'https://i.postimg.cc/1zH349f5/cls2.png', hasDifference: true },
  { id: 3, imageA: 'https://i.postimg.cc/SKNJ620G/cty1.avif', imageB: 'https://i.postimg.cc/SKNJ620G/cty1.avif', hasDifference: false },
  { id: 4, imageA: 'https://i.postimg.cc/8zwCzpFg/schlyrd.avif', imageB: 'https://i.postimg.cc/8zwCzpFg/schlyrd.avif', hasDifference: false },
  { id: 5, imageA: 'https://i.postimg.cc/hGx30j9R/pnclset1.avif', imageB: 'https://i.postimg.cc/kGjj5tdt/pnclset2.png', hasDifference: true },
];

const PictureDifferenceQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [startTime] = useState<Date>(new Date());
  // null = not yet detected, true = landscape (wide), false = portrait/square (tall)
  const [isLandscape, setIsLandscape] = useState<boolean | null>(null);

  const currentQuestion = QUESTIONS[currentIndex];

  // Re-detect aspect ratio whenever the question changes
  useEffect(() => {
    setIsLandscape(null);
    if (!currentQuestion.imageA) return;
    const img = new Image();
    img.onload = () => {
      setIsLandscape(img.naturalWidth > img.naturalHeight);
    };
    img.src = currentQuestion.imageA;
  }, [currentIndex, currentQuestion.imageA]);

  // Layout derived from aspect ratio
  // Landscape: very wide card, shorter image boxes
  // Portrait/square: standard card, taller image boxes
  const cardMaxWidth = isLandscape ? '90rem' : '56rem';
  const imageMinHeight = isLandscape ? '320px' : '400px';

  const handleAnswer = (isDifferent: boolean) => {
    if (answered) return;
    setAnswered(true);

    const correct = isDifferent === currentQuestion.hasDifference;
    if (correct) {
      setScore(s => s + 1);
      setFeedbackMessage('correct!');
      setFeedbackCorrect(true);
    } else {
      setFeedbackMessage('not quite!');
      setFeedbackCorrect(false);
    }

    setTimeout(() => {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex(i => i + 1);
        setFeedbackMessage('');
        setAnswered(false);
      } else {
        setIsQuizComplete(true);
      }
    }, 1200);
  };

  const handleFinish = () => {
    const percentage = Math.round((score / QUESTIONS.length) * 100);
    ProgressTracker.saveQuizResult({
      quizId: 'picture-difference-quiz',
      quizName: 'Picture Difference Test',
      subcategory: 'perception',
      score,
      totalQuestions: QUESTIONS.length,
      percentage,
      timeSpent: Math.round((new Date().getTime() - startTime.getTime()) / 1000),
      completedAt: new Date().toISOString(),
    });
    navigate(ROUTES.PERCEPTION_SELECTION);
  };

  if (isQuizComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-purple-600 mb-4">quiz complete!</h2>
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-xl text-gray-700 mb-6">
            you got <span className="font-bold text-green-600">{score}</span> out of{' '}
            <span className="font-bold">{QUESTIONS.length}</span> correct!
          </p>
          <div className="mb-6">
            <div className="text-lg text-gray-600">
              accuracy:{' '}
              <span className="font-bold text-blue-600">
                {Math.round((score / QUESTIONS.length) * 100)}%
              </span>
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

  return (
    <div className="min-h-screen bg-blue-50 relative overflow-hidden p-4">
      <FloatingBackground />

      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate(ROUTES.PERCEPTION_SELECTION)}
          className="group flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white/60 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-white/80 hover:shadow-md transform hover:scale-105"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">back</span>
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen relative z-10 py-16">
        <div
          className="bg-white rounded-3xl shadow-lg p-6 w-full transition-all duration-300"
          style={{ maxWidth: cardMaxWidth }}
        >
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 font-medium">
                question {currentIndex + 1} of {QUESTIONS.length}
              </span>
              <span className="text-sm text-gray-600 font-medium">score: {score}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">picture difference test</h1>
            <p className="text-lg text-gray-600">
              look carefully at both images — are they the same or different?
            </p>
          </div>

          {/* Image pair */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {[currentQuestion.imageA, currentQuestion.imageB].map((src, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center transition-all duration-300"
                style={{ minHeight: imageMinHeight }}
              >
                {src ? (
                  <img
                    src={src}
                    alt={`Image ${i === 0 ? 'A' : 'B'}`}
                    draggable={false}
                    className="w-full h-full object-contain select-none pointer-events-none"
                    style={{ userSelect: 'none' }}
                  />
                ) : (
                  <div className="text-gray-400 text-sm text-center p-4">
                    <div className="text-4xl mb-2">🖼️</div>
                    <div>image {i === 0 ? 'A' : 'B'}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Feedback */}
          {feedbackMessage && (
            <div className="text-center mb-4">
              <p className={`text-xl font-bold ${feedbackCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {feedbackMessage}
              </p>
            </div>
          )}

          {/* Answer buttons */}
          <div className="flex justify-center gap-6">
            <button
              onClick={() => handleAnswer(true)}
              disabled={answered}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-full text-lg transition-colors shadow-lg"
            >
              Different
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={answered}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-full text-lg transition-colors shadow-lg"
            >
              Not Different
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PictureDifferenceQuiz;
