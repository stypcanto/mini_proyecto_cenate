// ========================================================================
// 🔌 periodoMedicoDisponibilidadService.js – Servicio de API para Períodos Médicos de Disponibilidad
// ========================================================================
// Comunica con backend endpoints para gestionar períodos globales de disponibilidad médica
// Base URL: /api/periodos-medicos-disponibilidad
// Controller: PeriodoMedicoDisponibilidadController
// ========================================================================

import apiClient from './apiClient';

const BASE_URL = '/periodos-medicos-disponibilidad';

/**
 * Lista todos los períodos médicos de disponibilidad
 * @returns {Promise} Lista de períodos
 */
export const listarTodos = () => {
  return apiClient.get(BASE_URL);
};

/**
 * Lista solo los períodos activos
 * @returns {Promise} Lista de períodos activos
 */
export const listarActivos = () => {
  return apiClient.get(`${BASE_URL}/activos`);
};

/**
 * Lista solo los períodos vigentes
 * @returns {Promise} Lista de períodos vigentes
 */
export const listarVigentes = () => {
  return apiClient.get(`${BASE_URL}/vigentes`);
};

/**
 * Lista los años disponibles de períodos
 * @returns {Promise} Lista de años (números)
 */
export const listarAnios = () => {
  return apiClient.get(`${BASE_URL}/anios`);
};

/**
 * Obtiene un período por su ID
 * @param {number} id - ID del período
 * @returns {Promise} Período encontrado
 */
export const obtenerPorId = (id) => {
  return apiClient.get(`${BASE_URL}/${id}`);
};

/**
 * Crea un nuevo período médico de disponibilidad
 * @param {Object} data - Datos del período
 *   {
 *     anio: number (ej: 2026),
 *     periodo: string (formato YYYYMM, ej: "202601"),
 *     descripcion: string,
 *     fechaInicio: string (formato YYYY-MM-DD),
 *     fechaFin: string (formato YYYY-MM-DD)
 *   }
 * @returns {Promise} Período creado
 */
export const crear = (data) => {
  return apiClient.post(BASE_URL, data);
};

/**
 * Actualiza un período médico de disponibilidad
 * @param {number} id - ID del período
 * @param {Object} data - Datos actualizados (misma estructura que crear)
 * @returns {Promise} Período actualizado
 */
export const actualizar = (id, data) => {
  return apiClient.put(`${BASE_URL}/${id}`, data);
};

/**
 * Cambia el estado de un período
 * @param {number} id - ID del período
 * @param {string} estado - Nuevo estado (ACTIVO, CERRADO, BORRADOR, ANULADO)
 * @returns {Promise} Período actualizado
 */
export const cambiarEstado = (id, estado) => {
  return apiClient.put(`${BASE_URL}/${id}/estado`, { estado });
};

/**
 * Elimina un período médico de disponibilidad
 * @param {number} id - ID del período
 * @returns {Promise} Respuesta de eliminación
 */
export const eliminar = (id) => {
  return apiClient.delete(`${BASE_URL}/${id}`);
};

// ========================================================================
// 📦 EXPORTACIÓN DEL SERVICIO
// ========================================================================

const periodoMedicoDisponibilidadService = {
  listarTodos,
  listarActivos,
  listarVigentes,
  listarAnios,
  obtenerPorId,
  crear,
  actualizar,
  cambiarEstado,
  eliminar,
};

export default periodoMedicoDisponibilidadService;
