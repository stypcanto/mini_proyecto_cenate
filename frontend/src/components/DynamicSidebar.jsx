// ========================================================================
// 🌐 DynamicSidebar.jsx – Navegación Completa SUPERADMIN CENATE 2025
// ------------------------------------------------------------------------
// Sidebar profesional con acceso total para SUPERADMIN
// Corrección: Solo se pinta el elemento activo, no múltiples
// ========================================================================

import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Activity,
  LogOut,
  ChevronRight,
  ChevronDown,
  Stethoscope,
  Calendar,
  ClipboardList,
  BarChart3,
  UserPlus,
  Clock,
  Building2,
  FileCheck,
  Lock,
  Settings,
  Database,
  TrendingUp,
} from "lucide-react";

export default function DynamicSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    admin: true,
    medico: false,
    coordinador: false,
    externo: false,
    citas: false,
    lineamientos: false,
  });

  // Verificar si es SUPERADMIN o ADMIN
  const roles = (user?.roles || []).map(r => 
    typeof r === 'string' ? r.toUpperCase() : 
    r?.authority ? r.authority.replace('ROLE_', '').toUpperCase() : 
    String(r).toUpperCase()
  );
  const isSuperAdmin = roles.includes("SUPERADMIN") || roles.includes("ADMIN");

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 🎯 MENÚ COMPLETO PARA SUPERADMIN
  const fullMenu = {
    admin: {
      title: "Administración",
      icon: Shield,
      color: "from-blue-500 to-blue-600",
      items: [
        { label: "Dashboard Admin", path: "/admin", icon: LayoutDashboard },
        { label: "Gestión de Usuarios", path: "/admin/users", icon: Users },
        { label: "Control MBAC", path: "/admin/mbac", icon: Lock },
        { label: "Roles y Permisos", path: "/admin/permisos", icon: Shield },
        { label: "Logs del Sistema", path: "/admin/logs", icon: Activity },
        { label: "Reportes", path: "/admin/reportes", icon: FileText },
        { label: "Configuración", path: "/admin/settings", icon: Settings },
      ],
    },
    medico: {
      title: "Panel Médico",
      icon: Stethoscope,
      color: "from-green-500 to-emerald-600",
      items: [
        { label: "Dashboard Médico", path: "/roles/medico/dashboard", icon: LayoutDashboard },
        { label: "Pacientes", path: "/roles/medico/pacientes", icon: Users },
        { label: "Citas Médicas", path: "/roles/medico/citas", icon: Calendar },
        { label: "Indicadores", path: "/roles/medico/indicadores", icon: BarChart3 },
      ],
    },
    coordinador: {
      title: "Panel Coordinador",
      icon: ClipboardList,
      color: "from-purple-500 to-purple-600",
      items: [
        { label: "Dashboard Coordinador", path: "/roles/coordinador/dashboard", icon: LayoutDashboard },
        { label: "Agenda", path: "/roles/coordinador/agenda", icon: Calendar },
      ],
    },
    externo: {
      title: "Personal Externo",
      icon: UserPlus,
      color: "from-amber-500 to-orange-600",
      items: [
        { label: "Dashboard Externo", path: "/roles/externo/dashboard", icon: LayoutDashboard },
        { label: "Reportes Externos", path: "/roles/externo/reportes", icon: FileText },
      ],
    },
    citas: {
      title: "Gestión de Citas",
      icon: Clock,
      color: "from-cyan-500 to-blue-600",
      items: [
        { label: "Dashboard de Citas", path: "/roles/citas/dashboard", icon: LayoutDashboard },
        { label: "Agenda Médica", path: "/roles/citas/agenda", icon: Calendar },
      ],
    },
    lineamientos: {
      title: "Lineamientos IPRESS",
      icon: Building2,
      color: "from-indigo-500 to-purple-600",
      items: [
        { label: "Dashboard Lineamientos", path: "/roles/lineamientos/dashboard", icon: LayoutDashboard },
        { label: "Registro", path: "/roles/lineamientos/registro", icon: FileCheck },
      ],
    },
  };

  // Si no es SUPERADMIN, mostrar solo menú básico
  const basicMenu = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Mi Perfil", path: "/user/profile", icon: Users },
  ];

  return (
    <aside
      className="w-72 min-h-screen flex flex-col justify-between
                 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white
                 border-r border-slate-800 shadow-2xl"
    >
      {/* 👤 Avatar del usuario */}
      <div className="px-6 pt-8 pb-6 border-b border-slate-700 flex flex-col items-center text-center flex-shrink-0">
        <div
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0A5BA9] to-[#3B82F6] text-white
                     flex items-center justify-center text-3xl font-bold shadow-lg mb-3"
        >
          {user?.username?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <h2 className="text-lg font-semibold truncate w-full">
          {user?.username || "Usuario"}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {isSuperAdmin ? "Superadministrador" : "Usuario"}
        </p>
        {isSuperAdmin && (
          <span className="mt-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
            ACCESO TOTAL
          </span>
        )}
        <div className="mt-4 w-full h-[1px] bg-slate-700/50 rounded-full" />
      </div>

      {/* 📋 Navegación con scroll */}
      <nav className="flex-1 overflow-y-auto p-5 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {isSuperAdmin ? (
          // MENÚ COMPLETO PARA SUPERADMIN
          <>
            {Object.entries(fullMenu).map(([key, section]) => {
              const SectionIcon = section.icon;
              const isOpen = openSections[key];
              
              // Verificar si algún hijo está activo (sin contar la sección padre)
              const hasActiveChild = section.items.some(item => location.pathname === item.path);

              return (
                <div key={key} className="space-y-1">
                  {/* Cabecera de sección - NUNCA se pinta de azul */}
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all
                      hover:bg-slate-800/70 text-slate-300"
                  >
                    <span className="flex items-center gap-3">
                      <SectionIcon className="w-5 h-5" />
                      <span className="font-semibold text-sm">{section.title}</span>
                    </span>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 transition-transform" />
                    )}
                  </button>

                  {/* Items de la sección */}
                  {isOpen && (
                    <div className="ml-3 pl-3 border-l-2 border-slate-700/50 space-y-1 mt-1">
                      {section.items.map((item, idx) => {
                        const ItemIcon = item.icon;
                        // Solo se pinta si la ruta es EXACTAMENTE igual
                        const isActive = location.pathname === item.path;

                        return (
                          <NavLink
                            key={idx}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              isActive
                                ? "bg-[#0A5BA9] text-white shadow-md"
                                : "hover:bg-slate-800/60 text-slate-300 hover:text-white"
                            }`}
                          >
                            <ItemIcon className="w-4 h-4" />
                            {item.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Estadísticas del sistema (decorativo) */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-2">
                <Database className="w-4 h-4" />
                <span>Estado del Sistema</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Módulos activos</span>
                  <span className="text-green-400 font-bold">6/6</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Sistema</span>
                  <span className="flex items-center gap-1 text-green-400 font-bold">
                    <TrendingUp className="w-3 h-3" />
                    100%
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          // MENÚ BÁSICO PARA USUARIOS NORMALES
          basicMenu.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0A5BA9] text-white shadow-md"
                    : "hover:bg-slate-800/70 text-slate-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })
        )}
      </nav>

      {/* 🚪 Cerrar sesión */}
      <div className="border-t border-slate-700 p-5 flex-shrink-0">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-slate-800/50
                     hover:bg-red-600/80 hover:text-white text-slate-300 font-medium
                     transition-all border border-slate-700 hover:border-red-500"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
