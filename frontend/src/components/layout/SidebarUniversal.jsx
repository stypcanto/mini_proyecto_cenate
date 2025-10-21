// src/components/layout/SidebarUniversal.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  Grid,
  Shield,
  LogOut,
  Menu,
  X,
  BarChart3,
  ClipboardList,
} from "lucide-react";

/**
 * Sidebar universal adaptado a la paleta CENATE.
 * Compatible con roles almacenados en localStorage.roles.
 */
export default function SidebarUniversal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const rawRoles = JSON.parse(localStorage.getItem("roles") || "[]");
  const roles = rawRoles.map((r) => String(r).toUpperCase());

  const canShow = (itemRoles) =>
    itemRoles.includes("*") ||
    roles.some((r) => itemRoles.map((x) => x.toUpperCase()).includes(r));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  const menuItems = [
    { key: "inicio", label: "Inicio", path: "/", icon: Home, roles: ["*"] },
    {
      key: "pacientes",
      label: "Pacientes",
      path: "/pacientes",
      icon: Users,
      roles: ["*"],
    },
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
      icon: BarChart3,
      roles: ["SUPERADMIN", "ADMIN", "AUDITOR_CLINIC"],
    },
    {
      key: "solicitudes",
      label: "Solicitudes",
      path: "/admin/solicitudes",
      icon: ClipboardList,
      roles: ["SUPERADMIN"],
    },
  ];

  return (
    <>
      {/* Fondo oscuro cuando se abre el menú en móvil */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar principal */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col bg-gradient-to-b
          from-cenate-blue to-cenate-dark text-white transition-all duration-300 ease-in-out shadow-2xl
          ${isOpen ? "w-64" : "w-0 lg:w-20"} overflow-hidden`}
      >
        {/* Header */}
        <div className="p-5 border-b border-cenate-teal/30 flex items-center justify-between">
          {isOpen ? (
            <span className="text-lg font-bold tracking-wide text-cenate-teal">
              CENATE
            </span>
          ) : (
            <span className="text-cenate-teal font-bold text-xl">C</span>
          )}
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems
            .filter((item) => canShow(item.roles))
            .map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-cenate-teal text-white shadow-strong"
                      : "text-slate-200 hover:bg-cenate-blue/60 hover:text-cenate-light"
                  }`
                }
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {isOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </NavLink>
            ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-cenate-teal/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              bg-cenate-danger hover:bg-red-700 text-white transition-all duration-200 font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            {isOpen && <span>Salir</span>}
          </button>
        </div>
      </aside>

      {/* Botón flotante móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] p-2 rounded-lg bg-cenate-blue text-white shadow-lg
          hover:bg-cenate-teal transition-colors duration-200 lg:hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </>
  );
}