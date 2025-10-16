// ========================================================================
// 🧠 HOOK DE AUTENTICACIÓN - useAuth()
// ========================================================================
// Este hook administra el estado de sesión del usuario:
//  - login/logout usando src/api/auth.js
//  - persistencia de token / roles / permisos
//  - detección de sesión activa
// ========================================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  login as loginApi,
  logout as logoutApi,
  getCurrentUser,
} from "@/api/auth";

// ========================================================================
// 🚀 useAuth() principal
// ========================================================================
export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // ------------------------------------------------------------------------
  // 🧩 Iniciar sesión
  // ------------------------------------------------------------------------
  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const data = await loginApi(username, password);

      // 🔐 Guardar token y datos básicos
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      if (data.nombreCompleto) localStorage.setItem("nombreCompleto", data.nombreCompleto);
      if (data.roles) localStorage.setItem("roles", JSON.stringify(data.roles));
      if (data.permisos) localStorage.setItem("permisos", JSON.stringify(data.permisos));
      if (data.userId) localStorage.setItem("userId", data.userId);

      setUser(data);
      setIsAuthenticated(true);
      toast.success("Inicio de sesión exitoso ✅");

      // 🔀 Redirección según rol principal
      const rol = (data.roles?.[0] || "").toUpperCase();
      const rutas = {
        SUPERADMIN: "/admin",
        ADMIN: "/admin",
        MEDICO: "/roles/medico",
        COORDINADOR: "/roles/coordinador",
        COORDINACION: "/roles/coordinador",
        ENFERMERIA: "/roles/externo",
        EXTERNO: "/roles/externo",
      };
      navigate(rutas[rol] || "/user/dashboard", { replace: true });

      return data;
    } catch (error) {
      toast.error(error.message || "Credenciales incorrectas.");
      console.error("❌ Error al iniciar sesión:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ------------------------------------------------------------------------
  // 🚪 Cerrar sesión
  // ------------------------------------------------------------------------
  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
    setIsAuthenticated(false);
    toast("Sesión cerrada", { icon: "🚪" });
    navigate("/login", { replace: true });
  }, [navigate]);

  // ------------------------------------------------------------------------
  // 🔁 Cargar usuario actual (si hay token)
  // ------------------------------------------------------------------------
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const profile = await getCurrentUser();
      setUser(profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.warn("⚠️ Token inválido o expirado. Cerrando sesión.");
      logout();
    }
  }, [logout]);

  // ------------------------------------------------------------------------
  // 🧭 Cargar usuario al iniciar la app
  // ------------------------------------------------------------------------
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ------------------------------------------------------------------------
  // 🎯 Valores retornados
  // ------------------------------------------------------------------------
  return useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      logout,
    }),
    [user, loading, isAuthenticated, login, logout]
  );
};