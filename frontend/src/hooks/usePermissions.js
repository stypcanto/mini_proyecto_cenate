// ========================================================================
// 🎯 usePermissions.js – Sistema MBAC CENATE (versión FINAL corregida)
// ------------------------------------------------------------------------
// Gestiona permisos por ruta/acción según la respuesta del backend MBAC.
// Compatible con ProtectedRoute.jsx, PermissionGate.jsx y Sidebar dinámico.
// Incluye bypass automático para SUPERADMIN y ADMIN.
// ========================================================================

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../lib/apiClient";
import {
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

  // =====================================================
  // 🔹 Roles del usuario (soporta objetos, arrays anidados y strings)
  // =====================================================
  const rolesRaw = user?.roles || [];
  const roles = [];

  for (const r of rolesRaw) {
    if (!r) continue;
    if (typeof r === "string") {
      roles.push(r.toUpperCase());
    } else if (typeof r === "object") {
      if (Array.isArray(r)) {
        r.forEach((sub) => {
          if (typeof sub === "string") roles.push(sub.toUpperCase());
          else if (sub?.authority)
            roles.push(String(sub.authority).toUpperCase());
          else if (sub?.roleName)
            roles.push(String(sub.roleName).toUpperCase());
        });
      } else if (r?.authority) {
        roles.push(String(r.authority).toUpperCase());
      } else if (r?.roleName) {
        roles.push(String(r.roleName).toUpperCase());
      }
    }
  }

  const isSuperOrAdmin = roles.includes("SUPERADMIN") || roles.includes("ADMIN");

  // =====================================================
  // 🔹 1. Cargar permisos reales del backend MBAC
  // =====================================================
  const fetchPermisos = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Cargando permisos desde", `/mbac/permisos-activos/${user.id}`);
      const data = await apiClient.get(`/mbac/permisos-activos/${user.id}`, true);

      if (!Array.isArray(data)) {
        throw new Error("Formato de permisos inválido (no es un array)");
      }

      // 🔁 Normalizar según el formato MBAC (rutaPagina, modulo, acciones)
      const transformed = data
        .map((p) => ({
          path: normalizePath(p.rutaPagina),
          modulo: p.modulo || "general",
          acciones: [
            p.puedeVer && "ver",
            p.puedeCrear && "crear",
            p.puedeEditar && "editar",
            p.puedeEliminar && "eliminar",
            p.puedeExportar && "exportar",
            p.puedeAprobar && "aprobar",
          ].filter(Boolean),
        }))
        // Eliminar duplicados por path + acciones
        .filter(
          (p, i, arr) =>
            arr.findIndex(
              (q) => q.path === p.path && q.acciones.join() === p.acciones.join()
            ) === i
        );

      setPermisos(transformed);
    } catch (err) {
      console.error("❌ Error cargando permisos:", err);
      setError(err.message || "Error al cargar permisos");
      if (String(err?.message).includes("401")) logout();
      setPermisos([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, logout]);

  // =====================================================
  // 🔹 2. Recargar al cambiar usuario autenticado
  // =====================================================
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchPermisos();
    } else {
      setPermisos([]);
    }
  }, [isAuthenticated, user, fetchPermisos]);

  // =====================================================
  // 🔹 3. Verificar permiso por ruta + acción
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
    permisos,            // Permisos normalizados [{path, acciones[], modulo}]
    loading,             // Estado de carga
    error,               // Mensaje de error
    tienePermiso,        // Verifica permiso por ruta/acción
    verificarPermiso,    // Alias para compatibilidad
    getRutasPermitidas,  // Rutas filtradas por acción
    getModulosAgrupados, // Agrupadas por módulo
    refetch: fetchPermisos, // Recarga manual
  };
};