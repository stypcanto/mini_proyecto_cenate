import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Send } from 'lucide-react';

/**
 * Modal para responder un ticket de Mesa de Ayuda
 * Muestra respuestas predefinidas como chips seleccionables.
 * Solo cuando se elige "Otros" se habilita el campo de texto libre.
 *
 * Funcionalidades especiales (v1.68.0):
 * - PS_CITA_REPROGRAMADA: Botón "Enviar a Bolsa de Reprogramación" (obligatorio antes de responder)
 * - PS_ELIMINAR_EXCEDENTE + PS_CITA_REPROGRAMADA: Alerta ESSI tras responder exitosamente
 *
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - ticket: Object (incluye codigoMotivo, idMotivo)
 * - usuario: Object
 * - onSuccess: function
 *
 * @version v1.68.0 (2026-02-20)
 */
function ResponderTicketModal({ isOpen, onClose, ticket, usuario, onSuccess }) {
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [textoOtros, setTextoOtros] = useState('');
  const [estado, setEstado] = useState('RESUELTO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [respuestasPredefinidas, setRespuestasPredefinidas] = useState([]);
  const [loadingRespuestas, setLoadingRespuestas] = useState(false);

  // Estado para la lógica de Bolsa + ESSI
  const [yaEnviadoABolsa, setYaEnviadoABolsa] = useState(false);
  const [enviandoBolsa, setEnviandoBolsa] = useState(false);
  const [errorBolsa, setErrorBolsa] = useState(null);
  const [showEssiAlert, setShowEssiAlert] = useState(false);
  const [ticketRespondidoData, setTicketRespondidoData] = useState(null);

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

  // Detección de motivo especial (usa codigoMotivo si está disponible, con fallback a idMotivo)
  const esEliminarExcedente =
    ticket?.codigoMotivo === 'PS_ELIMINAR_EXCEDENTE' || ticket?.idMotivo === 4;
  const esCitaReprogramada =
    ticket?.codigoMotivo === 'PS_CITA_REPROGRAMADA' || ticket?.idMotivo === 8;
  const mostrarAlertaESSI = esEliminarExcedente || esCitaReprogramada;

  // Texto final a enviar
  const textoFinal = respuestaSeleccionada?.esOtros
    ? textoOtros.trim()
    : respuestaSeleccionada?.descripcion || '';

  // Handler: Enviar paciente a Bolsa de Reprogramación
  const handleEnviarABolsa = async () => {
    if (yaEnviadoABolsa || enviandoBolsa) return;
    setEnviandoBolsa(true);
    setErrorBolsa(null);
    try {
      const { mesaAyudaService } = await import('../../../services/mesaAyudaService');
      await mesaAyudaService.enviarABolsaReprogramacion(ticket.id);
      setYaEnviadoABolsa(true);
    } catch (err) {
      setErrorBolsa(
        err.response?.data?.error ||
        err.message ||
        'Error al enviar a la bolsa. Intente nuevamente.'
      );
    } finally {
      setEnviandoBolsa(false);
    }
  };

  // Handler: Responder ticket
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

    // PS_CITA_REPROGRAMADA requiere enviar a bolsa primero
    if (esCitaReprogramada && !yaEnviadoABolsa) {
      setError('Debe enviar al paciente a la Bolsa de Reprogramación antes de responder el ticket');
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
      setTicketRespondidoData(response?.data || response);

      setTimeout(() => {
        if (mostrarAlertaESSI) {
          // Mostrar alerta ESSI antes de cerrar
          setShowEssiAlert(true);
          setLoading(false);
        } else {
          onSuccess?.(response?.data || response);
          onClose();
        }
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        err.message ||
        'Error al responder el ticket. Intente nuevamente.'
      );
      setLoading(false);
    }
  };

  // Handler: Cerrar modal (también resetea estados de bolsa/ESSI)
  const handleClose = () => {
    if (!loading) {
      setRespuestaSeleccionada(null);
      setTextoOtros('');
      setEstado('RESUELTO');
      setError(null);
      setSuccess(false);
      setYaEnviadoABolsa(false);
      setEnviandoBolsa(false);
      setErrorBolsa(null);
      setShowEssiAlert(false);
      setTicketRespondidoData(null);
      onClose();
    }
  };

  // Handler: Cerrar alerta ESSI y notificar éxito al padre
  const handleCerrarEssiAlert = () => {
    setShowEssiAlert(false);
    onSuccess?.(ticketRespondidoData);
    onClose();
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
    <>
      {/* Modal Principal */}
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

            {/* Mensajes de estado */}
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
                    <select
                      value={respuestaSeleccionada?.id ?? ''}
                      onChange={(e) => {
                        const selected = respuestasPredefinidas.find(r => r.id === Number(e.target.value));
                        setRespuestaSeleccionada(selected || null);
                        setTextoOtros('');
                        setError(null);
                      }}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">-- Seleccione una respuesta --</option>
                      {respuestasPredefinidas.map((resp) => (
                        <option key={resp.id} value={resp.id}>
                          {resp.descripcion}
                        </option>
                      ))}
                    </select>
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

                {/* Botones de acción */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">

                  {/* Botón Bolsa Reprogramación (solo PS_CITA_REPROGRAMADA) */}
                  <div className="flex flex-col gap-1">
                    {esCitaReprogramada && (
                      <>
                        <button
                          type="button"
                          onClick={handleEnviarABolsa}
                          disabled={yaEnviadoABolsa || enviandoBolsa || loading}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            yaEnviadoABolsa
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-default'
                              : 'bg-[#0a5ba9] text-white hover:bg-[#084a8a] disabled:opacity-60 disabled:cursor-not-allowed'
                          }`}
                        >
                          {enviandoBolsa ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Enviando...
                            </>
                          ) : yaEnviadoABolsa ? (
                            <>
                              <CheckCircle size={15} />
                              Enviado a la Bolsa ✓
                            </>
                          ) : (
                            <>
                              <Send size={15} />
                              Enviar a la Bolsa de Reprogramación
                            </>
                          )}
                        </button>
                        {errorBolsa && (
                          <p className="text-xs text-red-600">{errorBolsa}</p>
                        )}
                        {!yaEnviadoABolsa && (
                          <p className="text-xs text-amber-600 font-medium">
                            ⚠️ Requerido antes de responder el ticket
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Cancelar + Responder */}
                  <div className="flex gap-3 ml-auto">
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
                      disabled={loading || !textoFinal || (esCitaReprogramada && !yaEnviadoABolsa)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Respondiendo...' : 'Responder Ticket'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modal Alerta ESSI (aparece sobre el modal principal) */}
      {showEssiAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

            {/* Header */}
            <div className="bg-amber-500 px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-white" size={26} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">
                  Acción requerida en ESSI
                </h3>
                <p className="text-amber-100 text-sm mt-0.5">
                  El ticket fue respondido exitosamente
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-900 font-semibold text-sm leading-snug mb-2">
                  ⚠️ No olvides eliminar a este paciente del ESSI
                </p>
                {ticket.nombrePaciente && (
                  <div className="flex flex-col gap-0.5">
                    <p className="text-amber-800 text-sm">
                      Paciente: <span className="font-semibold">{ticket.nombrePaciente}</span>
                    </p>
                    {ticket.dniPaciente && (
                      <p className="text-amber-700 text-xs">DNI: {ticket.dniPaciente}</p>
                    )}
                  </div>
                )}
                <p className="text-amber-700 text-xs mt-2 leading-relaxed">
                  Para completar el proceso correctamente, asegúrate de ingresar al sistema ESSI
                  y eliminar al paciente de la lista correspondiente.
                </p>
              </div>

              <button
                onClick={handleCerrarEssiAlert}
                className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600 transition-colors"
              >
                Entendido, procederé en el ESSI
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ResponderTicketModal;
