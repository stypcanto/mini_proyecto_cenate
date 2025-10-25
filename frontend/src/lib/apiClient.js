// ========================================================================
// ⚙️ apiClient.js – Cliente HTTP universal para el frontend CENATE
// ========================================================================

import { getToken } from "../constants/auth";

// 🌐 Base URL dinámica (CRA)
const API_BASE =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim()) ||
  (process.env.NODE_ENV === "production"
    ? (process.env.REACT_APP_API_BASEPATH && process.env.REACT_APP_API_BASEPATH.trim()) || "/api"
    : "http://localhost:8080/api");

// 🧩 Manejo de respuesta
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

// 🔑 Encabezados
function buildHeaders(auth = false, isFormData = false) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// 🧰 Cliente principal
export const apiClient = {
  get: async (endpoint, auth = false) => {
    const res = await fetch(`${API_BASE}${endpoint}`, { headers: buildHeaders(auth) });
    return handleResponse(res);
  },

  post: async (endpoint, body, auth = false) => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: buildHeaders(auth, isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async (endpoint, body, auth = false) => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: buildHeaders(auth, isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  delete: async (endpoint, auth = false) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: buildHeaders(auth),
    });
    return handleResponse(res);
  },
};

// 🧭 Log de referencia
if (process.env.NODE_ENV !== "production") {
  console.info("[API] Base URL:", API_BASE);
}
