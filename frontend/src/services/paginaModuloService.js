// ========================================================================
// paginaModuloService.js – Servicio para gestión de Páginas de Módulos MBAC
// ========================================================================
// CRUD completo para páginas del sistema CENATE
// ========================================================================

import apiClient from '../../lib/apiClient';

const BASE_URL = '/mbac/paginas';

export const paginaModuloService = {
  /**
   * Obtener todas las páginas del sistema
   * @returns {Promise<Array>} Lista de páginas
   */
  obtenerTodas: async () => {
    return await apiClient.get(BASE_URL);
  },

  /**
   * Obtener una página por su ID
   * @param {number} id - ID de la página
   * @returns {Promise<Object>} Datos de la página
   */
  obtenerPorId: async (id) => {
    return await apiClient.get(`${BASE_URL}/${id}`);
  },

  /**
   * Crear una nueva página
   * @param {Object} pagina - Datos de la página a crear
   * @param {number} pagina.idModulo - ID del módulo al que pertenece
   * @param {string} pagina.nombrePagina - Nombre de la página
   * @param {string} pagina.rutaPagina - Ruta de la página
   * @param {string} pagina.descripcion - Descripción de la página
   * @param {number} pagina.orden - Orden de visualización
   * @param {boolean} pagina.activo - Estado de la página
   * @returns {Promise<Object>} Página creada
   */
  crear: async (pagina) => {
    return await apiClient.post(BASE_URL, pagina);
  },

  /**
   * Actualizar una página existente
   * @param {number} id - ID de la página a actualizar
   * @param {Object} pagina - Datos actualizados de la página
   * @returns {Promise<Object>} Página actualizada
   */
  actualizar: async (id, pagina) => {
    return await apiClient.put(`${BASE_URL}/${id}`, pagina);
  },

  /**
   * Eliminar una página
   * @param {number} id - ID de la página a eliminar
   * @returns {Promise<void>}
   */
  eliminar: async (id) => {
    return await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Obtener páginas por módulo
   * @param {number} idModulo - ID del módulo
   * @returns {Promise<Array>} Lista de páginas del módulo
   */
  obtenerPorModulo: async (idModulo) => {
    return await apiClient.get(`/mbac/modulos/${idModulo}/paginas`);
  },

  /**
   * Cambiar el estado de una página (activo/inactivo)
   * @param {number} id - ID de la página
   * @param {boolean} activo - Nuevo estado
   * @returns {Promise<Object>} Página actualizada
   */
  cambiarEstado: async (id, activo) => {
    const pagina = await apiClient.get(`${BASE_URL}/${id}`);
    return await apiClient.put(`${BASE_URL}/${id}`, { ...pagina, activo });
  }
};

export default paginaModuloService;
