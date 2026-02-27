// ========================================================================
// HistorialAtencionesTab.jsx - Historial de Atenciones (Trazabilidad)
// ------------------------------------------------------------------------
// CENATE 2026 | Timeline de solicitudes de atención del asegurado
// DTO fields: idSolicitud, numeroSolicitud, pacienteNombre, pacienteDni,
//             especialidad, tipoCita, derivacionInterna,
//             ipressNombre, codigoIpress, estado, estadoDescripcion,
//             condicionMedica, fechaSolicitud, fechaAtencion,
//             horaAtencion, motivoLlamadoBolsa
// ========================================================================

import { useState, useEffect } from 'react';
import {
  Activity,
  Calendar,
  Building2,
  FileText,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  Stethoscope,
  ChevronDown,
  Hash
} from 'lucide-react';
import { atencionesClinicasService } from '../../services/atencionesClinicasService';
import DetalleAtencionModal from './DetalleAtencionModal';

// ============================================================
// Helpers
// ============================================================

/**
 * Format a date (LocalDate string "YYYY-MM-DD" or LocalDateTime) in Spanish.
 * Falls back to fechaSolicitud if fechaAtencion is null.
 */
const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';
  try {
    // LocalDateTime strings contain 'T'; LocalDate strings don't
    const dateObj = fecha.includes('T')
      ? new Date(fecha)
      : new Date(fecha + 'T00:00:00');
    return dateObj.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Return a Tailwind color pair for the estado badge.
 */
const colorBadgeEstado = (estado) => {
  const estadoUpper = (estado || '').toUpperCase();
  if (['ATENDIDO', 'COMPLETADO', 'REALIZADO'].some(s => estadoUpper.includes(s))) {
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  }
  if (['DESERCI', 'ABANDONO'].some(s => estadoUpper.includes(s))) {
    return 'bg-orange-100 text-orange-800 border border-orange-200';
  }
  if (['PENDIENTE', 'EN_ESPERA', 'PENDIENTE_CITAR'].some(s => estadoUpper.includes(s))) {
    return 'bg-amber-100 text-amber-800 border border-amber-200';
  }
  if (['CITADO', 'PROGRAMADO', 'AGENDADO'].some(s => estadoUpper.includes(s))) {
    return 'bg-sky-100 text-sky-800 border border-sky-200';
  }
  if (['CANCELADO', 'ANULADO'].some(s => estadoUpper.includes(s))) {
    return 'bg-red-100 text-red-800 border border-red-200';
  }
  return 'bg-slate-100 text-slate-700 border border-slate-200';
};

// ============================================================
// Component
// ============================================================

export default function HistorialAtencionesTab({ pkAsegurado }) {
  const [atenciones, setAtenciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [modalDetalle, setModalDetalle] = useState({
    isOpen: false,
    idSolicitud: null
  });

  // ============================================================
  // Cargar Atenciones
  // ============================================================
  const cargarAtenciones = async () => {
    if (!pkAsegurado) {
      setError('No se proporcionó el identificador del asegurado');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await atencionesClinicasService.obtenerPorAsegurado(pkAsegurado, 0, 50);
      const data = response.data || response;
      setAtenciones(data.content || []);
    } catch (err) {
      console.error('Error al cargar atenciones:', err);
      setError('No se pudieron cargar las atenciones del asegurado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAtenciones();
  }, [pkAsegurado]);

  // ============================================================
  // Toggle card expand/collapse
  // ============================================================
  const toggleExpand = (idSolicitud) => {
    setExpandedItems(prev => ({
      ...prev,
      [idSolicitud]: !prev[idSolicitud]
    }));
  };

  // ============================================================
  // Loading state
  // ============================================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Cargando atenciones...</p>
      </div>
    );
  }

  // ============================================================
  // Error state
  // ============================================================
  if (error) {
    return (
      <div className="p-8 text-center border border-red-200 bg-red-50 rounded-xl">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
        <p className="mb-1 font-medium text-red-700">{error}</p>
        <button
          onClick={cargarAtenciones}
          className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-white transition-all bg-emerald-600 hover:bg-emerald-700 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  // ============================================================
  // Empty state
  // ============================================================
  if (!atenciones || atenciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 px-8 text-center bg-gradient-to-b from-emerald-50/60 to-slate-50 border border-emerald-100 rounded-xl">
        <div className="p-4 bg-emerald-100/70 rounded-full mb-4">
          <Activity className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="font-semibold text-slate-600 mb-1">Sin atenciones registradas</p>
        <p className="text-sm text-slate-400 max-w-xs">
          Este asegurado aún no tiene atenciones clínicas en el sistema CENATE
        </p>
      </div>
    );
  }

  // ============================================================
  // Timeline
  // ============================================================
  return (
    <div className="space-y-3">
      {/* Counter */}
      <p className="text-xs font-medium text-slate-500 pb-1">
        {atenciones.length} {atenciones.length === 1 ? 'atención registrada' : 'atenciones registradas'}
      </p>

      {/* Cards */}
      {atenciones.map((atencion) => {
        const isExpanded = !!expandedItems[atencion.idSolicitud];

        // Derive display values from real DTO fields
        const titulo = atencion.tipoCita || 'Atención';
        const subtitulo = atencion.especialidad || atencion.derivacionInterna || 'Sin especialidad';
        const tieneFechaAtencion = !!atencion.fechaAtencion;
        const tieneFechaSugerida = !!atencion.fechaPreferidaNoAtendida;
        const fechaMostrar = tieneFechaAtencion
          ? formatearFecha(atencion.fechaAtencion)
          : tieneFechaSugerida
            ? formatearFecha(atencion.fechaPreferidaNoAtendida)
            : formatearFecha(atencion.fechaSolicitud);
        const labelFecha = tieneFechaAtencion
          ? 'Cita:'
          : tieneFechaSugerida
            ? 'Sugerida:'
            : 'Registrado:';

        // condicionMedica refleja el desenlace clínico real → tiene prioridad sobre estadoDescripcion
        // (estadoDescripcion = estado de agendamiento que siempre dice "Paciente agendado...")
        const condicionUpper = (atencion.condicionMedica || '').toUpperCase();
        const tieneDesenlace = ['ATENDIDO', 'DESERCI', 'ABANDONO', 'COMPLETADO'].some(s => condicionUpper.includes(s));
        const estadoLabel = tieneDesenlace
          ? atencion.condicionMedica
          : (atencion.estadoDescripcion || atencion.condicionMedica || atencion.estado || '');

        return (
          <div
            key={atencion.idSolicitud}
            className="bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all duration-200"
          >
            {/* Card header — always visible */}
            <div className="flex items-start gap-3 p-4">
              {/* Icon */}
              <div className="mt-0.5 p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  {/* Title + subtitle */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-semibold text-slate-800 text-sm leading-snug truncate">
                        {titulo}
                      </h4>
                      {/* Badge tipo derivación: RECITA / INTERCONSULTA */}
                      {['RECITA', 'INTERCONSULTA', 'TELECONSULTA'].includes(
                        (atencion.tipoCita || '').toUpperCase()
                      ) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                          {atencion.tipoCita}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {subtitulo}
                    </p>
                  </div>

                  {/* Estado badge */}
                  {estadoLabel && (
                    <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorBadgeEstado(estadoLabel)}`}>
                      {estadoLabel}
                    </span>
                  )}
                </div>

                {/* Date + IPRESS + Profesional row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                    <Calendar className={`w-3.5 h-3.5 flex-shrink-0 ${tieneFechaAtencion ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className={`font-medium ${tieneFechaAtencion ? 'text-slate-600' : 'text-slate-400'}`}>{labelFecha}</span>
                    <span className={tieneFechaAtencion ? 'text-slate-700' : 'text-slate-400 italic'}>{fechaMostrar}</span>
                    {tieneFechaAtencion && atencion.horaAtencion && (
                      <span className="text-slate-400">· {atencion.horaAtencion}</span>
                    )}
                  </span>
                  {atencion.nombreProfesional && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 truncate max-w-[260px]">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="truncate font-medium">{atencion.nombreProfesional}</span>
                    </span>
                  )}
                  {atencion.ipressNombre && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-[220px]">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{atencion.ipressNombre}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Expand button */}
              <button
                onClick={() => toggleExpand(atencion.idSolicitud)}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 transition-all duration-150"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
              >
                <span className="hidden sm:inline">{isExpanded ? 'Ocultar' : 'Detalles'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                />
              </button>
            </div>

            {/* Expanded section */}
            {isExpanded && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
                {/* Motivo de llamado a bolsa */}
                {atencion.motivoLlamadoBolsa && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <p className="text-xs font-semibold text-emerald-700 mb-1">
                      Motivo de la solicitud
                    </p>
                    <p className="text-sm text-emerald-900 leading-relaxed">
                      {atencion.motivoLlamadoBolsa}
                    </p>
                  </div>
                )}

                {/* Secondary metadata row */}
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {atencion.horaAtencion && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      Hora: <span className="font-medium text-slate-700">{atencion.horaAtencion}</span>
                    </span>
                  )}
                  {atencion.numeroSolicitud && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                      <Hash className="w-3.5 h-3.5 text-emerald-500" />
                      N° Solicitud: <span className="font-medium text-slate-700">{atencion.numeroSolicitud}</span>
                    </span>
                  )}
                  {atencion.derivacionInterna && atencion.especialidad && (
                    // Show derivacionInterna as extra context only when it differs from the subtitle
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      Servicio: <span className="font-medium text-slate-700">{atencion.derivacionInterna}</span>
                    </span>
                  )}
                </div>

                {/* Ver Detalles Completos button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalDetalle({ isOpen: true, idSolicitud: atencion.idSolicitud });
                  }}
                  className="w-full mt-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all font-medium text-sm flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Ver Detalles Completos
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal de Detalle */}
      {modalDetalle.isOpen && (
        <DetalleAtencionModal
          isOpen={true}
          idAtencion={modalDetalle.idSolicitud}
          onClose={() => setModalDetalle({ isOpen: false, idSolicitud: null })}
        />
      )}
    </div>
  );
}
