// ========================================================================
// 🛡️ API DE ROLES Y PERMISOS - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "@/lib/apiClient";

/**
 * 📋 Obtener todos los roles del sistema
 */
export const getRoles = async () => {
    try {
        const response = await fetch(`${API_BASE}/admin/roles`, {
            method: "GET",
            headers: getHeaders(true),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error obteniendo roles:", error);
        return [];
    }
};

/**
 * 🔍 Obtener un rol por ID
 */
export const getRolById = async (id) => {
    try {
        const response = await fetch(`${API_BASE}/admin/roles/${id}`, {
            method: "GET",
            headers: getHeaders(true),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`❌ Error obteniendo rol ${id}:`, error);
        throw error;
    }
};

/**
 * ➕ Crear un nuevo rol
 */
export const createRol = async (rolData) => {
    try {
        const response = await fetch(`${API_BASE}/admin/roles`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(rolData),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error creando rol:", error);
        throw error;
    }
};

/**
 * ✏️ Actualizar un rol existente
 */
export const updateRol = async (id, rolData) => {
    try {
        const response = await fetch(`${API_BASE}/admin/roles/${id}`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(rolData),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`❌ Error actualizando rol ${id}:`, error);
        throw error;
    }
};

/**
 * 🗑️ Eliminar un rol
 */
export const deleteRol = async (id) => {
    try {
        const response = await fetch(`${API_BASE}/admin/roles/${id}`, {
            method: "DELETE",
            headers: getHeaders(true),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`❌ Error eliminando rol ${id}:`, error);
        throw error;
    }
};

/**
 * ⚙️ Obtener permisos disponibles (si el backend los expone)
 */
export const getPermisos = async () => {
    try {
        const response = await fetch(`${API_BASE}/admin/permisos`, {
            method: "GET",
            headers: getHeaders(true),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error obteniendo permisos:", error);
        return [];
    }
};