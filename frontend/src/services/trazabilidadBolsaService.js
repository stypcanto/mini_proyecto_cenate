import apiClient from './apiClient';

/**
 * v1.75.0: Servicio para el timeline de trazabilidad de solicitudes de bolsa.
 * Endpoint: GET /api/bolsas/solicitudes/trazabilidad/{idSolicitud}
 */
const trazabilidadBolsaService = {
    /**
     * Obtiene el timeline completo del ciclo de vida de una solicitud.
     * @param {number} idSolicitud
     * @returns {Promise} { idSolicitud, pacienteDni, pacienteNombre, estadoActual, descripcionEstadoActual, timeline[] }
     */
    obtenerTrazabilidad: (idSolicitud) =>
        apiClient.get(`/bolsas/solicitudes/trazabilidad/${idSolicitud}`, true),
};

export default trazabilidadBolsaService;
