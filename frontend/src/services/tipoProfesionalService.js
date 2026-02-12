// ========================================================================
// tipoProfesionalService.js - Servicio para gestión de tipos profesionales
// ------------------------------------------------------------------------
// CENATE 2025 | Servicio para comunicación con API de tipos profesionales
// ========================================================================

import api from '../lib/apiClient';

const BASE_URL = '/admin/tipos-profesionales';

export const tipoProfesionalService = {
  /**
   * Obtener todos los tipos profesionales
   */
  obtenerTodos: async () => {
    try {
      const data = await api.get(BASE_URL);
      return data;
    } catch (error) {
      console.error('Error al obtener tipos profesionales:', error);
      throw error;
    }
  },

  /**
   * Obtener solo tipos profesionales activos
   */
  obtenerActivos: async () => {
    try {
      const data = await api.get(`${BASE_URL}/activos`);
      return data;
    } catch (error) {
      console.error('Error al obtener tipos profesionales activos:', error);
      throw error;
    }
  },

  /**
   * Obtener tipo profesional por ID
   */
  obtenerPorId: async (id) => {
    try {
      const data = await api.get(`${BASE_URL}/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener tipo profesional ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nuevo tipo profesional
   */
  crear: async (tipoProfesional) => {
    try {
      const data = await api.post(BASE_URL, tipoProfesional);
      return data;
    } catch (error) {
      console.error('Error al crear tipo profesional:', error);
      throw error;
    }
  },

  /**
   * Actualizar tipo profesional existente
   */
  actualizar: async (id, tipoProfesional) => {
    try {
      const data = await api.put(`${BASE_URL}/${id}`, tipoProfesional);
      return data;
    } catch (error) {
      console.error(`Error al actualizar tipo profesional ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar tipo profesional
   */
  eliminar: async (id) => {
    try {
      const data = await api.delete(`${BASE_URL}/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al eliminar tipo profesional ${id}:`, error);
      throw error;
    }
  }
};
