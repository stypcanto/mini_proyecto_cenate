import apiClient from '../lib/apiClient';

/**
 * 🦟 Servicio de API - Módulo Dengue
 * v1.0.0 - Gestión de casos dengue e importación desde Excel
 *
 * Endpoints:
 * - POST /api/dengue/cargar-excel - Cargar Excel con casos
 * - GET /api/dengue/casos - Listar casos con paginación
 * - GET /api/dengue/buscar - Buscar con filtros
 * - GET /api/dengue/estadisticas - Estadísticas
 */

const API_BASE_URL = '/dengue';

/**
 * Carga un archivo Excel con casos dengue
 * @param {File} archivo - Archivo Excel (.xlsx)
 * @param {number} usuarioId - ID del usuario que realiza la carga
 * @returns {Promise<Object>} - DengueImportResultDTO con resultados
 */
export const cargarExcelDengue = async (archivo, usuarioId) => {
  try {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('usuarioId', usuarioId);

    const response = await apiClient.uploadFile(
      `${API_BASE_URL}/cargar-excel`,
      formData
    );
    return response;
  } catch (error) {
    console.error('Error cargando Excel dengue:', error);
    throw error;
  }
};

/**
 * Lista todos los casos dengue con paginación
 * @param {number} page - Número de página (default: 0)
 * @param {number} size - Tamaño de página (default: 30)
 * @param {string} sortBy - Campo de ordenamiento (default: fechaSolicitud)
 * @param {string} sortDirection - ASC o DESC (default: DESC)
 * @returns {Promise<Object>} - Page con casos dengue
 */
export const listarCasosDengue = async (
  page = 0,
  size = 30,
  sortBy = 'fechaSolicitud',
  sortDirection = 'DESC'
) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/casos`, {
      params: {
        page,
        size,
        sortBy,
        sortDirection,
      },
    });
    return response;
  } catch (error) {
    console.error('Error listando casos dengue:', error);
    throw error;
  }
};

/**
 * Busca casos dengue con filtros opcionales
 * @param {Object} filtros - Objeto con filtros
 * @param {string} filtros.dni - DNI del paciente (opcional)
 * @param {string} filtros.dxMain - Código CIE-10 (opcional)
 * @param {number} filtros.page - Número de página (default: 0)
 * @param {number} filtros.size - Tamaño de página (default: 30)
 * @param {string} filtros.sortBy - Campo de ordenamiento (default: fechaSolicitud)
 * @param {string} filtros.sortDirection - ASC o DESC (default: DESC)
 * @returns {Promise<Object>} - Page con casos filtrados
 */
export const buscarCasosDengue = async (filtros = {}) => {
  try {
    const {
      dni = '',
      dxMain = '',
      page = 0,
      size = 30,
      sortBy = 'fechaSolicitud',
      sortDirection = 'DESC',
    } = filtros;

    const response = await apiClient.get(`${API_BASE_URL}/buscar`, {
      params: {
        dni: dni || undefined,
        dxMain: dxMain || undefined,
        page,
        size,
        sortBy,
        sortDirection,
      },
    });
    return response;
  } catch (error) {
    console.error('Error buscando casos dengue:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de los casos dengue
 * @returns {Promise<Object>} - Objeto con estadísticas
 */
export const obtenerEstadisticasDengue = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas`);
    return response;
  } catch (error) {
    console.error('Error obteniendo estadísticas dengue:', error);
    throw error;
  }
};

/**
 * Hook helper para normalizar errores de API
 */
export const formatearErrorDengue = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.detalles) {
    return error.response.data.detalles;
  }
  return error.message || 'Error desconocido';
};

export default {
  cargarExcelDengue,
  listarCasosDengue,
  buscarCasosDengue,
  obtenerEstadisticasDengue,
  formatearErrorDengue,
};
