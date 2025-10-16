// ========================================================================
// ✍️ API: Firmas Digitales - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "@/lib/apiClient";

// =============================================================
// 📋 Obtener todas las firmas digitales
// =============================================================
export const getFirmasDigitales = async () => {
    const response = await fetch(`${API_BASE}/firmas-digitales`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

// =============================================================
// 🔍 Obtener una firma por ID
// =============================================================
export const getFirmaById = async (id) => {
    const response = await fetch(`${API_BASE}/firmas-digitales/${id}`, {
        headers: getHeaders(true),
    });
    return handleResponse(response);
};

// =============================================================
// ➕ Crear nueva firma digital
// =============================================================
export const createFirmaDigital = async (firmaData) => {
    const response = await fetch(`${API_BASE}/firmas-digitales`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(firmaData),
    });
    return handleResponse(response);
};

// =============================================================
// ✏️ Actualizar firma digital
// =============================================================
export const updateFirmaDigital = async (id, firmaData) => {
    const response = await fetch(`${API_BASE}/firmas-digitales/${id}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(firmaData),
    });
    return handleResponse(response);
};

// =============================================================
// 🗑️ Eliminar firma digital
// =============================================================
export const deleteFirmaDigital = async (id) => {
    const response = await fetch(`${API_BASE}/firmas-digitales/${id}`, {
        method: "DELETE",
        headers: getHeaders(true),
    });
    return handleResponse(response);
};