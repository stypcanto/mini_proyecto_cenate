// ========================================================================
// 👥 API PERSONAL - CENATE
// ========================================================================
// Gestiona Personal CENATE (CNT) y Personal Externo con endpoints REST.
// Incluye funciones auxiliares para búsqueda, áreas e imágenes.

import { API_BASE, getHeaders, handleResponse } from "../config/api";

// ========================================================================
// 🏢 PERSONAL CNT (CENATE)
// ========================================================================

export const getAllPersonalCnt = async () => {
  const res = await fetch(`${API_BASE}/personal-cnt`, { headers: getHeaders(true) });
  return handleResponse(res);
};

export const getPersonalCntById = async (id) => {
  const res = await fetch(`${API_BASE}/personal-cnt/${id}`, { headers: getHeaders(true) });
  return handleResponse(res);
};

export const createPersonalCnt = async (personal) => {
  const res = await fetch(`${API_BASE}/personal-cnt`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(personal),
  });
  return handleResponse(res);
};

export const updatePersonalCnt = async (id, personal) => {
  const res = await fetch(`${API_BASE}/personal-cnt/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(personal),
  });
  return handleResponse(res);
};

export const deletePersonalCnt = async (id) => {
  const res = await fetch(`${API_BASE}/personal-cnt/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return handleResponse(res);
};

export const searchPersonalCnt = async (query) => {
  const res = await fetch(`${API_BASE}/personal-cnt/search?query=${encodeURIComponent(query)}`, {
    headers: getHeaders(true),
  });
  return handleResponse(res);
};

export const getPersonalCntByArea = async (idArea) => {
  const res = await fetch(`${API_BASE}/personal-cnt/area/${idArea}`, { headers: getHeaders(true) });
  return handleResponse(res);
};

export const getPersonalCntActivo = async () => {
  const res = await fetch(`${API_BASE}/personal-cnt/activo`, { headers: getHeaders(true) });
  return handleResponse(res);
};

export const getPersonalCntInactivo = async () => {
  const res = await fetch(`${API_BASE}/personal-cnt/inactivo`, { headers: getHeaders(true) });
  return handleResponse(res);
};

// 📸 Subir / Eliminar / Obtener foto de personal CNT
export const uploadFotoPersonalCnt = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/personal-cnt/${id}/foto`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
};

export const deleteFotoPersonalCnt = async (id) => {
  const res = await fetch(`${API_BASE}/personal-cnt/${id}/foto`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return handleResponse(res);
};

export const getFotoPersonalCntUrl = (id) => `${API_BASE}/personal-cnt/${id}/foto`;

// ========================================================================
// 🌍 PERSONAL EXTERNO
// ========================================================================

export const getAllPersonalExterno = async () => {
  const res = await fetch(`${API_BASE}/personal-externo`, { headers: getHeaders(true) });
  return handleResponse(res);
};

export const getPersonalExternoById = async (id) => {
  const res = await fetch(`${API_BASE}/personal-externo/${id}`, { headers: getHeaders(true) });
  return handleResponse(res);
};

export const createPersonalExterno = async (personal) => {
  const res = await fetch(`${API_BASE}/personal-externo`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(personal),
  });
  return handleResponse(res);
};

export const updatePersonalExterno = async (id, personal) => {
  const res = await fetch(`${API_BASE}/personal-externo/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(personal),
  });
  return handleResponse(res);
};

export const deletePersonalExterno = async (id) => {
  const res = await fetch(`${API_BASE}/personal-externo/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return handleResponse(res);
};

export const searchPersonalExterno = async (query) => {
  const res = await fetch(`${API_BASE}/personal-externo/search?query=${encodeURIComponent(query)}`, {
    headers: getHeaders(true),
  });
  return handleResponse(res);
};

export const getPersonalExternoByIpress = async (idIpress) => {
  const res = await fetch(`${API_BASE}/personal-externo/ipress/${idIpress}`, {
    headers: getHeaders(true),
  });
  return handleResponse(res);
};

// ========================================================================
// 📋 CATÁLOGOS (Auxiliares, opcional separar en catalogosApi.js)
// ========================================================================

export const getTiposDocumento = async () => {
  const res = await fetch(`${API_BASE}/tipos-documento`, { headers: getHeaders(true) });
  return handleResponse(res);
};

export const getAreas = async () => {
  const res = await fetch(`${API_BASE}/areas`, { headers: getHeaders(true) });
  return handleResponse(res);
};

export const getRegimenesLaborales = async () => {
  const res = await fetch(`${API_BASE}/regimenes-laborales`, { headers: getHeaders(true) });
  return handleResponse(res);
};

export const getIpress = async () => {
  const res = await fetch(`${API_BASE}/ipress`, { headers: getHeaders(true) });
  return handleResponse(res);
};

export const searchIpress = async (query) => {
  const res = await fetch(`${API_BASE}/ipress/search?query=${encodeURIComponent(query)}`, {
    headers: getHeaders(true),
  });
  return handleResponse(res);
};