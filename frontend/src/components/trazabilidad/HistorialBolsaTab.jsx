// ============================================================================
// HistorialBolsaTab.jsx — v1.75.0
// Timeline del ciclo de vida de una solicitud de bolsa:
// Ingreso → Asignación médico → Cita agendada → Atención → Anulación → Recitas
// ============================================================================

import React, { useEffect, useState } from 'react';
import {
  ClipboardList, UserCheck, CalendarCheck, Stethoscope,
  XCircle, RefreshCw, AlertCircle, Loader2, Clock,
  Heart, HeartOff, RotateCcw, User,
} from 'lucide-react';
import trazabilidadBolsaService from '../../services/trazabilidadBolsaService';

// ── Icono y color según tipo de evento ──────────────────────────────────────
const EVENTO_CONFIG = {
  INGRESO:           { Icon: ClipboardList, bg: 'bg-blue-100',    ring: 'ring-blue-300',    text: 'text-blue-700'    },
  ASIGNACION_MEDICO: { Icon: UserCheck,     bg: 'bg-purple-100',  ring: 'ring-purple-300',  text: 'text-purple-700'  },
  CITA_AGENDADA:     { Icon: CalendarCheck, bg: 'bg-green-100',   ring: 'ring-green-300',   text: 'text-green-700'   },
  ATENCION:          { Icon: Stethoscope,   bg: 'bg-emerald-100', ring: 'ring-emerald-300', text: 'text-emerald-700' },
  CAMBIO_ESTADO:     { Icon: RefreshCw,     bg: 'bg-gray-100',    ring: 'ring-gray-300',    text: 'text-gray-700'    },
  ANULACION:         { Icon: XCircle,       bg: 'bg-red-100',     ring: 'ring-red-300',     text: 'text-red-700'     },
  DEVOLUCION:        { Icon: RotateCcw,     bg: 'bg-amber-100',   ring: 'ring-amber-300',   text: 'text-amber-700'   },
  RECITA:            { Icon: CalendarCheck, bg: 'bg-orange-100',  ring: 'ring-orange-300',  text: 'text-orange-700'  },
  CENACRON_INGRESO:  { Icon: Heart,         bg: 'bg-purple-100',  ring: 'ring-purple-300',  text: 'text-purple-700'  },
  CENACRON_BAJA:     { Icon: HeartOff,      bg: 'bg-orange-100',  ring: 'ring-orange-300',  text: 'text-orange-700'  },
};

const COLOR_BADGE = {
  blue:   'bg-blue-50 text-blue-700 border-blue-200',
  green:  'bg-green-50 text-green-700 border-green-200',
  red:    'bg-red-50 text-red-700 border-red-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  gray:   'bg-gray-50 text-gray-600 border-gray-200',
};

const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function formatFecha(fecha) {
  if (!fecha) return '—';
  const d = new Date(fecha);
  const dia  = String(d.getDate()).padStart(2, '0');
  const mes  = MESES[d.getMonth()];
  const anio = d.getFullYear();
  const hh   = String(d.getHours()).padStart(2, '0');
  const mm   = String(d.getMinutes()).padStart(2, '0');
  return `${dia} ${mes} ${anio}, ${hh}:${mm}`;
}

const LABEL_USUARIO = {
  INGRESO:           'Registrado por:',
  ASIGNACION_MEDICO: 'Asignado por:',
  CITA_AGENDADA:     'Agendado por:',
  ATENCION:          'Atendido por:',
  CAMBIO_ESTADO:     'Gestionado por:',
  ANULACION:         'Anulado por:',
  DEVOLUCION:        'Devuelto por:',
  RECITA:            'Recitado por:',
  CENACRON_INGRESO:  'Inscrito por:',
  CENACRON_BAJA:     'Dado de baja por:',
};

const LABEL_MEDICO = {
  INGRESO:           'Especialidad:',
  ASIGNACION_MEDICO: 'Profesional asignado:',
  CITA_AGENDADA:     'Profesional de cita:',
  ATENCION:          'Médico que atendió:',
  CAMBIO_ESTADO:     'Profesional:',
  ANULACION:         'Profesional:',
  DEVOLUCION:        'Médico anterior:',
  RECITA:            'Profesional:',
  CENACRON_INGRESO:  'Inscrito por:',
  CENACRON_BAJA:     'Dado de baja por:',
};

// ── Componente principal ─────────────────────────────────────────────────────
export default function HistorialBolsaTab({ idSolicitud }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!idSolicitud) return;
    cargar();
  }, [idSolicitud]);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const res = await trazabilidadBolsaService.obtenerTrazabilidad(idSolicitud);
      setData(res.data ?? res);
    } catch (e) {
      setError('No se pudo cargar el historial de esta solicitud.');
    } finally {
      setLoading(false);
    }
  }

  // ── Estados de carga ────────────────────────────────────────────────────
  if (!idSolicitud) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p className="text-sm">No hay solicitud seleccionada.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-blue-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm">Cargando historial...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-500">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="text-sm">{error}</p>
        <button onClick={cargar} className="mt-3 text-xs text-blue-600 underline">
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { numeroSolicitud, descripcionEstadoActual, timeline = [] } = data;

  return (
    <div className="p-4 space-y-4">

      {/* Resumen superior */}
      <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
        <span className="text-xs text-slate-500 font-medium">
          Sol. <span className="font-mono text-slate-700">{numeroSolicitud}</span>
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${COLOR_BADGE.blue}`}>
          {descripcionEstadoActual || 'Sin estado'}
        </span>
      </div>

      {/* Timeline */}
      {timeline.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          No hay eventos registrados para esta solicitud.
        </div>
      ) : (
        <ol className="relative border-l-2 border-slate-200 ml-4 space-y-0">
          {timeline.map((evento, idx) => {
            const cfg = EVENTO_CONFIG[evento.tipo] ?? EVENTO_CONFIG.CAMBIO_ESTADO;
            const { Icon, bg, ring, text } = cfg;
            const badgeClass = COLOR_BADGE[evento.color] ?? COLOR_BADGE.gray;
            const isLast = idx === timeline.length - 1;

            return (
              <li key={idx} className={`ml-6 ${isLast ? 'pb-2' : 'pb-6'}`}>
                {/* Icono en la línea */}
                <span className={`absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full ring-2 ${bg} ${ring}`}>
                  <Icon className={`w-3.5 h-3.5 ${text}`} />
                </span>

                {/* Contenido del evento */}
                <div className="bg-white border border-slate-100 rounded-lg shadow-sm px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-800">{evento.descripcion}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${badgeClass}`}>
                      {evento.estado || (evento.tipo === 'ASIGNACION_MEDICO' ? 'ASIGNACIÓN' : evento.tipo.replace(/_/g, ' '))}
                    </span>
                  </div>

                  {/* Fecha */}
                  <p className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                    <Clock className="w-3 h-3" />
                    {formatFecha(evento.fecha)}
                  </p>

                  {/* Profesional de salud involucrado */}
                  {evento.medico && (
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <span className="font-medium">{LABEL_MEDICO[evento.tipo] ?? 'Profesional:'}</span>
                      {evento.medico}
                    </p>
                  )}

                  {/* Usuario del sistema que ejecutó la acción */}
                  {evento.usuario && evento.usuario !== evento.medico && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 shrink-0" />
                      <span className="font-medium">{LABEL_USUARIO[evento.tipo] ?? 'Gestionado por:'}</span>
                      {evento.usuario}
                    </p>
                  )}

                  {/* Detalle adicional / motivo */}
                  {evento.detalle && (
                    <p className={`text-xs mt-1 ${
                      evento.tipo === 'CENACRON_BAJA' ? 'text-orange-700 font-medium' :
                      evento.tipo === 'ANULACION'     ? 'text-red-600 italic' :
                      'text-slate-500 italic'
                    }`}>
                      {evento.detalle}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
