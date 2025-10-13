// src/config/api.js
// ========================================================================
// 🌍 CONFIGURACIÓN GLOBAL DEL CLIENTE API - CENATE
// ========================================================================

// URL base del backend (configurable por entorno)
export const API_BASE =
    process.env.REACT_APP_API_URL || "http://localhost:8080/api";

/**
 * 🔧 Genera encabezados HTTP para las solicitudes
 * @param {boolean} includeAuth - Si debe incluir el token JWT
 */
export const getHeaders = (includeAuth = false) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * ⚙️ Maneja las respuestas del servidor y lanza errores si es necesario
 * @param {Response} response
 */
export const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = { message: "Respuesta no válida del servidor" };
  }

  if (!response.ok) {
    throw new Error(data.message || `Error ${response.status}`);
  }

  return data;
};