// ========================================================================
// 🔐 usePermissions.js - Hook para gestionar permisos MBAC
// ========================================================================
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';
import { data } from 'react-router-dom';

/**
 * Hook personalizado para gestionar permisos del usuario
 * @param {number} userId - ID del usuario
 * @returns {Object} - { permisos, loading, error, refetch }
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
      console.log(`🔍 Cargando permisos para usuario ID: ${userId}`);
      
      // ✅ RUTA CORREGIDA: /api/permisos/usuario/{id} (SIN /mbac/)
      // Usar el apiClient con auth=true (segundo parámetro)
      //const response = await apiClient.get(`/permisos/usuario/${userId}`, true);
      const datos = await apiClient.get(`/api/menu-usuario/usuario/${userId}`, true)

      console.log('✅ Permisos cargados:', datos.length);
      setModulos(Array.isArray(datos)? datos:[]);
      setPermisos(datos || []);
    } catch (err) {
      console.error('❌ Error cargando permisos:', err.message);
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


  const getModulosAgrupados = useCallback(()=>{
    const agrupados = {};
    console.log(modulos);
    modulos.forEach((x) =>{

      const titulo = x.nombreModulo;
      const base   = x.rutaBase;
      if (!agrupados[titulo]){
        agrupados[titulo] = [];
      }
      (x.paginas || [])
        .filter(  (p) => p.puedeVer)
        .forEach((p)=> {
          agrupados[titulo].push({
            //path: `${base}${p.ruta}`,
            path: p.ruta,
            pagina: p.nombre
          })
        });
    });
    return agrupados;
  }, [modulos]);


  return {
    modulos,
    loading,
    error,
    refetch: fetchPermisos,
    getModulosAgrupados
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
