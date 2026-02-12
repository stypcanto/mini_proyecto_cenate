// ========================================================================
// ⚙️ apiClient.js – Cliente HTTP universal para frontend CENATE MBAC
// ------------------------------------------------------------------------
// ✅ Soporte JWT desde localStorage
// ✅ Maneja JSON, texto y errores
// ✅ Compatible con multipart/form-data
// ✅ Auto-manejo de token expirado
// ✅ ACTUALIZADO: Usa hostname MacBook-Pro-de-Styp.local
// ========================================================================

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth.token") ||
    sessionStorage.getItem("token") ||
    null
  );
}

// ✅ v1.97.5: Asegurar que API_BASE_URL siempre incluya /api
const getApiBaseUrl = () => {
  let url = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // Si no termina con /api, agregarlo
  if (!url.endsWith('/api')) {
    url = url.endsWith('/') ? url + 'api' : url + '/api';
  }

  return url;
};

const API_BASE_URL = getApiBaseUrl();

// ✅ v1.97.5: Debug logging
console.log('🌐 [apiClient v1.97.5] REACT_APP_API_URL:', process.env.REACT_APP_API_URL || 'undefined');
console.log('🌐 [apiClient v1.97.5] API_BASE_URL final:', API_BASE_URL);

// Construye URL final - NO agregar /api de nuevo
const buildUrl = (endpoint) => {
  // Si endpoint ya empieza con /api, no duplicar
  if (endpoint.startsWith('/api/')) {
    endpoint = endpoint.substring(4); // Quitar /api
  }
  
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// Manejo de respuestas
async function handleResponse(response) {
  console.log(`📥 [Response] ${response.status} ${response.statusText}`);
  
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
      `HTTP ${response.status} - ${response.statusText}`;

    if (response.status === 401) {
      console.warn("🔒 Sesión expirada o token inválido.");
      localStorage.removeItem("token");
      localStorage.removeItem("auth.token");
      sessionStorage.removeItem("token");
      window.dispatchEvent(new Event('auth-error-401'));
    }

    console.error("[API Error]", errorMessage, data);
    throw new Error(errorMessage);
  }

  console.log("✅ [Response Data]:", data);
  return data;
}

// Construcción de headers
function buildHeaders(auth = false, isFormData = false) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("🔐 Token agregado al request");
    } else {
      console.warn("⚠️ Auth requerido pero no hay token");
    }
  }
  return headers;
}

// Cliente HTTP universal
export const apiClient = {
  get: (endpoint, auth = false) => {
    const url = buildUrl(endpoint);
    console.log(`🚀 [GET] ${url}`);
    return fetch(url, {
      method: "GET",
      headers: buildHeaders(auth),
    }).then(handleResponse);
  },

  post: (endpoint, body, auth = false, options = {}) => {
    const url = buildUrl(endpoint);
    console.log(`🚀 [POST] ${url}`, body);
    const isFormData = body instanceof FormData;

    const headers = buildHeaders(auth, isFormData);
    if(options.headers){
      Object.assign(headers, options.headers);
    }

    return fetch(url, {
      method: "POST",
      //headers: buildHeaders(auth, isFormData),
      headers,
      body: isFormData ? body : JSON.stringify(body),
    }).then(handleResponse);



  },

  put: (endpoint, body, auth = false) => {
    const url = buildUrl(endpoint);
    console.log(`🚀 [PUT] ${url}`, body);
    const isFormData = body instanceof FormData;
    return fetch(url, {
      method: "PUT",
      headers: buildHeaders(auth, isFormData),
      body: isFormData ? body : JSON.stringify(body),
    }).then(handleResponse);
  },

  patch: (endpoint, body, auth = false) => {
    const url = buildUrl(endpoint);
    console.log(`🚀 [PATCH] ${url}`, body);
    const isFormData = body instanceof FormData;
    return fetch(url, {
      method: "PATCH",
      headers: buildHeaders(auth, isFormData),
      body: isFormData ? body : JSON.stringify(body),
    }).then(handleResponse);
  },

  delete: (endpoint, auth = false, body = null) => {
    const url = buildUrl(endpoint);
    console.log(`🚀 [DELETE] ${url}`, body || "(sin body)");
    const options = {
      method: "DELETE",
      headers: buildHeaders(auth)
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return fetch(url, options).then(handleResponse);
  },

  // NUEVO MÉTODO SOLO PARA GET CON PARAMS
  getWithParams: (endpoint, params = {}, auth = false) => {
    let url = buildUrl(endpoint);

    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      qs.append(k, String(v));
    });

    const query = qs.toString();
    if (query) {
      url += `?${query}`;
    }

    console.log(` [GET+PARAMS] ${url}`);

    return fetch(url, {
      method: "GET",
      headers: buildHeaders(auth),
    }).then(handleResponse);
  },


};

// Helpers para autenticación
export const setToken = (token) => {
  localStorage.setItem('auth.token', token);
  localStorage.setItem('token', token);
  console.log('✅ Token guardado');
};

export const clearToken = () => {
  localStorage.removeItem('auth.token');
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  console.log('🗑️ Token eliminado');
};

export const isAuthenticated = () => {
  return !!getToken();
};

// ✅ v1.97.5: Exportar getToken y API_BASE_URL para servicios
export { getToken, API_BASE_URL };

// Log para desarrollo
console.info("🌐 [API Base URL]:", API_BASE_URL);
console.info("🔧 [Environment]:", process.env.REACT_APP_API_URL || 'No configurado');
console.info("🔑 Token detectado:", getToken() ? "Sí" : "No");

export default apiClient;
