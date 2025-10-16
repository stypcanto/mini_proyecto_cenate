// ========================================================================
// 🔐 API DE AUTENTICACIÓN - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "../config/api";

/**
 * 🧠 Login de usuario
 * Envía username y password al backend.
 */
export const login = async (username, password) => {
    try {
        console.log("🔐 Intentando login con:", { username, api: `${API_BASE}/auth/login` });
        
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ username, password }),
        });
        
        console.log("📡 Respuesta del servidor:", {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        });
        
        const data = await handleResponse(response);
        console.log("✅ Datos procesados:", data);
        
        return data;
    } catch (error) {
        console.error("❌ Error en login:", error);
        console.error("❌ Detalles del error:", {
            message: error.message,
            stack: error.stack
        });
        
        // Si el error tiene un mensaje específico del backend, usarlo
        if (error.message && !error.message.includes("Failed to fetch")) {
            throw error;
        }
        
        // Error de conexión
        throw new Error(
            "No se pudo conectar con el servidor. " +
            "Verifica que el backend esté corriendo en http://localhost:8080"
        );
    }
};

/**
 * 🚫 Registro de usuario nuevo
 * (Deshabilitado por política institucional)
 */
export const registerUser = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ username, password }),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error en registerUser:", error);
        throw new Error("El registro directo está deshabilitado.");
    }
};

/**
 * 🔑 Cambio de contraseña (requiere token JWT válido)
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
        const response = await fetch(`${API_BASE}/auth/change-password`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error en changePassword:", error);
        throw new Error("No se pudo cambiar la contraseña.");
    }
};

/**
 * 🧾 Obtener perfil del usuario actual (/auth/me)
 */
export const getCurrentUser = async () => {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            method: "GET",
            headers: getHeaders(true),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error en getCurrentUser:", error);
        throw new Error("No se pudo obtener la información del usuario actual.");
    }
};

/**
 * 📩 Recuperar contraseña
 * Este endpoint registra la solicitud en BD sin enviar correo real.
 */
export const forgotPassword = async (email) => {
    try {
        const response = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ email }),
        });

        // 🔍 Decodificamos respuesta del backend
        const data = await response.json();

        if (!response.ok) {
            // Propaga mensaje personalizado desde backend
            throw new Error(data.message || "No se pudo registrar la solicitud.");
        }

        return data;
    } catch (error) {
        console.error("❌ Error en forgotPassword:", error);
        throw new Error("No se pudo procesar la solicitud de recuperación.");
    }
};

/**
 * 🚪 Logout local (borra sesión almacenada)
 */
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("nombreCompleto");
    localStorage.removeItem("rol");
    localStorage.removeItem("roles");
    localStorage.removeItem("permisos");
    localStorage.removeItem("userId");
};
