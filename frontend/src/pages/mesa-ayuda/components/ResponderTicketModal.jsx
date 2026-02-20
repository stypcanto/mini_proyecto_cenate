import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';

/**
 * Modal para responder un ticket de Mesa de Ayuda
 * Muestra respuestas predefinidas como chips seleccionables.
 * Solo cuando se elige "Otros" se habilita el campo de texto libre.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - ticket: Object
 * - usuario: Object
 * - onSuccess: function
 *
 * @version v1.65.10 (2026-02-19)
 */
function ResponderTicketModal({ isOpen, onClose, ticket, usuario, onSuccess }) {
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null); // { id, codigo, descripcion, esOtros }
  const [textoOtros, setTextoOtros] = useState('');
  const [estado, setEstado] = useState('RESUELTO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [respuestasPredefinidas, setRespuestasPredefinidas] = useState([]);
  const [loadingRespuestas, setLoadingRespuestas] = useState(false);

  // Cargar respuestas predefinidas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarRespuestasPredefinidas();
    }
  }, [isOpen]);

  const cargarRespuestasPredefinidas = async () => {
    setLoadingRespuestas(true);
    try {
      const { mesaAyudaService } = await import('../../../services/mesaAyudaService');
      const data = await mesaAyudaService.obtenerRespuestasPredefinidas();
      setRespuestasPredefinidas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando respuestas predefinidas:', err);
      setRespuestasPredefinidas([]);
    } finally {
      setLoadingRespuestas(false);
    }
  };

  if (!isOpen || !ticket) return null;

  // Texto final a enviar: si es "Otros" usar textoOtros, sino la descripcion de la respuesta
  const textoFinal = respuestaSeleccionada?.esOtros
    ? textoOtros.trim()
    : respuestaSeleccionada?.descripcion || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!respuestaSeleccionada) {
      setError('Debe seleccionar una respuesta');
      return;
    }
    if (respuestaSeleccionada.esOtros && !textoOtros.trim()) {
      setError('Debe ingresar el detalle de la respuesta');
      return;
    }
    if (!estado) {
      setError('Debe seleccionar un estado');
      return;
    }

    setLoading(true);
    try {
      const { mesaAyudaService } = await import('../../../services/mesaAyudaService');
      const responderData = {
        respuesta: textoFinal,
        estado,
        idPersonalMesa: usuario?.id || null,
        nombrePersonalMesa: usuario?.nombre || null,
      };
      const response = await mesaAyudaService.responderTicket(ticket.id, responderData);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.(response.data);
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        err.message ||
        'Error al responder el ticket. Intente nuevamente.'
      );
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRespuestaSeleccionada(null);
      setTextoOtros('');
      setEstado('RESUELTO');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const getEstadoBadgeColor = (est) => ({
    NUEVO: 'bg-yellow-100 text-yellow-800',
    EN_PROCESO: 'bg-orange-100 text-orange-800',
    RESUELTO: 'bg-green-100 text-green-800',
  }[est] || 'bg-gray-100 text-gray-800');

  const getPrioridadBadgeColor = (prio) => ({
    ALTA: 'bg-red-50 text-red-700 border-red-200',
    MEDIA: 'bg-orange-50 text-orange-700 border-orange-200',
    BAJA: 'bg-blue-50 text-blue-700 border-blue-200',
  }[prio] || 'bg-gray-50 text-gray-700 border-gray-200');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{ticket.titulo}</h2>
            <div className="flex gap-2 mt-2">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getEstadoBadgeColor(ticket.estado)}`}>
                {ticket.estado}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${getPrioridadBadgeColor(ticket.prioridad)}`}>
                {ticket.prioridad}
              </span>
            </div>
          </div>
          <button onClick={handleClose} disabled={loading} className="text-gray-400 hover:text-gray-600 disabled:opacity-50 ml-4">
            <X size={22} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Detalles del ticket */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Médico</p>
              <p className="text-gray-900">{ticket.nombreMedico || 'N/A'}</p>
            </div>
            {ticket.dniPaciente && (
              <>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">Paciente</p>
                  <p className="text-gray-900">{ticket.nombrePaciente || 'N/A'}</p>
                  <p className="text-xs text-gray-500">DNI: {ticket.dniPaciente}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">IPRESS</p>
                  <p className="text-gray-900">{ticket.ipress || 'N/A'}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Fecha de Creación</p>
              <p className="text-gray-900">{new Date(ticket.fechaCreacion).toLocaleString('es-ES')}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Tiempo Abierto</p>
              <p className="text-gray-900">{ticket.horasDesdeCreacion} horas</p>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción del Ticket</h3>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.descripcion}</p>
            </div>
          </div>

          {/* Respuesta anterior */}
          {ticket.respuesta && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Respuesta Anterior</h3>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{ticket.respuesta}</p>
              {ticket.nombrePersonalMesa && (
                <p className="text-xs text-blue-600 mt-1">Por: {ticket.nombrePersonalMesa}</p>
              )}
            </div>
          )}

          {/* Mensajes */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">Ticket actualizado exitosamente</p>
            </div>
          )}

          {/* Formulario */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Cambiar Estado <span className="text-red-500">*</span>
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="RESUELTO">Resuelto</option>
                </select>
              </div>

              {/* Respuestas predefinidas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Respuesta <span className="text-red-500">*</span>
                </label>

                {loadingRespuestas ? (
                  <div className="text-sm text-gray-400 py-2">Cargando opciones...</div>
                ) : (
                  <div className="space-y-2">
                    {respuestasPredefinidas.map((resp) => {
                      const isSelected = respuestaSeleccionada?.id === resp.id;
                      return (
                        <button
                          key={resp.id}
                          type="button"
                          onClick={() => {
                            setRespuestaSeleccionada(resp);
                            setTextoOtros('');
                            setError(null);
                          }}
                          disabled={loading}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm text-left transition-all
                            ${isSelected
                              ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold shadow-sm'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50/40'
                            } disabled:opacity-50`}
                        >
                          <span>{resp.descripcion}</span>
                          {isSelected && <ChevronRight size={16} className="text-blue-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Campo libre solo para "Otros" */}
                {respuestaSeleccionada?.esOtros && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Detalle la respuesta <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={textoOtros}
                      onChange={(e) => setTextoOtros(e.target.value)}
                      placeholder="Escribe la respuesta o solución al problema..."
                      rows={4}
                      disabled={loading}
                      autoFocus
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !textoFinal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Respondiendo...' : 'Responder Ticket'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResponderTicketModal;
