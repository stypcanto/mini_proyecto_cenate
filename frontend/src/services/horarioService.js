// ========================================================================
// horarioService.js - Servicio para obtener horarios/turnos
// ========================================================================

import { apiClient } from "../../lib/apiClient";

class HorarioService {
  /**
   * Obtiene todos los horarios disponibles
   * @returns {Promise<Array>} Lista de horarios
   */
  async obtenerTodos() {
    try {
      const data = await apiClient.get("/horarios", true);
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (error) {
      console.error("Error al obtener horarios:", error);
      throw error;
    }
  }

  /**
   * Obtiene un horario por ID
   * @param {number} id - ID del horario
   * @returns {Promise<Object>} Horario
   */
  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`/horarios/${id}`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener horario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene horarios activos
   * @returns {Promise<Array>} Lista de horarios activos
   */
  async obtenerActivos() {
    try {
      const data = await apiClient.get("/horarios/activos", true);
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (error) {
      console.error("Error al obtener horarios activos:", error);
      throw error;
    }
  }
}

export default new HorarioService();
