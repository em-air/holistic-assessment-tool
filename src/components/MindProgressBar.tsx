import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, FileText, Trash2, Database, Loader, LogIn } from 'lucide-react';
import { ProgressTracker, MIND_QUIZZES, type ProgressData } from '../utils/progressTracker';
import { generateReport } from '../services/reportService';
import { useNavigate } from 'react-router-dom';
import { logger } from '../utils/logger';

interface MindProgressBarProps {
  onShowReport?: () => void;
  className?: string;
}

const MindProgressBar: React.FC<MindProgressBarProps> = ({ onShowReport, className = '' }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressData>(() => ProgressTracker.getProgress());
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showClearSuccess, setShowClearSuccess] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getSubcategoryName = (subcategory: string): string => {
    const names: Record<string, string> = {
      'attention': 'Attention',
      'memory': 'Memory',
      'learning-style': 'Learning Style',
      'critical-thinking': 'Critical Thinking',
      'perception': 'Perception'
    };
    return names[subcategory] || subcategory;
  };

  const getCategoryColor = (subcategory: string): string => {
    const colors: Record<string, string> = {
      'attention': 'text-yellow-600',
      'memory': 'text-orange-600',
      'learning-style': 'text-green-600',
      'critical-thinking': 'text-purple-600',
      'perception': 'text-indigo-600'
    };
    return colors[subcategory] || 'text-gray-600';
  };

  useEffect(() => {
    // Load progress from database on mount
    const loadProgress = async () => {
      setIsLoading(true);
      
      // Wait for auth to be initialized
      const { supabase } = await import('../supabase-client');
      const { data: { session } } = await supabase.auth.getSession();
      const authenticated = !!session?.user;
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        // Load from database
        await ProgressTracker.loadFromDatabase();
      }
      
      setProgress(ProgressTracker.getProgress());
      setIsLoading(false);
    };

    loadProgress();

    const handleProgressUpdate = (event: CustomEvent) => {
      setProgress(event.detail);
      setIsAuthenticated(ProgressTracker.isAuthenticated());
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh when tab becomes visible again
        const currentProgress = ProgressTracker.getProgress();
        setProgress(currentProgress);
        setIsAuthenticated(ProgressTracker.isAuthenticated());
      }
    };

    const handleWindowFocus = () => {
      // Refresh when window regains focus
      const currentProgress = ProgressTracker.getProgress();
      setProgress(currentProgress);
      setIsAuthenticated(ProgressTracker.isAuthenticated());
    };

    window.addEventListener('mindProgressUpdated', handleProgressUpdate as EventListener);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('mindProgressUpdated', handleProgressUpdate as EventListener);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleClearProgress = () => {
    if (showConfirmClear) {
      ProgressTracker.clearProgress();
      setShowConfirmClear(false);
      setShowClearSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setShowClearSuccess(false), 3000);
    } else {
      setShowConfirmClear(true);
      // Auto-hide confirmation after 5 seconds
      setTimeout(() => setShowConfirmClear(false), 5000);
    }
  };

  const isComplete = progress.overallProgress === 100;
  const hasAnyProgress = progress.mindSectionResults.length > 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader size={24} className="animate-spin text-purple-500 mr-3" />
          <span className="text-gray-600">Loading progress...</span>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 ${className}`}>
        <div className="text-center py-6">
          <LogIn size={48} className="mx-auto mb-4 text-purple-500" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Sign In to Track Progress</h3>
          <p className="text-sm text-gray-600 mb-4">
            Your quiz progress is saved to your account. Sign in to view and save your progress.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  // Handle generate report button - saves to database and shows report
  const handleGenerateReport = async () => {
    // Save to database in background
    setIsSavingReport(true);
    setSaveStatus('idle');
    
    try {
      const result = await generateReport({
        reportType: 'full',
        sendEmail: false,
      });
      
      if (result.success) {
        setSaveStatus('success');
        logger.log('Report saved to database:', result.report?.id);
      } else {
        setSaveStatus('error');
        logger.error('Failed to save report:', result.error);
      }
    } catch (error) {
      setSaveStatus('error');
      logger.error('Error saving report:', error);
    } finally {
      setIsSavingReport(false);
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
    
    // Also show the report modal
    if (onShowReport) {
      onShowReport();
    }
  };

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Cognition Section Progress</h3>
          <p className="text-sm text-gray-600">
            {progress.mindSectionResults.length} of {MIND_QUIZZES.length} quizzes completed
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          {progress.mindSectionResults.length > 0 && (
            <div className="flex items-center space-x-2">
              {showConfirmClear ? (
                <>
                  <button
                    onClick={handleClearProgress}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200"
                  >
                    <Trash2 size={14} />
                    <span>Confirm Clear</span>
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="px-3 py-1 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleClearProgress}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                >
                  <Trash2 size={14} />
                  <span>Clear Progress</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-gray-800">{progress.overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress.overallProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Clear Success Message */}
      {showClearSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm font-medium text-center"
        >
          ✅ Progress cleared successfully!
        </motion.div>
      )}

      {/* Show Report Button */}
      {hasAnyProgress && onShowReport && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleGenerateReport}
          disabled={isSavingReport}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl mb-4 disabled:opacity-70 disabled:cursor-not-allowed ${
            isComplete 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
          }`}
        >
          {isSavingReport ? (
            <>
              <Loader size={20} className="animate-spin" />
              <span>Saving & Generating...</span>
            </>
          ) : saveStatus === 'success' ? (
            <>
              <CheckCircle size={20} />
              <span>Saved! {isComplete ? 'Complete Report' : 'Progress Report'}</span>
            </>
          ) : (
            <>
              <FileText size={20} />
              <span>{isComplete ? 'Generate Complete Report' : 'Generate Progress Report'}</span>
            </>
          )}
        </motion.button>
      )}

      {/* Detailed Progress */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-200 pt-4 space-y-3"
        >
          {MIND_QUIZZES.map((quiz) => {
            const result = progress.mindSectionResults.find(r => r.quizId === quiz.id);
            const isCompleted = !!result;

            return (
              <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {isCompleted ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <Circle size={20} className="text-gray-400" />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">{quiz.name}</h4>
                    <p className={`text-xs font-medium ${getCategoryColor(quiz.subcategory)}`}>
                      {getSubcategoryName(quiz.subcategory)}
                    </p>
                  </div>
                </div>
                {isCompleted && result && (
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getCategoryColor(quiz.subcategory)}`}>
                      {result.percentage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      Performance: {result.percentage >= 90 ? 'Excellent' : result.percentage >= 75 ? 'Good' : result.percentage >= 60 ? 'Developing' : 'Needs Support'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Last Updated */}
      {progress.lastUpdated && (
        <div className="text-xs text-gray-500 text-center mt-4">
          Last updated: {new Date(progress.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default MindProgressBar;