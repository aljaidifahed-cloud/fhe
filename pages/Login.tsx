import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { GlobeAltIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { MoonLogo } from '../components/MoonLogo';


interface LoginProps {
  onLogin: (userId: string) => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Fetch all employees
      const { getEmployees } = await import('../services/mockService');
      const employees = await getEmployees();

      // 2. Find user by email
      const user = employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());

      // 3. Validate Password ("12" for everyone)
      if (user && password === '12') {
        onLogin(user.id);
      } else {
        setError(t('invalid_credentials'));
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("System error during login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4 rtl:right-4 rtl:left-auto z-10">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 rtl:space-x-reverse text-slate-400 hover:text-white transition-colors bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm"
        >
          <ArrowLeftIcon className="w-5 h-5 rtl:rotate-180" />
          <span>{t('btn_back_home')}</span>
        </button>
      </div>

      <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto z-10">
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700 backdrop-blur-sm"
        >
          <GlobeAltIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language === 'en' ? 'العربية' : 'English'}
          </span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-20 border border-white/20 dark:border-slate-700">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="h-24 w-24 mx-auto mb-2">
              <MoonLogo className="w-full h-full" />
            </div>
            <h2 className="text-2xl font-bold text-black">{t('login_title')}</h2>
            <p className="text-sm text-slate-500 mt-2">{t('login_subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-black mb-1">{t('email_label')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black"
                dir="ltr"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">{t('password_label')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black"
                dir="ltr"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              {t('sign_in_button')}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            MOON HR SaaS &copy; 2023 Tech Arabia
          </p>
        </div>
      </div>
    </div>
  );
};