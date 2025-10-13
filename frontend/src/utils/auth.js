// src/api/auth.js
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
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ username, password }),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error en login:", error);
        throw new Error("Error al iniciar sesión");
    }
};

/**
 * 🧍 Registro de usuario nuevo
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
        throw new Error("Error al registrar usuario");
    }
};

/**
 * 🔑 Cambio de contraseña
 * (Requiere token JWT)
 */
export const changePassword = async (
    currentPassword,
    newPassword,
    confirmPassword
) => {
    try {
        const response = await fetch(`${API_BASE}/auth/change-password`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmPassword,
            }),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error en changePassword:", error);
        throw new Error("No se pudo cambiar la contraseña");
    }
};

/**
 * 🧾 Obtener perfil del usuario actual (/auth/me)
 * Devuelve username, roles y permisos desde el token.
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
        throw new Error("No se pudo obtener la información del usuario");
    }
};

/**
 * 📩 Recuperar contraseña
 * Envía un correo de recuperación al usuario.
 */
export const forgotPassword = async (email) => {
    try {
        const response = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ email }),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("❌ Error en forgotPassword:", error);
        throw new Error("No se pudo enviar el correo de recuperación");
    }
};

/**
 * 🚪 Logout (opcional si manejas token local)
 * Elimina el token JWT del almacenamiento local.
 */
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
};