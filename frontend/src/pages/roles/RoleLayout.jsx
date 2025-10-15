import React from "react";
import { Outlet, Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RoleLayout() {
    const nombre = localStorage.getItem("nombreCompleto") || "Usuario";
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-blue-900 text-white py-3 px-6 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Sistema CENATE</span>
                    <span className="text-sm text-blue-200">— Panel de Rol</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm">{nombre}</span>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <LogOut className="w-4 h-4 mr-1" /> Salir
                    </Button>
                </div>
            </header>

            {/* Navigation for role pages */}
            <nav className="bg-white border-b p-3 flex gap-3 justify-center shadow-sm">
                {roles.includes("MEDICO") && (
                    <Link to="/medico" className="text-blue-700 font-medium hover:underline">
                        Médico
                    </Link>
                )}
                {roles.includes("COORDINADOR_MEDICO") && (
                    <Link to="/coordinador" className="text-blue-700 font-medium hover:underline">
                        Coordinador Médico
                    </Link>
                )}
                {roles.includes("COORD_LINEAMIENTOS_IPRESS") && (
                    <Link to="/lineamientos" className="text-blue-700 font-medium hover:underline">
                        Lineamientos IPRESS
                    </Link>
                )}
                {roles.includes("EXTERNO") && (
                    <Link to="/externo" className="text-blue-700 font-medium hover:underline">
                        Externo
                    </Link>
                )}
                {roles.includes("CITAS") && (
                    <Link to="/citas" className="text-blue-700 font-medium hover:underline">
                        Citas
                    </Link>
                )}
            </nav>

            {/* Main content */}
            <main className="flex-1 p-6">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 text-center text-sm text-gray-600 py-3 border-t">
                © 2025 CENATE — Todos los derechos reservados
            </footer>
        </div>
    );
}
