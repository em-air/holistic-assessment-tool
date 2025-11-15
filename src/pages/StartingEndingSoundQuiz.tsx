import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Volume2, RotateCcw } from 'lucide-react';
import { getWordsByGrade } from '../data/startingEndingSoundData';
import { generateQuizQuestions, AudioPlayer, calculateQuizStats } from '../utils/soundQuizUtils';
import { QuestionData, QuizResult } from '../data/startingEndingSoundData';
import { ProgressTracker } from '../utils/progressTracker';
import SoundQuestionDisplay from '../components/SoundQuestionDisplay';
import SoundOptionButtons from '../components/SoundOptionButtons';
import FeedbackMessage from '../components/FeedbackMessage';

const StartingEndingSoundQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { grade: gradeParam } = useParams<{ grade: string }>();
  const grade = parseInt(gradeParam || '1');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | null; message: string }>({ type: null, message: '' });
  const [score, setScore] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState<number[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = 10;

  // Initialize quiz questions
  useEffect(() => {
    console.log('Initializing quiz for grade:', grade);
    console.log('Grade param from URL:', gradeParam);
    try {
      const words = getWordsByGrade(grade);
      console.log('Words for grade:', words.length, words);
      if (words.length === 0) {
        console.error('No words found for grade:', grade);
        return;
      }
      const quizQuestions = generateQuizQuestions(words, totalQuestions);
      console.log('Generated questions:', quizQuestions.length, quizQuestions);
      setQuestions(quizQuestions);
      setQuestionStartTime(new Date());
    } catch (error) {
      console.error('Error initializing quiz:', error);
    }
  }, [grade, gradeParam]);

  // Removed automatic audio playback - now only plays when listen button is clicked

  const playQuestionAudio = async () => {
    if (!currentQuestion) return;
    
    setIsAudioLoading(true);
    try {
      await AudioPlayer.playAudio(currentQuestion.question.audioUrl, currentQuestion.question.word);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || showNext) return;

    setSelectedAnswer(answer);
    const questionTime = (new Date().getTime() - questionStartTime.getTime()) / 1000;
    setTimePerQuestion([...timePerQuestion, questionTime]);

    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback({ type: 'correct', message: 'Correct!' });
    } else {
      setFeedback({ 
        type: 'incorrect', 
        message: `Not quite! The ${currentQuestion.questionType} sound is "${currentQuestion.correctAnswer}"` 
      });
    }

    setShowNext(true);

    // Auto-advance after 2 seconds
    setTimeout(() => {
      handleNext();
    }, 2000);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setFeedback({ type: null, message: '' });
      setShowNext(false);
      setQuestionStartTime(new Date());
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setIsQuizComplete(true);
    
    const stats = calculateQuizStats([...timePerQuestion]);
    const percentage = Math.round((score / questions.length) * 100);
    
    const result: QuizResult = {
      totalQuestions: questions.length,
      correctAnswers: score,
      incorrectAnswers: questions.length - score,
      timePerQuestion: [...timePerQuestion],
      totalTime: stats.totalTime,
      percentage,
      grade
    };

    // Save to progress tracker
    ProgressTracker.saveQuizResult({
      quizId: 'starting-ending-sound-quiz',
      quizName: 'Beginning & Ending Sounds',
      subcategory: 'phonics-awareness',
      score: score,
      totalQuestions: questions.length,
      percentage: percentage,
      timeSpent: Math.round(stats.totalTime),
      completedAt: new Date().toISOString(),
      gradeLevel: `Grade ${grade}`,
      additionalData: { result }
    });
  };

  const handleRestart = () => {
    const words = getWordsByGrade(grade);
    const quizQuestions = generateQuizQuestions(words, totalQuestions);
    setQuestions(quizQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setFeedback({ type: null, message: '' });
    setScore(0);
    setTimePerQuestion([]);
    setQuestionStartTime(new Date());
    setIsQuizComplete(false);
    setShowNext(false);
  };

  // Show loading screen while questions are being generated
  if (questions.length === 0 && !isQuizComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading Grade {grade} Questions...</div>
          <div className="text-sm text-gray-500 mt-2">Preparing your phonics quiz</div>
        </div>
      </div>
    );
  }
  
  // Show error if no current question but questions exist
  if (!currentQuestion && questions.length > 0 && !isQuizComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="text-xl text-red-600 mb-4">Error Loading Question</div>
          <button 
            onClick={() => navigate('/starting-ending-sound-quiz')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isQuizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const stats = calculateQuizStats(timePerQuestion);

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-purple-600 mb-4">Quiz Complete!</h2>
          <div className="text-6xl mb-4">🎯</div>
          
          <div className="space-y-3 mb-6">
            <p className="text-xl text-gray-700">
              Score: <span className="font-bold text-green-600">{score}</span> out of{" "}
              <span className="font-bold">{questions.length}</span>
            </p>
            <p className="text-lg text-gray-600">
              Accuracy: <span className="font-bold text-blue-600">{percentage}%</span>
            </p>
            <p className="text-sm text-gray-500">
              Total Time: {Math.floor(stats.totalTime / 60)}m {Math.floor(stats.totalTime % 60)}s
            </p>
            <p className="text-sm text-gray-500">
              Grade {grade} • Beginning & Ending Sounds
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={handleRestart}
              className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors shadow-lg"
            >
              <RotateCcw size={20} />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => navigate('/phonics-quiz-selection/oral-skills')}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors shadow-lg"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
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

      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-3xl shadow-lg p-6 max-w-4xl w-full">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-600 font-medium">
                Score: {score}
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

          {/* Question type instruction */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {currentQuestion.questionType === 'beginning' 
                ? 'Select the beginning sound' 
                : 'Select the ending sound'
              }
            </h1>
            <p className="text-lg text-gray-600">
              Listen to the word and choose the {currentQuestion.questionType} sound
            </p>
          </div>

          {/* Question Display */}
          <SoundQuestionDisplay 
            question={currentQuestion}
            grade={grade}
            onPlayAudio={playQuestionAudio}
            isAudioLoading={isAudioLoading}
          />

          {/* Answer Options */}
          <SoundOptionButtons
            options={currentQuestion.options}
            selectedAnswer={selectedAnswer}
            correctAnswer={currentQuestion.correctAnswer}
            onAnswerSelect={handleAnswerSelect}
            showNext={showNext}
          />

          {/* Feedback */}
          <FeedbackMessage feedback={feedback} />

          {/* Next Button */}
          {showNext && (
            <div className="text-center mt-6">
              <button
                onClick={handleNext}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors shadow-lg"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartingEndingSoundQuiz;