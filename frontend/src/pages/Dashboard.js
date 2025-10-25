// ========================================================================
// 🧭 Dashboard.js – Redirección inteligente MBAC CENATE 2025
// ------------------------------------------------------------------------
// Redirige automáticamente según rol del usuario
// SUPERADMIN/ADMIN → /admin, otros roles → su dashboard específico
// ========================================================================

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Si no hay usuario → login
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Normalizar roles
    const roles = (user?.roles || []).map(r => {
      if (typeof r === 'string') return r.replace('ROLE_', '').toUpperCase();
      if (r?.authority) return r.authority.replace('ROLE_', '').toUpperCase();
      return String(r || '').replace('ROLE_', '').toUpperCase();
    }).filter(Boolean);

    console.log("🔍 Roles detectados:", roles);

    // Mapeo de roles a rutas
    let targetPath = "/unauthorized";

    if (roles.includes("SUPERADMIN") || roles.includes("ADMIN")) {
      targetPath = "/admin";
    } else if (roles.includes("MEDICO")) {
      targetPath = "/roles/medico/dashboard";
    } else if (roles.includes("COORDINADOR")) {
      targetPath = "/roles/coordinador/dashboard";
    } else if (roles.includes("EXTERNO")) {
      targetPath = "/roles/externo/dashboard";
    } else if (roles.includes("CITAS")) {
      targetPath = "/roles/citas/dashboard";
    } else if (roles.includes("LINEAMIENTOS")) {
      targetPath = "/roles/lineamientos/dashboard";
    } else if (roles.includes("USER")) {
      targetPath = "/user/dashboard";
    }

    console.log("➡️ Redirigiendo a:", targetPath);

    // Pequeño delay para UX suave
    const timer = setTimeout(() => {
      navigate(targetPath, { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  // 💫 Loader con estilo CENATE
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="flex flex-col items-center gap-6 p-8">
        {/* Logo animado */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0a5ba9] to-[#06b6d4] 
                          flex items-center justify-center shadow-2xl animate-pulse">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        </div>

        {/* Texto principal */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            Configurando tu espacio de trabajo
          </h2>
          <p className="text-gray-600">
            Detectando permisos y preparando tu dashboard...
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-gradient-to-r from-[#0a5ba9] to-[#06b6d4] 
                          rounded-full animate-pulse"></div>
        </div>

        {/* Info del usuario */}
        {user && (
          <div className="mt-4 px-6 py-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-700">
              Bienvenido, <span className="font-semibold">{user.nombreCompleto || user.username}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
