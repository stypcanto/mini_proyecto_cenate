// ========================================================================
// 🧭 Dashboard.js – Redirección inteligente MBAC CENATE 2025
// ------------------------------------------------------------------------
// Redirige automáticamente usando los permisos reales del backend.
// Prioridad: SUPERADMIN/ADMIN → Permisos del usuario → Fallback
// ========================================================================

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRutasPermitidas, loading } = usePermissions();

  useEffect(() => {
    // Si no hay usuario → login
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Esperar a que carguen los permisos
    if (loading) return;

    // 1. Si es SUPERADMIN o ADMIN → /admin
    const roles = (user?.roles || []).map(r => 
      typeof r === 'string' ? r.toUpperCase() : r.toString().toUpperCase()
    );

    if (roles.includes("SUPERADMIN") || roles.includes("ADMIN")) {
      console.log("✅ Usuario es SUPERADMIN/ADMIN → redirigiendo a /admin");
      navigate("/admin", { replace: true });
      return;
    }

    // 2. Obtener rutas permitidas del usuario
    const rutasPermitidas = getRutasPermitidas("ver");
    
    console.log("📋 Rutas permitidas para el usuario:", rutasPermitidas);

    // 3. Buscar la primera ruta con "dashboard" en el path
    const dashboardRoute = rutasPermitidas.find(r => 
      r.path?.toLowerCase().includes("dashboard")
    );

    if (dashboardRoute) {
      console.log(`✅ Redirigiendo a: ${dashboardRoute.path}`);
      navigate(dashboardRoute.path, { replace: true });
      return;
    }

    // 4. Si no hay dashboard, usar la primera ruta disponible
    if (rutasPermitidas.length > 0) {
      console.log(`✅ Redirigiendo a primera ruta: ${rutasPermitidas[0].path}`);
      navigate(rutasPermitidas[0].path, { replace: true });
      return;
    }

    // 5. Si no hay permisos → unauthorized
    console.warn("⚠️ Usuario sin permisos → /unauthorized");
    navigate("/unauthorized", { replace: true });

  }, [user, loading, navigate, getRutasPermitidas]);

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
            Cargando permisos y preferencias...
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
