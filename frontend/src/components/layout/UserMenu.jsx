// ========================================================================
// 👤 UserMenu.jsx – Menú desplegable de usuario (avatar + información)
// ========================================================================

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronUp, ChevronDown } from "lucide-react";

export default function UserMenu() {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // 🐛 DEBUG: Verificar si user.foto llega al componente
  console.log("🖼️ [UserMenu] user.foto:", user?.foto);
  console.log("👤 [UserMenu] user completo:", user);

  if (!user) return null;

  const handleLogout = () => {
    if (logout) logout();
    navigate("/");
  };

  const handleMyAccount = () => {
    navigate("/user/profile");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Avatar clickeable en el header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all border border-white/20"
        title="Menú de usuario"
      >
        {/* Avatar circular con foto */}
        <div className="w-14 h-14 rounded-full bg-white/20 overflow-hidden flex items-center justify-center border border-white/30">
          {user?.foto ? (
            <img
              src={user.foto}
              alt={user.nombreCompleto}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("❌ [UserMenu] Error cargando foto:", user.foto);
                console.error("❌ [UserMenu] Error event:", e);
              }}
              onLoad={() => console.log("✅ [UserMenu] Foto cargada exitosamente:", user.foto)}
            />
          ) : (
            <span className="text-white font-bold text-base">
              {user?.nombreCompleto?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Nombre y rol (visible en pantallas grandes) */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm text-white font-semibold leading-tight">
            {user?.nombreCompleto || user?.username}
          </span>
          <span className="text-xs text-white/70">
            {user?.roles?.[0]?.toUpperCase() || "Usuario"}
          </span>
        </div>

        {/* Icono de collapse/expand */}
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-white" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white" />
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-2xl p-6 border border-gray-100 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Información del usuario */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
            {/* Avatar grande */}
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
              {user?.foto ? (
                <img
                  src={user.foto}
                  alt={user.nombreCompleto}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-bold text-2xl">
                  {user?.nombreCompleto?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>

            {/* Datos del usuario */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                {user?.nombreCompleto || user?.username}
              </h3>
              <p className="text-sm text-gray-600">
                {user?.roles?.[0]?.toUpperCase() || "Usuario"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {user?.nombreIpress || user?.institucion || "CENTRO NACIONAL DE TELEMEDICINA"}
              </p>
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="space-y-2">
            {/* Mi Cuenta */}
            <button
              onClick={handleMyAccount}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
            >
              Mi Cuenta
            </button>

            {/* Separador */}
            <hr className="border-gray-200" />

            {/* Cerrar Sesión */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-medium"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
