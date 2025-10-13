// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 🧱 Layout principal
import Layout from "./components/layout/Layout";

// 🔓 Páginas públicas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AccountRequest from "./pages/AccountRequest"; // Nueva página para solicitud de cuentas

// 🔐 Páginas protegidas (requieren autenticación)
import PacientesPage from "./pages/PacientesPage";
import TransferenciaExamenesPage from "./pages/TransferenciaExamenesPage";

// 👑 Panel administrativo
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersManagement from "./pages/admin/AdminUsersManagement";
import RolesManagement from "./pages/admin/RolesManagement";
import SystemLogs from "./pages/admin/SystemLogs";
import UserManagement from "./pages/admin/UserManagement";
import AdminAccountRequests from "./pages/AdminAccountRequests";

// 👤 Panel de usuario general
import UserDashboard from "./pages/user/UserDashboard";

// 🩺 Módulos por roles
import DashboardMedico from "./pages/roles/medico/DashboardMedico";
import DashboardCoordinador from "./pages/roles/coordinador/DashboardCoordinador";
import DashboardExterno from "./pages/roles/externo/DashboardExterno";

// ⚠️ Página 404
import NotFound from "./pages/NotFound";

/* ==============================================================
 🧩 Componente de protección de rutas
============================================================== */
const RequireAuth = ({ children, allowedRoles = [] }) => {
    const token = localStorage.getItem("token");

    if (!token) return <Navigate to="/login" replace />;

    if (allowedRoles.length > 0) {
        const storedRoles = JSON.parse(localStorage.getItem("roles") || "[]");
        const userRoles = storedRoles.map((r) => String(r).toUpperCase());
        const allowedUpper = allowedRoles.map((r) => String(r).toUpperCase());
        const isAllowed = userRoles.some((r) => allowedUpper.includes(r));
        if (!isAllowed) return <Navigate to="/" replace />;
    }

    return children;
};

/* ==============================================================
 🌐 Enrutamiento principal de la aplicación
============================================================== */
function App() {
    return (
        <Router>
            <Routes>
                {/* ==============================================================
                   🔓 RUTAS PÚBLICAS (sin layout principal)
                ============================================================== */}
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/account-request" element={<AccountRequest />} />

                {/* ==============================================================
                   🔐 RUTAS CON LAYOUT (con header y footer)
                ============================================================== */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
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
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* ==============================================================
                   👑 PANEL ADMINISTRATIVO
                ============================================================== */}
                <Route
                    path="/admin"
                    element={
                        <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                            <AdminDashboard />
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

                {/* ==============================================================
                   🩺 PANEL PROFESIONAL DE SALUD
                ============================================================== */}
                <Route
                    path="/medico"
                    element={
                        <RequireAuth
                            allowedRoles={[
                                "MEDICO",
                                "ENFERMERIA",
                                "OBSTETRA",
                                "PSICOLOGO",
                                "TERAPISTA_LENG",
                                "TERAPISTA_FISI",
                                "NUTRICION",
                            ]}
                        >
                            <DashboardMedico />
                        </RequireAuth>
                    }
                />

                {/* ==============================================================
                   🗓️ PANEL COORDINADOR DE GESTIÓN DE CITAS
                ============================================================== */}
                <Route
                    path="/coordinador"
                    element={
                        <RequireAuth allowedRoles={["COORDINACION", "COORD_TRANSFER"]}>
                            <DashboardCoordinador />
                        </RequireAuth>
                    }
                />

                {/* ==============================================================
                   🏢 PANEL PERSONAL EXTERNO / INSTITUCIONES
                ============================================================== */}
                <Route
                    path="/externo"
                    element={
                        <RequireAuth
                            allowedRoles={["INSTITUCION_EX", "ASEGURADORA", "REGULADOR"]}
                        >
                            <DashboardExterno />
                        </RequireAuth>
                    }
                />

                {/* ==============================================================
                   👤 PANEL DE USUARIO GENERAL
                ============================================================== */}
                <Route
                    path="/user/dashboard"
                    element={
                        <RequireAuth allowedRoles={["USUARIO", "USER"]}>
                            <UserDashboard />
                        </RequireAuth>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;