// ========================================================================
// 🔐 ProtectedRoute.jsx – Sistema de protección MBAC (CENATE 2025)
// ------------------------------------------------------------------------
// Unifica protección de rutas, verificación de permisos RBAC,
// y control de visibilidad (PermissionGate).
// Compatible con CRA y React Router 6+.
// ========================================================================

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { ShieldAlert, Loader2 } from "lucide-react";

/**
 * ==========================================================
 * 🔒 ProtectedRoute – Protege páginas completas
 * ==========================================================
 * Uso:
 * <ProtectedRoute requiredPath="/admin/users" requiredAction="ver">
 *    <UsersPage />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({
  children,
  requiredPath = null,
  requiredAction = "ver",
  fallbackPath = "/dashboard",
  requireAdmin = false,
}) => {
  const { isAuthenticated, initialized, user } = useAuth();
  const { verificarPermiso, loading } = usePermissions();

  // 🌀 Mostrar loader mientras se inicializa autenticación o permisos
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

  // ❌ Si no está autenticado → redirigir a login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // 🔍 Extraer roles del usuario
  const rolesUsuario = (user?.roles || []).map((r) => {
    if (typeof r === 'string') return r.toUpperCase();
    if (typeof r === 'object' && r !== null) {
      return (r.authority || r.roleName || '').toUpperCase();
    }
    return '';
  }).filter(Boolean);
  
  const isAdmin = rolesUsuario.includes("SUPERADMIN") || rolesUsuario.includes("ADMIN") || rolesUsuario.includes("ROLE_SUPERADMIN");

  // 🔒 Si requiere ser admin y no lo es → acceso denegado
  if (requireAdmin && !isAdmin) {
    console.log("❌ Acceso denegado: Se requiere rol ADMIN/SUPERADMIN");
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-6">
        <div className="bg-[var(--bg-card)] rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-[var(--border-color)]">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-danger)]/10 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-[var(--color-danger)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Acceso Denegado
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Esta sección es solo para administradores.
          </p>
          <a
            href={fallbackPath}
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl
                       font-semibold text-white bg-[var(--color-primary)] hover:brightness-110
                       transition-all duration-200"
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    );
  }

  // ✅ Si no hay ruta requerida, permitir acceso (ya pasó verificación de admin si era necesaria)
  if (!requiredPath) {
    console.log("✅ Acceso permitido sin ruta requerida");
    return children;
  }

  // 🔍 Verificar permiso MBAC
  console.log("🔍 Verificando acceso a:", requiredPath, "Acción:", requiredAction);
  
  // 🚀 SUPERADMIN y ADMIN siempre tienen acceso
  if (isAdmin) {
    console.log("✅ Acceso concedido por rol privilegiado");
    return children;
  }
  
  let hasPermission = verificarPermiso(requiredPath, requiredAction);
  console.log("🔍 Resultado de verificación:", hasPermission);

  // 🚫 Sin permiso → pantalla elegante de “Acceso denegado”
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
            No tienes permisos para acceder a esta sección.
          </p>

          <p className="text-xs text-[var(--text-secondary)]/80 mb-6">
            Ruta solicitada:{" "}
            <code className="bg-[var(--bg-hover)] px-2 py-1 rounded">
              {requiredPath}
            </code>
          </p>

          <div className="bg-[var(--bg-hover)] rounded-xl p-4 mb-6">
            <p className="text-xs text-[var(--text-secondary)] mb-1">
              Usuario actual
            </p>
            <p className="font-semibold text-[var(--text-primary)]">
              {user?.nombreCompleto || user?.username}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {rolesUsuario.join(", ")}{" "}
              {rolesUsuario.includes("SUPERADMIN") && "(acceso total)"}
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

  // ✅ Permiso concedido
  return children;
};

/**
 * ==========================================================
 * 🎯 withPermission – HOC para envolver componentes individuales
 * ==========================================================
 * Uso:
 * export default withPermission(MiComponente, "/admin/users", "editar");
 */
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

/**
 * ==========================================================
 * 🧩 PermissionGate – Controla visibilidad dentro del layout
 * ==========================================================
 * Uso:
 * <PermissionGate path="/usuarios" action="crear">
 *   <button>Crear usuario</button>
 * </PermissionGate>
 */
export const PermissionGate = ({
  children,
  path,
  action = "ver",
  fallback = null,
}) => {
  const { verificarPermiso, loading } = usePermissions();

  if (loading) return null;
  const hasPermission = verificarPermiso(path, action);

  if (!hasPermission) return fallback;
  return <>{children}</>;
};

export default ProtectedRoute;