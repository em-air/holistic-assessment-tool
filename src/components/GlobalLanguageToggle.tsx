import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../i18n';

/**
 * GlobalLanguageToggle - A floating language switcher that appears on every page.
 * Positioned at top-right (or top-left in RTL) as a small pill button.
 */
const GlobalLanguageToggle: React.FC = () => {
  const { language, toggleLanguage, isRTL } = useLanguage();
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <motion.div
      className={`fixed top-20 ${isRTL ? 'left-4' : 'right-4'} z-[99] flex flex-col items-end gap-2`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 bg-white/95 backdrop-blur-md shadow-lg border border-gray-200 rounded-full px-3 py-2 hover:shadow-xl transition-all duration-300 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
      >
        <span className="text-lg">
          {language === 'en' ? '🇺🇸' : '🇸🇦'}
        </span>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          {language === 'en' ? 'EN' : 'عر'}
        </span>
        <motion.svg
          className="w-3 h-3 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="bg-white/95 backdrop-blur-md shadow-xl border border-gray-200 rounded-2xl overflow-hidden min-w-[160px]"
          >
            {/* English Option */}
            <button
              onClick={() => {
                if (language !== 'en') toggleLanguage();
                setIsExpanded(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${
                language === 'en' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">🇺🇸</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">English</span>
                <span className="text-xs text-gray-500">English</span>
              </div>
              {language === 'en' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto"
                >
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </button>

            <div className="border-t border-gray-100" />

            {/* Arabic Option */}
            <button
              onClick={() => {
                if (language !== 'ar') toggleLanguage();
                setIsExpanded(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${
                language === 'ar' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">🇸🇦</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">العربية</span>
                <span className="text-xs text-gray-500">Arabic</span>
              </div>
              {language === 'ar' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto"
                >
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GlobalLanguageToggle;
