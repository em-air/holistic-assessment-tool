import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MissingObjectQuiz from '../components/MissingObjectQuiz';
import MindSectionReport from '../components/MindSectionReport';
import { ROUTES } from '../routes';

const MissingObjectQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="relative">
      {/* Header with back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center space-x-2 px-4 py-2 text-white bg-black/20 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:bg-black/30 hover:shadow-md transform hover:scale-105"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">back</span>
        </button>
      </div>

      {/* Missing Object Quiz Component */}
      <div>
        <MissingObjectQuiz />
      </div>

      {/* Report Modal */}
      {showReport && (
        <MindSectionReport onClose={() => setShowReport(false)} />
      )}
    </div>
  );
};

export default MissingObjectQuizPage;
