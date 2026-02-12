// ========================================================================
// 💠 HeaderCenate.jsx – Encabezado institucional CENATE 2025
// ------------------------------------------------------------------------
// • Diseño profesional con gradiente azul institucional
// • Iconos animados y accesibilidad optimizada
// • Seguro ante contextos nulos (user/logout)
// • Incluye modo oscuro, notificaciones y perfil
// ========================================================================

import React, { useEffect, useState } from "react";
import { Sun, Moon, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificacionesPanel from "../NotificacionesPanel";
import UserMenu from "./UserMenu";
import apiClient from '../../lib/apiClient';

export default function HeaderCenate() {
  const { user, logout } = useAuth() || {}; // 🛡 Evita error si el contexto no existe
  const navigate = useNavigate();

  // 🌗 Estado inicial del modo oscuro (persistente)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // 🔔 Estado de notificaciones
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const [cantidadNotificaciones, setCantidadNotificaciones] = useState(0);

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

  // 🔔 Cargar notificaciones si es ADMIN o SUPERADMIN
  useEffect(() => {
    const esAdmin = user?.roles?.some(
      (rol) => rol === "ADMIN" || rol === "SUPERADMIN"
    );

    if (esAdmin) {
      cargarCantidadNotificaciones();
      // Polling cada 5 minutos para actualizar notificaciones
      const interval = setInterval(cargarCantidadNotificaciones, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const cargarCantidadNotificaciones = async () => {
    try {
      const count = await apiClient.get('/notificaciones/count', true);
      setCantidadNotificaciones(count || 0);
    } catch (error) {
      console.error('❌ Error al cargar notificaciones:', error);
      setCantidadNotificaciones(0);
    }
  };

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const handleNotificacionClick = () => {
    setShowNotificaciones(!showNotificaciones);
  };

  return (
    <>
    <header
      className="w-full h-24 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-30
                 bg-gradient-to-r from-[#0a5ba9] via-[#0d4e90] to-[#073b6c]
                 dark:from-slate-900 dark:to-slate-800
                 shadow-lg backdrop-blur-md border-b border-white/10 transition-all duration-300"
    >
      {/* Espacio vacío (se puede usar para futuro contenido) */}
      <div className="flex-1"></div>

      {/* 🔔 Controles de usuario */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Notificaciones */}
        <button
          onClick={handleNotificacionClick}
          aria-label="Notificaciones"
          className="relative p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
        >
          <Bell className="w-6 h-6" />
          {cantidadNotificaciones > 0 && (
            <>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cantidadNotificaciones > 9 ? '9+' : cantidadNotificaciones}
              </span>
            </>
          )}
        </button>

        {/* Menú de usuario (avatar + dropdown) */}
        <UserMenu />
      </div>

    </header>

    {/* Panel de Notificaciones - FUERA del header para z-index correcto */}
    {showNotificaciones && (
      <div className="fixed z-50 top-16 right-6">
        <NotificacionesPanel
          isOpen={showNotificaciones}
          onClose={() => setShowNotificaciones(false)}
        />
      </div>
    )}
    </>
  );
}
