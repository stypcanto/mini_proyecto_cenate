// ========================================================================
// 🌐 App.js – Sistema MBAC CENATE (frontend)
// ------------------------------------------------------------------------
// Integra autenticación, protección de rutas y control de permisos
// a nivel de módulos y acciones.
// ========================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// 🧱 Layout general
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/security/ProtectedRoute';

// 🧩 Páginas principales
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// 🧩 Páginas del administrador
import AdminDashboard from './pages/AdminDashboard';
import UsersPage from './pages/UsersPage';
import CrearUsuario from './pages/CrearUsuario';
import PermisosPage from './pages/admin/PermisosPage';

// ========================================================================
// 🔒 Rutas protegidas MBAC
// ========================================================================
function AppRoutes() {
  return (
    <Routes>
      {/* 🔓 Público */}
      <Route path="/login" element={<Login />} />

      {/* 🧭 Dashboard general */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredPath="/dashboard">
            <AppLayout title="Panel Principal" currentPath="/dashboard">
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* 🧱 Panel de administrador */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredPath="/admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* 👥 Gestión de usuarios */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredPath="/admin/users">
            <AppLayout title="Gestión de Usuarios" currentPath="/admin/users">
              <UsersPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ➕ Crear usuario */}
      <Route
        path="/admin/users/create"
        element={
          <ProtectedRoute requiredPath="/admin/users/create">
            <AppLayout title="Registrar Nuevo Usuario" currentPath="/admin/users/create">
              <CrearUsuario />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔐 Gestión de permisos MBAC */}
      <Route
        path="/admin/permisos"
        element={
          <ProtectedRoute requiredPath="/admin/permisos">
            <PermisosPage />
          </ProtectedRoute>
        }
      />

      {/* 🧭 Rutas base y fallback */}
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
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                borderRadius: '12px',
                padding: '16px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />

          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
