// ========================================================================
// especialidadService.js – Servicio para Especialidades (CENATE 2025)
// ------------------------------------------------------------------------
// Servicio para gestionar especialidades de CENATE
// ========================================================================

import { apiClient } from "../lib/apiClient";

class EspecialidadService {
  /**
   * Obtener todas las especialidades
   * @returns {Promise<Array>} Lista de especialidades
   */
  async obtenerTodas() {
    try {
      const data = await apiClient.get("/especialidades", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener especialidades:", error);
      throw error;
    }
  }

  /**
   * Obtener especialidades activas
   * @returns {Promise<Array>} Lista de especialidades activas
   */
  async obtenerActivas() {
    try {
      const data = await apiClient.get("/especialidades/activas", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener especialidades activas:", error);
      throw error;
    }
  }

  /**
   * Obtener especialidades que tienen médicos activos en CENATE
   * @returns {Promise<Array>} Lista de especialidades con médicos
   */
  async obtenerConMedicosActivos() {
    try {
      const data = await apiClient.get("/especialidades/con-medicos-activos", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener especialidades con médicos activos:", error);
      throw error;
    }
  }

  /**
   * Obtener una especialidad por ID
   * @param {number} id - ID de la especialidad
   * @returns {Promise<Object>} Especialidad encontrada
   */
  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`/especialidades/${id}`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener especialidad ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear una nueva especialidad
   * @param {Object} especialidadData - Datos de la especialidad
   * @param {string} especialidadData.descripcion - Descripción de la especialidad
   * @param {string} especialidadData.statEsp - Estado (A = Activo, I = Inactivo)
   * @param {number} especialidadData.idProf - ID de la profesión asociada
   * @returns {Promise<Object>} Especialidad creada
   */
  async crear(especialidadData) {
    try {
      const response = await apiClient.post("/especialidades", especialidadData, true);
      console.log("Especialidad creada exitosamente");
      return response;
    } catch (error) {
      console.error("Error al crear especialidad:", error);
      throw error;
    }
  }

  /**
   * Actualizar una especialidad existente
   * @param {number} id - ID de la especialidad
   * @param {Object} especialidadData - Datos actualizados
   * @returns {Promise<Object>} Especialidad actualizada
   */
  async actualizar(id, especialidadData) {
    try {
      const response = await apiClient.put(`/especialidades/${id}`, especialidadData, true);
      console.log(`Especialidad ${id} actualizada exitosamente`);
      return response;
    } catch (error) {
      console.error(`Error al actualizar especialidad ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar una especialidad
   * @param {number} id - ID de la especialidad
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    try {
      await apiClient.delete(`/especialidades/${id}`, true);
      console.log(`Especialidad ${id} eliminada exitosamente`);
    } catch (error) {
      console.error(`Error al eliminar especialidad ${id}:`, error);
      throw error;
    }
  }
}

export const especialidadService = new EspecialidadService();
