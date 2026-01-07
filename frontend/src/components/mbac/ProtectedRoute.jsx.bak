// ========================================================================
// 🛡️ ProtectedRoute.jsx – Ruta protegida por permisos MBAC
// ------------------------------------------------------------------------
// Protege rutas completas verificando permisos antes de renderizar.
// Redirige a página de acceso denegado si no tiene permiso.
// ========================================================================

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePermisos } from "../../context/PermisosContext";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

/**
 * Componente de página de acceso denegado
 */
const AccesoDenegado = ({ ruta, mensaje }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Acceso Denegado
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          {mensaje || "No tienes permisos para acceder a esta página."}
        </p>

        {/* Información técnica */}
        {ruta && (
          <div className="bg-gray-100 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-500">
              Ruta solicitada:{" "}
              <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                {ruta}
              </code>
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir al Inicio
          </a>
        </div>

        {/* Nota */}
        <p className="text-xs text-gray-400 mt-6">
          Si crees que deberías tener acceso, contacta al administrador del
          sistema.
        </p>
      </div>
    </div>
  );
};

/**
 * Componente de carga mientras se verifican permisos
 */
const CargandoPermisos = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando permisos...</p>
      </div>
    </div>
  );
};

/**
 * Ruta protegida por permisos MBAC
 *
 * @param {React.ReactNode} children - Componente a renderizar si tiene acceso
 * @param {string} ruta - Ruta MBAC a verificar (ej: "/admin/users")
 * @param {string} accion - Acción requerida (default: "ver")
 * @param {string} redirectTo - Ruta de redirección si no tiene acceso
 * @param {boolean} mostrarDenegado - Si true, muestra página de acceso denegado en lugar de redirigir
 * @param {string[]} rolesPermitidos - Roles que tienen acceso directo (opcional)
 */
export const ProtectedRoute = ({
  children,
  ruta,
  accion = "ver",
  redirectTo = "/",
  mostrarDenegado = true,
  rolesPermitidos = [],
}) => {
  const location = useLocation();
  const { user, isAuthenticated, initialized: authInitialized } = useAuth();
  const { tienePermiso, puedeAcceder, loading, initialized, esSuperAdmin } = usePermisos();

  // Usar la ruta actual si no se especifica una
  const rutaVerificar = ruta || location.pathname;

  // Esperar a que se inicialice la autenticación
  if (!authInitialized) {
    return <CargandoPermisos />;
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Esperar a que se carguen los permisos
  if (loading || !initialized) {
    return <CargandoPermisos />;
  }

  // SuperAdmin siempre tiene acceso
  if (esSuperAdmin) {
    return <>{children}</>;
  }

  // Verificar roles permitidos (si se especificaron)
  if (rolesPermitidos.length > 0 && user?.roles) {
    const tieneRolPermitido = rolesPermitidos.some((rol) =>
      user.roles.map((r) => r.toUpperCase()).includes(rol.toUpperCase())
    );
    if (tieneRolPermitido) {
      return <>{children}</>;
    }
  }

  // Verificar permiso MBAC
  const tieneAcceso = accion === "ver"
    ? puedeAcceder(rutaVerificar)
    : tienePermiso(rutaVerificar, accion);

  if (!tieneAcceso) {
    if (mostrarDenegado) {
      return <AccesoDenegado ruta={rutaVerificar} />;
    }
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Tiene acceso - renderizar contenido
  return <>{children}</>;
};

/**
 * HOC para proteger componentes de página
 */
export const withPermission = (
  WrappedComponent,
  ruta,
  accion = "ver",
  options = {}
) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute ruta={ruta} accion={accion} {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
};

export default ProtectedRoute;
