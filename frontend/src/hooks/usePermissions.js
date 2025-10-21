// ========================================================================
// 🎯 usePermissions.js (versión MBAC real compatible con backend CENATE)
// ------------------------------------------------------------------------
// Gestiona los permisos por página/ruta según la respuesta del backend.
// En esta versión se usa `username` como identificador temporal del usuario.
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

export const usePermissions = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =====================================================
  // 🔹 1. Cargar permisos reales del backend MBAC
  // =====================================================
  const fetchPermisos = useCallback(async () => {
    if (!isAuthenticated || !user?.username) return;

    setLoading(true);
    setError(null);

    try {
      // ✅ Aquí usamos el username en lugar del ID numérico
      const data = await apiClient.get(`/permisos/usuario/${user.username}`, true);

      if (!Array.isArray(data)) {
        throw new Error("Formato de permisos inválido (no es un array)");
      }

      const permisosTransformados = transformarPermisos(data);
      setPermisos(permisosTransformados);
    } catch (err) {
      console.error("Error cargando permisos:", err);
      setError(err.message || "Error al cargar permisos");
      if (err.message?.includes("401")) logout();
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
      if (!Array.isArray(permisos)) return false;
      return tienePermisosRequeridos(permisos, rutaPagina, [accion]);
    },
    [permisos]
  );

  // =====================================================
  // 🔹 4. Helpers adicionales
  // =====================================================
  const getRutasPermitidas = useCallback(
    (accion = "ver") => filtrarRutasPermitidas(permisos, accion),
    [permisos]
  );

  const getModulosAgrupados = useCallback(
    () => agruparPorModulo(permisos),
    [permisos]
  );

  // =====================================================
  // 🔹 5. Alias: mantener compatibilidad con ProtectedRoute
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
    verificarPermiso, // ✅ usado por ProtectedRoute.jsx
    getRutasPermitidas,
    getModulosAgrupados,
    refetch: fetchPermisos,
  };
};