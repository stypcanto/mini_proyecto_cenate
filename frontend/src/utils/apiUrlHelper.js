// ========================================================================
// 🌐 API URL Helper - Construcción consistente de URLs del API
// ========================================================================
// Helper centralizado para construir URLs del API de forma consistente
// Detecta automáticamente la URL del backend basándose en la URL actual
// ========================================================================

/**
 * Obtiene la URL base del API
 * - Si REACT_APP_API_URL está configurada Y es una URL completa (http://...), la usa
 * - Si no, detecta automáticamente desde window.location
 * - Asegura que termine con /api
 */
export const getApiBaseUrl = () => {
  // Si hay variable de entorno configurada, validar que sea una URL completa
  if (process.env.REACT_APP_API_URL) {
    let url = process.env.REACT_APP_API_URL.trim();
    
    // Validar que sea una URL completa (debe empezar con http:// o https://)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Asegurar que termine con /api si no lo tiene
      if (!url.endsWith('/api')) {
        url = url.endsWith('/') ? url + 'api' : url + '/api';
      }
      return url;
    } else {
      // Si no es una URL completa (solo /api o similar), ignorarla y usar detección automática
      console.warn('⚠️ REACT_APP_API_URL no es una URL completa. Usando detección automática desde window.location');
    }
  }

  // Si no hay variable de entorno válida, detectar automáticamente desde window.location
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol; // http: o https:
    const hostname = window.location.hostname; // localhost, 10.0.89.239, etc.
    
    // Si estamos en el mismo servidor (mismo hostname), usar puerto 8080 para el backend
    return `${protocol}//${hostname}:8080/api`;
  }

  // Fallback por defecto
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

