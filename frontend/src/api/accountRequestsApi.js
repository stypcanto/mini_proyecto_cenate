// ========================================================================
// 📝 API DE SOLICITUDES DE CUENTA - CENATE
// ========================================================================

import { API_BASE, getHeaders, handleResponse } from "@/lib/apiClient";

export const createAccountRequest = async (requestData) => {
  const res = await fetch(`${API_BASE}/account-requests`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(requestData),
  });
  return handleResponse(res);
};

export const getPendingRequests = async () => {
  const res = await fetch(`${API_BASE}/account-requests/pendientes`, {
    headers: getHeaders(true),
  });
  return handleResponse(res);
};

export const approveRequest = async (id, reviewData) => {
  const res = await fetch(`${API_BASE}/account-requests/${id}/aprobar`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(reviewData),
  });
  return handleResponse(res);
};

export const rejectRequest = async (id, reviewData) => {
  const res = await fetch(`${API_BASE}/account-requests/${id}/rechazar`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(reviewData),
  });
  return handleResponse(res);
};

export const generateTemporaryPassword = () => {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const length = 10;
  let password = "";
  for (let i = 0; i < length; i++)
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  password += Math.floor(Math.random() * 10);
  password += "!@#$%"[Math.floor(Math.random() * 5)];
  return password;
};