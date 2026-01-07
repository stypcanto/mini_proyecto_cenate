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

export default function ResponsiveSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Guardar estado de colapsado en localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }, [collapsed]);

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
                     bg-gradient-to-br from-emerald-600 to-emerald-700
                     text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95
                     transition-all duration-200 flex items-center justify-center"
          aria-label="Abrir menú lateral"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* 🧱 Sidebar principal */}
      <aside
        className={`fixed top-0 left-0 h-full z-40
                    bg-gradient-to-b from-[#0f172a] to-[#1e293b]
                    border-r border-slate-800 shadow-2xl
                    transform transition-all duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    ${collapsed ? "w-20" : "w-[340px]"}
                    lg:translate-x-0 lg:static lg:shadow-none`}
        style={{ overflow: 'visible' }}
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