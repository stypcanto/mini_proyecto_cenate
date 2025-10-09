// ========================================================================
// 🌍 CONFIGURACIÓN GLOBAL DEL CLIENTE API - CENATE
// ========================================================================

// URL base del backend (configurable por entorno)
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

/**
 * 🔧 Genera encabezados HTTP para las solicitudes
 * @param {boolean} includeAuth - Si debe incluir el token JWT
 */
const getHeaders = (includeAuth = false) => {
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
const handleResponse = async (response) => {
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
// 🧠 AUTENTICACIÓN
// ========================================================================

/**
 * 🔐 Inicia sesión con usuario y contraseña
 */
export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse(response);
    console.log("✅ Login exitoso:", data);
    return data;
  } catch (error) {
    console.error("❌ Error en loginUser:", error);
    throw error;
  }
};

/**
 * 🚪 Cierra sesión y limpia el almacenamiento local
 */
export const logoutUser = async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: getHeaders(true),
    });
  } catch (error) {
    console.error("⚠️ Error cerrando sesión:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
  }
};

/**
 * 👤 Registra un nuevo usuario
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("❌ Error en registerUser:", error);
    throw error;
  }
};

/**
 * 🧾 Obtiene el perfil del usuario autenticado
 */
export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("❌ Error en getUserProfile:", error);
    throw error;
  }
};

/**
 * 📩 Envía correo para recuperación de contraseña
 */
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("❌ Error en forgotPassword:", error);
    throw error;
  }
};

/**
 * 🔑 Restablece la contraseña usando token de recuperación
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ token, newPassword }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("❌ Error en resetPassword:", error);
    throw error;
  }
};

// ========================================================================
// 👥 CRUD USUARIOS
// ========================================================================

export const getUsuarios = async () => {
  const response = await fetch(`${API_BASE_URL}/usuarios`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const getUsuarioById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const createUsuario = async (usuario) => {
  const response = await fetch(`${API_BASE_URL}/usuarios`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(usuario),
  });
  return handleResponse(response);
};

export const updateUsuario = async (id, usuario) => {
  const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(usuario),
  });
  return handleResponse(response);
};

export const deleteUsuario = async (id) => {
  const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

// ========================================================================
// 🧬 CRUD PACIENTES
// ========================================================================

export const getPacientes = async () => {
  const response = await fetch(`${API_BASE_URL}/pacientes`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const getPacienteById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/pacientes/${id}`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const createPaciente = async (paciente) => {
  const response = await fetch(`${API_BASE_URL}/pacientes`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(paciente),
  });
  return handleResponse(response);
};

export const updatePaciente = async (id, paciente) => {
  const response = await fetch(`${API_BASE_URL}/pacientes/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(paciente),
  });
  return handleResponse(response);
};

export const deletePaciente = async (id) => {
  const response = await fetch(`${API_BASE_URL}/pacientes/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

// ========================================================================
// 🧪 CRUD EXÁMENES
// ========================================================================

export const getExamenes = async () => {
  const response = await fetch(`${API_BASE_URL}/examenes`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const getExamenById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/examenes/${id}`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const createExamen = async (examen) => {
  const response = await fetch(`${API_BASE_URL}/examenes`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(examen),
  });
  return handleResponse(response);
};

export const updateExamen = async (id, examen) => {
  const response = await fetch(`${API_BASE_URL}/examenes/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(examen),
  });
  return handleResponse(response);
};

export const deleteExamen = async (id) => {
  const response = await fetch(`${API_BASE_URL}/examenes/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

// ========================================================================
// 🌐 EXPORTS GLOBALES
// ========================================================================

export { API_BASE_URL, getHeaders, handleResponse };
