// ========================================================================
// 🔐 MBACSidebar – Sidebar Oscuro Azul (CENATE)
// ------------------------------------------------------------------------
// • Tema profesional en negro-azulado (#0A5BA9)
// • Compatible con Create React App
// • Diseño limpio, responsivo y coherente con branding institucional
// ========================================================================

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiSettings,
  FiShield,
  FiActivity,
  FiMessageSquare,
  FiBarChart2,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
  FiUser,
  FiUserCheck,
  FiLock,
  FiClipboard,
} from "react-icons/fi";

// ========================================================================
// 🎯 Configuración del Menú MBAC
// ========================================================================
const menuConfig = [
  { id: "dashboard", label: "Dashboard", icon: FiHome, path: "/dashboard" },
  {
    id: "patients",
    label: "Pacientes",
    icon: FiUsers,
    path: "/pacientes",
    submenu: [
      { id: "patient-list", label: "Lista de Pacientes", path: "/pacientes/lista" },
      { id: "patient-register", label: "Registrar Paciente", path: "/pacientes/registro" },
      { id: "patient-search", label: "Buscar Paciente", path: "/pacientes/buscar" },
    ],
  },
  {
    id: "appointments",
    label: "Citas",
    icon: FiCalendar,
    path: "/citas",
    submenu: [
      { id: "appointment-list", label: "Ver Citas", path: "/citas/lista" },
      { id: "appointment-create", label: "Agendar Cita", path: "/citas/nueva" },
      { id: "appointment-calendar", label: "Calendario", path: "/citas/calendario" },
    ],
  },
  { id: "medical-records", label: "Expedientes", icon: FiFileText, path: "/expedientes" },
  { id: "telemedicine", label: "Telemedicina", icon: FiActivity, path: "/telemedicina" },
  { id: "messages", label: "Mensajes", icon: FiMessageSquare, path: "/mensajes" },
  {
    id: "reports",
    label: "Reportes",
    icon: FiBarChart2,
    path: "/reportes",
    submenu: [
      { id: "reports-patients", label: "Pacientes", path: "/reportes/pacientes" },
      { id: "reports-appointments", label: "Citas", path: "/reportes/citas" },
      { id: "reports-financial", label: "Financiero", path: "/reportes/financiero" },
    ],
  },
  {
    id: "admin",
    label: "Administración",
    icon: FiShield,
    path: "/admin",
    submenu: [
      { id: "users", label: "Usuarios", icon: FiUser, path: "/admin/usuarios" },
      { id: "roles", label: "Roles y Permisos", icon: FiUserCheck, path: "/admin/roles" },
      { id: "permissions", label: "Control MBAC", icon: FiLock, path: "/admin/permisos" },
      { id: "audit", label: "Auditoría", icon: FiClipboard, path: "/admin/auditoria" },
      { id: "settings", label: "Configuración", icon: FiSettings, path: "/admin/configuracion" },
    ],
  },
];

// ========================================================================
// 🔐 Hook para obtener permisos del usuario
// ========================================================================
const useUserPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "Administrador",
    role: "Admin",
    email: "admin@cenate.com",
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setPermissions(["ALL_PERMISSIONS"]);
          return;
        }

        const response = await fetch("http://localhost:8080/api/auth/me", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo({
            name: data.name || data.username || "Usuario",
            role: data.role || "Usuario",
            email: data.email || "",
          });
          setPermissions(data.permissions || ["ALL_PERMISSIONS"]);
        } else {
          setPermissions(["ALL_PERMISSIONS"]);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setPermissions(["ALL_PERMISSIONS"]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  return { permissions, loading, userInfo };
};

// ========================================================================
// 🎨 Componente Principal – Sidebar Oscuro
// ========================================================================
export default function MBACSidebar({ className = "" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions, loading, userInfo } = useUserPermissions();
  const [openMenus, setOpenMenus] = useState({ admin: true });

  const hasPermission = (req) =>
    !req || req.length === 0 || permissions.includes("ALL_PERMISSIONS") || req.some((p) => permissions.includes(p));

  const filteredMenu = menuConfig.filter((i) => hasPermission(i.permissions));
  const toggleSubmenu = (menuId) => setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading)
    return (
      <aside className={`bg-gradient-to-b from-[#0B0C10] to-[#142F4A] text-white flex flex-col ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
        </div>
      </aside>
    );

  return (
    <aside
      className={`bg-gradient-to-b from-[#0B0C10] via-[#0E1A2B] to-[#142F4A]
                  text-gray-100 flex flex-col shadow-2xl ${className}`}
      style={{ minWidth: "280px", maxWidth: "280px" }}
    >
      {/* Header */}
      <div className="p-5 border-b border-blue-900/40 bg-[#0E1A2B]/70">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#0A5BA9] rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">CENATE</h1>
            <p className="text-xs text-blue-300 font-medium">Sistema MBAC</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-blue-900/30 bg-[#0E1A2B]/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">
              {userInfo.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">{userInfo.name || "Usuario"}</p>
            <p className="text-xs text-blue-300 truncate">{userInfo.role || "Sin rol"}</p>
          </div>
        </div>
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isOpen = openMenus[item.id];
          const filteredSubmenu = hasSubmenu ? item.submenu.filter((s) => hasPermission(s.permissions)) : [];

          return (
            <div key={item.id} className="mb-1">
              {hasSubmenu ? (
                <button
                  onClick={() => toggleSubmenu(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-[#0A5BA9]/90 text-white shadow-md font-semibold"
                      : "hover:bg-[#0A5BA9]/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-blue-300"}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {isOpen ? (
                    <FiChevronDown className={`w-4 h-4 ${isActive ? "text-white" : "text-blue-200"}`} />
                  ) : (
                    <FiChevronRight className={`w-4 h-4 ${isActive ? "text-white" : "text-blue-200"}`} />
                  )}
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-[#0A5BA9]/90 text-white shadow-md font-semibold"
                      : "hover:bg-[#0A5BA9]/40 hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-blue-300"}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )}

              {hasSubmenu && isOpen && filteredSubmenu.length > 0 && (
                <div className="ml-3 mt-1 space-y-1 border-l-2 border-blue-400/30 pl-3 py-1">
                  {filteredSubmenu.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = location.pathname === sub.path;
                    return (
                      <Link
                        key={sub.id}
                        to={sub.path}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                          isSubActive
                            ? "bg-[#0A5BA9]/80 text-white font-semibold shadow-md"
                            : "hover:bg-[#0A5BA9]/25 text-blue-100"
                        }`}
                      >
                        {SubIcon && <SubIcon className="w-4 h-4" />}
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-blue-900/20 bg-[#0E1A2B]/50 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1B2B44] transition-all duration-200 text-gray-300 hover:text-white hover:shadow-md group"
        >
          <FiLogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>

      {/* Scrollbar personalizado */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.35);
        }
      `}</style>
    </aside>
  );
}