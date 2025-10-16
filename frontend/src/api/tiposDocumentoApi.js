// ========================================================================
// 📄 API DE TIPOS DE DOCUMENTO - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "@/lib/apiClient"; // ⚙️ usa ruta relativa, no alias "@/"

// ========================================================================
// 🧾 FUNCIONES CRUD DE TIPOS DE DOCUMENTO
// ========================================================================

/**
 * 📋 Obtiene todos los tipos de documento
 */
export const getTiposDocumento = async () => {
  try {
    const response = await fetch(`${API_BASE}/tipos-documento`, {
      method: "GET",
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("❌ Error obteniendo tipos de documento:", error);
    throw error;
  }
};

/**
 * 🔍 Obtiene un tipo de documento por ID
 * @param {number|string} id - ID del tipo de documento
 */
export const getTipoDocumentoById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/tipos-documento/${id}`, {
      method: "GET",
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error obteniendo tipo de documento ${id}:`, error);
    throw error;
  }
};

/**
 * ➕ Crea un nuevo tipo de documento
 * @param {object} tipoDocumentoData - Datos del tipo de documento
 */
export const createTipoDocumento = async (tipoDocumentoData) => {
  try {
    const response = await fetch(`${API_BASE}/tipos-documento`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(tipoDocumentoData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("❌ Error creando tipo de documento:", error);
    throw error;
  }
};

/**
 * ✏️ Actualiza un tipo de documento existente
 * @param {number|string} id - ID del tipo de documento
 * @param {object} tipoDocumentoData - Datos actualizados
 */
export const updateTipoDocumento = async (id, tipoDocumentoData) => {
  try {
    const response = await fetch(`${API_BASE}/tipos-documento/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(tipoDocumentoData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error actualizando tipo de documento ${id}:`, error);
    throw error;
  }
};

/**
 * 🗑️ Elimina un tipo de documento
 * @param {number|string} id - ID del tipo de documento
 */
export const deleteTipoDocumento = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/tipos-documento/${id}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ Error eliminando tipo de documento ${id}:`, error);
    throw error;
  }
};