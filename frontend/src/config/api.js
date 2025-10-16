// ========================================================================
// 🌍 CONFIGURACIÓN GLOBAL DEL CLIENTE API - CENATE (CRA / Docker / Nginx)
// ========================================================================

/**
 * 🧠 Detecta la URL base del backend según el entorno:
 * - En desarrollo local: apunta a http://localhost:8080/api
 * - En producción (Docker / Nginx): usa el proxy interno /api
 */
const getApiBaseUrl = () => {
  // 1️⃣ Intentar leer variable de entorno definida en .env o docker-compose
  const envUrl = process.env.REACT_APP_API_URL;

  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/$/, ""); // limpia barra final
  }

  // 2️⃣ Detectar entorno de ejecución (CRA local vs Nginx)
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";

  // Si está dentro de Docker/Nginx → usa proxy interno /api
  // Si está ejecutándose con npm start (localhost:3000) → usa backend directo
  if (hostname === "localhost" && window.location.port === "3000") {
    return "http://localhost:8080/api";
  }

  // 🔁 Fallback por defecto (producción con Nginx)
  return "/api";
};

// 🌐 Base de la API
export const API_BASE = getApiBaseUrl();

// ========================================================================
// 🧱 HEADERS GENERALES
// ========================================================================
export const getHeaders = (includeAuth = false) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (includeAuth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// ========================================================================
// ⚙️ MANEJO DE RESPUESTAS
// ========================================================================
export const handleResponse = async (response) => {
  let data;

  try {
    data = await response.json();
  } catch {
    data = { message: "Respuesta no válida del servidor." };
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      (response.status === 401
        ? "⚠️ Sesión expirada o no autorizada."
        : response.status === 403
        ? "🚫 No tienes permisos para esta acción."
        : `Error ${response.status}: ${response.statusText}`);

    console.error("❌ Error de API:", errorMessage, data);
    throw new Error(errorMessage);
  }

  return data;
};

// ========================================================================
// 🚀 PETICIÓN GENÉRICA UNIVERSAL
// ========================================================================
export const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  includeAuth = false
) => {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const options = {
    method,
    headers: getHeaders(includeAuth),
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    console.error("🌐 Error de conexión con el servidor:", error);
    throw new Error(
      "No se pudo conectar con el servidor. Verifica tu red o que el backend esté activo."
    );
  }
};

// ========================================================================
// 🪄 Exportación adicional (compatibilidad retro)
// ========================================================================
export const API_URL = API_BASE;
export default API_BASE;