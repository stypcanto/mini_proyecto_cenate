// ========================================================================
// 👋 BienvenidaExterno.jsx – Página de Bienvenida para Usuarios Externos
// ========================================================================
// Diseño moderno inspirado en BienvenidaCoordCitas con opciones vinculadas
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Settings,
  ArrowRight,
  CheckCircle2,
  Activity,
  Heart,
  BarChart3,
  Zap,
  Stethoscope,
  Clipboard,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ipressService from "../../../services/ipressService";

// Mapeo de íconos dinámicos
const iconMap = {
  FileText: FileText,
  Calendar: Calendar,
  Settings: Settings,
};

export default function BienvenidaExterno() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modulos, setModulos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modulosData = await ipressService.obtenerModulosDisponibles();
        const modulosOrdenados = (modulosData.data || []).sort(
          (a, b) => (a.orden || 0) - (b.orden || 0)
        );
        setModulos(modulosOrdenados);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
        // Fallback: módulos estáticos si hay error
        setModulos([
          {
            id: 1,
            moduloCodigo: "FORMULARIO_DIAGNOSTICO",
            moduloNombre: "Formulario de Diagnóstico",
            descripcion: "Completa el diagnóstico situacional de tu institución para solicitar servicios de telemedicina. Proporciona información sobre la capacidad actual de telesalud.",
            icono: "FileText",
            color: "blue",
            orden: 1,
            ruta: "/roles/externo/formulario-diagnostico",
          },
          {
            id: 2,
            moduloCodigo: "SOLICITUD_TURNOS",
            moduloNombre: "Solicitud de Turnos",
            descripcion: "Solicita consultas de telemedicina para tus pacientes. Selecciona especialidad, fecha y hora disponible. Recibe confirmación y seguimiento de tu solicitud.",
            icono: "Calendar",
            color: "emerald",
            orden: 2,
            ruta: "/roles/externo/solicitud-turnos",
          },
          {
            id: 3,
            moduloCodigo: "MODALIDAD_ATENCION",
            moduloNombre: "Gestión de Modalidad de Atención",
            descripcion: "Configura y actualiza las modalidades de atención disponibles en tu institución. Define capacidad de telemedicina, teleconsulta y otras modalidades.",
            icono: "Settings",
            color: "purple",
            orden: 3,
            ruta: "/roles/externo/gestion-modalidad",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const obtenerSaludo = () => {
    const genero = user?.genero === "F" || user?.genero === "FEMENINO" ? "a" : "o";
    const nombreUsuario = user?.nombreCompleto || "Usuario";
    return `¡Bienvenid${genero}, ${nombreUsuario}!`;
  };

  const getIconComponent = (iconoNombre) => {
    return iconMap[iconoNombre] || FileText;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const primeraAccion = modulos[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header con bienvenida */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">
            {obtenerSaludo()}
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
                Portal de Servicios de Telemedicina - CENATE
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Como IPRESS externa, utiliza este portal para solicitar servicios de telemedicina,
                verificar el estado de tus solicitudes, informar diagnósticos situacionales y acceder
                a información sobre los servicios de telemedicina disponibles en CENATE. Coordina la
                atención remota de tus pacientes de forma eficiente y segura.
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

                {/* Ventanas - 3 filas x 2 columnas */}
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

        {/* Secciones de Servicios Disponibles */}
        {modulos.length > 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                🎯 Acciones Rápidas
              </h3>
              <div className={`grid ${
                modulos.length === 1
                  ? "md:grid-cols-1 max-w-xl"
                  : modulos.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-3"
              } gap-4`}>
                {modulos.map((modulo) => {
                  const Icon = getIconComponent(modulo.icono);

                  const colorStyleMap = {
                    blue: {
                      bg: "bg-blue-50",
                      border: "border-blue-200",
                      hoverBg: "hover:bg-blue-100",
                      hoverBorder: "hover:border-blue-300",
                      iconBg: "bg-blue-100",
                      iconText: "text-blue-600",
                    },
                    emerald: {
                      bg: "bg-emerald-50",
                      border: "border-emerald-200",
                      hoverBg: "hover:bg-emerald-100",
                      hoverBorder: "hover:border-emerald-300",
                      iconBg: "bg-emerald-100",
                      iconText: "text-emerald-600",
                    },
                    purple: {
                      bg: "bg-purple-50",
                      border: "border-purple-200",
                      hoverBg: "hover:bg-purple-100",
                      hoverBorder: "hover:border-purple-300",
                      iconBg: "bg-purple-100",
                      iconText: "text-purple-600",
                    },
                    amber: {
                      bg: "bg-amber-50",
                      border: "border-amber-200",
                      hoverBg: "hover:bg-amber-100",
                      hoverBorder: "hover:border-amber-300",
                      iconBg: "bg-amber-100",
                      iconText: "text-amber-600",
                    },
                    indigo: {
                      bg: "bg-indigo-50",
                      border: "border-indigo-200",
                      hoverBg: "hover:bg-indigo-100",
                      hoverBorder: "hover:border-indigo-300",
                      iconBg: "bg-indigo-100",
                      iconText: "text-indigo-600",
                    },
                  };

                  const styles = colorStyleMap[modulo.color] || colorStyleMap.blue;

                  return (
                    <button
                      key={modulo.id}
                      onClick={() => navigate(modulo.ruta)}
                      className={`${styles.bg} border ${styles.border} ${styles.hoverBg} ${styles.hoverBorder} rounded-xl p-5 text-left transition-all cursor-pointer group`}
                    >
                      <div className={`${styles.iconBg} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${styles.iconText}`} />
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {modulo.moduloNombre}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {modulo.descripcion}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Módulos Especializados */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                ⚙️ Módulos Especializados
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Reportes */}
                <button
                  onClick={() => navigate("/roles/externo/reportes")}
                  className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 hover:border-cyan-300 hover:bg-cyan-100 rounded-xl p-6 shadow-sm transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        📊 Reportes y Seguimiento
                      </h4>
                      <p className="text-sm text-slate-600">
                        Visualiza el estado de tus solicitudes, reportes de atención y seguimiento de pacientes en telemedicina.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Dashboard */}
                <button
                  onClick={() => navigate("/roles/externo/dashboard")}
                  className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 hover:border-violet-300 hover:bg-violet-100 rounded-xl p-6 shadow-sm transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        📈 Dashboard Institucional
                      </h4>
                      <p className="text-sm text-slate-600">
                        Panel de control con métricas, estadísticas y análisis del desempeño de servicios de telemedicina.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sección TELE-EKG */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            ⚡ Módulo Especializado: TELE-EKG
          </h3>
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Envío de Electrocardiogramas a CENATE
                </h4>
                <p className="text-sm text-slate-600 mb-3">
                  El módulo TELE-EKG se ha implementado principalmente para facilitar el envío de imágenes
                  de electrocardiogramas (EKG) desde tu IPRESS a CENATE. Los especialistas de CENATE podrán
                  revisar y proporcionar interpretaciones remotas de forma rápida y segura.
                </p>
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Disponible en el menú lateral</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de acción principal */}
        {primeraAccion && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => navigate(primeraAccion.ruta)}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              <span>Comenzar a Trabajar</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

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
