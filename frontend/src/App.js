// ========================================================================
// 🌐 App.js – Sistema MBAC CENATE (versión definitiva sin duplicaciones)
// ------------------------------------------------------------------------
// Corrige render doble de AppLayout. Usa un layout global con Outlet.
// ========================================================================

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// 🧱 Layout global
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/security/ProtectedRoute";

// 🧩 Páginas públicas
import Login from "./pages/Login";

// 🧩 Páginas internas
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UsersPage from "./pages/UsersPage";
import CrearUsuario from "./pages/CrearUsuario";
import PermisosPage from "./pages/admin/PermisosPage";
import Profile from "./pages/user/Profile";
import UserDashboard from "./pages/user/UserDashboard";

// ========================================================================
// 🧩 Layout protegido global
// ========================================================================
function ProtectedAppLayout() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ProtectedRoute>
  );
}

// ========================================================================
// 🚏 Definición de rutas
// ========================================================================
function AppRoutes() {
  return (
    <Routes>
      {/* Público */}
      <Route path="/login" element={<Login />} />

      {/* Área protegida (usa AppLayout una sola vez) */}
      <Route element={<ProtectedAppLayout />}>
        {/* Paneles principales */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Usuarios */}
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/users/create" element={<CrearUsuario />} />

        {/* Permisos MBAC */}
        <Route path="/admin/permisos" element={<PermisosPage />} />

        {/* Páginas de usuario */}
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
      </Route>

      {/* Rutas base y fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// ========================================================================
// 🚀 App principal
// ========================================================================
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "var(--toast-bg)",
                color: "var(--toast-color)",
                borderRadius: "12px",
                padding: "16px",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />

          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}