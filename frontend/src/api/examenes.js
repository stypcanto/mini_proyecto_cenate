// ========================================================================
// 🧪 API DE EXÁMENES - CENATE
// ========================================================================
// Servicios para gestión de exámenes y transferencias
// Compatible con CRA, Docker y Spring Boot backend
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "../config/api";

/**
 * 📋 Obtener todos los exámenes con paginación
 * @param {number} page - Página actual
 * @param {number} size - Tamaño de página
 */
export const getExamenes = async (page = 0, size = 10) => {
  try {
    const res = await fetch(`${API_BASE}/examenes?page=${page}&size=${size}`, {
      method: "GET",
      headers: getHeaders(true),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ Error obteniendo exámenes:", error);
    throw error;
  }
};

/**
 * 🔍 Buscar exámenes por nombre y/o código
 * @param {string} nombre - Nombre del examen (opcional)
 * @param {string} codigo - Código del examen (opcional)
 */
export const buscarExamenes = async (nombre = "", codigo = "") => {
  try {
    const params = new URLSearchParams();
    if (nombre) params.append("nombre", nombre);
    if (codigo) params.append("codigo", codigo);

    const res = await fetch(`${API_BASE}/examenes/buscar?${params.toString()}`, {
      method: "GET",
      headers: getHeaders(true),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ Error buscando exámenes:", error);
    throw error;
  }
};

/**
 * 🧾 Obtener un examen por su ID
 * @param {string|number} id - ID del examen
 */
export const getExamenById = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/examenes/${id}`, {
      method: "GET",
      headers: getHeaders(true),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error(`❌ Error obteniendo examen ${id}:`, error);
    throw error;
  }
};

/**
 * ➕ Crear un nuevo examen
 * @param {Object} examenData - Datos del examen
 */
export const createExamen = async (examenData) => {
  try {
    const res = await fetch(`${API_BASE}/examenes`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(examenData),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ Error creando examen:", error);
    throw error;
  }
};

/**
 * ✏️ Actualizar un examen existente
 * @param {string|number} id - ID del examen
 * @param {Object} examenData - Datos actualizados
 */
export const updateExamen = async (id, examenData) => {
  try {
    const res = await fetch(`${API_BASE}/examenes/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(examenData),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error(`❌ Error actualizando examen ${id}:`, error);
    throw error;
  }
};

/**
 * 🗑️ Eliminar un examen
 * @param {string|number} id - ID del examen
 */
export const deleteExamen = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/examenes/${id}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error(`❌ Error eliminando examen ${id}:`, error);
    throw error;
  }
};

/**
 * 🔄 Obtener transferencias relacionadas a un examen
 * @param {string|number} examenId - ID del examen
 */
export const getTransferenciasExamen = async (examenId) => {
  try {
    const res = await fetch(`${API_BASE}/examenes/${examenId}/transferencias`, {
      method: "GET",
      headers: getHeaders(true),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error(`❌ Error obteniendo transferencias del examen ${examenId}:`, error);
    throw error;
  }
};

/**
 * 📤 Crear una nueva transferencia de examen
 * @param {Object} transferenciaData - Datos de la transferencia
 */
export const createTransferencia = async (transferenciaData) => {
  try {
    const res = await fetch(`${API_BASE}/transferencias`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(transferenciaData),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ Error creando transferencia:", error);
    throw error;
  }
};

/**
 * 🏥 Obtener lista de IPRESS disponibles
 */
export const getIpressList = async () => {
  try {
    const res = await fetch(`${API_BASE}/ipress`, {
      method: "GET",
      headers: getHeaders(true),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ Error obteniendo lista de IPRESS:", error);
    throw error;
  }
};