// src/config/api.js
// ========================================================================
// 🌍 CONFIGURACIÓN GLOBAL DEL CLIENTE API - CENATE
// ========================================================================

// ✅ Detecta entorno y usa la URL correcta
const getApiBaseUrl = () => {
  // Si estás en producción con Vite o CRA (React)
  const envUrl =
      import.meta?.env?.VITE_API_URL || process.env.REACT_APP_API_URL;

  // Fallback por defecto (útil para desarrollo local)
  return envUrl || "http://localhost:8080/api";
};

export const API_BASE = getApiBaseUrl();

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
    // 💥 Maneja casos comunes
    const errorMessage =
        data?.message ||
        (response.status === 401
            ? "Sesión expirada o no autorizada."
            : response.status === 403
                ? "No tienes permisos para esta acción."
                : `Error ${response.status}`);
    throw new Error(errorMessage);
  }

  return data;
};

/**
 * 🚀 Método de ayuda para realizar peticiones genéricas
 * @param {string} endpoint - Endpoint relativo (por ejemplo, "/auth/login")
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {Object} [body] - Cuerpo de la solicitud
 * @param {boolean} [includeAuth] - Si incluye el token JWT
 */
export const apiRequest = async (endpoint, method = "GET", body, includeAuth = false) => {
  const options = {
    method,
    headers: getHeaders(includeAuth),
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    return await handleResponse(response);
  } catch (error) {
    console.error("❌ Error de red o conexión con el servidor:", error);
    throw new Error("No se pudo conectar con el servidor. Verifica la red o el backend.");
  }
};