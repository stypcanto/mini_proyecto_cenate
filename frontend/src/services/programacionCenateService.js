// ========================================================================
// programacionCenateService.js - Servicio para Programacion CENATE
// ------------------------------------------------------------------------
// Proporciona datos consolidados de solicitudes de turnos
// ========================================================================

import { apiClient } from '../lib/apiClient';

class ProgramacionCenateService {
  /**
   * Obtiene el resumen general de todos los periodos
   * @returns {Promise<Array>} Lista de resumenes por periodo
   */
  async obtenerResumenGeneral() {
    try {
      const data = await apiClient.get("/programacion-cenate/resumen", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener resumen general:", error);
      throw error;
    }
  }

  /**
   * Obtiene el resumen consolidado de un periodo especifico
   * @param {number} idPeriodo - ID del periodo
   * @returns {Promise<Object>} Resumen del periodo
   */
  async obtenerResumenPorPeriodo(idPeriodo) {
    try {
      const data = await apiClient.get(`/programacion-cenate/periodo/${idPeriodo}`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener resumen del periodo ${idPeriodo}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene estadisticas detalladas de un periodo
   * @param {number} idPeriodo - ID del periodo
   * @returns {Promise<Object>} Estadisticas del periodo
   */
  async obtenerEstadisticas(idPeriodo) {
    try {
      const data = await apiClient.get(`/programacion-cenate/estadisticas/${idPeriodo}`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener estadisticas del periodo ${idPeriodo}:`, error);
      throw error;
    }
  }

  /**
   * Exporta los datos de un periodo a CSV
   * @param {number} idPeriodo - ID del periodo
   * @returns {Promise<Blob>} Archivo CSV
   */
  async exportarCsv(idPeriodo) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/programacion-cenate/exportar/${idPeriodo}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('auth.token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al exportar CSV');
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error(`Error al exportar CSV del periodo ${idPeriodo}:`, error);
      throw error;
    }
  }

  /**
   * Descarga el CSV de un periodo
   * @param {number} idPeriodo - ID del periodo
   * @param {string} nombreArchivo - Nombre del archivo
   */
  async descargarCsv(idPeriodo, nombreArchivo = null) {
    try {
      const blob = await this.exportarCsv(idPeriodo);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo || `programacion_cenate_${idPeriodo}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log("CSV descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar CSV:", error);
      throw error;
    }
  }

  /**
   * Obtiene solicitudes de un periodo (para vista detallada)
   * @param {number} idPeriodo - ID del periodo
   * @returns {Promise<Array>} Lista de solicitudes
   */
  async obtenerSolicitudesPorPeriodo(idPeriodo) {
    try {
      const data = await apiClient.get(`/solicitudes-turno/periodo/${idPeriodo}`, true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error al obtener solicitudes del periodo ${idPeriodo}:`, error);
      throw error;
    }
  }

  /**
   * Marca una solicitud como revisada
   * @param {number} idSolicitud - ID de la solicitud
   * @returns {Promise<Object>} Solicitud actualizada
   */
  async marcarSolicitudRevisada(idSolicitud) {
    try {
      const data = await apiClient.put(`/solicitudes-turno/${idSolicitud}/revisar`, {}, true);
      console.log(`Solicitud ${idSolicitud} marcada como revisada`);
      return data;
    } catch (error) {
      console.error(`Error al marcar solicitud ${idSolicitud} como revisada:`, error);
      throw error;
    }
  }
}

export const programacionCenateService = new ProgramacionCenateService();
