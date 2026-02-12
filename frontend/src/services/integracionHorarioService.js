// ========================================================================
// integracionHorarioService.js - Servicio para sincronización de horarios
// ------------------------------------------------------------------------
// CENATE 2026 | Servicio para comunicación con API de integración chatbot
// ========================================================================

import api from '../lib/apiClient';

const BASE_URL = '/integracion-horario';

export const integracionHorarioService = {
  /**
   * Sincronizar disponibilidad a horario chatbot
   * @param {Object} data - { idDisponibilidad, idArea }
   * @returns {Promise} Resultado de la sincronización
   */
  sincronizar: async (data) => {
    try {
      const result = await api.post(`${BASE_URL}/sincronizar`, data);
      return result;
    } catch (error) {
      console.error('Error al sincronizar:', error);
      throw error;
    }
  },

  /**
   * Obtener comparativo de una disponibilidad específica
   * @param {number} id - ID de la disponibilidad
   * @returns {Promise} Comparativo disponibilidad vs horario
   */
  obtenerComparativo: async (id) => {
    try {
      const data = await api.get(`${BASE_URL}/comparativo/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener comparativo ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener todos los comparativos de un periodo
   * @param {string} periodo - Periodo en formato YYYYMM (ej: '202601')
   * @returns {Promise} Lista de comparativos del periodo
   */
  obtenerComparativosPorPeriodo: async (periodo) => {
    try {
      const data = await api.get(`${BASE_URL}/comparativo/periodo/${periodo}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener comparativos del periodo ${periodo}:`, error);
      throw error;
    }
  },

  /**
   * Obtener historial de sincronizaciones de una disponibilidad
   * @param {number} id - ID de la disponibilidad
   * @returns {Promise} Historial de sincronizaciones
   */
  obtenerHistorial: async (id) => {
    try {
      const data = await api.get(`${BASE_URL}/historial/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener historial ${id}:`, error);
      throw error;
    }
  },

  /**
   * Verificar si una disponibilidad puede sincronizarse
   * @param {number} id - ID de la disponibilidad
   * @returns {Promise} { puedeSincronizar: boolean, motivo: string }
   */
  verificarPuedeSincronizar: async (id) => {
    try {
      const data = await api.get(`${BASE_URL}/puede-sincronizar/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al verificar sincronización ${id}:`, error);
      throw error;
    }
  }
};
