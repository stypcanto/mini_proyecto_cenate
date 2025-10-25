// ========================================================================
// 🛣️ App.js - Sistema MBAC CENATE (versión estable 2025 FINAL)
// ------------------------------------------------------------------------
// Configuración de rutas protegidas con MBAC, JWT y roles jerárquicos.
// Incluye redirección automática post-login mediante RoleRedirector.jsx.
// ========================================================================

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/security/ProtectedRoute";
import AppLayout from "./components/AppLayout";

// 🔀 Redirección automática según rol
import RoleRedirector from "./utils/RoleRedirector";

// ========== PÁGINAS PRINCIPALES ==========
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UsersPage from "./pages/UsersPage";
import CrearUsuario from "./pages/CrearUsuario";
import UserDashboard from "./pages/user/UserDashboard";
import Profile from "./pages/user/Profile";
import Unauthorized from "./pages/Unauthorized";

// ========== ROLES ==========
import DashboardMedico from "./pages/roles/medico/DashboardMedico";
import ModuloCitas from "./pages/roles/medico/ModuloCitas";
import ModuloPacientes from "./pages/roles/medico/ModuloPacientes";
import ModuloIndicadores from "./pages/roles/medico/ModuloIndicadores";

import DashboardCoordinador from "./pages/roles/coordinador/DashboardCoordinador";
import ModuloAgenda from "./pages/roles/coordinador/ModuloAgenda";

import DashboardExterno from "./pages/roles/externo/DashboardExterno";
import ModuloReportes from "./pages/roles/externo/ModuloReportes";

import DashboardCitas from "./pages/roles/citas/DashboardCitas";
import LineamientosIpress from "./pages/roles/lineamientos/LineamientosIpress";

// ========== ADMIN MBAC ==========
import UsersManagement from "./pages/admin/UsersManagement";
import RolesManagement from "./pages/admin/RolesManagement";
import MBACControl from "./pages/admin/MBACControl";
import AuditLog from "./pages/admin/AuditLog";
import PermisosPage from "./pages/admin/PermisosPage";

// ========== CONTEXTO DE AUTENTICACIÓN ==========
import { useAuth } from "./context/AuthContext";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ===============================================================
          🧭 RUTA CENTRAL DE REDIRECCIÓN AUTOMÁTICA SEGÚN ROL
          =============================================================== */}
      <Route
        path="/redirect"
        element={
          <ProtectedRoute>
            <RoleRedirector roles={user?.roles || []} />
          </ProtectedRoute>
        }
      />

      {/* ========== RUTAS PÚBLICAS ========== */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ========== DASHBOARD GENERAL ========== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout title="Dashboard General">
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== PERFIL Y USUARIO ========== */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout title="Mi Dashboard">
              <UserDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/profile"
        element={
          <ProtectedRoute>
            <AppLayout title="Mi Perfil">
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== ADMINISTRACIÓN GENERAL ========== */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout title="Dashboard Administrativo">
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AppLayout title="Usuarios">
              <UsersPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/crear-usuario"
        element={
          <ProtectedRoute>
            <AppLayout title="Crear Usuario">
              <CrearUsuario />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== MÓDULOS MBAC (roles/permiso/auditoría) ========== */}
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute>
            <AppLayout title="Gestión de Usuarios">
              <UsersManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute>
            <AppLayout title="Gestión de Roles y Permisos">
              <RolesManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/permisos"
        element={
          <ProtectedRoute>
            <AppLayout title="Control MBAC">
              <MBACControl />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/auditoria"
        element={
          <ProtectedRoute>
            <AppLayout title="Auditoría del Sistema">
              <AuditLog />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/configuracion"
        element={
          <ProtectedRoute>
            <AppLayout title="Configuración de Permisos">
              <PermisosPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== ROLES MÉDICO ========== */}
      <Route
        path="/roles/medico/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout title="Dashboard Médico">
              <DashboardMedico />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles/medico/citas"
        element={
          <ProtectedRoute>
            <AppLayout title="Módulo de Citas">
              <ModuloCitas />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles/medico/pacientes"
        element={
          <ProtectedRoute>
            <AppLayout title="Pacientes">
              <ModuloPacientes />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles/medico/indicadores"
        element={
          <ProtectedRoute>
            <AppLayout title="Indicadores">
              <ModuloIndicadores />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== COORDINADOR ========== */}
      <Route
        path="/roles/coordinador/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout title="Dashboard Coordinador">
              <DashboardCoordinador />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles/coordinador/agenda"
        element={
          <ProtectedRoute>
            <AppLayout title="Agenda">
              <ModuloAgenda />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== EXTERNO ========== */}
      <Route
        path="/roles/externo/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout title="Dashboard Externo">
              <DashboardExterno />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles/externo/reportes"
        element={
          <ProtectedRoute>
            <AppLayout title="Reportes">
              <ModuloReportes />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== CITAS ========== */}
      <Route
        path="/roles/citas/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout title="Dashboard de Citas">
              <DashboardCitas />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== LINEAMIENTOS ========== */}
      <Route
        path="/roles/lineamientos/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout title="Lineamientos IPRESS">
              <LineamientosIpress />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles/lineamientos/registro"
        element={
          <ProtectedRoute>
            <AppLayout title="Registro de Lineamientos">
              <LineamientosIpress />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== REDIRECCIÓN POR DEFECTO ========== */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;