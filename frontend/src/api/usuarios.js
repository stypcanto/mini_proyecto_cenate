// ========================================================================
// 👥 API USUARIOS - CENATE
// ========================================================================
import { API_BASE_URL, getHeaders, handleResponse } from "./config";

/**
 * 📋 Obtiene la lista de todos los usuarios (incluye roles, permisos y personal externo)
 */
export const getUsuarios = async () => {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 🔍 Obtiene un usuario por ID
 * @param {number|string} id - ID del usuario
 */
export const getUsuarioById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 👤 Obtiene la información del usuario logueado
 */
export const getCurrentUser = async () => {
    const response = await fetch(`${API_BASE_URL}/usuarios/me`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 🟢 Activa un usuario
 */
export const activateUsuario = async (id) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}/activate`, {
        method: "PUT",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 🔴 Desactiva un usuario
 */
export const deactivateUsuario = async (id) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}/deactivate`, {
        method: "PUT",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 🔓 Desbloquea un usuario
 */
export const unlockUsuario = async (id) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}/unlock`, {
        method: "PUT",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 🗑️ Elimina un usuario por ID
 */
export const deleteUsuario = async (id) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: "DELETE",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 🧍 Obtiene todos los usuarios que tienen personal externo vinculado
 */
export const getUsuariosExternos = async () => {
    const response = await fetch(`${API_BASE_URL}/usuarios/externos`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};
