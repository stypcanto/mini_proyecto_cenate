/**
 * 📧 Email Audit Service
 *
 * Servicio para consumir endpoints de auditoría de correos
 */

import apiClient from '../lib/apiClient';

const ENDPOINT = '/email-audit';

const emailAuditService = {
  /**
   * Obtener todos los correos
   */
  obtenerTodos: async (limite = 100) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/todos?limite=${limite}`, true);
      return response;
    } catch (error) {
      console.error('Error obteniendo correos:', error);
      throw error;
    }
  },

  /**
   * Obtener correos enviados exitosamente
   */
  obtenerEnviados: async (limite = 50) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/enviados?limite=${limite}`, true);
      return response;
    } catch (error) {
      console.error('Error obteniendo correos enviados:', error);
      throw error;
    }
  },

  /**
   * Obtener correos fallidos
   */
  obtenerCorreosFallidos: async (limite = 50) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/fallidos?limite=${limite}`, true);
      return response;
    } catch (error) {
      console.error('Error obteniendo correos fallidos:', error);
      throw error;
    }
  },

  /**
   * Obtener correos por destinatario
   */
  obtenerPorDestinatario: async (email) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/destinatario?email=${email}`, true);
      return response;
    } catch (error) {
      console.error('Error obteniendo correos:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas
   */
  obtenerEstadisticas: async (inicio, fin) => {
    try {
      const url = `${ENDPOINT}/estadisticas${inicio && fin ? `?inicio=${inicio}&fin=${fin}` : ''}`;
      const response = await apiClient.get(url, true);
      return response;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  /**
   * Obtener correos con errores de conexión
   */
  obtenerErroresConexion: async (limite = 50) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/errores-conexion?limite=${limite}`, true);
      return response;
    } catch (error) {
      console.error('Error obteniendo errores:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de correos de un usuario
   */
  obtenerHistoricoUsuario: async (idUsuario, pagina = 0, tamanio = 20) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/usuario/${idUsuario}?pagina=${pagina}&tamanio=${tamanio}`, true);
      return response;
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  },

  /**
   * Obtener resumen de auditoría
   */
  obtenerResumen: async () => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/resumen`, true);
      return response;
    } catch (error) {
      console.error('Error obteniendo resumen:', error);
      throw error;
    }
  }
};

export default emailAuditService;
