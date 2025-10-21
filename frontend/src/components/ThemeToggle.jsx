import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      className={`
        relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
        border border-[var(--border-color)] shadow-sm
        hover:shadow-md hover:scale-[1.05] active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
        bg-[var(--bg-card)] text-[var(--text-primary)]
        ${className}
      `}
      title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <Sun
        className={`absolute w-5 h-5 transition-all duration-500
          ${isDarkMode ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"}
        `}
        style={{ color: "var(--color-warning)" }}
      />
      <Moon
        className={`absolute w-5 h-5 transition-all duration-500
          ${isDarkMode ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"}
        `}
        style={{ color: "var(--color-info)" }}
      />
    </button>
  );
}