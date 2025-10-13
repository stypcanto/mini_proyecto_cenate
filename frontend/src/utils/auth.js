// src/api/auth.js
import { apiFetch, getHeaders } from "../config/api";

/**
 * 🧠 Login de usuario
 * Envía username y password al backend.
 */
export const login = async (username, password) => {
    return apiFetch("/auth/login", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ username, password }),
    });
};

/**
 * 🧍 Registro de usuario nuevo
 */
export const registerUser = async (username, password) => {
    return apiFetch("/auth/register", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ username, password }),
    });
};

/**
 * 🔑 Cambio de contraseña
 * (Requiere token JWT)
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    return apiFetch("/auth/change-password", {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
        }),
    });
};

/**
 * 🧾 Obtener perfil del usuario actual (/auth/me)
 * Devuelve username, roles y permisos desde el token.
 */
export const getCurrentUser = async () => {
    return apiFetch("/auth/me", {
        method: "GET",
        headers: getHeaders(true),
    });
};

/**
 * 🚪 Logout (opcional si manejas token local)
 * Elimina el token JWT del almacenamiento local.
 */
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};