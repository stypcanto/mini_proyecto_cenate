import { apiClient } from '../lib/apiClient';

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

    /**
     * v1.75.2: Obtiene el timeline por DNI (solicitud más reciente activa).
     * @param {string} dni
     * @returns {Promise} misma estructura que obtenerTrazabilidad
     */
    obtenerTrazabilidadPorDni: (dni) =>
        apiClient.get(`/bolsas/solicitudes/trazabilidad/por-dni/${dni}`, true),
};

export default trazabilidadBolsaService;
