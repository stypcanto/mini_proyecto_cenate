// ========================================================================
// 👥 API USUARIOS - CENATE
// ========================================================================
import { API_BASE, getHeaders, handleResponse } from "../config/api";

/**
 * 📋 Obtiene la lista de todos los usuarios (incluye roles, permisos y personal externo)
 */
export const getUsuarios = async () => {
    const response = await fetch(`${API_BASE}/usuarios`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 🔍 Obtiene un usuario por ID
 * @param {number|string} id - ID del usuario
 */
export const getUsuarioById = async (id) => {
    const response = await fetch(`${API_BASE}/usuarios/${id}`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * ➕ Crea un nuevo usuario
 */
export const createUsuario = async (usuarioData) => {
    const response = await fetch(`${API_BASE}/usuarios`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(usuarioData),
    });
    return handleResponse(response);
};

/**
 * ✏️ Actualiza un usuario existente
 */
export const updateUsuario = async (id, usuarioData) => {
    const response = await fetch(`${API_BASE}/usuarios/${id}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(usuarioData),
    });
    return handleResponse(response);
};

/**
 * 👤 Obtiene la información del usuario logueado
 */
export const getCurrentUser = async () => {
    const response = await fetch(`${API_BASE}/usuarios/me`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 🟢 Activa un usuario
 */
export const activateUsuario = async (id) => {
    const response = await fetch(`${API_BASE}/usuarios/${id}/activate`, {
        method: "PUT",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 🔴 Desactiva un usuario
 */
export const deactivateUsuario = async (id) => {
    const response = await fetch(`${API_BASE}/usuarios/${id}/deactivate`, {
        method: "PUT",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 🔓 Desbloquea un usuario
 */
export const unlockUsuario = async (id) => {
    const response = await fetch(`${API_BASE}/usuarios/${id}/unlock`, {
        method: "PUT",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 🗑️ Elimina un usuario por ID
 */
export const deleteUsuario = async (id) => {
    const response = await fetch(`${API_BASE}/usuarios/${id}`, {
        method: "DELETE",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

/**
 * 🧍 Obtiene todos los usuarios que tienen personal externo vinculado
 */
export const getUsuariosExternos = async () => {
    const response = await fetch(`${API_BASE}/usuarios/externos`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};