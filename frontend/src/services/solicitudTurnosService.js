import apiClient from "../lib/apiClient";

const BASE_URL = "/api/solicitudes-turno";

export const solicitudTurnosService = {


async obtenerTodas(filtros = {}) {
    const params = {
    estado: filtros.estado && filtros.estado !== "TODAS" ? filtros.estado : undefined,
    idPeriodo: filtros.periodo ? Number(filtros.periodo) : undefined,
  };

  console.log("obtenerTodas - PARAMS >>>", params);

  //  USAMOS EL NUEVO MÉTODO
  return apiClient.getWithParams(
    `${BASE_URL}/consultar`,
    params,
    true // auth
  );
  },

  /**
   * Guardar solicitud (crear o actualizar)
   */
  async guardarSolicitud(data) {
    const response = await apiClient.post(BASE_URL, data);
    return response.data;
  },

  /**
   * Obtener solicitud por ID
   */
  async obtenerPorId(id) {
    const data = await apiClient.get(`${BASE_URL}/${id}`, true);
  return data;
  },

  /**
   * Obtener solicitud por periodo e IPRESS
   */
  async obtenerPorPeriodoYIpress(periodo, idIpress) {
    const response = await apiClient.get(
      `${BASE_URL}/periodo/${periodo}/ipress/${idIpress}`
    );
    return response.data;
  },

  /**
   * Listar solicitudes de una IPRESS
   */
  async listarPorIpress(idIpress) {
    const response = await apiClient.get(`${BASE_URL}/ipress/${idIpress}`);
    return response.data;
  },

  /**
   * Listar solicitudes de un periodo
   */
  async listarPorPeriodo(periodo) {
    const response = await apiClient.get(`${BASE_URL}/periodo/${periodo}`);
    return response.data;
  },

  /**
   * Listar solicitudes por estado
   */
  async listarPorEstado(estado) {
    const response = await apiClient.get(`${BASE_URL}/estado/${estado}`);
    return response.data;
  },

  /**
   * Enviar solicitud (cambiar de BORRADOR a ENVIADO)
   */
  async enviarSolicitud(id) {
    const response = await apiClient.post(`${BASE_URL}/${id}/enviar`);
    return response.data;
  },

  /**
   * Aprobar solicitud (solo coordinador)
   */

  async aprobarSolicitud(id) {
    // 
    const data = await apiClient.post(`${BASE_URL}/${id}/aprobar`, {}, true);
    return data;
  },
 /**
   * Rechazar solicitud (solo coordinador)
   */
  async rechazarSolicitud(id, motivo) {
    const body = { motivo };
    const data = await apiClient.post(`${BASE_URL}/${id}/rechazar`, body, true);
    return data;
  },

  /**
   * Actualizar observación de un detalle de solicitud (solo coordinador)
   */
  async actualizarObservacionDetalle(idDetalle, observacion) {
    const body = { observacion };
    const data = await apiClient.put(`${BASE_URL}/detalle/${idDetalle}/observacion`, body, true);
    return data;
  },

  /**
   * Aprobar detalle individual de solicitud (solo coordinador)
   */
  async aprobarDetalle(idDetalle, observacion = "") {
    const body = { observacion };
    const data = await apiClient.post(`${BASE_URL}/detalle/${idDetalle}/aprobar`, body, true);
    return data;
  },

  /**
   * Rechazar detalle individual de solicitud (solo coordinador)
   */
  async rechazarDetalle(idDetalle, observacion) {
    const body = { observacion };
    const data = await apiClient.post(`${BASE_URL}/detalle/${idDetalle}/rechazar`, body, true);
    return data;
  },


  /**
   * Eliminar solicitud (solo BORRADOR)
   */
  async eliminarSolicitud(id) {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Verificar si existe solicitud
   */
  async verificarExistencia(periodo, idIpress) {
    const response = await apiClient.get(`${BASE_URL}/existe`, {
      params: { periodo, idIpress },
    });
    return response.data.existe;
  },

  /**
   * Generar código de periodo (YYYYMM)
   */
  generarCodigoPeriodo(fecha = new Date()) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    return `${year}${month}`;
  },

  /**
   * Generar descripción de periodo
   */
  generarDescripcionPeriodo(fecha = new Date()) {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  },
};
