// ========================================================================
// 💠 HeaderCenate.jsx – Encabezado institucional CENATE 2025
// ------------------------------------------------------------------------
// • Diseño profesional con gradiente azul institucional
// • Iconos animados y accesibilidad optimizada
// • Seguro ante contextos nulos (user/logout)
// • Incluye modo oscuro, notificaciones y perfil
// ========================================================================

import React, { useEffect, useState } from "react";
import { Sun, Moon, Bell, UserCircle2, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function HeaderCenate() {
  const { user, logout } = useAuth() || {}; // 🛡 Evita error si el contexto no existe
  const navigate = useNavigate();

  // 🌗 Estado inicial del modo oscuro (persistente)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // 🔁 Sincroniza el modo con el documento
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const handleLogout = () => {
    if (logout) logout();
    navigate("/"); // 🚪 Regresa al inicio público
  };

  return (
    <header
      className="w-full h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50
                 bg-gradient-to-r from-[#0a5ba9] via-[#0d4e90] to-[#073b6c]
                 dark:from-slate-900 dark:to-slate-800
                 shadow-lg backdrop-blur-md border-b border-white/10 transition-all duration-300"
    >
      {/* 🏥 Logo e identidad */}
      <div
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={() => navigate("/dashboard")}
      >
        <img
          src="/images/Logo CENATE Blanco.png"
          alt="Logo CENATE"
          className="w-10 h-10 object-contain drop-shadow-md"
        />
        <div className="flex flex-col">
          <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
            Plataforma CENATE
          </h1>
          <span className="text-xs text-white/80 font-medium tracking-wide">
            Centro Nacional de Telemedicina
          </span>
        </div>
      </div>

      {/* 🔔 Controles de usuario */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Modo oscuro / claro */}
        <button
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 shadow-inner"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 animate-pulse" />
          ) : (
            <Moon className="w-5 h-5 animate-pulse" />
          )}
        </button>

        {/* Notificaciones */}
        <button
          aria-label="Notificaciones"
          className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Perfil de usuario */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm text-white font-semibold leading-tight drop-shadow-sm">
            {user?.nombreCompleto || user?.username || "Invitado"}
          </span>
          <span className="text-xs text-white/70 font-medium">
            {user?.roles?.[0]?.toUpperCase() || "Usuario"}
          </span>
        </div>

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 hover:scale-105 transition-transform"
          title="Perfil"
        >
          <UserCircle2 className="w-6 h-6 text-white" />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 bg-white/15 hover:bg-red-500/80 text-white font-medium px-3 py-1.5 rounded-lg text-sm transition-all shadow-sm"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Salir</span>
        </button>
      </div>
    </header>
  );
}