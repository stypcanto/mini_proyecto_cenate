// ========================================================================
// 🛣️ App.js - Sistema MBAC CENATE (ACTUALIZADO)
// ------------------------------------------------------------------------
// Configuración de rutas con sistema MBAC completo
// ========================================================================

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/security/ProtectedRoute";
import AppLayout from "./components/AppLayout";

// ========== PÁGINAS EXISTENTES ==========
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UsersPage from "./pages/UsersPage";
import CrearUsuario from "./pages/CrearUsuario";
import UserDashboard from "./pages/user/UserDashboard";
import Profile from "./pages/user/Profile";
import Unauthorized from "./pages/Unauthorized";

// Roles existentes
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

// ========== NUEVAS PÁGINAS MBAC ==========
import UsersManagement from "./pages/admin/UsersManagement";
import RolesManagement from "./pages/admin/RolesManagement";
import MBACControl from "./pages/admin/MBACControl";
import AuditLog from "./pages/admin/AuditLog";
import PermisosPage from "./pages/admin/PermisosPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* ========== RUTA PÚBLICA ========== */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ========== RUTAS PROTEGIDAS CON LAYOUT ========== */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Home />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout title="Dashboard">
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ========== RUTAS DE USUARIO ========== */}
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

            {/* ========== RUTAS DE ADMINISTRACIÓN ========== */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredPermissions={["ADMIN_ACCESS"]}>
                  <AppLayout title="Admin Dashboard">
                    <AdminDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredPermissions={["MANAGE_USERS"]}>
                  <AppLayout title="Usuarios">
                    <UsersPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/crear-usuario"
              element={
                <ProtectedRoute requiredPermissions={["MANAGE_USERS"]}>
                  <AppLayout title="Crear Usuario">
                    <CrearUsuario />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ========== NUEVAS RUTAS MBAC ========== */}
            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute requiredPermissions={["MANAGE_USERS"]}>
                  <AppLayout title="Gestión de Usuarios">
                    <UsersManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute requiredPermissions={["MANAGE_ROLES"]}>
                  <AppLayout title="Roles y Permisos">
                    <RolesManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/permisos"
              element={
                <ProtectedRoute requiredPermissions={["MANAGE_PERMISSIONS"]}>
                  <AppLayout title="Control MBAC">
                    <MBACControl />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/auditoria"
              element={
                <ProtectedRoute requiredPermissions={["VIEW_AUDIT"]}>
                  <AppLayout title="Auditoría">
                    <AuditLog />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/configuracion"
              element={
                <ProtectedRoute requiredPermissions={["SYSTEM_SETTINGS"]}>
                  <AppLayout title="Configuración">
                    <PermisosPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ========== RUTAS DE ROLES ESPECÍFICOS ========== */}
            {/* Médico */}
            <Route
              path="/medico/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout title="Dashboard Médico">
                    <DashboardMedico />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/medico/citas"
              element={
                <ProtectedRoute>
                  <AppLayout title="Citas">
                    <ModuloCitas />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/medico/pacientes"
              element={
                <ProtectedRoute>
                  <AppLayout title="Pacientes">
                    <ModuloPacientes />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/medico/indicadores"
              element={
                <ProtectedRoute>
                  <AppLayout title="Indicadores">
                    <ModuloIndicadores />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Coordinador */}
            <Route
              path="/coordinador/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout title="Dashboard Coordinador">
                    <DashboardCoordinador />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/coordinador/agenda"
              element={
                <ProtectedRoute>
                  <AppLayout title="Agenda">
                    <ModuloAgenda />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Externo */}
            <Route
              path="/externo/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout title="Dashboard Externo">
                    <DashboardExterno />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/externo/reportes"
              element={
                <ProtectedRoute>
                  <AppLayout title="Reportes">
                    <ModuloReportes />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Citas */}
            <Route
              path="/citas/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout title="Dashboard Citas">
                    <DashboardCitas />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Lineamientos */}
            <Route
              path="/lineamientos/ipress"
              element={
                <ProtectedRoute>
                  <AppLayout title="Lineamientos IPRESS">
                    <LineamientosIpress />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ========== REDIRECCIÓN POR DEFECTO ========== */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
