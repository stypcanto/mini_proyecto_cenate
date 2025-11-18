// ========================================================================
// 🌓 ThemeContext.js – Contexto global para el sistema de temas
// ------------------------------------------------------------------------
// Gestiona el estado del tema (claro/oscuro) de forma global y persistente
// ========================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Por defecto iniciar en modo claro
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cargar preferencia guardada en localStorage al montar el componente
  useEffect(() => {
    const savedTheme = localStorage.getItem('cenate-theme');
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      applyTheme(isDark);
    } else {
      // Si no hay preferencia guardada, usar modo claro por defecto
      applyTheme(false);
    }
  }, []);

  // Aplicar el tema al DOM
  const applyTheme = (isDark) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Cambiar tema y persistir la preferencia
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('cenate-theme', newTheme ? 'dark' : 'light');
  };

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;