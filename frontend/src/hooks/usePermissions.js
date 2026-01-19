// ========================================================================
// usePermissions.js - Hook para gestionar permisos RBAC
// ========================================================================
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';

/**
 * Hook personalizado para gestionar permisos del usuario
 * @param {number} userId - ID del usuario
 * @returns {Object} - { permisos, loading, error, refetch, getModulosConDetalle }
 */
export const usePermissions = (userId) => {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modulos, setModulos]= useState([]);

  const fetchPermisos = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`Cargando permisos para usuario ID: ${userId}`);

      const datos = await apiClient.get(`/api/menu-usuario/usuario/${userId}`, true)

      console.log('Permisos cargados:', datos?.length || 0);
      setModulos(Array.isArray(datos)? datos:[]);
      setPermisos(datos || []);
    } catch (err) {
      console.error('Error cargando permisos:', err.message);
      setError(err);
      setPermisos([]);
      setModulos([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPermisos();
  }, [fetchPermisos]);

  // Retorna modulos agrupados (formato simplificado para compatibilidad)
  const getModulosAgrupados = useCallback(()=>{
    const agrupados = {};
    modulos.forEach((x) =>{
      const titulo = x.nombreModulo;
      if (!agrupados[titulo]){
        agrupados[titulo] = [];
      }
      (x.paginas || [])
        .filter((p) => p.puedeVer || p.puede_ver)
        .forEach((p)=> {
          agrupados[titulo].push({
            path: p.ruta,
            pagina: p.nombre
          })
        });
    });
    return agrupados;
  }, [modulos]);

  // Retorna modulos con detalles completos (icono, descripcion, paginas con permisos)
  const getModulosConDetalle = useCallback(() => {
    return modulos.map((m) => ({
      idModulo: m.idModulo,
      nombreModulo: m.nombreModulo,
      descripcion: m.descripcion,
      icono: m.icono,
      rutaBase: m.rutaBase,
      orden: m.orden,
      paginas: (m.paginas || [])
        .filter((p) => p.puedeVer || p.puede_ver)
        .map((p) => ({
          idPagina: p.id_pagina || p.idPagina,
          id_pagina: p.id_pagina || p.idPagina,
          nombre: p.nombre,
          ruta: p.ruta,
          orden: p.orden,
          puedeVer: p.puedeVer || p.puede_ver || false,
          puedeCrear: p.puedeCrear || p.puede_crear || false,
          puedeEditar: p.puedeEditar || p.puede_editar || false,
          puedeEliminar: p.puedeEliminar || p.puede_eliminar || false,
          puedeExportar: p.puedeExportar || p.puede_exportar || false,
          puedeImportar: p.puedeImportar || p.puede_importar || false,
          puedeAprobar: p.puedeAprobar || p.puede_aprobar || false,
          subpaginas: p.subpaginas || null,
        }))
    })).filter(m => m.paginas.length > 0);
  }, [modulos]);

  return {
    modulos,
    loading,
    error,
    refetch: fetchPermisos,
    getModulosAgrupados,
    getModulosConDetalle
  };
};

/**
 * Hook para verificar si el usuario tiene un permiso específico
 * @param {number} userId - ID del usuario
 * @param {string} moduloNombre - Nombre del módulo
 * @param {string} paginaNombre - Nombre de la página
 * @param {string} accionNombre - Nombre de la acción
 * @returns {boolean} - true si tiene el permiso, false si no
 */
export const useHasPermission = (userId, moduloNombre, paginaNombre, accionNombre) => {
  const { permisos, loading } = usePermissions(userId);

  if (loading || !permisos.length) return false;

  return permisos.some(p => 
    p.moduloNombre === moduloNombre &&
    p.paginaNombre === paginaNombre &&
    p.accionNombre === accionNombre &&
    p.estado === true
  );
};

export default usePermissions;
