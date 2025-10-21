// ========================================================================
// 🧭 Dashboard.jsx
// ------------------------------------------------------------------------
// Redirección automática según el rol MBAC del usuario autenticado.
// Cubre todos los roles (ADMIN, MEDICO, COORDINADOR, EXTERNO, etc.).
// ========================================================================

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // 🚨 Si no hay sesión activa
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Normalizar rol principal
    const rol = (user.roles?.[0] || "").toUpperCase();

    // 🔀 Mapa de rutas según roles MBAC
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

    // Ruta por defecto si el rol no coincide
    const targetPath = routes[rol] || "/unauthorized";

    // ⏩ Redirigir
    navigate(targetPath, { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-center px-6">
      <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600 text-lg font-medium">
        Redirigiendo según tu rol...
      </p>
      <p className="text-sm text-gray-400 mt-2">
        Por favor espera unos segundos.
      </p>
    </div>
  );
}