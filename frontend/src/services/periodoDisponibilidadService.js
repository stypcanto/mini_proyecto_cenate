// ========================================================================
// 🔌 periodoDisponibilidadService.js – Servicio de API para Período
// ========================================================================
// Comunica con backend endpoints para gestionar períodos de disponibilidad
// Base URL: /api/disponibilidad
// ========================================================================

import apiClient from './apiClient';

const BASE_URL = '/api/disponibilidad';

/**
 * Obtiene todos los períodos de disponibilidad con paginación
 * @param {number} page - Número de página (0-indexed)
 * @param {number} size - Cantidad de registros por página
 * @returns {Promise} Datos paginados
 */
export const obtenerPeriodos = (page = 0, size = 10) => {
  return apiClient.get(`${BASE_URL}/periodo`, {
    params: { page, size }
  });
};

/**
 * Obtiene los períodos del médico autenticado
 * @param {number} page - Número de página
 * @param {number} size - Cantidad de registros
 * @returns {Promise}
 */
export const obtenerMisDisponibilidades = (page = 0, size = 10) => {
  return apiClient.get(`${BASE_URL}/mis-disponibilidades`, {
    params: { page, size }
  });
};

/**
 * Obtiene períodos de un médico específico
 * @param {number} idPers - ID del médico
 * @param {number} page - Número de página
 * @param {number} size - Cantidad de registros
 * @returns {Promise}
 */
export const obtenerPorMedico = (idPers, page = 0, size = 10) => {
  return apiClient.get(`${BASE_URL}/medico/${idPers}`, {
    params: { page, size }
  });
};

/**
 * Obtiene períodos por período (YYYYMM) con paginación
 * @param {string} periodo - Período en formato YYYYMM
 * @param {number} page - Número de página
 * @param {number} size - Cantidad de registros
 * @returns {Promise}
 */
export const obtenerPorPeriodo = (periodo, page = 0, size = 10) => {
  return apiClient.get(`${BASE_URL}/periodo/${periodo}`, {
    params: { page, size }
  });
};

/**
 * Obtiene períodos filtrados por estado
 * @param {string} estado - Estado: BORRADOR, ENVIADO, REVISADO
 * @param {number} page - Número de página
 * @param {number} size - Cantidad de registros
 * @returns {Promise}
 */
export const obtenerPorEstado = (estado, page = 0, size = 10) => {
  return apiClient.get(`${BASE_URL}/estado/${estado}`, {
    params: { page, size }
  });
};

/**
 * Obtiene períodos con filtro combinado (período + estado)
 * @param {string} periodo - Período en formato YYYYMM
 * @param {string} estado - Estado: BORRADOR, ENVIADO, REVISADO
 * @param {number} page - Número de página
 * @param {number} size - Cantidad de registros
 * @returns {Promise}
 */
export const obtenerFiltrado = (periodo, estado, page = 0, size = 10) => {
  return apiClient.get(`${BASE_URL}/filtrar`, {
    params: { periodo, estado, page, size }
  });
};

/**
 * Obtiene un período específico con todos sus detalles
 * @param {number} id - ID del período de disponibilidad
 * @returns {Promise} Objeto con disponibilidad y detalles
 */
export const obtenerPorId = (id) => {
  return apiClient.get(`${BASE_URL}/${id}`);
};

/**
 * Crea un nuevo período de disponibilidad
 * @param {Object} data - Datos del período
 * @returns {Promise} Período creado
 */
export const crear = (data) => {
  return apiClient.post(`${BASE_URL}`, data);
};

/**
 * Actualiza un período (solo si está en BORRADOR)
 * @param {number} id - ID del período
 * @param {Object} data - Datos actualizados
 * @returns {Promise} Período actualizado
 */
export const actualizar = (id, data) => {
  return apiClient.put(`${BASE_URL}/${id}`, data);
};

/**
 * Elimina un período (solo si está en BORRADOR)
 * @param {number} id - ID del período
 * @returns {Promise} Respuesta de eliminación
 */
export const eliminar = (id) => {
  return apiClient.delete(`${BASE_URL}/${id}`);
};

/**
 * Envía un período a revisión
 * Valida que cumpla con >= 150 horas
 * @param {number} id - ID del período
 * @returns {Promise} Período actualizado a estado ENVIADO
 */
export const enviarARevision = (id) => {
  return apiClient.post(`${BASE_URL}/${id}/enviar`);
};

/**
 * Marca un período como revisado (solo COORDINADOR)
 * @param {number} id - ID del período
 * @param {string} observaciones - Observaciones opcionales
 * @returns {Promise} Período actualizado a estado REVISADO
 */
export const marcarRevisado = (id, observaciones = '') => {
  return apiClient.post(`${BASE_URL}/${id}/revisar`, { observaciones });
};

/**
 * Rechaza un período y lo devuelve a BORRADOR
 * @param {number} id - ID del período
 * @param {string} motivoRechazo - Razón del rechazo
 * @returns {Promise} Período actualizado a estado BORRADOR
 */
export const rechazar = (id, motivoRechazo) => {
  return apiClient.post(`${BASE_URL}/${id}/rechazar`, { motivoRechazo });
};

/**
 * Ajusta los turnos de un período (coordinador)
 * @param {Object} data - Datos del ajuste
 *   {
 *     idDisponibilidad: number,
 *     turnos: [{ fecha, turno, horas }, ...],
 *     observaciones: string
 *   }
 * @returns {Promise} Período con turnos ajustados
 */
export const ajustarTurnos = (data) => {
  return apiClient.post(`${BASE_URL}/${data.idDisponibilidad}/ajustar-turnos`, data);
};

/**
 * Valida si un período cumple con las horas requeridas
 * @param {number} id - ID del período
 * @returns {Promise} { cumple: boolean, horasTotal: number, horasRequeridas: number }
 */
export const validarHoras = (id) => {
  return apiClient.get(`${BASE_URL}/${id}/validar-horas`);
};

/**
 * Obtiene estadísticas de períodos para un período calendario
 * @param {string} periodo - Período en formato YYYYMM
 * @returns {Promise} Estadísticas del período
 */
export const obtenerEstadisticasPeriodo = (periodo) => {
  return apiClient.get(`${BASE_URL}/estadisticas/${periodo}`);
};

export const periodoDisponibilidadService = {
  obtenerPeriodos,
  obtenerMisDisponibilidades,
  obtenerPorMedico,
  obtenerPorPeriodo,
  obtenerPorEstado,
  obtenerFiltrado,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  enviarARevision,
  marcarRevisado,
  rechazar,
  ajustarTurnos,
  validarHoras,
  obtenerEstadisticasPeriodo
};

export default periodoDisponibilidadService;
