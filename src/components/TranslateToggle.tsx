import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Loader2 } from 'lucide-react';
import {
  getLanguage,
  setLanguage,
  initTranslation,
  onLanguageChange,
} from '../services/translationService';

/* ────────────────────────────────────────────────────────────────────
 * TranslateToggle
 *
 * Floating EN ↔ AR toggle. Drives a DOM-level translation service
 * that walks the page's text nodes and translates them via Google's
 * free translate API — exactly like Chrome's built-in page translate.
 *
 *  • No page reload
 *  • No iframes / banners
 *  • No hardcoded strings
 *  • Caches translations for instant repeat visits
 *  • MutationObserver auto-translates new React renders
 *  • Switching back to English restores originals instantly
 * ──────────────────────────────────────────────────────────────── */

type Lang = 'en' | 'ar';

export default function TranslateToggle() {
  const [lang, setLang] = useState<Lang>(getLanguage);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialise on mount (restores saved language)
  useEffect(() => {
    setLoading(true);
    initTranslation().finally(() => setLoading(false));
  }, []);

  // Stay in sync if something else changes the language
  useEffect(() => {
    return onLanguageChange((l) => setLang(l));
  }, []);

  const switchTo = async (target: Lang) => {
    if (target === lang) {
      setOpen(false);
      return;
    }
    setOpen(false);
    setLoading(true);
    await setLanguage(target);
    setLoading(false);
  };

  const languages: { code: Lang; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <div className="notranslate fixed top-4 right-4 z-[9999]" translate="no">
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-md
                   border border-gray-200 rounded-full shadow-lg hover:shadow-xl
                   transition-all duration-200 text-sm font-semibold text-gray-700
                   hover:border-purple-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle language"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
        ) : (
          <Globe className="w-4 h-4 text-purple-500" />
        )}
        <span>{lang === 'en' ? '🇬🇧 EN' : '🇸🇦 AR'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 bg-white/95 backdrop-blur-md
                       border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
          >
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => switchTo(l.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium
                            transition-colors duration-150
                            ${
                              lang === l.code
                                ? 'bg-purple-50 text-purple-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span className="flex-1 text-left">{l.label}</span>
                {lang === l.code && (
                  <Check className="w-4 h-4 text-purple-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}