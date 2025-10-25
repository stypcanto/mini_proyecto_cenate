// ========================================================================
// 🧭 Dashboard.jsx – Versión final CENATE 2025
// ------------------------------------------------------------------------
// Redirección automática según rol MBAC dentro del layout global.
// Compatible con SUPERADMIN, ADMIN, MEDICO, COORDINADOR, EXTERNO, CITAS,
// LINEAMIENTOS y USER. Mantiene estilo Apple/CENATE.
// ========================================================================

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // 🔍 Extraer TODOS los roles del usuario (no solo el primero)
    const rolesArray = [];
    if (user.roles && user.roles.length > 0) {
      user.roles.forEach(r => {
        if (typeof r === 'string') {
          rolesArray.push(r.toUpperCase());
        } else if (typeof r === 'object' && r !== null) {
          const authority = (r.authority || r.roleName || "").toUpperCase();
          if (authority) rolesArray.push(authority);
        }
      });
    }

    console.log("📝 Todos los roles del usuario:", rolesArray);

    // 🎯 Buscar el rol de mayor jerarquía
    let targetPath = "/unauthorized";
    
    if (rolesArray.includes("SUPERADMIN") || rolesArray.includes("ROLE_SUPERADMIN")) {
      targetPath = "/admin/dashboard";
    } else if (rolesArray.includes("ADMIN")) {
      targetPath = "/admin/dashboard";
    } else if (rolesArray.includes("MEDICO")) {
      targetPath = "/roles/medico/dashboard";
    } else if (rolesArray.includes("COORDINADOR")) {
      targetPath = "/roles/coordinador/dashboard";
    } else if (rolesArray.includes("EXTERNO")) {
      targetPath = "/roles/externo/dashboard";
    } else if (rolesArray.includes("CITAS")) {
      targetPath = "/roles/citas/dashboard";
    } else if (rolesArray.includes("LINEAMIENTOS")) {
      targetPath = "/roles/lineamientos/dashboard";
    } else if (rolesArray.includes("USER")) {
      targetPath = "/user/dashboard";
    }

    console.log("➡️ Redirigiendo a:", targetPath);

    // ⏩ Redirigir suavemente con pequeño delay para UX
    const timer = setTimeout(() => navigate(targetPath, { replace: true }), 500);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  // Loader unificado con diseño CENATE
  return (
    <div
      className="flex flex-col items-center justify-center py-20
                 bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors"
    >
      {/* Spinner */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-info)] shadow-lg">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>

        {/* Texto principal */}
        <h2 className="text-xl font-bold mt-3 text-[var(--text-primary)]">
          Redirigiendo según tu rol...
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Por favor, espera unos segundos mientras cargamos tu entorno.
        </p>
      </div>

      {/* Indicador visual Apple-like */}
      <div className="mt-8 w-40 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-info)] animate-pulse"></div>
      </div>
    </div>
  );
}