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
import useAuth from "../../hooks/useAuth";

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const [expandedMenu, setExpandedMenu] = useState(null);

    const { nombreCompleto, rol, hasPermission, hasRole } = useAuth();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // ======================================================
    // 📋 Menú lateral con permisos dinámicos
    // ======================================================
    const menuItems = [
        {
            title: "Dashboard",
            icon: <LayoutDashboard className="w-5 h-5" />,
            path: "/admin",
            exact: true,
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

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const toggleSubmenu = (title) => {
        setExpandedMenu(expandedMenu === title ? null : title);
    };

    // ======================================================
    // 🧭 Render del Sidebar
    // ======================================================
    return (
        <>
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-800 to-slate-900 
          text-white z-50 transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-0 lg:w-20"}
          overflow-hidden shadow-2xl
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Header con perfil */}
                    <div className="p-6 border-b border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {nombreCompleto?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                                </div>
                                {isOpen && (
                                    <div>
                                        <p className="font-semibold text-sm text-white truncate w-36">
                                            {nombreCompleto || "Usuario"}
                                        </p>
                                        <p className="text-xs text-slate-400">{rol || "Rol"}</p>
                                    </div>
                                )}
                            </div>

                            {/* 🔔 Notificación */}
                            {isOpen && (
                                <div className="relative cursor-pointer hover:scale-110 transition-transform">
                                    <Bell className="w-5 h-5 text-slate-300 hover:text-white" />
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Menú principal */}
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
                                                        ? "bg-teal-600 text-white shadow-lg"
                                                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {item.icon}
                                                    {isOpen && (
                                                        <span className="font-medium text-sm">{item.title}</span>
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
                                                                    ? "bg-teal-600/50 text-white"
                                                                    : "text-slate-400 hover:bg-slate-700 hover:text-white"
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
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                                isActive(item.path, item.exact)
                                                    ? "bg-teal-600 text-white shadow-lg"
                                                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
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
                    <div className="p-4 border-t border-slate-700">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            {isOpen && <span className="font-medium text-sm">Cerrar Sesión</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Botón toggle móvil */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-[60] p-2 rounded-lg bg-slate-800 text-white shadow-lg hover:bg-slate-700 transition-colors duration-200 lg:hidden"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </>
    );
};

export default AdminSidebar;