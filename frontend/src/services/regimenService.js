// ========================================================================
// regimenService.js – Servicio para Regímenes Laborales (CENATE 2025)
// ------------------------------------------------------------------------
// Servicio para gestionar regímenes laborales de CENATE
// ========================================================================

import { apiClient } from '../lib/apiClient';

class RegimenService {
  /**
   * Obtener todos los regímenes
   * @returns {Promise<Array>} Lista de regímenes
   */
  async obtenerTodos() {
    try {
      const data = await apiClient.get("/regimenes", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener regímenes:", error);
      throw error;
    }
  }

  /**
   * Obtener regímenes públicos (solo activos, sin autenticación)
   * @returns {Promise<Array>} Lista de regímenes activos
   */
  async obtenerPublicos() {
    try {
      const data = await apiClient.get("/regimenes/publicos", false);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener regímenes públicos:", error);
      throw error;
    }
  }

  /**
   * Obtener un régimen por ID
   * @param {number} id - ID del régimen
   * @returns {Promise<Object>} Régimen encontrado
   */
  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`/regimenes/${id}`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener régimen ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo régimen
   * @param {Object} regimenData - Datos del régimen
   * @param {string} regimenData.descRegLab - Descripción del régimen
   * @param {string} regimenData.statRegLab - Estado (A = Activo, I = Inactivo)
   * @returns {Promise<Object>} Régimen creado
   */
  async crear(regimenData) {
    try {
      const response = await apiClient.post("/regimenes", regimenData, true);
      console.log("Régimen creado exitosamente");
      return response;
    } catch (error) {
      console.error("Error al crear régimen:", error);
      throw error;
    }
  }

  /**
   * Actualizar un régimen existente
   * @param {number} id - ID del régimen
   * @param {Object} regimenData - Datos actualizados
   * @returns {Promise<Object>} Régimen actualizado
   */
  async actualizar(id, regimenData) {
    try {
      const response = await apiClient.put(`/regimenes/${id}`, regimenData, true);
      console.log(`Régimen ${id} actualizado exitosamente`);
      return response;
    } catch (error) {
      console.error(`Error al actualizar régimen ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un régimen
   * @param {number} id - ID del régimen
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    try {
      await apiClient.delete(`/regimenes/${id}`, true);
      console.log(`Régimen ${id} eliminado exitosamente`);
    } catch (error) {
      console.error(`Error al eliminar régimen ${id}:`, error);
      throw error;
    }
  }
}

export const regimenService = new RegimenService();
