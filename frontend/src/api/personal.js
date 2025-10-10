// ========================================================================
// 👥 API PERSONAL - CENATE
// ========================================================================
// Servicios para gestión de Personal CNT y Personal Externo

import { API_BASE, getHeaders, handleResponse } from '../config/api';

// ========================================================================
// 🏢 PERSONAL CNT (CENATE)
// ========================================================================

export const getAllPersonalCnt = async () => {
  try {
    const response = await fetch(`${API_BASE}/personal-cnt`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en getAllPersonalCnt:', error);
    throw error;
  }
};

export const getPersonalCntById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/personal-cnt/${id}`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en getPersonalCntById:', error);
    throw error;
  }
};

export const createPersonalCnt = async (personal) => {
  try {
    const response = await fetch(`${API_BASE}/personal-cnt`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(personal),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en createPersonalCnt:', error);
    throw error;
  }
};

export const updatePersonalCnt = async (id, personal) => {
  try {
    const response = await fetch(`${API_BASE}/personal-cnt/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(personal),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en updatePersonalCnt:', error);
    throw error;
  }
};

export const deletePersonalCnt = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/personal-cnt/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en deletePersonalCnt:', error);
    throw error;
  }
};

export const searchPersonalCnt = async (query) => {
  try {
    const response = await fetch(`${API_BASE}/personal-cnt/search?query=${encodeURIComponent(query)}`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en searchPersonalCnt:', error);
    throw error;
  }
};

export const getPersonalCntByArea = async (idArea) => {
  try {
    const response = await fetch(`${API_BASE}/personal-cnt/area/${idArea}`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en getPersonalCntByArea:', error);
    throw error;
  }
};

export const getPersonalCntActivo = async () => {
  try {
    const response = await fetch(`${API_BASE}/personal-cnt/activo`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en getPersonalCntActivo:', error);
    throw error;
  }
};

export const getPersonalCntInactivo = async () => {
  try {
    const response = await fetch(`${API_BASE}/personal-cnt/inactivo`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en getPersonalCntInactivo:', error);
    throw error;
  }
};

export const uploadFotoPersonalCnt = async (id, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/personal-cnt/${id}/foto`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en uploadFotoPersonalCnt:', error);
    throw error;
  }
};

export const deleteFotoPersonalCnt = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/personal-cnt/${id}/foto`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en deleteFotoPersonalCnt:', error);
    throw error;
  }
};

export const getFotoPersonalCntUrl = (id) => `${API_BASE}/personal-cnt/${id}/foto`;

// ========================================================================
// 🌍 PERSONAL EXTERNO
// ========================================================================

export const getAllPersonalExterno = async () => {
  try {
    const response = await fetch(`${API_BASE}/personal-externo`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en getAllPersonalExterno:', error);
    throw error;
  }
};

export const getPersonalExternoById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/personal-externo/${id}`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en getPersonalExternoById:', error);
    throw error;
  }
};

export const createPersonalExterno = async (personal) => {
  try {
    const response = await fetch(`${API_BASE}/personal-externo`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(personal),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en createPersonalExterno:', error);
    throw error;
  }
};

export const updatePersonalExterno = async (id, personal) => {
  try {
    const response = await fetch(`${API_BASE}/personal-externo/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(personal),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en updatePersonalExterno:', error);
    throw error;
  }
};

export const deletePersonalExterno = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/personal-externo/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en deletePersonalExterno:', error);
    throw error;
  }
};

export const searchPersonalExterno = async (query) => {
  try {
    const response = await fetch(`${API_BASE}/personal-externo/search?query=${encodeURIComponent(query)}`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en searchPersonalExterno:', error);
    throw error;
  }
};

export const getPersonalExternoByIpress = async (idIpress) => {
  try {
    const response = await fetch(`${API_BASE}/personal-externo/ipress/${idIpress}`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en getPersonalExternoByIpress:', error);
    throw error;
  }
};

// ========================================================================
// 📋 CATÁLOGOS
// ========================================================================

export const getTiposDocumento = async () => {
  try {
    const response = await fetch(`${API_BASE}/tipos-documento`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en getTiposDocumento:', error);
    throw error;
  }
};

export const getAreas = async () => {
  try {
    const response = await fetch(`${API_BASE}/areas`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en getAreas:', error);
    throw error;
  }
};

export const getRegimenesLaborales = async () => {
  try {
    const response = await fetch(`${API_BASE}/regimenes-laborales`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en getRegimenesLaborales:', error);
    throw error;
  }
};

export const getIpress = async () => {
  try {
    const response = await fetch(`${API_BASE}/ipress`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en getIpress:', error);
    throw error;
  }
};

export const searchIpress = async (query) => {
  try {
    const response = await fetch(`${API_BASE}/ipress/search?query=${encodeURIComponent(query)}`, {
      headers: getHeaders(true),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Error en searchIpress:', error);
    throw error;
  }
};
