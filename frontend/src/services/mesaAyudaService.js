import apiClient from '../lib/apiClient';

const ENDPOINT = '/mesa-ayuda';

/**
 * Servicio para interactuar con la API de Mesa de Ayuda
 * Métodos para crear, obtener, responder y eliminar tickets
 *
 * @version v1.64.0 (2026-02-18)
 */
export const mesaAyudaService = {
  /**
   * Crear un nuevo ticket
   * @param {Object} ticketData Datos del ticket (titulo, descripcion, prioridad, etc.)
   * @returns {Promise} Respuesta de la API
   */
  crearTicket: async (ticketData) => {
    console.log('Creating new ticket:', ticketData);
    const response = await apiClient.post(`${ENDPOINT}/tickets`, ticketData, true);
    return response;
  },

  /**
   * Obtener todos los tickets CON paginación
   * @param {number} page Número de página (default 0)
   * @param {number} size Tamaño de página (default 20)
   * @param {string} estado Filtro por estado (opcional)
   * @returns {Promise} Página de tickets
   */
  obtenerTodos: async (page = 0, size = 20, estado = null) => {
    let url = `${ENDPOINT}/tickets?page=${page}&size=${size}`;
    if (estado) {
      url += `&estado=${encodeURIComponent(estado)}`;
    }
    console.log('Fetching all tickets:', { page, size, estado });
    const response = await apiClient.get(url, true);
    return { data: response };
  },

  /**
   * Obtener TODOS los tickets SIN paginación (para filtrado completo en frontend)
   * @param {string} estado Filtro por estado (opcional)
   * @returns {Promise} Lista completa de tickets
   */
  obtenerTodosSinPaginacion: async (estado = null) => {
    let url = `${ENDPOINT}/tickets/all`;
    if (estado) {
      url += `?estado=${encodeURIComponent(estado)}`;
    }
    console.log('Fetching ALL tickets without pagination:', { estado });
    const response = await apiClient.get(url, true);
    return { data: response };
  },

  /**
   * Obtener un ticket específico por ID
   * @param {number} id ID del ticket
   * @returns {Promise} Datos del ticket
   */
  obtenerPorId: async (id) => {
    console.log('Fetching ticket with ID:', id);
    const response = await apiClient.get(`${ENDPOINT}/tickets/${id}`, true);
    return response;
  },

  /**
   * Obtener tickets de un médico específico
   * @param {number} idMedico ID del médico
   * @param {number} page Número de página (default 0)
   * @param {number} size Tamaño de página (default 20)
   * @returns {Promise} Página de tickets del médico
   */
  obtenerPorMedico: async (idMedico, page = 0, size = 20) => {
    const params = { page, size };
    console.log('Fetching tickets for medico:', idMedico);
    const response = await apiClient.get(`${ENDPOINT}/tickets/medico/${idMedico}`, true, params);
    return { data: response };
  },

  /**
   * Obtener tickets activos (NUEVO, EN_PROCESO, RESUELTO)
   * @param {number} page Número de página (default 0)
   * @param {number} size Tamaño de página (default 20)
   * @returns {Promise} Página de tickets activos
   */
  obtenerActivos: async (page = 0, size = 20) => {
    const params = { page, size };
    console.log('Fetching active tickets');
    const response = await apiClient.get(`${ENDPOINT}/tickets/activos`, true, params);
    return { data: response };
  },

  /**
   * Responder un ticket
   * @param {number} id ID del ticket
   * @param {Object} responderData Datos de la respuesta (respuesta, estado, idPersonalMesa, nombrePersonalMesa)
   * @returns {Promise} Ticket actualizado
   */
  responderTicket: async (id, responderData) => {
    console.log('Responding to ticket:', id, responderData);
    const response = await apiClient.put(`${ENDPOINT}/tickets/${id}/responder`, responderData, true);
    return response;
  },

  /**
   * Cambiar el estado de un ticket
   * @param {number} id ID del ticket
   * @param {string} nuevoEstado Nuevo estado (NUEVO, EN_PROCESO, RESUELTO, CERRADO)
   * @returns {Promise} Ticket actualizado
   */
  cambiarEstado: async (id, nuevoEstado) => {
    console.log('Changing ticket status:', id, nuevoEstado);
    const response = await apiClient.put(`${ENDPOINT}/tickets/${id}/estado`, { estado: nuevoEstado }, true);
    return response;
  },

  /**
   * Eliminar un ticket (soft delete)
   * @param {number} id ID del ticket
   * @returns {Promise} Respuesta de la API
   */
  eliminarTicket: async (id) => {
    console.log('Deleting ticket:', id);
    await apiClient.delete(`${ENDPOINT}/tickets/${id}`, true);
  },

  /**
   * Obtener KPIs del sistema de Mesa de Ayuda
   * @returns {Promise} KPIs (totalTickets, abiertos, enProceso, resueltos, cerrados, tasaResolucion)
   */
  obtenerKPIs: async () => {
    console.log('Fetching KPIs');
    const response = await apiClient.get(`${ENDPOINT}/kpis`, true);
    return { data: response };
  },

  /**
   * Obtener preview del siguiente número de ticket
   * @returns {Promise} { siguienteNumero: "0001-2026" }
   */
  obtenerSiguienteNumero: async () => {
    const response = await apiClient.get(`${ENDPOINT}/siguiente-numero`, true);
    return response;
  },

  /**
   * Obtener lista de personal con rol MESA_DE_AYUDA
   * @returns {Promise} Lista de personal [{ idPersonal, nombreCompleto }]
   */
  obtenerPersonalMesaAyuda: async () => {
    console.log('Fetching personal Mesa de Ayuda');
    const response = await apiClient.get(`${ENDPOINT}/personal`, true);
    return response;
  },

  /**
   * Asignar personal a un ticket
   * @param {number} id ID del ticket
   * @param {Object} data { idPersonalAsignado, nombrePersonalAsignado }
   * @returns {Promise} Ticket actualizado
   */
  asignarTicket: async (id, data) => {
    console.log('Assigning ticket:', id, data);
    const response = await apiClient.put(`${ENDPOINT}/tickets/${id}/asignar`, data, true);
    return response;
  },

  /**
   * Desasignar personal de un ticket
   * @param {number} id ID del ticket
   * @returns {Promise} Ticket actualizado
   */
  desasignarTicket: async (id) => {
    console.log('Unassigning ticket:', id);
    const response = await apiClient.put(`${ENDPOINT}/tickets/${id}/desasignar`, {}, true);
    return response;
  },

  /**
   * Asignar personal a múltiples tickets a la vez
   * @param {Object} data { ticketIds: [1,2,3], idPersonalAsignado: 123, nombrePersonalAsignado: "..." }
   */
  asignarMasivo: async (data) => {
    console.log('Bulk assigning tickets:', data);
    const response = await apiClient.put(`${ENDPOINT}/tickets/asignar-masivo`, data, true);
    return response;
  },

  /**
   * Actualizar teléfonos del paciente asociado a un ticket
   * @param {number} id ID del ticket
   * @param {Object} telefonos { telefonoPrincipal, telefonoAlterno }
   * @returns {Promise} Ticket actualizado
   */
  actualizarTelefonos: async (id, telefonos) => {
    console.log('Updating telefonos for ticket:', id, telefonos);
    const response = await apiClient.put(`${ENDPOINT}/tickets/${id}/telefonos`, telefonos, true);
    return response;
  },

  /**
   * Obtener motivos predefinidos (NUEVO v1.64.0)
   * @returns {Promise} Lista de motivos para el combo de CrearTicketModal
   */
  obtenerMotivos: async () => {
    console.log('Fetching motivos para combo');
    const response = await apiClient.get(`${ENDPOINT}/motivos`, true);
    return response;
  },

  /**
   * Obtener respuestas predefinidas para ResponderTicketModal (NUEVO v1.65.10)
   * @returns {Promise} Lista de respuestas predefinidas
   */
  obtenerRespuestasPredefinidas: async () => {
    console.log('Fetching respuestas predefinidas');
    const response = await apiClient.get(`${ENDPOINT}/respuestas-predefinidas`, true);
    return response;
  },

  /**
   * Enviar paciente del ticket a la Bolsa de Reprogramación (NUEVO v1.68.0)
   * Solo para motivo PS_CITA_REPROGRAMADA
   * @param {number} id ID del ticket
   * @returns {Promise} Resultado de la operación
   */
  enviarABolsaReprogramacion: async (id) => {
    console.log('Enviando paciente a Bolsa Reprogramación - Ticket ID:', id);
    const response = await apiClient.post(`${ENDPOINT}/tickets/${id}/bolsa-reprogramacion`, {}, true);
    return response;
  },

  /**
   * Obtener estadísticas completas de Mesa de Ayuda (v1.68.0)
   * @returns {Promise} Objeto con resumen, porEstado, porPrioridad, porMotivo, porPersonal, porDia, tiempoPromedio
   */
  obtenerEstadisticas: async () => {
    const response = await apiClient.get(`${ENDPOINT}/estadisticas`, true);
    return response;
  },

  /**
   * Estadísticas de un operador filtradas por período (v1.69.1)
   * @param {string} nombre Nombre completo del operador
   * @param {string} periodo "dia" | "semana" | "mes" | "ano"
   */
  obtenerEstadisticasPersonal: async (nombre, periodo = 'mes') => {
    const response = await apiClient.getWithParams(`${ENDPOINT}/estadisticas/personal`, { nombre, periodo }, true);
    return response;
  },
};
