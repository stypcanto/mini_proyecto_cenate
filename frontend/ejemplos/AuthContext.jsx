import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario y token del localStorage al iniciar
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al iniciar sesión');
      }

      const data = await response.json();

      // Guardar en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        userId: data.userId,
        username: data.username,
        roles: data.roles,
        permisos: data.permisos
      }));

      // Actualizar estado
      setToken(data.token);
      setUser({
        userId: data.userId,
        username: data.username,
        roles: data.roles,
        permisos: data.permisos
      });

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasPermission = (permission) => {
    return user?.permisos?.includes(permission) || false;
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => user?.roles?.includes(role)) || false;
  };

  const hasAllRoles = (roles) => {
    return roles.every(role => user?.roles?.includes(role)) || false;
  };

  const isAuthenticated = () => {
    return token !== null && user !== null;
  };

  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Función para hacer requests autenticados
  const authenticatedFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Si el token expiró, hacer logout
    if (response.status === 401) {
      logout();
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    return response;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAuthenticated,
    getAuthHeader,
    authenticatedFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
