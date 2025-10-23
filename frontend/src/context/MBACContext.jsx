// ========================================================================
// 🎯 MBACContext.jsx – Sistema MBAC CENATE (Mejorado y Completo)
// ------------------------------------------------------------------------
// Gestiona permisos modulares usando el backend MBAC real
// Endpoints: /api/mbac/permisos-activos/{idUser} y /api/mbac/permisos/verificar
// ========================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { apiClient } from "../lib/apiClient";
import toast from "react-hot-toast";

const MBACContext = createContext(null);

export const MBACProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Estados
  const [permisos, setPermisos] = useState([]);
  const [permisosMap, setPermisosMap] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Roles del usuario
  const roles = useMemo(() => (user?.roles || []).map((r) => r.toUpperCase()), [user]);
  const isSuperOrAdmin = useMemo(
    () => roles.includes("SUPERADMIN") || roles.includes("ADMIN"),
    [roles]
  );

  // ============================================================
  // 🔹 1. Cargar permisos activos del usuario
  // ============================================================
  const cargarPermisos = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setPermisos([]);
      setPermisosMap(new Map());
      setInitialized(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Endpoint correcto del backend MBAC
      const data = await apiClient.get(`/mbac/permisos-activos/${user.id}`, true);

      if (!Array.isArray(data)) {
        throw new Error("Formato de permisos inválido");
      }

      // Normalizar rutas
      const permisosNormalizados = data.map((p) => ({
        ...p,
        rutaPagina: normalizarRuta(p.rutaPagina),
      }));

      // Crear mapa para acceso rápido: ruta -> permisos
      const map = new Map();
      permisosNormalizados.forEach((p) => {
        map.set(p.rutaPagina, {
          idPagina: p.idPagina,
          nombrePagina: p.nombrePagina,
          modulo: p.modulo,
          puedeVer: p.puedeVer ?? false,
          puedeCrear: p.puedeCrear ?? false,
          puedeEditar: p.puedeEditar ?? false,
          puedeEliminar: p.puedeEliminar ?? false,
          puedeExportar: p.puedeExportar ?? false,
          puedeAprobar: p.puedeAprobar ?? false,
        });
      });

      setPermisos(permisosNormalizados);
      setPermisosMap(map);
      setInitialized(true);
      
      console.log(`✅ Permisos MBAC cargados: ${permisosNormalizados.length} páginas`);
    } catch (err) {
      console.error("❌ Error cargando permisos MBAC:", err);
      setError(err.message || "Error al cargar permisos");
      setPermisos([]);
      setPermisosMap(new Map());
      setInitialized(true);
      
      if (err.message?.includes("401") || err.message?.includes("403")) {
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // ============================================================
  // 🔹 2. Efecto: cargar permisos al autenticarse
  // ============================================================
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      cargarPermisos();
    } else {
      setPermisos([]);
      setPermisosMap(new Map());
      setInitialized(true);
    }
  }, [isAuthenticated, user?.id, cargarPermisos]);

  // ============================================================
  // 🔹 3. Verificar permiso por ruta y acción
  // ============================================================
  const tienePermiso = useCallback(
    (rutaPagina, accion = "ver") => {
      // 🚀 Bypass total para SUPERADMIN y ADMIN
      if (isSuperOrAdmin) return true;

      if (!initialized || loading) return false;

      const ruta = normalizarRuta(rutaPagina);
      const permisosPagina = permisosMap.get(ruta);

      if (!permisosPagina) {
        console.warn(`⚠️ No se encontraron permisos para la ruta: ${ruta}`);
        return false;
      }

      const accionNormalizada = accion.toLowerCase();
      const mapaAcciones = {
        ver: permisosPagina.puedeVer,
        crear: permisosPagina.puedeCrear,
        editar: permisosPagina.puedeEditar,
        eliminar: permisosPagina.puedeEliminar,
        exportar: permisosPagina.puedeExportar,
        aprobar: permisosPagina.puedeAprobar,
      };

      return mapaAcciones[accionNormalizada] ?? false;
    },
    [initialized, loading, permisosMap, isSuperOrAdmin]
  );

  // ============================================================
  // 🔹 4. Verificar permiso con backend (opcional, para mayor seguridad)
  // ============================================================
  const verificarPermisoBackend = useCallback(
    async (rutaPagina, accion = "ver") => {
      if (isSuperOrAdmin) return true;
      if (!user?.id) return false;

      try {
        const response = await apiClient.post(
          "/mbac/permisos/verificar",
          {
            idUser: user.id,
            rutaPagina: normalizarRuta(rutaPagina),
            accion: accion.toLowerCase(),
          },
          true
        );

        return response?.permitido === true;
      } catch (err) {
        console.error("Error verificando permiso en backend:", err);
        return false;
      }
    },
    [user, isSuperOrAdmin]
  );

  // ============================================================
  // 🔹 5. Obtener rutas permitidas filtradas
  // ============================================================
  const obtenerRutasPermitidas = useCallback(() => {
    if (isSuperOrAdmin) {
      // Retornar todas las rutas disponibles para admin
      return Array.from(permisosMap.keys());
    }

    return permisos
      .filter((p) => p.puedeVer === true)
      .map((p) => p.rutaPagina);
  }, [permisos, permisosMap, isSuperOrAdmin]);

  // ============================================================
  // 🔹 6. Agrupar permisos por módulo
  // ============================================================
  const obtenerModulos = useCallback(() => {
    const modulos = new Map();

    permisos.forEach((p) => {
      if (!modulos.has(p.modulo)) {
        modulos.set(p.modulo, []);
      }
      modulos.get(p.modulo).push(p);
    });

    return Array.from(modulos.entries()).map(([nombre, paginas]) => ({
      nombre,
      paginas: paginas.filter((p) => p.puedeVer === true),
    }));
  }, [permisos]);

  // ============================================================
  // 🔹 7. Obtener permisos de una página específica
  // ============================================================
  const obtenerPermisosPagina = useCallback(
    (rutaPagina) => {
      const ruta = normalizarRuta(rutaPagina);
      return permisosMap.get(ruta) || null;
    },
    [permisosMap]
  );

  // ============================================================
  // 🔹 8. Valor del contexto
  // ============================================================
  const value = useMemo(
    () => ({
      // Estados
      permisos,
      loading,
      error,
      initialized,
      
      // Funciones principales
      tienePermiso,
      verificarPermisoBackend,
      obtenerRutasPermitidas,
      obtenerModulos,
      obtenerPermisosPagina,
      cargarPermisos,
      
      // Información adicional
      isSuperOrAdmin,
      totalPaginas: permisos.length,
    }),
    [
      permisos,
      loading,
      error,
      initialized,
      tienePermiso,
      verificarPermisoBackend,
      obtenerRutasPermitidas,
      obtenerModulos,
      obtenerPermisosPagina,
      cargarPermisos,
      isSuperOrAdmin,
    ]
  );

  return <MBACContext.Provider value={value}>{children}</MBACContext.Provider>;
};

// ============================================================
// 🔹 9. Hook personalizado
// ============================================================
export const useMBAC = () => {
  const context = useContext(MBACContext);
  if (!context) {
    throw new Error("usMBAC debe usarse dentro de <MBACProvider>");
  }
  return context;
};

// ============================================================
// 🔧 Utilidades
// ============================================================
function normalizarRuta(ruta) {
  if (!ruta) return "/";
  const rutaLimpia = ("/" + String(ruta).trim().replace(/^\/+/, ""))
    .toLowerCase()
    .replace(/\/$/, "");
  return rutaLimpia || "/";
}

export default MBACContext;
