// ========================================================================
// 🛡️ PermisosContext.jsx – Contexto Global de Permisos MBAC (CENATE 2025)
// ------------------------------------------------------------------------
// Centraliza la gestión de permisos para toda la aplicación.
// Proporciona hooks y componentes para control de acceso granular.
// ========================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { apiClient } from "../lib/apiClient";

// ============================================================
// Contexto
// ============================================================
const PermisosContext = createContext(null);

// ============================================================
// Constantes
// ============================================================
const CACHE_KEY = "mbac_permisos_v2";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Acciones disponibles en el sistema
const ACCIONES = {
  VER: "ver",
  CREAR: "crear",
  EDITAR: "editar",
  ELIMINAR: "eliminar",
  EXPORTAR: "exportar",
  APROBAR: "aprobar",
};

// ============================================================
// Provider
// ============================================================
export const PermisosProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [modulos, setModulos] = useState([]);
  const [permisosPorRuta, setPermisosPorRuta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // ============================================================
  // Cache Management
  // ============================================================
  const guardarCache = useCallback((userId, data) => {
    try {
      const cacheData = {
        userId,
        modulos: data.modulos,
        permisosPorRuta: data.permisosPorRuta,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.warn("No se pudo guardar cache de permisos:", err);
    }
  }, []);

  const obtenerCache = useCallback((userId) => {
    try {
      const cacheStr = localStorage.getItem(CACHE_KEY);
      if (!cacheStr) return null;

      const cache = JSON.parse(cacheStr);
      if (cache.userId !== userId) return null;

      const elapsed = Date.now() - cache.timestamp;
      if (elapsed > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return {
        modulos: cache.modulos,
        permisosPorRuta: cache.permisosPorRuta,
      };
    } catch (err) {
      console.warn("Error leyendo cache de permisos:", err);
      return null;
    }
  }, []);

  const limpiarCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
      console.log("Cache de permisos limpiado");
    } catch (err) {
      console.warn("Error limpiando cache:", err);
    }
  }, []);

  // ============================================================
  // Cargar permisos del servidor
  // ============================================================
  const cargarPermisos = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setModulos([]);
      setPermisosPorRuta({});
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Verificar cache primero (si no es refresh forzado)
    if (!forceRefresh) {
      const cached = obtenerCache(user.id);
      if (cached) {
        console.log("Permisos cargados desde cache");
        setModulos(cached.modulos);
        setPermisosPorRuta(cached.permisosPorRuta);
        setLoading(false);
        setInitialized(true);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`Cargando permisos para usuario ID: ${user.id}`);

      // Usar el endpoint del menu-usuario que ya funciona
      const data = await apiClient.get(`/api/menu-usuario/usuario/${user.id}`, true);

      if (!Array.isArray(data)) {
        throw new Error("Respuesta inválida del servidor");
      }

      // Procesar módulos
      const modulosProcesados = data;

      // Crear mapa de permisos por ruta para acceso rápido O(1)
      const mapaPermisos = {};
      data.forEach((modulo) => {
        if (modulo.paginas && Array.isArray(modulo.paginas)) {
          modulo.paginas.forEach((pagina) => {
            const ruta = pagina.ruta || pagina.rutaPagina;
            if (ruta) {
              mapaPermisos[ruta] = {
                moduloId: modulo.idModulo,
                moduloNombre: modulo.nombreModulo,
                paginaId: pagina.idPagina,
                paginaNombre: pagina.nombre || pagina.nombrePagina,
                puedeVer: pagina.puedeVer === true,
                puedeCrear: pagina.puedeCrear === true,
                puedeEditar: pagina.puedeEditar === true,
                puedeEliminar: pagina.puedeEliminar === true,
                puedeExportar: pagina.puedeExportar === true,
                puedeAprobar: pagina.puedeAprobar === true,
              };
            }
          });
        }
      });

      setModulos(modulosProcesados);
      setPermisosPorRuta(mapaPermisos);

      // Guardar en cache
      guardarCache(user.id, {
        modulos: modulosProcesados,
        permisosPorRuta: mapaPermisos,
      });

      console.log(`Permisos cargados: ${Object.keys(mapaPermisos).length} rutas`);
    } catch (err) {
      console.error("Error cargando permisos:", err);
      setError(err.message);
      setModulos([]);
      setPermisosPorRuta({});
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [user?.id, obtenerCache, guardarCache]);

  // Cargar permisos cuando cambia el usuario
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      cargarPermisos();
    } else {
      setModulos([]);
      setPermisosPorRuta({});
      setLoading(false);
      setInitialized(true);
    }
  }, [isAuthenticated, user?.id, cargarPermisos]);

  // ============================================================
  // Verificar si es SuperAdmin/Admin (acceso total)
  // ============================================================
  const esSuperAdmin = useMemo(() => {
    if (!user?.roles) return false;
    const roles = user.roles.map((r) =>
      typeof r === "string"
        ? r.toUpperCase().replace("ROLE_", "")
        : r?.authority?.replace("ROLE_", "").toUpperCase() || ""
    );
    return roles.includes("SUPERADMIN") || roles.includes("ADMIN");
  }, [user?.roles]);

  // ============================================================
  // Verificar permiso por ruta y acción
  // ============================================================
  const tienePermiso = useCallback(
    (ruta, accion) => {
      // SuperAdmin tiene acceso total
      if (esSuperAdmin) return true;

      // Buscar permisos de la ruta
      const permiso = permisosPorRuta[ruta];
      if (!permiso) return false;

      // Verificar la acción específica
      switch (accion?.toLowerCase()) {
        case ACCIONES.VER:
          return permiso.puedeVer;
        case ACCIONES.CREAR:
          return permiso.puedeCrear;
        case ACCIONES.EDITAR:
          return permiso.puedeEditar;
        case ACCIONES.ELIMINAR:
          return permiso.puedeEliminar;
        case ACCIONES.EXPORTAR:
          return permiso.puedeExportar;
        case ACCIONES.APROBAR:
          return permiso.puedeAprobar;
        default:
          return false;
      }
    },
    [esSuperAdmin, permisosPorRuta]
  );

  // ============================================================
  // Obtener todos los permisos de una ruta
  // ============================================================
  const obtenerPermisos = useCallback(
    (ruta) => {
      // SuperAdmin tiene todos los permisos
      if (esSuperAdmin) {
        return {
          puedeVer: true,
          puedeCrear: true,
          puedeEditar: true,
          puedeEliminar: true,
          puedeExportar: true,
          puedeAprobar: true,
        };
      }

      const permiso = permisosPorRuta[ruta];
      if (!permiso) {
        return {
          puedeVer: false,
          puedeCrear: false,
          puedeEditar: false,
          puedeEliminar: false,
          puedeExportar: false,
          puedeAprobar: false,
        };
      }

      return {
        puedeVer: permiso.puedeVer,
        puedeCrear: permiso.puedeCrear,
        puedeEditar: permiso.puedeEditar,
        puedeEliminar: permiso.puedeEliminar,
        puedeExportar: permiso.puedeExportar,
        puedeAprobar: permiso.puedeAprobar,
      };
    },
    [esSuperAdmin, permisosPorRuta]
  );

  // ============================================================
  // Verificar si puede acceder a una ruta (para navegación)
  // ============================================================
  const puedeAcceder = useCallback(
    (ruta) => {
      if (esSuperAdmin) return true;
      const permiso = permisosPorRuta[ruta];
      return permiso?.puedeVer === true;
    },
    [esSuperAdmin, permisosPorRuta]
  );

  // ============================================================
  // Refrescar permisos (forzar recarga desde servidor)
  // ============================================================
  const refrescarPermisos = useCallback(async () => {
    limpiarCache();
    await cargarPermisos(true);
  }, [limpiarCache, cargarPermisos]);

  // ============================================================
  // Obtener módulos agrupados (para sidebar)
  // ============================================================
  const getModulosAgrupados = useCallback(() => {
    const agrupados = {};
    modulos.forEach((modulo) => {
      const titulo = modulo.nombreModulo;
      if (!agrupados[titulo]) {
        agrupados[titulo] = [];
      }
      (modulo.paginas || [])
        .filter((p) => p.puedeVer)
        .forEach((p) => {
          agrupados[titulo].push({
            path: p.ruta || p.rutaPagina,
            pagina: p.nombre || p.nombrePagina,
            permisos: {
              puedeVer: p.puedeVer,
              puedeCrear: p.puedeCrear,
              puedeEditar: p.puedeEditar,
              puedeEliminar: p.puedeEliminar,
              puedeExportar: p.puedeExportar,
              puedeAprobar: p.puedeAprobar,
            },
          });
        });
    });
    return agrupados;
  }, [modulos]);

  // ============================================================
  // Valor del contexto
  // ============================================================
  const value = useMemo(
    () => ({
      // Estado
      modulos,
      permisosPorRuta,
      loading,
      error,
      initialized,
      esSuperAdmin,

      // Métodos de verificación
      tienePermiso,
      obtenerPermisos,
      puedeAcceder,

      // Métodos de gestión
      refrescarPermisos,
      limpiarCache,
      getModulosAgrupados,

      // Constantes
      ACCIONES,
    }),
    [
      modulos,
      permisosPorRuta,
      loading,
      error,
      initialized,
      esSuperAdmin,
      tienePermiso,
      obtenerPermisos,
      puedeAcceder,
      refrescarPermisos,
      limpiarCache,
      getModulosAgrupados,
    ]
  );

  return (
    <PermisosContext.Provider value={value}>
      {children}
    </PermisosContext.Provider>
  );
};

// ============================================================
// Hook principal
// ============================================================
export const usePermisos = () => {
  const context = useContext(PermisosContext);
  if (!context) {
    throw new Error("usePermisos debe usarse dentro de <PermisosProvider>");
  }
  return context;
};

// ============================================================
// Hook para verificar permisos de una ruta específica
// ============================================================
export const usePermisosRuta = (ruta) => {
  const { obtenerPermisos, loading, esSuperAdmin } = usePermisos();

  const permisos = useMemo(() => obtenerPermisos(ruta), [obtenerPermisos, ruta]);

  return {
    ...permisos,
    loading,
    esSuperAdmin,
  };
};

// ============================================================
// Hook simplificado para verificar una acción
// ============================================================
export const useCanPerform = (ruta, accion) => {
  const { tienePermiso, loading, esSuperAdmin } = usePermisos();

  const puede = useMemo(
    () => tienePermiso(ruta, accion),
    [tienePermiso, ruta, accion]
  );

  return { puede, loading, esSuperAdmin };
};

export default PermisosContext;
