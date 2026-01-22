import axiosInstance from './axiosInstance';

/**
 * 📊 Servicio de API - Módulo Bolsas
 * v1.0.0 - Gestión de bolsas de pacientes, importación y solicitudes
 */

const API_BASE_URL = '/api/bolsas';

// ========================================================================
// 🔄 BOLSAS - Gestión de Bolsas de Pacientes
// ========================================================================

/**
 * Obtiene todas las bolsas de pacientes
 * @returns {Promise<Array>} - Listado de bolsas
 */
export const obtenerBolsas = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener bolsas:', error);
    throw error;
  }
};

/**
 * Obtiene una bolsa por ID
 * @param {number} id - ID de la bolsa
 * @returns {Promise<Object>} - Detalles de la bolsa
 */
export const obtenerBolsaPorId = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener bolsa ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva bolsa
 * @param {Object} dataBolsa - Datos de la bolsa a crear
 * @returns {Promise<Object>} - Bolsa creada
 */
export const crearBolsa = async (dataBolsa) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}`, dataBolsa);
    return response.data;
  } catch (error) {
    console.error('Error al crear bolsa:', error);
    throw error;
  }
};

/**
 * Actualiza una bolsa existente
 * @param {number} id - ID de la bolsa
 * @param {Object} dataBolsa - Datos a actualizar
 * @returns {Promise<Object>} - Bolsa actualizada
 */
export const actualizarBolsa = async (id, dataBolsa) => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, dataBolsa);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar bolsa ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una bolsa
 * @param {number} id - ID de la bolsa
 * @returns {Promise<void>}
 */
export const eliminarBolsa = async (id) => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error al eliminar bolsa ${id}:`, error);
    throw error;
  }
};

// ========================================================================
// 📤 IMPORTACIÓN - Cargar desde Excel
// ========================================================================

/**
 * Importa bolsas desde un archivo Excel
 * @param {FormData} formData - Formulario con el archivo
 * @returns {Promise<Object>} - Resultado de la importación
 */
export const importarDesdeExcel = async (formData) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/importar/excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al importar desde Excel:', error);
    throw error;
  }
};

/**
 * Obtiene el historial de importaciones
 * @returns {Promise<Array>} - Listado de importaciones
 */
export const obtenerHistorialImportaciones = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/importaciones/historial`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de importaciones:', error);
    throw error;
  }
};

// ========================================================================
// 📋 SOLICITUDES - Gestión de Solicitudes de Bolsas
// ========================================================================

/**
 * Obtiene todas las solicitudes de bolsas
 * @returns {Promise<Array>} - Listado de solicitudes
 */
export const obtenerSolicitudes = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/solicitudes`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    throw error;
  }
};

/**
 * Obtiene una solicitud por ID
 * @param {number} id - ID de la solicitud
 * @returns {Promise<Object>} - Detalles de la solicitud
 */
export const obtenerSolicitudPorId = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/solicitudes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva solicitud de bolsa
 * @param {Object} dataSolicitud - Datos de la solicitud
 * @returns {Promise<Object>} - Solicitud creada
 */
export const crearSolicitud = async (dataSolicitud) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/solicitudes`, dataSolicitud);
    return response.data;
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    throw error;
  }
};

/**
 * Actualiza una solicitud existente
 * @param {number} id - ID de la solicitud
 * @param {Object} dataSolicitud - Datos a actualizar
 * @returns {Promise<Object>} - Solicitud actualizada
 */
export const actualizarSolicitud = async (id, dataSolicitud) => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/solicitudes/${id}`, dataSolicitud);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Aprueba una solicitud
 * @param {number} id - ID de la solicitud
 * @param {Object} notas - Notas opcionales
 * @returns {Promise<Object>} - Solicitud aprobada
 */
export const aprobarSolicitud = async (id, notas = '') => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/solicitudes/${id}/aprobar`, { notas });
    return response.data;
  } catch (error) {
    console.error(`Error al aprobar solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Rechaza una solicitud
 * @param {number} id - ID de la solicitud
 * @param {string} razon - Razón del rechazo
 * @returns {Promise<Object>} - Solicitud rechazada
 */
export const rechazarSolicitud = async (id, razon = '') => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/solicitudes/${id}/rechazar`, { razon });
    return response.data;
  } catch (error) {
    console.error(`Error al rechazar solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una solicitud
 * @param {number} id - ID de la solicitud
 * @returns {Promise<void>}
 */
export const eliminarSolicitud = async (id) => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/solicitudes/${id}`);
  } catch (error) {
    console.error(`Error al eliminar solicitud ${id}:`, error);
    throw error;
  }
};

// ========================================================================
// 📊 ESTADÍSTICAS - Métricas del módulo Bolsas
// ========================================================================

/**
 * Obtiene estadísticas generales del módulo
 * @returns {Promise<Object>} - Estadísticas
 */
export const obtenerEstadisticas = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/estadisticas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

/**
 * Exporta listado de bolsas a Excel
 * @param {Object} filtros - Filtros opcionalesción
 * @returns {Promise<Blob>} - Archivo Excel
 */
export const exportarBolsas = async (filtros = {}) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/exportar/excel`, {
      params: filtros,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar bolsas:', error);
    throw error;
  }
};

export default {
  // Bolsas
  obtenerBolsas,
  obtenerBolsaPorId,
  crearBolsa,
  actualizarBolsa,
  eliminarBolsa,

  // Importación
  importarDesdeExcel,
  obtenerHistorialImportaciones,

  // Solicitudes
  obtenerSolicitudes,
  obtenerSolicitudPorId,
  crearSolicitud,
  actualizarSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  eliminarSolicitud,

  // Estadísticas
  obtenerEstadisticas,
  exportarBolsas,
};
