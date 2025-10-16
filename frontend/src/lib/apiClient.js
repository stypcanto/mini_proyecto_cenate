// ========================================================================
// 🌍 CLIENTE GLOBAL DE API - CENATE (React + Docker + Nginx)
// ========================================================================
//
// Este cliente maneja automáticamente:
//   - Detección del entorno (local vs Docker/Nginx)
//   - Headers con y sin autenticación
//   - Manejo centralizado de errores
//   - Funciones HTTP auxiliares: get, post, put, delete
//
// Uso sugerido en /src/api/*
// import { apiClient } from "@/lib/apiClient";
// const data = await apiClient.get("/pacientes", true);
// ========================================================================

// ------------------------------------------------------
// 🔎 Determina la URL base de la API
// ------------------------------------------------------
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL || import.meta?.env?.VITE_API_URL;

  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/$/, ""); // limpia barra final
  }

  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  if (hostname === "localhost" && window.location.port === "3000") {
    // 🧩 CRA local (npm start)
    return "http://localhost:8080/api";
  }

  // 🌐 Producción o entorno Docker/Nginx
  return "/api";
};

export const API_BASE = getApiBaseUrl();

// ------------------------------------------------------
// 🧱 Headers básicos
// ------------------------------------------------------
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

// ------------------------------------------------------
// ⚙️ Manejo centralizado de respuestas
// ------------------------------------------------------
export const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = { message: "Respuesta no válida del servidor." };
  }

  if (!response.ok) {
    const message =
      data?.message ||
      (response.status === 401
        ? "⚠️ Sesión expirada o no autorizada."
        : response.status === 403
        ? "🚫 No tienes permisos para esta acción."
        : `Error ${response.status}: ${response.statusText}`);

    console.error("❌ Error de API:", message, data);
    throw new Error(message);
  }

  return data;
};

// ------------------------------------------------------
// 🚀 Función principal genérica de peticiones
// ------------------------------------------------------
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

// ------------------------------------------------------
// 🪄 API Helpers (más limpio en /src/api/*)
// ------------------------------------------------------
export const apiClient = {
  get: (endpoint, auth = false) => apiRequest(endpoint, "GET", null, auth),
  post: (endpoint, body, auth = false) => apiRequest(endpoint, "POST", body, auth),
  put: (endpoint, body, auth = false) => apiRequest(endpoint, "PUT", body, auth),
  delete: (endpoint, auth = false) => apiRequest(endpoint, "DELETE", null, auth),
};

// ------------------------------------------------------
// 🔁 Exportaciones por compatibilidad
// ------------------------------------------------------
export const API_URL = API_BASE;
export default API_BASE;