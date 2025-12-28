/**
 * 🔧 Servicio API para gestión de disponibilidad de turnos médicos
 *
 * Proporciona métodos para:
 * - MÉDICO: Crear, actualizar, enviar y consultar disponibilidades
 * - COORDINADOR: Revisar, ajustar turnos y marcar como revisado
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */

import api from './apiClient';

const BASE_URL = '/disponibilidad';

const disponibilidadService = {
  // ==========================================================
  // MÉTODOS PARA MÉDICO - CONSULTAS
  // ==========================================================

  /**
   * Lista todas las disponibilidades del médico autenticado
   * @returns {Promise<Array>} Lista de disponibilidades
   */
  listarMisDisponibilidades: async () => {
    try {
      const response = await api.get(`${BASE_URL}/mis-disponibilidades`);
      return response;
    } catch (error) {
      console.error('Error al listar disponibilidades:', error);
      throw error;
    }
  },

  /**
   * Obtiene la disponibilidad del médico para un periodo y especialidad
   * @param {string} periodo - Periodo en formato YYYYMM (ej: "202601")
   * @param {number} idEspecialidad - ID de la especialidad
   * @returns {Promise<Object|null>} Disponibilidad o null si no existe
   */
  obtenerMiDisponibilidad: async (periodo, idEspecialidad) => {
    try {
      const response = await api.get(`${BASE_URL}/mi-disponibilidad`, {
        params: { periodo, idEspecialidad }
      });
      return response;
    } catch (error) {
      if (error.response?.status === 204) {
        return null; // No existe disponibilidad
      }
      console.error('Error al obtener disponibilidad:', error);
      throw error;
    }
  },

  /**
   * Obtiene una disponibilidad por su ID
   * @param {number} id - ID de la disponibilidad
   * @returns {Promise<Object>} Disponibilidad
   */
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`);
      return response;
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      throw error;
    }
  },

  // ==========================================================
  // MÉTODOS PARA MÉDICO - CREAR Y ACTUALIZAR
  // ==========================================================

  /**
   * Crea una nueva disponibilidad
   * @param {Object} request - Datos de la disponibilidad
   * @param {string} request.periodo - Periodo YYYYMM
   * @param {number} request.idEspecialidad - ID especialidad
   * @param {string} request.observaciones - Observaciones
   * @param {Array} request.detalles - Lista de turnos
   * @returns {Promise<Object>} Disponibilidad creada
   */
  crear: async (request) => {
    try {
      const response = await api.post(BASE_URL, request);
      return response;
    } catch (error) {
      console.error('Error al crear disponibilidad:', error);
      throw error;
    }
  },

  /**
   * Guarda o actualiza un borrador de disponibilidad
   * Si ya existe, lo actualiza. Si no existe, lo crea.
   * @param {Object} request - Datos del borrador
   * @returns {Promise<Object>} Borrador guardado
   */
  guardarBorrador: async (request) => {
    try {
      const response = await api.post(`${BASE_URL}/borrador`, request);
      return response;
    } catch (error) {
      console.error('Error al guardar borrador:', error);
      throw error;
    }
  },

  /**
   * Actualiza una disponibilidad existente
   * @param {number} id - ID de la disponibilidad
   * @param {Object} request - Datos actualizados
   * @returns {Promise<Object>} Disponibilidad actualizada
   */
  actualizar: async (id, request) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, request);
      return response;
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      throw error;
    }
  },

  /**
   * Envía una disponibilidad para revisión del coordinador
   * Valida que cumpla el mínimo de 150 horas
   * @param {number} id - ID de la disponibilidad
   * @returns {Promise<Object>} Disponibilidad enviada
   */
  enviar: async (id) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}/enviar`);
      return response;
    } catch (error) {
      console.error('Error al enviar disponibilidad:', error);
      throw error;
    }
  },

  /**
   * Valida las horas de una disponibilidad
   * @param {number} id - ID de la disponibilidad
   * @returns {Promise<Object>} Objeto con totalHoras, horasRequeridas, cumpleMinimo, horasFaltantes
   */
  validarHoras: async (id) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}/validar-horas`);
      return response;
    } catch (error) {
      console.error('Error al validar horas:', error);
      throw error;
    }
  },

  /**
   * Elimina una disponibilidad (solo BORRADOR)
   * @param {number} id - ID de la disponibilidad
   * @returns {Promise<void>}
   */
  eliminar: async (id) => {
    try {
      await api.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error('Error al eliminar disponibilidad:', error);
      throw error;
    }
  },

  // ==========================================================
  // MÉTODOS PARA COORDINADOR - CONSULTAS
  // ==========================================================

  /**
   * Lista todas las disponibilidades de un periodo
   * Solo para COORDINADOR/ADMIN
   * @param {string} periodo - Periodo YYYYMM
   * @returns {Promise<Array>} Lista de disponibilidades
   */
  listarPorPeriodo: async (periodo) => {
    try {
      const response = await api.get(`${BASE_URL}/periodo/${periodo}`);
      return response;
    } catch (error) {
      console.error('Error al listar por periodo:', error);
      throw error;
    }
  },

  /**
   * Lista solo las disponibilidades ENVIADAS de un periodo
   * @param {string} periodo - Periodo YYYYMM
   * @returns {Promise<Array>} Lista de disponibilidades enviadas
   */
  listarEnviadas: async (periodo) => {
    try {
      const response = await api.get(`${BASE_URL}/periodo/${periodo}/enviadas`);
      return response;
    } catch (error) {
      console.error('Error al listar enviadas:', error);
      throw error;
    }
  },

  // ==========================================================
  // MÉTODOS PARA COORDINADOR - REVISIÓN
  // ==========================================================

  /**
   * Marca una disponibilidad como REVISADO
   * @param {number} id - ID de la disponibilidad
   * @returns {Promise<Object>} Disponibilidad revisada
   */
  marcarRevisado: async (id) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}/revisar`);
      return response;
    } catch (error) {
      console.error('Error al marcar como revisado:', error);
      throw error;
    }
  },

  /**
   * Ajusta un turno específico de una disponibilidad
   * @param {number} id - ID de la disponibilidad
   * @param {Object} request - Datos del ajuste
   * @param {number} request.idDetalle - ID del detalle a ajustar
   * @param {string} request.nuevoTurno - Nuevo turno (M, T, MT)
   * @param {string} request.observacion - Observación del ajuste
   * @returns {Promise<Object>} Disponibilidad actualizada
   */
  ajustarTurno: async (id, request) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}/ajustar-turno`, request);
      return response;
    } catch (error) {
      console.error('Error al ajustar turno:', error);
      throw error;
    }
  },
};

export default disponibilidadService;
