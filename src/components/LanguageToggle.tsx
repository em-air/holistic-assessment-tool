import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Non-floating, inline language toggle (English ↔ Arabic).
 * Reads / writes from the global LanguageContext — no props needed.
 *
 * `compact` renders a small pill suitable for nav bars.
 */
interface LanguageToggleProps {
  /** Render a smaller pill for tight spaces (nav bars). */
  compact?: boolean;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  /* ── Compact variant ───────────────────────────────── */
  if (compact) {
    return (
      <button
        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 text-sm font-medium text-gray-700"
        aria-label={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
      >
        <span>{language === 'en' ? '🇸🇦' : '🇺🇸'}</span>
        <span>{language === 'en' ? 'العربية' : 'English'}</span>
      </button>
    );
  }

  /* ── Full variant ──────────────────────────────────── */
  return (
    <div className="flex items-center space-x-3 rtl:space-x-reverse">
      <span className="text-sm font-medium text-gray-600">
        {language === 'en' ? 'Language:' : 'اللغة:'}
      </span>

      <div className="relative bg-gray-200 rounded-full p-1 flex items-center">
        {/* Background Slider */}
        <motion.div
          className="absolute bg-white rounded-full shadow-md"
          layout
          transition={{ type: 'spring', stiffness: 700, damping: 30 }}
          style={{
            width: '50%',
            height: '80%',
            left: language === 'en' ? '4%' : '46%',
            top: '10%',
          }}
        />

        {/* English Button */}
        <button
          onClick={() => setLanguage('en')}
          className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            language === 'en' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span className="flex items-center space-x-2 rtl:space-x-reverse">
            <span>🇺🇸</span>
            <span>English</span>
          </span>
        </button>

        {/* Arabic Button */}
        <button
          onClick={() => setLanguage('ar')}
          className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            language === 'ar' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span className="flex items-center space-x-2 rtl:space-x-reverse">
            <span>🇸🇦</span>
            <span>العربية</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default LanguageToggle;