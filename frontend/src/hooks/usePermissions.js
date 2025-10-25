// ========================================================================
// 🎯 usePermissions.js – Sistema MBAC CENATE (versión completa)
// ------------------------------------------------------------------------
// Gestiona permisos por ruta/acción según la respuesta del backend MBAC.
// Compatible con ProtectedRoute.jsx, PermissionGate.jsx y Sidebar dinámico.
// Incluye bypass automático para SUPERADMIN y ADMIN.
// ========================================================================

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../lib/apiClient";
import {
  transformarPermisos,
  tienePermisosRequeridos,
  filtrarRutasPermitidas,
  agruparPorModulo,
} from "../utils/rbacUtils";

// 🔧 Normaliza las rutas (minúsculas, con "/" inicial)
const normalizePath = (p) =>
  ("/" + String(p || "").trim().replace(/^\/+/, "")).toLowerCase().replace(/\/$/, "");

export const usePermissions = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Roles del usuario (maneja tanto strings como objetos de Spring Security)
  const roles = (user?.roles || []).map((r) => {
    if (typeof r === 'string') return r.toUpperCase();
    if (r?.authority) return r.authority.replace('ROLE_', '').toUpperCase();
    return String(r || '').toUpperCase();
  }).filter(Boolean);
  const isSuperOrAdmin = roles.includes("SUPERADMIN") || roles.includes("ADMIN");

  // =====================================================
  // 🔹 1. Cargar permisos reales del backend MBAC
  // =====================================================
  const fetchPermisos = useCallback(async () => {
    if (!isAuthenticated || !user?.username) return;

    setLoading(true);
    setError(null);

    try {
      // ✅ Usa el username como identificador temporal
      const data = await apiClient.get(`/permisos/usuario/${user.username}`, true);

      if (!Array.isArray(data)) {
        throw new Error("Formato de permisos inválido (no es un array)");
      }

      // Normaliza y elimina duplicados
      const transformed = transformarPermisos(data)
        .map((p) => ({ ...p, path: normalizePath(p.path) }))
        .filter(
          (p, i, arr) => arr.findIndex((q) => q.path === p.path && q.acciones === p.acciones) === i
        );

      setPermisos(transformed);
    } catch (err) {
      console.error("Error cargando permisos:", err);
      setError(err.message || "Error al cargar permisos");
      if (String(err?.message).includes("401")) logout();
      setPermisos([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, logout]);

  // =====================================================
  // 🔹 2. Efecto: recargar al cambiar usuario autenticado
  // =====================================================
  useEffect(() => {
    if (isAuthenticated && user?.username) {
      fetchPermisos();
    } else {
      setPermisos([]);
    }
  }, [isAuthenticated, user, fetchPermisos]);

  // =====================================================
  // 🔹 3. Función: verificar permiso por ruta + acción
  // =====================================================
  const tienePermiso = useCallback(
    (rutaPagina, accion = "ver") => {
      if (isSuperOrAdmin) return true; // 🚀 acceso total
      if (!Array.isArray(permisos)) return false;
      const ruta = normalizePath(rutaPagina);
      return tienePermisosRequeridos(permisos, ruta, [accion]);
    },
    [permisos, isSuperOrAdmin]
  );

  // =====================================================
  // 🔹 4. Helpers adicionales
  // =====================================================
  const getRutasPermitidas = useCallback(
    (accion = "ver") => {
      // Si es SUPERADMIN o ADMIN y no hay permisos cargados, devolver base mínima
      if (isSuperOrAdmin && permisos.length === 0) {
        return [
          { path: "/dashboard", acciones: ["ver"], modulo: "general" },
          {
            path: "/admin",
            acciones: ["ver", "crear", "editar", "eliminar", "exportar", "aprobar"],
            modulo: "admin",
          },
          {
            path: "/admin/users",
            acciones: ["ver", "crear", "editar", "eliminar"],
            modulo: "admin",
          },
        ];
      }

      return filtrarRutasPermitidas(permisos, accion).map((p) => ({
        ...p,
        path: normalizePath(p.path),
      }));
    },
    [permisos, isSuperOrAdmin]
  );

  const getModulosAgrupados = useCallback(
    () => agruparPorModulo(getRutasPermitidas("ver")),
    [getRutasPermitidas]
  );

  // =====================================================
  // 🔹 5. Alias: compatibilidad con ProtectedRoute.jsx
  // =====================================================
  const verificarPermiso = tienePermiso;

  // =====================================================
  // 🔹 6. Retorno final del hook
  // =====================================================
  return {
    permisos,
    loading,
    error,
    tienePermiso,
    verificarPermiso, // usado por ProtectedRoute.jsx
    getRutasPermitidas,
    getModulosAgrupados,
    refetch: fetchPermisos,
  };
};