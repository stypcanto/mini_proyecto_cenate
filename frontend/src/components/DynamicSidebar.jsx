// ========================================================================
// 🌐 DynamicSidebar.jsx – Estilo Apple/CENATE 2025 (versión final)
// ------------------------------------------------------------------------
// Sidebar profesional con avatar, menú MBAC y navegación React Router
// 100% funcional (sin recargar index.html). Optimizado visualmente.
// ========================================================================

import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Activity,
  LogOut,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function DynamicSidebar() {
  const { permisos, loading } = usePermissions();
  const { user, logout } = useAuth();
  const location = useLocation();

  // ✅ Rutas corregidas (Dashboard apunta a /admin)
  const defaultMenu = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    {
      label: "Usuarios",
      icon: Users,
      subItems: [
        { label: "Lista de Usuarios", path: "/admin/users" },
        { label: "Crear Usuario", path: "/admin/users/create" },
      ],
    },
    { label: "Roles y Permisos", icon: Shield, path: "/admin/permisos" },
    { label: "Logs del Sistema", icon: Activity, path: "/admin/logs" },
    { label: "Reportes", icon: FileText, path: "/admin/reportes" },
  ];

  if (loading) {
    return (
      <aside className="w-72 h-screen flex items-center justify-center bg-[#111827] text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Cargando...
      </aside>
    );
  }

  return (
    <aside
      className="w-72 min-h-screen flex flex-col justify-between
                 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white
                 border-r border-slate-800 shadow-2xl"
    >
      {/* 👤 Avatar del usuario */}
      <div className="px-6 pt-8 pb-6 border-b border-slate-700 flex flex-col items-center text-center">
        <div
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0A5BA9] to-[#3B82F6] text-white
                     flex items-center justify-center text-3xl font-bold shadow-lg mb-3"
        >
          {user?.username?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <h2 className="text-lg font-semibold">{user?.username || "Usuario"}</h2>
        <p className="text-sm text-slate-400 mt-1">
          {user?.rol || "Administrador"}
        </p>
        <div className="mt-4 w-full h-[1px] bg-slate-700/50 rounded-full" />
      </div>

      {/* 📋 Navegación */}
      <nav className="flex-1 overflow-y-auto p-5 space-y-3 mt-2">
        {(permisos?.length ? permisos : defaultMenu).map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <div key={idx} className="space-y-1">
              {item.subItems ? (
                <details
                  className="group"
                  open={location.pathname.includes("/admin/users")}
                >
                  <summary
                    className={`flex items-center justify-between cursor-pointer px-3 py-2 rounded-lg transition-all ${
                      location.pathname.includes("/admin/users")
                        ? "bg-[#0A5BA9]/90 text-white"
                        : "hover:bg-slate-800/70 text-slate-300"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-slate-300 group-hover:text-white" />
                      {item.label}
                    </span>
                    <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                  </summary>

                  {/* Submenú */}
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((sub, i) => (
                      <NavLink
                        key={i}
                        to={sub.path}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? "bg-[#0A5BA9] text-white"
                              : "hover:bg-slate-800/60 text-slate-300"
                          }`
                        }
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                </details>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#0A5BA9]/90 text-white shadow-inner"
                        : "hover:bg-slate-800/70 text-slate-300"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      {/* 🚪 Cerrar sesión */}
      <div className="border-t border-slate-700 p-5">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-800/50
                     hover:bg-red-600/80 hover:text-white text-slate-300 font-medium
                     transition-all border border-slate-700"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}