import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import QuizQuestion from '../components/QuizQuestion';
import { assessmentCategories } from '../data/assessmentData';
import { QuizResult } from '../types';
import FloatingBackground from '../components/FloatingBackground'; 

const QuizPage: React.FC = () => {
  const { categoryId, subcategoryId } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string | number }>({});
  const [showResults, setShowResults] = useState<null | {
    focusingScore: number;
    shiftingScore: number;
    totalScore: number;
    focusingLevel: string;
    shiftingLevel: string;
  }>(null);

  const category = assessmentCategories.find(cat => cat.id === categoryId);
  const subcategory = category?.subcategories.find(sub => sub.id === subcategoryId);

  if (!category || !subcategory || !subcategory.questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 flex items-center justify-center">
        <FloatingBackground />
        <div className="text-center bg-stone-100 p-8 rounded-2xl shadow-xl relative z-10">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Quiz not found</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 hover:bg-emerald-700 text-stone-100 px-6 py-3 rounded-full"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = subcategory.questions[currentQuestionIndex];
  const totalQuestions = subcategory.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleAnswerSelect = (answer: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      calculateResults();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => prev - 1);
  };

  const calculateResults = () => {
    let focusingScore = 0;
    let shiftingScore = 0;

    subcategory.questions.forEach((question) => {
      const userValue = answers[question.id] as number;
      if (typeof userValue !== "number") return;

      const score = question.reverse ? 6 - userValue : userValue;

      if (question.subscale === "Focusing") {
        focusingScore += score;
      } else if (question.subscale === "Shifting") {
        shiftingScore += score;
      }
    });

    const totalScore = focusingScore + shiftingScore;

    const focusingLevel =
      focusingScore <= 15 ? "Low" : focusingScore <= 24 ? "Average" : "High";
    const shiftingLevel =
      shiftingScore <= 17 ? "Low" : shiftingScore <= 28 ? "Average" : "High";

    setShowResults({
      focusingScore,
      shiftingScore,
      totalScore,
      focusingLevel,
      shiftingLevel,
    });
  };

  if (showResults) {
    const { focusingScore, shiftingScore, totalScore, focusingLevel, shiftingLevel } = showResults;

    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-amber-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-stone-50 rounded-2xl p-8 shadow-xl text-center border border-stone-200">
              <h1 className="text-3xl font-bold text-stone-800 mb-4">Assessment Complete!</h1>
              <h2 className="text-xl text-stone-600 mb-8">{subcategory.title} Results</h2>
              
              <div className="mb-8 space-y-2">
                <div className="text-lg text-stone-700">
                  <strong>Focusing Score:</strong> {focusingScore} / 30 ({focusingLevel})
                </div>
                <div className="text-lg text-stone-700">
                  <strong>Shifting Score:</strong> {shiftingScore} / 35 ({shiftingLevel})
                </div>
                <div className="text-lg text-stone-700">
                  <strong>Total Score:</strong> {totalScore} / 65
                </div>
              </div>
              <div className="mb-8">
                <p className="text-lg font-semibold text-emerald-700">
                  {focusingLevel === "Low" || shiftingLevel === "Low"
                    ? "Some areas need development."
                    : "Great job! Your attention skills are strong."}
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => navigate(`/category/${categoryId}`)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-stone-100 font-semibold py-3 px-6 rounded-full transition-colors duration-200"
                >
                  Take Another Assessment
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-stone-500 hover:bg-stone-600 text-stone-100 font-semibold py-3 px-6 rounded-full transition-colors duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 py-8">
      <FloatingBackground />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(`/category/${categoryId}`)}
            className="flex items-center space-x-2 text-stone-600 hover:text-emerald-700"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-stone-800">{subcategory.title} Assessment</h1>
            <p className="text-stone-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          
          <div className="w-16"></div>
        </div>

        <div className="mb-8">
          <div className="bg-stone-200 rounded-full h-2 max-w-md mx-auto">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        <QuizQuestion
          question={currentQuestion}
          selectedAnswer={answers[currentQuestion.id] || null}
          onAnswerSelect={handleAnswerSelect}
        />

        <div className="flex justify-between max-w-2xl mx-auto mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-stone-500 text-stone-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-600 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-stone-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors duration-200"
          >
            <span>{isLastQuestion ? 'Finish' : 'Next'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;