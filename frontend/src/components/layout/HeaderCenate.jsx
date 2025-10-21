import React, { useEffect, useState } from "react";
import { Sun, Moon, Bell, UserCircle2, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Encabezado superior institucional CENATE.
 * Contiene el modo oscuro/claro, notificaciones y perfil de usuario.
 */
export default function HeaderCenate() {
  const { user, logout } = useAuth();
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
    logout();
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
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/20"
          title={darkMode ? "Modo Claro" : "Modo Oscuro"}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notificaciones */}
        <button className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/20">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Perfil de usuario */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm text-white font-bold leading-tight drop-shadow-sm">
              {user?.nombreCompleto || user?.username || "Usuario"}
            </span>
            <span className="text-xs text-gray-300 font-medium">{user?.roles?.[0] || "Rol"}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <UserCircle2 className="w-6 h-6 text-white" />
          </div>
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
