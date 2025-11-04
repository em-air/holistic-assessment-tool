import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MissingObjectQuiz from '../components/MissingObjectQuiz';

const PerceptionQuiz: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Header with back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate('/category/mind')}
          className="group flex items-center space-x-2 px-4 py-2 text-white bg-black/20 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-black/30 hover:shadow-md transform hover:scale-105"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* Missing Object Quiz Component */}
      <MissingObjectQuiz />
    </div>
  );
};

export default PerceptionQuiz;