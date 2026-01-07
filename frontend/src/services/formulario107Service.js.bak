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

export default {
    importarPacientesExcel,
    obtenerListaCargas,
    obtenerDatosCarga,
    eliminarCarga,
    exportarCargaExcel,
};
