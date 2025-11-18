// ========================================================================
// 🎓 profesionService.js – Servicio para Profesiones (CENATE 2025)
// ------------------------------------------------------------------------
// Servicio para gestionar profesiones del personal médico
// ========================================================================

import { apiClient } from "../lib/apiClient";

class ProfesionService {
  /**
   * Obtener todas las profesiones
   * @returns {Promise<Array>} Lista de profesiones
   */
  async obtenerTodas() {
    try {
      const data = await apiClient.get("/profesiones", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al obtener profesiones:", error);
      throw error;
    }
  }

  /**
   * Obtener solo profesiones activas
   * @returns {Promise<Array>} Lista de profesiones activas
   */
  async obtenerActivas() {
    try {
      const data = await apiClient.get("/profesiones/activas", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al obtener profesiones activas:", error);
      throw error;
    }
  }

  /**
   * Crear una nueva profesión
   * @param {Object} profesionData - Datos de la profesión
   * @param {string} profesionData.descProf - Descripción de la profesión
   * @param {string} profesionData.statProf - Estado (A = Activo, I = Inactivo)
   * @returns {Promise<Object>} Profesión creada
   */
  async crear(profesionData) {
    try {
      const response = await apiClient.post("/profesiones", profesionData, true);
      console.log("✅ Profesión creada exitosamente");
      return response;
    } catch (error) {
      console.error("❌ Error al crear profesión:", error);
      throw error;
    }
  }

  /**
   * Actualizar una profesión existente
   * @param {number} id - ID de la profesión
   * @param {Object} profesionData - Datos actualizados
   * @returns {Promise<Object>} Profesión actualizada
   */
  async actualizar(id, profesionData) {
    try {
      const response = await apiClient.put(`/profesiones/${id}`, profesionData, true);
      console.log(`✅ Profesión ${id} actualizada exitosamente`);
      return response;
    } catch (error) {
      console.error(`❌ Error al actualizar profesión ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar una profesión
   * @param {number} id - ID de la profesión
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    try {
      await apiClient.delete(`/profesiones/${id}`, true);
      console.log(`✅ Profesión ${id} eliminada exitosamente`);
    } catch (error) {
      console.error(`❌ Error al eliminar profesión ${id}:`, error);
      throw error;
    }
  }
}

export const profesionService = new ProfesionService();

