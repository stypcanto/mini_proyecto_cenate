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
        </section>
      </main>
    </div>
  );
}