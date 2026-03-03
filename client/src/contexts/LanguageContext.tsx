import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LANGUAGES, t } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  // Charger la langue depuis localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved && saved in LANGUAGES) {
      setLanguageState(saved);
      applyLanguageToDOM(saved);
    } else {
      applyLanguageToDOM('ar');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    applyLanguageToDOM(lang);
  };

  const applyLanguageToDOM = (lang: Language) => {
    const dir = LANGUAGES[lang].dir;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.body.dir = dir;
  };

  const translate = (key: string) => t(key, language);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translate,
    dir: LANGUAGES[language].dir,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
