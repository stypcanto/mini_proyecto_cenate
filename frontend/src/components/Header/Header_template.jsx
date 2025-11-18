// ========================================================================
// 🔷 HeaderTemplate.jsx – Header institucional EsSalud / CENATE 2025
// ------------------------------------------------------------------------
// • Degradado vertical Apple-like (#0A5BA9 → #094580)
// • Búsqueda translúcida con sombra institucional
// • Integración con ThemeToggle y diseño responsive optimizado
// • ✅ NUEVO: Perfil de usuario en la parte superior derecha (diseño profesional)
// ========================================================================

import React, { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import api from "../../services/apiClient";
import { getFotoUrl } from "../../utils/apiUrlHelper";

export default function HeaderTemplate({ title = "CENATE" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [fotoError, setFotoError] = useState(false);

  // Obtener foto del usuario
  useEffect(() => {
    const cargarFotoUsuario = async () => {
      if (!user?.id) return;
      
      try {
        // Intentar obtener los datos completos del usuario desde all-personal
        const response = await api.get(`/usuarios/all-personal`);
        const usuarios = Array.isArray(response) ? response : (response?.content || []);
        const usuarioCompleto = usuarios.find(u => {
          const idUsuario = u.id_user || u.idUsuario || u.id;
          return idUsuario === user.id;
        });
        
        if (usuarioCompleto?.foto_url || usuarioCompleto?.foto_pers) {
          const fotoUrlValue = usuarioCompleto.foto_url || usuarioCompleto.foto_pers;
          
          // Usar helper centralizado para construir URL
          const fotoUrlFinal = getFotoUrl(fotoUrlValue);
          if (fotoUrlFinal) {
            setFotoUrl(fotoUrlFinal);
          }
        }
      } catch (error) {
        console.error('⚠️ Error al cargar foto del usuario:', error);
        setFotoError(true);
      }
    };

    cargarFotoUsuario();
    
    // Recargar foto cuando el usuario cambia o cada 30 segundos (para actualizar después de subir foto)
    const interval = setInterval(() => {
      if (user?.id) {
        cargarFotoUsuario();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [user?.id]);

  // Función para obtener iniciales
  const getInitials = (nombre) => {
    if (!nombre) return 'U';
    const names = nombre.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const nombreMostrar = user?.nombreCompleto
    ? user.nombreCompleto.split(" ").slice(0, 2).join(" ")
    : user?.username || "Usuario";

  const roles = (user?.roles || []).map((r) =>
    typeof r === "string"
      ? r.toUpperCase()
      : r?.authority
      ? r.authority.replace("ROLE_", "").toUpperCase()
      : String(r).toUpperCase()
  );

  const isSuperAdmin = roles.includes("SUPERADMIN") || roles.includes("ADMIN");
  const rolMostrar = isSuperAdmin ? "Superadministrador" : roles.join(", ") || "Usuario";

  return (
    <header
      className="sticky top-0 z-40 w-full shadow-md backdrop-blur-xl border-b border-[#0a5ba9]/30 transition-colors duration-300"
      style={{
        background: "linear-gradient(to bottom, #0A5BA9 0%, #094580 100%)",
        color: "#FFFFFF",
      }}
    >
      <div className="flex items-center justify-between px-6 md:px-8 py-3 gap-4">
        {/* 🏷️ Título institucional */}
        <h1
          className="text-lg sm:text-2xl font-semibold tracking-wide truncate select-none"
          style={{
            fontFamily: "Inter, -apple-system, 'Segoe UI', sans-serif",
            textShadow: "0 1px 3px rgba(0,0,0,0.25)",
            letterSpacing: "0.3px",
          }}
        >
          {title}
        </h1>

        {/* 🔍 Buscador institucional - Diseño profesional tipo LinkedIn */}
        <div className="flex-1 max-w-lg mx-4 relative hidden lg:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5 transition-all duration-200 group-hover:text-white/80 group-focus-within:text-white z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar en CENATE..."
              className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-white/15 text-white text-sm font-medium
                         placeholder-white/60 outline-none 
                         border border-white/20 shadow-sm
                         hover:bg-white/20 hover:border-white/30
                         focus:bg-white/25 focus:border-white/40 focus:shadow-md
                         focus:ring-2 focus:ring-white/30 focus:ring-offset-0
                         transition-all duration-200 backdrop-blur-md
                         placeholder:font-normal"
            />
            {/* Indicador de búsqueda activa */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="text-xs text-white/50 font-medium">Ctrl+K</div>
            </div>
          </div>
        </div>

        {/* 👤 Sección derecha: Tema + Usuario */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* 🌗 Alternar tema - Estilo mejorado para header azul */}
          <div className="hidden sm:block">
            <ThemeToggle variant="header" />
          </div>

          {/* 👤 Perfil de usuario - Diseño profesional tipo LinkedIn */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-all duration-200 group border border-white/10"
              aria-label="Menú de usuario"
            >
              {/* Avatar con borde profesional - Muestra foto si existe */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-white/40 to-white/20 flex items-center justify-center text-lg font-bold shadow-lg border-2 border-white/40 flex-shrink-0 ring-2 ring-white/20 overflow-hidden relative">
                {fotoUrl && !fotoError ? (
                  <img
                    src={fotoUrl}
                    alt={nombreMostrar}
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.error('❌ Error al cargar foto en header');
                      setFotoError(true);
                    }}
                    onLoad={() => {
                      setFotoError(false);
                    }}
                  />
                ) : (
                  <span className="text-lg">{getInitials(nombreMostrar)}</span>
                )}
              </div>

              {/* Nombre y rol - Solo visible en pantallas medianas y grandes */}
              <div className="hidden md:flex flex-col items-start min-w-0">
                <span className="text-sm font-semibold text-white truncate max-w-[140px]" title={nombreMostrar}>
                  {nombreMostrar}
                </span>
                <span className="text-xs text-white/75 truncate max-w-[140px] font-medium" title={rolMostrar}>
                  {rolMostrar}
                </span>
              </div>

              {/* Indicador de estado (solo para SuperAdmin) */}
              {isSuperAdmin && (
                <div className="hidden md:block w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50 ml-1" />
              )}

              {/* Chevron */}
              <ChevronDown 
                className={`hidden md:block w-4 h-4 text-white/70 transition-transform duration-200 ml-1 ${
                  showUserMenu ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Menú desplegable del usuario - Estilo profesional */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/50 py-1.5 z-50 overflow-hidden backdrop-blur-xl">
                  {/* Información del usuario */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0A5BA9] to-[#3B82F6] flex items-center justify-center text-lg font-bold shadow-md border-2 border-slate-200 overflow-hidden">
                        {fotoUrl && !fotoError ? (
                          <img
                            src={fotoUrl}
                            alt={nombreMostrar}
                            className="w-full h-full object-cover"
                            onError={() => setFotoError(true)}
                          />
                        ) : (
                          <span className="text-lg">{getInitials(nombreMostrar)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{nombreMostrar}</p>
                        <p className="text-xs text-slate-500 truncate">{rolMostrar}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Opciones del menú */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate("/user/dashboard");
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <span>Mi Cuenta</span>
                    </button>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 🔽 Línea decorativa inferior */}
      <div
        className="h-[1px] w-full"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0.15), rgba(0,0,0,0.15))",
        }}
      />
    </header>
  );
}