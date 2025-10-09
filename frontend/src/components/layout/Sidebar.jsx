// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Users, FileText, Grid, Shield, LogOut, Home } from "lucide-react";

/**
 * Sidebar dinámico por roles.
 * Se basa en localStorage.roles (array de strings).
 */
export default function Sidebar() {
    const navigate = useNavigate();
    const rawRoles = JSON.parse(localStorage.getItem("roles") || "[]");
    const roles = rawRoles.map((r) => String(r).toUpperCase());

    // Menú con control de visibilidad por rol.
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
    ];

    const canShow = (itemRoles) =>
        itemRoles.includes("*") || roles.some((r) => itemRoles.map((x) => x.toUpperCase()).includes(r));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("roles");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
        navigate("/login");
        // recargar para asegurarse
        window.location.reload();
    };

    return (
        <aside className="w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white flex flex-col">
            <div className="px-6 py-5 flex items-center gap-3 border-b border-blue-700">
                <div className="text-lg font-bold">CENATE</div>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1 overflow-auto">
                {menuItems
                    .filter((m) => canShow(m.roles))
                    .map((m) => (
                        <NavLink
                            key={m.key}
                            to={m.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition ${
                                    isActive ? "bg-blue-700" : "text-white/95"
                                }`
                            }
                        >
                            <m.icon className="w-5 h-5" />
                            <span>{m.label}</span>
                        </NavLink>
                    ))}
            </nav>

            <div className="px-4 py-3 border-t border-blue-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-blue-600 hover:bg-blue-500 transition"
                >
                    <LogOut className="w-4 h-4" />
                    Salir
                </button>
            </div>
        </aside>
    );
}
