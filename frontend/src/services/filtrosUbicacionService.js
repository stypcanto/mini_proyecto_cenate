// ========================================================================
// filtrosUbicacionService.js - Servicio para Filtros de Ubicación
// ------------------------------------------------------------------------
// Gestiona los filtros en cascada: Macroregión → Red → IPRESS
// ========================================================================

import { apiClient } from "../lib/apiClient";

class FiltrosUbicacionService {
  /**
   * Obtener todas las macroregiones
   * @returns {Promise<Array>} Lista de macroregiones { id, descripcion }
   */
  async obtenerMacroregiones() {
    try {
      const data = await apiClient.get("/filtros/macroregiones", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al obtener macroregiones:", error);
      throw error;
    }
  }

  /**
   * Obtener redes por macroregión
   * @param {number} macroId - ID de la macroregión
   * @returns {Promise<Array>} Lista de redes { id, codigo, descripcion, macroId }
   */
  async obtenerRedesPorMacro(macroId) {
    try {
      if (!macroId) return [];
      const data = await apiClient.get(`/filtros/redes?macroId=${macroId}`, true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`❌ Error al obtener redes de macro ${macroId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener IPRESS por red
   * @param {number} redId - ID de la red
   * @returns {Promise<Array>} Lista de IPRESS { id, codigo, descripcion, redId }
   */
  async obtenerIpressPorRed(redId) {
    try {
      if (!redId) return [];
      const data = await apiClient.get(`/filtros/ipress?redId=${redId}`, true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`❌ Error al obtener IPRESS de red ${redId}:`, error);
      throw error;
    }
  }
}

export const filtrosUbicacionService = new FiltrosUbicacionService();
