// ========================================================================
// 🔐 useAuth.js – Contexto global de autenticación (CENATE 2025)
// ------------------------------------------------------------------------
// Gestiona el estado del usuario autenticado (token, perfil, login/logout).
// Provee el contexto AuthContext para toda la app React (CRA).
// ========================================================================

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================================================================
  // 🔁 Cargar datos del usuario y token desde localStorage
  // ================================================================
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.warn("⚠️ Error al cargar datos de sesión:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ================================================================
  // 🔑 Iniciar sesión
  // ================================================================
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  };

  // ================================================================
  // 🚪 Cerrar sesión
  // ================================================================
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ================================================================
  // 🔄 Actualizar información del usuario
  // ================================================================
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // ================================================================
  // 📦 Proveer contexto global
  // ================================================================
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ================================================================
// 🪄 Hook para consumir el contexto
// ================================================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export default useAuth;
