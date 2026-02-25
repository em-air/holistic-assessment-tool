import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language, TranslationKeys } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof TranslationKeys, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved === 'ar' ? 'ar' : 'en') as Language;
  });

  const isRTL = language === 'ar';

  // Apply RTL direction to document
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    if (isRTL) {
      document.body.style.fontFamily = "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif";
    } else {
      document.body.style.fontFamily = '';
    }
  }, [language, isRTL]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  }, [language, setLanguage]);

  const t = useCallback((key: keyof TranslationKeys, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || translations['en'][key] || key;
    
    // Replace {param} placeholders
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }
    return text;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
