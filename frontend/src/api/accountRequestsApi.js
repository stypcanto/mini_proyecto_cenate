// ========================================================================
// 📝 API DE SOLICITUDES DE CUENTA - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "../config/api";

/**
 * 📤 Crear nueva solicitud de cuenta
 * Endpoint público - no requiere autenticación
 */
export const createAccountRequest = async (requestData) => {
    try {
        console.log("📝 Enviando solicitud de cuenta:", requestData);
        
        const response = await fetch(`${API_BASE}/account-requests`, {
            method: "POST",
            headers: getHeaders(false), // Sin autenticación
            body: JSON.stringify(requestData),
        });
        
        const data = await handleResponse(response);
        console.log("✅ Solicitud creada:", data);
        
        return data;
    } catch (error) {
        console.error("❌ Error al crear solicitud:", error);
        throw new Error(
            error.message || "No se pudo enviar la solicitud. Inténtalo nuevamente."
        );
    }
};

/**
 * 📋 Obtener solicitudes pendientes
 * Solo para ADMIN/SUPERADMIN
 */
export const getPendingRequests = async () => {
    try {
        console.log("🔍 Obteniendo solicitudes pendientes...");
        
        const response = await fetch(`${API_BASE}/account-requests/pendientes`, {
            method: "GET",
            headers: getHeaders(true), // Con autenticación
        });
        
        const data = await handleResponse(response);
        console.log(`✅ ${data.length} solicitudes pendientes encontradas`);
        
        return data;
    } catch (error) {
        console.error("❌ Error al obtener solicitudes:", error);
        throw new Error(
            error.message || "No se pudieron cargar las solicitudes pendientes."
        );
    }
};

/**
 * ✅ Aprobar solicitud de cuenta
 * Solo para ADMIN/SUPERADMIN
 * 
 * @param {number} id - ID de la solicitud
 * @param {object} reviewData - Datos de la revisión
 * @param {string} reviewData.rolesAsignados - Roles a asignar (JSON array como string)
 * @param {string} reviewData.observacionAdmin - Observaciones del admin
 * @param {string} reviewData.passwordTemporal - Contraseña temporal generada
 */
export const approveRequest = async (id, reviewData) => {
    try {
        console.log(`✅ Aprobando solicitud ${id}:`, reviewData);
        
        const response = await fetch(`${API_BASE}/account-requests/${id}/aprobar`, {
            method: "PUT",
            headers: getHeaders(true), // Con autenticación
            body: JSON.stringify(reviewData),
        });
        
        const data = await handleResponse(response);
        console.log("✅ Solicitud aprobada - Usuario creado:", data);
        
        return data;
    } catch (error) {
        console.error("❌ Error al aprobar solicitud:", error);
        throw new Error(
            error.message || "No se pudo aprobar la solicitud."
        );
    }
};

/**
 * ❌ Rechazar solicitud de cuenta
 * Solo para ADMIN/SUPERADMIN
 * 
 * @param {number} id - ID de la solicitud
 * @param {object} reviewData - Datos de la revisión
 * @param {string} reviewData.observacionAdmin - Motivo del rechazo
 */
export const rejectRequest = async (id, reviewData) => {
    try {
        console.log(`❌ Rechazando solicitud ${id}:`, reviewData);
        
        const response = await fetch(`${API_BASE}/account-requests/${id}/rechazar`, {
            method: "PUT",
            headers: getHeaders(true), // Con autenticación
            body: JSON.stringify(reviewData),
        });
        
        const data = await handleResponse(response);
        console.log("✅ Solicitud rechazada:", data);
        
        return data;
    } catch (error) {
        console.error("❌ Error al rechazar solicitud:", error);
        throw new Error(
            error.message || "No se pudo rechazar la solicitud."
        );
    }
};

/**
 * 🔑 Generar contraseña temporal aleatoria
 * Útil para el administrador al aprobar cuentas
 */
export const generateTemporaryPassword = () => {
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const length = 10;
    let password = "";
    
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Agregar un número y un carácter especial para mayor seguridad
    password += Math.floor(Math.random() * 10);
    password += "!@#$%"[Math.floor(Math.random() * 5)];
    
    return password;
};
