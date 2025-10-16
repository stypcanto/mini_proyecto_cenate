// ========================================================================
// 🔐 API PERMISOS MBAC - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "@/lib/apiClient";

const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    return await handleResponse(res);
  } catch (error) {
    console.error(`❌ Error en llamada a ${url}:`, error);
    throw new Error("Error al comunicarse con el servidor");
  }
};

export const getPermisosPorUsuario = (userId) =>
  safeFetch(`${API_BASE}/permisos/usuario/${userId}`, {
    headers: getHeaders(true),
  });

export const getPermisosPorUsername = (username) =>
  safeFetch(`${API_BASE}/permisos/usuario/username/${username}`, {
    headers: getHeaders(true),
  });

export const verificarPermiso = (request) =>
  safeFetch(`${API_BASE}/permisos/check`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(request),
  });

export const getPermisosByRol = (rolId) =>
  safeFetch(`${API_BASE}/permisos/rol/${rolId}`, { headers: getHeaders(true) });