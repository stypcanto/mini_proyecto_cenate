// ========================================================================
// 📱 ResponsiveSidebar.jsx – Versión final (CENATE 2025)
// ------------------------------------------------------------------------
// • Integra DynamicSidebar con cierre automático en móviles
// • Evita duplicación de avatar o layout
// • Accesibilidad y transiciones Apple-like
// • ✅ NUEVO: Funcionalidad de colapsar/expandir en desktop
// ========================================================================

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import DynamicSidebar from "../DynamicSidebar";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";

export default function ResponsiveSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { collapsed, setCollapsed } = useSidebar();
  const { user } = useAuth();

  // 🧠 Bloquea scroll al abrir el sidebar en móvil
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ✅ Cierra el sidebar al hacer clic en cualquier enlace (solo móvil)
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) setIsOpen(false); // < lg breakpoint
  };

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Detectar si el usuario es EXTERNO o INSTITUCION_EX
  const isExternoRole = user?.roles?.some(
    (rol) =>
      typeof rol === "string"
        ? rol.toUpperCase().includes("EXTERNO") || rol.toUpperCase().includes("INSTITUCION")
        : rol?.authority?.toUpperCase().includes("EXTERNO") || rol?.authority?.toUpperCase().includes("INSTITUCION")
  ) || false;

  // Ancho del sidebar: más ancho para EXTERNO, normal para otros
  const sidebarWidth = isExternoRole
    ? "w-full max-w-lg lg:w-[420px]"  // Más ancho para EXTERNO (420px vs 340px)
    : "w-4/5 max-w-xs lg:w-[340px]";

  return (
    <>
      {/* 📱 Backdrop - Fondo oscuro interactivo (cuando sidebar está abierto en móvil) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30
                     lg:hidden animate-fadeIn cursor-pointer"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          role="button"
          aria-label="Cerrar menú lateral"
        ></div>
      )}

      {/* 🔘 Botón menú móvil - Solo visible cuando el menú está cerrado */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 rounded-2xl
                     bg-gradient-to-br from-cenate-600 to-cenate-700
                     text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95
                     transition-all duration-200 flex items-center justify-center focus:ring-2 focus:ring-cenate-600 focus:ring-offset-2"
          aria-label="Abrir menú lateral"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* 🧱 Sidebar principal */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 overflow-y-auto
                    bg-gradient-to-b from-[#0f172a] to-[#1e293b]
                    border-r border-slate-800 shadow-2xl
                    transform transition-all duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    ${collapsed ? "w-20" : sidebarWidth}
                    lg:translate-x-0 lg:shadow-none`}
        style={{ overflow: 'auto' }}
      >
        {/* 🔒 Botón cerrar (solo móvil) - MÁS PROMINENTE */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 z-50 p-2.5 rounded-xl
                     bg-red-500/90 hover:bg-red-500 border-2 border-white/20
                     transition-all duration-200 lg:hidden focus:outline-none 
                     focus:ring-2 focus:ring-red-500 active:scale-95 shadow-xl"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* ✅ Sidebar dinámico (único) */}
        <div onClick={handleLinkClick} className="h-full w-full" style={{ overflow: 'visible' }}>
          <DynamicSidebar collapsed={collapsed} onToggleCollapse={handleToggleCollapse} />
        </div>
      </aside>
    </>
  );
}