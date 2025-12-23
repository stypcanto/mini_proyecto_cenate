// ========================================================================
// 🌐 App.js – Sistema MBAC CENATE (Versión unificada 2025 - REORGANIZADO)
// ------------------------------------------------------------------------
// Sistema completo de Login con RBAC (Role-Based Access Control)
// Flujo: Home → Login → Dashboard (según permisos) → Logout → Home
// Incluye: ProtectedRoute, AppLayout único y roles MBAC coherentes.
// ✅ ACTUALIZADO: UsersManagement está en user/
// ========================================================================

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// 🌈 Contextos globales
import { AuthProvider } from "./context/AuthContext";
import { PermisosProvider } from "./context/PermisosContext";

// 🧱 Layout y seguridad
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/security/ProtectedRoute";

// 🧩 Páginas públicas
import Home from "./pages/Home";
import Login from "./pages/Login";
import CrearCuenta from "./pages/CrearCuenta";
import CambiarContrasena from "./pages/CambiarContrasena";
import Unauthorized from "./pages/Unauthorized";

// 🧩 Dashboard principal MBAC
import AdminDashboard from "./pages/AdminDashboard";

// 🧩 Gestión de Usuarios (Ubicado en user/)
import UsersManagement from './pages/user/UsersManagement';
// import CrearUsuario from "./pages/CrearUsuario"; // Comentado - usar modal en UsersManagement

// 🧩 Permisos RBAC y Control MBAC
import PermisosPage from "./pages/admin/PermisosPage";
import MBACControl from "./pages/admin/MBACControl";
import GestionUsuariosPermisos from "./pages/admin/GestionUsuariosPermisos";
import LogsDelSistema from "./pages/admin/LogsDelSistema";
import AprobacionSolicitudes from "./pages/admin/AprobacionSolicitudes";
import DashboardMedicoCMS from "./pages/admin/DashboardMedicoCMS";
import ModulosManagement from "./pages/admin/ModulosManagement";
import PaginasManagement from "./pages/admin/PaginasManagement";
import DescripcionRBAC from "./pages/admin/DescripcionRBAC";

// 🧩 Perfil de Usuario
import UserDashboard from "./pages/user/UserDashboard"; // 🧭 Inicio personal
import Profile from "./pages/user/Profile";              // 🔐 Mi cuenta
import UserDetail from "./pages/user/UserDetail";        // 👤 Ficha institucional
import UserSecurity from "./pages/user/UserSecurity";

// 🧩 Módulos por Rol - Médico
import DashboardMedico from "./pages/roles/medico/DashboardMedico";
import ModuloPacientes from "./pages/roles/medico/ModuloPacientes";
import ModuloCitas from "./pages/roles/medico/ModuloCitas";
import ModuloIndicadores from "./pages/roles/medico/ModuloIndicadores";

// 🧩 Módulos por Rol - Coordinador
import DashboardCoordinador from "./pages/roles/coordinador/DashboardCoordinador";
import ModuloAgenda from "./pages/roles/coordinador/ModuloAgenda";
import AsignarGestorMedico from "./pages/roles/coordinador/AsignarGestorMedico";
import SistemaCoordinacionMedica from "./pages/roles/coordinador/SistemaCoordinacionMedica";
import GestionPeriodosSolicitud from "./pages/roles/coordinador/GestionPeriodosSolicitud";

// 🧩 Módulos por Rol - Externo
import DashboardExterno from "./pages/roles/externo/DashboardExterno";
import ModuloReportes from "./pages/roles/externo/ModuloReportes";
import FormularioDiagnostico from "./pages/roles/externo/FormularioDiagnostico";
import FormularioSolicitudTurnos from "./pages/roles/externo/FormularioSolicitudTurnos";

// 🗺️ Módulos - Gestión Territorial
import DiagnosticoIpress from "./pages/roles/gestionterritorial/DiagnosticoIpress";

// 🌐 Módulo de Red - Coordinadores de Red
import RedDashboard from "./pages/red/RedDashboard";

// 📊 Módulo Programación CENATE
import ProgramacionCenateDashboard from "./pages/programacion/ProgramacionCenateDashboard";
import ProgramacionCenateDetalle from "./pages/programacion/ProgramacionCenateDetalle";

// 🧩 Módulos - Citas
import DashboardCitas from "./pages/roles/citas/DashboardCitas";
import GestionPacientes from "./pages/roles/citas/GestionPacientes";
import GestionAsegurado from "./pages/roles/citas/GestionAsegurado";

// 🧩 Módulos - Lineamientos
import LineamientosIpress from "./pages/roles/lineamientos/LineamientosIpress";

// 🏥 Módulo IPRESS
import ListadoIpress from "./pages/ipress/ListadoIpress";

// 👥 Módulo de Asegurados
import BuscarAsegurado from "./pages/asegurados/BuscarAsegurado";
import DashboardAsegurados from './pages/asegurados/DashboardAsegurados';

// 🤖 Módulo ChatBot de Citas
import ChatbotCita from "./pages/chatbot/ChatbotCita";
import ChatbotBusqueda from "./pages/chatbot/ChatbotBusqueda";

// TEST
import TestUsuarios from "./pages/TestUsuarios";


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
      <Route path="/crear-cuenta" element={<CrearCuenta />} />
      <Route path="/cambiar-contrasena" element={<CambiarContrasena />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 🔒 Área protegida con AppLayout único */}
      <Route element={<ProtectedAppLayout />}>

        {/* 🧭 Dashboard Administrativo MBAC */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredPath="/admin/dashboard" requiredAction="ver">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 👥 Gestión de usuarios (ACTUALIZADO) */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredPath="/admin/users" requiredAction="ver">
              <UsersManagement />
            </ProtectedRoute>
          }
        />

        {/* 👥 Página temporal, luego borrar */}
        <Route path="/test-usuarios" element={<TestUsuarios />} />

        {/* Ruta comentada - CrearUsuario no existe, usar modal en UsersManagement
        <Route
          path="/admin/users/create"
          element={
            <ProtectedRoute requiredPath="/admin/users" requiredAction="crear">
              <CrearUsuario />
            </ProtectedRoute>
          }
        />
        */}

        {/* 🔐 Permisos RBAC */}
        <Route
          path="/admin/permisos"
          element={
            <ProtectedRoute requiredPath="/admin/permisos" requiredAction="ver">
              <PermisosPage />
            </ProtectedRoute>
          }
        />

        {/* ⚙️ Panel MBAC - Solo SUPERADMIN */}
        <Route
          path="/admin/mbac"
          element={
            <ProtectedRoute requiredPath="/admin/mbac" requiredAction="ver" requiredRoles={["SUPERADMIN"]}>
              <MBACControl />
            </ProtectedRoute>
          }
        />

        {/* 🛡️ Gestión de Usuarios y Permisos (SUPERADMIN) */}
        <Route
          path="/admin/usuarios-permisos"
          element={
            <ProtectedRoute requiredPath="/admin/usuarios-permisos" requiredAction="ver">
              <GestionUsuariosPermisos />
            </ProtectedRoute>
          }
        />



        {/* 📊 Logs del Sistema */}
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute requiredPath="/admin/logs" requiredAction="ver">
              <LogsDelSistema />
            </ProtectedRoute>
          }
        />

        {/* 🎴 CMS Dashboard Médico */}
        <Route
          path="/admin/dashboard-medico/cms"
          element={
            <ProtectedRoute requiredPath="/admin/dashboard-medico/cms" requiredAction="ver">
              <DashboardMedicoCMS />
            </ProtectedRoute>
          }
        />



{/* 📋 Aprobación de Solicitudes */}
        <Route
          path="/admin/solicitudes"
          element={
            <ProtectedRoute requiredPath="/admin/solicitudes" requiredAction="ver">
              <AprobacionSolicitudes />
            </ProtectedRoute>
          }
        />

        {/* 📖 Descripción RBAC */}
        <Route
          path="/admin/gestion-modulos/descripcion"
          element={
            <ProtectedRoute requiredPath="/admin/gestion-modulos/descripcion" requiredAction="ver">
              <DescripcionRBAC />
            </ProtectedRoute>
          }
        />

        {/* 📦 Gestión de Módulos */}
        <Route
          path="/admin/modulos"
          element={
            <ProtectedRoute requiredPath="/admin/modulos" requiredAction="ver">
              <ModulosManagement />
            </ProtectedRoute>
          }
        />

        {/* 📄 Gestión de Páginas */}
        <Route
          path="/admin/paginas"
          element={
            <ProtectedRoute requiredPath="/admin/paginas" requiredAction="ver">
              <PaginasManagement />
            </ProtectedRoute>
          }
        />

        {/* 👤 Área de usuario */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute requiredPath="/user/dashboard" requiredAction="ver">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/profile"
          element={
            <ProtectedRoute requiredPath="/user/profile" requiredAction="ver">
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/detail/:id"
          element={
            <ProtectedRoute requiredPath="/user/detail" requiredAction="ver">
              <UserDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/security"
          element={
            <ProtectedRoute requiredPath="/user/security" requiredAction="ver">
              <UserSecurity />
            </ProtectedRoute>
          }
        />

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
        <Route
          path="/roles/coordinador/asignacion"
          element={
            <ProtectedRoute requiredPath="/roles/coordinador/asignacion" requiredAction="ver">
              <AsignarGestorMedico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/coordinador/sistema-coordinacion"
          element={
            <ProtectedRoute
              requiredPath="/roles/coordinador/sistema-coordinacion"
              requiredAction="ver"
            >
              <SistemaCoordinacionMedica />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/coordinador/gestion-periodos"
          element={
            <ProtectedRoute
              requiredPath="/roles/coordinador/gestion-periodos"
              requiredAction="ver"
            >
              <GestionPeriodosSolicitud />
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
        <Route
          path="/roles/externo/formulario-diagnostico"
          element={
            <ProtectedRoute requiredPath="/roles/externo/formulario-diagnostico" requiredAction="ver">
              <FormularioDiagnostico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/externo/solicitud-turnos"
          element={
            <ProtectedRoute requiredPath="/roles/externo/solicitud-turnos" requiredAction="ver">
              <FormularioSolicitudTurnos />
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

        {/* 👥 Gestión de Pacientes - Telemedicina */}
        <Route
          path="/citas/gestion-pacientes"
          element={
            <ProtectedRoute requiredPath="/citas/gestion-pacientes" requiredAction="ver">
              <GestionPacientes />
            </ProtectedRoute>
          }
        />

        {/* 👥 Gestión del Asegurado - Vinculado a tabla asegurados */}
        <Route
          path="/citas/gestion-asegurado"
          element={
            <ProtectedRoute requiredPath="/citas/gestion-asegurado" requiredAction="ver">
              <GestionAsegurado />
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

        {/* 🏥 Módulo IPRESS */}
        <Route
          path="/ipress/listado"
          element={
            <ProtectedRoute requiredPath="/ipress/listado" requiredAction="ver">
              <ListadoIpress />
            </ProtectedRoute>
          }
        />

        {/* 👥 Módulo de Asegurados */}
        <Route path="/asegurados/buscar" element={<BuscarAsegurado />} />
        <Route path="/asegurados/dashboard" element={<DashboardAsegurados />} />

        {/* 🤖 Módulo ChatBot de Citas */}
        <Route
          path="/chatbot/cita"
          element={
            <ProtectedRoute requiredPath="/chatbot/cita" requiredAction="ver">
              <ChatbotCita />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot/busqueda"
          element={
            <ProtectedRoute requiredPath="/chatbot/busqueda" requiredAction="ver">
              <ChatbotBusqueda />
            </ProtectedRoute>
          }
        />

        {/* 🗺️ Gestión Territorial */}
        <Route
          path="/roles/gestionterritorial/diagnosticoipress"
          element={
            <ProtectedRoute requiredPath="/roles/gestionterritorial/diagnosticoipress" requiredAction="ver">
              <DiagnosticoIpress />
            </ProtectedRoute>
          }
        />

        {/* 🌐 Módulo de Red - Coordinadores de Red */}
        <Route
          path="/red/dashboard"
          element={
            <ProtectedRoute requiredPath="/red/dashboard" requiredAction="ver">
              <RedDashboard />
            </ProtectedRoute>
          }
        />

        {/* 📊 Módulo Programación CENATE */}
        <Route
          path="/programacion/dashboard"
          element={
            <ProtectedRoute requiredPath="/programacion/dashboard" requiredAction="ver">
              <ProgramacionCenateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/programacion/detalle/:idPeriodo"
          element={
            <ProtectedRoute requiredPath="/programacion/detalle" requiredAction="ver">
              <ProgramacionCenateDetalle />
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
      <AuthProvider>
        {/* 🛡️ Proveedor de permisos MBAC */}
        <PermisosProvider>
          {/* 🔔 Notificaciones globales (estilo Apple / MBAC UI) */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1e293b",
                color: "white",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "white" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
            }}
          />

          {/* 🚏 Sistema de rutas MBAC */}
          <AppRoutes />
        </PermisosProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}