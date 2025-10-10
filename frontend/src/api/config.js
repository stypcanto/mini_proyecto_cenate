// frontend/src/config/api.js

// ========================================================================
// 🌍 CONFIGURACIÓN GLOBAL DEL CLIENTE API - CENATE
// ========================================================================

// URL base del backend (configurable por entorno)
export const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

/**
 * 🔧 Genera encabezados HTTP para las solicitudes
 * @param {boolean} includeAuth - Si debe incluir el token JWT
 */
export const getHeaders = (includeAuth = false) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * ⚙️ Maneja las respuestas del servidor y lanza errores si es necesario
 * @param {Response} response
 */
export const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = { message: "Respuesta no válida del servidor" };
  }

  if (!response.ok) {
    throw new Error(data.message || `Error ${response.status}`);
  }

  return data;
};

// ========================================================================
// 🧠 FUNCIONES DE AUTENTICACIÓN
// ========================================================================

export const loginUser = async (username, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });
  return await handleResponse(response);
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("roles");
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });
  return await handleResponse(response);
};

export const getUserProfile = async () => {
  const response = await fetch(`${API_BASE}/auth/profile`, {
    headers: getHeaders(true),
  });
  return await handleResponse(response);
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });
  return await handleResponse(response);
};

export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ token, newPassword }),
  });
  return await handleResponse(response);
};

// ========================================================================
// 👥 CRUD USUARIOS
// ========================================================================

export const getUsuarios = async () => {
  const response = await fetch(`${API_BASE}/usuarios`, {
    headers: getHeaders(true),
  });
  return await handleResponse(response);
};

export const getUsuarioById = async (id) => {
  const response = await fetch(`${API_BASE}/usuarios/${id}`, {
    headers: getHeaders(true),
  });
  return await handleResponse(response);
};

export const createUsuario = async (usuario) => {
  const response = await fetch(`${API_BASE}/usuarios`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(usuario),
  });
  return await handleResponse(response);
};

export const updateUsuario = async (id, usuario) => {
  const response = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(usuario),
  });
  return await handleResponse(response);
};

export const deleteUsuario = async (id) => {
  const response = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return await handleResponse(response);
};

// ========================================================================
// 🧬 CRUD PACIENTES
// ========================================================================

export const getPacientes = async () => {
  const response = await fetch(`${API_BASE}/pacientes`, {
    headers: getHeaders(true),
  });
  return await handleResponse(response);
};

export const getPacienteById = async (id) => {
  const response = await fetch(`${API_BASE}/pacientes/${id}`, {
    headers: getHeaders(true),
  });
  return await handleResponse(response);
};

export const createPaciente = async (paciente) => {
  const response = await fetch(`${API_BASE}/pacientes`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(paciente),
  });
  return await handleResponse(response);
};

export const updatePaciente = async (id, paciente) => {
  const response = await fetch(`${API_BASE}/pacientes/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(paciente),
  });
  return await handleResponse(response);
};

export const deletePaciente = async (id) => {
  const response = await fetch(`${API_BASE}/pacientes/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return await handleResponse(response);
};

// ========================================================================
// 🧪 CRUD EXÁMENES
// ========================================================================

export const getExamenes = async () => {
  const response = await fetch(`${API_BASE}/examenes`, {
    headers: getHeaders(true),
  });
  return await handleResponse(response);
};

export const getExamenById = async (id) => {
  const response = await fetch(`${API_BASE}/examenes/${id}`, {
    headers: getHeaders(true),
  });
  return await handleResponse(response);
};

export const createExamen = async (examen) => {
  const response = await fetch(`${API_BASE}/examenes`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(examen),
  });
  return await handleResponse(response);
};

export const updateExamen = async (id, examen) => {
  const response = await fetch(`${API_BASE}/examenes/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(examen),
  });
  return await handleResponse(response);
};

export const deleteExamen = async (id) => {
  const response = await fetch(`${API_BASE}/examenes/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return await handleResponse(response);
};
