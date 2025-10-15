// ========================================================================
// 🌐 SISTEMA INTRANET CENATE - App.js (versión extendida con roles/lineamientos)
// ========================================================================

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// 🧱 Layout principal
import Layout from "./components/layout/Layout.jsx";

// 🔓 Páginas públicas
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import AccountRequest from "./pages/AccountRequest.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

// 🔐 Páginas protegidas
import PacientesPage from "./pages/PacientesPage.jsx";
import TransferenciaExamenesPage from "./pages/TransferenciaExamenesPage.jsx";

// 👑 Panel administrativo
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsersManagement from "./pages/admin/AdminUsersManagement.jsx";
import RolesManagement from "./pages/admin/RolesManagement.jsx";
import SystemLogs from "./pages/admin/SystemLogs.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import AdminAccountRequests from "./pages/admin/AdminAccountRequests.jsx";
import PermisosManagement from "./pages/admin/PermisosManagement.jsx";
import AdminRecoveries from "./pages/admin/AdminRecoveries.jsx";

// ⚙️ Nuevos módulos administrativos
import ProfesionesTable from "./pages/admin/tables/ProfesionesTable.jsx";
import FirmasDigitalesTable from "./pages/admin/tables/FirmasDigitalesTable.jsx";
import OrdenesCompraTable from "./pages/admin/tables/OrdenesCompraTable.jsx";

// 🩺 Roles especializados
import DashboardMedico from "./pages/roles/medico/DashboardMedico.jsx";
import DashboardCoordinador from "./pages/roles/coordinador/DashboardCoordinador.jsx";
import DashboardExterno from "./pages/roles/externo/DashboardExterno.jsx";
import DashboardCitas from "./pages/roles/citas/DashboardCitas.jsx";

// 📘 Módulo compartido - Lineamientos IPRESS
import LineamientosIpress from "./pages/roles/lineamientos/LineamientosIpress.jsx";

// 👤 Panel usuario general
import UserDashboard from "./pages/user/UserDashboard.jsx";

// ⚙️ Roles y permisos globales
import { ROLES } from "./constants/auth.js";

// ⚠️ Página 404
import NotFound from "./pages/NotFound.jsx";

/* ==============================================================
 🧩 Protección de rutas (roles + autenticación)
============================================================== */
const RequireAuth = ({ children, allowedRoles = [] }) => {
    const token = localStorage.getItem("token");

    if (!token) return <Navigate to="/login" replace />;

    if (allowedRoles.length > 0) {
        const storedRoles = JSON.parse(localStorage.getItem("roles") || "[]");
        const userRoles = storedRoles.map((r) => String(r).toUpperCase());
        const allowedUpper = allowedRoles.map((r) => String(r).toUpperCase());
        const isAllowed = userRoles.some((r) => allowedUpper.includes(r));

        if (!isAllowed) return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

/* ==============================================================
 🧭 Enrutamiento principal + Notificaciones globales
============================================================== */
function App() {
    return (
        <Router>
            {/* 🔔 Sistema global de notificaciones tipo macOS */}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        borderRadius: "14px",
                        background: "rgba(15, 32, 70, 0.92)",
                        color: "#f1f5f9",
                        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                        backdropFilter: "blur(10px)",
                        padding: "14px 18px",
                        boxShadow: "0 4px 25px rgba(0, 0, 0, 0.15)",
                        fontSize: "0.9rem",
                    },
                    success: { iconTheme: { primary: "#00C897", secondary: "#fff" } },
                    error: { iconTheme: { primary: "#FF4C4C", secondary: "#fff" } },
                }}
            />

            <Routes>
                {/* ======================================================
          🔓 PÁGINAS PÚBLICAS
        ====================================================== */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/solicitud-cuenta" element={<AccountRequest />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* ======================================================
          🔐 PÁGINAS PROTEGIDAS CON LAYOUT
        ====================================================== */}
                <Route element={<Layout />}>
                    <Route
                        path="/pacientes"
                        element={
                            <RequireAuth>
                                <PacientesPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/transferencia-examenes"
                        element={
                            <RequireAuth>
                                <TransferenciaExamenesPage />
                            </RequireAuth>
                        }
                    />
                </Route>

                {/* ======================================================
          👑 PANEL ADMINISTRATIVO
        ====================================================== */}
                <Route
                    path="/admin"
                    element={
                        <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                            <AdminDashboard />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/recoveries"
                    element={
                        <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                            <AdminRecoveries />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                            <AdminUsersManagement />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/roles"
                    element={
                        <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                            <RolesManagement />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/logs"
                    element={
                        <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                            <SystemLogs />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/account-requests"
                    element={
                        <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                            <AdminAccountRequests />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/user-management"
                    element={
                        <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                            <UserManagement />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/permisos"
                    element={
                        <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                            <PermisosManagement />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/profesiones"
                    element={
                        <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                            <ProfesionesTable />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/firmas"
                    element={
                        <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                            <FirmasDigitalesTable />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/ordenes"
                    element={
                        <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                            <OrdenesCompraTable />
                        </RequireAuth>
                    }
                />

                {/* ======================================================
          🩺 PANEL MÉDICO
        ====================================================== */}
                <Route
                    path="/medico"
                    element={
                        <RequireAuth allowedRoles={[ROLES.MEDICO]}>
                            <DashboardMedico />
                        </RequireAuth>
                    }
                />

                {/* ======================================================
          🗓️ PANEL DE CITAS
        ====================================================== */}
                <Route
                    path="/citas"
                    element={
                        <RequireAuth allowedRoles={[ROLES.CITAS]}>
                            <DashboardCitas />
                        </RequireAuth>
                    }
                />

                {/* ======================================================
          🩺 PANEL COORDINADOR MÉDICO
        ====================================================== */}
                <Route
                    path="/coordinador"
                    element={
                        <RequireAuth allowedRoles={[ROLES.COORDINADOR_MEDICO]}>
                            <DashboardCoordinador />
                        </RequireAuth>
                    }
                />

                {/* ======================================================
          🏢 PANEL EXTERNO
        ====================================================== */}
                <Route
                    path="/externo"
                    element={
                        <RequireAuth allowedRoles={[ROLES.EXTERNO]}>
                            <DashboardExterno />
                        </RequireAuth>
                    }
                />

                {/* ======================================================
          📘 MÓDULO COMPARTIDO: LINEAMIENTOS IPRESS
        ====================================================== */}
                <Route
                    path="/lineamientos"
                    element={
                        <RequireAuth
                            allowedRoles={[
                                ROLES.EXTERNO,
                                ROLES.MEDICO,
                                ROLES.COORDINADOR_MEDICO,
                                ROLES.COORD_LINEAMIENTOS_IPRESS,
                            ]}
                        >
                            <LineamientosIpress />
                        </RequireAuth>
                    }
                />

                {/* ======================================================
          👤 PANEL USUARIO GENERAL
        ====================================================== */}
                <Route
                    path="/user/dashboard"
                    element={
                        <RequireAuth allowedRoles={["USER", "USUARIO"]}>
                            <UserDashboard />
                        </RequireAuth>
                    }
                />

                {/* ======================================================
          🚫 PÁGINA NO ENCONTRADA
        ====================================================== */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
