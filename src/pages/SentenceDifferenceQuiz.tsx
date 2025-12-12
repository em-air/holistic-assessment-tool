import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { sentenceDifferenceQuestions, SentenceDifferenceQuestion } from '../data/sentenceDifferenceData';
import { ProgressTracker } from '../utils/progressTracker';

const SentenceDifferenceQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedWordsA, setSelectedWordsA] = useState<number[]>([]);
  const [selectedWordsB, setSelectedWordsB] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [startTime] = useState<Date>(new Date());

  const currentQuestion = sentenceDifferenceQuestions[currentQuestionIndex];

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
    if (showNext) return; // Prevent clicking after correct answer

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
    const { indicesA, indicesB } = getDifferentWordIndices(currentQuestion);
    
    // Check if user selected all the different words
    const selectedCorrectA = indicesA.every(index => selectedWordsA.includes(index));
    const selectedCorrectB = indicesB.every(index => selectedWordsB.includes(index));
    const noExtraSelections = selectedWordsA.length === indicesA.length && selectedWordsB.length === indicesB.length;
    
    if (selectedCorrectA && selectedCorrectB && noExtraSelections) {
      setFeedbackMessage("excellent! you found all the differences.");
      setScore(score + 1);
      setShowNext(true);

      // Auto-advance after 2 seconds
      setTimeout(() => {
        handleNext();
      }, 2000);
    } else if (selectedWordsA.length > 0 || selectedWordsB.length > 0) {
      setFeedbackMessage("not quite right. keep looking for the differences!");
    }
  };



  useEffect(() => {
    checkAnswer();
  }, [selectedWordsA, selectedWordsB]);

  const handleNext = () => {
    if (currentQuestionIndex < sentenceDifferenceQuestions.length - 1) {
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
    // Save quiz result to progress tracker
    const percentage = Math.round((score / sentenceDifferenceQuestions.length) * 100);
    ProgressTracker.saveQuizResult({
      quizId: 'sentence-difference-quiz',
      quizName: 'Sentence Difference Quiz',
      subcategory: 'perception',
      score: score,
      totalQuestions: sentenceDifferenceQuestions.length,
      percentage: percentage,
      timeSpent: Math.round((new Date().getTime() - startTime.getTime()) / 1000),
      completedAt: new Date().toISOString()
    });

    // Route back to perception quiz selection
    navigate('/perception-quiz-selection/mind');
  };



  if (isQuizComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-purple-600 mb-4">quiz complete!</h2>
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-xl text-gray-700 mb-6">
            you identified <span className="font-bold text-green-600">{score}</span> out of{" "}
            <span className="font-bold">{sentenceDifferenceQuestions.length}</span> differences correctly!
          </p>
          <div className="mb-6">
            <div className="text-lg text-gray-600">
              accuracy: <span className="font-bold text-blue-600">{Math.round((score / sentenceDifferenceQuestions.length) * 100)}%</span>
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
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
      {/* Header with back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate('/perception-quiz-selection/mind')}
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
                question {currentQuestionIndex + 1} of {sentenceDifferenceQuestions.length}
              </span>
              <span className="text-sm text-gray-600 font-medium">
                score: {score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / sentenceDifferenceQuestions.length) * 100}%`,
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
                    className={`cursor-pointer hover:bg-yellow-200 px-1 rounded transition-colors ${
                      selectedWordsA.includes(index) ? 'bg-blue-300 text-blue-800' : ''
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
                    className={`cursor-pointer hover:bg-blue-200 px-1 rounded transition-colors ${
                      selectedWordsB.includes(index) ? 'bg-blue-300 text-blue-800' : ''
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
                className={`text-xl font-bold ${
                  feedbackMessage.includes("excellent")
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
                {currentQuestionIndex < sentenceDifferenceQuestions.length - 1 ? "next question" : "finish quiz"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentenceDifferenceQuiz;