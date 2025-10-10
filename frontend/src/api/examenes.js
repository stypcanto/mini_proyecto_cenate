// src/api/examenesApi.js
import { API_BASE, getHeaders, handleResponse } from "@/config/api";

/**
 * Obtener todos los exámenes con paginación
 */
export const getExamenes = async (page = 0, size = 10) => {
  try {
    const response = await fetch(`${API_BASE}/examenes?page=${page}&size=${size}`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en getExamenes:', error);
    throw error;
  }
};

/**
 * Buscar exámenes por nombre y/o código
 */
export const buscarExamenes = async (nombre = '', codigo = '') => {
  try {
    const params = new URLSearchParams();
    if (nombre) params.append('nombre', nombre);
    if (codigo) params.append('codigo', codigo);

    const response = await fetch(`${API_BASE}/examenes/buscar?${params}`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en buscarExamenes:', error);
    throw error;
  }
};

/**
 * Obtener un examen por ID
 */
export const getExamenById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/examenes/${id}`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en getExamenById:', error);
    throw error;
  }
};

/**
 * Crear un nuevo examen
 */
export const createExamen = async (examenData) => {
  try {
    const response = await fetch(`${API_BASE}/examenes`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(examenData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en createExamen:', error);
    throw error;
  }
};

/**
 * Actualizar un examen existente
 */
export const updateExamen = async (id, examenData) => {
  try {
    const response = await fetch(`${API_BASE}/examenes/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(examenData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en updateExamen:', error);
    throw error;
  }
};

/**
 * Eliminar un examen
 */
export const deleteExamen = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/examenes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en deleteExamen:', error);
    throw error;
  }
};

/**
 * Obtener transferencias de un examen
 */
export const getTransferenciasExamen = async (examenId) => {
  try {
    const response = await fetch(`${API_BASE}/examenes/${examenId}/transferencias`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en getTransferenciasExamen:', error);
    throw error;
  }
};

/**
 * Crear una transferencia de examen
 */
export const createTransferencia = async (transferenciaData) => {
  try {
    const response = await fetch(`${API_BASE}/transferencias`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(transferenciaData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en createTransferencia:', error);
    throw error;
  }
};

/**
 * Obtener lista de IPRESS disponibles
 */
export const getIpressList = async () => {
  try {
    const response = await fetch(`${API_BASE}/ipress`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en getIpressList:', error);
    throw error;
  }
};
