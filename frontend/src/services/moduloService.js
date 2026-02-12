// ========================================================================
// moduloService.js – Servicio para gestión de Módulos del Sistema MBAC
// ========================================================================
// CRUD completo para módulos del sistema CENATE
// ========================================================================

import apiClient from '../../lib/apiClient';

const BASE_URL = '/mbac/modulos';

export const moduloService = {
  /**
   * Obtener todos los módulos del sistema
   * @returns {Promise<Array>} Lista de módulos
   */
  obtenerTodos: async () => {
    return await apiClient.get(BASE_URL);
  },

  /**
   * Obtener un módulo por su ID
   * @param {number} id - ID del módulo
   * @returns {Promise<Object>} Datos del módulo
   */
  obtenerPorId: async (id) => {
    return await apiClient.get(`${BASE_URL}/${id}`);
  },

  /**
   * Crear un nuevo módulo
   * @param {Object} modulo - Datos del módulo a crear
   * @param {string} modulo.nombreModulo - Nombre del módulo
   * @param {string} modulo.descripcion - Descripción del módulo
   * @param {string} modulo.rutaBase - Ruta base del módulo
   * @param {boolean} modulo.activo - Estado del módulo
   * @param {number} modulo.orden - Orden de visualización
   * @returns {Promise<Object>} Módulo creado
   */
  crear: async (modulo) => {
    return await apiClient.post(BASE_URL, modulo);
  },

  /**
   * Actualizar un módulo existente
   * @param {number} id - ID del módulo a actualizar
   * @param {Object} modulo - Datos actualizados del módulo
   * @returns {Promise<Object>} Módulo actualizado
   */
  actualizar: async (id, modulo) => {
    return await apiClient.put(`${BASE_URL}/${id}`, modulo);
  },

  /**
   * Eliminar un módulo
   * @param {number} id - ID del módulo a eliminar
   * @returns {Promise<void>}
   */
  eliminar: async (id) => {
    return await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Cambiar el estado de un módulo (activo/inactivo)
   * @param {number} id - ID del módulo
   * @param {boolean} activo - Nuevo estado
   * @returns {Promise<Object>} Módulo actualizado
   */
  cambiarEstado: async (id, activo) => {
    const modulo = await apiClient.get(`${BASE_URL}/${id}`);
    return await apiClient.put(`${BASE_URL}/${id}`, { ...modulo, activo });
  }
};

export default moduloService;
