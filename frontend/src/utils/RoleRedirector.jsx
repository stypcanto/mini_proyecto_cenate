// ========================================================================
// 🧭 RoleRedirector.jsx – Redirección automática post-login (versión robusta)
// ========================================================================

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleRedirector({ roles = [] }) {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🧭 RoleRedirector montado. Roles:", roles);

    if (!roles || roles.length === 0) {
      console.warn("⚠️ Sin roles aún, enviando a dashboard usuario");
      navigate("/user/dashboard", { replace: true });
      return;
    }

    const normalizedRoles = roles.map((r) =>
      typeof r === "string"
        ? r.toUpperCase()
        : (r.authority || r.roleName || "").toUpperCase()
    );

    // 👑 Superadmin / Admin
    if (
      normalizedRoles.includes("SUPERADMIN") ||
      normalizedRoles.includes("ADMIN") ||
      normalizedRoles.includes("ROLE_SUPERADMIN")
    ) {
      console.log("➡️ RoleRedirector → /admin/dashboard");
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    // 🩺 Médicos y personal de salud
    if (
      normalizedRoles.some((r) =>
        [
          "MEDICO",
          "ENFERMERIA",
          "OBSTETRA",
          "LABORATORIO",
          "RADIOLOGIA",
          "FARMACIA",
          "PSICOLOGO",
          "TERAPISTA_LENG",
          "TERAPISTA_FISI",
          "NUTRICION",
        ].includes(r)
      )
    ) {
      console.log("➡️ RoleRedirector → /roles/medico/dashboard");
      navigate("/roles/medico/dashboard", { replace: true });
      return;
    }

    // 🗓️ Coordinadores
    if (
      normalizedRoles.includes("COORDINACION") ||
      normalizedRoles.includes("COORD_TRANSFER")
    ) {
      console.log("➡️ RoleRedirector → /roles/coordinador/dashboard");
      navigate("/roles/coordinador/dashboard", { replace: true });
      return;
    }

    // 🏛️ Externos
    if (
      normalizedRoles.some((r) =>
        ["INSTITUCION_EX", "ASEGURADORA", "REGULADOR"].includes(r)
      )
    ) {
      console.log("➡️ RoleRedirector → /roles/externo/dashboard");
      navigate("/roles/externo/dashboard", { replace: true });
      return;
    }

    // 👤 Por defecto
    console.log("➡️ RoleRedirector → /user/dashboard");
    navigate("/user/dashboard", { replace: true });
  }, [roles, navigate]);

  return null;
}