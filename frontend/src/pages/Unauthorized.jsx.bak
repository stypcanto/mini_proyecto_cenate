// ========================================================================
// 🚫 Unauthorized.jsx
// ------------------------------------------------------------------------
// Página de acceso denegado (cuando el usuario no tiene permisos MBAC).
// Compatible con el sistema de autenticación + ProtectedRoute.
// ========================================================================

import React from "react";
import { ShieldAlert, Home, ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-center px-6">
      {/* Icono */}
      <div className="bg-red-100 p-6 rounded-full mb-6 shadow-md">
        <ShieldAlert className="w-16 h-16 text-red-600" />
      </div>

      {/* Título */}
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        Acceso Denegado
      </h1>

      {/* Mensaje */}
      <p className="text-slate-600 max-w-md mb-6">
        Hola <span className="font-semibold">{user?.nombreCompleto || user?.username}</span>,
        no tienes permisos para acceder a esta sección del sistema.
        Si crees que se trata de un error, contacta al administrador del CENATE.
      </p>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
        >
          <ArrowLeftCircle className="w-5 h-5" />
          Volver
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg"
        >
          <Home className="w-5 h-5" />
          Ir al Dashboard
        </button>
      </div>

      {/* Firma o footer */}
      <div className="mt-10 text-xs text-slate-400">
        © {new Date().getFullYear()} CENATE – EsSalud
      </div>
    </div>
  );
}