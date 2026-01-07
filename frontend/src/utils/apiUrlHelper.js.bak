// ========================================================================
// 🌐 API URL Helper - Construcción consistente de URLs del API
// ========================================================================
// Helper centralizado para construir URLs del API de forma consistente
// Detecta automáticamente la URL del backend basándose en la URL actual
// ========================================================================

/**
 * Obtiene la URL base del API
 * - En producción con nginx: /api (relativo) para que nginx haga proxy
 * - En desarrollo: http://localhost:8080/api
 */
export const getApiBaseUrl = () => {
  // Si hay variable de entorno configurada, usarla directamente
  if (process.env.REACT_APP_API_URL) {
    let url = process.env.REACT_APP_API_URL.trim();

    // URL relativa como /api - VÁLIDA para producción con nginx proxy
    if (url.startsWith('/')) {
      return url;
    }

    // URL completa (http:// o https://)
    if (url.startsWith('http://') || url.startsWith('https://')) {
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

  return 'http://localhost:8080/api';
};

/**
 * Construye la URL completa para una foto de personal
 * @param {string} filename - Nombre del archivo de la foto
 * @returns {string|null} - URL completa o null si filename es inválido
 */
export const getFotoUrl = (filename) => {
  if (!filename || 
      (typeof filename === 'string' && (filename.trim() === '' || filename === 'null' || filename === 'undefined'))) {
    return null;
  }

  // Si es una URL completa, usarla directamente
  if (typeof filename === 'string' && (filename.startsWith('http') || filename.startsWith('/'))) {
    return filename;
  }

  // Construir URL usando la base del API
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/personal/foto/${encodeURIComponent(filename)}`;
};

