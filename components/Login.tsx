
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { login } from '../services/authService';
import { getTranslation, setLanguage, getCurrentLanguage, Language } from '../services/i18nService';
import { LogIn, ShieldAlert, Sun, Moon, Globe, Check, ChevronDown } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(getCurrentLanguage());
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Listen for language changes to update local state
  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLang(getCurrentLanguage());
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const user = login(id, password);
      if (user) {
        onLogin(user);
      } else {
        setError(getTranslation('login_error'));
      }
      setIsLoading(false);
    }, 800);
  };

  const handleLangSelect = (lang: Language) => {
    setLanguage(lang);
    setIsLangOpen(false);
  };

  const languages: { name: Language; label: string; flag: string }[] = [
    { name: 'English', label: 'English', flag: '🇺🇸' },
    { name: 'Khmer', label: 'ភាសាខ្មែរ', flag: '🇰🇭' },
    { name: 'Vietnam', label: 'Tiếng Việt', flag: '🇻🇳' },
    { name: 'China', label: '中文', flag: '🇨🇳' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a] p-4 transition-colors duration-500">
      {/* Top Controls */}
      <div className="absolute top-8 right-8 flex items-center space-x-3">
        {/* Language Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-bold text-sm"
          >
            <Globe size={18} />
            <span className="hidden sm:inline">{currentLang}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isLangOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              {languages.map((lang) => (
                <button
                  key={lang.name}
                  onClick={() => handleLangSelect(lang.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    currentLang === lang.name
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3 text-lg">{lang.flag}</span>
                    <span className="font-bold text-sm">{lang.label}</span>
                  </div>
                  {currentLang === lang.name && <Check size={14} strokeWidth={3} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-3 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-all"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-[40px] shadow-2xl dark:shadow-indigo-500/5 w-full max-w-md p-10 relative overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-300">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-800">
            <LogIn size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{getTranslation('login_title')}</h1>
          <p className="text-slate-400 dark:text-slate-500 mt-2 font-medium">{getTranslation('login_subtitle')}</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 flex items-start rounded-r-xl">
            <ShieldAlert size={20} className="shrink-0 mr-3 mt-0.5" />
            <span className="text-sm font-bold tracking-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[13px] font-bold text-slate-500 dark:text-slate-400 mb-2.5">{getTranslation('login_id_label')}</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 dark:text-white font-medium"
              placeholder="e.g. 1023"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-500 dark:text-slate-400 mb-2.5">{getTranslation('login_pass_label')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 dark:text-white font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-[20px] shadow-xl shadow-indigo-500/20 dark:shadow-none transition-all flex items-center justify-center active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : getTranslation('login_btn')}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Demo: <span className="text-indigo-600 dark:text-indigo-400 font-bold">admin / admin</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
