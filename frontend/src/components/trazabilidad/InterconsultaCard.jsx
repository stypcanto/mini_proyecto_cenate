// ========================================================================
// InterconsultaCard.jsx - Tarjeta de Interconsulta
// ------------------------------------------------------------------------
// CENATE 2026 | Componente para mostrar información de interconsulta
// ========================================================================

import React from 'react';
import {
  Users,
  Video,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function InterconsultaCard({
  tieneOrdenInterconsulta,
  idEspecialidadInterconsulta,
  nombreEspecialidadInterconsulta,
  modalidadInterconsulta,
  className = ''
}) {
  // ============================================================
  // Validación
  // ============================================================
  if (!tieneOrdenInterconsulta) {
    return (
      <div className={`bg-slate-50 border-2 border-slate-200 rounded-xl p-6 text-center ${className}`}>
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm font-medium">
          No requiere interconsulta
        </p>
      </div>
    );
  }

  // ============================================================
  // Configuración de Modalidad
  // ============================================================
  const getModalidadConfig = (modalidad) => {
    const configs = {
      PRESENCIAL: {
        icon: Building2,
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-900',
        badgeBg: 'bg-blue-500',
        label: 'Presencial',
        description: 'Atención en establecimiento de salud'
      },
      VIRTUAL: {
        icon: Video,
        color: 'purple',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-900',
        badgeBg: 'bg-purple-500',
        label: 'Virtual',
        description: 'Teleconsulta por videoconferencia'
      }
    };

    return configs[modalidad] || {
      icon: AlertCircle,
      color: 'slate',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-900',
      badgeBg: 'bg-slate-500',
      label: modalidad || 'Sin modalidad',
      description: 'Modalidad no especificada'
    };
  };

  const modalidadConfig = getModalidadConfig(modalidadInterconsulta);
  const ModalidadIcon = modalidadConfig.icon;

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Orden de Interconsulta
          </h3>
          <p className="text-sm text-slate-500">
            Referencia a especialidad
          </p>
        </div>
      </div>

      {/* Card Principal */}
      <div className={`border-2 ${modalidadConfig.borderColor} ${modalidadConfig.bgColor} rounded-xl p-6`}>
        {/* Estado y Modalidad */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${modalidadConfig.badgeBg} rounded-full`}>
              <ModalidadIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className={`text-lg font-bold ${modalidadConfig.textColor}`}>
                Modalidad {modalidadConfig.label}
              </h4>
              <p className={`text-sm ${modalidadConfig.textColor} opacity-80`}>
                {modalidadConfig.description}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            ACTIVA
          </span>
        </div>

        {/* Especialidad Destino */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Especialidad Destino
              </p>
              <p className="text-lg font-bold text-slate-900">
                {nombreEspecialidadInterconsulta || 'Sin especialidad especificada'}
              </p>
              {idEspecialidadInterconsulta && (
                <p className="text-xs text-slate-500 mt-1">
                  ID: {idEspecialidadInterconsulta}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información de Proceso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Estado de Agendamiento */}
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase">
                Agendamiento
              </span>
            </div>
            <p className="text-sm font-medium text-slate-700">
              Pendiente de programación
            </p>
          </div>

          {/* Tiempo de Respuesta */}
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase">
                Tiempo Estimado
              </span>
            </div>
            <p className="text-sm font-medium text-slate-700">
              24-48 horas hábiles
            </p>
          </div>
        </div>

        {/* Instrucciones según Modalidad */}
        <div className={`mt-4 p-4 rounded-lg ${modalidadConfig.bgColor} border-2 ${modalidadConfig.borderColor}`}>
          <h5 className={`text-sm font-bold ${modalidadConfig.textColor} mb-2 flex items-center gap-2`}>
            <AlertCircle className="w-4 h-4" />
            Instrucciones para el paciente
          </h5>
          {modalidadInterconsulta === 'PRESENCIAL' ? (
            <ul className={`text-sm ${modalidadConfig.textColor} space-y-1.5 ml-6 list-disc`}>
              <li>Acudir al establecimiento de salud indicado</li>
              <li>Presentar documento de identidad y orden de interconsulta</li>
              <li>Llevar exámenes auxiliares previos si los tiene</li>
              <li>Llegar 15 minutos antes de la cita programada</li>
            </ul>
          ) : (
            <ul className={`text-sm ${modalidadConfig.textColor} space-y-1.5 ml-6 list-disc`}>
              <li>Recibirá un enlace de videollamada por correo electrónico</li>
              <li>Asegúrese de tener conexión a internet estable</li>
              <li>Prepare su cámara y micrófono con anticipación</li>
              <li>Ingrese 5 minutos antes de la hora programada</li>
            </ul>
          )}
        </div>

        {/* Nota de Seguimiento */}
        <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-900 font-medium">
            ⚠️ <strong>Importante:</strong> La especialidad destino revisará esta orden y contactará
            al paciente para agendar la cita correspondiente. El paciente recibirá notificación
            por los medios de contacto registrados.
          </p>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border-2 border-slate-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
            Prioridad
          </p>
          <p className="text-sm font-bold text-slate-900">
            Normal
          </p>
        </div>
        <div className="bg-white border-2 border-slate-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
            Tipo de Atención
          </p>
          <p className="text-sm font-bold text-slate-900">
            Teleconsulta Especializada
          </p>
        </div>
      </div>
    </div>
  );
}
