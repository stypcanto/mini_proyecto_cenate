import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Clock, User, Phone, Building2, Stethoscope, FileText } from 'lucide-react';
import { mesaAyudaService } from '../../../services/mesaAyudaService';

/**
 * ✅ v1.67.0: Modal detalle completo de un ticket
 * Muestra toda la información del ticket incluyendo respuesta, médico, paciente, etc.
 * 
 * Props:
 * - isOpen: boolean - Si el modal está abierto
 * - onClose: function - Callback para cerrar el modal
 * - numeroTicket: string - Número del ticket a mostrar (ej: 001-2026)
 * 
 * @version v1.67.0 (2026-02-26)
 */
function DetalleTicketModal({ isOpen, onClose, numeroTicket }) {
  const [ticket, setTicket] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && numeroTicket) {
      cargarDetalleTicket();
    }
  }, [isOpen, numeroTicket]);

  const cargarDetalleTicket = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await mesaAyudaService.obtenerDetalleTicket(numeroTicket);
      setTicket(data);
      console.log(`✅ Detalle del ticket ${numeroTicket} cargado:`, data);
    } catch (err) {
      console.error(`❌ Error cargando detalle del ticket: ${err.message}`);
      setError('No se pudo cargar el detalle del ticket. Por favor, intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  // Estados con colores
  const colorEstado = {
    NUEVO: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', icon: AlertCircle },
    EN_PROCESO: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: Clock },
    RESUELTO: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: CheckCircle },
    CERRADO: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: X },
  };

  const colorPrioridad = {
    ALTA: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    MEDIA: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    BAJA: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
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

  const estadoInfo = colorEstado[ticket?.estado] || colorEstado.NUEVO;
  const prioridadInfo = colorPrioridad[ticket?.prioridad] || colorPrioridad.MEDIA;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="relative px-6 py-5 bg-[#0A5BA9] rounded-t-lg sticky top-0 z-10">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>

          <div className="flex items-start justify-between gap-6 pr-12">
            <div className="flex-1">
              <p className="text-2xl font-bold text-white leading-relaxed">
                Detalle del Ticket
              </p>
              {ticket && (
                <p className="text-sm text-white/75 font-mono mt-1">
                  Ticket: {ticket.numeroTicket}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto flex-1">
          {cargando && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A5BA9] mb-4"></div>
              <p className="text-gray-600">Cargando detalles...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
              <p className="text-red-700 font-semibold">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {ticket && !cargando && (
            <div className="space-y-6">
              {/* Estado y Prioridad */}
              <div className="flex gap-4 flex-wrap">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${estadoInfo.bg} ${estadoInfo.text}`}>
                  <estadoInfo.icon size={18} />
                  {ticket.estado || 'DESCONOCIDO'}
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${prioridadInfo.bg} ${prioridadInfo.text}`}>
                  <div className={`w-3 h-3 rounded-full ${prioridadInfo.dot}`}></div>
                  Prioridad: {ticket.prioridad || 'N/A'}
                </div>
              </div>

              {/* Título y Descripción */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{ticket.titulo}</h3>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{ticket.descripcion}</p>
                </div>
              </div>

              {/* Información del Médico */}
              {ticket.nombreMedico && (
                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope size={18} className="text-blue-600" />
                    <p className="font-semibold text-gray-900">Personal Asistencial Creador</p>
                  </div>
                  <p className="text-sm text-gray-700 ml-6">{ticket.nombreMedico}</p>
                  {ticket.especialidad && (
                    <p className="text-xs text-gray-600 ml-6 mt-1">{ticket.especialidad}</p>
                  )}
                </div>
              )}

              {/* Información del Paciente */}
              {(ticket.nombrePaciente || ticket.dniPaciente) && (
                <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={18} className="text-purple-600" />
                    <p className="font-semibold text-gray-900">Paciente</p>
                  </div>
                  <div className="ml-6 space-y-1">
                    {ticket.nombrePaciente && (
                      <p className="text-sm text-gray-700">{ticket.nombrePaciente}</p>
                    )}
                    {ticket.dniPaciente && (
                      <p className="text-xs text-gray-600">DNI: {ticket.dniPaciente}</p>
                    )}
                    {ticket.ipress && (
                      <p className="text-xs text-gray-600">IPRESS: {ticket.ipress}</p>
                    )}
                    {ticket.telefonoPaciente && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Phone size={14} />
                        {ticket.telefonoPaciente}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* IPRESS */}
              {ticket.ipress && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Building2 size={18} className="text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">IPRESS</p>
                    <p className="text-sm text-gray-900">{ticket.ipress}</p>
                  </div>
                </div>
              )}

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Creado</p>
                  <p className="text-sm text-gray-900">{formatearFecha(ticket.fechaCreacion)}</p>
                </div>
                {ticket.fechaActualizacion && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Actualizado</p>
                    <p className="text-sm text-gray-900">{formatearFecha(ticket.fechaActualizacion)}</p>
                  </div>
                )}
              </div>

              {/* Respuesta (si existe) */}
              {ticket.respuesta && (
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={18} className="text-green-600" />
                    <p className="font-semibold text-gray-900">Respuesta</p>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{ticket.respuesta}</p>
                    {ticket.nombrePersonalMesa && (
                      <p className="text-xs text-gray-600">
                        Respondido por: <span className="font-semibold">{ticket.nombrePersonalMesa}</span>
                      </p>
                    )}
                    {ticket.fechaRespuesta && (
                      <p className="text-xs text-gray-600">
                        {formatearFecha(ticket.fechaRespuesta)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Observaciones (si existen) */}
              {ticket.observaciones && (
                <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={18} className="text-orange-600" />
                    <p className="font-semibold text-gray-900">Observaciones</p>
                  </div>
                  <p className="text-sm text-gray-700 ml-6 whitespace-pre-wrap">{ticket.observaciones}</p>
                </div>
              )}

              {/* Asignación (si existe) */}
              {ticket.nombrePersonalAsignado && (
                <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={18} className="text-indigo-600" />
                    <p className="font-semibold text-gray-900">Asignado a</p>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm text-gray-700">{ticket.nombrePersonalAsignado}</p>
                    {ticket.fechaAsignacion && (
                      <p className="text-xs text-gray-600 mt-1">
                        {formatearFecha(ticket.fechaAsignacion)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetalleTicketModal;
