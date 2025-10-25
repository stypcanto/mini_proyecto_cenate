// ========================================================================
// ⚙️ apiClient.js – Cliente HTTP universal para el frontend CENATE
// ------------------------------------------------------------------------
// Maneja peticiones HTTP con autenticación JWT, compatibilidad con JSON,
// FormData y despliegue en Docker/Nginx.
// ========================================================================

import { getToken } from "../constants/auth";

// ========================================================
// 🌐 Base URL dinámica
// ========================================================
const API_BASE =
  import.meta?.env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "/api" // En producción (proxy Nginx → backend)
    : "http://localhost:8080/api"); // En desarrollo local

// ========================================================
// 🧩 Manejo de respuesta (errores y parseo automático)
// ========================================================
async function handleResponse(response) {
  const contentType = response.headers.get("Content-Type");
  let data = null;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json().catch(() => ({}));
  } else {
    data = await response.text().catch(() => "");
  }

  if (!response.ok) {
    const message = data?.message || data || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// ========================================================
// 🔑 Construcción de encabezados
// ========================================================
function buildHeaders(auth = false, isFormData = false) {
  const headers = {};

  // Solo añadimos Content-Type si NO es FormData
  if (!isFormData) headers["Content-Type"] = "application/json";

  const token = getToken();
  
  // Log para debug
  console.log("🔑 buildHeaders - auth:", auth, "| token exists:", !!token);
  
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("✅ Token agregado al header");
  } else if (auth && !token) {
    console.warn("⚠️ auth=true pero no hay token disponible");
  }

  return headers;
}

// ========================================================
// 🧰 Cliente principal
// ========================================================
export const apiClient = {
  // ------------------------------------------------------
  // GET
  // ------------------------------------------------------
  get: async (endpoint, auth = false) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: buildHeaders(auth),
    });
    return handleResponse(res);
  },

  // ------------------------------------------------------
  // POST (JSON o FormData automático)
  // ------------------------------------------------------
  post: async (endpoint, body, auth = false) => {
    const isFormData = body instanceof FormData;
    const url = `${API_BASE}${endpoint}`;
    
    console.log("📤 POST Request:", {
      url,
      auth,
      isFormData,
      body: isFormData ? "FormData" : body
    });

    const res = await fetch(url, {
      method: "POST",
      headers: buildHeaders(auth, isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    
    console.log("📥 POST Response:", {
      url,
      status: res.status,
      ok: res.ok
    });

    return handleResponse(res);
  },

  // ------------------------------------------------------
  // PUT
  // ------------------------------------------------------
  put: async (endpoint, body, auth = false) => {
    const isFormData = body instanceof FormData;

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: buildHeaders(auth, isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });

    return handleResponse(res);
  },

  // ------------------------------------------------------
  // DELETE
  // ------------------------------------------------------
  delete: async (endpoint, auth = false) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: buildHeaders(auth),
    });
    return handleResponse(res);
  },
};

// ========================================================
// 🧭 Log de referencia (solo en desarrollo)
// ========================================================
if (process.env.NODE_ENV !== "production") {
  console.info("[API] Base URL:", API_BASE);
}