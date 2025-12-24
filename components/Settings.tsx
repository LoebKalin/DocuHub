
import React, { useState, useEffect } from 'react';
import { getTranslation, setLanguage, getCurrentLanguage, Language } from '../services/i18nService';
import { Sun, Moon, Globe, Check, AlertCircle, ShieldCheck } from 'lucide-react';

const Settings: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>(getCurrentLanguage());
  const [pendingLang, setPendingLang] = useState<Language | null>(null);
  const [, setTick] = useState(0);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLang(getCurrentLanguage());
      setTick(t => t + 1);
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLangClick = (lang: Language) => {
    if (lang === currentLang) return;
    setPendingLang(lang);
  };

  const confirmLangChange = () => {
    if (pendingLang) {
      setLanguage(pendingLang);
      setPendingLang(null);
    }
  };

  const languages: { name: Language; label: string; flag: string }[] = [
    { name: 'English', label: 'English', flag: '🇺🇸' },
    { name: 'Khmer', label: 'ភាសាខ្មែរ', flag: '🇰🇭' },
    { name: 'Vietnam', label: 'Tiếng Việt', flag: '🇻🇳' },
    { name: 'China', label: '中文 (Chinese)', flag: '🇨🇳' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{getTranslation('settings_title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">{getTranslation('settings_desc')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Theme Setting */}
        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
              {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">{getTranslation('settings_theme')}</h2>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-[#0f172a] rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all group"
          >
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}
            </span>
            <div className={`w-14 h-8 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        {/* Language Setting */}
        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
              <Globe size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">{getTranslation('settings_lang')}</h2>
          </div>

          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.name}
                onClick={() => handleLangClick(lang.name)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  currentLang === lang.name
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                    : 'bg-white dark:bg-[#0f172a] border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-4">{lang.flag}</span>
                  <span className="font-bold">{lang.label}</span>
                </div>
                {currentLang === lang.name && <Check size={18} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingLang && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-[40px] shadow-2xl p-10 border border-slate-100 dark:border-slate-800 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <RefreshCw size={40} className="animate-spin" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{getTranslation('confirm_lang_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
              {getTranslation('confirm_lang_desc')} <span className="text-indigo-600 font-black">{pendingLang}</span>?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPendingLang(null)}
                className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                {getTranslation('btn_cancel')}
              </button>
              <button
                onClick={confirmLangChange}
                className="py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
              >
                {getTranslation('btn_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RefreshCw = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);

export default Settings;
