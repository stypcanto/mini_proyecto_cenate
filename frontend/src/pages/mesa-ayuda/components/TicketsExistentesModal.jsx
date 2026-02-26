import React, { useState } from 'react';
import { X, Ticket, AlertCircle, Clock, Eye, ChevronRight, Calendar } from 'lucide-react';

/**
 * ✅ v1.67.0: Modal para mostrar tickets existentes
 * Se muestra cuando un paciente ya tiene tickets creados
 * 
 * Props:
 * - isOpen: boolean - Si el modal está abierto
 * - onClose: function - Callback para cerrar el modal
 * - tickets: Array - Lista de tickets existentes
 * - paciente: Object - Datos del paciente { nombre, dni, idSolicitudBolsa }
 * - onAbrirCrearTicket: function - Callback para crear nuevo ticket
 * - onAbrirDetalleTicket: function - Callback para ver detalle de un ticket (recibe numeroTicket)
 * 
 * @version v1.67.0 (2026-02-26)
 */
function TicketsExistentesModal({ isOpen, onClose, tickets = [], paciente, onAbrirCrearTicket, onAbrirDetalleTicket }) {
  if (!isOpen) return null;

  const totalTickets = tickets?.length || 0;

  // Estados con colores
  const colorEstado = {
    NUEVO: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-400', accent: 'bg-amber-400' },
    EN_PROCESO: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-400', accent: 'bg-blue-500' },
    RESUELTO: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-400', accent: 'bg-emerald-500' },
    CERRADO: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-400', accent: 'bg-slate-400' },
  };

  const colorPrioridad = {
    ALTA: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200', accent: 'bg-red-500' },
    MEDIA: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', accent: 'bg-amber-500' },
    BAJA: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200', accent: 'bg-green-500' },
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        {/* Header - Mejorado */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-[#0A5BA9] to-[#0A4A8C] rounded-t-xl border-b border-[#084488]">
          <button
            onClick={onClose}
            className="absolute top-4 right-6 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>

          <div className="flex items-start justify-between gap-4 pr-10">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white leading-tight mb-2">
                Tickets Existentes
              </h2>
              <div className="space-y-1">
                <p className="text-xs text-white/85 font-medium">
                  {paciente?.nombre || 'N/A'} (DNI: {paciente?.dni})
                </p>
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Ticket size={14} className="text-white" strokeWidth={2} />
                  <span className="text-xs font-semibold text-white">
                    ID Solicitud: {paciente?.idSolicitudBolsa || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {totalTickets} {totalTickets === 1 ? 'Ticket' : 'Tickets'}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 overflow-y-auto flex-1 bg-gradient-to-b from-gray-50/50 to-gray-100/30" style={{ scrollbarWidth: 'thin' }}>
          {totalTickets === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-600 text-center font-medium">
                No hay tickets existentes para este paciente
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tickets.map((ticket, idx) => {
                const estadoColor = colorEstado[ticket.estado] || colorEstado.NUEVO;
                const prioridadColor = colorPrioridad[ticket.prioridad] || colorPrioridad.MEDIA;

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all hover:shadow-md hover:border-gray-300 group"
                  >
                    <div className="flex">
                      {/* Barra lateral de estado */}
                      <div className={`w-1.5 ${estadoColor.accent} flex-shrink-0`} />

                      <div className="flex-1 px-4 py-3">
                        {/* Fila superior: Ticket + badges */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-gray-900">
                              #{ticket.numeroTicket || 'N/A'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${estadoColor.bg} ${estadoColor.text} border ${estadoColor.border}`}>
                              {ticket.estado || '—'}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${prioridadColor.bg} ${prioridadColor.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${prioridadColor.accent}`} />
                              {ticket.prioridad || '—'}
                            </span>
                          </div>

                          {/* Botón Detalle */}
                          <button
                            onClick={() => onAbrirDetalleTicket?.(ticket.numeroTicket)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[#0A5BA9] bg-blue-50 hover:bg-[#0A5BA9] hover:text-white transition-all border border-blue-200 hover:border-[#0A5BA9]"
                            title="Ver detalle completo"
                          >
                            <Eye size={12} strokeWidth={2.5} />
                            Detalle
                            <ChevronRight size={12} className="opacity-60" />
                          </button>
                        </div>

                        {/* Fila inferior: Fechas */}
                        <div className="flex items-center gap-4 text-[11px] text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={11} className="text-gray-400" />
                            {formatearFecha(ticket.fechaCreacion)}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={11} className="text-gray-400" />
                            {formatearFecha(ticket.fechaActualizacion)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Mejorado */}
        <div className="px-6 py-3 bg-white rounded-b-xl border-t border-gray-200 flex justify-between gap-3">
          <button
            onClick={() => {
              if (onAbrirCrearTicket) {
                onAbrirCrearTicket();
              }
            }}
            className="flex-1 px-4 py-2.5 rounded-lg font-bold text-sm text-white bg-gradient-to-r from-[#0A5BA9] to-[#0A4A8C] hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            title="Crear un nuevo ticket para este paciente"
          >
            <Ticket size={16} strokeWidth={2} />
            Crear Ticket
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicketsExistentesModal;
