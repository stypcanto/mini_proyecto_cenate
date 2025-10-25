// ========================================================================
// 🌐 App.js – Sistema RBAC CENATE (Restaurado 2025)
// ------------------------------------------------------------------------
// Sistema completo de Login con RBAC (Role-Based Access Control)
// Flujo: Home → Login → Dashboard (según permisos) → Logout → Home
// ========================================================================

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// 🌈 Contextos globales
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// 🧱 Layout y seguridad
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/security/ProtectedRoute";

// 🧩 Páginas públicas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

// 🧩 Páginas de Dashboard
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

// 🧩 Gestión de Usuarios
import UsersPage from "./pages/UsersPage";
import CrearUsuario from "./pages/CrearUsuario";

// 🧩 Permisos RBAC
import PermisosPage from "./pages/admin/PermisosPage";
import MBACControl from "./pages/admin/MBACControl";

// 🧩 Perfil de Usuario
import Profile from "./pages/user/Profile";
import UserDashboard from "./pages/user/UserDashboard";

// 🧩 Módulos por Rol - Médico
import DashboardMedico from "./pages/roles/medico/DashboardMedico";
import ModuloPacientes from "./pages/roles/medico/ModuloPacientes";
import ModuloCitas from "./pages/roles/medico/ModuloCitas";
import ModuloIndicadores from "./pages/roles/medico/ModuloIndicadores";

// 🧩 Módulos por Rol - Coordinador
import DashboardCoordinador from "./pages/roles/coordinador/DashboardCoordinador";
import ModuloAgenda from "./pages/roles/coordinador/ModuloAgenda";

// 🧩 Módulos por Rol - Externo
import DashboardExterno from "./pages/roles/externo/DashboardExterno";
import ModuloReportes from "./pages/roles/externo/ModuloReportes";

// 🧩 Módulos - Citas
import DashboardCitas from "./pages/roles/citas/DashboardCitas";

// 🧩 Módulos - Lineamientos
import LineamientosIpress from "./pages/roles/lineamientos/LineamientosIpress";

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
      {/* 🌍 Páginas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 🔒 Área protegida con AppLayout único */}
      <Route element={<ProtectedAppLayout />}>
        {/* Dashboard principal */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Panel de administración (solo para SUPERADMIN/ADMIN - sin MBAC) */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* 👥 Gestión de usuarios */}
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredPath="/admin/users" requiredAction="ver">
              <UsersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users/create" 
          element={
            <ProtectedRoute requiredPath="/admin/users" requiredAction="crear">
              <CrearUsuario />
            </ProtectedRoute>
          } 
        />

        {/* 🔐 Permisos RBAC */}
        <Route 
          path="/admin/permisos" 
          element={
            <ProtectedRoute requiredPath="/admin/permisos" requiredAction="ver">
              <PermisosPage />
            </ProtectedRoute>
          } 
        />
        
        {/* 🔒 Panel MBAC */}
        <Route path="/admin/mbac" element={<MBACControl />} />

        {/* 👤 Perfil de usuario */}
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />

        {/* 👨‍⚕️ Módulo Médico */}
        <Route 
          path="/roles/medico/dashboard" 
          element={
            <ProtectedRoute requiredPath="/roles/medico/dashboard" requiredAction="ver">
              <DashboardMedico />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roles/medico/pacientes" 
          element={
            <ProtectedRoute requiredPath="/roles/medico/pacientes" requiredAction="ver">
              <ModuloPacientes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roles/medico/citas" 
          element={
            <ProtectedRoute requiredPath="/roles/medico/citas" requiredAction="ver">
              <ModuloCitas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roles/medico/indicadores" 
          element={
            <ProtectedRoute requiredPath="/roles/medico/indicadores" requiredAction="ver">
              <ModuloIndicadores />
            </ProtectedRoute>
          } 
        />

        {/* 📊 Módulo Coordinador */}
        <Route 
          path="/roles/coordinador/dashboard" 
          element={
            <ProtectedRoute requiredPath="/roles/coordinador/dashboard" requiredAction="ver">
              <DashboardCoordinador />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roles/coordinador/agenda" 
          element={
            <ProtectedRoute requiredPath="/roles/coordinador/agenda" requiredAction="ver">
              <ModuloAgenda />
            </ProtectedRoute>
          } 
        />

        {/* 🌐 Módulo Externo */}
        <Route 
          path="/roles/externo/dashboard" 
          element={
            <ProtectedRoute requiredPath="/roles/externo/dashboard" requiredAction="ver">
              <DashboardExterno />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roles/externo/reportes" 
          element={
            <ProtectedRoute requiredPath="/roles/externo/reportes" requiredAction="ver">
              <ModuloReportes />
            </ProtectedRoute>
          } 
        />

        {/* 📅 Módulo Citas */}
        <Route 
          path="/citas/dashboard" 
          element={
            <ProtectedRoute requiredPath="/citas/dashboard" requiredAction="ver">
              <DashboardCitas />
            </ProtectedRoute>
          } 
        />

        {/* 📋 Lineamientos */}
        <Route 
          path="/lineamientos/ipress" 
          element={
            <ProtectedRoute requiredPath="/lineamientos/ipress" requiredAction="ver">
              <LineamientosIpress />
            </ProtectedRoute>
          } 
        />
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
          {/* 🔔 Notificaciones globales (estilo Apple) */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "var(--toast-bg, #1e293b)",
                color: "var(--toast-color, white)",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "white" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "white" },
              },
            }}
          />

          {/* 🚏 Sistema de rutas */}
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
