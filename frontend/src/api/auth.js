// ========================================================================
// 🔐 API DE AUTENTICACIÓN - CENATE
// ========================================================================
// Módulo responsable de la autenticación y manejo de sesión
// Usa el cliente global apiClient (compatible con CRA / Docker / Nginx)
// ========================================================================

import { apiClient } from "@/lib/apiClient";

// ========================================================================
// 🧠 LOGIN / LOGOUT / PERFIL
// ========================================================================

/**
 * 🔐 Inicia sesión con usuario y contraseña
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} Datos del usuario autenticado y token JWT
 */
export const login = async (username, password) => {
  try {
    console.log("🔐 Login →", { username });

    const data = await apiClient.post("/auth/login", { username, password });
    console.log("✅ Login exitoso:", data);

    return data;
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    throw new Error(error.message || "No se pudo iniciar sesión.");
  }
};

/**
 * 🚪 Cierra sesión localmente (borra datos del storage)
 */
export const logout = () => {
  const keys = [
    "token",
    "username",
    "nombreCompleto",
    "rol",
    "roles",
    "permisos",
    "userId",
  ];
  keys.forEach((key) => localStorage.removeItem(key));
  console.log("🚪 Sesión cerrada localmente.");
};

/**
 * 🧾 Obtiene el perfil del usuario actual (/auth/me)
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async () => {
  try {
    const data = await apiClient.get("/auth/me", true);
    return data;
  } catch (error) {
    console.error("❌ Error obteniendo perfil del usuario:", error);
    throw new Error("No se pudo obtener la información del usuario actual.");
  }
};

// ========================================================================
// 🔑 GESTIÓN DE CONTRASEÑAS
// ========================================================================

/**
 * 🧩 Cambia la contraseña del usuario autenticado
 * @param {string} currentPassword
 * @param {string} newPassword
 * @param {string} confirmPassword
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const data = await apiClient.put(
      "/auth/change-password",
      { currentPassword, newPassword, confirmPassword },
      true
    );
    console.log("🔑 Contraseña cambiada correctamente");
    return data;
  } catch (error) {
    console.error("❌ Error cambiando contraseña:", error.message);
    throw new Error("No se pudo cambiar la contraseña.");
  }
};

/**
 * 📩 Solicita recuperación de contraseña
 * @param {string} email - Correo electrónico del usuario
 */
export const forgotPassword = async (email) => {
  try {
    const data = await apiClient.post("/auth/forgot-password", { email });
    console.log("📩 Solicitud de recuperación registrada:", data);
    return data;
  } catch (error) {
    console.error("❌ Error en forgotPassword:", error.message);
    throw new Error("No se pudo procesar la solicitud de recuperación.");
  }
};

/**
 * 🔁 Restablece contraseña con token
 * @param {string} token - Token temporal recibido
 * @param {string} newPassword - Nueva contraseña
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const data = await apiClient.post("/auth/reset-password", { token, newPassword });
    console.log("🔁 Contraseña restablecida correctamente");
    return data;
  } catch (error) {
    console.error("❌ Error restableciendo contraseña:", error.message);
    throw new Error("No se pudo restablecer la contraseña.");
  }
};

// ========================================================================
// 🚫 REGISTRO DE NUEVOS USUARIOS (OPCIONAL / DESHABILITADO)
// ========================================================================

/**
 * 🧾 Crea un nuevo usuario (si está permitido)
 * @param {Object} userData
 */
export const registerUser = async (userData) => {
  try {
    const data = await apiClient.post("/auth/register", userData);
    console.log("🧾 Usuario registrado:", data);
    return data;
  } catch (error) {
    console.error("❌ Error registrando usuario:", error.message);
    throw new Error("El registro directo está deshabilitado o falló la solicitud.");
  }
};