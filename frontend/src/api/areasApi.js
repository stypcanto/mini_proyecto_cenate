// ========================================================================
// 🏢 API DE ÁREAS - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "@/config/api";

/**
 * 📋 Obtiene todas las áreas
 */
export const getAreas = async () => {
  try {
    const response = await fetch(`${API_BASE}/areas`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error obteniendo áreas:', error);
    throw error;
  }
};

/**
 * 🔍 Obtiene un área por ID
 */
export const getAreaById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/areas/${id}`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error obteniendo área ${id}:`, error);
    throw error;
  }
};

/**
 * ➕ Crea una nueva área
 */
export const createArea = async (areaData) => {
  try {
    const response = await fetch(`${API_BASE}/areas`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(areaData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error creando área:', error);
    throw error;
  }
};

/**
 * ✏️ Actualiza un área existente
 */
export const updateArea = async (id, areaData) => {
  try {
    const response = await fetch(`${API_BASE}/areas/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(areaData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error actualizando área ${id}:`, error);
    throw error;
  }
};

/**
 * 🗑️ Elimina un área
 */
export const deleteArea = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/areas/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error eliminando área ${id}:`, error);
    throw error;
  }
};
