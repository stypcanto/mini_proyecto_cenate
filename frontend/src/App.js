// ========================================================================
// 🌐 App.js – Sistema MBAC CENATE (Versión unificada 2025 - REORGANIZADO)
// ------------------------------------------------------------------------
// Sistema completo de Login con RBAC (Role-Based Access Control)
// Flujo: Home → Login → Dashboard (según permisos) → Logout → Home
// Incluye: ProtectedRoute, AppLayout único y roles MBAC coherentes.
// ✅ ACTUALIZADO: Sistema de Registro de Componentes Dinámicos (v1.14.0)
// ========================================================================

import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// 🌈 Contextos globales
import { AuthProvider } from "./context/AuthContext";
import { PermisosProvider } from "./context/PermisosContext";
import { ToastProvider } from "./context/ToastContext";

// 🧱 Layout y seguridad
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/security/ProtectedRoute";

// 📋 Registro de componentes dinámicos
import { componentRegistry } from "./config/componentRegistry";

// 🧩 Páginas públicas (carga directa, sin lazy loading)
import Home from "./pages/Home";
import Login from "./pages/Login";
import CrearCuenta from "./pages/CrearCuenta";
import CambiarContrasena from "./pages/CambiarContrasena";
import Unauthorized from "./pages/Unauthorized";

// TEST (temporal - será removido)
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
// 🔧 Componente de Loading para Suspense
// ========================================================================
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Cargando módulo...</p>
      </div>
    </div>
  );
}

// ========================================================================
// 🚏 Definición de rutas (DINÁMICAS desde componentRegistry)
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
        {/* 👥 Página temporal de prueba - Será removida */}
        <Route path="/test-usuarios" element={<TestUsuarios />} />

        {/* 🔄 RUTAS DINÁMICAS - Generadas automáticamente desde componentRegistry */}
        {Object.entries(componentRegistry).map(([path, config]) => {
          const Component = config.component;
          const requiredPath = config.pathMatch || path; // Usar pathMatch si existe (para rutas con parámetros)
          const requiredAction = config.requiredAction;
          const requiredRoles = config.requiredRoles;

          return (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<LoadingFallback />}>
                  {requiredAction ? (
                    // Ruta con protección MBAC
                    <ProtectedRoute
                      requiredPath={requiredPath}
                      requiredAction={requiredAction}
                      requiredRoles={requiredRoles}
                    >
                      <Component />
                    </ProtectedRoute>
                  ) : (
                    // Ruta sin protección MBAC (ej: módulo de asegurados)
                    <Component />
                  )}
                </Suspense>
              }
            />
          );
        })}
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
          {/* 🔔 Proveedor de Toast Context */}
          <ToastProvider>
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
          </ToastProvider>
        </PermisosProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}