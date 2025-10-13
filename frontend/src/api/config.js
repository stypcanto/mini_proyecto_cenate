// ========================================================================
// 🌍 CONFIGURACIÓN GLOBAL DEL CLIENTE API - CENATE
// ========================================================================

// Detecta automáticamente el entorno (CRA o Vite)
const viteBase = import.meta?.env?.VITE_API_URL;
const craBase = process.env.REACT_APP_API_URL;

// URL base del backend
export const API_BASE = viteBase || craBase || "http://localhost:8080/api";

// ------------------------------------------------------------------------
// 🔧 GENERADORES DE HEADERS Y RESPUESTAS
// ------------------------------------------------------------------------

/**
 * 🔧 Genera encabezados HTTP para las solicitudes
 * @param {boolean} includeAuth - Si debe incluir el token JWT
 */
export const getHeaders = (includeAuth = false) => {
  const headers = { "Content-Type": "application/json" };
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
    data = { message: "⚠️ Respuesta no válida del servidor" };
  }

  if (!response.ok) {
    console.error("❌ Error HTTP:", response.status, data.message);
    throw new Error(data.message || `Error ${response.status}`);
  }

  return data;
};

// ------------------------------------------------------------------------
// 🧠 AUTENTICACIÓN
// ------------------------------------------------------------------------

export const loginUser = async (username, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });
  return await handleResponse(res);
};

export const logoutUser = () => {
  ["token", "user", "roles"].forEach((key) => localStorage.removeItem(key));
};

export const registerUser = async (userData) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });
  return await handleResponse(res);
};

export const getUserProfile = async () => {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: getHeaders(true),
  });
  return await handleResponse(res);
};

export const forgotPassword = async (email) => {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });
  return await handleResponse(res);
};

export const resetPassword = async (token, newPassword) => {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ token, newPassword }),
  });
  return await handleResponse(res);
};

// ------------------------------------------------------------------------
// 👥 CRUD USUARIOS
// ------------------------------------------------------------------------

export const getUsuarios = async () => {
  const res = await fetch(`${API_BASE}/usuarios`, { headers: getHeaders(true) });
  return await handleResponse(res);
};

export const getUsuarioById = async (id) => {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, { headers: getHeaders(true) });
  return await handleResponse(res);
};

export const createUsuario = async (usuario) => {
  const res = await fetch(`${API_BASE}/usuarios`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(usuario),
  });
  return await handleResponse(res);
};

export const updateUsuario = async (id, usuario) => {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(usuario),
  });
  return await handleResponse(res);
};

export const deleteUsuario = async (id) => {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return await handleResponse(res);
};

// ------------------------------------------------------------------------
// 🧬 CRUD PACIENTES
// ------------------------------------------------------------------------

export const getPacientes = async () => {
  const res = await fetch(`${API_BASE}/pacientes`, { headers: getHeaders(true) });
  return await handleResponse(res);
};

export const getPacienteById = async (id) => {
  const res = await fetch(`${API_BASE}/pacientes/${id}`, { headers: getHeaders(true) });
  return await handleResponse(res);
};

export const createPaciente = async (paciente) => {
  const res = await fetch(`${API_BASE}/pacientes`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(paciente),
  });
  return await handleResponse(res);
};

export const updatePaciente = async (id, paciente) => {
  const res = await fetch(`${API_BASE}/pacientes/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(paciente),
  });
  return await handleResponse(res);
};

export const deletePaciente = async (id) => {
  const res = await fetch(`${API_BASE}/pacientes/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return await handleResponse(res);
};

// ------------------------------------------------------------------------
// 🧪 CRUD EXÁMENES
// ------------------------------------------------------------------------

export const getExamenes = async () => {
  const res = await fetch(`${API_BASE}/examenes`, { headers: getHeaders(true) });
  return await handleResponse(res);
};

export const getExamenById = async (id) => {
  const res = await fetch(`${API_BASE}/examenes/${id}`, { headers: getHeaders(true) });
  return await handleResponse(res);
};

export const createExamen = async (examen) => {
  const res = await fetch(`${API_BASE}/examenes`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(examen),
  });
  return await handleResponse(res);
};

export const updateExamen = async (id, examen) => {
  const res = await fetch(`${API_BASE}/examenes/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(examen),
  });
  return await handleResponse(res);
};

export const deleteExamen = async (id) => {
  const res = await fetch(`${API_BASE}/examenes/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return await handleResponse(res);
};