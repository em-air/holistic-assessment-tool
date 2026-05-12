import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Globe, X } from 'lucide-react';

const PROGRESS_STEPS: Array<{ threshold: number; label: string }> = [
  { threshold: 0,  label: 'Fetching assessment results…' },
  { threshold: 25, label: 'Generating report PDF…' },
  { threshold: 55, label: 'Uploading to secure storage…' },
  { threshold: 80, label: 'Almost ready…' },
];

function getStepLabel(progress: number): string {
  for (let i = PROGRESS_STEPS.length - 1; i >= 0; i--) {
    if (progress >= PROGRESS_STEPS[i].threshold) return PROGRESS_STEPS[i].label;
  }
  return PROGRESS_STEPS[0].label;
}

export type ReportAudience = 'parent' | 'teacher';
export type ReportLanguage = 'english' | 'arabic' | 'both';

interface ReportOptionsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (audience: ReportAudience, language: ReportLanguage) => void;
  isGenerating?: boolean;
}

const ReportOptionsDialog: React.FC<ReportOptionsDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isGenerating = false,
}) => {
  const [audience, setAudience] = useState<ReportAudience>('parent');
  const [language, setLanguage] = useState<ReportLanguage>('both');
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isGenerating) {
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          // Fast early, slow near 90% — simulates realistic generation phases
          const increment = prev < 30 ? 2 : prev < 60 ? 1 : 0.5;
          return Math.min(prev + increment, 90);
        });
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setProgress(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isGenerating]);

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => { if (!isGenerating) onClose(); }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Report Options</h3>
          {!isGenerating && (
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Audience selection */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-violet-500" />
            <span className="text-sm font-semibold text-gray-700">Report Type</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => setAudience('parent')}
              className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                audience === 'parent'
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              For Parents
            </button>
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => setAudience('teacher')}
              className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                audience === 'teacher'
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              For Teachers
            </button>
          </div>
        </div>

        {/* Language selection */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={16} className="text-violet-500" />
            <span className="text-sm font-semibold text-gray-700">Language</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['english', 'arabic', 'both'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                disabled={isGenerating}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                  language === lang
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {lang === 'english' ? 'English' : lang === 'arabic' ? 'Arabic' : 'Both'}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar — visible while generating */}
        {isGenerating && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-gray-500">{getStepLabel(progress)}</span>
              <span className="text-sm font-semibold text-violet-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-violet-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">This may take up to 2 minutes</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(audience, language)}
            disabled={isGenerating}
            className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReportOptionsDialog;
