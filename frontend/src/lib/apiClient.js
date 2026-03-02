// ========================================================================
// ⚙️ apiClient.js – Cliente HTTP universal para frontend CENATE MBAC
// ✅ Soporte JWT desde localStorage
// ✅ Maneja JSON, texto y errores
// ✅ Compatible con multipart/form-data
// ✅ Auto-manejo de token expirado
// ========================================================================

import { devLog, devWarn, devError } from '../utils/devLogger';

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth.token") ||
    sessionStorage.getItem("token") ||
    null
  );
}

const getApiBaseUrl = () => {
  let url = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080';
  url = url.replace(/http:\/\/localhost/, 'http://127.0.0.1');
  if (!url.endsWith('/api')) {
    url = url.endsWith('/') ? url + 'api' : url + '/api';
  }
  return url;
};

const API_BASE_URL = getApiBaseUrl();

// Solo en desarrollo: confirmar base URL configurada
devLog('🌐 [apiClient] API_BASE_URL:', API_BASE_URL);

const buildUrl = (endpoint) => {
  if (endpoint.startsWith('/api/')) {
    endpoint = endpoint.substring(4);
  }
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

async function handleResponse(response) {
  if (response.status === 204) return null;

  let data;
  const contentType = response.headers.get("Content-Type");
  try {
    data = contentType && contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage =
      (data && data.message) ||
      (data && data.error) ||
      (typeof data === "string" ? data : null) ||
      `HTTP ${response.status}`;

    if (response.status === 401) {
      devWarn("🔒 Sesión expirada o token inválido.");
      localStorage.removeItem("token");
      localStorage.removeItem("auth.token");
      sessionStorage.removeItem("token");
      window.dispatchEvent(new Event('auth-error-401'));
    }

    // Solo loguear el código de error, nunca el payload (puede contener datos médicos)
    devError("[API Error]", response.status, errorMessage);
    throw new Error(errorMessage);
  }

  return data;
}

function buildHeaders(auth = false, isFormData = false) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      devWarn("⚠️ Auth requerido pero no hay token");
    }
  }
  return headers;
}

export const apiClient = {
  get: (endpoint, auth = false) => {
    const url = buildUrl(endpoint);
    devLog(`[GET] ${url}`);
    return fetch(url, {
      method: "GET",
      headers: buildHeaders(auth),
    }).then(handleResponse);
  },

  post: (endpoint, body, auth = false, options = {}) => {
    const url = buildUrl(endpoint);
    devLog(`[POST] ${url}`);
    const isFormData = body instanceof FormData;
    const headers = buildHeaders(auth, isFormData);
    if (options.headers) Object.assign(headers, options.headers);
    return fetch(url, {
      method: "POST",
      headers,
      body: isFormData ? body : JSON.stringify(body),
    }).then(handleResponse);
  },

  put: (endpoint, body, auth = false) => {
    const url = buildUrl(endpoint);
    devLog(`[PUT] ${url}`);
    const isFormData = body instanceof FormData;
    return fetch(url, {
      method: "PUT",
      headers: buildHeaders(auth, isFormData),
      body: isFormData ? body : JSON.stringify(body),
    }).then(handleResponse);
  },

  patch: (endpoint, body, auth = false) => {
    const url = buildUrl(endpoint);
    devLog(`[PATCH] ${url}`);
    const isFormData = body instanceof FormData;
    return fetch(url, {
      method: "PATCH",
      headers: buildHeaders(auth, isFormData),
      body: isFormData ? body : JSON.stringify(body),
    }).then(handleResponse);
  },

  delete: (endpoint, auth = false, body = null) => {
    const url = buildUrl(endpoint);
    devLog(`[DELETE] ${url}`);
    const opts = { method: "DELETE", headers: buildHeaders(auth) };
    if (body) opts.body = JSON.stringify(body);
    return fetch(url, opts).then(handleResponse);
  },

  getWithParams: (endpoint, params = {}, auth = false) => {
    let url = buildUrl(endpoint);
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      qs.append(k, String(v));
    });
    const query = qs.toString();
    if (query) url += `?${query}`;
    devLog(`[GET+PARAMS] ${url}`);
    return fetch(url, {
      method: "GET",
      headers: buildHeaders(auth),
    }).then(handleResponse);
  },
};

export const setToken = (token) => {
  localStorage.setItem('auth.token', token);
  localStorage.setItem('token', token);
};

export const clearToken = () => {
  localStorage.removeItem('auth.token');
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

export const isAuthenticated = () => !!getToken();

export { getToken, API_BASE_URL };
export default apiClient;
