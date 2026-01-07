// ========================================================================
// 🌐 API CLIENT - CENATE
// ========================================================================
// Cliente HTTP configurado para interactuar con el backend Spring Boot
// ✅ ACTUALIZADO: Usa hostname y variables de entorno
// ========================================================================

// ✅ Función para obtener la URL base del API
// En producción con nginx: usa /api (relativo) para que nginx haga proxy
// En desarrollo: usa http://localhost:8080/api
const getApiBaseUrl = () => {
  // Si hay variable de entorno configurada, usarla directamente
  if (process.env.REACT_APP_API_URL) {
    let url = process.env.REACT_APP_API_URL.trim();

    // URL relativa como /api - VÁLIDA para producción con nginx proxy
    if (url.startsWith('/')) {
      console.log('✅ Usando URL relativa (nginx proxy):', url);
      return url;
    }

    // URL completa (http:// o https://)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Asegurar que termine con /api si no lo tiene
      if (!url.endsWith('/api')) {
        url = url.endsWith('/') ? url + 'api' : url + '/api';
      }
      return url;
    }
  }

  // Fallback: detección automática para desarrollo local
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8080/api`;
  }

  // Fallback por defecto
  return 'http://localhost:8080/api';
};

// ✅ Leer de variables de entorno o detectar automáticamente
const API_BASE_URL = getApiBaseUrl();

console.log('🌐 [API Base URL]:', API_BASE_URL);
console.log('🔧 [REACT_APP_API_URL]:', process.env.REACT_APP_API_URL || 'No configurado - usando detección automática');
console.log('📍 [Window Location]:', typeof window !== 'undefined' ? window.location.href : 'N/A');

/**
 * Obtiene el token desde localStorage
 */
const getToken = () => {
  const token = localStorage.getItem('auth.token');
  console.log('🔑 Token detectado:', token ? 'Sí' : 'No');
  return token;
};

/**
 * Maneja respuestas HTTP y errores
 */
const handleResponse = async (response) => {
  console.log(`📥 [Response Status]: ${response.status} ${response.statusText}`);
  
  // Si la respuesta es exitosa (200-299)
  if (response.ok) {
    const contentType = response.headers.get('content-type');
    
    // Si es JSON, parsearlo
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('✅ [Response Data]:', data);
      return data;
    }
    
    // Si es texto plano
    const text = await response.text();
    console.log('✅ [Response Text]:', text);
    return text;
  }

  // Manejo de errores
  let errorMessage = `${response.status}: ${response.statusText}`;
  
  try {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      console.error('[API Error]', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } else {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = errorText;
      }
    }
  } catch (parseError) {
    console.error('⚠️ Error al parsear respuesta de error:', parseError);
    // Usar el mensaje por defecto si no se puede parsear
  }

  console.error(`❌ [API Error] ${errorMessage}`, response);

  // Si es 401, disparar evento para logout
  if (response.status === 401) {
    console.warn('🚨 Token expirado o inválido. Cerrando sesión...');
    window.dispatchEvent(new Event('auth-error-401'));
  }

  throw new Error(errorMessage);
};

/**
 * Realiza una petición HTTP genérica
 */
const apiRequest = async (endpoint, method = 'GET', body = null, options = {}) => {
  // Si options es un boolean, es el valor antiguo de requiresAuth
  const requiresAuth = typeof options === 'boolean' ? options : (options.requiresAuth !== false);
  const params = options.params || {};

  // Construir query string
  let url = `${API_BASE_URL}${endpoint}`;
  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url = `${url}?${queryString}`;
  }

  console.log(`🚀 [${method}] ${url}`);
  
  const headers = {
    'Content-Type': 'application/json',
  };

  // Agregar token si es requerido
  if (requiresAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Token añadido a la petición');
    } else {
      console.warn('⚠️ Token no encontrado pero la petición requiere autenticación');
    }
  }

  const config = {
    method,
    headers,
    credentials: 'include',
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(body);
    console.log('📦 [Request Body]:', body);
  }

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ [Network Error] en ${method} ${url}:`, error.message);
    throw error;
  }
};

// ========================================================================
// 🧩 API CLIENT CON MÉTODOS HELPERS
// ========================================================================

const apiClient = {
  get: (endpoint, options = {}) => {
    // Soportar ambos: get(endpoint, true/false) y get(endpoint, { params: {...} })
    return apiRequest(endpoint, 'GET', null, options);
  },

  post: (endpoint, body, options = {}) => {
    // Soportar ambos: post(endpoint, body, true/false) y post(endpoint, body, { params: {...} })
    return apiRequest(endpoint, 'POST', body, options);
  },

  put: (endpoint, body, options = {}) => {
    // Soportar ambos: put(endpoint, body, true/false) y put(endpoint, body, { params: {...} })
    return apiRequest(endpoint, 'PUT', body, options);
  },

  patch: (endpoint, body, options = {}) => {
    // Soportar ambos: patch(endpoint, body, true/false) y patch(endpoint, body, { params: {...} })
    return apiRequest(endpoint, 'PATCH', body, options);
  },

  delete: (endpoint, options = {}) => {
    // Soportar ambos: delete(endpoint, true/false) y delete(endpoint, { params: {...} })
    return apiRequest(endpoint, 'DELETE', null, options);
  },

  // Método para subir archivos (multipart/form-data)
  uploadFile: async (endpoint, file, requiresAuth = true) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`📤 [UPLOAD] ${url}`);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = {};
    
    // Agregar token si es requerido
    if (requiresAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Token añadido a la petición de upload');
      }
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ [Upload Error] en ${url}:`, error.message);
      throw error;
    }
  },
};

// ========================================================================
// 🔐 GESTIÓN DE SESIÓN
// ========================================================================

export const setToken = (token) => {
  localStorage.setItem('auth.token', token);
  console.log('✅ Token guardado en localStorage');
};

export const clearToken = () => {
  localStorage.removeItem('auth.token');
  console.log('🗑️ Token eliminado de localStorage');
};

export const isAuthenticated = () => {
  return !!getToken();
};

// ========================================================================
// 👂 EVENT LISTENERS PARA AUTENTICACIÓN
// ========================================================================

export const setupAuthErrorListener = (callback) => {
  window.addEventListener('auth-error-401', callback);
  return () => {
    window.removeEventListener('auth-error-401', callback);
  };
};

// ========================================================================
// 📦 EXPORTACIONES
// ========================================================================

export default apiClient;
export { getToken, API_BASE_URL };
