// ========================================================================
// estrategiasService.js - Servicio para gestión de estrategias institucionales
// ------------------------------------------------------------------------
// CENATE 2026 | Servicio para comunicación con API de estrategias
// ========================================================================

import api from './apiClient';

const BASE_URL = '/admin/estrategias-institucionales';

export const estrategiasService = {
  /**
   * Obtener todas las estrategias institucionales
   */
  obtenerTodas: async () => {
    try {
      const data = await api.get(BASE_URL);
      return data;
    } catch (error) {
      console.error('Error al obtener estrategias institucionales:', error);
      throw error;
    }
  },

  /**
   * Obtener solo estrategias activas
   */
  obtenerActivas: async () => {
    try {
      const data = await api.get(`${BASE_URL}/activas`);
      return data;
    } catch (error) {
      console.error('Error al obtener estrategias activas:', error);
      throw error;
    }
  },

  /**
   * Obtener estrategia por ID
   */
  obtenerPorId: async (id) => {
    try {
      const data = await api.get(`${BASE_URL}/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener estrategia ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nueva estrategia institucional
   */
  crear: async (estrategia) => {
    try {
      const data = await api.post(BASE_URL, estrategia);
      return data;
    } catch (error) {
      console.error('Error al crear estrategia institucional:', error);
      throw error;
    }
  },

  /**
   * Actualizar estrategia existente
   */
  actualizar: async (id, estrategia) => {
    try {
      const data = await api.put(`${BASE_URL}/${id}`, estrategia);
      return data;
    } catch (error) {
      console.error(`Error al actualizar estrategia ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar estrategia institucional
   */
  eliminar: async (id) => {
    try {
      const data = await api.delete(`${BASE_URL}/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al eliminar estrategia ${id}:`, error);
      throw error;
    }
  }
};
