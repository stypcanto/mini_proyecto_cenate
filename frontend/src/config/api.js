// ========================================================================
// 🌍 CONFIGURACIÓN GLOBAL DEL CLIENTE API - CENATE
// ========================================================================

// ✅ Detecta entorno y usa la URL correcta (compatible con CRA y Vite)
const getApiBaseUrl = () => {
  // Intenta obtener desde variables de entorno
  const envUrl =
    import.meta?.env?.VITE_API_URL || process.env.REACT_APP_API_URL;

  // Si existe, limpia posibles barras finales
  if (envUrl) {
    const base = envUrl.trim().replace(/\/$/, "");
    return base;
  }

  // 🌐 Si no hay variable de entorno, decide según entorno:
  // - En desarrollo local (CRA con npm start) → usa backend en localhost:8080
  // - En Docker/Nginx o producción → usa proxy interno /api
  const isLocalDev =
    typeof window !== "undefined" && window.location.port !== "80";
  return isLocalDev ? "http://localhost:8080/api" : "/api";
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
// 🚀 PETICIÓN GENÉRICA (helper universal)
// ========================================================================
export const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  includeAuth = false
) => {
  const url = `${API_BASE}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

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
// ✅ Exportación adicional compatible con otros imports
// ========================================================================
export const API_URL = API_BASE; // Alias usado en módulos antiguos
export default API_BASE;