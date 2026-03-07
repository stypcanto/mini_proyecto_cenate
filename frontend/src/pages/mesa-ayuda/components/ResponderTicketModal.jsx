import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Send, XCircle } from 'lucide-react';

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
function ResponderTicketModal({ isOpen, onClose, ticket, usuario, onSuccess, puedeAnular = false }) {
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


  // Estado para anular cita
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [motivosAnulacionList, setMotivosAnulacionList] = useState([]);
  const [anulando, setAnulando] = useState(false);
  const [errorAnular, setErrorAnular] = useState(null);
  const [citaAnulada, setCitaAnulada] = useState(false);

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

  // Mostrar botón de bolsa si tiene DNI: obligatorio para PS_CITA_REPROGRAMADA, opcional para el resto
  const tienePaciente = !!ticket?.dniPaciente;
  const bolsaObligatoria = esCitaReprogramada;
  const mostrarBotonBolsa = tienePaciente;

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

    // PS_CITA_REPROGRAMADA: enviar a bolsa es obligatorio antes de responder
    if (bolsaObligatoria && !yaEnviadoABolsa) {
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
      setShowAnularModal(false);
      setMotivoAnulacion('');
      setMotivosAnulacionList([]);
      setAnulando(false);
      setErrorAnular(null);
      setCitaAnulada(false);
      onClose();
    }
  };

  // Handler: Cerrar alerta ESSI y notificar éxito al padre
  const handleCerrarEssiAlert = () => {
    setShowEssiAlert(false);
    onSuccess?.(ticketRespondidoData);
    onClose();
  };

  // Cargar motivos de anulación
  const abrirModalAnular = async () => {
    setShowAnularModal(true);
    setErrorAnular(null);
    setMotivoAnulacion('');
    if (motivosAnulacionList.length === 0) {
      try {
        const { default: motivosAnulacionService } = await import('../../../services/motivosAnulacionService');
        const data = await motivosAnulacionService.obtenerActivos();
        setMotivosAnulacionList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando motivos anulación:', err);
      }
    }
  };

  // Handler: Confirmar anulación de cita
  const handleAnularCita = async () => {
    if (!motivoAnulacion.trim()) {
      setErrorAnular('Debe ingresar el motivo de anulación');
      return;
    }
    setAnulando(true);
    setErrorAnular(null);
    try {
      const { mesaAyudaService } = await import('../../../services/mesaAyudaService');
      await mesaAyudaService.anularCita(ticket.id, motivoAnulacion.trim());
      // Cerrar sub-modal, marcar cita como anulada y dejar el modal principal abierto
      setShowAnularModal(false);
      setCitaAnulada(true);
      setAnulando(false);
    } catch (err) {
      setErrorAnular(
        err.response?.data?.error ||
        err.message ||
        'Error al anular la cita. Intente nuevamente.'
      );
      setAnulando(false);
    }
  };

  const getEstadoBadgeColor = (est) => ({
    NUEVO:      'bg-amber-50 text-amber-700 border border-amber-200',
    EN_PROCESO: 'bg-orange-50 text-orange-700 border border-orange-200',
    RESUELTO:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  }[est] || 'bg-gray-100 text-gray-600 border border-gray-200');

  const getPrioridadBadgeColor = (prio) => ({
    ALTA:  'bg-red-50 text-red-700 border-red-200',
    MEDIA: 'bg-amber-50 text-amber-700 border-amber-200',
    BAJA:  'bg-sky-50 text-sky-700 border-sky-200',
  }[prio] || 'bg-gray-50 text-gray-600 border-gray-200');

  return (
    <>
      {/* Modal Principal */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/8 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">

          {/* Header azul sólido */}
          <div className="relative px-6 py-5 bg-[#0A5BA9] rounded-t-2xl">
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <X size={18} className="text-white" />
            </button>
            <div className="pr-12">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60 mb-1">Ticket de Soporte</p>
              <h2 className="text-[15px] font-bold text-white leading-snug">{ticket.titulo}</h2>
              <div className="flex gap-2 mt-2.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white">
                  {ticket.estado}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white">
                  {ticket.prioridad}
                </span>
              </div>
            </div>
          </div>

          {/* Cuerpo scrollable */}
          <div className="overflow-y-auto flex-1 bg-gray-50/50">
            <div className="px-6 py-5 space-y-4">

              {/* Tarjeta de información */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden text-sm">
                <div className="grid grid-cols-2 divide-x divide-gray-100">
                  <div className="px-4 py-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Médico</p>
                    <p className="font-semibold text-gray-900 leading-snug text-[13px]">{ticket.nombreMedico || '—'}</p>
                  </div>
                  {ticket.dniPaciente ? (
                    <div className="px-4 py-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Paciente</p>
                      <p className="font-semibold text-gray-900 leading-snug text-[13px]">{ticket.nombrePaciente || '—'}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 font-mono">DNI {ticket.dniPaciente}</p>
                    </div>
                  ) : <div className="px-4 py-3.5" />}
                </div>
                {ticket.dniPaciente && ticket.ipress && (
                  <div className="px-4 py-3.5 border-t border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">IPRESS</p>
                    <p className="font-semibold text-gray-900 text-[13px]">{ticket.ipress}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100 bg-gray-50/50">
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Creado</p>
                    <p className="text-gray-700 text-[12px]">{new Date(ticket.fechaCreacion).toLocaleString('es-ES')}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Tiempo abierto</p>
                    <p className="text-gray-700 text-[12px]">{ticket.horasDesdeCreacion} horas</p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 px-4 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Descripción del Ticket</p>
                <p className="text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed">{ticket.descripcion}</p>
              </div>

              {/* Respuesta anterior */}
              {ticket.respuesta && (
                <div className="bg-blue-50 rounded-xl ring-1 ring-blue-100 px-4 py-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1.5">Respuesta anterior</p>
                  <p className="text-[13px] text-blue-900 whitespace-pre-wrap leading-relaxed">{ticket.respuesta}</p>
                  {ticket.nombrePersonalMesa && (
                    <p className="text-[11px] text-blue-500 mt-1.5">Por: {ticket.nombrePersonalMesa}</p>
                  )}
                </div>
              )}

              {/* Alertas */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 ring-1 ring-red-100 rounded-xl">
                  <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-800">{error}</p>
                </div>
              )}
              {citaAnulada && (
                <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 ring-1 ring-emerald-100 rounded-xl">
                  <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-emerald-800">Cita anulada correctamente. Ahora selecciona una respuesta y cierra el ticket.</p>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 ring-1 ring-emerald-100 rounded-xl">
                  <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-emerald-800">Ticket actualizado exitosamente</p>
                </div>
              )}

              {/* Formulario */}
              {!success && (
                <form id="responder-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Estado */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                        Estado <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-gray-50 transition-colors"
                      >
                        <option value="EN_PROCESO">En Proceso</option>
                        <option value="RESUELTO">Resuelto</option>
                      </select>
                    </div>

                    {/* Respuesta predefinida — Autocomplete */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                        Respuesta <span className="text-red-400">*</span>
                      </label>
                      {loadingRespuestas ? (
                        <div className="text-[13px] text-gray-400 py-2.5">Cargando...</div>
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
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-gray-50 transition-colors"
                        >
                          <option value="">— Seleccionar respuesta —</option>
                          {respuestasPredefinidas.map((resp) => (
                            <option key={resp.id} value={resp.id}>{resp.descripcion}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Texto libre Otros */}
                  {respuestaSeleccionada?.esOtros && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                        Detalle la respuesta <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={textoOtros}
                        onChange={(e) => setTextoOtros(e.target.value)}
                        placeholder="Escribe la respuesta o solución al problema..."
                        rows={3}
                        disabled={loading}
                        autoFocus
                        className="w-full px-3 py-2.5 border border-blue-200 rounded-xl text-[13px] text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-gray-50 transition-colors resize-none"
                      />
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Footer fijo con todos los botones */}
          {!success && (
            <div className="px-6 py-4 border-t border-gray-100 bg-white rounded-b-2xl">
              {/* Aviso bolsa */}
              {mostrarBotonBolsa && !yaEnviadoABolsa && (
                <p className={`text-[11px] mb-3 ${bolsaObligatoria ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                  {bolsaObligatoria ? '⚠ Debe enviar a la Bolsa de Reprogramación antes de responder' : 'Opcional — solo si aplica reprogramación'}
                </p>
              )}
              {errorBolsa && <p className="text-[11px] text-red-500 mb-2">{errorBolsa}</p>}

              <div className="flex items-center gap-2">
                {/* Cancelar — izquierda */}
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-[13px] text-gray-500 font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>

                <div className="flex-1" />

                {/* Anular Cita — solo roles con permiso */}
                {tienePaciente && puedeAnular && (
                  <button
                    type="button"
                    onClick={abrirModalAnular}
                    disabled={loading || citaAnulada}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <XCircle size={13} />
                    {citaAnulada ? 'Cita anulada' : 'Anular cita'}
                  </button>
                )}

                {/* Enviar a Bolsa */}
                {mostrarBotonBolsa && (
                  <button
                    type="button"
                    onClick={handleEnviarABolsa}
                    disabled={yaEnviadoABolsa || enviandoBolsa || loading}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                      yaEnviadoABolsa
                        ? 'bg-emerald-500 text-white cursor-default'
                        : 'bg-[#0a5ba9] text-white hover:bg-[#084a8a] disabled:opacity-60 disabled:cursor-not-allowed'
                    }`}
                  >
                    {enviandoBolsa ? (
                      <><div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />Enviando...</>
                    ) : yaEnviadoABolsa ? (
                      <><CheckCircle size={13} />Enviado ✓</>
                    ) : (
                      <><Send size={13} />Enviar a Bolsa</>
                    )}
                  </button>
                )}

                {/* Responder Ticket — CTA principal */}
                <button
                  type="submit"
                  form="responder-form"
                  disabled={loading || !textoFinal || (bolsaObligatoria && !yaEnviadoABolsa)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-xl text-[13px] font-semibold hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading
                    ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando...</>
                    : 'Responder Ticket'}
                </button>
              </div>
            </div>
          )}
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

      {/* Modal Anular Cita */}
      {showAnularModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

            {/* Header rojo */}
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="text-white" size={24} />
                <div>
                  <h3 className="text-white font-bold text-base leading-tight">
                    Cancelar Cita
                  </h3>
                  <p className="text-red-200 text-xs mt-0.5">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAnularModal(false)}
                disabled={anulando}
                className="text-red-200 hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">

              {/* Tarjeta info paciente */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1.5 text-sm">
                {ticket.nombrePaciente && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Paciente</span>
                    <span className="text-gray-900 font-semibold text-right max-w-[55%]">
                      {ticket.nombrePaciente.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </div>
                )}
                {ticket.dniPaciente && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">DNI</span>
                    <span className="text-gray-900">{ticket.dniPaciente}</span>
                  </div>
                )}
                {ticket.especialidad && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Especialidad</span>
                    <span className="text-gray-900 text-right max-w-[55%]">{ticket.especialidad}</span>
                  </div>
                )}
                {ticket.nombreMedico && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Profesional</span>
                    <span className="text-gray-900 text-right max-w-[55%]">{ticket.nombreMedico}</span>
                  </div>
                )}
                {ticket.fechaAtencion && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Fecha/Hora</span>
                    <span className="text-gray-900">{ticket.fechaAtencion}</span>
                  </div>
                )}
                {ticket.ipress && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">IPRESS</span>
                    <span className="text-gray-900 text-right max-w-[55%]">{ticket.ipress}</span>
                  </div>
                )}
              </div>

              {/* Motivo anulación */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Motivo de anulación <span className="text-red-500">*</span>
                </label>
                {motivosAnulacionList.length > 0 ? (
                  <select
                    value={motivoAnulacion}
                    onChange={(e) => { setMotivoAnulacion(e.target.value); setErrorAnular(null); }}
                    disabled={anulando}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">-- Seleccione un motivo --</option>
                    {motivosAnulacionList.map((m) => (
                      <option key={m.id} value={m.descripcion}>{m.descripcion}</option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    value={motivoAnulacion}
                    onChange={(e) => { setMotivoAnulacion(e.target.value); setErrorAnular(null); }}
                    placeholder="Ingrese el motivo por el que se cancela la cita..."
                    rows={3}
                    disabled={anulando}
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:bg-gray-100 resize-none"
                  />
                )}
              </div>

              {errorAnular && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{errorAnular}</p>
                </div>
              )}

              <p className="text-xs text-gray-500 leading-relaxed">
                El paciente pasará al estado <span className="font-semibold">Anulado</span> en el sistema de bolsas y podrá ser reagendado posteriormente.
              </p>

              {/* Botones */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAnularModal(false)}
                  disabled={anulando}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleAnularCita}
                  disabled={anulando || !motivoAnulacion.trim()}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {anulando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Anulando...
                    </>
                  ) : (
                    <>
                      <XCircle size={15} />
                      Sí, anular cita
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ResponderTicketModal;
