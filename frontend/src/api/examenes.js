// API Service para Exámenes de Laboratorio
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * Obtener todos los exámenes con paginación
 * @param {number} page - Número de página (default: 0)
 * @param {number} size - Tamaño de página (default: 10)
 * @returns {Promise} Lista de exámenes
 */
export const getExamenes = async (page = 0, size = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/examenes?page=${page}&size=${size}`);
    if (!response.ok) {
      throw new Error('Error al obtener exámenes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getExamenes:', error);
    throw error;
  }
};

/**
 * Buscar exámenes por nombre y/o código
 * @param {string} nombre - Nombre del examen
 * @param {string} codigo - Código del examen
 * @returns {Promise} Lista de exámenes filtrados
 */
export const buscarExamenes = async (nombre = '', codigo = '') => {
  try {
    const params = new URLSearchParams();
    if (nombre) params.append('nombre', nombre);
    if (codigo) params.append('codigo', codigo);
    
    const response = await fetch(`${API_BASE_URL}/examenes/buscar?${params}`);
    if (!response.ok) {
      throw new Error('Error al buscar exámenes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en buscarExamenes:', error);
    throw error;
  }
};

/**
 * Obtener un examen por ID
 * @param {number} id - ID del examen
 * @returns {Promise} Datos del examen
 */
export const getExamenById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/examenes/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener el examen');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getExamenById:', error);
    throw error;
  }
};

/**
 * Crear un nuevo examen
 * @param {Object} examenData - Datos del examen
 * @returns {Promise} Examen creado
 */
export const createExamen = async (examenData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/examenes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(examenData),
    });
    if (!response.ok) {
      throw new Error('Error al crear el examen');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en createExamen:', error);
    throw error;
  }
};

/**
 * Actualizar un examen existente
 * @param {number} id - ID del examen
 * @param {Object} examenData - Datos actualizados del examen
 * @returns {Promise} Examen actualizado
 */
export const updateExamen = async (id, examenData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/examenes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(examenData),
    });
    if (!response.ok) {
      throw new Error('Error al actualizar el examen');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en updateExamen:', error);
    throw error;
  }
};

/**
 * Eliminar un examen
 * @param {number} id - ID del examen
 * @returns {Promise} Respuesta de eliminación
 */
export const deleteExamen = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/examenes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el examen');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en deleteExamen:', error);
    throw error;
  }
};

/**
 * Obtener transferencias de un examen
 * @param {number} examenId - ID del examen
 * @returns {Promise} Lista de transferencias
 */
export const getTransferenciasExamen = async (examenId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/examenes/${examenId}/transferencias`);
    if (!response.ok) {
      throw new Error('Error al obtener transferencias');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getTransferenciasExamen:', error);
    throw error;
  }
};

/**
 * Crear una transferencia de examen
 * @param {Object} transferenciaData - Datos de la transferencia
 * @returns {Promise} Transferencia creada
 */
export const createTransferencia = async (transferenciaData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transferencias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transferenciaData),
    });
    if (!response.ok) {
      throw new Error('Error al crear la transferencia');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en createTransferencia:', error);
    throw error;
  }
};

/**
 * Obtener lista de IPRESS disponibles
 * @returns {Promise} Lista de IPRESS
 */
export const getIpressList = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/ipress`);
    if (!response.ok) {
      throw new Error('Error al obtener lista de IPRESS');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getIpressList:', error);
    throw error;
  }
};
