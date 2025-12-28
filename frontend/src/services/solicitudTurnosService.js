import apiClient from "../lib/apiClient";

const BASE_URL = "/api/solicitud-turnos";

export const solicitudTurnosService = {
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
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
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
    const response = await apiClient.post(`${BASE_URL}/${id}/aprobar`);
    return response.data;
  },

  /**
   * Rechazar solicitud (solo coordinador)
   */
  async rechazarSolicitud(id, motivo) {
    const response = await apiClient.post(`${BASE_URL}/${id}/rechazar`, { motivo });
    return response.data;
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
