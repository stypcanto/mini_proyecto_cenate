// ========================================================================
// 👋 BienvenidaCitas.jsx – Página de Bienvenida Gestor de Citas
// ========================================================================
// Diseño profesional inspirado en BienvenidaCoordCitas
// Para gestores de citas que gestionan pacientes y atenciones
// ========================================================================

import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function BienvenidaCitas() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const genero = user?.genero === "F" || user?.genero === "FEMENINO" ? "a" : "o";
  const nombreUsuario = user?.nombreCompleto || "Usuario";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header con bienvenida */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">
            ¡Bienvenid{genero}, {nombreUsuario}!
          </h1>
          <p className="text-lg text-slate-600">
            Centro Nacional de Telemedicina - CENATE
          </p>
        </div>

        {/* Card principal de bienvenida */}
        <div className="bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-5 gap-6 p-8 text-white items-center">
            {/* Contenido */}
            <div className="md:col-span-4 space-y-3">
              <h2 className="text-2xl font-bold">
                Módulo de Gestión de Citas
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Gestiona tu bandeja de pacientes (Bolsa 107, Dengue, Reprogramaciones, IVR, CENACRON),
                asigna citas médicas, coordina teleconsultas y realiza seguimiento de casos clínicos.
              </p>

              {/* Rol */}
              <div className="pt-2 flex items-center gap-2 text-blue-100 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">GESTOR DE CITAS</span>
              </div>
            </div>

            {/* Ícono minimalista */}
            <div className="flex justify-center items-center md:col-span-1">
              <svg
                className="w-24 h-24"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Calendario */}
                <rect x="20" y="25" width="60" height="55" rx="3" fill="white" opacity="0.95"/>
                <line x1="20" y1="35" x2="80" y2="35" stroke="white" strokeWidth="2" opacity="0.9"/>

                {/* Días del calendario */}
                <circle cx="32" cy="48" r="2.5" fill="white" opacity="0.8"/>
                <circle cx="50" cy="48" r="2.5" fill="white" opacity="0.8"/>
                <circle cx="68" cy="48" r="2.5" fill="white" opacity="0.8"/>

                <circle cx="32" cy="60" r="2.5" fill="white" opacity="0.8"/>
                <circle cx="50" cy="60" r="2.5" fill="white" opacity="0.9" strokeWidth="1.5" stroke="#1e40af"/>
                <circle cx="68" cy="60" r="2.5" fill="white" opacity="0.8"/>

                <circle cx="32" cy="72" r="2.5" fill="white" opacity="0.8"/>
                <circle cx="50" cy="72" r="2.5" fill="white" opacity="0.8"/>

                {/* Manecillas de reloj */}
                <line x1="50" y1="60" x2="50" y2="50" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
                <line x1="50" y1="60" x2="58" y2="60" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Tarjetas de acciones rápidas */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            🎯 Acciones Rápidas
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Card 1: Mi Bandeja */}
            <QuickActionCard
              icon={<ClipboardList className="w-6 h-6" />}
              title="Mi Bandeja"
              description="Revisa solicitudes de pacientes (Bolsa 107, Dengue, IVR, CENACRON), asigna citas, coordina teleconsultas y gestiona reagendamientos"
              color="blue"
              action={() => navigate("/citas/gestion-pacientes")}
            />

            {/* Card 2: Reportes y Seguimiento */}
            <QuickActionCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Reportes y Seguimiento"
              description="Visualiza métricas de atenciones realizadas, pacientes pendientes, tasas de reagendamiento y desempeño general"
              color="purple"
              action={() => navigate("/citas/dashboard")}
            />
          </div>
        </div>

        {/* Botón de acción principal */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => navigate("/citas/gestion-pacientes")}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            <span>Comenzar a Gestionar</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pt-8 border-t border-slate-200">
          <p>
            ¿Necesitas ayuda? Contacta al equipo de soporte de CENATE o revisa la documentación en tu panel.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🔧 Componente: Tarjeta de Acción Rápida
// ============================================================
function QuickActionCard({ icon, title, description, color, action }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300",
    emerald: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300",
    purple: "bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300",
  };

  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <button
      onClick={action}
      className={`${colorClasses[color]} border rounded-xl p-5 transition-all duration-300 cursor-pointer group text-left w-full shadow-sm hover:shadow-lg hover:scale-105`}
    >
      <div className={`${iconColorClasses[color]} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-600">{description}</p>
    </button>
  );
}

