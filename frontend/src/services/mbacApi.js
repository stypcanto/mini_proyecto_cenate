// ========================================================================
// ⚙️ mbacApi.js – API centralizada para MBAC + Usuarios + Permisos (CENATE 2025)
// ------------------------------------------------------------------------
// • Gestiona endpoints MBAC y catálogos
// • Usa axios con interceptores JWT
// • Compatible con CRA y REACT_APP_API_URL
// • Maneja errores 401/500 de forma controlada
// ========================================================================

import axios from "axios";

// 🌐 Base URL según entorno CRA
const BASE_URL =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim()) ||
  "http://localhost:8080";

// 🧩 Crear instancia Axios base
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================================================
// 🧱 Interceptores
// ========================================================================

// 🔑 Inyecta token JWT en cada petición
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("auth.token") ||
      localStorage.getItem("jwt_token") ||
      sessionStorage.getItem("auth.token") ||
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("token"); // fallback

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Manejo de respuestas y errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("🔒 Sesión expirada o token inválido.");
      localStorage.removeItem("auth.token");
      localStorage.removeItem("jwt_token");
      sessionStorage.removeItem("auth.token");

      // Evitar redirigir en bucle si ya estás en /login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else if (status === 500) {
      console.error("💥 Error interno del servidor MBAC:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

// ========================================================================
// 🚀 API principal MBAC
// ========================================================================

export const mbacApi = {
  // ============================================================
  // 👥 GESTIÓN DE USUARIOS
  // ============================================================

  async crearUsuario(userData, token) {
    const res = await api.post("/api/mbac/usuarios", userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async obtenerUsuario(userId, token) {
    const res = await api.get(`/api/mbac/usuarios/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async actualizarUsuario(userId, userData, token) {
    const res = await api.put(`/api/mbac/usuarios/${userId}`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async cambiarEstadoUsuario(userId, activo, token) {
    const res = await api.patch(
      `/api/mbac/usuarios/${userId}/estado?activo=${activo}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  async eliminarUsuario(userId, token) {
    const res = await api.delete(`/api/mbac/usuarios/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async buscarUsuarios(filtros, token) {
    const res = await api.post("/api/mbac/usuarios/buscar", filtros, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async listarUsuariosActivos(token) {
    const res = await api.get("/api/mbac/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // ============================================================
  // 🧩 GESTIÓN DE ROLES
  // ============================================================

  async asignarRoles(userId, rolesIds, token) {
    const res = await api.post(
      `/api/mbac/usuarios/${userId}/roles`,
      { rolesIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  async asignarRolConPermisos(userId, data, token) {
    const res = await api.post(
      `/api/mbac/usuarios/${userId}/roles/personalizado`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  // ============================================================
  // 🔐 GESTIÓN DE PERMISOS
  // ============================================================

  async asignarPermisosDirectos(userId, permisosData, token) {
    const res = await api.post(
      `/api/mbac/usuarios/${userId}/permisos`,
      permisosData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  async actualizarPermisos(data, token) {
    const res = await api.patch(
      `/api/mbac/usuarios/${data.userId}/permisos`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  async verificarPermiso(userId, rutaPagina, accion, token) {
    const res = await api.post(
      `/api/mbac/usuarios/${userId}/verificar-permiso`,
      { rutaPagina, accion },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  async obtenerMatrizPermisos(userId, token) {
    const res = await api.get(
      `/api/mbac/usuarios/${userId}/matriz-permisos`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  async obtenerResumenPermisos(userId, token) {
    const res = await api.get(
      `/api/mbac/usuarios/${userId}/resumen-permisos`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  // ============================================================
  // 🏢 GESTIÓN DE ÁREAS
  // ============================================================

  async configurarAccesoArea(data, token) {
    const res = await api.post(
      `/api/mbac/usuarios/${data.userId}/areas`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  // ============================================================
  // 📚 CATÁLOGOS
  // ============================================================

  async obtenerRoles(token) {
    const res = await api.get("/api/roles", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async obtenerAreas(token) {
    const res = await api.get("/api/areas", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async obtenerPermisos(token) {
    const res = await api.get("/api/permisos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // ============================================================
  // ⚙️ UTILIDADES
  // ============================================================

  async healthCheck(token) {
    const res = await api.get("/api/mbac/usuarios/health", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async exportarUsuarios(filtros, token) {
    const res = await api.post("/api/mbac/usuarios/exportar", filtros, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });
    return res.data;
  },
};

// ============================================================
// 🧭 Exportar instancia
// ============================================================
export default mbacApi;
