import React from 'react';
import { QuizQuestion as QuizQuestionType } from '../types';
interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer: string | number | null;
  onAnswerSelect: (answer: string | number) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
}) => {
  const handleAnswerSelect = (answer: string | number) => {
    onAnswerSelect(answer);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
          {question.question}
        </h2>
      </div>

      <div className="space-y-4">
        {question.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(question.type === 'rating' ? index + 1 : option)}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
              selectedAnswer === (question.type === 'rating' ? index + 1 : option)
                ? 'border-mind-500 bg-mind-50'
                : 'border-gray-200 hover:border-mind-300 hover:bg-gray-50'
            }`}
          >
            <span className="text-gray-700 font-medium">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizQuestion;