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
    const response = await apiClient.post(`${ENDPOINT}/tickets`, ticketData);
    return response;
  },

  /**
   * Obtener todos los tickets con paginación
   * @param {number} page Número de página (default 0)
   * @param {number} size Tamaño de página (default 20)
   * @param {string} estado Filtro por estado (opcional)
   * @returns {Promise} Página de tickets
   */
  obtenerTodos: async (page = 0, size = 20, estado = null) => {
    const params = { page, size };
    if (estado) {
      params.estado = estado;
    }
    console.log('Fetching all tickets:', params);
    const response = await apiClient.get(`${ENDPOINT}/tickets`, true, params);
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
   * Obtener tickets activos (ABIERTO, EN_PROCESO, RESUELTO)
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
    const response = await apiClient.put(`${ENDPOINT}/tickets/${id}/responder`, responderData);
    return response;
  },

  /**
   * Cambiar el estado de un ticket
   * @param {number} id ID del ticket
   * @param {string} nuevoEstado Nuevo estado (ABIERTO, EN_PROCESO, RESUELTO, CERRADO)
   * @returns {Promise} Ticket actualizado
   */
  cambiarEstado: async (id, nuevoEstado) => {
    console.log('Changing ticket status:', id, nuevoEstado);
    const response = await apiClient.put(`${ENDPOINT}/tickets/${id}/estado`, { estado: nuevoEstado });
    return response;
  },

  /**
   * Eliminar un ticket (soft delete)
   * @param {number} id ID del ticket
   * @returns {Promise} Respuesta de la API
   */
  eliminarTicket: async (id) => {
    console.log('Deleting ticket:', id);
    await apiClient.delete(`${ENDPOINT}/tickets/${id}`);
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
   * Obtener motivos predefinidos (NUEVO v1.64.0)
   * @returns {Promise} Lista de motivos para el combo de CrearTicketModal
   */
  obtenerMotivos: async () => {
    console.log('Fetching motivos para combo');
    const response = await apiClient.get(`${ENDPOINT}/motivos`, true);
    return response;
  },
};
