// ========================================================================
// 📱 ResponsiveSidebar.jsx – Versión final sin duplicaciones (CENATE 2025)
// ------------------------------------------------------------------------
// • Sidebar dinámico único con DynamicSidebar
// • Elimina avatar duplicado
// • Compatible con modo oscuro, MBAC y transiciones suaves
// ========================================================================

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import DynamicSidebar from "../DynamicSidebar";

export default function ResponsiveSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // Bloquea scroll al abrir sidebar móvil
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <>
      {/* 🔘 Botón menú móvil */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-11 h-11 rounded-2xl
                   bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)]
                   text-white shadow-lg hover:brightness-110 active:scale-95
                   transition-all duration-200 backdrop-blur-md"
        aria-label="Abrir menú lateral"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 🧱 Sidebar principal */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 flex flex-col
                    bg-[var(--bg-card)] border-r border-[var(--border-color)]
                    shadow-2xl transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 lg:static lg:shadow-none`}
      >
        {/* ✅ Sidebar dinámico ÚNICO */}
        <DynamicSidebar />

        {/* ❌ Avatar duplicado eliminado */}

        {/* 🔒 Cerrar (solo móvil) */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--bg-hover)]/80 hover:bg-[var(--bg-hover)] transition-all lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
      </aside>

      {/* 📱 Fondo borroso en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}