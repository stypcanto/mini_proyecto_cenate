import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { Loader2, ShieldAlert } from "lucide-react";

/**
 * ✅ ProtectedRoute – protege rutas por permisos MBAC
 */
export const ProtectedRoute = ({ children, requiredPath = null }) => {
  const { isAuthenticated, initialized, user } = useAuth();
  const { tienePermiso, loading } = usePermissions();
  const location = useLocation();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Verificando permisos...</p>
      </div>
    );
  }

  // 🔒 No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const ruta = requiredPath || location.pathname;
  const permitido = tienePermiso(ruta, "ver");

  if (!permitido) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-slate-700 p-6">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Acceso denegado</h1>
        <p>No tienes permisos para acceder a esta sección.</p>
        <p className="text-sm text-slate-500 mt-2">
          Ruta: <code>{ruta}</code>
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;