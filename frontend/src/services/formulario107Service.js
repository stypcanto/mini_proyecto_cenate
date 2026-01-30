// ========================================================================
// formulario107Service.js – Cliente API Formulario 107 (CENATE 2025)
// ------------------------------------------------------------------------
// Servicio para importación masiva de pacientes desde archivos Excel
// Integración con endpoints del backend ImportExcelController
// ========================================================================

import apiClient from '../lib/apiClient';

const API_BASE = '/api/import-excel';

/**
 * Importar archivo Excel con lista de pacientes
 * @param {File} file - Archivo Excel (.xlsx)
 * @returns {Promise} Resultado de la importación con estadísticas
 */
export const importarPacientesExcel = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // ✅ NO establecer Content-Type manualmente
    // El navegador lo establece automáticamente con el boundary correcto
    const response = await apiClient.post(`${API_BASE}/pacientes`, formData, true);

    return response.data;
};

/**
 * Obtener lista de todas las cargas importadas
 * @returns {Promise<Array>} Lista de cargas con estadísticas
 */
export const obtenerListaCargas = async () => {
    const response = await apiClient.get(`${API_BASE}/cargas`, true);
    // Backend devuelve {status, data, message}, extraemos solo el array
    return response.data || [];
};

/**
 * Obtener detalles de una carga específica (pacientes importados)
 * @param {number} idCarga - ID de la carga
 * @returns {Promise} Datos de la carga con pacientes y errores
 */
export const obtenerDatosCarga = async (idCarga) => {
    const response = await apiClient.get(`${API_BASE}/pacientes/${idCarga}/datos`, true);
    // Backend devuelve {status, data, message}, extraemos solo el objeto de datos
    return response.data || {};
};

/**
 * Eliminar una carga
 * @param {number} idCarga - ID de la carga a eliminar
 * @returns {Promise} Confirmación de eliminación
 */
export const eliminarCarga = async (idCarga) => {
    const response = await apiClient.delete(`${API_BASE}/cargas/${idCarga}`, true);
    return response.data;
};

/**
 * Exportar datos de una carga a Excel
 * @param {number} idCarga - ID de la carga
 * @returns {Promise<Blob>} Archivo Excel para descarga
 */
export const exportarCargaExcel = async (idCarga) => {
    const response = await apiClient.get(`${API_BASE}/cargas/${idCarga}/exportar`, true);
    return response;
};

// ========================================================================
// v3.0.0 (2026-01-29): NUEVAS FUNCIONALIDADES - MIGRACIÓN A DIM_SOLICITUD_BOLSA
// ========================================================================
// Los pacientes ahora se almacenan en dim_solicitud_bolsa con id_bolsa=107
// Estos métodos permiten listar, buscar y obtener estadísticas
// URLs integradas dentro del módulo "Bolsas de Pacientes"

const API_BOLSA107 = '/api/bolsas/modulo107';

/**
 * Listar TODOS los pacientes del Módulo 107 con paginación
 *
 * Novedad v3.0: Utiliza dim_solicitud_bolsa en lugar de bolsa_107_item
 *
 * @param {number} page - Número de página (0-indexed, default: 0)
 * @param {number} size - Cantidad de registros por página (default: 30)
 * @param {string} sortBy - Campo para ordenamiento (default: fechaSolicitud)
 * @param {string} sortDirection - ASC o DESC (default: DESC)
 * @returns {Promise<Object>} {total, page, size, totalPages, pacientes[]}
 */
export const listarPacientesModulo107 = async (page = 0, size = 30, sortBy = 'fechaSolicitud', sortDirection = 'DESC') => {
    const response = await apiClient.get(`${API_BOLSA107}/pacientes`, true, {
        params: {
            page,
            size,
            sortBy,
            sortDirection
        }
    });
    return response.data;
};

/**
 * Buscar pacientes con filtros avanzados
 *
 * Permite búsqueda multi-criterio:
 * - DNI: búsqueda parcial (LIKE)
 * - Nombre: búsqueda case-insensitive
 * - IPRESS: búsqueda exacta
 * - Estado: filtro por estado de gestión de citas
 * - Fechas: rango de fechas de solicitud
 *
 * @param {Object} filtros - Objeto con filtros opcionales:
 *   - dni {string} DNI del paciente
 *   - nombre {string} Nombre del paciente
 *   - codigoIpress {string} Código IPRESS
 *   - estadoId {number} ID del estado
 *   - fechaDesde {string} Fecha inicio (ISO format)
 *   - fechaHasta {string} Fecha fin (ISO format)
 *   - page {number} Página (default: 0)
 *   - size {number} Cantidad por página (default: 30)
 * @returns {Promise<Object>} {total, page, size, totalPages, pacientes[]}
 */
export const buscarPacientesModulo107 = async (filtros = {}) => {
    const params = {
        page: filtros.page || 0,
        size: filtros.size || 30,
        ...(filtros.dni && { dni: filtros.dni }),
        ...(filtros.nombre && { nombre: filtros.nombre }),
        ...(filtros.codigoIpress && { codigoIpress: filtros.codigoIpress }),
        ...(filtros.estadoId && { estadoId: filtros.estadoId }),
        ...(filtros.fechaDesde && { fechaDesde: filtros.fechaDesde }),
        ...(filtros.fechaHasta && { fechaHasta: filtros.fechaHasta }),
    };

    const response = await apiClient.get(`${API_BOLSA107}/pacientes/buscar`, true, {
        params
    });
    return response.data;
};

/**
 * Obtener estadísticas completas del Módulo 107
 *
 * Retorna un dashboard completo con:
 * - KPIs generales (total, atendidos, pendientes, etc.)
 * - Distribución por estado
 * - Distribución por especialidad
 * - Top 10 IPRESS
 * - Evolución temporal (últimos 30 días)
 *
 * @returns {Promise<Object>} {kpis, distribucion_estado[], distribucion_especialidad[], top_10_ipress[], evolucion_temporal[]}
 */
export const obtenerEstadisticasModulo107 = async () => {
    const response = await apiClient.get(`${API_BOLSA107}/estadisticas`, true);
    return response.data;
};

export default {
    importarPacientesExcel,
    obtenerListaCargas,
    obtenerDatosCarga,
    eliminarCarga,
    exportarCargaExcel,
    // v3.0.0 new methods
    listarPacientesModulo107,
    buscarPacientesModulo107,
    obtenerEstadisticasModulo107,
};
