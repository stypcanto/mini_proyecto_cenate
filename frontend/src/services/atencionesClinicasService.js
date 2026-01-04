// ========================================================================
// atencionesClinicasService.js - Servicio para gestión de atenciones clínicas
// ------------------------------------------------------------------------
// CENATE 2026 | Servicio para comunicación con API de trazabilidad clínica
// ========================================================================

import api from './apiClient';

const BASE_URL = '/atenciones-clinicas';

export const atencionesClinicasService = {
  /**
   * Obtener atenciones de un asegurado (paginado)
   * @param {string} pkAsegurado - PK del asegurado
   * @param {number} page - Número de página (default: 0)
   * @param {number} size - Tamaño de página (default: 20)
   */
  obtenerPorAsegurado: async (pkAsegurado, page = 0, size = 20) => {
    try {
      const data = await api.get(`${BASE_URL}/asegurado/${pkAsegurado}?page=${page}&size=${size}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener atenciones del asegurado ${pkAsegurado}:`, error);
      throw error;
    }
  },

  /**
   * Obtener detalle completo de una atención
   * @param {number} idAtencion - ID de la atención
   */
  obtenerDetalle: async (idAtencion) => {
    try {
      const data = await api.get(`${BASE_URL}/${idAtencion}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener detalle de atención ${idAtencion}:`, error);
      throw error;
    }
  },

  /**
   * Obtener las atenciones creadas por el médico actual
   * @param {number} page - Número de página (default: 0)
   * @param {number} size - Tamaño de página (default: 20)
   */
  obtenerMisAtenciones: async (page = 0, size = 20) => {
    try {
      const data = await api.get(`${BASE_URL}/mis-atenciones?page=${page}&size=${size}`);
      return data;
    } catch (error) {
      console.error('Error al obtener mis atenciones:', error);
      throw error;
    }
  },

  /**
   * Crear nueva atención clínica
   * @param {Object} atencionData - Datos de la atención a crear
   */
  crear: async (atencionData) => {
    try {
      const data = await api.post(BASE_URL, atencionData);
      return data;
    } catch (error) {
      console.error('Error al crear atención clínica:', error);
      throw error;
    }
  },

  /**
   * Actualizar atención existente
   * @param {number} idAtencion - ID de la atención
   * @param {Object} atencionData - Datos a actualizar
   */
  actualizar: async (idAtencion, atencionData) => {
    try {
      const data = await api.put(`${BASE_URL}/${idAtencion}`, atencionData);
      return data;
    } catch (error) {
      console.error(`Error al actualizar atención ${idAtencion}:`, error);
      throw error;
    }
  },

  /**
   * Agregar observación de enfermería a una atención
   * @param {number} idAtencion - ID de la atención
   * @param {Object} observacionData - Datos de la observación
   */
  agregarObservacionEnfermeria: async (idAtencion, observacionData) => {
    try {
      const data = await api.put(`${BASE_URL}/${idAtencion}/observacion-enfermeria`, observacionData);
      return data;
    } catch (error) {
      console.error(`Error al agregar observación de enfermería a atención ${idAtencion}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar atención clínica
   * @param {number} idAtencion - ID de la atención a eliminar
   */
  eliminar: async (idAtencion) => {
    try {
      const data = await api.delete(`${BASE_URL}/${idAtencion}`);
      return data;
    } catch (error) {
      console.error(`Error al eliminar atención ${idAtencion}:`, error);
      throw error;
    }
  },

  /**
   * Obtener comparativo de signos vitales con atención anterior
   * Permite visualizar tendencias (mejorando/empeorando/estable)
   * @param {number} idAtencion - ID de la atención actual
   */
  obtenerComparativoSignosVitales: async (idAtencion) => {
    try {
      const data = await api.get(`${BASE_URL}/${idAtencion}/comparativo-signos-vitales`);
      return data;
    } catch (error) {
      console.error(`Error al obtener comparativo de signos vitales para atención ${idAtencion}:`, error);
      throw error;
    }
  }
};
