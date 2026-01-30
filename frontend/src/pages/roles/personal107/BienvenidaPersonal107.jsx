// ========================================================================
// 👋 BienvenidaPersonal107.jsx – Página de Bienvenida Personal 107
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
  BarChart3,
} from "lucide-react";

export default function BienvenidaPersonal107() {
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
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-5 gap-6 p-8 text-white items-center">
            {/* Contenido */}
            <div className="md:col-span-4 space-y-3">
              <h2 className="text-2xl font-bold">
                Módulo 107 - Gestión de Pacientes
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Desde este módulo podrás consultar los pacientes que fueron enviados a CENATE y conocer el estado de su atención.
              </p>

              {/* Rol */}
              <div className="pt-2 flex items-center gap-2 text-blue-100 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">PERSONAL 107</span>
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
            {/* Card 1: Pacientes */}
            <FunctionalityCard
              icon={<Users className="w-6 h-6" />}
              title="Mis Pacientes"
              description="Visualiza y gestiona la lista de pacientes asignados bajo el Módulo 107"
              color="indigo"
              action={() => navigate("/bolsas/modulo107/pacientes-de-107")}
            />

            {/* Card 2: Atenciones Clínicas */}
            <FunctionalityCard
              icon={<FileText className="w-6 h-6" />}
              title="Atenciones Clínicas"
              description="Registra y consulta el historial de atenciones realizadas a pacientes"
              color="blue"
              action={() => navigate("/bolsas/modulo107/atenciones")}
            />

            {/* Card 3: Estadísticas */}
            <FunctionalityCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Estadísticas y Reportes"
              description="Visualiza métricas de desempeño del Módulo 107"
              color="purple"
              action={() => navigate("/bolsas/modulo107/estadisticas")}
            />
          </div>
        </div>

        {/* Botón de acción principal */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => navigate("/bolsas/modulo107/pacientes-de-107")}
            className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            <span>Ver mis Pacientes</span>
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
    indigo: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300",
    blue: "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300",
    purple: "bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300",
  };

  const iconColorClasses = {
    indigo: "bg-indigo-100 text-indigo-600",
    blue: "bg-blue-100 text-blue-600",
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
