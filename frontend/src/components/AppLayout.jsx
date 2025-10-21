// ========================================================================
// 🧩 AppLayout – Sistema MBAC CENATE (versión final sin duplicación)
// ------------------------------------------------------------------------
// • Usa ResponsiveSidebar (que contiene DynamicSidebar) → sidebar único
// • Incluye HeaderTemplate estilo iPhone (verde verdana Apple)
// • Corrige render doble y mantiene el diseño limpio, moderno y fluido
// ========================================================================

import React from "react";
import ResponsiveSidebar from "./layout/ResponsiveSidebar";
import HeaderTemplate from "./Header/Header_template"; // ✅ Nuevo header Apple-like

export default function AppLayout({ children, title = "" }) {
  return (
    <div
      className="flex h-screen overflow-hidden transition-colors"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-primary)",
      }}
    >
      {/* ✅ Sidebar único */}
      <ResponsiveSidebar />

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