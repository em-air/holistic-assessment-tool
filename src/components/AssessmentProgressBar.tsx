import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Circle, Trash2, Loader, LogIn,
  ChevronDown, ChevronUp, Brain, MessageSquare, Download,
} from 'lucide-react';
import {
  ProgressTracker,
  MIND_QUIZZES,
  ORAL_QUIZZES,
  ALL_TRACKED_QUIZZES,
  type ProgressData,
  type QuizResult,
} from '../utils/progressTracker';
import MindSectionReport from './MindSectionReport';
import { generateReport } from '../services/reportService';
import { useNavigate } from 'react-router-dom';
import { logger } from '../utils/logger';
import { ROUTES } from '../routes';

/* ─── helper maps ─────────────────────────────────────── */

const subcategoryMeta: Record<string, { label: string; color: string; bg: string }> = {
  'attention':          { label: 'Attention',          color: 'text-yellow-600', bg: 'bg-yellow-100' },
  'memory':             { label: 'Memory',             color: 'text-orange-600', bg: 'bg-orange-100' },
  'learning-style':     { label: 'Learning Style',     color: 'text-green-600',  bg: 'bg-green-100' },
  'critical-thinking':  { label: 'Critical Thinking',  color: 'text-purple-600', bg: 'bg-purple-100' },
  'perception':         { label: 'Perception',         color: 'text-indigo-600', bg: 'bg-indigo-100' },
  'oral-language':      { label: 'Oral Language',      color: 'text-sky-600',    bg: 'bg-sky-100' },
  'phonics':            { label: 'Beginning & Ending Sounds', color: 'text-pink-600',   bg: 'bg-pink-100' },
  'phonics-awareness':  { label: 'Beginning & Ending Sounds', color: 'text-pink-600',   bg: 'bg-pink-100' },
  'blending-segmenting':{ label: 'Blending & Segmenting', color: 'text-teal-600', bg: 'bg-teal-100' },
};

const getSubMeta = (sub: string) =>
  subcategoryMeta[sub] ?? { label: sub, color: 'text-gray-600', bg: 'bg-gray-100' };

const perfLabel = (pct: number) =>
  pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : pct >= 60 ? 'Developing' : 'Needs Support';

/* ─── component ───────────────────────────────────────── */

interface AssessmentProgressBarProps {
  onShowReport?: () => void;
  /** Restrict display to mind or oral only (default: both) */
  filter?: 'mind' | 'oral' | 'all';
  className?: string;
}

const AssessmentProgressBar: React.FC<AssessmentProgressBarProps> = ({
  onShowReport,
  filter = 'all',
  className = '',
}) => {
  const navigate = useNavigate();

  const [progress, setProgress] = useState<ProgressData>(() => ProgressTracker.getProgress());
  const [showDetails, setShowDetails] = useState(false);
  const [detailTab, setDetailTab] = useState<'mind' | 'oral'>('mind');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showClearSuccess, setShowClearSuccess] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /* ── load data ─── */
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      const { supabase } = await import('../supabase-client');
      const { data: { session } } = await supabase.auth.getSession();
      const authenticated = !!session?.user;
      setIsAuthenticated(authenticated);
      if (authenticated) {
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
    const handleFocus = () => {
      setProgress(ProgressTracker.getProgress());
      setIsAuthenticated(ProgressTracker.isAuthenticated());
    };

    window.addEventListener('mindProgressUpdated', handleProgressUpdate as EventListener);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) handleFocus(); });
    return () => {
      window.removeEventListener('mindProgressUpdated', handleProgressUpdate as EventListener);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  /* ── derived data ─── */
  const mindResults = progress.mindSectionResults;
  const oralResults = progress.oralSectionResults ?? [];

  const visibleMindQuizzes = filter === 'oral' ? [] : MIND_QUIZZES;
  const visibleOralQuizzes = filter === 'mind' ? [] : ORAL_QUIZZES;
  const totalVisible = visibleMindQuizzes.length + visibleOralQuizzes.length;

  const mindCompletedCount = mindResults.length;
  const oralCompletedCount = oralResults.length;
  const completedCount =
    (filter === 'oral' ? 0 : mindCompletedCount) +
    (filter === 'mind' ? 0 : oralCompletedCount);

  const overallPct = totalVisible > 0 ? Math.round((completedCount / totalVisible) * 100) : 0;
  const hasAnyProgress = completedCount > 0;

  /* ── handlers ─── */
  const handleClearProgress = () => {
    if (showConfirmClear) {
      ProgressTracker.clearProgress();
      setShowConfirmClear(false);
      setShowClearSuccess(true);
      setTimeout(() => setShowClearSuccess(false), 3000);
    } else {
      setShowConfirmClear(true);
      setTimeout(() => setShowConfirmClear(false), 5000);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setSaveStatus('idle');
    try {
      const result = await generateReport({ reportType: 'full', sendEmail: false });
      if (result.success) {
        setSaveStatus('success');
        logger.log('Report saved:', result.report?.id);

        // Download the PDF that the backend generated
        if (result.downloadUrl) {
          try {
            const pdfResp = await fetch(result.downloadUrl);
            if (pdfResp.ok) {
              const blob = await pdfResp.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `assessment-report-${new Date().toISOString().split('T')[0]}.pdf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            } else {
              logger.error('PDF download HTTP error:', pdfResp.status);
            }
          } catch (dlErr) {
            logger.error('PDF download fetch error:', dlErr);
          }
        }
      } else {
        setSaveStatus('error');
        logger.error('Report failed:', result.error);
      }
    } catch (err) {
      setSaveStatus('error');
      logger.error('Report error:', err);
    } finally {
      setIsGeneratingReport(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
    if (onShowReport) onShowReport();
  };

  /* ── loading / unauth states ── */
  if (isLoading) {
    return (
      <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader size={24} className="animate-spin text-purple-500 mr-3" />
          <span className="text-gray-600">Loading progress…</span>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate(ROUTES.AUTH)}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  /* ── render quiz list ─── */
  const renderQuizList = (
    quizzes: typeof MIND_QUIZZES,
    results: QuizResult[],
  ) =>
    quizzes.map((quiz) => {
      const result = results.find((r) => r.quizId === quiz.id);
      const done = !!result;
      const meta = getSubMeta(quiz.subcategory);
      return (
        <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {done ? (
              <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
            ) : (
              <Circle size={20} className="text-gray-400 flex-shrink-0" />
            )}
            <div>
              <h4 className="font-medium text-gray-800 text-sm">{quiz.name}</h4>
              <span className={`text-xs font-medium ${meta.color}`}>{meta.label}</span>
            </div>
          </div>
          {done && result && (
            <div className="text-right">
              {result.quizId === 'learning-styles' && result.additionalData?.dominantStyle ? (
                <>
                  <div className={`text-sm font-bold ${meta.color}`}>
                    {result.additionalData.dominantStyle === 'visual' ? 'Visual'
                      : result.additionalData.dominantStyle === 'auditory' ? 'Auditory'
                      : result.additionalData.dominantStyle === 'kinesthetic' ? 'Kinesthetic'
                      : 'Reading/Writing'}
                  </div>
                  <div className="text-xs text-gray-500">Learning Style</div>
                </>
              ) : result.quizId === 'attention-assessment' ? (
                <>
                  <div className={`text-sm font-bold ${meta.color}`}>
                    {result.additionalData?.attentionLevel || (result.percentage >= 75 ? 'Strong' : result.percentage >= 60 ? 'Moderate' : 'Developing')}
                  </div>
                  <div className="text-xs text-gray-500">Attention Level</div>
                </>
              ) : (
                <>
                  <div className={`text-sm font-bold ${meta.color}`}>{result.percentage}%</div>
                  <div className="text-xs text-gray-500">{perfLabel(result.percentage)}</div>
                </>
              )}
            </div>
          )}
        </div>
      );
    });

  /* ── main render ─── */
  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Assessment Progress</h3>
          <p className="text-sm text-gray-600">
            {completedCount} of {totalVisible} quizzes completed
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {hasAnyProgress && (
            <>
              {showConfirmClear ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleClearProgress}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Confirm</span>
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="px-3 py-1 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleClearProgress}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Clear</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-gray-800">{overallPct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Sub-bars for mind & oral */}
      {filter === 'all' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Mind mini-bar */}
          <div className="bg-indigo-50 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Brain size={14} className="text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700">Mind</span>
              <span className="ml-auto text-xs font-bold text-indigo-700">
                {mindCompletedCount}/{MIND_QUIZZES.length}
              </span>
            </div>
            <div className="w-full bg-indigo-200 rounded-full h-1.5">
              <motion.div
                className="h-1.5 bg-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${MIND_QUIZZES.length > 0 ? Math.round((mindCompletedCount / MIND_QUIZZES.length) * 100) : 0}%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
          {/* Oral mini-bar */}
          <div className="bg-sky-50 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <MessageSquare size={14} className="text-sky-600" />
              <span className="text-xs font-semibold text-sky-700">Oral Language</span>
              <span className="ml-auto text-xs font-bold text-sky-700">
                {oralCompletedCount}/{ORAL_QUIZZES.length}
              </span>
            </div>
            <div className="w-full bg-sky-200 rounded-full h-1.5">
              <motion.div
                className="h-1.5 bg-sky-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${ORAL_QUIZZES.length > 0 ? Math.round((oralCompletedCount / ORAL_QUIZZES.length) * 100) : 0}%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Action button — generates report on server + downloads PDF */}
      {hasAnyProgress && (
        <div className="flex gap-3 mb-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed ${
              overallPct === 100
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
            }`}
          >
            {isGeneratingReport ? (
              <><Loader size={18} className="animate-spin" /><span>Generating…</span></>
            ) : saveStatus === 'success' ? (
              <><CheckCircle size={18} /><span>Saved & Downloaded!</span></>
            ) : saveStatus === 'error' ? (
              <span>Error — retry</span>
            ) : (
              <><Download size={18} /><span>Generate Report</span></>
            )}
          </motion.button>
        </div>
      )}

      {/* Details panel */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 pt-4"
          >
            {/* Tabs */}
            {filter === 'all' && (
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setDetailTab('mind')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    detailTab === 'mind'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Brain size={14} />
                  <span>Mind ({mindCompletedCount}/{MIND_QUIZZES.length})</span>
                </button>
                <button
                  onClick={() => setDetailTab('oral')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    detailTab === 'oral'
                      ? 'bg-sky-100 text-sky-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare size={14} />
                  <span>Oral ({oralCompletedCount}/{ORAL_QUIZZES.length})</span>
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {(filter === 'mind' || (filter === 'all' && detailTab === 'mind')) &&
                renderQuizList(MIND_QUIZZES, mindResults)}
              {(filter === 'oral' || (filter === 'all' && detailTab === 'oral')) &&
                renderQuizList(ORAL_QUIZZES, oralResults)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last updated */}
      {progress.lastUpdated && (
        <div className="text-xs text-gray-500 text-center mt-4">
          Last updated: {new Date(progress.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default AssessmentProgressBar;
