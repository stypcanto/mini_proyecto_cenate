// ========================================================================
// 🌐 COMPONENTE: Header.jsx
// Descripción: Barra superior institucional CENATE - EsSalud
// ========================================================================

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, FileText, LogOut, Menu, X, User, Bell } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const isActive = (path) => location.pathname === path;

  // 🚫 No mostrar Header en páginas públicas
  if (
    ["/", "/login", "/registro", "/forgot-password", "/solicitud-cuenta"].includes(
      location.pathname
    )
  ) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-[#0B2149] via-[#123C73] to-[#0B2149] shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Contenedor principal */}
        <div className="flex items-center justify-between h-16">
          {/* Logos institucionales */}
          <div className="flex items-center gap-4">
            <img
              src="/images/Logo ESSALUD Blanco.png"
              alt="EsSalud"
              className="h-10 object-contain drop-shadow-sm"
            />
            <div className="border-l border-white/30 h-8" />
            <img
              src="/images/Logo CENATE Blanco.png"
              alt="CENATE"
              className="h-10 object-contain drop-shadow-sm"
            />
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {[
              { to: "/pacientes", icon: Users, label: "Pacientes" },
              { to: "/transferencia-examenes", icon: FileText, label: "Exámenes" },
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                  isActive(to)
                    ? "bg-white text-[#0B2149] shadow-lg"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Usuario y acciones */}
          <div className="hidden md:flex items-center space-x-3">
            {/* 🔔 Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-all"
                aria-label="Ver notificaciones"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-[#123C73] px-4 py-3">
                    <h3 className="text-white font-bold text-sm">Notificaciones</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">
                        Sistema actualizado
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Nuevas funcionalidades disponibles.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 👤 Usuario */}
            {user && (
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[#123C73]" />
                </div>
                <div className="hidden lg:block leading-tight">
                  <p className="text-white text-sm font-bold">{user.nombre}</p>
                  <p className="text-blue-200 text-xs uppercase">
                    {user.rol || "Usuario"}
                  </p>
                </div>
              </div>
            )}

            {/* 🚪 Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 shadow-md"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Salir</span>
            </button>
          </div>

          {/* 📱 Botón menú móvil */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú Mobile */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fadeIn">
            {[
              { to: "/pacientes", icon: Users, label: "Pacientes" },
              { to: "/transferencia-examenes", icon: FileText, label: "Exámenes" },
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(to)
                    ? "bg-white text-[#123C73]"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{label}</span>
              </Link>
            ))}

            {user && (
              <div className="px-4 py-3 bg-white/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#123C73]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{user.nombre}</p>
                    <p className="text-blue-200 text-xs uppercase">
                      {user.rol || "Usuario"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-all font-semibold shadow"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;