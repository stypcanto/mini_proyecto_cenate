// ========================================================================
// 👋 BienvenidaExterno.jsx – Página de Bienvenida para Usuarios Externos
// ========================================================================
// Diseño profesional inspirado en BienvenidaCoordCitas
// Para IPRESS externas que solicitan servicios de telemedicina
// ========================================================================

import React, { useState } from "react";
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
  Video,
  Copy,
  Radio,
  ExternalLink,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 flex flex-col overflow-hidden">
      <style>{subtlePulseStyle}</style>


      {/* Main Content - Horizontal Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header - Compact */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                ¡Bienvenid{genero}, {nombreUsuario}!
              </h1>
              <p className="text-sm md:text-base text-slate-600">
                Centro Nacional de Telemedicina - CENATE
              </p>
            </div>

            {/* Hero Card - Optimized for Landscape Tablet */}
            <div className="bg-gradient-to-br from-blue-700 to-teal-700 rounded-xl shadow-lg overflow-hidden relative">
              {/* Overlay for better contrast */}
              <div className="absolute inset-0 bg-black/10" />

              <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 p-4 md:p-5 text-white items-center">
                {/* Contenido */}
                <div className="md:col-span-4 space-y-2">
                  <h2 className="text-lg md:text-xl font-bold leading-tight">
                    Portal de Servicios de Telemedicina para IPRESS Consultantes
                  </h2>
                  <p className="text-blue-100 text-xs md:text-sm leading-relaxed">
                    Como IPRESS externa, utiliza este portal para solicitar servicios de telemedicina,
                    verificar el estado de tus solicitudes, informar diagnósticos situacionales y acceder
                    a información sobre los servicios de telemedicina disponibles en CENATE.
                  </p>

                  {/* Rol */}
                  <div className="pt-1 flex items-center gap-2 text-blue-100 text-xs md:text-sm">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">INSTITUCIÓN EXTERNA (IPRESS)</span>
                  </div>
                </div>

                {/* Ícono minimalista - Edificio médico */}
                <div className="hidden md:flex justify-center items-center md:col-span-1">
                  <svg
                    className="w-16 h-16 md:w-20 md:h-20"
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

            {/* Tarjetas de acciones rápidas - 4 columns in landscape */}
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3">
                Acciones Rápidas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                {/* Card 1: Formulario de Diagnóstico */}
                <QuickActionCard
                  icon={<FileText className="w-5 h-5 md:w-6 md:h-6" />}
                  title="Formulario de Diagnóstico"
                  description="Recopila información para el diagnóstico situacional de Telesalud y realiza el requerimiento de servicios."
                  color="indigo"
                  action={() => navigate("/roles/externo/formulario-diagnostico")}
                />

                {/* Card 2: Solicitud de Turnos */}
                <QuickActionCard
                  icon={<Calendar className="w-5 h-5 md:w-6 md:h-6" />}
                  title="Solicitud de Turnos"
                  description="Solicita las especialidades médicas que requieres de CENATE para que programe médicos a atender a tus pacientes por telemedicina."
                  color="emerald"
                  badge="Disponible a partir de marzo"
                  action={() => navigate("/roles/externo/solicitud-turnos")}
                />

                {/* Card 3: Gestión de Modalidad */}
                <QuickActionCard
                  icon={<Settings className="w-5 h-5 md:w-6 md:h-6" />}
                  title="Gestión de Modalidades"
                  description="Actualiza información sobre qué atenciones recibirás desde CENATE: por teleconsultorio, por teleconsulta, o de manera mixta."
                  color="purple"
                  action={() => navigate("/roles/externo/gestion-modalidad")}
                />

                {/* Card 4: Seguimiento de Lecturas */}
                <QuickActionCard
                  icon={<Zap className="w-5 h-5 md:w-6 md:h-6" />}
                  title="Seguimiento de Lecturas"
                  description="Dashboard dinámico para monitorear el número de lecturas pendientes por IPRESS. Datos actualizados diariamente."
                  color="cyan"
                  action={() => navigate("/roles/externo/seguimiento-lecturas")}
                />
              </div>
            </div>

            {/* Módulos Especializados - 2 columns in landscape */}
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3">
                Módulos Especializados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {/* TELE-EKG */}
                <SpecializedModuleCard
                  icon={<Heart className="w-5 h-5 md:w-6 md:h-6" />}
                  title="TELE-EKG"
                  description="Envío de electrocardiogramas a CENATE para interpretación remota por especialistas. Agiliza el diagnóstico cardiológico."
                  color="red"
                  buttonText="Enviar EKG"
                  badge="Actualmente disponible solo para PADOMI"
                  disabled={true}
                />

                {/* Enlace de Videollamada - Teleconsultorio */}
                <button
                  onClick={() => window.open("https://us06web.zoom.us/j/86422884993?pwd=By6ANg3MnCxbcRVbE0CeotV7G8fLky.1#success", "_blank")}
                  className="bg-white border border-blue-200 hover:border-blue-300 rounded-xl p-4 md:p-5 shadow-sm transition-all duration-300 cursor-pointer group text-left relative hover:shadow-lg hover:scale-105 min-h-[44px] flex items-center"
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="bg-blue-100 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform min-w-[44px] min-h-[44px]">
                      <span className="text-blue-600">
                        <Video className="w-5 h-5 md:w-6 md:h-6" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 mb-1 text-sm md:text-base">Enlace de Videollamada</h4>
                      <p className="text-xs md:text-sm text-slate-600 mb-2 line-clamp-2">Accede a la teleconsulta con CENATE a través de Zoom.</p>
                      <div className="flex items-center gap-1.5 text-blue-600 text-xs md:text-sm font-medium group-hover:gap-2 transition-all">
                        Abrir en Zoom
                        <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs md:text-sm text-slate-500 pt-4 border-t border-slate-200">
              <p>
                ¿Necesitas ayuda? Contacta al equipo de soporte de CENATE o revisa la documentación en tu panel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Hidden on lg+ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-14 z-40 flex items-center px-4 gap-1">
        <button
          onClick={() => {
            navigate("/roles/externo/formulario-diagnostico");
          }}
          className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          aria-label="Formulario"
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Formulario</span>
        </button>
        <button
          onClick={() => {
            navigate("/roles/externo/solicitud-turnos");
          }}
          className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          aria-label="Turnos"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Turnos</span>
        </button>
        <button
          onClick={() => {
            navigate("/roles/externo/gestion-modalidad");
          }}
          className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          aria-label="Modalidades"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Modalidades</span>
        </button>
        <button
          onClick={() => {
            navigate("/roles/externo/seguimiento-lecturas");
          }}
          className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          aria-label="Lecturas"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Lecturas</span>
        </button>
      </nav>

      {/* Padding for mobile bottom nav */}
      <div className="lg:hidden h-14" />
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
    cyan: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300",
  };

  const iconColorClasses = {
    indigo: "bg-indigo-100 text-indigo-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    cyan: "bg-cyan-100 text-cyan-600",
  };

  return (
    <button
      onClick={action}
      className={`${colorClasses[color]} border rounded-lg md:rounded-xl p-4 md:p-5 transition-all duration-300 cursor-pointer group text-left w-full relative shadow-sm hover:shadow-lg hover:scale-105 min-h-[44px] flex flex-col justify-center`}
      aria-label={title}
    >
      {badge && (
        <div className="absolute top-2 md:top-3 right-2 md:right-3 subtle-pulse">
          <div className="bg-red-500 text-white px-2 md:px-3 py-1 rounded-full text-xs font-semibold">
            {badge}
          </div>
        </div>
      )}
      <div className={`${iconColorClasses[color]} w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform min-w-[44px] min-h-[44px]`}>
        {icon}
      </div>
      <h4 className="font-semibold text-slate-900 mb-1 text-sm md:text-base line-clamp-2">{title}</h4>
      <p className="text-xs md:text-sm text-slate-600 line-clamp-3">{description}</p>
    </button>
  );
}

// ============================================================
// 🔧 Componente: Tarjeta de Módulo Especializado
// ============================================================
function SpecializedModuleCard({ icon, title, description, color, buttonText, badge, disabled, action }) {
  const borderColorMap = {
    red: "border-red-200 hover:border-red-300",
    cyan: "border-cyan-200 hover:border-cyan-300",
    purple: "border-purple-200 hover:border-purple-300",
  };

  const bgColorMap = {
    red: disabled ? "bg-slate-50" : "bg-white hover:bg-red-50",
    cyan: "bg-white hover:bg-cyan-50",
    purple: "bg-white hover:bg-purple-50",
  };

  const buttonColorMap = {
    red: "text-red-600",
    cyan: "text-cyan-600",
    purple: "text-purple-600",
  };

  const iconBgColorMap = {
    red: "bg-red-100",
    cyan: "bg-cyan-100",
    purple: "bg-purple-100",
  };

  const iconColorMap = {
    red: "text-red-600",
    cyan: "text-cyan-600",
    purple: "text-purple-600",
  };

  return (
    <button
      onClick={!disabled ? action : undefined}
      disabled={disabled}
      className={`${bgColorMap[color]} border ${borderColorMap[color]} rounded-lg md:rounded-xl p-4 md:p-5 shadow-sm transition-all duration-300 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer group hover:shadow-lg hover:scale-105"} text-left relative min-h-[44px] flex items-start`}
      aria-label={title}
    >
      {badge && (
        <div className="absolute top-2 md:top-3 right-2 md:right-3 subtle-pulse">
          <div className={`${disabled ? "bg-slate-600" : "bg-red-500"} text-white px-2 md:px-3 py-1 rounded-full text-xs font-semibold`}>
            {badge}
          </div>
        </div>
      )}
      <div className="flex items-start gap-3 md:gap-4 w-full">
        <div className={`${iconBgColorMap[color]} w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${!disabled ? "group-hover:scale-110" : ""} transition-transform min-w-[44px] min-h-[44px]`}>
          <span className={`${iconColorMap[color]}`}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 mb-1 text-sm md:text-base line-clamp-2">{title}</h4>
          <p className="text-xs md:text-sm text-slate-600 mb-2 line-clamp-2">{description}</p>
          {!disabled && (
            <div className={`flex items-center gap-1.5 md:gap-2 ${buttonColorMap[color]} text-xs md:text-sm font-medium group-hover:gap-2 md:group-hover:gap-3 transition-all`}>
              {buttonText} <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
