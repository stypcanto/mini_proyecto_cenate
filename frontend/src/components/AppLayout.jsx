// ========================================================================
// 🧩 AppLayout – Sistema MBAC CENATE (versión final con MBACSidebar)
// ------------------------------------------------------------------------
// • Usa MBACSidebar dinámico basado en permisos reales
// • Incluye HeaderTemplate estilo iPhone (verde verdana Apple)
// • Sistema moderno y fluido con permisos MBAC integrados
// ========================================================================

import React from "react";
import MBACSidebar from "./layout/MBACSidebar";
import HeaderTemplate from "./Header/Header_template"; // ✅ Header Apple-like

export default function AppLayout({ children, title = "" }) {
  return (
    <div
      className="flex h-screen overflow-hidden transition-colors"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-primary)",
      }}
    >
      {/* ✅ Sidebar dinámico MBAC */}
      <MBACSidebar className="w-64 h-full" />

      {/* 🧱 Contenido principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 💚 Header superior (estilo Apple/iOS) */}
        <HeaderTemplate title={title} />

        {/* 🌈 Contenido dinámico */}
        <section
          className="flex-1 overflow-y-auto p-8 transition-colors"
          style={{
            backgroundColor: "var(--bg-main)",
            color: "var(--text-primary)",
          }}
        >
          {children}
        </section>
      </main>
    </div>
  );
}
