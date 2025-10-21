// ========================================================================
// 🌓 ThemeToggle.jsx – Botón para cambiar entre modo claro y oscuro
// ========================================================================

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200 
        bg-slate-100 hover:bg-slate-200 
        dark:bg-slate-700 dark:hover:bg-slate-600
        text-slate-600 dark:text-slate-300
        ${className}
      `}
      title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;