// src/components/layout/AdminSidebar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ServerCog,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Bell,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const { user, logout, hasRole } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Función temporal para verificar permisos (mientras implementas el sistema completo)
  const hasPermission = (permission) => {
    // Por ahora, devuelve true para SUPERADMIN
    return user?.roles?.includes('SUPERADMIN') || false;
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/admin",
      visible: hasPermission("VER_DASHBOARD") || hasRole(["SUPERADMIN"]),
    },
    {
      title: "Usuarios",
      icon: <Users className="w-5 h-5" />,
      path: "/admin/users",
      submenu: [
        { title: "Lista de Usuarios", path: "/admin/users" },
        { title: "Crear Usuario", path: "/admin/users/create" },
      ],
      visible:
        hasPermission("GESTIONAR_USUARIOS") ||
        hasPermission("CREAR_USUARIO") ||
        hasRole(["SUPERADMIN"]),
    },
    {
      title: "Roles y Permisos",
      icon: <ShieldCheck className="w-5 h-5" />,
      path: "/admin/roles",
      submenu: [
        { title: "Gestionar Roles", path: "/admin/roles" },
        { title: "Permisos MBAC", path: "/admin/permisos" },
      ],
      visible:
        hasPermission("GESTIONAR_PERMISOS") ||
        hasPermission("GESTIONAR_ROLES") ||
        hasRole(["SUPERADMIN"]),
    },
    {
      title: "Solicitudes del Sistema",
      icon: <ClipboardList className="w-5 h-5" />,
      path: "/admin/solicitudes",
      submenu: [
        { title: "Acceso al Sistema", path: "/admin/account-requests" },
        { title: "Recuperación de Contraseña", path: "/admin/password-recovery" },
      ],
      visible: hasPermission("GESTIONAR_SOLICITUDES") || hasRole(["SUPERADMIN"]),
    },
    {
      title: "Logs del Sistema",
      icon: <ServerCog className="w-5 h-5" />,
      path: "/admin/logs",
      visible: hasPermission("VER_AUDITORIA") || hasRole(["SUPERADMIN"]),
    },
    {
      title: "Reportes",
      icon: <BarChart3 className="w-5 h-5" />,
      path: "/admin/reportes",
      visible: hasPermission("VER_REPORTES") || hasRole(["SUPERADMIN"]),
    },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  const toggleSubmenu = (title) => {
    setExpandedMenu(expandedMenu === title ? null : title);
  };

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-800 to-slate-900
        dark:from-gray-900 dark:to-black
        text-white z-50 transition-all duration-300 ease-in-out shadow-2xl
        ${isOpen ? "w-64" : "w-0 lg:w-20"} overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header con perfil */}
          <div className="p-6 border-b border-gray-700 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {user?.nombreCompleto?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate">
                    {user?.nombreCompleto || user?.username || "Usuario"}
                  </p>
                  <p className="text-xs text-cenate-light/80 font-medium">{user?.roles?.[0] || "Rol"}</p>
                </div>
              )}

              {isOpen && (
                <div className="relative cursor-pointer hover:scale-110 transition-transform flex-shrink-0">
                  <Bell className="w-5 h-5 text-cenate-light hover:text-white" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cenate-danger rounded-full"></span>
                </div>
              )}
            </div>
          </div>

          {/* Menú */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {menuItems
              .filter((item) => item.visible)
              .map((item, index) => (
                <div key={index} className="mb-1">
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.title)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive(item.path)
                            ? "bg-blue-500 text-white shadow-lg"
                            : "text-gray-300 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {item.icon}
                          {isOpen && (
                            <span className="font-medium text-sm">
                              {item.title}
                            </span>
                          )}
                        </div>
                        {isOpen && (
                          <span>
                            {expandedMenu === item.title ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </button>

                      {isOpen && expandedMenu === item.title && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.submenu.map((subitem, subindex) => (
                            <Link
                              key={subindex}
                              to={subitem.path}
                              className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                                location.pathname === subitem.path
                                  ? "bg-blue-500/70 text-white"
                                  : "text-gray-400 hover:bg-slate-700 hover:text-white"
                              }`}
                            >
                              {subitem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? "bg-blue-500 text-white shadow-lg"
                          : "text-gray-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      {item.icon}
                      {isOpen && (
                        <span className="font-medium text-sm">{item.title}</span>
                      )}
                    </Link>
                  )}
                </div>
              ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-700 dark:border-gray-800">
            <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
            text-gray-300 hover:bg-red-500 hover:text-white transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              {isOpen && <span className="font-medium text-sm">Cerrar Sesión</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Toggle móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] p-2 rounded-lg bg-cenate-blue text-white shadow-lg
          hover:bg-cenate-teal transition-colors duration-200 lg:hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </>
  );
};

export default AdminSidebar;