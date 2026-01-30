// ========================================================================
// 👋 BienvenidaCoordCitas.jsx – Página de Bienvenida Coordinador de Citas
// ========================================================================

import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  BarChart3,
  Upload,
  History,
  HeartPulse,
  Database,
} from "lucide-react";

export default function BienvenidaCoordCitas() {
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
              <h2 className="text-3xl font-bold">
                Módulo de Coordinación de Gestión de Citas
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Como Coordinador de Gestión de Citas, gestiona bolsas de pacientes,
                procesa solicitudes de telemedicina y asigna casos al grupo de gestión de citas.
              </p>

              {/* Rol */}
              <div className="pt-2 flex items-center gap-2 text-blue-100 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">COORDINADOR DE GESTIÓN DE CITAS</span>
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
                {/* Cabeza */}
                <circle cx="50" cy="25" r="12" fill="white" opacity="0.95"/>

                {/* Cuerpo */}
                <rect x="38" y="40" width="24" height="28" rx="4" fill="white" opacity="0.9"/>

                {/* Brazos */}
                <line x1="38" y1="48" x2="20" y2="42" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.9"/>
                <line x1="62" y1="48" x2="80" y2="42" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.9"/>

                {/* Piernas */}
                <line x1="42" y1="68" x2="42" y2="88" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.9"/>
                <line x1="58" y1="68" x2="58" y2="88" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.9"/>

                {/* Estetoscopio simplificado */}
                <g opacity="0.85">
                  <path d="M 30 45 Q 25 40 22 35" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <circle cx="20" cy="33" r="3" fill="white"/>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Tarjetas de funcionalidades principales */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            🎯 Acciones Rápidas
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Card 1: Solicitudes de Bolsas */}
            <FunctionalityCard
              icon={<ClipboardList className="w-6 h-6" />}
              title="Solicitudes de Bolsas"
              description="Revisa y gestiona las solicitudes de pacientes pendientes de asignación"
              color="blue"
              action={() => navigate("/bolsas/solicitudes")}
            />

            {/* Card 2: Atenciones Clínicas */}
            <FunctionalityCard
              icon={<FileText className="w-6 h-6" />}
              title="Atenciones Clínicas"
              description="Consulta el registro de atenciones y seguimientos realizados"
              color="emerald"
              action={() => navigate("/bolsas/atenciones-clinicas")}
            />

            {/* Card 3: Estadísticas */}
            <FunctionalityCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Estadísticas y Reportes"
              description="Visualiza métricas de desempeño del módulo de bolsas"
              color="purple"
              action={() => navigate("/bolsas/estadisticas")}
            />
          </div>
        </div>

        {/* Módulos Especializados */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            🔬 Módulos Especializados
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Dengue */}
            <button
              onClick={() => navigate("/dengue/buscar")}
              className="bg-white border border-red-200 hover:border-red-300 hover:bg-red-50 rounded-xl p-6 shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    🦟 Dengue
                  </h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Gestión de casos de dengue y seguimiento de pacientes diagnosticados
                  </p>
                  <div className="flex items-center gap-2 text-red-600 text-sm font-medium group-hover:gap-3 transition-all">
                    Ver casos <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </button>

            {/* Módulo 107 */}
            <button
              onClick={() => navigate("/bolsas/modulo107")}
              className="bg-white border border-blue-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl p-6 shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    📋 Módulo 107
                  </h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Gestión de pacientes bajo el Módulo 107 con atenciones clínicas
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 text-sm font-medium group-hover:gap-3 transition-all">
                    Ver módulo <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Botón de acción principal */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => navigate("/bolsas/solicitudes")}
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
// 🔧 Componente: Tarjeta de Funcionalidad
// ============================================================
function FunctionalityCard({ icon, title, description, color, action }) {
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
      className={`${colorClasses[color]} border rounded-xl p-5 text-left transition-all cursor-pointer group`}
    >
      <div className={`${iconColorClasses[color]} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-600">{description}</p>
    </button>
  );
}
