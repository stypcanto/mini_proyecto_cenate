// ========================================================================
// 🧩 AppLayout – Sistema MBAC CENATE (versión final 2025)
// ------------------------------------------------------------------------
// • Usa ResponsiveSidebar (que incluye DynamicSidebar) → sidebar único
// • Integra HeaderTemplate estilo iPhone (verde verdana Apple)
// • Corrige render doble y mantiene un diseño limpio, moderno y fluido
// • Mejora accesibilidad y consistencia de colores globales
// ========================================================================

import React from "react";
import ResponsiveSidebar from "./layout/ResponsiveSidebar";
import HeaderTemplate from "./Header/Header_template"; // ✅ Header Apple-like
import { VERSION, APP_INFO } from "../config/version";

export default function AppLayout({ children, title = "" }) {
  return (
    <div
      className="flex h-screen overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-primary)",
      }}
    >
      {/* ✅ Sidebar único (responsive) */}
      <ResponsiveSidebar />

      {/* 🧱 Contenido principal */}
      <main
        className="flex-1 flex flex-col overflow-hidden"
        role="main"
        aria-label={title || "Contenido principal"}
      >
        {/* 💚 Header superior (estilo Apple/iOS) */}
        <HeaderTemplate title={title} />

        {/* 🌈 Contenido dinámico con scroll suave */}
        <section
          className="flex-1 overflow-y-auto p-6 md:p-8 transition-colors duration-300"
          style={{
            backgroundColor: "var(--bg-main)",
            color: "var(--text-primary)",
            scrollBehavior: "smooth",
          }}
        >
          {children}

          {/* 📌 Footer con versión del sistema */}
          <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>{APP_INFO.name} - {APP_INFO.organization} {APP_INFO.year}</p>
            <p className="mt-1">v{VERSION.number} - {VERSION.name}</p>
          </footer>
        </section>
      </main>
    </div>
  );
}