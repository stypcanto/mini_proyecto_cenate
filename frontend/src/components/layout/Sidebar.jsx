// src/components/layout/Sidebar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  Grid,
  Shield,
  LogOut,
  Home,
  Menu,
  X,
  Activity,
} from "lucide-react";

/**
 * Sidebar general CENATE
 * Visible para roles externos, médicos, coordinadores, etc.
 */
export default function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  // Extraer datos del localStorage
  const rawRoles = JSON.parse(localStorage.getItem("roles") || "[]");
  const roles = rawRoles.map((r) => String(r).toUpperCase());
  const nombre = localStorage.getItem("username") || "Usuario";

  // Definición del menú
  const menuItems = [
    { key: "inicio", label: "Inicio", path: "/", icon: Home, roles: ["*"] },
    { key: "pacientes", label: "Pacientes", path: "/pacientes", icon: Users, roles: ["*"] },
    {
      key: "transferencias",
      label: "Transferencia Exámenes",
      path: "/transferencia-examenes",
      icon: FileText,
      roles: ["*"],
    },
    {
      key: "admin",
      label: "Administración",
      path: "/admin",
      icon: Shield,
      roles: ["SUPERADMIN", "ADMIN"],
    },
    {
      key: "reportes",
      label: "Reportes",
      path: "/reportes",
      icon: Grid,
      roles: ["SUPERADMIN", "ADMIN", "AUDITOR_CLINIC"],
    },
    {
      key: "actividad",
      label: "Actividad",
      path: "/actividad",
      icon: Activity,
      roles: ["*"],
    },
  ];

  const canShow = (itemRoles) =>
    itemRoles.includes("*") ||
    roles.some((r) => itemRoles.map((x) => x.toUpperCase()).includes(r));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar principal */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gradient-to-b from-blue-950 to-slate-900
          text-white shadow-xl z-50 transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-0 lg:w-20"} overflow-hidden
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-5 py-6 border-b border-blue-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">
                  {nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              {isOpen && (
                <div>
                  <p className="text-sm font-semibold truncate w-32">{nombre}</p>
                  <p className="text-xs text-blue-300">
                    {roles.length ? roles[0] : "Sin rol"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Menú principal */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {menuItems
              .filter((m) => canShow(m.roles))
              .map((m) => (
                <NavLink
                  key={m.key}
                  to={m.path}
                  className={({ isActive }) =>
                    `
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                      transition-all duration-200 relative group
                      ${
                        isActive
                          ? "bg-blue-700 text-white shadow-md border-l-4 border-teal-400"
                          : "text-white/80 hover:bg-blue-800 hover:text-white"
                      }
                    `
                  }
                >
                  <m.icon className="w-5 h-5" />
                  {isOpen && <span>{m.label}</span>}

                  {/* Tooltip si el sidebar está colapsado */}
                  {!isOpen && (
                    <span className="absolute left-16 bg-slate-800 text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.label}
                    </span>
                  )}
                </NavLink>
              ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-blue-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md
              bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all"
            >
              <LogOut className="w-4 h-4" />
              {isOpen && <span>Salir</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Toggle botón móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] p-2 rounded-lg bg-blue-900 text-white shadow-md hover:bg-blue-800 transition-colors duration-200 lg:hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </>
  );
}