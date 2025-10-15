// ========================================================================
// 👥 API USUARIOS - CENATE (versión extendida y robusta)
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "../config/api";

/**
 * 🔧 Asegura que la URL base termine correctamente en /api
 */
const BASE_URL = API_BASE?.endsWith("/api") ? API_BASE : `${API_BASE}/api`;

// ================================================================
// 📋 OBTENER TODOS LOS USUARIOS
// ================================================================
export const getUsuarios = async () => {
    try {
        const response = await fetch(`${BASE_URL}/usuarios`, {
            headers: getHeaders(true),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
        return [];
    }
};

// ================================================================
// 🔍 OBTENER USUARIO POR ID
// ================================================================
export const getUsuarioById = async (id) => {
    const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

// ================================================================
// 🧩 OBTENER DETALLE EXTENDIDO POR USERNAME (para modal o perfil)
// ================================================================
export const getUsuarioDetalle = async (username) => {
    const response = await fetch(`${BASE_URL}/usuarios/detalle/${username}`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

// ================================================================
// ➕ CREAR NUEVO USUARIO
// ================================================================
export const createUsuario = async (usuarioData) => {
    const response = await fetch(`${BASE_URL}/usuarios`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(usuarioData),
    });
    return handleResponse(response);
};

// ================================================================
// ✏️ ACTUALIZAR USUARIO
// ================================================================
export const updateUsuario = async (id, usuarioData) => {
    const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(usuarioData),
    });
    return handleResponse(response);
};

// ================================================================
// 👤 OBTENER USUARIO ACTUAL (logueado)
// ================================================================
export const getCurrentUser = async () => {
    const response = await fetch(`${BASE_URL}/usuarios/me`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

// ================================================================
// 🟢 ACTIVAR USUARIO
// ================================================================
export const activateUsuario = async (id) => {
    const response = await fetch(`${BASE_URL}/usuarios/${id}/activate`, {
        method: "PUT",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

// ================================================================
// 🔴 DESACTIVAR USUARIO
// ================================================================
export const deactivateUsuario = async (id) => {
    const response = await fetch(`${BASE_URL}/usuarios/${id}/deactivate`, {
        method: "PUT",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

// ================================================================
// 🔓 DESBLOQUEAR USUARIO
// ================================================================
export const unlockUsuario = async (id) => {
    const response = await fetch(`${BASE_URL}/usuarios/${id}/unlock`, {
        method: "PUT",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

// ================================================================
// 🗑️ ELIMINAR USUARIO POR ID
// ================================================================
export const deleteUsuario = async (id) => {
    const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
        method: "DELETE",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

// ================================================================
// 🌐 OBTENER USUARIOS EXTERNOS
// ================================================================
export const getUsuariosExternos = async () => {
    const response = await fetch(`${BASE_URL}/usuarios/externos`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

// ================================================================
// 🏥 OBTENER USUARIOS INTERNOS
// ================================================================
export const getUsuariosInternos = async () => {
    const response = await fetch(`${BASE_URL}/usuarios/internos`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};