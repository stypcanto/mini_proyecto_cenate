// ========================================================================
// tiposAtencionService.js - Servicio para gestión de tipos de atención telemedicina
// ------------------------------------------------------------------------
// CENATE 2026 | Servicio para comunicación con API de tipos de atención
// ========================================================================

import api from '../lib/apiClient';

const BASE_URL = '/admin/tipos-atencion-telemedicina';

export const tiposAtencionService = {
  /**
   * Obtener todos los tipos de atención
   */
  obtenerTodos: async () => {
    try {
      const data = await api.get(BASE_URL, true);
      return data;
    } catch (error) {
      console.error('Error al obtener tipos de atención:', error);
      throw error;
    }
  },

  /**
   * Obtener solo tipos de atención activos
   */
  obtenerActivos: async () => {
    try {
      const data = await api.get(`${BASE_URL}/activos`, true);
      return data;
    } catch (error) {
      console.error('Error al obtener tipos de atención activos:', error);
      throw error;
    }
  },

  /**
   * Obtener tipo de atención por ID
   */
  obtenerPorId: async (id) => {
    try {
      const data = await api.get(`${BASE_URL}/${id}`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener tipo de atención ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nuevo tipo de atención
   */
  crear: async (tipoAtencion) => {
    try {
      const data = await api.post(BASE_URL, tipoAtencion, true);
      return data;
    } catch (error) {
      console.error('Error al crear tipo de atención:', error);
      throw error;
    }
  },

  /**
   * Actualizar tipo de atención existente
   */
  actualizar: async (id, tipoAtencion) => {
    try {
      const data = await api.put(`${BASE_URL}/${id}`, tipoAtencion, true);
      return data;
    } catch (error) {
      console.error(`Error al actualizar tipo de atención ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar tipo de atención
   */
  eliminar: async (id) => {
    try {
      const data = await api.delete(`${BASE_URL}/${id}`, true);
      return data;
    } catch (error) {
      console.error(`Error al eliminar tipo de atención ${id}:`, error);
      throw error;
    }
  }
};
