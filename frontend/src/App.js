// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layout
import Layout from "./components/layout/Layout";

// Páginas públicas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Páginas protegidas
import PacientesPage from "./pages/PacientesPage";
import TransferenciaExamenesPage from "./pages/TransferenciaExamenesPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import NotFound from "./pages/NotFound";

/**
 * Componente de protección de rutas
 * - Requiere un token JWT en localStorage
 * - Permite restringir el acceso por roles
 */
const RequireAuth = ({ children, allowedRoles = [] }) => {
    const token = localStorage.getItem("token");

    // Si no hay token, redirige al login
    if (!token) return <Navigate to="/login" replace />;

    // Si se especifican roles, validamos
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
                {/* 🔓 Rutas públicas (sin Layout) */}
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* 🔐 Rutas con Layout (Header + Footer) */}
                <Route element={<Layout />}>
                    {/* Página principal */}
                    <Route path="/" element={<Home />} />

                    {/* Rutas protegidas solo por autenticación */}
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

                    {/* Panel de administración (roles específicos) */}
                    <Route
                        path="/admin"
                        element={
                            <RequireAuth allowedRoles={["SUPERADMIN", "ADMIN"]}>
                                <AdminDashboard />
                            </RequireAuth>
                        }
                    />

                    {/* Panel de usuario normal */}
                    <Route
                        path="/usuario"
                        element={
                            <RequireAuth allowedRoles={["USUARIO", "USER"]}>
                                <UserDashboard />
                            </RequireAuth>
                        }
                    />

                    {/* Página 404 dentro del Layout */}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
