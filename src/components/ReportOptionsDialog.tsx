import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Globe, X } from 'lucide-react';

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
