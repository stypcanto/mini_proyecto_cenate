// ========================================================================
// 🏥 ipressService.js – Servicio para IPRESS (CENATE 2026)
// ------------------------------------------------------------------------
// Servicio para gestionar Instituciones Prestadoras de Servicios de Salud
// ========================================================================

import { apiClient } from "../lib/apiClient";

class IpressService {
  /**
   * Obtener todas las IPRESS
   * @returns {Promise<Array>} Lista de IPRESS
   */
  async obtenerTodas() {
    try {
      const data = await apiClient.get("/ipress", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al obtener IPRESS:", error);
      throw error;
    }
  }

  /**
   * Obtener IPRESS activas
   * @returns {Promise<Array>} Lista de IPRESS activas
   */
  async obtenerActivas() {
    try {
      const data = await apiClient.get("/ipress/activas", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al obtener IPRESS activas:", error);
      throw error;
    }
  }

  /**
   * Obtener una IPRESS por ID
   * @param {number} id - ID de la IPRESS
   * @returns {Promise<Object>} IPRESS encontrada
   */
  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`/ipress/${id}`, true);
      return data;
    } catch (error) {
      console.error(`❌ Error al obtener IPRESS ${id}:`, error);
      throw error;
    }
  }

  /**
   * Buscar IPRESS por nombre
   * @param {string} termino - Término de búsqueda
   * @returns {Promise<Array>} Lista de IPRESS encontradas
   */
  async buscar(termino) {
    try {
      const data = await apiClient.get(`/ipress/buscar?q=${encodeURIComponent(termino)}`, true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`❌ Error al buscar IPRESS con término "${termino}":`, error);
      throw error;
    }
  }

  /**
   * Crear una nueva IPRESS
   * @param {Object} ipressData - Datos de la IPRESS
   * @returns {Promise<Object>} IPRESS creada
   */
  async crear(ipressData) {
    try {
      const response = await apiClient.post("/ipress", ipressData, true);
      console.log("✅ IPRESS creada exitosamente");
      return response.data || response;
    } catch (error) {
      console.error("❌ Error al crear IPRESS:", error);
      throw error;
    }
  }

  /**
   * Actualizar una IPRESS existente
   * @param {number} id - ID de la IPRESS
   * @param {Object} ipressData - Datos actualizados
   * @returns {Promise<Object>} IPRESS actualizada
   */
  async actualizar(id, ipressData) {
    try {
      const response = await apiClient.put(`/ipress/${id}`, ipressData, true);
      console.log(`✅ IPRESS ${id} actualizada exitosamente`);
      return response.data || response;
    } catch (error) {
      console.error(`❌ Error al actualizar IPRESS ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar una IPRESS (solo SUPERADMIN)
   * @param {number} id - ID de la IPRESS
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    try {
      await apiClient.delete(`/ipress/${id}`, true);
      console.log(`✅ IPRESS ${id} eliminada exitosamente`);
    } catch (error) {
      console.error(`❌ Error al eliminar IPRESS ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener modalidades de atención activas
   * @returns {Promise<Array>} Lista de modalidades
   */
  async obtenerModalidadesActivas() {
    try {
      const data = await apiClient.get("/modalidades-atencion/activas", false);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al obtener modalidades de atención:", error);
      return [];
    }
  }

  /**
   * Obtener la IPRESS asignada al usuario logueado (Personal Externo)
   * @returns {Promise<Object>} IPRESS del usuario
   */
  async obtenerMiIpress() {
    try {
      const response = await apiClient.get("/ipress/mi-ipress", true);
      return response.data || response;
    } catch (error) {
      console.error("❌ Error al obtener mi IPRESS:", error);
      throw error;
    }
  }

  /**
   * Actualizar modalidad de atención de la IPRESS del usuario logueado
   * @param {Object} modalidadData - Datos de modalidad a actualizar
   * @returns {Promise<Object>} IPRESS actualizada
   */
  async actualizarMiModalidad(modalidadData) {
    try {
      const response = await apiClient.patch("/ipress/mi-modalidad", modalidadData, true);
      console.log("✅ Modalidad de atención actualizada exitosamente");
      return response.data || response;
    } catch (error) {
      console.error("❌ Error al actualizar modalidad de atención:", error);
      throw error;
    }
  }
}

export default new IpressService();
