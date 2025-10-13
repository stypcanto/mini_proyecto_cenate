// ========================================================================
// 🧬 API PACIENTES / ASEGURADOS - CENATE
// ========================================================================
// Endpoints para la gestión de asegurados: listado, búsqueda por ID y documento.

import { API_BASE, getHeaders, handleResponse } from "../config/api";

/**
 * 📋 Obtiene una lista paginada de asegurados
 * @param {number} page - Página actual (por defecto 0)
 * @param {number} size - Tamaño de página (por defecto 10)
 */
export const getAsegurados = async (page = 0, size = 10) => {
    try {
        const res = await fetch(`${API_BASE}/asegurados?page=${page}&size=${size}`, {
            method: "GET",
            headers: getHeaders(true),
        });
        return await handleResponse(res);
    } catch (error) {
        console.error("❌ Error obteniendo asegurados:", error);
        throw error;
    }
};

/**
 * 🔍 Obtiene un asegurado por su ID
 * @param {string|number} pkAsegurado - ID del asegurado
 */
export const getAseguradoById = async (pkAsegurado) => {
    try {
        const res = await fetch(`${API_BASE}/asegurados/id/${pkAsegurado}`, {
            method: "GET",
            headers: getHeaders(true),
        });
        return await handleResponse(res);
    } catch (error) {
        console.error(`❌ Error obteniendo asegurado por ID (${pkAsegurado}):`, error);
        throw error;
    }
};

/**
 * 🪪 Obtiene un asegurado por número de documento
 * @param {string|number} docPaciente - DNI u otro documento
 */
export const getAseguradoByDoc = async (docPaciente) => {
    try {
        const res = await fetch(`${API_BASE}/asegurados/doc/${docPaciente}`, {
            method: "GET",
            headers: getHeaders(true),
        });
        return await handleResponse(res);
    } catch (error) {
        console.error(`❌ Error obteniendo asegurado por documento (${docPaciente}):`, error);
        throw error;
    }
};