// ========================================================================
// 🔐 ProtectedRoute.jsx – Sistema de protección MBAC (CENATE 2025)
// ------------------------------------------------------------------------
// • Unifica autenticación, permisos RBAC/MBAC y control de visibilidad.
// • Compatible con CRA, Vite y React Router 6+.
// • Incluye fallback elegante para “Acceso denegado”.
// ========================================================================

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import usePermissions from "../../hooks/usePermissions";
import { ShieldAlert, Loader2 } from "lucide-react";

// ============================================================
// 🔒 ProtectedRoute – Protege páginas completas
// ============================================================
export const ProtectedRoute = ({
  children,
  requiredPath = null,
  requiredAction = "ver",
  fallbackPath = "/user/dashboard",
}) => {
  const { isAuthenticated, initialized, user } = useAuth();
  const { tienePermiso, loading } = usePermissions();

  // 🌀 Loader mientras se inicializa
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] font-medium">
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }

  // ❌ Redirigir si no autenticado
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ✅ Si no hay ruta requerida → acceso libre
  if (!requiredPath) return children;

  // ============================================================
  // 🔍 Verificar permiso MBAC o roles privilegiados
  // ============================================================
  const rolesUsuario = (user?.roles || [])
    .map((r) => {
      if (typeof r === "string") return r.replace("ROLE_", "").toUpperCase();
      if (r?.authority) return r.authority.replace("ROLE_", "").toUpperCase();
      return String(r || "").replace("ROLE_", "").toUpperCase();
    })
    .filter(Boolean);

  const isPrivileged = rolesUsuario.includes("SUPERADMIN") || rolesUsuario.includes("ADMIN");

  // 🔐 Validar permiso específico usando idUser
  let hasPermission = true;
  if (!isPrivileged && tienePermiso && user?.idUser) {
    try {
      hasPermission = tienePermiso(requiredPath, requiredAction);
    } catch {
      hasPermission = true;
    }
  }

  // 🚫 Acceso denegado → fallback visual
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-6">
        <div className="bg-[var(--bg-card)] rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-[var(--border-color)]">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-danger)]/10 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-[var(--color-danger)]" />
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Acceso Denegado
          </h2>
          <p className="text-[var(--text-secondary)] mb-4">
            No tienes permisos suficientes para acceder a esta sección.
          </p>

          <p className="text-xs text-[var(--text-secondary)]/80 mb-6">
            Ruta protegida:{" "}
            <code className="bg-[var(--bg-hover)] px-2 py-1 rounded">
              {requiredPath}
            </code>
          </p>

          <div className="bg-[var(--bg-hover)] rounded-xl p-4 mb-6">
            <p className="text-xs text-[var(--text-secondary)] mb-1">Usuario actual</p>
            <p className="font-semibold text-[var(--text-primary)]">
              {user?.nombreCompleto || user?.username}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {rolesUsuario.join(", ")} {isPrivileged && "(acceso total)"}
            </p>
          </div>

          <a
            href={fallbackPath}
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl
                       font-semibold text-white bg-[var(--color-primary)] hover:brightness-110
                       transition-all duration-200"
          >
            Volver al Dashboard
          </a>

          <p className="text-xs text-[var(--text-secondary)]/70 mt-6">
            Si crees que esto es un error, contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

// ============================================================
// 🎯 withPermission – HOC para componentes individuales
// ============================================================
export const withPermission = (
  Component,
  requiredPath,
  requiredAction = "ver"
) =>
  function Wrapped(props) {
    return (
      <ProtectedRoute
        requiredPath={requiredPath}
        requiredAction={requiredAction}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };

// ============================================================
// 🧩 PermissionGate – Controla visibilidad dentro del layout
// ============================================================
export const PermissionGate = ({ children, path, action = "ver", fallback = null }) => {
  const { tienePermiso, loading } = usePermissions();

  if (loading) return null;

  const permitido = tienePermiso ? tienePermiso(path, action) : true;

  if (!permitido) return fallback;

  return <>{children}</>;
};

export default ProtectedRoute;