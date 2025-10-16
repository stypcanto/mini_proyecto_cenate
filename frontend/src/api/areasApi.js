// ========================================================================
// 🏢 API DE ÁREAS - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "@/lib/apiClient";

export const getAreas = async () => {
  const res = await fetch(`${API_BASE}/areas`, { headers: getHeaders(true) });
  return handleResponse(res);
};

export const getAreaById = async (id) => {
  const res = await fetch(`${API_BASE}/areas/${id}`, { headers: getHeaders(true) });
  return handleResponse(res);
};

export const createArea = async (areaData) => {
  const res = await fetch(`${API_BASE}/areas`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(areaData),
  });
  return handleResponse(res);
};

export const updateArea = async (id, areaData) => {
  const res = await fetch(`${API_BASE}/areas/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(areaData),
  });
  return handleResponse(res);
};

export const deleteArea = async (id) => {
  const res = await fetch(`${API_BASE}/areas/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return handleResponse(res);
};