import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors duration-200 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5 transition-transform duration-300 hover:rotate-12" />
      ) : (
        <SunIcon className="w-5 h-5 transition-transform duration-300 hover:rotate-90" />
      )}
    </button>
  );
};