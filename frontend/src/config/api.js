// ========================================================================
// 🌍 CONFIGURACIÓN GLOBAL DEL CLIENTE API - CENATE
// ========================================================================

// ✅ Detecta entorno y usa la URL correcta
const getApiBaseUrl = () => {
  // Soporta Vite y Create React App
  const envUrl =
      import.meta?.env?.VITE_API_URL || process.env.REACT_APP_API_URL;

  // Fallback local
  return envUrl?.replace(/\/$/, "") || "http://localhost:8080/api";
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
    if (token) headers["Authorization"] = `Bearer ${token}`;
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
            ? "Sesión expirada o no autorizada."
            : response.status === 403
                ? "🚫 No tienes permisos para esta acción."
                : `Error ${response.status}: ${response.statusText}`);

    // Muestra el error en consola para debugging
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