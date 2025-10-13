// ========================================================================
// 🧾 API DE SOLICITUDES DE CUENTAS - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "../config/api";

/**
 * 🔹 Obtener todas las solicitudes pendientes
 */
export const getPendingRequests = async () => {
    try {
        const response = await fetch(`${API_BASE}/account-requests/pendientes`, {
            method: "GET",
            headers: getHeaders(true),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error obteniendo solicitudes pendientes:", error.message);
        throw new Error("No se pudieron cargar las solicitudes pendientes");
    }
};

/**
 * ✅ Aprobar una solicitud de cuenta
 * @param {number|string} id - ID de la solicitud
 * @param {Object} data - Información adicional (si aplica)
 */
export const approveRequest = async (id, data = {}) => {
    try {
        const response = await fetch(`${API_BASE}/account-requests/${id}/aprobar`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`❌ Error aprobando solicitud ${id}:`, error.message);
        throw new Error("No se pudo aprobar la solicitud");
    }
};

/**
 * ❌ Rechazar una solicitud de cuenta
 * @param {number|string} id - ID de la solicitud
 * @param {Object} data - Motivo o datos del rechazo
 */
export const rejectRequest = async (id, data = {}) => {
    try {
        const response = await fetch(`${API_BASE}/account-requests/${id}/rechazar`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`❌ Error rechazando solicitud ${id}:`, error.message);
        throw new Error("No se pudo rechazar la solicitud");
    }
};