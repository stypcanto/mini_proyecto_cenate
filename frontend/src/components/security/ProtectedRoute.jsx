// ========================================================================
// 🔐 ProtectedRoute.jsx – Protección de rutas MBAC (CRA compatible)
// ------------------------------------------------------------------------
// Verifica autenticación y permisos RBAC basados en roles y acciones.
// Incluye bypass automático para roles de alto nivel (SUPERADMIN, ADMIN).
// ========================================================================

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { ShieldAlert, Loader2 } from "lucide-react";

/**
 * Componente HOC para proteger rutas con RBAC
 * Verifica autenticación y permisos específicos de página
 */
export const ProtectedRoute = ({
  children,
  requiredPath = null,
  requiredAction = "ver",
  fallbackPath = "/dashboard",
}) => {
  const { isAuthenticated, initialized, user } = useAuth();
  const { verificarPermiso, loading } = usePermissions();

  // 🌀 Loader mientras se inicializa
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // ❌ No autenticado → redirigir a login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ✅ Solo autenticación, sin permisos específicos
  if (!requiredPath) return children;

  // 🔒 Verificar permisos del usuario
  let hasPermission = verificarPermiso(requiredPath, requiredAction);

  // 🚀 Permitir acceso total a SUPERADMIN y ADMIN
  const rolesUsuario = (user?.roles || []).map((r) => r.toUpperCase());
  if (rolesUsuario.includes("SUPERADMIN") || rolesUsuario.includes("ADMIN")) {
    hasPermission = true;
  }

  // 🚫 Sin permiso → mostrar pantalla de acceso denegado
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Acceso Denegado
            </h2>
            <p className="text-slate-600 mb-2">
              No tienes permisos para acceder a esta sección.
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Ruta:
              <code className="bg-slate-100 px-2 py-1 rounded ml-1">
                {requiredPath}
              </code>
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-500 mb-1">Usuario actual</p>
              <p className="font-semibold text-slate-900">
                {user?.nombreCompleto || user?.username}
              </p>
              <p className="text-sm text-slate-600">
                {rolesUsuario.join(", ")}{" "}
                {rolesUsuario.includes("SUPERADMIN") && "(acceso total)"}
              </p>
            </div>

            <a
              href={fallbackPath}
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all duration-200 transform hover:scale-105"
            >
              Volver al Dashboard
            </a>

            <p className="text-xs text-slate-400 mt-6">
              Si crees que esto es un error, contacta al administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Permiso concedido
  return children;
};

/**
 * HOC para envolver componentes individuales con permisos
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
 * Gate para mostrar/ocultar elementos según permisos
 * Uso: <PermissionGate path="/usuarios" action="crear">...</PermissionGate>
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
  return children;
};

export default ProtectedRoute;