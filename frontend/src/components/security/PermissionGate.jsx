// ======================================================================
// 🎯 PermissionGate.jsx – Controla visibilidad según MBAC
// ======================================================================

import React from "react";
import { usePermissions } from "../../hooks/usePermissions";

/**
 * Uso:
 * <PermissionGate path="/roles/medico/dashboard" action="crear">
 *    <button>Crear cita</button>
 * </PermissionGate>
 */
export const PermissionGate = ({
  path,
  action = "ver",
  children,
  fallback = null,
}) => {
  const { tienePermiso, loading } = usePermissions();

  if (loading) return null;

  const permitido = tienePermiso(path, action);
  if (!permitido) return fallback;

  return <>{children}</>;
};

export default PermissionGate;