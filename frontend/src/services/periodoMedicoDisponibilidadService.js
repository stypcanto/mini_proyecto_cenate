// ========================================================================
// 🔌 periodoMedicoDisponibilidadService.js – Servicio de API para Períodos de Control
// ========================================================================
// Comunica con backend endpoints para gestionar períodos de control por área
// Base URL: /api/ctr-periodos
// Controller: CtrPeriodoController
// ✅ v2.0.0: Nueva estructura con PK compuesta (periodo, idArea)
// ✅ v1.63.3: Todas las llamadas incluyen auth=true para enviar token JWT
// ========================================================================

import apiClient from '../lib/apiClient';

const BASE_URL = '/ctr-periodos';

/**
 * Lista todos los períodos de control
 * @returns {Promise} Lista de períodos
 */
export const listarTodos = () => {
  return apiClient.get(BASE_URL, true);
};

/**
 * Lista solo los períodos abiertos (ABIERTO o REABIERTO)
 * @returns {Promise} Lista de períodos abiertos
 */
export const listarActivos = () => {
  return apiClient.get(`${BASE_URL}/abiertos`, true);
};

/**
 * Alias de listarActivos para compatibilidad
 * @returns {Promise} Lista de períodos disponibles
 */
export const listarDisponibles = () => {
  return apiClient.get(`${BASE_URL}/abiertos`, true);
};

/**
 * Lista solo los períodos vigentes (abiertos y dentro del rango de fechas)
 * @returns {Promise} Lista de períodos vigentes
 */
export const listarVigentes = () => {
  return apiClient.get(`${BASE_URL}/vigentes`, true);
};

/**
 * Alias de listarVigentes para compatibilidad
 * @returns {Promise} Lista de períodos vigentes
 */
export const listarVigentesDisponibles = () => {
  return apiClient.get(`${BASE_URL}/vigentes`, true);
};

/**
 * Lista los años disponibles de períodos
 * @returns {Promise} Lista de años (números)
 */
export const listarAnios = async () => {
  const response = await apiClient.get(`${BASE_URL}/anios`, true);
  console.log('Response de /anios:', response);
  return response;
};

/**
 * Alias de listarAnios para compatibilidad
 * @returns {Promise} Lista de años (números)
 */
export const listarAniosDisponibles = async () => {
  const response = await apiClient.get(`${BASE_URL}/anios`, true);
  console.log('Response de /anios-disponibles:', response);
  return response;
};

/**
 * Lista períodos por área específica
 * @param {number} idArea - ID del área
 * @returns {Promise} Lista de períodos del área
 */
export const listarPorArea = (idArea) => {
  return apiClient.get(`${BASE_URL}/area/${idArea}`, true);
};

/**
 * Lista períodos por área y estado
 * @param {number} idArea - ID del área
 * @param {string} estado - Estado del período
 * @returns {Promise} Lista de períodos
 */
export const listarPorAreaYEstado = (idArea, estado) => {
  return apiClient.get(`${BASE_URL}/area/${idArea}/estado/${estado}`, true);
};

/**
 * Lista años disponibles por área
 * @param {number} idArea - ID del área
 * @returns {Promise} Lista de años
 */
export const listarAniosPorArea = (idArea) => {
  return apiClient.get(`${BASE_URL}/area/${idArea}/anios`, true);
};

/**
 * Obtiene un período por su clave compuesta
 * @param {string} periodo - Código del período (YYYYMM)
 * @param {number} idArea - ID del área
 * @returns {Promise} Período encontrado
 */
export const obtenerPorId = (periodo, idArea) => {
  return apiClient.get(`${BASE_URL}/${periodo}/area/${idArea}`, true);
};

/**
 * Crea un nuevo período de control
 * @param {Object} data - Datos del período
 *   {
 *     periodo: string (formato YYYYMM, ej: "202601"),
 *     fechaInicio: string (formato YYYY-MM-DD),
 *     fechaFin: string (formato YYYY-MM-DD),
 *     estado: string (opcional, default: "ABIERTO")
 *   }
 * Nota: idArea se obtiene automáticamente del backend usando dim_personal_cnt
 * @returns {Promise} Período creado
 */
export const crear = (data) => {
  return apiClient.post(BASE_URL, data, true);
};

/**
 * Actualiza un período de control
 * @param {string} periodo - Código del período (YYYYMM)
 * @param {number} idArea - ID del área
 * @param {Object} data - Datos actualizados
 * @returns {Promise} Período actualizado
 */
export const actualizar = (periodo, idArea, data) => {
  return apiClient.put(`${BASE_URL}/${periodo}/area/${idArea}`, data, true);
};

/**
 * Cambia el estado de un período
 * @param {string} periodo - Código del período (YYYYMM)
 * @param {number} idArea - ID del área
 * @param {string} estado - Nuevo estado (ABIERTO, EN_VALIDACION, CERRADO, REABIERTO)
 * @returns {Promise} Período actualizado
 */
export const cambiarEstado = (periodo, idArea, estado) => {
  return apiClient.put(`${BASE_URL}/${periodo}/area/${idArea}/estado`, { estado }, true);
};

/**
 * Elimina un período de control
 * @param {string} periodo - Código del período (YYYYMM)
 * @param {number} idArea - ID del área
 * @returns {Promise} Respuesta de eliminación
 */
export const eliminar = (periodo, idArea) => {
  return apiClient.delete(`${BASE_URL}/${periodo}/area/${idArea}`, true);
};

// ========================================================================
// 📦 EXPORTACIÓN DEL SERVICIO
// ========================================================================

const periodoMedicoDisponibilidadService = {
  listarTodos,
  listarActivos,
  listarDisponibles,
  listarVigentes,
  listarVigentesDisponibles,
  listarAnios,
  listarAniosDisponibles,
  listarPorArea,
  listarPorAreaYEstado,
  listarAniosPorArea,
  obtenerPorId,
  crear,
  actualizar,
  cambiarEstado,
  eliminar,
};

export default periodoMedicoDisponibilidadService;
