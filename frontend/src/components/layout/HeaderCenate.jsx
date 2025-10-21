import React, { useEffect, useState } from "react";
import { Sun, Moon, Bell, UserCircle2, LogOut } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

/**
 * Encabezado superior institucional CENATE.
 * Contiene el modo oscuro/claro, notificaciones y perfil de usuario.
 */
export default function HeaderCenate() {
  const { nombreCompleto, rol } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Aplica el modo visual al body
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header
      className="w-full h-16 bg-gradient-to-r from-cenate-blue to-cenate-dark
      dark:from-slate-900 dark:to-slate-800 flex items-center justify-between px-6
      shadow-md fixed top-0 left-0 right-0 z-40 transition-all duration-300"
    >
      {/* 🏥 Logo e identidad */}
      <div className="flex items-center gap-3">
        <img
          src="/logo.svg"
          alt="Logo CENATE"
          className="w-8 h-8 rounded-full bg-white/10 p-1"
        />
        <h1 className="text-lg font-bold text-white tracking-wide">
          Plataforma CENATE
        </h1>
      </div>

      {/* 🔔 Acciones de usuario */}
      <div className="flex items-center gap-5">
        {/* Modo oscuro / claro */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          title={darkMode ? "Modo Claro" : "Modo Oscuro"}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notificaciones */}
        <div className="relative cursor-pointer hover:scale-110 transition-transform">
          <Bell className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cenate-danger rounded-full"></span>
        </div>

        {/* Perfil de usuario */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm text-white font-medium leading-tight">
              {nombreCompleto || "Usuario"}
            </span>
            <span className="text-xs text-cenate-light/80">{rol || "Rol"}</span>
          </div>
          <UserCircle2 className="w-8 h-8 text-white/90" />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-white bg-cenate-danger/80
            hover:bg-cenate-danger px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Salir</span>
        </button>
      </div>
    </header>
  );
}