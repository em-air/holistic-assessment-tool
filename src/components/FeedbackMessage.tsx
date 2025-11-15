import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface FeedbackMessageProps {
  feedback: {
    type: 'correct' | 'incorrect' | null;
    message: string;
  };
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({ feedback }) => {
  if (!feedback.type || !feedback.message) {
    return null;
  }

  const isCorrect = feedback.type === 'correct';

  return (
    <div className={`text-center mb-6 animate-fade-in`}>
      <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-lg ${
        isCorrect 
          ? 'bg-green-100 border-2 border-green-300 text-green-800'
          : 'bg-red-100 border-2 border-red-300 text-red-800'
      }`}>
        {isCorrect ? (
          <CheckCircle size={28} className="text-green-600" />
        ) : (
          <XCircle size={28} className="text-red-600" />
        )}
        <span className="text-xl font-bold">{feedback.message}</span>
      </div>
    </div>
  );
};

export default FeedbackMessage;