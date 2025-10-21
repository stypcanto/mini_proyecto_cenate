// ========================================================================
// 📱 ResponsiveSidebar.jsx – Versión final (CENATE 2025)
// ------------------------------------------------------------------------
// • Integra DynamicSidebar con cierre automático en móviles
// • Evita duplicación de avatar o layout
// • Accesibilidad y transiciones Apple-like
// ========================================================================

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import DynamicSidebar from "../DynamicSidebar";

export default function ResponsiveSidebar() {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      {/* 🔘 Botón menú móvil */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-11 h-11 rounded-2xl
                   bg-gradient-to-br from-[#0A5BA9] to-[#3B82F6]
                   text-white shadow-lg hover:brightness-110 active:scale-95
                   transition-all duration-200 backdrop-blur-md"
        aria-label="Abrir menú lateral"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 🧱 Sidebar principal */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 flex flex-col
                    bg-gradient-to-b from-[#0f172a] to-[#1e293b]
                    border-r border-slate-800 shadow-2xl
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 lg:static lg:shadow-none`}
      >
        {/* ✅ Sidebar dinámico (único) */}
        <div onClick={handleLinkClick}>
          <DynamicSidebar />
        </div>

        {/* 🔒 Botón cerrar (solo móvil) */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl
                     bg-white/10 hover:bg-white/20 transition-all
                     lg:hidden focus:outline-none"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </aside>

      {/* 📱 Fondo semitransparente (cuando sidebar abierto) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30
                     lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
}