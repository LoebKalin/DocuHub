
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { login } from '../services/authService';
import { LogIn, ShieldAlert, Sun, Moon } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const user = login(id, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid ID or password. Please try again.');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a] p-4 transition-colors duration-500">
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-8 right-8 p-3 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-all"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="bg-white dark:bg-[#1e293b] rounded-[40px] shadow-2xl dark:shadow-indigo-500/5 w-full max-w-md p-10 relative overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-800">
            <LogIn size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">DocuHub Login</h1>
          <p className="text-slate-400 dark:text-slate-500 mt-2 font-medium">Securely access your corporate documents</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 flex items-start rounded-r-xl">
            <ShieldAlert size={20} className="shrink-0 mr-3 mt-0.5" />
            <span className="text-sm font-bold tracking-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[13px] font-bold text-slate-500 dark:text-slate-400 mb-2.5">Identification ID</label>
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
            <label className="block text-[13px] font-bold text-slate-500 dark:text-slate-400 mb-2.5">Password</label>
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
            ) : 'Access Secure Portal'}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">
            For demo: <span className="text-indigo-600 dark:text-indigo-400 font-bold">admin / admin</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
