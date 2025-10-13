import React from "react";
import { LogOut, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function RoleLayout({ title, modules, children }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="hover:text-blue-200 flex items-center gap-1">
                            <Home className="w-4 h-4" /> Inicio
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = "/login";
                            }}
                            className="hover:text-blue-200 flex items-center gap-1"
                        >
                            <LogOut className="w-4 h-4" /> Salir
                        </button>
                    </div>
                </div>
            </header>

            {/* Módulos disponibles */}
            <nav className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap gap-4">
                    {modules.map((mod) => (
                        <Link
                            key={mod.label}
                            to={mod.path}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                            {mod.icon}
                            <span className="font-medium text-sm">{mod.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Contenido dinámico */}
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
        </div>
    );
}