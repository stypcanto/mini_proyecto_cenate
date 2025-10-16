// ========================================================================
// 🔐 ProtectedRoute.jsx
// ------------------------------------------------------------------------
// Componente de protección de rutas basado en token y roles.
// Compatible con React Router v6+ y AuthContext global.
// ========================================================================

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";

// ========================================================================
// 🚦 Función auxiliar de validación
// ========================================================================
const hasRequiredRole = (userRoles = [], allowedRoles = []) => {
  if (allowedRoles.length === 0) return true;
  const normalizedUser = userRoles.map((r) => String(r).toUpperCase());
  const normalizedAllowed = allowedRoles.map((r) => String(r).toUpperCase());
  return normalizedUser.some((r) => normalizedAllowed.includes(r));
};

// ========================================================================
// 🧩 Componente principal
// ========================================================================
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuthContext();

  // ⏳ Esperar carga inicial de sesión (evita flash no autorizado)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700">
        Verificando sesión...
      </div>
    );
  }

  // ❌ No autenticado → login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // 🔐 Autenticado pero sin permisos → acceso denegado
  if (!hasRequiredRole(user?.roles || [], allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Autorizado → renderizar subrutas
  return <Outlet />;
}