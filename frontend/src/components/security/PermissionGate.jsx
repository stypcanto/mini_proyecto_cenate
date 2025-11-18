// ======================================================================
// 🎯 PermissionGate.jsx – Controla visibilidad según permisos MBAC
// ----------------------------------------------------------------------
// Compatible con CRA, React 18+ y hooks de usePermissions.js
// Evita renders innecesarios, soporta fallback visual y roles privilegiados.
// ======================================================================

import React, { memo } from "react";
import usePermissions from "../../hooks/usePermissions";
import { useAuth } from "../../context/AuthContext";

/**
 * 🔒 Uso:
 * <PermissionGate path="/roles/medico/dashboard" action="crear">
 *    <button>Crear cita</button>
 * </PermissionGate>
 */
const PermissionGate = ({ path, action = "ver", children, fallback = null }) => {
  const { tienePermiso, loading } = usePermissions();
  const { user } = useAuth();

  if (loading) return null; // 🌀 Evita parpadeos mientras se cargan permisos

  // 🚀 Acceso total para SUPERADMIN o ADMIN
  const rolesUsuario = (user?.roles || [])
    .map((r) => {
      if (typeof r === "string") return r.replace("ROLE_", "").toUpperCase();
      if (r?.authority) return r.authority.replace("ROLE_", "").toUpperCase();
      return String(r || "").replace("ROLE_", "").toUpperCase();
    })
    .filter(Boolean);

  const isPrivileged = rolesUsuario.includes("SUPERADMIN") || rolesUsuario.includes("ADMIN");

  // ✅ Evaluación de permisos MBAC usando idUser
  const permitido = isPrivileged || (user?.idUser && tienePermiso(path, action));

  if (!permitido) return fallback;

  return <>{children}</>;
};

export default memo(PermissionGate);