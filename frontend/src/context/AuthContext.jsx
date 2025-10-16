// ========================================================================
// 🌐 CONTEXTO GLOBAL DE AUTENTICACIÓN - AuthContext
// ========================================================================
// Permite acceder a user, roles, login, logout, etc. desde cualquier parte.
// Internamente usa useAuth() para mantener la lógica unificada.
// ========================================================================

import React, { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";

// Crear el contexto
const AuthContext = createContext(null);

// ------------------------------------------------------------------------
// 🧩 Proveedor del contexto
// ------------------------------------------------------------------------
export const AuthProvider = ({ children }) => {
  const auth = useAuth(); // reutiliza toda la lógica de sesión
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// ------------------------------------------------------------------------
// 🪄 Hook auxiliar para consumir el contexto
// ------------------------------------------------------------------------
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de un <AuthProvider>");
  }
  return context;
};