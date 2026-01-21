// ========================================================================
// solicitudTurnoService.js - Servicio para Solicitudes de Turnos IPRESS
// ------------------------------------------------------------------------
// Gestiona las solicitudes de turnos de telemedicina por usuarios externos
// ========================================================================

import { apiClient } from "../lib/apiClient";

class SolicitudTurnoService {
  // ============================================================
  // Datos del usuario (auto-detectados)
  // ============================================================

  /**
   * Obtiene los datos de IPRESS del usuario actual (auto-detectados)
   * @returns {Promise<Object>} Datos de IPRESS del usuario
   */
  async obtenerMiIpress() {
    try {
      const data = await apiClient.get("/solicitudes-turno/mi-ipress", true);
      return data;
    } catch (error) {
      console.error("Error al obtener datos de IPRESS:", error);
      throw error;
    }
  }

  // ============================================================
  // Mis solicitudes
  // ============================================================

  /**
   * Lista las solicitudes del usuario actual
   * @returns {Promise<Array>} Lista de solicitudes
   */
  async listarMisSolicitudes() {
    try {
      const data = await apiClient.get("/solicitudes-turno/mis-solicitudes", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al listar mis solicitudes:", error);
      throw error;
    }
  }

  /**
   * Obtiene mi solicitud para un periodo especifico
   * @param {number} idPeriodo - ID del periodo
   * @returns {Promise<Object|null>} Solicitud o null si no existe
   */
  async obtenerMiSolicitud(idPeriodo) {
    try {
      const data = await apiClient.get(`/solicitudes-turno/mi-solicitud/periodo/${idPeriodo}`, true);
      return data;
    } catch (error) {
      // Si es 204 No Content, retornar null
      if (error.message && error.message.includes('204')) {
        return null;
      }
      console.error("Error al obtener mi solicitud:", error);
      throw error;
    }
  }

  /**
   * Verifica si ya existe una solicitud para un periodo
   * @param {number} idPeriodo - ID del periodo
   * @returns {Promise<boolean>} true si existe
   */
  async existeMiSolicitud(idPeriodo) {
    try {
      const data = await apiClient.get(`/solicitudes-turno/periodo/${idPeriodo}/existe`, true);
      return data?.existe || false;
    } catch (error) {
      console.error("Error al verificar solicitud:", error);
      return false;
    }
  }

  // ============================================================
  // CRUD de solicitudes
  // ============================================================

  /**
   * Obtiene una solicitud por ID con detalles
   * @param {number} id - ID de la solicitud
   * @returns {Promise<Object>} Solicitud con detalles
   */
  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`/solicitudes-turno/${id}`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener solicitud ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea una nueva solicitud
   * @param {Object} solicitudData - Datos de la solicitud
   * @returns {Promise<Object>} Solicitud creada
   */
  async crear(solicitudData) {
    try {
      const response = await apiClient.post("/solicitudes-turno", solicitudData, true);
      console.log("Solicitud creada exitosamente");
      return response;
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      throw error;
    }
  }

  /**
   * Guarda como borrador (crea o actualiza)
   * @param {Object} solicitudData - Datos de la solicitud
   * @returns {Promise<Object>} Solicitud guardada
   */
  async guardarBorrador(solicitudData) {
    console.log({
      funcion: "guardarBorrador", datos: solicitudData
    })
    try {
      const response = await apiClient.post("/solicitudes-turno/borrador", solicitudData, true);
      console.log("Borrador guardado exitosamente");
      return response;
    } catch (error) {
      console.error("Error al guardar borrador:", error);
      throw error;
    }
  }

  /**
   * Actualiza una solicitud existente
   * @param {number} id - ID de la solicitud
   * @param {Object} solicitudData - Datos actualizados
   * @returns {Promise<Object>} Solicitud actualizada
   */
  async actualizar(id, solicitudData) {
    try {
      const response = await apiClient.put(`/solicitudes-turno/${id}`, solicitudData, true);
      console.log(`Solicitud ${id} actualizada exitosamente`);
      return response;
    } catch (error) {
      console.error(`Error al actualizar solicitud ${id}:`, error);
      throw error;
    }
  }

  /**
   * Envia una solicitud
   * @param {number} id - ID de la solicitud
   * @returns {Promise<Object>} Solicitud enviada
   */
  async enviar(id) {
    try {
      const response = await apiClient.put(`/solicitudes-turno/${id}/enviar`, {}, true);
      console.log(`Solicitud ${id} enviada exitosamente`);
      return response;
    } catch (error) {
      console.error(`Error al enviar solicitud ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una solicitud (solo borrador)
   * @param {number} id - ID de la solicitud
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    try {
      await apiClient.delete(`/solicitudes-turno/${id}`, true);
      console.log(`Solicitud ${id} eliminada exitosamente`);
    } catch (error) {
      console.error(`Error al eliminar solicitud ${id}:`, error);
      throw error;
    }
  }

  /**
   * Guarda o actualiza el detalle de una especialidad específica con sus fechas
   * @param {number} idSolicitud - ID de la solicitud
   * @param {Object} detalleData - Datos del detalle de la especialidad
   * @returns {Promise<Object>} Detalle guardado
   */
  async guardarDetalleEspecialidad(idSolicitud, detalleData) {
    try {
      const response = await apiClient.post(
        `/solicitudes-turno/${idSolicitud}/detalle`,
        detalleData,
        true
      );
      console.log(`Detalle de especialidad guardado exitosamente para solicitud ${idSolicitud}`);
      return response;
    } catch (error) {
      console.error(`Error al guardar detalle de especialidad:`, error);
      throw error;
    }
  }

  /**
   * Obtiene las fechas registradas para un detalle específico
   * @param {number} idDetalle - ID del detalle de solicitud
   * @returns {Promise<Object>} Fechas del detalle
   */
  async obtenerFechasDetalle(idDetalle) {
    try {
      const response = await apiClient.get(
        `/solicitudes-turno/detalle/${idDetalle}/fechas`,
        true
      );
      console.log(`Fechas obtenidas para detalle ${idDetalle}`);
      return response;
    } catch (error) {
      console.error(`Error al obtener fechas del detalle ${idDetalle}:`, error);
      throw error;
    }
  }

  // ============================================================
  // Especialidades CENATE
  // ============================================================

  /**
   * Obtiene las especialidades activas de CENATE
   * @returns {Promise<Array>} Lista de especialidades
   */
  async obtenerEspecialidadesCenate() {
    try {
      const data = await apiClient.get("/servicio-essi/activos-cenate", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener especialidades CENATE:", error);
      throw error;
    }
  }

  // ============================================================
  // Helpers
  // ============================================================

  /**
   * Prepara los detalles de la solicitud para enviar al backend
   * @param {Object} turnosPorEspecialidad - Map de idServicio -> datos
   * @returns {Array} Array de detalles formateados
   */
  prepararDetalles(turnosPorEspecialidad) {
    const detalles = [];

    Object.entries(turnosPorEspecialidad).forEach(([idServicio, datos]) => {
      if (datos.turnosSolicitados > 0) {
        detalles.push({
          idServicio: parseInt(idServicio),
          turnosSolicitados: datos.turnosSolicitados,
          turnoPreferente: datos.turnoPreferente || null,
          diaPreferente: datos.diaPreferente || null,
          observacion: datos.observacion || null
        });
      }
    });

    return detalles;
  }

  /**
   * Calcula el total de turnos solicitados
   * @param {Object} turnosPorEspecialidad - Map de idServicio -> datos
   * @returns {number} Total de turnos
   */
  calcularTotalTurnos(turnosPorEspecialidad) {
    return Object.values(turnosPorEspecialidad).reduce(
      (total, datos) => total + (datos.turnosSolicitados || 0),
      0
    );
  }
}

export const solicitudTurnoService = new SolicitudTurnoService();
