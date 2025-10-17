// ========================================================================
// 🧠 usePermisos.js
// ------------------------------------------------------------------------
// Hook personalizado para consumir el módulo de permisos de CENATE.
// Basado en permisosApi.js (fetch seguro, manejo de errores y estado reactivo)
// ========================================================================

import { useState, useEffect, useCallback } from "react";
import permisosApi from "@/api/permisosApi";

// ========================================================================
// 🎯 Hook principal
// ========================================================================
export const usePermisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ----------------------------------------------------------------------
  // 🔄 Cargar permisos por usuario
  // ----------------------------------------------------------------------
  const fetchPermisosPorUsuario = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await permisosApi.getPermisosPorUsuario(userId);
      setPermisos(data || []);
    } catch (err) {
      console.error("❌ Error obteniendo permisos por usuario:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------------------------------------------------
  // 🔎 Verificar permiso
  // ----------------------------------------------------------------------
  const verificarPermiso = useCallback(async (request) => {
    try {
      const response = await permisosApi.verificarPermiso(request);
      return response?.permitido || false;
    } catch (err) {
      console.error("❌ Error verificando permiso:", err);
      return false;
    }
  }, []);

  // ----------------------------------------------------------------------
  // 🧱 Obtener permisos por rol
  // ----------------------------------------------------------------------
  const fetchPermisosByRol = useCallback(async (rolId) => {
    try {
      return await permisosApi.getPermisosByRol(rolId);
    } catch (err) {
      console.error("❌ Error obteniendo permisos por rol:", err);
      return [];
    }
  }, []);

  // ----------------------------------------------------------------------
  // ✏️ Actualizar permiso
  // ----------------------------------------------------------------------
  const updatePermiso = useCallback(async (permisoId, permisoData) => {
    try {
      return await permisosApi.updatePermiso(permisoId, permisoData);
    } catch (err) {
      console.error("❌ Error actualizando permiso:", err);
      throw err;
    }
  }, []);

  // ----------------------------------------------------------------------
  // 🧪 Verificar salud del módulo
  // ----------------------------------------------------------------------
  const checkHealth = useCallback(async () => {
    try {
      const result = await permisosApi.checkHealth();
      return result?.status || "OK";
    } catch (err) {
      console.warn("⚠️ Módulo de permisos no disponible.");
      return "OFFLINE";
    }
  }, []);

  // ----------------------------------------------------------------------
  // 🔄 Resetear estado (opcional)
  // ----------------------------------------------------------------------
  const resetPermisos = useCallback(() => {
    setPermisos([]);
    setError(null);
    setLoading(false);
  }, []);

  // ----------------------------------------------------------------------
  // 🧩 Retorno del hook
  // ----------------------------------------------------------------------
  return {
    permisos,
    loading,
    error,
    fetchPermisosPorUsuario,
    verificarPermiso,
    fetchPermisosByRol,
    updatePermiso,
    checkHealth,
    resetPermisos,
  };
};

export default usePermisos;