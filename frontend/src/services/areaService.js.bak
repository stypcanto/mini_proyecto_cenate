// ========================================================================
// 🏢 areaService.js – Servicio para Áreas (CENATE 2025)
// ------------------------------------------------------------------------
// Servicio para gestionar áreas internas de CENATE
// ========================================================================

import { apiClient } from "../lib/apiClient";

class AreaService {
  /**
   * Obtener todas las áreas
   * @returns {Promise<Array>} Lista de áreas
   */
  async obtenerTodas() {
    try {
      const data = await apiClient.get("/admin/areas", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al obtener áreas:", error);
      throw error;
    }
  }

  /**
   * Obtener áreas activas
   * @returns {Promise<Array>} Lista de áreas activas
   */
  async obtenerActivas() {
    try {
      const data = await apiClient.get("/admin/areas/activas", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al obtener áreas activas:", error);
      // Fallback: obtener todas y filtrar activas
      try {
        const todas = await this.obtenerTodas();
        return todas.filter(area => area.statArea === "1" || area.statArea === 1);
      } catch (fallbackError) {
        console.error("❌ Error en fallback de áreas:", fallbackError);
        return [];
      }
    }
  }

  /**
   * Obtener un área por ID
   * @param {number} id - ID del área
   * @returns {Promise<Object>} Área encontrada
   */
  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`/admin/areas/${id}`, true);
      return data;
    } catch (error) {
      console.error(`❌ Error al obtener área ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear una nueva área
   * @param {Object} areaData - Datos del área
   * @param {string} areaData.descArea - Descripción del área
   * @param {string} areaData.statArea - Estado (1 = Activo, 0 = Inactivo)
   * @returns {Promise<Object>} Área creada
   */
  async crear(areaData) {
    try {
      const response = await apiClient.post("/admin/areas", areaData, true);
      console.log("✅ Área creada exitosamente");
      return response;
    } catch (error) {
      console.error("❌ Error al crear área:", error);
      throw error;
    }
  }

  /**
   * Actualizar un área existente
   * @param {number} id - ID del área
   * @param {Object} areaData - Datos actualizados
   * @returns {Promise<Object>} Área actualizada
   */
  async actualizar(id, areaData) {
    try {
      const response = await apiClient.put(`/admin/areas/${id}`, areaData, true);
      console.log(`✅ Área ${id} actualizada exitosamente`);
      return response;
    } catch (error) {
      console.error(`❌ Error al actualizar área ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un área
   * @param {number} id - ID del área
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    try {
      await apiClient.delete(`/admin/areas/${id}`, true);
      console.log(`✅ Área ${id} eliminada exitosamente`);
    } catch (error) {
      console.error(`❌ Error al eliminar área ${id}:`, error);
      throw error;
    }
  }
}

export const areaService = new AreaService();
