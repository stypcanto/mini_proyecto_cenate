// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layout principal
import Layout from "../components/layout/Layout";

// 🔓 Páginas públicas
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import AccountRequest from "./AccountRequest"; // ✅ Nueva página de solicitud

// 🔐 Páginas protegidas
import PacientesPage from "./PacientesPage";
import TransferenciaExamenesPage from "./TransferenciaExamenesPage";
import NotFound from "./NotFound";

// 👑 Panel administrativo
import AdminDashboard from "./admin/AdminDashboard";
import UserManagement from "./admin/UserManagement";
import AdminUsersManagement from "./admin/AdminUsersManagement";
import RolesManagement from "./admin/RolesManagement";
import SystemLogs from "./admin/SystemLogs";

// 👤 Panel de usuario
import UserDashboard from "./user/UserDashboard";

/**
 * 🧩 Componente de protección de rutas
 * - Verifica si hay token JWT
 * - Permite restringir acceso por roles
 */
const RequireAuth = ({ children, allowedRoles = [] }) => {
    const token = localStorage.getItem("token");

    // Si no hay token, redirige al login
    if (!token) return <Navigate to="/login" replace />;

    // Si se especifican roles, valida
    if (allowedRoles.length > 0) {
        const storedRoles = JSON.parse(localStorage.getItem("roles") || "[]");
        const userRoles = storedRoles.map((r) => String(r).toUpperCase());
        const allowedUpper = allowedRoles.map((r) => String(r).toUpperCase());

        const isAllowed = userRoles.some((role) => allowedUpper.includes(role));
        if (!isAllowed) return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* =====================================
            🔓 RUTAS PÚBLICAS (sin autenticación)
        ===================================== */}
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/solicitud-cuenta" element={<AccountRequest />} /> {/* ✅ Nueva */}

                {/* =====================================
            🔐 RUTAS CON LAYOUT (autenticadas)
        ===================================== */}
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

                    {/* Página 404 dentro del layout */}
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* =====================================
            👑 PANEL ADMINISTRATIVO
        ===================================== */}
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

                {/* =====================================
            👤 PANEL DE USUARIO NORMAL
        ===================================== */}
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
