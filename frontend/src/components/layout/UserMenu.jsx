// ========================================================================
// 👤 UserMenu.jsx – Menú desplegable de usuario (avatar + información)
// ========================================================================

import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronUp, ChevronDown, User } from "lucide-react";

const AvatarMujer = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="14" r="7" fill="currentColor" opacity="0.9"/>
    {/* Cabello femenino */}
    <path d="M13 12 Q13 6 20 6 Q27 6 27 12 Q25 8 20 8 Q15 8 13 12Z" fill="currentColor"/>
    <path d="M12 14 Q11 18 13 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M28 14 Q29 18 27 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Cuerpo */}
    <path d="M8 38 Q8 28 20 28 Q32 28 32 38" fill="currentColor" opacity="0.85"/>
  </svg>
);

const AvatarVaron = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="14" r="7" fill="currentColor" opacity="0.9"/>
    {/* Cuerpo más ancho para varón */}
    <path d="M6 38 Q6 27 20 27 Q34 27 34 38" fill="currentColor" opacity="0.85"/>
  </svg>
);

export default function UserMenu() {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [fotoError, setFotoError] = useState(false);

  if (!user) return null;

  const isIpress = user?.roles?.[0] === "INSTITUCION_EX";

  // Solo primer nombre y primer apellido paterno: "Maria Quispe Evangelista..." → "Maria Quispe"
  const nombreCorto = (nombre) => {
    if (!nombre) return "";
    const partes = nombre.trim().split(/\s+/);
    return partes.slice(0, 2).join(" ");
  };

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
      {/* ── Botón del header ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all border border-white/20"
        title="Menú de usuario"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-white/20 overflow-hidden flex items-center justify-center border border-white/30 flex-shrink-0">
          {user?.foto && !fotoError ? (
            <img
              src={user.foto}
              alt={user.nombreCompleto}
              className="w-full h-full object-cover"
              onError={() => setFotoError(true)}
            />
          ) : user?.sexo === 'F'
            ? <AvatarMujer className="w-6 h-6 text-pink-300" />
            : <AvatarVaron className="w-6 h-6 text-blue-300" />
          }
        </div>

        {/* Nombre y subtítulo */}
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm text-white font-semibold leading-tight">
            {nombreCorto(user?.nombreCompleto) || user?.username}
          </span>
          <span className="text-[11px] text-white/65 leading-tight">
            {isIpress
              ? (user?.nombreIpress || "INSTITUCIÓN EXTERNA")
              : (user?.roles?.[0]?.toUpperCase() || "Usuario")}
          </span>
        </div>

        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-white/70 ml-0.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white/70 ml-0.5" />
        )}
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-68 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          style={{ width: "17rem" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabecera */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-gray-100">
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
              {user?.foto && !fotoError ? (
                <img
                  src={user.foto}
                  alt={user.nombreCompleto}
                  className="w-full h-full object-cover"
                  onError={() => setFotoError(true)}
                />
              ) : user?.sexo === 'F'
                ? <AvatarMujer className="w-7 h-7 text-pink-400" />
                : <AvatarVaron className="w-7 h-7 text-blue-500" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug">
                {user?.nombreCompleto || user?.username}
              </p>
              {isIpress ? (
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
                    IPRESS
                  </span>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    {user?.nombreIpress || "INSTITUCIÓN EXTERNA"}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    {user?.roles?.[0]?.toUpperCase() || "Usuario"}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-snug truncate">
                    {user?.institucion || "CENTRO NACIONAL DE TELEMEDICINA"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Opciones */}
          <div className="py-1">
            <button
              onClick={handleMyAccount}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              <User className="w-4 h-4 text-gray-400" />
              Mi Cuenta
            </button>

            <hr className="border-gray-100 mx-3" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
