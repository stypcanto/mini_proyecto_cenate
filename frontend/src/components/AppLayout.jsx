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
import HeaderCenate from "./layout/HeaderCenate"; // ✅ Header institucional CENATE
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { VERSION, APP_INFO } from "../config/version";

export default function AppLayout({ children, title = "" }) {
  const { collapsed } = useSidebar();
  const { user } = useAuth();

  // Detectar si el usuario es EXTERNO
  const isExternoRole = user?.roles?.some(
    (rol) =>
      typeof rol === "string"
        ? rol.toUpperCase().includes("EXTERNO") || rol.toUpperCase().includes("INSTITUCION")
        : rol?.authority?.toUpperCase().includes("EXTERNO") || rol?.authority?.toUpperCase().includes("INSTITUCION")
  ) || false;

  // Ajustar márgenes laterales basado en si el sidebar está colapsado
  const horizontalPadding = collapsed
    ? "px-6 md:px-12" // MENOS padding cuando está colapsado = MÁS espacio para contenido
    : "px-24 md:px-32"; // MÁS padding cuando está expandido = MENOS espacio (sidebar ocupa más)

  // Ajustar margen izquierdo para EXTERNO (sidebar más ancho)
  const mainLeftMargin = isExternoRole ? "lg:ml-[420px]" : "lg:ml-[340px]";

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300"
      style={{
        backgroundColor: "var(--bg-main, #f9fafb)",
        color: "var(--text-primary, #1f2937)",
      }}
    >
      {/* ✅ Sidebar único (responsive) */}
      <ResponsiveSidebar />

      {/* 🧱 Contenido principal con header fijo */}
      <main
        className={`flex-1 flex flex-col w-full h-screen overflow-hidden mt-24 ${mainLeftMargin}`}
        role="main"
        aria-label={title || "Contenido principal"}
      >
        {/* 💚 Header superior FIJO (estilo producción - Image #7) */}
        <HeaderCenate />

        {/* 🌈 Contenido dinámico con scroll suave (compensado para header fijo de 96px h-24) */}
        <section
          className={`flex-1 overflow-y-auto ${horizontalPadding} pt-8 md:pt-12 pb-6 md:pb-8 transition-all duration-300`}
          style={{
            backgroundColor: "var(--bg-main, #f9fafb)",
            color: "var(--text-primary, #1f2937)",
            scrollBehavior: "smooth",
            marginTop: "0px",
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