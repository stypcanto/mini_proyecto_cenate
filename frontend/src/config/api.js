// frontend/src/config/api.js

// ✅ Usa la variable del entorno según el build (Docker o local)
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * 🧩 Genera cabeceras estándar para cada request.
 * Si includeAuth = true, añade automáticamente el token JWT.
 */
export const getHeaders = (includeAuth = false) => {
  const headers = { "Content-Type": "application/json" };

  if (includeAuth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * ⚙️ Procesa la respuesta del servidor y maneja errores comunes.
 * Devuelve el JSON si todo va bien o lanza un error legible.
 */
export const handleResponse = async (response) => {
  let data;

  try {
    data = await response.json();
  } catch {
    data = { message: "Respuesta no válida del servidor" };
  }

  // Si el backend responde con error (4xx o 5xx)
  if (!response.ok) {
    const errorMessage =
        data.message ||
        `Error ${response.status}: ${response.statusText || "Desconocido"}`;
    throw new Error(errorMessage);
  }

  return data;
};

/**
 * 🔁 Helper genérico para peticiones HTTP (GET, POST, PUT, DELETE)
 * Reutilizable en tus archivos de /api/
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, options);
  return handleResponse(response);
};