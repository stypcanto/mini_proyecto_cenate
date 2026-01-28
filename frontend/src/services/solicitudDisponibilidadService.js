// ========================================================================
// solicitudDisponibilidadService.js - Servicio para Solicitudes de Disponibilidad del Médico
// ------------------------------------------------------------------------
// Gestiona las solicitudes de disponibilidad de los médicos
// Trabaja con: solicitud_disponibilidad_medico y solicitud_disponibilidad_medico_det
// ========================================================================

import { apiClient } from "../lib/apiClient";

class SolicitudDisponibilidadService {
  // ============================================================
  // Datos del personal/médico (auto-detectados)
  // ============================================================

  /**
   * Obtiene los datos del personal/médico actual (auto-detectados)
   * @returns {Promise<Object>} Datos del médico del usuario
   */
  async obtenerMiDatos() {
    try {
      const data = await apiClient.get("/solicitudes-disponibilidad/mis-datos", true);
      return data;
    } catch (error) {
      console.error("Error al obtener mis datos:", error);
      throw error;
    }
  }

  // ============================================================
  // Mis solicitudes de disponibilidad
  // ============================================================

  /**
   * Lista las solicitudes de disponibilidad del médico actual
   * @returns {Promise<Array>} Lista de solicitudes
   */
  async listarMisSolicitudes() {
    try {
      const data = await apiClient.get("/solicitudes-disponibilidad/mis-solicitudes", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al listar mis solicitudes de disponibilidad:", error);
      throw error;
    }
  }

  /**
   * Obtiene mi solicitud para un periodo específico
   * @param {number} idPeriodo - ID del periodo
   * @returns {Promise<Object|null>} Solicitud o null si no existe
   */
  async obtenerMiSolicitud(idPeriodo) {
    try {
      const data = await apiClient.get(`/solicitudes-disponibilidad/mi-solicitud/periodo/${idPeriodo}`, true);
      return data;
    } catch (error) {
      // Si es 204 No Content, retornar null
      if (error.message && error.message.includes('204')) {
        return null;
      }
      console.error("Error al obtener mi solicitud de disponibilidad:", error);
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
      const data = await apiClient.get(`/solicitudes-disponibilidad/periodo/${idPeriodo}/existe`, true);
      return data?.existe || false;
    } catch (error) {
      console.error("Error al verificar solicitud de disponibilidad:", error);
      return false;
    }
  }

  // ============================================================
  // CRUD de solicitudes de disponibilidad
  // ============================================================

  /**
   * Obtiene una solicitud de disponibilidad por ID con detalles
   * @param {number} id - ID de la solicitud
   * @returns {Promise<Object>} Solicitud con detalles
   */
  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`/solicitudes-disponibilidad/${id}`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener solicitud de disponibilidad ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea una nueva solicitud de disponibilidad
   * @param {Object} solicitudData - Datos de la solicitud
   * @returns {Promise<Object>} Solicitud creada
   */
  async crear(solicitudData) {
    try {
      const response = await apiClient.post("/solicitudes-disponibilidad", solicitudData, true);
      console.log("Solicitud de disponibilidad creada exitosamente");
      return response;
    } catch (error) {
      console.error("Error al crear solicitud de disponibilidad:", error);
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
      funcion: "guardarBorrador",
      datos: solicitudData
    });
    try {
      const response = await apiClient.post("/solicitudes-disponibilidad/borrador", solicitudData, true);
      console.log("Borrador de disponibilidad guardado exitosamente");
      return response;
    } catch (error) {
      console.error("Error al guardar borrador de disponibilidad:", error);
      throw error;
    }
  }

  /**
   * Actualiza una solicitud de disponibilidad existente
   * @param {number} id - ID de la solicitud
   * @param {Object} solicitudData - Datos actualizados
   * @returns {Promise<Object>} Solicitud actualizada
   */
  async actualizar(id, solicitudData) {
    try {
      const response = await apiClient.put(`/solicitudes-disponibilidad/${id}`, solicitudData, true);
      console.log(`Solicitud de disponibilidad ${id} actualizada exitosamente`);
      return response;
    } catch (error) {
      console.error(`Error al actualizar solicitud de disponibilidad ${id}:`, error);
      throw error;
    }
  }

  /**
   * Envía una solicitud de disponibilidad
   * @param {number} id - ID de la solicitud
   * @returns {Promise<Object>} Solicitud enviada
   */
  async enviar(id) {
    try {
      const response = await apiClient.put(`/solicitudes-disponibilidad/${id}/enviar`, {}, true);
      console.log(`Solicitud de disponibilidad ${id} enviada exitosamente`);
      return response;
    } catch (error) {
      console.error(`Error al enviar solicitud de disponibilidad ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una solicitud de disponibilidad (solo borrador)
   * @param {number} id - ID de la solicitud
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    try {
      await apiClient.delete(`/solicitudes-disponibilidad/${id}`, true);
      console.log(`Solicitud de disponibilidad ${id} eliminada exitosamente`);
    } catch (error) {
      console.error(`Error al eliminar solicitud de disponibilidad ${id}:`, error);
      throw error;
    }
  }

  /**
   * Guarda o actualiza el detalle de días/turnos específicos con sus fechas
   * @param {number} idSolicitud - ID de la solicitud
   * @param {Object} detalleData - Datos del detalle de disponibilidad
   * @returns {Promise<Object>} Detalle guardado
   */
  async guardarDetalleDisponibilidad(idSolicitud, detalleData) {
    try {
      const response = await apiClient.post(
        `/solicitudes-disponibilidad/${idSolicitud}/detalle`,
        detalleData,
        true
      );
      console.log(`Detalle de disponibilidad guardado exitosamente para solicitud ${idSolicitud}`);
      return response;
    } catch (error) {
      console.error(`Error al guardar detalle de disponibilidad:`, error);
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
        `/solicitudes-disponibilidad/detalle/${idDetalle}/fechas`,
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
  // Periodos de Disponibilidad
  // ============================================================

  /**
   * Obtiene los periodos de disponibilidad vigentes
   * @returns {Promise<Array>} Lista de periodos vigentes
   */
  async obtenerPeriodosVigentes() {
    try {
      const data = await apiClient.get("/periodo-medico-disponibilidad/vigentes", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener periodos vigentes:", error);
      throw error;
    }
  }

  /**
   * Obtiene los periodos de disponibilidad activos
   * @returns {Promise<Array>} Lista de periodos activos
   */
  async obtenerPeriodosActivos() {
    try {
      const data = await apiClient.get("/periodo-medico-disponibilidad/activos", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener periodos activos:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los años disponibles para periodos de disponibilidad
   * @returns {Promise<Array>} Array de años
   */
  async obtenerAniosDisponibles() {
    try {
      const data = await apiClient.get("/periodo-medico-disponibilidad/anos-disponibles", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener años disponibles:", error);
      return [];
    }
  }

  // ============================================================
  // Turnos/Bloques Horarios Disponibles
  // ============================================================

  /**
   * Obtiene los turnos/bloques horarios disponibles configurados en el sistema
   * Para un periodo de disponibilidad específico
   * @returns {Promise<Array>} Lista de turnos/bloques (M, T, N, etc.)
   */
  async obtenerTurnosDisponibles() {
    try {
      const data = await apiClient.get("/solicitudes-disponibilidad/turnos-disponibles", true);
      return Array.isArray(data) ? data : ["M", "T", "N"]; // Fallback
    } catch (error) {
      console.error("Error al obtener turnos disponibles:", error);
      return ["M", "T", "N"]; // Fallback
    }
  }

  /**
   * Obtiene la configuración de horarios por defecto (si aplica)
   * @returns {Promise<Array>} Lista de configuración de horarios
   */
  async obtenerConfiguracionHorarios() {
    try {
      const data = await apiClient.get("/solicitudes-disponibilidad/config-horarios", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener configuración de horarios:", error);
      return [];
    }
  }

  // ============================================================
  // Helpers
  // ============================================================

  /**
   * Prepara los detalles de disponibilidad para enviar al backend
   * @param {Object} disponibilidadPorFecha - Map de fecha+turno -> datos
   * @returns {Array} Array de detalles formateados
   */
  prepararDetalles(disponibilidadPorFecha) {
    const detalles = [];

    Object.entries(disponibilidadPorFecha).forEach(([key, datos]) => {
      if (datos) {
        detalles.push({
          fecha: datos.fecha,
          turno: datos.turno, // M, T, N
          estado: datos.estado || "PROPUESTO",
          id_horario: datos.idHorario || null,
          observacion: datos.observacion || null
        });
      }
    });

    return detalles;
  }

  /**
   * Calcula el total de días de disponibilidad registrados
   * @param {Array} fechas - Array de fechas con turno
   * @returns {number} Total de registros
   */
  calcularTotalRegistros(fechas) {
    return fechas ? fechas.length : 0;
  }
}

export const solicitudDisponibilidadService = new SolicitudDisponibilidadService();
