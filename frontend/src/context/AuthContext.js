import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "../../lib/apiClient";
import { saveToken, getToken, clearToken, saveUser, getUser, clearUser, decodeJwt } from "../constants/auth";

// Normaliza roles
const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  return roles
    .map(r => typeof r === "string" ? r.replace("ROLE_", "").toUpperCase() : r?.authority ? r.authority.replace("ROLE_", "").toUpperCase() : String(r || "").replace("ROLE_", "").toUpperCase())
    .filter(Boolean);
};

// Verificar si el usuario tiene sesión invalidada (roles cambiados por admin)
const isSessionInvalidated = (userId) => {
  try {
    const invalidSessions = JSON.parse(localStorage.getItem('invalidatedSessions') || '[]');
    return invalidSessions.includes(Number(userId));
  } catch {
    return false;
  }
};

// Limpiar sesión invalidada después de re-login
const clearInvalidatedSession = (userId) => {
  try {
    const invalidSessions = JSON.parse(localStorage.getItem('invalidatedSessions') || '[]');
    const updated = invalidSessions.filter(id => id !== Number(userId));
    localStorage.setItem('invalidatedSessions', JSON.stringify(updated));
  } catch (e) {
    console.error('Error al limpiar sesión invalidada:', e);
  }
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

          // Verificar si la sesión fue invalidada por cambio de roles
          if (isSessionInvalidated(userId)) {
            console.log("⚠️ Sesión invalidada por cambio de roles. Forzando logout...");
            clearUser();
            clearToken();
            clearInvalidatedSession(userId);
            toast("Tus roles fueron modificados. Por favor, inicia sesión nuevamente.", { icon: "🔄", duration: 5000 });
            setInitialized(true);
            return;
          }

          const restoredUser = {
            id: Number(userId),
            username: payload.username || payload.preferred_username || payload.sub,
            roles: normalizeRoles(payload.roles || payload.authorities || []),
            permisos: payload.permisos || [],
            nombreCompleto: payload.nombre_completo || payload.name || payload.username || payload.sub || "",
            foto: payload.foto || null,  // 📷 Foto restaurada del JWT
            requiereCambioPassword: payload.requiereCambioPassword || false,
            especialidad: payload.especialidad || null,  // ✅ v1.77.0: Especialidad del médico
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

  // Verificar periódicamente si la sesión fue invalidada (cada 10 segundos)
  useEffect(() => {
    if (!user?.id) return;

    const checkInvalidation = () => {
      if (isSessionInvalidated(user.id)) {
        console.log("⚠️ Sesión invalidada detectada. Cerrando sesión...");
        clearUser();
        clearToken();
        clearInvalidatedSession(user.id);
        setUser(null);
        setToken(null);
        toast("Tus roles fueron modificados por un administrador. Por favor, inicia sesión nuevamente.", { icon: "🔄", duration: 6000 });
        navigate("/login", { replace: true });
      }
    };

    // Verificar cada 10 segundos
    const interval = setInterval(checkInvalidation, 10000);

    // También verificar al cambiar de pestaña/ventana
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInvalidation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, navigate]);

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
      foto: data.foto || payload.foto || null,  // 📷 URL de la foto del usuario
      requiereCambioPassword: data.requiereCambioPassword || false,
      especialidad: data.especialidad || payload.especialidad || null,  // ✅ v1.77.0: Especialidad del médico
      token: jwt
    };

      console.log("📷 Foto del usuario desde backend:", data.foto);
      console.log("👤 userData completo:", userData);

      saveToken(jwt);
      saveUser(userData);
      setUser(userData);
      setToken(jwt);

      // Limpiar cualquier marca de sesión invalidada después de login exitoso
      clearInvalidatedSession(userData.id);

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

  // Refrescar datos del usuario actual (para actualizar roles después de cambios)
  const refreshUser = useCallback(async () => {
    if (!user?.id || !token) return;

    try {
      console.log("🔄 Refrescando datos del usuario...");
      // Usar el endpoint /me que devuelve los roles actualizados
      const response = await apiClient.get(`/usuarios/me`, true);

      if (response) {
        const rolesActualizados = normalizeRoles(response.roles || []);
        console.log("📋 Roles actualizados desde backend:", rolesActualizados);

        const updatedUser = {
          ...user,
          roles: rolesActualizados,
          nombreCompleto: response.nombreCompleto || response.nombre_completo || user.nombreCompleto,
        };

        setUser(updatedUser);
        saveUser(updatedUser);
        console.log("✅ Usuario actualizado:", updatedUser);
      }
    } catch (error) {
      console.error("❌ Error al refrescar usuario:", error);
    }
  }, [user, token]);

  // Actualizar usuario manualmente (para uso desde otros componentes)
  const updateUser = useCallback((newUserData) => {
    if (!newUserData) return;

    const updatedUser = {
      ...user,
      ...newUserData,
      roles: newUserData.roles ? normalizeRoles(newUserData.roles) : user?.roles,
    };

    setUser(updatedUser);
    saveUser(updatedUser);
    console.log("✅ Usuario actualizado manualmente:", updatedUser);
  }, [user]);

  const hasRole = useCallback((roles) => {
    if (!user?.roles) return false;
    const list = Array.isArray(roles) ? roles : [roles];
    const normalized = list.map(r => String(r).replace("ROLE_", "").toUpperCase());
    return normalized.some(role => user.roles.includes(role));
  }, [user]);

  const value = useMemo(() => ({
    user, token, loading, initialized,
    isAuthenticated: !!user && !!token,
    login, logout, hasRole, refreshUser, updateUser
  }), [user, token, loading, initialized, login, logout, hasRole, refreshUser, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
};