import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Download, FileText, ArrowLeft, Brain, Mic, BookOpen, Heart,
  Award, Clock, CheckCircle, RefreshCw, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProgressTracker, MIND_QUIZZES, ORAL_QUIZZES, ACADEMIC_QUIZZES, LEARNING_QUIZZES } from '../utils/progressTracker';
import { getMyReports, downloadReport, type ProfileReport } from '../services/profileService';
import { generateReport } from '../services/reportService';
import { logger } from '../utils/logger';
import { ROUTES } from '../routes';
import ReportOptionsDialog, { type ReportAudience, type ReportLanguage } from '../components/ReportOptionsDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubcategoryStats {
  name: string;
  completed: number;
  total: number;
  pct: number;
  avgScore: number;
}

interface CategoryStats {
  key: 'mind' | 'oral' | 'academic' | 'learning';
  label: string;
  icon: React.ReactNode;
  color: string;         // Tailwind text colour
  ring: string;          // SVG stroke colour
  bg: string;            // card background
  completed: number;
  total: number;
  pct: number;
  avgScore: number;
  subcategories: SubcategoryStats[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const REPORT_TYPE_LABELS: Record<string, string> = {
  mind: 'Cognition',
  oral: 'Oral Language',
  academic: 'Academic',
  full: 'Full Assessment',
};

const REPORT_TYPE_ICONS: Record<string, React.ReactNode> = {
  mind: <Brain size={16} />,
  oral: <Mic size={16} />,
  academic: <BookOpen size={16} />,
  full: <Award size={16} />,
};

const REPORT_TYPE_COLORS: Record<string, string> = {
  mind: 'bg-purple-100 text-purple-700',
  oral: 'bg-emerald-100 text-emerald-700',
  academic: 'bg-blue-100 text-blue-700',
  full: 'bg-amber-100 text-amber-700',
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

function gradeLabel(g: string | null) {
  return g ? g : 'Not set';
}

// Group quiz results by subcategory for a given category key
function buildSubcategoryStats(
  results: ReturnType<typeof ProgressTracker.getProgress>['mindSectionResults'],
  quizList: typeof MIND_QUIZZES,
): SubcategoryStats[] {
  // Build unique subcategory list from quizList
  const subcatMap = new Map<string, { total: number; completedIds: Set<string>; scores: number[] }>();
  quizList.forEach(q => {
    if (!subcatMap.has(q.subcategory)) {
      subcatMap.set(q.subcategory, { total: 0, completedIds: new Set(), scores: [] });
    }
    subcatMap.get(q.subcategory)!.total++;
  });

  results.forEach(r => {
    const quiz = quizList.find(q => q.id === r.quizId);
    if (!quiz) return;
    const entry = subcatMap.get(quiz.subcategory);
    if (!entry) return;
    entry.completedIds.add(r.quizId);
    entry.scores.push(r.percentage);
  });

  return Array.from(subcatMap.entries()).map(([name, data]) => {
    const completed = data.completedIds.size;
    const avgScore = data.scores.length > 0
      ? Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length)
      : 0;
    return {
      name: name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      completed,
      total: data.total,
      pct: data.total > 0 ? Math.round((completed / data.total) * 100) : 0,
      avgScore,
    };
  });
}

// ─── Animated ring (SVG) ──────────────────────────────────────────────────────

function RadialRing({
  pct, color, size = 120, strokeWidth = 10, children,
}: {
  pct: number; color: string; size?: number; strokeWidth?: number; children?: React.ReactNode;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const [drawn, setDrawn] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setDrawn(pct));
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  const offset = circ - (drawn / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        {/* progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ─── Animated bar ────────────────────────────────────────────────────────────

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </div>
  );
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-emerald-100 text-emerald-700' :
    score >= 60 ? 'bg-amber-100 text-amber-700' :
    score > 0   ? 'bg-red-100 text-red-600' :
                  'bg-slate-100 text-slate-400';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score > 0 ? `${score}%` : '—'}
    </span>
  );
}

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({ cat }: { cat: CategoryStats }) {
  const [expanded, setExpanded] = useState(false);

  const ringColors: Record<string, string> = {
    mind: '#8b5cf6',
    oral: '#10b981',
    academic: '#3b82f6',
    learning: '#f43f5e',
  };

  return (
    <motion.div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start gap-5">
          {/* Ring */}
          <RadialRing pct={cat.pct} color={ringColors[cat.key]} size={100} strokeWidth={9}>
            <div className="flex flex-col items-center">
              <span className={`text-xl font-bold ${cat.color}`}>{cat.pct}%</span>
              <span className="text-xs text-slate-400 font-medium">done</span>
            </div>
          </RadialRing>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cat.color}>{cat.icon}</span>
              <h3 className="text-lg font-bold text-slate-800">{cat.label}</h3>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              <span className="font-semibold text-slate-700">{cat.completed}</span> of{' '}
              <span className="font-semibold text-slate-700">{cat.total}</span> quizzes completed
            </p>

            {/* Avg score */}
            {cat.avgScore > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <Award size={14} className="text-amber-500" />
                <span className="text-sm text-slate-500">Avg score:</span>
                <ScoreBadge score={cat.avgScore} />
              </div>
            )}

            {/* Completion bar */}
            <ProgressBar pct={cat.pct} color={ringColors[cat.key]} />
          </div>
        </div>
      </div>

      {/* Subcategories toggle */}
      {cat.subcategories.length > 0 && (
        <>
          <button
            aria-expanded={expanded}
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span>Subcategory breakdown</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                key="subcats"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 py-4 space-y-4 border-t border-slate-100">
                  {cat.subcategories.map(sub => (
                    <div key={sub.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-700">{sub.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">
                            {sub.completed}/{sub.total}
                          </span>
                          <ScoreBadge score={sub.avgScore} />
                        </div>
                      </div>
                      <ProgressBar pct={sub.pct} color={ringColors[cat.key]} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

// ─── Report row ───────────────────────────────────────────────────────────────

function ReportRow({ report, index }: { report: ProfileReport; index: number }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    const result = await downloadReport(report.id);
    setDownloading(false);
    if (result.success && result.url) {
      const a = document.createElement('a');
      a.href = result.url;
      a.download = result.filename || 'report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(result.url!), 10000);
    } else {
      setError(result.error || 'Download failed');
      setTimeout(() => setError(null), 4000);
    }
  };

  const typeColor = REPORT_TYPE_COLORS[report.report_type] || 'bg-slate-100 text-slate-600';

  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all group"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor}`}>
        {REPORT_TYPE_ICONS[report.report_type] ?? <FileText size={16} />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-sm font-semibold text-slate-800">
            {REPORT_TYPE_LABELS[report.report_type] || report.report_type} Report
          </span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${typeColor}`}>
            {report.report_type.toUpperCase()}
          </span>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Clock size={11} /> {formatDate(report.generated_at)}
        </span>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
            <AlertCircle size={11} /> {error}
          </p>
        )}
      </div>

      {/* Download */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        aria-label={`Download ${REPORT_TYPE_LABELS[report.report_type]} report from ${formatDate(report.generated_at)}`}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-emerald-50"
      >
        {downloading
          ? <RefreshCw size={14} className="animate-spin" />
          : <Download size={14} />
        }
        {downloading ? 'Saving…' : 'PDF'}
      </button>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  const [progressData, setProgressData] = useState(() => ProgressTracker.getProgress());
  const [reports, setReports] = useState<ProfileReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showReportDialog, setShowReportDialog] = useState(false);

  // ── Redirect if not logged in ──────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(ROUTES.AUTH, { replace: true });
    }
  }, [authLoading, user, navigate]);

  // ── Load progress from DB on mount ───────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    ProgressTracker.loadFromDatabase().then(data => setProgressData(data));
    // Also listen for live updates from the progress tracker event
    const onUpdate = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail) setProgressData(custom.detail);
    };
    window.addEventListener('mindProgressUpdated', onUpdate);
    return () => window.removeEventListener('mindProgressUpdated', onUpdate);
  }, [user]);

  // ── Load reports ──────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError(null);
    const res = await getMyReports();
    setReportsLoading(false);
    if (res.success) {
      setReports(res.reports);
    } else {
      setReportsError(res.error || 'Failed to load reports');
    }
  }, []);

  useEffect(() => {
    if (user) fetchReports();
  }, [user, fetchReports]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      ProgressTracker.loadFromDatabase().then(d => setProgressData(d)),
      fetchReports(),
    ]);
    setRefreshing(false);
  };

  const handleGenerateReport = () => {
    setShowReportDialog(true);
  };

  const handleReportConfirm = async (audience: ReportAudience, language: ReportLanguage) => {
    setIsGeneratingReport(true);
    setReportStatus('idle');
    try {
      const result = await generateReport({ reportType: 'full', audience, language });
      if (result.success) {
        setReportStatus('success');
        logger.log('Report saved:', result.report?.id);

        const dateSuffix = new Date().toISOString().split('T')[0];
        const audienceLabel = audience === 'teacher' ? 'teacher' : 'parent';
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
        // Refresh reports list to include the newly generated report
        await fetchReports();
      } else {
        setReportStatus('error');
        logger.error('Report failed:', result.error);
      }
    } catch (err) {
      setReportStatus('error');
      logger.error('Report error:', err);
    } finally {
      setIsGeneratingReport(false);
      setShowReportDialog(false);
      setTimeout(() => setReportStatus('idle'), 3000);
    }
  };

  // ── Build category stats ──────────────────────────────────────────────────
  const mindIds = new Set(MIND_QUIZZES.map(q => q.id));
  const oralIds = new Set(ORAL_QUIZZES.map(q => q.id));
  const acadIds = new Set(ACADEMIC_QUIZZES.map(q => q.id));
  const learningIds = new Set(LEARNING_QUIZZES.map(q => q.id));

  const mindResults = progressData.mindSectionResults.filter(r => mindIds.has(r.quizId));
  const oralResults = progressData.oralSectionResults.filter(r => oralIds.has(r.quizId));
  const acadResults = progressData.academicSectionResults.filter(r => acadIds.has(r.quizId));
  const learningResults = (progressData.learningSectionResults ?? []).filter(r => learningIds.has(r.quizId));

  const avgOf = (arr: { percentage: number }[]) =>
    arr.length > 0 ? Math.round(arr.reduce((s, r) => s + r.percentage, 0) / arr.length) : 0;

  const categoryStats: CategoryStats[] = [
    {
      key: 'mind',
      label: 'Cognition',
      icon: <Brain size={20} />,
      color: 'text-purple-600',
      ring: '#8b5cf6',
      bg: 'bg-purple-50',
      completed: mindResults.length,
      total: MIND_QUIZZES.length,
      pct: MIND_QUIZZES.length > 0 ? Math.round((mindResults.length / MIND_QUIZZES.length) * 100) : 0,
      avgScore: avgOf(mindResults),
      subcategories: buildSubcategoryStats(mindResults, MIND_QUIZZES),
    },
    {
      key: 'oral',
      label: 'Oral Language',
      icon: <Mic size={20} />,
      color: 'text-emerald-600',
      ring: '#10b981',
      bg: 'bg-emerald-50',
      completed: oralResults.length,
      total: ORAL_QUIZZES.length,
      pct: ORAL_QUIZZES.length > 0 ? Math.round((oralResults.length / ORAL_QUIZZES.length) * 100) : 0,
      avgScore: avgOf(oralResults),
      subcategories: buildSubcategoryStats(oralResults, ORAL_QUIZZES),
    },
    {
      key: 'academic',
      label: 'Academic',
      icon: <BookOpen size={20} />,
      color: 'text-blue-600',
      ring: '#3b82f6',
      bg: 'bg-blue-50',
      completed: acadResults.length,
      total: ACADEMIC_QUIZZES.length,
      pct: ACADEMIC_QUIZZES.length > 0 ? Math.round((acadResults.length / ACADEMIC_QUIZZES.length) * 100) : 0,
      avgScore: avgOf(acadResults),
      subcategories: buildSubcategoryStats(acadResults, ACADEMIC_QUIZZES),
    },
    {
      key: 'learning',
      label: 'Learning & SEL',
      icon: <Heart size={20} />,
      color: 'text-rose-600',
      ring: '#f43f5e',
      bg: 'bg-rose-50',
      completed: learningResults.length,
      total: LEARNING_QUIZZES.length,
      pct: LEARNING_QUIZZES.length > 0 ? Math.round((learningResults.length / LEARNING_QUIZZES.length) * 100) : 0,
      avgScore: avgOf(learningResults),
      subcategories: buildSubcategoryStats(learningResults, LEARNING_QUIZZES),
    },
  ];

  const totalCompleted =
    mindResults.length + oralResults.length + acadResults.length + learningResults.length;
  const totalQuizzes =
    MIND_QUIZZES.length + ORAL_QUIZZES.length + ACADEMIC_QUIZZES.length + LEARNING_QUIZZES.length;
  const overallPct = totalQuizzes > 0 ? Math.round((totalCompleted / totalQuizzes) * 100) : 0;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  // ── Avatar initials ───────────────────────────────────────────────────────
  const initials = (profile.student_name || user.email || '')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('') || '?';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top nav ─────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <span className="text-lg font-bold text-slate-800 tracking-tight">
            Bloom<span className="text-emerald-500">°</span>
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh profile data"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Profile header card ──────────────────────────────────────────── */}
        <motion.section
          aria-label="Student profile"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {/* Accent strip */}
          <div className="h-2 bg-emerald-500" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-md">
                  <span className="text-2xl font-extrabold text-white tracking-wide">{initials}</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-800 mb-1 truncate">
                  {profile.student_name || 'Student'}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  {profile.parent_email && (
                    <span className="flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      {profile.parent_email}
                    </span>
                  )}
                  {profile.student_email && (
                    <span className="flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      {profile.student_email}
                    </span>
                  )}
                </div>
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full border border-emerald-100">
                  <BookOpen size={13} />
                  {gradeLabel(profile.grade)}
                </span>
                {profile.age && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                    Age {profile.age}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-full border border-purple-100 capitalize">
                  {profile.role}
                </span>
              </div>
            </div>

            {/* Overall progress strip */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-700">Overall Assessment Progress</p>
                <span className="text-sm font-bold text-emerald-600">
                  {totalCompleted} / {totalQuizzes} quizzes
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-slate-400">0%</span>
                <span className="text-xs font-semibold text-slate-600">{overallPct}% complete</span>
                <span className="text-xs text-slate-400">100%</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Summary stat pills ───────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35 }}
        >
          {[
            { label: 'Completed', value: totalCompleted, icon: <CheckCircle size={16} />, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Remaining', value: totalQuizzes - totalCompleted, icon: <Clock size={16} />, color: 'text-amber-600 bg-amber-50' },
            { label: 'Reports', value: reports.length, icon: <FileText size={16} />, color: 'text-blue-600 bg-blue-50' },
            { label: 'Overall', value: `${overallPct}%`, icon: <Award size={16} />, color: 'text-purple-600 bg-purple-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Progress tracker ─────────────────────────────────────────────── */}
        <section aria-label="Assessment progress">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Progress Tracker</h2>
            <Link
              to={ROUTES.CATEGORIES}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Start a quiz →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {categoryStats.map((cat, i) => (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.35 }}
              >
                <CategoryCard cat={cat} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Reports ──────────────────────────────────────────────────────── */}
        <section aria-label="Downloadable reports">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">My Reports</h2>
            <div className="flex items-center gap-3">
              {reports.length > 0 && (
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {reports.length} {reports.length === 1 ? 'report' : 'reports'}
                </span>
              )}
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingReport ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : reportStatus === 'success' ? (
                  <CheckCircle size={14} />
                ) : reportStatus === 'error' ? (
                  <AlertCircle size={14} />
                ) : (
                  <FileText size={14} />
                )}
                {isGeneratingReport
                  ? 'Generating…'
                  : reportStatus === 'success'
                  ? 'Report Saved!'
                  : reportStatus === 'error'
                  ? 'Failed – Retry'
                  : 'Generate Report'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            {reportsLoading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Loading reports…</p>
              </div>
            ) : reportsError ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <AlertCircle size={28} className="text-red-400" />
                <p className="text-sm text-slate-500">{reportsError}</p>
                <button
                  onClick={fetchReports}
                  className="text-xs font-medium text-emerald-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <FileText size={24} className="text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-1">No reports yet</p>
                  <p className="text-sm text-slate-400">
                    Complete your assessments to generate a report.
                  </p>
                </div>
                <Link
                  to={ROUTES.CATEGORIES}
                  className="mt-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Begin assessments →
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {reports.slice(0, 3).map((r, i) => (
                  <ReportRow key={r.id} report={r} index={i} />
                ))}
                {reports.length > 3 && (
                  <p className="text-xs text-center text-slate-400 pt-2">
                    Showing latest 3 of {reports.length} reports
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Footer padding ───────────────────────────────────────────────── */}
        <div className="h-8" />
      </div>

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

export default ProfilePage;
