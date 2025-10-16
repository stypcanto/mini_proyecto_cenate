// ========================================================================
// 👥 API PERSONAL - CENATE
// ========================================================================
// Gestiona Personal CENATE (CNT) y Personal Externo con endpoints REST.
// Incluye funciones auxiliares para búsqueda, áreas e imágenes.
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "@/lib/apiClient";

// ========================================================================
// 🧠 Helper genérico para llamadas seguras (con manejo de errores)
// ========================================================================
const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    return await handleResponse(res);
  } catch (error) {
    console.error(`❌ Error en llamada a ${url}:`, error);
    throw new Error("Error al comunicarse con el servidor");
  }
};

// ========================================================================
// 🏢 PERSONAL CNT (INTERNOS - CENATE)
// ========================================================================

export const getAllPersonalCnt = () =>
  safeFetch(`${API_BASE}/personal-cnt`, { headers: getHeaders(true) });

export const getPersonalCntById = (id) =>
  safeFetch(`${API_BASE}/personal-cnt/${id}`, { headers: getHeaders(true) });

export const getPersonalCntByUsuario = (idUsuario) =>
  safeFetch(`${API_BASE}/personal-cnt/usuario/${idUsuario}`, { headers: getHeaders(true) });

export const createPersonalCnt = (personal) =>
  safeFetch(`${API_BASE}/personal-cnt`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(personal),
  });

export const updatePersonalCnt = (id, personal) =>
  safeFetch(`${API_BASE}/personal-cnt/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(personal),
  });

export const deletePersonalCnt = (id) =>
  safeFetch(`${API_BASE}/personal-cnt/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

export const searchPersonalCnt = (query) =>
  safeFetch(`${API_BASE}/personal-cnt/search?query=${encodeURIComponent(query)}`, {
    headers: getHeaders(true),
  });

export const getPersonalCntByArea = (idArea) =>
  safeFetch(`${API_BASE}/personal-cnt/area/${idArea}`, { headers: getHeaders(true) });

export const getPersonalCntActivo = () =>
  safeFetch(`${API_BASE}/personal-cnt/activo`, { headers: getHeaders(true) });

export const getPersonalCntInactivo = () =>
  safeFetch(`${API_BASE}/personal-cnt/inactivo`, { headers: getHeaders(true) });

// 📸 Subir / Eliminar / Obtener foto de personal CNT
export const uploadFotoPersonalCnt = async (id, file) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/personal-cnt/${id}/foto`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("❌ Error al subir foto del personal CNT:", error);
    throw new Error("No se pudo subir la foto");
  }
};

export const deleteFotoPersonalCnt = (id) =>
  safeFetch(`${API_BASE}/personal-cnt/${id}/foto`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

export const getFotoPersonalCntUrl = (id) => `${API_BASE}/personal-cnt/${id}/foto`;

// ========================================================================
// 🌍 PERSONAL EXTERNO
// ========================================================================

export const getAllPersonalExterno = () =>
  safeFetch(`${API_BASE}/personal-externo`, { headers: getHeaders(true) });

export const getPersonalExternoById = (id) =>
  safeFetch(`${API_BASE}/personal-externo/${id}`, { headers: getHeaders(true) });

export const createPersonalExterno = (personal) =>
  safeFetch(`${API_BASE}/personal-externo`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(personal),
  });

export const updatePersonalExterno = (id, personal) =>
  safeFetch(`${API_BASE}/personal-externo/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(personal),
  });

export const deletePersonalExterno = (id) =>
  safeFetch(`${API_BASE}/personal-externo/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });

export const searchPersonalExterno = (query) =>
  safeFetch(`${API_BASE}/personal-externo/search?query=${encodeURIComponent(query)}`, {
    headers: getHeaders(true),
  });

export const getPersonalExternoByIpress = (idIpress) =>
  safeFetch(`${API_BASE}/personal-externo/ipress/${idIpress}`, {
    headers: getHeaders(true),
  });

// ========================================================================
// 👥 PERSONAL TOTAL (Vista combinada CENATE + Externo)
// ========================================================================

export const getPersonalTotal = () =>
  safeFetch(`${API_BASE}/personal/total`, { headers: getHeaders(true) });

export const getDetallePersonal = (idUser) =>
  safeFetch(`${API_BASE}/personal/detalle/${idUser}`, { headers: getHeaders(true) });

// ========================================================================
// 📅 CUMPLEAÑOS
// ========================================================================

export const getCumpleanerosMesActual = () =>
  safeFetch(`${API_BASE}/personal/cumpleaneros/mes`, { headers: getHeaders(true) });

export const getCumpleanerosMes = (mes) =>
  safeFetch(`${API_BASE}/personal/cumpleaneros/mes/${mes}`, { headers: getHeaders(true) });

export const getCumpleanerosHoy = () =>
  safeFetch(`${API_BASE}/personal/cumpleaneros/hoy`, { headers: getHeaders(true) });

// ========================================================================
// 📋 CATÁLOGOS AUXILIARES (Tipos, Áreas, Régimen, Ipress)
// ========================================================================

export const getTiposDocumento = () =>
  safeFetch(`${API_BASE}/tipos-documento`, { headers: getHeaders(true) });

export const getAreas = () =>
  safeFetch(`${API_BASE}/areas`, { headers: getHeaders(true) });

export const getRegimenesLaborales = () =>
  safeFetch(`${API_BASE}/regimenes-laborales`, { headers: getHeaders(true) });

export const getIpress = () =>
  safeFetch(`${API_BASE}/ipress`, { headers: getHeaders(true) });

export const searchIpress = (query) =>
  safeFetch(`${API_BASE}/ipress/search?query=${encodeURIComponent(query)}`, {
    headers: getHeaders(true),
  });