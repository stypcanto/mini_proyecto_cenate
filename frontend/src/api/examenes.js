// ========================================================================
// 🧪 API DE EXÁMENES - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "@/lib/apiClient";

export const getExamenes = (page = 0, size = 10) =>
  fetch(`${API_BASE}/examenes?page=${page}&size=${size}`, {
    headers: getHeaders(true),
  }).then(handleResponse);

export const buscarExamenes = (nombre = "", codigo = "") => {
  const params = new URLSearchParams();
  if (nombre) params.append("nombre", nombre);
  if (codigo) params.append("codigo", codigo);
  return fetch(`${API_BASE}/examenes/buscar?${params}`, {
    headers: getHeaders(true),
  }).then(handleResponse);
};

export const getExamenById = (id) =>
  fetch(`${API_BASE}/examenes/${id}`, { headers: getHeaders(true) }).then(handleResponse);

export const createExamen = (data) =>
  fetch(`${API_BASE}/examenes`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateExamen = (id, data) =>
  fetch(`${API_BASE}/examenes/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteExamen = (id) =>
  fetch(`${API_BASE}/examenes/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  }).then(handleResponse);