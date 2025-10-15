// ========================================================================
// 🔐 API PERMISOS MBAC - CENATE
// ========================================================================
// Sistema MBAC (Modular-Based Access Control)
// Gestiona permisos granulares por usuario, rol, módulo y página
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "../config/api";

// ========================================================================
// 🧠 Helper genérico para llamadas seguras
// ========================================================================
const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    return await handleResponse(res);
  } catch (error) {
    console.error(`❌ Error en llamada a ${url}:`, error);
    throw new Error("Error al comunicarse con el servidor");
  }
};

// ========================================================================
// 📊 ENDPOINTS MBAC - PERMISOS
// ========================================================================

/**
 * Obtiene todos los permisos activos de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Lista de permisos por rol, módulo y página
 */
export const getPermisosPorUsuario = (userId) =>
  safeFetch(`${API_BASE}/permisos/usuario/${userId}`, {
    headers: getHeaders(true),
  });

/**
 * Obtiene permisos de un usuario por username
 * @param {string} username - Nombre de usuario
 * @returns {Promise<Array>} Lista de permisos
 */
export const getPermisosPorUsername = (username) =>
  safeFetch(`${API_BASE}/permisos/usuario/username/${username}`, {
    headers: getHeaders(true),
  });

/**
 * Obtiene permisos de un usuario en un módulo específico
 * @param {number} userId - ID del usuario
 * @param {number} idModulo - ID del módulo
 * @returns {Promise<Array>} Permisos del usuario en el módulo
 */
export const getPermisosPorUsuarioYModulo = (userId, idModulo) =>
  safeFetch(`${API_BASE}/permisos/usuario/${userId}/modulo/${idModulo}`, {
    headers: getHeaders(true),
  });

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {Object} request - {userId, rutaPagina, accion}
 * @returns {Promise<Object>} {permitido: boolean, mensaje: string}
 */
export const verificarPermiso = (request) =>
  safeFetch(`${API_BASE}/permisos/check`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(request),
  });

/**
 * Obtiene todos los módulos accesibles para un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} {userId, modulos[], total}
 */
export const getModulosAccesibles = (userId) =>
  safeFetch(`${API_BASE}/permisos/usuario/${userId}/modulos`, {
    headers: getHeaders(true),
  });

/**
 * Obtiene páginas accesibles de un módulo para un usuario
 * @param {number} userId - ID del usuario
 * @param {number} idModulo - ID del módulo
 * @returns {Promise<Object>} {userId, idModulo, paginas[], total}
 */
export const getPaginasAccesibles = (userId, idModulo) =>
  safeFetch(`${API_BASE}/permisos/usuario/${userId}/modulo/${idModulo}/paginas`, {
    headers: getHeaders(true),
  });

// ========================================================================
// 📊 AUDITORÍA MBAC
// ========================================================================

/**
 * Obtiene auditoría modular paginada
 * @param {Object} params - {page, size, sortBy, direction}
 * @returns {Promise<Object>} Página de auditoría
 */
export const getAuditoriaModular = (params = {}) => {
  const { page = 0, size = 20, sortBy = "fechaHora", direction = "desc" } = params;
  const queryParams = new URLSearchParams({ page, size, sortBy, direction });
  
  return safeFetch(`${API_BASE}/auditoria/modulos?${queryParams}`, {
    headers: getHeaders(true),
  });
};

/**
 * Obtiene auditoría de un usuario específico
 * @param {number} userId - ID del usuario
 * @param {Object} params - {page, size}
 * @returns {Promise<Object>} Página de auditoría del usuario
 */
export const getAuditoriaPorUsuario = (userId, params = {}) => {
  const { page = 0, size = 20 } = params;
  const queryParams = new URLSearchParams({ page, size });
  
  return safeFetch(`${API_BASE}/auditoria/usuario/${userId}?${queryParams}`, {
    headers: getHeaders(true),
  });
};

/**
 * Obtiene resumen estadístico de auditoría
 * @returns {Promise<Object>} {resumenPorTipoEvento, totalEventos, timestamp}
 */
export const getResumenAuditoria = () =>
  safeFetch(`${API_BASE}/auditoria/resumen`, {
    headers: getHeaders(true),
  });

/**
 * Obtiene los últimos N eventos de auditoría
 * @param {number} limit - Número de eventos (default: 10)
 * @returns {Promise<Array>} Lista de últimos eventos
 */
export const getUltimosEventos = (limit = 10) =>
  safeFetch(`${API_BASE}/auditoria/ultimos?limit=${limit}`, {
    headers: getHeaders(true),
  });

// ========================================================================
// 🧩 HELPERS Y UTILIDADES
// ========================================================================

/**
 * Verifica si el usuario actual tiene permiso para una acción
 * @param {string} rutaPagina - Ruta de la página
 * @param {string} accion - Acción a verificar (ver, crear, editar, eliminar, exportar, aprobar)
 * @returns {Promise<boolean>} true si tiene permiso
 */
export const tienePermiso = async (rutaPagina, accion) => {
  try {
    const userId = parseInt(localStorage.getItem("userId"));
    if (!userId) return false;

    const response = await verificarPermiso({ userId, rutaPagina, accion });
    return response.permitido === true;
  } catch (error) {
    console.error("Error al verificar permiso:", error);
    return false;
  }
};

/**
 * Obtiene permisos del usuario actual
 * @returns {Promise<Array>} Lista de permisos
 */
export const getPermisosUsuarioActual = async () => {
  try {
    const userId = parseInt(localStorage.getItem("userId"));
    if (!userId) return [];
    
    return await getPermisosPorUsuario(userId);
  } catch (error) {
    console.error("Error al obtener permisos del usuario actual:", error);
    return [];
  }
};

// ========================================================================
// 🚀 EXPORTACIÓN GENERAL
// ========================================================================
export default {
  getPermisosPorUsuario,
  getPermisosPorUsername,
  getPermisosPorUsuarioYModulo,
  verificarPermiso,
  getModulosAccesibles,
  getPaginasAccesibles,
  getAuditoriaModular,
  getAuditoriaPorUsuario,
  getResumenAuditoria,
  getUltimosEventos,
  tienePermiso,
  getPermisosUsuarioActual,
};
