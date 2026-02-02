import React from 'react';
import { Volume2, RotateCcw } from 'lucide-react';
import { QuestionData } from '../data/startingEndingSoundData';
import { logger } from '../utils/logger';

interface SoundQuestionDisplayProps {
  question: QuestionData;
  grade: number;
  onPlayAudio: () => void;
  isAudioLoading: boolean;
}

const SoundQuestionDisplay: React.FC<SoundQuestionDisplayProps> = ({
  question,
  grade,
  onPlayAudio,
  isAudioLoading
}) => {
  return (
    <div className="text-center mb-8">
      {/* Image Display - No word text shown */}
      <div className="mb-6 flex justify-center">
        <div className="relative bg-gray-100 rounded-2xl p-6 shadow-inner">
          <img
            src={question.question.imageUrl}
            alt="Picture for word - listen to hear what it is"
            className="w-48 h-48 md:w-64 md:h-64 object-contain rounded-xl"
            onLoad={() => {
              logger.log('Image loaded successfully:', question.question.imageUrl);
            }}
            onError={(e) => {
              // Log the error for debugging
              logger.error('Image failed to load:', question.question.imageUrl);
              
              // Keep the placeholder URL as fallback
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('placeholder')) {
                logger.log('Using fallback placeholder image');
                target.src = 'https://via.placeholder.com/300x300/6B7280/FFFFFF?text=' + 
                            encodeURIComponent(question.question.word.toUpperCase());
              }
            }}
            crossOrigin="anonymous"
          />
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={onPlayAudio}
          disabled={isAudioLoading}
          className="group flex items-center space-x-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
        >
          {isAudioLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Loading...</span>
            </>
          ) : (
            <>
              <Volume2 size={24} className="group-hover:animate-pulse" />
              <span>Listen</span>
            </>
          )}
        </button>
        
        <button
          onClick={onPlayAudio}
          disabled={isAudioLoading}
          className="group flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          title="Play again"
        >
          <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-300" />
          <span className="hidden md:inline">Again</span>
        </button>
      </div>

      {/* Grade level indicator */}
      <div className="text-sm text-gray-500 mb-2">
        Grade {grade} • Image + Sound Only
      </div>
    </div>
  );
};

export default SoundQuestionDisplay;