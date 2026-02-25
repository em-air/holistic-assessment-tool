import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
}

const STORAGE_KEY = 'app-language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'ar' || stored === 'en') return stored;
    } catch {
      // localStorage may not be available
    }
    return 'en';
  });

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  // Persist language choice (no document-level dir change — only Homepage translates text)
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  }, [language, setLanguage]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};
