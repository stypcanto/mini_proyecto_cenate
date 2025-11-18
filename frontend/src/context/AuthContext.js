import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "../lib/apiClient";
import { saveToken, getToken, clearToken, saveUser, getUser, clearUser, decodeJwt } from "../constants/auth";

// Normaliza roles
const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  return roles
    .map(r => typeof r === "string" ? r.replace("ROLE_", "").toUpperCase() : r?.authority ? r.authority.replace("ROLE_", "").toUpperCase() : String(r || "").replace("ROLE_", "").toUpperCase())
    .filter(Boolean);
};

// Contexto
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Restaurar sesión
  useEffect(() => {
    if (token && !user) {
      try {
        const payload = decodeJwt(token);
        if (payload) {
          console.log("🔍 JWT Payload completo:", payload);

          // Buscar el ID numérico en diferentes campos
          const userId = payload.id_user || payload.userId || payload.id || payload.user_id;
          console.log("🆔 User ID extraído:", userId, "Tipo:", typeof userId);

          // Validar que el userId sea un número válido
          if (!userId || isNaN(Number(userId))) {
            console.error("❌ Error: No se pudo extraer un ID numérico válido del JWT");
            throw new Error("ID de usuario inválido en el token");
          }

          const restoredUser = {
            id: Number(userId),
            username: payload.username || payload.preferred_username || payload.sub,
            roles: normalizeRoles(payload.roles || payload.authorities || []),
            permisos: payload.permisos || [],
            nombreCompleto: payload.nombre_completo || payload.name || payload.username || payload.sub || "",
            requiereCambioPassword: payload.requiereCambioPassword || false,
            token
          };

          console.log("Usuario restaurado:", restoredUser);
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

  // Login
  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const data = await apiClient.post("/auth/login", { username, password });
      console.log("📦 Respuesta del backend en login:", data);
      if (!data?.token) throw new Error("No se recibió token del servidor");

      const jwt = data.token;
      const payload = decodeJwt(jwt);
      console.log("🔐 JWT Payload en login:", payload);

      const userId = data.id_user || data.userId || data.id || payload.id_user || payload.userId || payload.id || payload.user_id;
      console.log("🆔 User ID en login:", userId, "Tipo:", typeof userId);

      // Validar que el userId sea un número válido
      if (!userId || isNaN(Number(userId))) {
        console.error("❌ Error: No se pudo extraer un ID numérico válido del login");
        console.error("Respuesta completa del backend:", data);
        console.error("Payload del JWT:", payload);
        throw new Error("El backend no devolvió un ID de usuario válido");
      }

      const userData = {
        id: Number(userId),
      username: payload.username || data.username || username,
      roles: normalizeRoles(payload.roles || data.roles || []),
      permisos: payload.permisos || data.permisos || [],
      nombreCompleto: data.nombreCompleto || data.nombre_completo || payload.nombre_completo,
      requiereCambioPassword: data.requiereCambioPassword || false,
      token: jwt
    };

      saveToken(jwt);
      saveUser(userData);
      setUser(userData);
      setToken(jwt);

      toast.success(`Bienvenido, ${userData.nombreCompleto || userData.username}`);
      return { ok: true, user: userData, roles: userData.roles };
    } catch (error) {
      console.error("Error en login:", error);
      toast.error(error.message || "Error al iniciar sesión");
      return { ok: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    clearToken();
    clearUser();
    setUser(null);
    setToken(null);
    toast("Sesión cerrada correctamente", { icon: "👋" });
    navigate("/", { replace: true });
  }, [navigate]);

  const hasRole = useCallback((roles) => {
    if (!user?.roles) return false;
    const list = Array.isArray(roles) ? roles : [roles];
    const normalized = list.map(r => String(r).replace("ROLE_", "").toUpperCase());
    return normalized.some(role => user.roles.includes(role));
  }, [user]);

  const value = useMemo(() => ({
    user, token, loading, initialized,
    isAuthenticated: !!user && !!token,
    login, logout, hasRole
  }), [user, token, loading, initialized, login, logout, hasRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
};