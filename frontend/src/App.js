// ========================================================================
// 🌐 INTRANET CENATE – App.js (2025, versión profesional)
// ========================================================================
// Estructura modular con:
//   - Contexto global de autenticación (AuthProvider)
//   - Rutas protegidas (ProtectedRoute)
//   - Roles definidos para /admin, /roles, /user
//   - Páginas públicas y de autenticación
//   - Diseño limpio, ordenado y preparado para producción Docker/Nginx
// ========================================================================

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// 🔐 Contexto global
import { AuthProvider } from "@/context/AuthContext";

// 🔒 Protección de rutas
import ProtectedRoute from "@/components/security/ProtectedRoute";

// 🧱 Layout principal
import Layout from "@/components/layout/Layout.jsx";

// 🔓 Páginas públicas
import Home from "@/pages/Home.jsx";
import AccountRequest from "@/pages/AccountRequest.jsx";
import Unauthorized from "@/pages/Unauthorized.jsx";
import NotFound from "@/pages/NotFound.jsx";

// 🔐 Páginas de autenticación (/pages/auth)
import Login from "@/pages/auth/Login.jsx";
import Register from "@/pages/auth/Register.jsx";
import ForgotPassword from "@/pages/auth/ForgotPassword.jsx";

// 🔐 Páginas generales protegidas
import PacientesPage from "@/pages/PacientesPage.jsx";
import TransferenciaExamenesPage from "@/pages/TransferenciaExamenesPage.jsx";

// 👑 Administración
import AdminDashboard from "@/pages/admin/AdminDashboard.jsx";
import AdminUsersManagement from "@/pages/admin/AdminUsersManagement.jsx";
import RolesManagement from "@/pages/admin/RolesManagement.jsx";
import SystemLogs from "@/pages/admin/SystemLogs.jsx";
import UserManagement from "@/pages/admin/UserManagement.jsx";
import AdminAccountRequests from "@/pages/admin/AdminAccountRequests.jsx";
import PermisosManagement from "@/pages/admin/PermisosManagement.jsx";
import AdminRecoveries from "@/pages/admin/AdminRecoveries.jsx";
import AdminPersonalPanel from "@/pages/admin/AdminPersonalPanel.jsx";

// ⚙️ Tablas administrativas
import ProfesionesTable from "@/pages/admin/tables/ProfesionesTable.jsx";
import FirmasDigitalesTable from "@/pages/admin/tables/FirmasDigitalesTable.jsx";
import OrdenesCompraTable from "@/pages/admin/tables/OrdenesCompraTable.jsx";
import PersonalTable from "@/pages/admin/tables/PersonalTable.jsx";
import RegimenesLaboralesTable from "@/pages/admin/tables/RegimenesLaboralesTable.jsx";
import TiposDocumentoTable from "@/pages/admin/tables/TiposDocumentoTable.jsx";
import AreasTable from "@/pages/admin/tables/AreasTable.jsx";

// 🩺 Roles funcionales
import DashboardMedico from "@/pages/roles/medico/DashboardMedico.jsx";
import DashboardCoordinador from "@/pages/roles/coordinador/DashboardCoordinador.jsx";
import DashboardExterno from "@/pages/roles/externo/DashboardExterno.jsx";
import DashboardCitas from "@/pages/roles/citas/DashboardCitas.jsx";
import LineamientosIpress from "@/pages/roles/lineamientos/LineamientosIpress.jsx";

// 👤 Panel de usuario
import UserDashboard from "@/pages/user/UserDashboard.jsx";

// ⚙️ Constantes de roles
import { ROLES } from "@/constants/auth.js";

// ========================================================================
// 🚀 Aplicación principal
// ========================================================================
export default function App() {
  return (
    <Router>
      <AuthProvider>
        {/* ======================================================
        🔔 Toaster global - Estilo institucional CENATE
        ====================================================== */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "rgba(15, 32, 70, 0.9)",
              color: "#f1f5f9",
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
              backdropFilter: "blur(10px)",
              padding: "14px 18px",
              boxShadow: "0 4px 25px rgba(0,0,0,0.15)",
              fontSize: "0.9rem",
            },
            success: { iconTheme: { primary: "#00C897", secondary: "#fff" } },
            error: { iconTheme: { primary: "#FF4C4C", secondary: "#fff" } },
          }}
        />

        {/* ======================================================
        🧭 Definición de rutas principales
        ====================================================== */}
        <Routes>
          {/* ======================================================
          🔓 RUTAS PÚBLICAS
          ====================================================== */}
          <Route path="/" element={<Home />} />
          <Route path="/solicitud-cuenta" element={<AccountRequest />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Auth */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* 🔁 Redirecciones antiguas */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/registro" element={<Navigate to="/auth/register" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />

          {/* ======================================================
          🔐 SECCIÓN GENERAL PROTEGIDA CON LAYOUT
          ====================================================== */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/pacientes" element={<PacientesPage />} />
              <Route path="/transferencia-examenes" element={<TransferenciaExamenesPage />} />
            </Route>
          </Route>

          {/* ======================================================
          👑 ADMINISTRACIÓN
          ====================================================== */}
          <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN", "ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersManagement />} />
            <Route path="/admin/personal" element={<AdminPersonalPanel />} />
            <Route path="/admin/account-requests" element={<AdminAccountRequests />} />
            <Route path="/admin/permisos" element={<PermisosManagement />} />
            <Route path="/admin/roles" element={<RolesManagement />} />
            <Route path="/admin/logs" element={<SystemLogs />} />
            <Route path="/admin/recoveries" element={<AdminRecoveries />} />
            <Route path="/admin/user-management" element={<UserManagement />} />

            {/* Tablas */}
            <Route path="/admin/tablas/profesiones" element={<ProfesionesTable />} />
            <Route path="/admin/tablas/firmas" element={<FirmasDigitalesTable />} />
            <Route path="/admin/tablas/ordenes" element={<OrdenesCompraTable />} />
            <Route path="/admin/tablas/personal" element={<PersonalTable />} />
            <Route path="/admin/tablas/regimenes" element={<RegimenesLaboralesTable />} />
            <Route path="/admin/tablas/tipos-documento" element={<TiposDocumentoTable />} />
            <Route path="/admin/tablas/areas" element={<AreasTable />} />
          </Route>

          {/* ======================================================
          🩺 ROLES FUNCIONALES
          ====================================================== */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.MEDICO]} />}>
            <Route path="/medico/dashboard" element={<DashboardMedico />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.COORDINADOR_MEDICO]} />}>
            <Route path="/coordinador/dashboard" element={<DashboardCoordinador />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.EXTERNO]} />}>
            <Route path="/externo/dashboard" element={<DashboardExterno />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.CITAS]} />}>
            <Route path="/citas/dashboard" element={<DashboardCitas />} />
          </Route>

          {/* ======================================================
          📘 LINEAMIENTOS IPRESS
          ====================================================== */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.EXTERNO,
                  ROLES.MEDICO,
                  ROLES.COORDINADOR_MEDICO,
                  ROLES.COORD_LINEAMIENTOS_IPRESS,
                ]}
              />
            }
          >
            <Route path="/lineamientos" element={<LineamientosIpress />} />
          </Route>

          {/* ======================================================
          👤 PANEL DE USUARIO
          ====================================================== */}
          <Route element={<ProtectedRoute allowedRoles={["USER", "USUARIO"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
          </Route>

          {/* ======================================================
          🚫 404 - NO ENCONTRADA
          ====================================================== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}