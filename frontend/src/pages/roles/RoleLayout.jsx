// ========================================================================
// 🧩 RoleLayout.jsx — Contenedor base para dashboards por rol
// ------------------------------------------------------------------------
// Proporciona estructura uniforme (encabezado, contenido y estilo)
// para páginas como Coordinador, Médico, Externo, etc.
// ========================================================================

import React from "react";

export default function RoleLayout({ title, children }) {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        {title}
      </h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        {children}
      </div>
    </div>
  );
}