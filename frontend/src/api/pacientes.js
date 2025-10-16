// ========================================================================
// 🧬 API PACIENTES / ASEGURADOS - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "@/lib/apiClient";

export const getAsegurados = async (page = 0, size = 10) => {
  const res = await fetch(`${API_BASE}/asegurados?page=${page}&size=${size}`, {
    headers: getHeaders(true),
  });
  return handleResponse(res);
};

export const getAseguradoById = async (pkAsegurado) => {
  const res = await fetch(`${API_BASE}/asegurados/id/${pkAsegurado}`, {
    headers: getHeaders(true),
  });
  return handleResponse(res);
};

export const getAseguradoByDoc = async (docPaciente) => {
  const res = await fetch(`${API_BASE}/asegurados/doc/${docPaciente}`, {
    headers: getHeaders(true),
  });
  return handleResponse(res);
};