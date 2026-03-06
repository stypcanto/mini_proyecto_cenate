// ========================================================================
// 🧩 AppLayout – Sistema MBAC CENATE (versión final 2025)
// ------------------------------------------------------------------------
// • Usa ResponsiveSidebar (que incluye DynamicSidebar) → sidebar único
// • Integra HeaderTemplate estilo iPhone (verde verdana Apple)
// • Corrige render doble y mantiene un diseño limpio, moderno y fluido
// • Mejora accesibilidad y consistencia de colores globales
// ========================================================================

import React from "react";
import { useLocation } from "react-router-dom";
import ResponsiveSidebar from "./layout/ResponsiveSidebar";
import HeaderCenate from "./layout/HeaderCenate"; // ✅ Header institucional CENATE
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { VERSION, APP_INFO } from "../config/version";

// Rutas donde se oculta el footer y el contenido ocupa toda la altura
const ROUTES_SIN_FOOTER = ['/maraton2026/'];

export default function AppLayout({ children, title = "" }) {
  const { collapsed } = useSidebar();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const sinFooter = ROUTES_SIN_FOOTER.some(r => pathname.startsWith(r));

  // Detectar si el usuario es EXTERNO
  const isExternoRole = user?.roles?.some(
    (rol) =>
      typeof rol === "string"
        ? rol.toUpperCase().includes("EXTERNO") || rol.toUpperCase().includes("INSTITUCION")
        : rol?.authority?.toUpperCase().includes("EXTERNO") || rol?.authority?.toUpperCase().includes("INSTITUCION")
  ) || false;

  // Ajustar márgenes laterales basado en si el sidebar está colapsado
  const horizontalPadding = collapsed
    ? "px-4 md:px-6" // MENOS padding cuando está colapsado = MÁS espacio para contenido
    : "px-4 md:px-6"; // Padding uniforme

  // Ajustar margen izquierdo dinámicamente según estado del sidebar
  // Valores exactos: w-20 = 80px (colapsado), w-[340px] = 340px, w-[420px] = 420px
  const mainLeftMargin = collapsed
    ? "lg:ml-[80px]" // Sidebar colapsado (w-20 = 80px)
    : isExternoRole 
      ? "lg:ml-[420px]" // Sidebar expandido para EXTERNO
      : "lg:ml-[340px]"; // Sidebar expandido normal

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
          className={`flex-1 overflow-y-auto ${sinFooter ? 'px-2 md:px-3' : horizontalPadding} pt-8 md:pt-12 ${sinFooter ? 'pb-2' : 'pb-6 md:pb-8'} transition-all duration-300`}
          style={{
            backgroundColor: "var(--bg-main, #f9fafb)",
            color: "var(--text-primary, #1f2937)",
            scrollBehavior: "smooth",
            marginTop: "0px",
          }}
        >
          {children}

          {/* 📌 Footer con versión del sistema (oculto en ciertas rutas) */}
          {!sinFooter && (
            <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
              <p>{APP_INFO.name} - {APP_INFO.organization} {APP_INFO.year}</p>
              <p className="mt-1">v{VERSION.number} - {VERSION.name}</p>
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}