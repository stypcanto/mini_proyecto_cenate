// ========================================================================
// 🔐 API DE PERMISOS - CENATE
// ========================================================================
// Módulo centralizado para la gestión de permisos del sistema CENATE.
// ------------------------------------------------------------------------
// Funcionalidades incluidas:
//  ✅ Obtener permisos por usuario o rol
//  ✅ Verificar permisos por acción o ruta
//  ✅ Actualizar permisos existentes
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "@/lib/apiClient";

// ========================================================================
// 🧩 Función segura de fetch con manejo uniforme de errores
// ========================================================================
const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ [PermisosAPI] Error al llamar ${url}:`, error);
    throw new Error("Error de conexión con el servidor de permisos.");
  }
};

// ========================================================================
// 👤 Permisos por usuario
// ========================================================================

/**
 * Obtiene los permisos de un usuario por su ID.
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object[]>} Lista de permisos asociados al usuario
 */
export const getPermisosPorUsuario = async (userId) =>
  safeFetch(`${API_BASE}/permisos/usuario/${userId}`, {
    headers: getHeaders(true),
  });

/**
 * Obtiene los permisos de un usuario por su nombre de usuario.
 * @param {string} username - Nombre de usuario
 * @returns {Promise<Object[]>} Permisos asociados al usuario
 */
export const getPermisosPorUsername = async (username) =>
  safeFetch(`${API_BASE}/permisos/usuario/username/${username}`, {
    headers: getHeaders(true),
  });

// ========================================================================
// 🔎 Verificación de permisos
// ========================================================================

/**
 * Verifica si un usuario tiene permiso para una acción específica.
 * @example
 * verificarPermiso({
 *   userId: 1,
 *   rutaPagina: "/roles/medico/pacientes",
 *   accion: "ver"
 * })
 * @param {Object} request - Datos de la solicitud
 * @returns {Promise<Object>} Resultado con { permitido: boolean, detalle }
 */
export const verificarPermiso = async (request) =>
  safeFetch(`${API_BASE}/permisos/check`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(request),
  });

// ========================================================================
// 🧱 Permisos por rol
// ========================================================================

/**
 * Obtiene los permisos asignados a un rol específico.
 * @param {number} rolId - ID del rol
 * @returns {Promise<Object[]>} Lista de permisos asignados al rol
 */
export const getPermisosByRol = async (rolId) =>
  safeFetch(`${API_BASE}/permisos/rol/${rolId}`, {
    headers: getHeaders(true),
  });

// ========================================================================
// ✏️ Actualización de permisos
// ========================================================================

/**
 * Actualiza un permiso existente por su ID.
 * @param {number} permisoId - ID del permiso a actualizar
 * @param {Object} permisoData - Datos actualizados del permiso
 * @returns {Promise<Object>} Resultado de la actualización
 */
export const updatePermiso = async (permisoId, permisoData) =>
  safeFetch(`${API_BASE}/permisos/${permisoId}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(permisoData),
  });

// ========================================================================
// 🧠 Health Check (opcional para diagnósticos)
// ========================================================================

/**
 * Verifica la disponibilidad del módulo de permisos.
 * @returns {Promise<Object>} Estado del servicio
 */
export const checkHealth = async () =>
  safeFetch(`${API_BASE}/permisos/health`, {
    headers: getHeaders(),
  });

// ========================================================================
// 📦 Exportación agrupada
// ========================================================================
const permisosApi = {
  getPermisosPorUsuario,
  getPermisosPorUsername,
  verificarPermiso,
  getPermisosByRol,
  updatePermiso,
  checkHealth,
};

export default permisosApi;