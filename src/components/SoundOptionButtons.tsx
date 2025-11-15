import React from 'react';

interface SoundOptionButtonsProps {
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  onAnswerSelect: (answer: string) => void;
  showNext: boolean;
}

const SoundOptionButtons: React.FC<SoundOptionButtonsProps> = ({
  options,
  selectedAnswer,
  correctAnswer,
  onAnswerSelect,
  showNext
}) => {
  const getButtonStyle = (option: string) => {
    let baseClass = "p-6 text-center rounded-2xl border-3 transition-all duration-300 text-2xl font-bold shadow-lg transform hover:scale-105 min-h-[80px] flex items-center justify-center ";
    
    if (selectedAnswer === option) {
      if (option === correctAnswer) {
        return baseClass + "bg-green-100 border-green-500 text-green-700 scale-105";
      } else {
        return baseClass + "bg-red-100 border-red-500 text-red-700 scale-105";
      }
    }
    
    if (showNext && option === correctAnswer) {
      return baseClass + "bg-green-100 border-green-500 text-green-700 animate-pulse";
    }
    
    if (showNext) {
      return baseClass + "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed transform-none";
    }
    
    return baseClass + "bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-400 text-gray-800 cursor-pointer";
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Choose the sound:
      </h3>
      
      {/* Options grid - responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {options.map((option, index) => {
          const isDisabled = showNext && selectedAnswer !== null;
          
          return (
            <button
              key={index}
              onClick={() => !isDisabled && onAnswerSelect(option)}
              disabled={isDisabled}
              className={getButtonStyle(option)}
              style={{
                // Ensure buttons are large and easy to tap on mobile
                minWidth: '80px',
                minHeight: '80px'
              }}
            >
              <span className="text-2xl md:text-3xl font-bold tracking-wider">
                {option}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Accessibility note */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Tap on the sound you hear at the {selectedAnswer ? 'beginning or end' : 'start or end'} of the word
      </p>
    </div>
  );
};

export default SoundOptionButtons;