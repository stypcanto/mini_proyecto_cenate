// ========================================================================
// disponibilidadService.js - Servicio para gestión de disponibilidad médica
// ------------------------------------------------------------------------
// CENATE 2026 | Servicio para comunicación con API de disponibilidad
// ========================================================================

import api from './apiClient';

const BASE_URL = '/disponibilidad';

export const disponibilidadService = {
  /**
   * Crear nueva disponibilidad médica
   * @param {Object} data - { periodo, idServicio, detalles: [{fecha, turno}] }
   * @returns {Promise} Disponibilidad creada
   */
  crearDisponibilidad: async (data) => {
    try {
      const response = await api.post(BASE_URL, data);
      // La API retorna {data: {...}, status: 200}, extraer solo data
      return response.data || response;
    } catch (error) {
      console.error('Error al crear disponibilidad:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las disponibilidades del médico autenticado
   * @returns {Promise} Lista de disponibilidades del médico
   */
  obtenerMisDisponibilidades: async () => {
    try {
      const response = await api.get(`${BASE_URL}/mis-disponibilidades`);
      // La API retorna {data: {...}, status: 200}, extraer solo data
      return response.data || response;
    } catch (error) {
      console.error('Error al obtener mis disponibilidades:', error);
      throw error;
    }
  },

  /**
   * Obtener disponibilidad por ID
   * @param {number} id - ID de la disponibilidad
   * @returns {Promise} Disponibilidad con detalles
   */
  obtenerDisponibilidad: async (id) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`);
      // La API retorna {data: {...}, status: 200}, extraer solo data
      return response.data || response;
    } catch (error) {
      console.error(`Error al obtener disponibilidad ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar disponibilidad completa
   * @param {number} id - ID de la disponibilidad
   * @param {Object} data - { periodo, idServicio, detalles: [{fecha, turno}] }
   * @returns {Promise} Disponibilidad actualizada
   */
  actualizarDisponibilidad: async (id, data) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, data);
      return response.data || response;
    } catch (error) {
      console.error(`Error al actualizar disponibilidad ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar turno de un día específico (DEPRECATED - usar actualizarDisponibilidad)
   * @param {number} id - ID de la disponibilidad
   * @param {Object} data - { fecha, turno } donde turno puede ser 'M', 'T', 'MT' o null
   * @returns {Promise} Disponibilidad actualizada
   */
  actualizarTurno: async (id, data) => {
    try {
      const result = await api.put(`${BASE_URL}/${id}/detalles`, data);
      return result;
    } catch (error) {
      console.error(`Error al actualizar turno en disponibilidad ${id}:`, error);
      throw error;
    }
  },

  /**
   * Enviar disponibilidad a revisión (cambia estado BORRADOR → ENVIADO)
   * @param {number} id - ID de la disponibilidad
   * @returns {Promise} Disponibilidad actualizada
   */
  enviarDisponibilidad: async (id) => {
    try {
      const result = await api.post(`${BASE_URL}/${id}/enviar`);
      return result;
    } catch (error) {
      console.error(`Error al enviar disponibilidad ${id}:`, error);
      throw error;
    }
  },

  /**
   * Calcular horas de una disponibilidad sin guardarla
   * @param {Object} data - { periodo, idServicio, detalles: [{fecha, turno}] }
   * @returns {Promise} Cálculo de horas (asistenciales, sanitarias, total)
   */
  calcularHoras: async (data) => {
    try {
      const result = await api.post(`${BASE_URL}/calcular-horas`, data);
      return result;
    } catch (error) {
      console.error('Error al calcular horas:', error);
      throw error;
    }
  },

  /**
   * Obtener disponibilidad actual del período activo
   * @param {string} periodo - Periodo en formato YYYYMM (ej: '202601')
   * @returns {Promise} Disponibilidad del periodo con detalles completos o null si no existe
   */
  obtenerPorPeriodo: async (periodo) => {
    try {
      const response = await api.get(`${BASE_URL}/mis-disponibilidades`);
      // La API retorna {data: {content: [...], pageable: ...}, status: 200}
      const disponibilidades = response.data?.content || [];
      // Filtrar por periodo
      const disponibilidadResumen = disponibilidades.find(d => d.periodo === periodo);

      // Si encontramos la disponibilidad, obtener detalles completos
      if (disponibilidadResumen) {
        const disponibilidadCompleta = await this.obtenerDisponibilidad(disponibilidadResumen.idDisponibilidad);
        return disponibilidadCompleta;
      }

      return null;
    } catch (error) {
      console.error(`Error al obtener disponibilidad del periodo ${periodo}:`, error);
      throw error;
    }
  }
};
