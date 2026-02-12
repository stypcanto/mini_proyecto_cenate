// ========================================================================
// disponibilidadService.js - Servicio para gestión de disponibilidad médica
// ------------------------------------------------------------------------
// CENATE 2026 | Servicio para comunicación con API de disponibilidad
// ========================================================================

import api from '../../lib/apiClient';

const BASE_URL = '/solicitudes-disponibilidad';

export const disponibilidadService = {
  /**
   * Crear nueva solicitud de disponibilidad médica
   * @param {Object} data - { idPeriodo, observaciones, detalles: [{fecha, turno, idHorario}] }
   * @returns {Promise} Solicitud creada
   */
  crearSolicitud: async (data) => {
    try {
      const response = await api.post(BASE_URL, data);
      return response.data || response;
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las solicitudes del médico autenticado
   * @returns {Promise} Lista de solicitudes del médico
   */
  obtenerMisSolicitudes: async () => {
    try {
      const response = await api.get(`${BASE_URL}/mis-solicitudes`);
      return response.data || response;
    } catch (error) {
      console.error('Error al obtener mis solicitudes:', error);
      throw error;
    }
  },

  /**
   * Obtener solicitud por ID
   * @param {number} id - ID de la solicitud
   * @returns {Promise} Solicitud con detalles
   */
  obtenerSolicitud: async (id) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`);
      return response.data || response;
    } catch (error) {
      console.error(`Error al obtener solicitud ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar solicitud (solo en estado BORRADOR)
   * @param {number} id - ID de la solicitud
   * @param {Object} data - { idPeriodo, observaciones, detalles: [{fecha, turno, idHorario}] }
   * @returns {Promise} Solicitud actualizada
   */
  actualizarSolicitud: async (id, data) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, data);
      return response.data || response;
    } catch (error) {
      console.error(`Error al actualizar solicitud ${id}:`, error);
      throw error;
    }
  },

  /**
   * Enviar solicitud a revisión (cambia estado BORRADOR → ENVIADO)
   * @param {number} id - ID de la solicitud
   * @returns {Promise} Solicitud actualizada
   */
  enviarSolicitud: async (id) => {
    try {
      const response = await api.post(`${BASE_URL}/${id}/enviar`);
      return response.data || response;
    } catch (error) {
      console.error(`Error al enviar solicitud ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener solicitud del período actual
   * @returns {Promise} Solicitud del periodo actual o null si no existe
   */
  obtenerSolicitudPeriodoActual: async () => {
    try {
      const response = await api.get(`${BASE_URL}/periodo-actual`);
      return response.data || response;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No hay solicitud activa
      }
      console.error('Error al obtener solicitud del periodo actual:', error);
      throw error;
    }
  },

  /**
   * Obtener solicitudes por período
   * @param {number} idPeriodo - ID del período
   * @returns {Promise} Lista de solicitudes del período
   */
  obtenerSolicitudesPorPeriodo: async (idPeriodo) => {
    try {
      const response = await api.get(`${BASE_URL}/periodo/${idPeriodo}`);
      return response.data || response;
    } catch (error) {
      console.error(`Error al obtener solicitudes del periodo ${idPeriodo}:`, error);
      throw error;
    }
  },

  /**
   * Obtener todos los períodos
   * @returns {Promise} Lista de períodos
   */
  obtenerPeriodos: async () => {
    try {
      const response = await api.get('/periodos-medicos-disponibilidad');
      return response.data || response;
    } catch (error) {
      console.error('Error al obtener periodos:', error);
      throw error;
    }
  },

  /**
   * Guardar solicitud en estado BORRADOR (para compatibilidad con código antiguo)
   * @param {Object} data - Datos de la solicitud
   * @returns {Promise} Solicitud creada
   */
  guardarBorrador: async (data) => {
    return disponibilidadService.crearSolicitud(data);
  },

  /**
   * Listar todas mis solicitudes (para compatibilidad)
   * @returns {Promise} Lista de solicitudes
   */
  listarMisSolicitudes: async () => {
    return disponibilidadService.obtenerMisSolicitudes();
  },

  /**
   * Actualizar solicitud (para compatibilidad - usa nombre antiguo)
   * @param {number} id - ID de la solicitud
   * @param {Object} data - Datos a actualizar
   * @returns {Promise} Solicitud actualizada
   */
  actualizar: async (id, data) => {
    return disponibilidadService.actualizarSolicitud(id, data);
  },

  /**
   * Enviar solicitud (para compatibilidad - usa nombre antiguo)
   * @param {number} id - ID de la solicitud
   * @returns {Promise} Solicitud enviada
   */
  enviar: async (id) => {
    return disponibilidadService.enviarSolicitud(id);
  },

  /**
   * Eliminar solicitud en estado BORRADOR (para compatibilidad)
   * @param {number} id - ID de la solicitud
   * @returns {Promise} Resultado de la eliminación
   */
  eliminar: async (id) => {
    try {
      const response = await api.delete(`${BASE_URL}/${id}`);
      return response.data || response;
    } catch (error) {
      console.error(`Error al eliminar solicitud ${id}:`, error);
      throw error;
    }
  }
};
