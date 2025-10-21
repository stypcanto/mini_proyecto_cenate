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

    // Normalizar primer rol asignado
    const rol = (user.roles?.[0] || "").toUpperCase();

    // Mapa de rutas MBAC
    const routes = {
      SUPERADMIN: "/admin",
      ADMIN: "/admin",
      MEDICO: "/roles/medico",
      COORDINADOR: "/roles/coordinador",
      EXTERNO: "/roles/externo",
      CITAS: "/roles/citas",
      LINEAMIENTOS: "/roles/lineamientos",
      USER: "/user/dashboard",
    };

    const targetPath = routes[rol] || "/unauthorized";

    // ⏩ Redirigir suavemente con pequeño delay para UX
    const timer = setTimeout(() => navigate(targetPath, { replace: true }), 900);

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