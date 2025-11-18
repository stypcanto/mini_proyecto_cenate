import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "", variant = "default" }) {
  const { isDarkMode, toggleTheme } = useTheme();

  // Estilos para el header azul
  const headerVariant = variant === "header";
  const buttonClass = headerVariant
    ? `relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200
       bg-white/10 hover:bg-white/20 border border-white/20 text-white
       hover:scale-105 active:scale-95 shadow-sm
       focus:outline-none focus:ring-2 focus:ring-white/40
       ${className}`
    : `
        relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
        border border-[var(--border-color)] shadow-sm
        hover:shadow-md hover:scale-[1.05] active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
        bg-[var(--bg-card)] text-[var(--text-primary)]
        ${className}
      `;

  return (
    <button
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      className={buttonClass}
      title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <Sun
        className={`absolute w-5 h-5 transition-all duration-500 ${
          headerVariant 
            ? "text-white" 
            : ""
        }
          ${isDarkMode ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"}
        `}
        style={headerVariant ? {} : { color: "var(--color-warning)" }}
      />
      <Moon
        className={`absolute w-5 h-5 transition-all duration-500 ${
          headerVariant 
            ? "text-white/90" 
            : ""
        }
          ${isDarkMode ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"}
        `}
        style={headerVariant ? {} : { color: "var(--color-info)" }}
      />
    </button>
  );
}