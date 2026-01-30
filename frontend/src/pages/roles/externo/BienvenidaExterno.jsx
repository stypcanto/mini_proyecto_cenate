// ========================================================================
// 👋 BienvenidaExterno.jsx – Página de Bienvenida para Usuarios Externos
// ========================================================================
// Diseño profesional inspirado en BienvenidaCoordCitas
// Para IPRESS externas que solicitan servicios de telemedicina
// ========================================================================

import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  Settings,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Heart,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function BienvenidaExterno() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const genero = user?.genero === "F" || user?.genero === "FEMENINO" ? "a" : "o";
  const nombreUsuario = user?.nombreCompleto || "Usuario";

  // Estilo para animación suave de pulse
  const subtlePulseStyle = `
    @keyframes subtlePulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.85; }
    }
    .subtle-pulse {
      animation: subtlePulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 p-6">
      <style>{subtlePulseStyle}</style>
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
                Portal de Servicios de Telemedicina para IPRESS Consultantes
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Como IPRESS externa, utiliza este portal para solicitar servicios de telemedicina,
                verificar el estado de tus solicitudes, informar diagnósticos situacionales y acceder
                a información sobre los servicios de telemedicina disponibles en CENATE.
              </p>

              {/* Rol */}
              <div className="pt-2 flex items-center gap-2 text-blue-100 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">INSTITUCIÓN EXTERNA (IPRESS)</span>
              </div>
            </div>

            {/* Ícono minimalista - Edificio médico */}
            <div className="flex justify-center items-center md:col-span-1">
              <svg
                className="w-24 h-24"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Edificio */}
                <rect x="25" y="35" width="50" height="50" rx="4" fill="white" opacity="0.9" />

                {/* Puerta */}
                <rect x="40" y="55" width="12" height="20" fill="#1e3a8a" opacity="0.8" />

                {/* Ventanas */}
                <rect x="32" y="42" width="8" height="8" fill="#1e3a8a" opacity="0.7" />
                <rect x="52" y="42" width="8" height="8" fill="#1e3a8a" opacity="0.7" />
                <rect x="32" y="54" width="8" height="8" fill="#1e3a8a" opacity="0.7" />
                <rect x="52" y="54" width="8" height="8" fill="#1e3a8a" opacity="0.7" />

                {/* Cruz médica */}
                <line x1="50" y1="20" x2="50" y2="30" stroke="white" strokeWidth="2.5" opacity="0.95" />
                <line x1="45" y1="25" x2="55" y2="25" stroke="white" strokeWidth="2.5" opacity="0.95" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tarjetas de acciones rápidas */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            🎯 Acciones Rápidas
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Card 1: Formulario de Diagnóstico */}
            <QuickActionCard
              icon={<FileText className="w-6 h-6" />}
              title="Formulario de Diagnóstico"
              description="Recopila información para el diagnóstico situacional de Telesalud y realiza el requerimiento de servicios."
              color="indigo"
              action={() => navigate("/roles/externo/formulario-diagnostico")}
            />

            {/* Card 2: Solicitud de Turnos */}
            <QuickActionCard
              icon={<Calendar className="w-6 h-6" />}
              title="Solicitud de Turnos"
              description="Solicita las especialidades médicas que requieres de CENATE para que programe médicos a atender a tus pacientes por telemedicina."
              color="emerald"
              badge="Disponible a partir de marzo"
              action={() => navigate("/roles/externo/solicitud-turnos")}
            />

            {/* Card 3: Gestión de Modalidad */}
            <QuickActionCard
              icon={<Settings className="w-6 h-6" />}
              title="Gestión de Modalidades"
              description="Informa si tu IPRESS cuenta con teleconsultorios y para qué servicios. Programa atenciones especializadas desde tu institución o desde el domicilio del paciente por teleconsulta."
              color="purple"
              action={() => navigate("/roles/externo/gestion-modalidad")}
            />
          </div>
        </div>

        {/* Módulos Especializados */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            ⚙️ Módulos Especializados
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* TELE-EKG */}
            <SpecializedModuleCard
              icon={<Heart className="w-6 h-6" />}
              title="TELE-EKG"
              description="Envío de electrocardiogramas a CENATE para interpretación remota por especialistas. Agiliza el diagnóstico cardiológico."
              color="red"
              buttonText="Enviar EKG"
              action={() => navigate("/roles/externo/teleecgs")}
            />

            {/* Reportes y Seguimiento */}
            <SpecializedModuleCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Reportes y Seguimiento"
              description="Visualiza el estado de tus solicitudes, reportes de atención y seguimiento de pacientes en telemedicina."
              color="cyan"
              buttonText="Ver reportes"
              action={() => navigate("/roles/externo/reportes")}
            />
          </div>
        </div>

        {/* Botón de acción principal */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => navigate("/roles/externo/solicitud-turnos")}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            <span>Comenzar a Solicitar Servicios</span>
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
function QuickActionCard({ icon, title, description, color, badge, action }) {
  const colorClasses = {
    indigo: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300",
    emerald: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300",
    purple: "bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300",
  };

  const iconColorClasses = {
    indigo: "bg-indigo-100 text-indigo-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <button
      onClick={action}
      className={`${colorClasses[color]} border rounded-xl p-5 transition-all cursor-pointer group text-left w-full relative`}
    >
      {badge && (
        <div className="absolute top-3 right-3 subtle-pulse">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {badge}
          </div>
        </div>
      )}
      <div className={`${iconColorClasses[color]} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-600">{description}</p>
    </button>
  );
}

// ============================================================
// 🔧 Componente: Tarjeta de Módulo Especializado
// ============================================================
function SpecializedModuleCard({ icon, title, description, color, buttonText, action }) {
  const borderColorMap = {
    red: "border-red-200 hover:border-red-300",
    cyan: "border-cyan-200 hover:border-cyan-300",
  };

  const bgColorMap = {
    red: "bg-white hover:bg-red-50",
    cyan: "bg-white hover:bg-cyan-50",
  };

  const buttonColorMap = {
    red: "text-red-600",
    cyan: "text-cyan-600",
  };

  const iconBgColorMap = {
    red: "bg-red-100",
    cyan: "bg-cyan-100",
  };

  const iconColorMap = {
    red: "text-red-600",
    cyan: "text-cyan-600",
  };

  return (
    <button
      onClick={action}
      className={`${bgColorMap[color]} border ${borderColorMap[color]} rounded-xl p-6 shadow-sm transition-all cursor-pointer group text-left`}
    >
      <div className="flex items-start gap-4">
        <div className={`${iconBgColorMap[color]} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <span className={`${iconColorMap[color]}`}>{icon}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 mb-2">{title}</h4>
          <p className="text-sm text-slate-600 mb-3">{description}</p>
          <div className={`flex items-center gap-2 ${buttonColorMap[color]} text-sm font-medium group-hover:gap-3 transition-all`}>
            {buttonText} <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </button>
  );
}
