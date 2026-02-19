import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Modal para responder un ticket de Mesa de Ayuda
 * Utilizado por personal de Mesa de Ayuda para responder tickets
 *
 * Props:
 * - isOpen: boolean - Si el modal está abierto
 * - onClose: function - Callback para cerrar el modal
 * - ticket: Object - Datos del ticket a responder
 * - usuario: Object - Datos del usuario actual (id, nombre)
 * - onSuccess: function - Callback cuando se responde exitosamente
 *
 * @version v1.64.0 (2026-02-18)
 */
function ResponderTicketModal({ isOpen, onClose, ticket, usuario, onSuccess }) {
  const [respuesta, setRespuesta] = useState('');
  const [estado, setEstado] = useState('RESUELTO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !ticket) return null;

  /**
   * Manejar submit del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validaciones
    if (!respuesta.trim()) {
      setError('La respuesta es requerida');
      return;
    }

    if (!estado) {
      setError('Debe seleccionar un estado');
      return;
    }

    setLoading(true);

    try {
      // Lazy import para evitar problemas de circular dependencies
      const { mesaAyudaService } = await import('../../../services/mesaAyudaService');

      const responderData = {
        respuesta: respuesta.trim(),
        estado: estado,
        idPersonalMesa: usuario?.id || null,
        nombrePersonalMesa: usuario?.nombre || null,
      };

      console.log('Respondiendo ticket:', ticket.id, responderData);
      const response = await mesaAyudaService.responderTicket(ticket.id, responderData);

      console.log('Ticket respondido exitosamente:', response.data);
      setSuccess(true);

      // Limpiar formulario
      setRespuesta('');
      setEstado('RESUELTO');

      // Cerrar después de 2 segundos si hay callback de éxito
      setTimeout(() => {
        onSuccess?.(response.data);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error respondiendo ticket:', err);
      setError(
        err.response?.data?.mensaje ||
        err.message ||
        'Error al responder el ticket. Intente nuevamente.'
      );
      setLoading(false);
    }
  };

  /**
   * Manejar cierre del modal
   */
  const handleClose = () => {
    if (!loading) {
      setRespuesta('');
      setEstado('RESUELTO');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  /**
   * Obtener color del badge según el estado
   */
  const getEstadoBadgeColor = (est) => {
    const colors = {
      NUEVO: 'bg-yellow-100 text-yellow-800',
      EN_PROCESO: 'bg-orange-100 text-orange-800',
      RESUELTO: 'bg-green-100 text-green-800',
    };
    return colors[est] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Obtener color del badge según la prioridad
   */
  const getPrioridadBadgeColor = (prio) => {
    const colors = {
      ALTA: 'bg-red-50 text-red-700 border-red-200',
      MEDIA: 'bg-orange-50 text-orange-700 border-orange-200',
      BAJA: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return colors[prio] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {ticket.titulo}
            </h2>
            <div className="flex gap-2 mt-2">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getEstadoBadgeColor(ticket.estado)}`}>
                {ticket.estado}
              </span>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getPrioridadBadgeColor(ticket.prioridad)}`}>
                {ticket.prioridad}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50 flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Detalles del Ticket */}
          <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Médico
              </label>
              <p className="text-sm text-gray-900">{ticket.nombreMedico || 'N/A'}</p>
            </div>

            {ticket.dniPaciente && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Paciente
                  </label>
                  <p className="text-sm text-gray-900">{ticket.nombrePaciente || 'N/A'}</p>
                  <p className="text-xs text-gray-600">DNI: {ticket.dniPaciente}</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    IPRESS
                  </label>
                  <p className="text-sm text-gray-900">{ticket.ipress || 'N/A'}</p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Fecha de Creación
              </label>
              <p className="text-sm text-gray-900">
                {new Date(ticket.fechaCreacion).toLocaleString('es-ES')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tiempo Abierto
              </label>
              <p className="text-sm text-gray-900">
                {ticket.horasDesdeCreacion} horas
              </p>
            </div>
          </div>

          {/* Descripción Original */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Descripción del Ticket
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {ticket.descripcion}
              </p>
            </div>
          </div>

          {/* Respuesta Anterior (si existe) */}
          {ticket.respuesta && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Respuesta Anterior
              </h3>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">
                {ticket.respuesta}
              </p>
              {ticket.nombrePersonalMesa && (
                <p className="text-xs text-blue-700 mt-2">
                  Por: {ticket.nombrePersonalMesa}
                </p>
              )}
            </div>
          )}

          {/* Mensajes de Error/Éxito */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">Ticket actualizado exitosamente</p>
            </div>
          )}

          {/* Formulario */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Estado */}
              <div>
                <label htmlFor="estado" className="block text-sm font-semibold text-gray-700 mb-2">
                  Cambiar Estado *
                </label>
                <select
                  id="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="RESUELTO">Resuelto</option>
                </select>
              </div>

              {/* Respuesta */}
              <div>
                <label htmlFor="respuesta" className="block text-sm font-semibold text-gray-700 mb-2">
                  Respuesta *
                </label>
                <textarea
                  id="respuesta"
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  placeholder="Escribe la respuesta o solución al problema..."
                  rows={6}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !respuesta.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
