/**
 * ================================================================
 * 🌐 DynamicSidebar.jsx – Menú lateral dinámico basado en MBAC
 * ================================================================
 * Muestra automáticamente los módulos y páginas visibles según
 * los permisos cargados por usePermissions().
 * ================================================================
 */

import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import { agruparPorModulo, getColorModulo } from "../utils/rbacUtils";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Stethoscope,
  FileText,
  LogOut,
  ChevronRight,
  Loader2,
} from "lucide-react";

/**
 * Mapeo fijo de colores y módulos
 */
const COLOR_MAP = {
  teal: "text-teal-700 bg-teal-100 hover:bg-teal-200",
  blue: "text-blue-700 bg-blue-100 hover:bg-blue-200",
  purple: "text-purple-700 bg-purple-100 hover:bg-purple-200",
  amber: "text-amber-700 bg-amber-100 hover:bg-amber-200",
  green: "text-green-700 bg-green-100 hover:bg-green-200",
  slate: "text-slate-700 bg-slate-100 hover:bg-slate-200",
};

/**
 * Íconos por módulo (usa includes para mayor robustez)
 */
const getIconForModule = (modulo) => {
  if (modulo.includes("Cita")) return <ClipboardList className="w-5 h-5" />;
  if (modulo.includes("Coordinador")) return <Users className="w-5 h-5" />;
  if (modulo.includes("Externo")) return <Users className="w-5 h-5" />;
  if (modulo.includes("Lineamiento")) return <FileText className="w-5 h-5" />;
  if (modulo.includes("Médico") || modulo.includes("Medico"))
    return <Stethoscope className="w-5 h-5" />;
  return <LayoutDashboard className="w-5 h-5" />;
};

export const DynamicSidebar = () => {
  const { permisos, loading } = usePermissions();
  const { user, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center text-slate-500 gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando módulos...
      </div>
    );
  }

  if (!permisos || permisos.length === 0) {
    return (
      <aside className="w-64 bg-white shadow-md border-r border-slate-200 h-screen flex flex-col justify-between">
        <div className="p-6 text-center text-slate-500">Sin permisos asignados</div>
        <div className="border-t border-slate-200 p-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-2 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    );
  }

  const modulos = agruparPorModulo(permisos);

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-xl shadow-xl border-r border-slate-200 min-h-screen flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <LayoutDashboard className="text-teal-600 w-6 h-6" />
          <div>
            <p className="font-semibold text-slate-800">Portal CENATE</p>
            <p className="text-xs text-slate-500">{user?.username}</p>
          </div>
        </div>

        {/* Contenido dinámico */}
        <nav className="p-4 space-y-4 overflow-y-auto">
          {Object.entries(modulos).map(([nombreModulo, paginas]) => {
            const colorKey = getColorModulo(nombreModulo);
            const colorClass = COLOR_MAP[colorKey] || COLOR_MAP.slate;
            const icono = getIconForModule(nombreModulo);

            return (
              <div key={nombreModulo}>
                {/* Encabezado del módulo */}
                <div className={`flex items-center gap-2 font-semibold text-sm uppercase mb-2 text-${colorKey}-700`}>
                  {icono}
                  {nombreModulo}
                </div>

                {/* Lista de páginas */}
                <ul className="space-y-1 pl-6">
                  {paginas
                    .filter((p) => p.permisos?.ver)
                    .map((pagina) => {
                      const activa = location.pathname === pagina.rutaPagina;
                      return (
                        <li key={pagina.rutaPagina}>
                          <NavLink
                            to={pagina.rutaPagina}
                            className={({ isActive }) =>
                              `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                isActive || activa
                                  ? colorClass
                                  : "text-slate-600 hover:bg-slate-100"
                              }`
                            }
                          >
                            <span>{pagina.pagina}</span>
                            <ChevronRight
                              className={`w-4 h-4 ${
                                activa ? "text-slate-700" : "text-slate-400"
                              }`}
                            />
                          </NavLink>
                        </li>
                      );
                    })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg py-2 transition-all"
        >
          <LogOut className="w-5 h-5 text-slate-600" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default DynamicSidebar;