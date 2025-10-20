const API_BASE =
  process.env.NODE_ENV === "production"
    ? "/api" // En Docker/Nginx
    : "http://localhost:8080/api"; // En desarrollo local

export const apiClient = {
  get: async (endpoint, auth = false) => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(`${API_BASE}${endpoint}`, { headers });
    return res.json();
  },
  post: async (endpoint, body, auth = false) => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    return res.json();
  },
};