// frontend/src/config/api.js

export const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

export const getHeaders = (includeAuth = false) => {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = { message: "Respuesta no válida del servidor" };
  }
  if (!response.ok) throw new Error(data.message || `Error ${response.status}`);
  return data;
};
