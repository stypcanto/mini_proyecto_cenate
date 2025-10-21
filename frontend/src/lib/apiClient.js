// src/lib/apiClient.js
import { getToken } from "../constants/auth";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "/api" // En producción (Docker/Nginx)
    : "http://localhost:8080/api"); // En desarrollo local

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

function buildHeaders(auth = false) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export const apiClient = {
  get: async (endpoint, auth = false) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: buildHeaders(auth),
    });
    return handleResponse(res);
  },

  post: async (endpoint, body, auth = false) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async (endpoint, body, auth = false) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
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

console.info("[API] Base URL:", API_BASE);