// ========================================================================
// 🧩 RoleLayout.jsx — Contenedor base para dashboards por rol
// ------------------------------------------------------------------------
// Estructura común con encabezado, botones de navegación entre submódulos.
// ========================================================================

import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function RoleLayout({ title, modules = [], children }) {
  const location = useLocation();

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <header>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </header>

      {/* Navegación de módulos */}
      {modules.length > 0 && (
        <nav className="flex flex-wrap gap-3">
          {modules.map((mod) => (
            <Link
              key={mod.path}
              to={mod.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                location.pathname === mod.path
                  ? "bg-cenate-blue text-white shadow-sm"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {mod.icon}
              {mod.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Contenido principal */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        {children}
      </div>
    </div>
  );
}