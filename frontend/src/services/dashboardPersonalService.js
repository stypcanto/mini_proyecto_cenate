import { apiClient } from "../lib/apiClient";

/**
 * Servicio para estadísticas de personal en el dashboard
 */
const dashboardPersonalService = {
  /**
   * Obtiene estadísticas de personal interno vs externo con desglose por red
   * @returns {Promise<Object>} Estadísticas completas
   */
  async obtenerEstadisticasPersonal() {
    try {
      const response = await apiClient.get(
        "/admin/dashboard/estadisticas-personal",
        true
      );
      console.log("📊 Estadísticas de personal obtenidas:", response);
      return response;
    } catch (error) {
      console.error("Error al obtener estadísticas de personal:", error);
      throw error;
    }
  }
};

export default dashboardPersonalService;
