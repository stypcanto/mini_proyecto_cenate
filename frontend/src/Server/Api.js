// Configuración de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * Login de usuario
 * @param {string} dni - DNI del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise} Datos del usuario autenticado
 */
export const loginUser = async (dni, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dni, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en la autenticación');
    }

    const data = await response.json();
    console.log('✅ Login exitoso:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en loginUser:', error);
    throw error;
  }
};

/**
 * Registro de nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise} Usuario registrado
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en el registro');
    }

    const data = await response.json();
    console.log('✅ Registro exitoso:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en registerUser:', error);
    throw error;
  }
};

/**
 * Verificar token de autenticación
 * @param {string} token - Token JWT
 * @returns {Promise} Datos del usuario
 */
export const verifyToken = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Token inválido o expirado');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error en verifyToken:', error);
    throw error;
  }
};

/**
 * Cerrar sesión (invalidar token)
 * @param {string} token - Token JWT
 * @returns {Promise} Confirmación de logout
 */
export const logoutUser = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }

    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return { success: true };
  } catch (error) {
    console.error('❌ Error en logoutUser:', error);
    throw error;
  }
};

/**
 * Recuperar contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise} Confirmación de envío
 */
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al enviar correo');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error en forgotPassword:', error);
    throw error;
  }
};

/**
 * Restablecer contraseña
 * @param {string} token - Token de recuperación
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise} Confirmación
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al restablecer contraseña');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error en resetPassword:', error);
    throw error;
  }
};

/**
 * Obtener perfil del usuario autenticado
 * @param {string} token - Token JWT
 * @returns {Promise} Datos del perfil
 */
export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener perfil');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error en getUserProfile:', error);
    throw error;
  }
};
