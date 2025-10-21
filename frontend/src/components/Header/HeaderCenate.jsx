// ========================================================================
// 🔷 HeaderCenate.jsx – Encabezado institucional CENATE 2025
// ------------------------------------------------------------------------
// Incluye el logo de EsSalud (blanco), nombre institucional y fondo azul.
// Diseño responsivo, elegante y compatible con modo oscuro.
// ========================================================================

import React from "react";
import { Link } from "react-router-dom";

export default function HeaderCenate() {
  return (
    <header
      className="w-full bg-[#0a5ba9] text-white py-6 px-6 shadow-md flex flex-col sm:flex-row
                 items-center justify-between transition-colors duration-300"
    >
      {/* 🏥 Logo EsSalud (izquierda) */}
      <div className="flex items-center gap-3 mb-3 sm:mb-0">
        <img
          src="/images/LogoESSALUDBlanco.png"
          alt="Logo EsSalud"
          className="h-10 sm:h-12 object-contain drop-shadow-md"
        />
        <div className="hidden sm:block w-px h-8 bg-white/40 mx-2" />

      </div>

      {/* 🔗 Botón de inicio de sesión */}
      <div className="flex justify-center sm:justify-end w-full sm:w-auto">
        <Link
          to="/login"
          className="bg-white text-[#0a5ba9] px-6 py-2 rounded-lg font-semibold
                     hover:bg-[#e6f2ff] hover:scale-105 transition-all duration-300 shadow-md"
        >
          Iniciar sesión
        </Link>
      </div>
    </header>
  );
}