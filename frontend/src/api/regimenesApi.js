// ========================================================================
// ⚙️ API DE REGÍMENES LABORALES - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "../config/api"; // ✅ usa ruta relativa (CRA compatible)

/**
 * 📋 Obtener todos los regímenes laborales
 */
export const getRegimenes = async () => {
    try {
        const response = await fetch(`${API_BASE}/regimenes`, {
            method: "GET",
            headers: getHeaders(true), // incluye token JWT si aplica
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error obteniendo regímenes:", error);
        return [];
    }
};

/**
 * ➕ Crear un nuevo régimen laboral
 * @param {Object} regimen - Datos del nuevo régimen
 */
export const createRegimen = async (regimen) => {
    try {
        const response = await fetch(`${API_BASE}/regimenes`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(regimen),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error creando régimen:", error);
        throw error;
    }
};

/**
 * ✏️ Actualizar un régimen laboral existente
 * @param {number|string} id - ID del régimen
 * @param {Object} regimen - Datos actualizados
 */
export const updateRegimen = async (id, regimen) => {
    try {
        const response = await fetch(`${API_BASE}/regimenes/${id}`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(regimen),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`❌ Error actualizando régimen ${id}:`, error);
        throw error;
    }
};

/**
 * 🗑️ Eliminar un régimen laboral
 * @param {number|string} id - ID del régimen a eliminar
 */
export const deleteRegimen = async (id) => {
    try {
        const response = await fetch(`${API_BASE}/regimenes/${id}`, {
            method: "DELETE",
            headers: getHeaders(true),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`❌ Error eliminando régimen ${id}:`, error);
        throw error;
    }
};