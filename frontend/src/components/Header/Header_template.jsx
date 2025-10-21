// ========================================================================
// 🔷 HeaderTemplate.jsx – Header institucional EsSalud / CENATE 2025
// ------------------------------------------------------------------------
// • Degradado vertical Apple-like (#0A5BA9 → #094580)
// • Búsqueda translúcida y sombra institucional
// • Diseño adaptado al branding oficial CENATE–EsSalud
// ========================================================================

import React from "react";
import { Search } from "lucide-react";
import ThemeToggle from "../ThemeToggle";

export default function HeaderTemplate({ title = "CENATE" }) {
  return (
    <header
      className="sticky top-0 z-40 w-full shadow-md backdrop-blur-md border-b border-[#0a5ba9]/20"
      style={{
        background: "linear-gradient(to bottom, #0A5BA9 0%, #094580 100%)",
        color: "#FFFFFF",
      }}
    >
      <div className="flex items-center justify-between px-8 py-4">
        {/* 🏷️ Título institucional */}
        <h1
          className="text-xl sm:text-2xl font-semibold tracking-wide"
          style={{
            fontFamily: "Inter, -apple-system, sans-serif",
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.25)",
          }}
        >
          {title}
        </h1>

        {/* 🔍 Buscador institucional */}
        <div className="flex-1 max-w-md mx-8 relative hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/85 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/20 text-white
                       placeholder-white/75 outline-none focus:bg-white/30
                       focus:ring-2 focus:ring-white/40
                       transition-all duration-300 backdrop-blur-sm
                       border border-white/30 shadow-inner"
          />
        </div>

        {/* 🌗 Alternar tema */}
        <div className="ml-4">
          <ThemeToggle />
        </div>
      </div>

      {/* Sombra sutil inferior */}
      <div
        className="h-[1px] w-full"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0.15), rgba(0,0,0,0.15))",
        }}
      />
    </header>
  );
}