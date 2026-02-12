// ========================================================================
// 📊 auditoriaService.js – Servicio para Auditoría MBAC (CENATE 2025)
// ------------------------------------------------------------------------
// Servicio para consultar logs y auditoría del sistema
// ========================================================================

import { apiClient } from "../../lib/apiClient";

const auditoriaService = {
  /**
   * Obtener resumen de auditoría
   * @returns {Promise} Resumen de logs
   */
  async getResumen() {
    try {
      const response = await apiClient.get("/auditoria/resumen", true);
      return response;
    } catch (error) {
      console.error("Error al obtener resumen de auditoría:", error);
      throw error;
    }
  },

  /**
   * Obtener últimos logs
   * @param {number} limit - Número de logs a obtener
   * @returns {Promise} Array de logs
   */
  async getUltimos(limit = 50) {
    try {
      const response = await apiClient.get(`/auditoria/ultimos?limit=${limit}`, true);
      return response;
    } catch (error) {
      console.error("Error al obtener últimos logs:", error);
      throw error;
    }
  },

  /**
   * Obtener logs por usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise} Array de logs del usuario
   */
  async getByUsuario(userId) {
    try {
      const response = await apiClient.get(`/auditoria/usuario/${userId}`, true);
      return response;
    } catch (error) {
      console.error("Error al obtener logs del usuario:", error);
      throw error;
    }
  },

  /**
   * Obtener logs por username
   * @param {string} username - Username del usuario
   * @returns {Promise} Array de logs del usuario
   */
  async getByUsername(username) {
    try {
      const response = await apiClient.get(`/auditoria/username/${username}`, true);
      return response;
    } catch (error) {
      console.error("Error al obtener logs por username:", error);
      throw error;
    }
  },

  /**
   * Obtener logs por rango de fechas
   * @param {string} fechaInicio - Fecha inicio (ISO format)
   * @param {string} fechaFin - Fecha fin (ISO format)
   * @returns {Promise} Array de logs en el rango
   */
  async getByRango(fechaInicio, fechaFin) {
    try {
      const response = await apiClient.get(
        `/auditoria/rango?inicio=${fechaInicio}&fin=${fechaFin}`,
        true
      );
      return response;
    } catch (error) {
      console.error("Error al obtener logs por rango:", error);
      throw error;
    }
  },

  /**
   * Obtener logs por módulo
   * @param {string} modulo - Nombre del módulo
   * @returns {Promise} Array de logs del módulo
   */
  async getByModulo(modulo) {
    try {
      const response = await apiClient.get(`/auditoria/modulo/${modulo}`, true);
      return response;
    } catch (error) {
      console.error("Error al obtener logs del módulo:", error);
      throw error;
    }
  },

  /**
   * Obtener logs por acción
   * @param {string} accion - Tipo de acción
   * @returns {Promise} Array de logs de la acción
   */
  async getByAccion(accion) {
    try {
      const response = await apiClient.get(`/auditoria/accion/${accion}`, true);
      return response;
    } catch (error) {
      console.error("Error al obtener logs por acción:", error);
      throw error;
    }
  },

  /**
   * Buscar en logs
   * @param {string} query - Término de búsqueda
   * @returns {Promise} Array de logs que coinciden
   */
  async buscar(query) {
    try {
      const response = await apiClient.get(`/auditoria/buscar?q=${encodeURIComponent(query)}`, true);
      return response;
    } catch (error) {
      console.error("Error al buscar en logs:", error);
      throw error;
    }
  },

  /**
   * Obtener módulos auditados
   * @returns {Promise} Lista de módulos con auditoría
   */
  async getModulos() {
    try {
      const response = await apiClient.get("/auditoria/modulos", true);
      return response;
    } catch (error) {
      console.error("Error al obtener módulos auditados:", error);
      throw error;
    }
  },

  /**
   * Health check del servicio de auditoría
   * @returns {Promise} Estado del servicio
   */
  async healthCheck() {
    try {
      const response = await apiClient.get("/auditoria/health", true);
      return response;
    } catch (error) {
      console.error("Error en health check de auditoría:", error);
      throw error;
    }
  },

  /**
   * Obtener logs recientes (últimos 10)
   * @returns {Promise} Array de logs recientes
   */
  async getLogsRecientes() {
    try {
      const response = await apiClient.get("/admin/audit/logs/recientes", true);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error al obtener logs recientes:", error);
      return [];
    }
  },
};

export default auditoriaService;
