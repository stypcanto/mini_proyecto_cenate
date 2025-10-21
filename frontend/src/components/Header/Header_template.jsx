// ========================================================================
// 💚 HeaderTemplate.jsx – Header global estilo iPhone (CENATE 2025)
// ------------------------------------------------------------------------
// • Degradado vertical #113820 → #1C5B36 (Apple-like, verde profesional)
// • Barra fija, buscador translúcido y sombra sutil
// • Compatible con modo oscuro y ThemeToggle
// ========================================================================

import React from "react";
import { Search } from "lucide-react";
import ThemeToggle from "../ThemeToggle";

export default function HeaderTemplate({ title = "" }) {
  return (
    <header
      className="sticky top-0 z-40 w-full shadow-lg backdrop-blur-md border-b border-[var(--border-color)]"
      style={{
        background: "linear-gradient(to bottom, #113820 0%, #1C5B36 100%)", // 💚 Degradado vertical Apple
        color: "white",
      }}
    >
      <div className="flex items-center justify-between px-8 py-4">
        {/* 🏷️ Título de la página */}
        <h1
          className="text-xl font-semibold tracking-wide drop-shadow-sm"
          style={{
            fontFamily: "Inter, -apple-system, sans-serif",
            textShadow: "0 1px 2px rgba(0,0,0,0.25)",
          }}
        >
          {title || "CENATE"}
        </h1>

        {/* 🔍 Buscador estilo iOS */}
        <div className="flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/85 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/20 text-white
                       placeholder-white/75 outline-none focus:bg-white/30
                       transition-all duration-300 backdrop-blur-sm
                       border border-white/30 shadow-inner"
          />
        </div>

        {/* 🌗 Botón para alternar tema */}
        <ThemeToggle />
      </div>
    </header>
  );
}