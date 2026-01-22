// ========================================================================
// periodoSolicitudService.js - Servicio para Periodos de Solicitud de Turnos
// ------------------------------------------------------------------------
// Gestiona los periodos de captura de solicitudes de turnos (Coordinador)
// ========================================================================

import { apiClient } from "../lib/apiClient";

class PeriodoSolicitudService {
  /**
   * Obtener todos los periodos
   * @returns {Promise<Array>} Lista de periodos
   */


  yyyymmFromYYYYMMDD(value) {
    // value: "2026-01-01" -> "202601"
    if (!value) return "";
    const [y, m] = String(value).split("-");
    return y && m ? `${y}${m}` : "";
  }

  mapToApiPayload(ui) {
  const fechaInicio = ui.fechaInicio;
  const fechaFin = ui.fechaFin;

  const periodo = ui.periodo?.trim() || this.yyyymmFromYYYYMMDD(fechaInicio);

  return {
    periodo,
    descripcion: ui.descripcion ?? "",
    fechaInicio,   // YYYY-MM-DD
    fechaFin,      // YYYY-MM-DD
    instrucciones: ui.instrucciones ?? null
  };
}


  async obtenerTodos() {
    try {
      const data = await apiClient.get("/periodos-solicitud", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener periodos:", error);
      throw error;
    }
  }

  /**
   * Obtener periodos con filtros
   * @param {Object} filtros - { estado: string, anio: number, page: number, size: number }
   * @returns {Promise<Object>} Respuesta paginada con periodos
   */
  async obtenerConFiltros(filtros = {}) {
    try {
      const params = {};
      
      // Solo agregar parámetros si tienen valor
      if (filtros.estado && filtros.estado !== "TODOS") {
        params.estado = filtros.estado;
      }
      if (filtros.anio) {
        params.anio = filtros.anio;
      }
      params.page = filtros.page || 0;
      params.size = filtros.size || 100;
      
      console.log("%c🔍 FILTRAR PERIODOS", "color: #3b82f6; font-weight: bold; font-size: 14px;");
      console.log("Filtros aplicados:", params);
      
      const data = await apiClient.getWithParams("/periodos-solicitud/filtros", params, true);
      
      // Retornar el array de content si es paginado, o el data completo
      return data?.content ? data.content : (Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener periodos con filtros:", error);
      throw error;
    }
  }

  /**
   * Obtener años disponibles de periodos
   * @returns {Promise<Array<number>>} Lista de años
   */
  async obtenerAniosDisponibles() {
    try {
      const data = await apiClient.get("/periodos-solicitud/anios", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener años disponibles:", error);
      return [new Date().getFullYear()]; // Fallback al año actual
    }
  }

  /**
   * Obtener periodos activos
   * @returns {Promise<Array>} Lista de periodos activos
   */
  async obtenerActivos() {
    try {
      const data = await apiClient.get("/periodos-solicitud/activos", true);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener periodos activos:", error);
      throw error;
    }
  }

  /**
   * Obtener periodos vigentes (activos y dentro del rango de fechas)
   * @returns {Promise<Array>} Lista de periodos vigentes
   */
  async obtenerVigentes() {
    console.log("*****************OBTENER VIGENTES******************");
    try {
      const data = await apiClient.get("/periodos-solicitud/vigentes", true);
      console.log("DATA_PERIODO_VIGENTE",data );
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al obtener periodos vigentes:", error);
      throw error;
    }
  }

  /**
   * Obtener periodo por ID
   * @param {number} id - ID del periodo
   * @returns {Promise<Object>} Periodo
   */
  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`/periodos-solicitud/${id}`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener periodo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener periodo con estadisticas
   * @param {number} id - ID del periodo
   * @returns {Promise<Object>} Periodo con estadisticas
   */
  async obtenerConEstadisticas(id) {
    try {
      const data = await apiClient.get(`/periodos-solicitud/${id}/estadisticas`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener estadisticas del periodo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo periodo
   * @param {Object} periodoData - Datos del periodo
   * @returns {Promise<Object>} Periodo creado
   */
  async crear(periodoData) {
    try {
      const payload = this.mapToApiPayload(periodoData);
      console.log("Payload CREATE →", payload);


      const response = await apiClient.post("/periodos-solicitud", payload, true);
      console.log("Periodo creado exitosamente");
      return response;
    } catch (error) {
      console.error("Error al crear periodo:", error);
      throw error;
    }
  }

  /**
   * Actualizar un periodo existente
   * @param {number} id - ID del periodo
   * @param {Object} periodoData - Datos actualizados
   * @returns {Promise<Object>} Periodo actualizado
   */
  async actualizar(id, periodoData) {
    try {
      const payload = this.mapToApiPayload(periodoData);
      console.log("Payload UPDATE →", payload);
      const response = await apiClient.put(`/periodos-solicitud/${id}`, payload, true);
      console.log(`Periodo ${id} actualizado exitosamente`);
      return response;
    } catch (error) {
      console.error(`Error al actualizar periodo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cambiar estado de un periodo
   * @param {number} id - ID del periodo
   * @param {string} nuevoEstado - Nuevo estado (BORRADOR, ACTIVO, CERRADO)
   * @returns {Promise<Object>} Periodo actualizado
   */
  async cambiarEstado(id, nuevoEstado) {
    try {
      console.log("cambiarEstado", id, nuevoEstado)
      const response = await apiClient.put(
        `/periodos-solicitud/${id}/estado`,
        { estado: nuevoEstado },
        true
      );
      console.log(`Estado del periodo ${id} cambiado a ${nuevoEstado}`);
      return response;
    } catch (error) {
      console.error(`Error al cambiar estado del periodo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar fechas de un periodo
   * @param {number} id - ID del periodo
   * @param {Object} fechas - Objeto con fechaInicio y fechaFin
   * @returns {Promise<Object>} Periodo actualizado
   */
  async actualizarFechas(id, fechas) {
    try {
      console.log("%c📅 ACTUALIZAR FECHAS - Payload", "color: #f59e0b; font-weight: bold; font-size: 14px;");
      console.log("📍 URL:", `PUT /periodos-solicitud/${id}/fechas`);
      console.log("📦 Payload:", fechas);
      console.table(fechas);
      
      const response = await apiClient.put(
        `/periodos-solicitud/${id}/fechas`,
        fechas,
        true
      );
      console.log(`Fechas del periodo ${id} actualizadas exitosamente`);
      return response;
    } catch (error) {
      console.error(`Error al actualizar fechas del periodo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un periodo
   * @param {number} id - ID del periodo
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    try {
      console.log("%c🗑️ ELIMINAR PERIODO - Request", "color: #dc2626; font-weight: bold; font-size: 14px;");
      console.log("📍 URL:", `DELETE /periodos-solicitud/${id}`);
      console.log("🆔 ID del periodo:", id);
      console.log("📦 Payload: (ninguno - DELETE no lleva body)");
      
      await apiClient.delete(`/periodos-solicitud/${id}`, true);
      console.log(`✅ Periodo ${id} eliminado exitosamente`);
    } catch (error) {
      console.error(`Error al eliminar periodo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Generar codigo de periodo automaticamente (YYYYMM)
   * @param {Date} fecha - Fecha para generar el codigo
   * @returns {string} Codigo del periodo
   */
  generarCodigoPeriodo(fecha = new Date()) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  }

  /**
   * Generar descripcion del periodo automaticamente
   * @param {Date} fecha - Fecha para generar la descripcion
   * @returns {string} Descripcion del periodo
   */
  generarDescripcionPeriodo(fecha = new Date()) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }
}

export const periodoSolicitudService = new PeriodoSolicitudService();
