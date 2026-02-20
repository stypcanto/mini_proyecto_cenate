// ========================================================================
// 👋 BienvenidaExterno.jsx – Página de Bienvenida para Usuarios Externos
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
  Video,
  ExternalLink,
  Monitor,
  Activity,
  Building2,
  Stethoscope,
} from "lucide-react";

export default function BienvenidaExterno() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const genero = user?.genero === "F" || user?.genero === "FEMENINO" ? "a" : "o";
  const nombreUsuario = user?.nombreCompleto || "Usuario";
  const nombreIpress = user?.nombreIpress || "INSTITUCIÓN EXTERNA (IPRESS)";
  const isPadomi = user?.nombreIpress?.toUpperCase().includes("PADOMI") || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 flex flex-col overflow-hidden">

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-6 md:space-y-8">

            {/* ── Hero ── */}
            <div className="bg-gradient-to-br from-blue-700 to-teal-700 rounded-2xl shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 p-5 md:p-6 text-white items-center">
                <div className="md:col-span-4 space-y-2">
                  <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">
                    Portal de Telemedicina · CENATE
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                    ¡Bienvenid{genero}, {nombreUsuario}!
                  </h1>
                  <div className="flex items-center gap-2 pt-1">
                    <CheckCircle2 className="w-4 h-4 text-teal-300 flex-shrink-0" />
                    <span className="font-bold drop-shadow-sm [text-shadow:0_2px_6px_rgba(0,0,0,0.3)] text-sm md:text-base">
                      {nombreIpress}
                    </span>
                  </div>
                  <p className="text-blue-100 text-xs md:text-sm leading-relaxed pt-1 max-w-xl">
                    Utiliza este portal para solicitar servicios de telemedicina, gestionar requerimientos,
                    informar diagnósticos situacionales y monitorear tus atenciones con CENATE.
                  </p>
                </div>
                <div className="hidden md:flex justify-center items-center md:col-span-1">
                  <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="25" y="35" width="50" height="50" rx="4" fill="white" opacity="0.9" />
                    <rect x="40" y="55" width="12" height="20" fill="#1e3a8a" opacity="0.8" />
                    <rect x="32" y="42" width="8" height="8" fill="#1e3a8a" opacity="0.7" />
                    <rect x="52" y="42" width="8" height="8" fill="#1e3a8a" opacity="0.7" />
                    <rect x="32" y="54" width="8" height="8" fill="#1e3a8a" opacity="0.7" />
                    <rect x="52" y="54" width="8" height="8" fill="#1e3a8a" opacity="0.7" />
                    <line x1="50" y1="20" x2="50" y2="30" stroke="white" strokeWidth="2.5" opacity="0.95" />
                    <line x1="45" y1="25" x2="55" y2="25" stroke="white" strokeWidth="2.5" opacity="0.95" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ── Sección: Gestión IPRESS ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-800">Gestión IPRESS</h2>
                <div className="flex-1 h-px bg-slate-200 ml-2" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <AccionCard
                  icon={<FileText className="w-5 h-5" />}
                  title="Diagnóstico Situacional"
                  description="Recopila y envía el diagnóstico situacional de Telesalud de tu IPRESS a CENATE."
                  color="indigo"
                  action={() => navigate("/roles/externo/formulario-diagnostico")}
                />
                <AccionCard
                  icon={<Calendar className="w-5 h-5" />}
                  title="Solicitud de Requerimientos"
                  description="Solicita las especialidades médicas que requieres de CENATE para atender a tus pacientes."
                  color="emerald"
                  badge="Disponible a partir de marzo"
                  action={() => navigate("/roles/externo/solicitud-turnos")}
                />
                <AccionCard
                  icon={<Settings className="w-5 h-5" />}
                  title="Gestión de Modalidades de Atención"
                  description="Actualiza qué tipo de atenciones recibirás: teleconsultorio, teleconsulta o mixta."
                  color="purple"
                  action={() => navigate("/roles/externo/gestion-modalidad")}
                />
              </div>
            </div>

            {/* ── Sección: Servicios de Telemedicina ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-slate-800">Servicios de Telemedicina</h2>
                <div className="flex-1 h-px bg-slate-200 ml-2" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <AccionCard
                  icon={<Monitor className="w-5 h-5" />}
                  title="Teleconsulta"
                  description="Consulta el listado de pacientes y estadísticas de teleconsulta de tu IPRESS."
                  color="blue"
                  action={() => navigate("/roles/externo/teleconsulta/listado")}
                />
                <AccionCard
                  icon={<Activity className="w-5 h-5" />}
                  title="Teleinterconsulta"
                  description="Accede al módulo Tele-EKG para envío de electrocardiogramas e interpretación remota."
                  color="teal"
                  action={() => navigate("/teleekgs/ipress-workspace")}
                />
                <AccionCard
                  icon={<BarChart3 className="w-5 h-5" />}
                  title="Teleapoyo al Diagnóstico"
                  description="Monitorea el número de lecturas pendientes por IPRESS con datos actualizados diariamente."
                  color="cyan"
                  action={() => navigate("/roles/externo/seguimiento-lecturas")}
                />
              </div>
            </div>

            {/* ── Módulos Especializados ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-slate-800">Módulos Especializados</h2>
                <div className="flex-1 h-px bg-slate-200 ml-2" />
              </div>
              <div className={`grid grid-cols-1 ${isPadomi ? "md:grid-cols-2" : "md:grid-cols-1 max-w-lg"} gap-3`}>

                {/* TELE-EKG — solo visible para PADOMI */}
                {isPadomi && (
                  <button
                    onClick={() => navigate("/teleekgs/ipress-workspace")}
                    className="bg-white border border-red-200 hover:border-red-400 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-red-50 w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                        <Heart className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-semibold text-slate-800 text-sm md:text-base">TELE-EKG</h4>
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                            PADOMI
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 mb-2">
                          Envío de electrocardiogramas a CENATE para interpretación remota por especialistas.
                        </p>
                        <div className="flex items-center gap-1.5 text-red-600 text-xs md:text-sm font-medium group-hover:gap-2 transition-all">
                          Ir al módulo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Enlace de Videollamada */}
                <button
                  onClick={() => window.open("https://us06web.zoom.us/j/86422884993?pwd=By6ANg3MnCxbcRVbE0CeotV7G8fLky.1#success", "_blank")}
                  className="bg-white border border-blue-200 hover:border-blue-400 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                      <Video className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 mb-1 text-sm md:text-base">Enlace de Videollamada</h4>
                      <p className="text-xs md:text-sm text-slate-500 mb-2">
                        Accede a la teleconsulta con CENATE a través de Zoom.
                      </p>
                      <div className="flex items-center gap-1.5 text-blue-600 text-xs md:text-sm font-medium group-hover:gap-2 transition-all">
                        Abrir en Zoom <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </button>

              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs md:text-sm text-slate-400 pt-2 border-t border-slate-200">
              ¿Necesitas ayuda? Contacta al equipo de soporte de CENATE o revisa la documentación en tu panel.
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-14 z-40 flex items-center px-4 gap-1">
        <MobileNavBtn icon={<FileText className="w-5 h-5" />} label="Diagnóstico" action={() => navigate("/roles/externo/formulario-diagnostico")} />
        <MobileNavBtn icon={<Calendar className="w-5 h-5" />} label="Turnos" action={() => navigate("/roles/externo/solicitud-turnos")} />
        <MobileNavBtn icon={<Settings className="w-5 h-5" />} label="Modalidades" action={() => navigate("/roles/externo/gestion-modalidad")} />
        <MobileNavBtn icon={<Monitor className="w-5 h-5" />} label="Teleconsulta" action={() => navigate("/roles/externo/teleconsulta/listado")} />
        <MobileNavBtn icon={<BarChart3 className="w-5 h-5" />} label="Lecturas" action={() => navigate("/roles/externo/seguimiento-lecturas")} />
      </nav>
      <div className="lg:hidden h-14" />
    </div>
  );
}

// ── Componente: Tarjeta de Acción ──────────────────────────────
const colorMap = {
  indigo: { card: "hover:border-indigo-300 hover:bg-indigo-50/50", icon: "bg-indigo-50 text-indigo-600", border: "border-slate-200" },
  emerald: { card: "hover:border-emerald-300 hover:bg-emerald-50/50", icon: "bg-emerald-50 text-emerald-600", border: "border-slate-200" },
  purple:  { card: "hover:border-purple-300 hover:bg-purple-50/50",  icon: "bg-purple-50 text-purple-600",  border: "border-slate-200" },
  blue:    { card: "hover:border-blue-300 hover:bg-blue-50/50",      icon: "bg-blue-50 text-blue-600",      border: "border-slate-200" },
  teal:    { card: "hover:border-teal-300 hover:bg-teal-50/50",      icon: "bg-teal-50 text-teal-600",      border: "border-slate-200" },
  cyan:    { card: "hover:border-cyan-300 hover:bg-cyan-50/50",      icon: "bg-cyan-50 text-cyan-600",      border: "border-slate-200" },
};

function AccionCard({ icon, title, description, color, badge, action }) {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <button
      onClick={action}
      className={`bg-white border ${c.border} ${c.card} rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200 text-left w-full group flex flex-col gap-3`}
    >
      {badge && (
        <span className="self-start bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {badge}
        </span>
      )}
      <div className={`${c.icon} w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-slate-800 text-sm md:text-base mb-1">{title}</h4>
        <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors mt-auto">
        Ir al módulo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
}

// ── Componente: Botón de navegación mobile ─────────────────────
function MobileNavBtn({ icon, label, action }) {
  return (
    <button
      onClick={action}
      className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
    >
      {icon}
      <span className="text-[10px] font-semibold mt-0.5">{label}</span>
    </button>
  );
}
