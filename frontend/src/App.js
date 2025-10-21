// ========================================================================
// 🌐 App.js – Sistema MBAC CENATE (versión definitiva sin duplicaciones)
// ------------------------------------------------------------------------
// Flujo: Home → Login → Dashboard → Logout → Home.
// Incluye Home público, AppLayout único y rutas protegidas con Outlet.
// ========================================================================

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// 🌈 Contextos globales
import { AuthProvider } from "./context/AuthContext";   // ✅ Contexto de autenticación
import { ThemeProvider } from "./context/ThemeContext"; // ✅ Contexto de tema

// 🧱 Layout global y seguridad
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/security/ProtectedRoute";

// 🧩 Páginas públicas
import Home from "./pages/Home";
import Login from "./pages/Login";

// 🧩 Páginas internas protegidas
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UsersPage from "./pages/UsersPage";
import CrearUsuario from "./pages/CrearUsuario";
import PermisosPage from "./pages/admin/PermisosPage";
import Profile from "./pages/user/Profile";
import UserDashboard from "./pages/user/UserDashboard";

// ========================================================================
// 🧩 Layout protegido – aplica AppLayout solo una vez
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
      {/* 🌍 Página principal pública */}
      <Route path="/" element={<Home />} />

      {/* 🔐 Login */}
      <Route path="/login" element={<Login />} />

      {/* 🔒 Área protegida (con AppLayout único) */}
      <Route element={<ProtectedAppLayout />}>
        {/* Paneles principales */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Gestión de usuarios */}
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/users/create" element={<CrearUsuario />} />

        {/* Permisos MBAC */}
        <Route path="/admin/permisos" element={<PermisosPage />} />

        {/* Área de usuario */}
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
      </Route>

      {/* 🚦 Fallback para rutas inexistentes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ========================================================================
// 🚀 Aplicación principal
// ========================================================================
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {/* 🔔 Notificaciones globales */}
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

          {/* 🔗 Sistema de rutas */}
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}