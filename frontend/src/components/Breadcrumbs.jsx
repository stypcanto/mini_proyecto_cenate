// ========================================================================
// 🧭 Breadcrumbs.jsx – Navegación por migas de pan reutilizable
// ========================================================================
// • Componente reutilizable para mostrar ruta de navegación
// • Responsive: horizontal en desktop, colapsable en móvil
// • Soporte Dark Mode completo
// • Accesibilidad: aria-current, aria-label
// ========================================================================

import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Breadcrumbs({ items = [], separator = "/" }) {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  const handleNavigate = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <nav
      className="mb-6 px-1 py-2"
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {/* Home link */}
        <li>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-cenate-600 dark:text-cenate-400 hover:text-cenate-700 dark:hover:text-cenate-300 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cenate-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded px-2 py-1"
            aria-label="Ir a inicio"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </li>

        {/* Separator */}
        <li className="text-gray-400 dark:text-gray-600 mx-0.5">
          <ChevronRight className="w-4 h-4" />
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1">
              {isLast ? (
                // Último item: no clickeable, solo texto
                <span
                  className="text-gray-700 dark:text-gray-300 font-medium text-sm px-2 py-1 rounded"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                // Items intermedios: clickeables
                <>
                  <button
                    onClick={() => handleNavigate(item.path)}
                    className="text-cenate-600 dark:text-cenate-400 hover:text-cenate-700 dark:hover:text-cenate-300 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cenate-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded px-2 py-1"
                    aria-label={`Ir a ${item.label}`}
                  >
                    {item.label}
                  </button>

                  {/* Separator */}
                  {index < items.length - 1 && (
                    <span className="text-gray-400 dark:text-gray-600 mx-0.5">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
