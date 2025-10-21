// ========================================================================
// 🔐 AuthContext.jsx – Contexto global de autenticación MBAC CENATE
// ------------------------------------------------------------------------
// Maneja login, logout, restauración de sesión y control de roles.
// Actualizado para redirigir correctamente a Home tras logout.
// ========================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "../lib/apiClient";
import {
  saveToken,
  getToken,
  clearToken,
  saveUser,
  getUser,
  clearUser,
  decodeJwt,
} from "../constants/auth";

// 🧩 Crear el contexto
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // ============================================================
  // 🔁 Restaurar sesión desde localStorage
  // ============================================================
  useEffect(() => {
    if (token && !user) {
      try {
        const payload = decodeJwt(token);
        if (payload) {
          const restoredUser = {
            id: payload.sub || payload.user_id,
            username: payload.username || payload.preferred_username,
            roles: payload.roles || [],
            permisos: payload.permisos || [],
            nombreCompleto: payload.nombre_completo || payload.name || "",
          };
          setUser(restoredUser);
          saveUser(restoredUser);
        }
      } catch (error) {
        console.error("Error al restaurar sesión:", error);
        clearUser();
        clearToken();
      }
    }
    setInitialized(true);
  }, [token, user]);

  // ============================================================
  // 🔓 Login con backend RBAC
  // ============================================================
  const login = useCallback(
    async (username, password) => {
      setLoading(true);
      try {
        const data = await apiClient.post("/auth/login", { username, password });

        if (!data?.token) throw new Error("No se recibió token del servidor");

        const jwt = data.token;
        const payload = decodeJwt(jwt);

        const userData = {
          id: payload.sub || data.userId || data.id_user,
          username: payload.username || username,
          roles: payload.roles || data.roles || [],
          permisos: payload.permisos || data.permisos || [],
          nombreCompleto:
            data.nombreCompleto || data.nombre_completo || username,
          token: jwt,
        };

        saveToken(jwt);
        saveUser(userData);
        setUser(userData);
        setToken(jwt);

        toast.success(`Bienvenido, ${userData.nombreCompleto || userData.username}`);

        // ✅ Redirige al dashboard según rol
        navigate("/dashboard");
        return { ok: true };
      } catch (error) {
        console.error("Error en login:", error);
        toast.error(error.message || "Error al iniciar sesión");
        return { ok: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  // ============================================================
  // 🚪 Logout global (redirige al Home público)
  // ============================================================
  const logout = useCallback(() => {
    clearToken();
    clearUser();
    setUser(null);
    setToken(null);
    toast("Sesión cerrada correctamente", { icon: "👋" });

    // ✅ Ahora te devuelve a la página principal pública (Home.jsx)
    navigate("/");
  }, [navigate]);

  // ============================================================
  // 🧩 Verificar rol
  // ============================================================
  const hasRole = useCallback(
    (roles) => {
      if (!user?.roles) return false;
      const rolesArray = Array.isArray(roles) ? roles : [roles];
      return rolesArray.some((role) => user.roles.includes(role));
    },
    [user]
  );

  // ============================================================
  // 📦 Contexto expuesto
  // ============================================================
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      initialized,
      isAuthenticated: !!user && !!token,
      login,
      logout,
      hasRole,
    }),
    [user, token, loading, initialized, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================
// 🧠 Hook personalizado
// ============================================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
};