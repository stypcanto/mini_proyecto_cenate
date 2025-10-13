// ========================================================================
// 🏢 API DE ÁREAS - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "../config/api";

/**
 * 📋 Obtiene todas las áreas
 */
export const getAreas = async () => {
  try {
    const response = await fetch(`${API_BASE}/areas`, {
      method: "GET",
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("❌ Error obteniendo áreas:", error.message);
    throw new Error("No se pudieron cargar las áreas");
  }
};

/**
 * 🔍 Obtiene un área por su ID
 * @param {number|string} id - Identificador del área
 */
export const getAreaById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/areas/${id}`, {
      method: "GET",
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error obteniendo área con ID ${id}:`, error.message);
    throw new Error("No se pudo obtener la información del área");
  }
};

/**
 * ➕ Crea una nueva área
 * @param {Object} areaData - Datos de la nueva área
 */
export const createArea = async (areaData) => {
  try {
    const response = await fetch(`${API_BASE}/areas`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(areaData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("❌ Error creando nueva área:", error.message);
    throw new Error("No se pudo crear el área");
  }
};

/**
 * ✏️ Actualiza un área existente
 * @param {number|string} id - ID del área a actualizar
 * @param {Object} areaData - Datos actualizados
 */
export const updateArea = async (id, areaData) => {
  try {
    const response = await fetch(`${API_BASE}/areas/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(areaData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error actualizando área ${id}:`, error.message);
    throw new Error("No se pudo actualizar el área");
  }
};

/**
 * 🗑️ Elimina un área existente
 * @param {number|string} id - ID del área a eliminar
 */
export const deleteArea = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/areas/${id}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error eliminando área ${id}:`, error.message);
    throw new Error("No se pudo eliminar el área");
  }
};