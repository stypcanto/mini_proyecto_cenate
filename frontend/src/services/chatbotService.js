// ========================================================================
// CHATBOT SERVICE - CENATE 2025
// ========================================================================
// Servicio para interactuar con endpoints del ChatBot de Citas
// ========================================================================

import apiClient from '../lib/apiClient';

const chatbotService = {
  // ========================================================================
  // CONSULTA DE PACIENTE
  // ========================================================================

  /**
   * Consultar datos del paciente por documento
   * @param {string} documento - DNI o CE del paciente
   * @returns {Promise} Datos del paciente con servicios disponibles
   */
  consultarPaciente: async (documento) => {
    try {
      return await apiClient.get(`/chatbot/documento/${documento}`);
    } catch (error) {
      console.error('Error al consultar paciente:', error);
      throw error;
    }
  },

  /**
   * Obtener atenciones del paciente en CENATE
   * @param {string} documento - DNI del paciente
   */
  getAtencionesCenate: async (documento) => {
    try {
      return await apiClient.get(`/chatbot/atencioncenate?documento=${documento}`);
    } catch (error) {
      console.error('Error al obtener atenciones CENATE:', error);
      throw error;
    }
  },

  /**
   * Obtener atenciones globales del paciente
   * @param {string} documento - DNI del paciente
   */
  getAtencionesGlobal: async (documento) => {
    try {
      return await apiClient.get(`/chatbot/atencionglobal/${documento}`);
    } catch (error) {
      console.error('Error al obtener atenciones globales:', error);
      throw error;
    }
  },

  // ========================================================================
  // DISPONIBILIDAD
  // ========================================================================

  /**
   * Obtener fechas disponibles por codigo de servicio (API v2)
   * @param {string} codServicio - Codigo del servicio
   * @returns {Promise} Lista de fechas y turnos disponibles
   */
  getFechasDisponibles: async (codServicio) => {
    try {
      return await apiClient.get(`/v2/chatbot/disponibilidad/servicio?codServicio=${encodeURIComponent(codServicio)}`);
    } catch (error) {
      console.error('Error al obtener fechas disponibles:', error);
      throw error;
    }
  },

  /**
   * Obtener slots/horarios disponibles por fecha y servicio (API v2)
   * @param {string} fechaCita - Fecha en formato YYYY-MM-DD
   * @param {string} codServicio - Codigo del servicio
   * @returns {Promise} Lista de slots con horarios y profesionales
   */
  getSlotsDisponibles: async (fechaCita, codServicio) => {
    try {
      const params = new URLSearchParams({
        fecha_cita: fechaCita,
        cod_servicio: codServicio
      });
      return await apiClient.get(`/v2/chatbot/disponibilidad/servicio-detalle?${params.toString()}`);
    } catch (error) {
      console.error('Error al obtener slots disponibles:', error);
      throw error;
    }
  },

  // ========================================================================
  // SOLICITUDES DE CITA
  // ========================================================================

  /**
   * Crear una nueva solicitud de cita
   * @param {Object} solicitud - Datos de la solicitud
   * @returns {Promise} Solicitud creada
   */
  crearSolicitud: async (solicitud) => {
    try {
      return await apiClient.post('/v1/chatbot/solicitud', solicitud);
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      throw error;
    }
  },

  /**
   * Actualizar una solicitud existente
   * @param {number} idSolicitud - ID de la solicitud
   * @param {Object} solicitud - Datos actualizados
   */
  actualizarSolicitud: async (idSolicitud, solicitud) => {
    try {
      return await apiClient.put(`/v1/chatbot/solicitud/${idSolicitud}`, solicitud);
    } catch (error) {
      console.error('Error al actualizar solicitud:', error);
      throw error;
    }
  },

  /**
   * Actualizar solo el estado de una solicitud
   * @param {number} idSolicitud - ID de la solicitud
   * @param {string} estado - Nuevo estado
   * @param {string} observacion - Observacion opcional
   */
  actualizarEstado: async (idSolicitud, estado, observacion = '') => {
    try {
      const params = new URLSearchParams({ estado });
      if (observacion) params.append('observacion', observacion);
      return await apiClient.put(`/v1/chatbot/solicitud/estado/${idSolicitud}?${params.toString()}`, {});
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  },

  /**
   * Obtener solicitud por ID
   * @param {number} idSolicitud - ID de la solicitud
   */
  getSolicitudById: async (idSolicitud) => {
    try {
      return await apiClient.get(`/v1/chatbot/solicitud/${idSolicitud}`);
    } catch (error) {
      console.error('Error al obtener solicitud:', error);
      throw error;
    }
  },

  /**
   * Obtener solicitudes de un paciente
   * @param {string} docPaciente - DNI del paciente
   */
  getSolicitudesPaciente: async (docPaciente) => {
    try {
      return await apiClient.get(`/v1/chatbot/solicitud/paciente/${docPaciente}`);
    } catch (error) {
      console.error('Error al obtener solicitudes del paciente:', error);
      throw error;
    }
  },

  // ========================================================================
  // ESTADOS DE CITA
  // ========================================================================

  /**
   * Obtener catalogo de estados de cita
   */
  getEstadosCita: async () => {
    try {
      return await apiClient.get('/v1/chatbot/estado-cita');
    } catch (error) {
      console.error('Error al obtener estados de cita:', error);
      throw error;
    }
  },

  // ========================================================================
  // REPORTES Y DASHBOARD
  // ========================================================================

  /**
   * Obtener KPIs del dashboard
   * @param {Object} filtros - Filtros opcionales (fi, ff, areaHosp, servicio)
   */
  getKPIs: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      if (filtros.fi) params.append('fi', filtros.fi);
      if (filtros.ff) params.append('ff', filtros.ff);
      if (filtros.areaHosp) params.append('areaHosp', filtros.areaHosp);
      if (filtros.servicio) params.append('servicio', filtros.servicio);

      const query = params.toString();
      return await apiClient.get(`/v1/chatbot/reportes/dashboard/kpis${query ? '?' + query : ''}`);
    } catch (error) {
      console.error('Error al obtener KPIs:', error);
      throw error;
    }
  },

  /**
   * Obtener distribucion por estado
   */
  getEstadoPaciente: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
      const query = params.toString();
      return await apiClient.get(`/v1/chatbot/reportes/dashboard/estado-paciente${query ? '?' + query : ''}`);
    } catch (error) {
      console.error('Error al obtener estado paciente:', error);
      throw error;
    }
  },

  /**
   * Obtener top servicios
   */
  getTopServicios: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
      const query = params.toString();
      return await apiClient.get(`/v1/chatbot/reportes/dashboard/top-servicios${query ? '?' + query : ''}`);
    } catch (error) {
      console.error('Error al obtener top servicios:', error);
      throw error;
    }
  },

  /**
   * Obtener evolucion temporal
   */
  getEvolucion: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
      const query = params.toString();
      return await apiClient.get(`/v1/chatbot/reportes/dashboard/evolucion${query ? '?' + query : ''}`);
    } catch (error) {
      console.error('Error al obtener evolucion:', error);
      throw error;
    }
  },

  /**
   * Obtener top profesionales
   */
  getTopProfesionales: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
      const query = params.toString();
      return await apiClient.get(`/v1/chatbot/reportes/dashboard/top-profesionales${query ? '?' + query : ''}`);
    } catch (error) {
      console.error('Error al obtener top profesionales:', error);
      throw error;
    }
  },

  /**
   * Buscar citas con filtros avanzados
   * @param {Object} filtros - Objeto con filtros de busqueda
   */
  buscarCitas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();

      // Mapear filtros a parametros de la API
      if (filtros.fechaInicio) params.append('fi', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('ff', filtros.fechaFin);
      if (filtros.periodo) params.append('periodo', filtros.periodo);
      if (filtros.docPaciente) params.append('docPaciente', filtros.docPaciente);
      if (filtros.numDocPers) params.append('numDocPers', filtros.numDocPers);
      if (filtros.areaHosp) params.append('areaHosp', filtros.areaHosp);
      if (filtros.servicio) params.append('servicio', filtros.servicio);
      if (filtros.estadoPaciente) params.append('estadoPaciente', filtros.estadoPaciente);

      const query = params.toString();
      return await apiClient.get(`/v1/chatbot/reportes/citas/buscar${query ? '?' + query : ''}`);
    } catch (error) {
      console.error('Error al buscar citas:', error);
      throw error;
    }
  }
};

export default chatbotService;
