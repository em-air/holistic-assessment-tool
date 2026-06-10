import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Circle, Trash2, Loader, LogIn,
  ChevronDown, ChevronUp, Brain, MessageSquare, BookOpen, Download, Heart,
} from 'lucide-react';
import {
  ProgressTracker,
  MIND_QUIZZES,
  ORAL_QUIZZES,
  ACADEMIC_QUIZZES,
  LEARNING_QUIZZES,
  type ProgressData,
  type QuizResult,
} from '../utils/progressTracker';
import { getQuizResultLabel } from '../utils/quizResultDisplay';
import { generateReport } from '../services/reportService';
import { useNavigate } from 'react-router-dom';
import { logger } from '../utils/logger';
import { ROUTES } from '../routes';
import ReportOptionsDialog, { type ReportAudience, type ReportLanguage } from './ReportOptionsDialog';

/* ─── helper maps ─────────────────────────────────────── */

const subcategoryMeta: Record<string, { label: string; color: string; bg: string }> = {
  // Mind
  'attention':          { label: 'Attention',              color: 'text-yellow-600', bg: 'bg-yellow-100' },
  'memory':             { label: 'Memory',                 color: 'text-orange-600', bg: 'bg-orange-100' },
  'learning-style':     { label: 'Learning Style',         color: 'text-green-600',  bg: 'bg-green-100' },
  'critical-thinking':  { label: 'Critical Thinking',      color: 'text-purple-600', bg: 'bg-purple-100' },
  'perception':         { label: 'Perception',             color: 'text-indigo-600', bg: 'bg-indigo-100' },
  // Oral
  'oral-language':      { label: 'Oral Language',          color: 'text-sky-600',    bg: 'bg-sky-100' },

  // Academic
  'spelling':           { label: 'Spelling',               color: 'text-violet-600', bg: 'bg-violet-100' },
  'writing':            { label: 'Writing',                color: 'text-amber-600',  bg: 'bg-amber-100' },
  'reading':            { label: 'Reading',                color: 'text-emerald-600', bg: 'bg-emerald-100' },
  'vocabulary':         { label: 'Vocabulary',             color: 'text-rose-600',   bg: 'bg-rose-100' },
  'social-emotional':   { label: 'Social-Emotional',       color: 'text-teal-600',   bg: 'bg-teal-100' },
};

const getSubMeta = (sub: string) =>
  subcategoryMeta[sub] ?? { label: sub, color: 'text-gray-600', bg: 'bg-gray-100' };

const perfLabel = (pct: number) =>
  pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : pct >= 60 ? 'Developing' : 'Needs Support';

type CategoryTab = 'cognition' | 'oral' | 'academic' | 'learning';

/* ─── component ───────────────────────────────────────── */

interface AssessmentProgressBarProps {
  onShowReport?: () => void;
  className?: string;
}

const AssessmentProgressBar: React.FC<AssessmentProgressBarProps> = ({
  onShowReport,
  className = '',
}) => {
  const navigate = useNavigate();

  const [progress, setProgress] = useState<ProgressData>(() => ProgressTracker.getProgress());
  const [showDetails, setShowDetails] = useState(false);
  const [detailTab, setDetailTab] = useState<CategoryTab>('cognition');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showClearSuccess, setShowClearSuccess] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /* ── load data ─── */
  useEffect(() => {
    // Read from localStorage immediately; the auth listener in
    // progressTracker.ts already calls loadFromDatabase() once on
    // INITIAL_SESSION/SIGNED_IN, so we don't duplicate that call here.
    setProgress(ProgressTracker.getProgress());
    setIsAuthenticated(ProgressTracker.isAuthenticated());
    setIsLoading(false);

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
    const handleVisibility = () => { if (!document.hidden) handleFocus(); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('mindProgressUpdated', handleProgressUpdate as EventListener);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  /* ── derived data ─── */
  const mindResults = progress.mindSectionResults ?? [];
  const oralResults = progress.oralSectionResults ?? [];
  const academicResults = progress.academicSectionResults ?? [];
  const learningResults = progress.learningSectionResults ?? [];

  const totalQuizzes =
    MIND_QUIZZES.length +
    ORAL_QUIZZES.length +
    ACADEMIC_QUIZZES.length +
    LEARNING_QUIZZES.length;
  const mindIds = new Set(MIND_QUIZZES.map(q => q.id));
  const oralIds = new Set(ORAL_QUIZZES.map(q => q.id));
  const acadIds = new Set(ACADEMIC_QUIZZES.map(q => q.id));
  const learningIds = new Set(LEARNING_QUIZZES.map(q => q.id));
  const mindCount = mindResults.filter(r => mindIds.has(r.quizId)).length;
  const oralCount = oralResults.filter(r => oralIds.has(r.quizId)).length;
  const academicCount = academicResults.filter(r => acadIds.has(r.quizId)).length;
  const learningCount = learningResults.filter(r => learningIds.has(r.quizId)).length;
  const completedCount = mindCount + oralCount + academicCount + learningCount;

  const overallPct = totalQuizzes > 0 ? Math.round((completedCount / totalQuizzes) * 100) : 0;
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

  const handleGenerateReport = () => {
    setShowReportDialog(true);
  };

  const handleReportConfirm = async (audience: ReportAudience, language: ReportLanguage) => {
    setIsGeneratingReport(true);
    setSaveStatus('idle');
    try {
      const result = await generateReport({ reportType: 'full', audience, language });
      if (result.success) {
        setSaveStatus('success');
        logger.log('Report saved:', result.report?.id);

        const dateSuffix = new Date().toISOString().split('T')[0];
        const audienceLabel = audience === 'teacher' ? 'teacher' : 'parent';
        // Download English PDF
        if (result.downloadUrl && (language === 'english' || language === 'both')) {
          try {
            const pdfResp = await fetch(result.downloadUrl);
            if (pdfResp.ok) {
              const blob = await pdfResp.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `en_${audienceLabel}_assessment-report-${dateSuffix}.pdf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          } catch (dlErr) {
            logger.error('EN PDF download error:', dlErr);
          }
        }
        // Download Arabic PDF
        if (result.downloadUrlAr && (language === 'arabic' || language === 'both')) {
          try {
            const pdfResp = await fetch(result.downloadUrlAr);
            if (pdfResp.ok) {
              const blob = await pdfResp.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `ar_${audienceLabel}_assessment-report-${dateSuffix}.pdf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          } catch (dlErr) {
            logger.error('AR PDF download error:', dlErr);
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
      setShowReportDialog(false);
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
          {done && result && (() => {
            const label = getQuizResultLabel(result);
            if (label) {
              return (
                <div className="text-right">
                  <div className={`text-sm font-bold ${meta.color}`}>{label.value}</div>
                  <div className="text-xs text-gray-500">{label.caption}</div>
                </div>
              );
            }
            return (
              <div className="text-right">
                <div className={`text-sm font-bold ${meta.color}`}>{result.percentage}%</div>
                <div className="text-xs text-gray-500">{perfLabel(result.percentage)}</div>
              </div>
            );
          })()}
        </div>
      );
    });

  /* ── category mini-bar ─── */
  const MiniBar = ({
    icon: Icon,
    label,
    completed,
    total,
    barColor,
    bgColor,
    textColor,
  }: {
    icon: React.FC<{ size?: number; className?: string }>;
    label: string;
    completed: number;
    total: number;
    barColor: string;
    bgColor: string;
    textColor: string;
  }) => {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
      <div className={`${bgColor} rounded-xl p-3`}>
        <div className="flex items-center space-x-2 mb-1">
          <Icon size={14} className={textColor} />
          <span className={`text-xs font-semibold ${textColor}`}>{label}</span>
          <span className={`ml-auto text-xs font-bold ${textColor}`}>
            {completed}/{total}
          </span>
        </div>
        <div className={`w-full rounded-full h-1.5 ${bgColor === 'bg-indigo-50' ? 'bg-indigo-200' : bgColor === 'bg-sky-50' ? 'bg-sky-200' : 'bg-amber-200'}`}>
          <motion.div
            className={`h-1.5 ${barColor} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  };

  /* ── tab config ─── */
  const tabs: { key: CategoryTab; icon: React.FC<{ size?: number; className?: string }>; label: string; completed: number; total: number; color: string }[] = [
    { key: 'cognition', icon: Brain, label: 'Cognition', completed: mindCount, total: MIND_QUIZZES.length, color: 'indigo' },
    { key: 'oral', icon: MessageSquare, label: 'Oral', completed: oralCount, total: ORAL_QUIZZES.length, color: 'sky' },
    { key: 'academic', icon: BookOpen, label: 'Academic', completed: academicCount, total: ACADEMIC_QUIZZES.length, color: 'amber' },
    { key: 'learning', icon: Heart, label: 'Learning', completed: learningCount, total: LEARNING_QUIZZES.length, color: 'rose' },
  ];

  /* ── main render ─── */
  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Assessment Progress</h3>
          <p className="text-sm text-gray-600">
            {completedCount} of {totalQuizzes} quizzes completed
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

      {/* Category mini-bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <MiniBar
          icon={Brain}
          label="Cognition"
          completed={mindCount}
          total={MIND_QUIZZES.length}
          barColor="bg-indigo-500"
          bgColor="bg-indigo-50"
          textColor="text-indigo-700"
        />
        <MiniBar
          icon={MessageSquare}
          label="Oral Skills"
          completed={oralCount}
          total={ORAL_QUIZZES.length}
          barColor="bg-sky-500"
          bgColor="bg-sky-50"
          textColor="text-sky-700"
        />
        <MiniBar
          icon={BookOpen}
          label="Academic"
          completed={academicCount}
          total={ACADEMIC_QUIZZES.length}
          barColor="bg-amber-500"
          bgColor="bg-amber-50"
          textColor="text-amber-700"
        />
        <MiniBar
          icon={Heart}
          label="Learning"
          completed={learningCount}
          total={LEARNING_QUIZZES.length}
          barColor="bg-rose-500"
          bgColor="bg-rose-50"
          textColor="text-rose-700"
        />
      </div>

      {/* Success message */}
      <AnimatePresence>
        {showClearSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm font-medium text-center"
          >
            Progress cleared successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Report button */}
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
            <div className="flex space-x-2 mb-4">
              {tabs.map((t) => {
                const active = detailTab === t.key;
                const Icon = t.icon;
                const colorMap: Record<string, { active: string; inactive: string }> = {
                  indigo: { active: 'bg-indigo-100 text-indigo-700', inactive: 'text-gray-600 hover:bg-gray-100' },
                  sky:    { active: 'bg-sky-100 text-sky-700',       inactive: 'text-gray-600 hover:bg-gray-100' },
                  amber:  { active: 'bg-amber-100 text-amber-700',  inactive: 'text-gray-600 hover:bg-gray-100' },
                  rose:   { active: 'bg-rose-100 text-rose-700',    inactive: 'text-gray-600 hover:bg-gray-100' },
                };
                return (
                  <button
                    key={t.key}
                    onClick={() => setDetailTab(t.key)}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active ? colorMap[t.color].active : colorMap[t.color].inactive
                    }`}
                  >
                    <Icon size={14} />
                    <span>{t.label} ({t.completed}/{t.total})</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {detailTab === 'cognition' && renderQuizList(MIND_QUIZZES, mindResults)}
              {detailTab === 'oral' && renderQuizList(ORAL_QUIZZES, oralResults)}
              {detailTab === 'academic' && renderQuizList(ACADEMIC_QUIZZES, academicResults)}
              {detailTab === 'learning' && renderQuizList(LEARNING_QUIZZES, learningResults)}
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

      {/* Report options dialog */}
      <ReportOptionsDialog
        open={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        onConfirm={handleReportConfirm}
        isGenerating={isGeneratingReport}
      />
    </div>
  );
};

export default AssessmentProgressBar;
