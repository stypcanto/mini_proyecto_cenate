import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// ============================================================
// Mapeo automático: motivo → prioridad
// Se evalúa en orden: ALTA → MEDIA → BAJA (fallback MEDIA)
// ============================================================
const REGLAS_PRIORIDAD = [
  {
    prioridad: 'ALTA',
    keywords: [
      'deserci',           // evitar deserción
      'actualizar listado',
      'drive',
      'essi',
      'citar paciente adicional',
      'licenciado solicita citar',
    ],
  },
  {
    prioridad: 'MEDIA',
    keywords: [
      'programaci',        // programación de cita adicional
      'env\u00edo de im\u00e1genes', // envío de imágenes
      'envio de imagenes',
      'resultados del paciente',
      'eliminar paciente excedente',
    ],
  },
  {
    prioridad: 'BAJA',
    keywords: [
      'mensaje nro',
      'acto medico',
      'acto m\u00e9dico',
      'receta',
      'referencia',
      'laboratorio',
      'examenes',
      'ex\u00e1menes',
    ],
  },
];

function inferirPrioridad(descripcion) {
  if (!descripcion) return 'MEDIA';
  const lower = descripcion.toLowerCase();
  for (const regla of REGLAS_PRIORIDAD) {
    if (regla.keywords.some((kw) => lower.includes(kw))) {
      return regla.prioridad;
    }
  }
  return 'MEDIA';
}

const PRIORIDAD_CONFIG = {
  ALTA:  { label: 'Alta',  color: 'bg-red-100 text-red-700 border-red-300',    dot: 'bg-red-500' },
  MEDIA: { label: 'Media', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', dot: 'bg-yellow-500' },
  BAJA:  { label: 'Baja',  color: 'bg-green-100 text-green-700 border-green-300',  dot: 'bg-green-500' },
};

/**
 * Modal para crear un ticket de Mesa de Ayuda (v1.64.0)
 * Utilizado desde MisPacientes cuando el médico quiere solicitar ayuda
 *
 * CAMBIOS v1.64.0:
 * - Combo de motivos predefinidos (requerido)
 * - Título se auto-genera desde el motivo seleccionado
 * - Campo "Observaciones" reemplaza a "Descripción" (ahora opcional)
 * - Carga dinámicamente los motivos desde el backend
 *
 * Props:
 * - isOpen: boolean - Si el modal está abierto
 * - onClose: function - Callback para cerrar el modal
 * - medico: Object - Datos del médico actual { id, nombre, especialidad }
 * - paciente: Object - Datos del paciente seleccionado { dni, nombre, especialidad, ipress, idSolicitudBolsa }
 * - onSuccess: function - Callback cuando se crea el ticket exitosamente
 *
 * @version v1.64.0 (2026-02-18)
 */
function CrearTicketModal({ isOpen, onClose, medico, paciente, onSuccess }) {
  const [idMotivo, setIdMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [prioridad, setPrioridad] = useState('MEDIA');
  const [motivos, setMotivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMotivos, setLoadingMotivos] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [ticketCreado, setTicketCreado] = useState(null);
  const [siguienteNumero, setSiguienteNumero] = useState(null);

  // ✅ v1.64.0: Cargar motivos y siguiente número al abrir el modal
  // ✅ v1.67.0: Reset completo del estado al reabrir para evitar mostrar éxito previo
  useEffect(() => {
    if (isOpen) {
      setIdMotivo('');
      setObservaciones('');
      setPrioridad('MEDIA');
      setError(null);
      setSuccess(false);
      setTicketCreado(null);
      setLoading(false);
      cargarMotivos();
      cargarSiguienteNumero();
    }
  }, [isOpen]);

  /**
   * Cargar motivos del backend
   */
  const cargarMotivos = async () => {
    setLoadingMotivos(true);
    try {
      const { mesaAyudaService } = await import('../../../services/mesaAyudaService');
      const motivosData = await mesaAyudaService.obtenerMotivos();
      console.log('✅ Motivos cargados:', motivosData);
      setMotivos(Array.isArray(motivosData) ? motivosData : []);
    } catch (err) {
      console.error('❌ Error cargando motivos:', err);
      setError('Error al cargar los motivos disponibles');
      setMotivos([]);
    } finally {
      setLoadingMotivos(false);
    }
  };

  /**
   * Cargar preview del siguiente número de ticket
   */
  const cargarSiguienteNumero = async () => {
    try {
      const { mesaAyudaService } = await import('../../../services/mesaAyudaService');
      const data = await mesaAyudaService.obtenerSiguienteNumero();
      setSiguienteNumero(data?.siguienteNumero || null);
    } catch (err) {
      console.error('Error cargando siguiente número:', err);
      setSiguienteNumero(null);
    }
  };

  if (!isOpen) return null;

  /**
   * Obtener descripción del motivo seleccionado (para mostrar como título)
   */
  const getMotivoSeleccionado = () => {
    if (!idMotivo) return null;
    return motivos.find(m => m.id == idMotivo);
  };

  /**
   * Manejar submit del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validaciones
    if (!idMotivo) {
      setError('Debe seleccionar un motivo de solicitud');
      return;
    }

    const motivoSeleccionado = getMotivoSeleccionado();
    if (!motivoSeleccionado) {
      setError('Motivo no encontrado');
      return;
    }

    setLoading(true);

    try {
      // Lazy import para evitar problemas de circular dependencies
      const { mesaAyudaService } = await import('../../../services/mesaAyudaService');

      // ✅ v1.64.0: El título se auto-genera desde la descripción del motivo
      const obs = observaciones.trim();
      const ticketData = {
        idMotivo: parseInt(idMotivo),
        titulo: motivoSeleccionado.descripcion, // Auto-generado desde motivo
        descripcion: obs || motivoSeleccionado.descripcion, // Usar observaciones o título como fallback
        observaciones: obs, // Observaciones opcionales
        prioridad: prioridad,
        idMedico: medico.id ? Number(medico.id) : null,
        nombreMedico: medico.nombre,
        idSolicitudBolsa: paciente?.idSolicitudBolsa || null,
        tipoDocumento: paciente?.tipoDocumento || 'DNI',
        dniPaciente: paciente?.dni || null,
        nombrePaciente: paciente?.nombre || null,
        especialidad: medico.especialidad || null,
        ipress: paciente?.ipress || null,
        telefonoPaciente: paciente?.telefono || null,
      };

      console.log('✅ v1.64.0: Creando ticket con motivo:', ticketData);
      const response = await mesaAyudaService.crearTicket(ticketData);

      console.log('✅ Ticket creado exitosamente:', response.data);
      setTicketCreado(response.data);
      setSuccess(true);

      // Limpiar formulario
      setIdMotivo('');
      setObservaciones('');
      setPrioridad('MEDIA');

      // Cerrar después de 2 segundos si hay callback de éxito
      setTimeout(() => {
        onSuccess?.(response.data);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('❌ Error creando ticket:', err);
      setError(
        err.response?.data?.mensaje ||
        err.message ||
        'Error al crear el ticket. Intente nuevamente.'
      );
      setLoading(false);
    }
  };

  /**
   * Manejar cierre del modal
   */
  const handleClose = () => {
    if (!loading) {
      setIdMotivo('');
      setObservaciones('');
      setPrioridad('MEDIA');
      setError(null);
      setSuccess(false);
      setTicketCreado(null);
      setSiguienteNumero(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Crear un Nuevo Ticket a Mesa de Ayuda
            </h2>
            {siguienteNumero && (
              <p className="text-sm text-gray-500 mt-1">
                Ticket N.° <span className="font-mono font-semibold text-blue-600">{siguienteNumero}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Información del Médico y Paciente (ReadOnly) */}
          <div className="grid grid-cols-2 gap-4 mb-6 bg-blue-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Médico
              </label>
              <p className="text-sm text-gray-900">{medico?.nombre || 'N/A'}</p>
              <p className="text-xs text-gray-600">
                {medico?.especialidad || 'Especialidad no especificada'}
              </p>
            </div>

            {paciente && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Paciente
                  </label>
                  <p className="text-sm text-gray-900">{paciente.nombre}</p>
                  <p className="text-xs text-gray-600">DNI: {paciente.dni}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    ID Solicitud Bolsa
                  </label>
                  <p className="text-sm text-gray-900 font-mono font-bold">{paciente.idSolicitudBolsa || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    IPRESS
                  </label>
                  <p className="text-sm text-gray-900">{paciente.ipress || 'N/A'}</p>
                </div>
              </>
            )}
          </div>

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
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">✅ Ticket creado exitosamente</p>
                {ticketCreado?.numeroTicket && (
                  <p className="text-xs">Número de Ticket: <span className="font-mono font-bold text-green-700">{ticketCreado.numeroTicket}</span></p>
                )}
              </div>
            </div>
          )}

          {/* Formulario */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Motivos - Combo */}
              <div>
                <label htmlFor="idMotivo" className="block text-sm font-semibold text-gray-700 mb-2">
                  Solicitud a Mesa de Ayuda *
                </label>
                {loadingMotivos ? (
                  <div className="flex items-center gap-2 p-2 text-gray-600">
                    <Loader size={16} className="animate-spin" />
                    <span>Cargando motivos...</span>
                  </div>
                ) : (
                  <select
                    id="idMotivo"
                    value={idMotivo}
                    onChange={(e) => {
                      const nuevoId = e.target.value;
                      setIdMotivo(nuevoId);
                      // Auto-asignar prioridad según descripción del motivo
                      const motivoEncontrado = motivos.find(m => m.id == nuevoId);
                      setPrioridad(inferirPrioridad(motivoEncontrado?.descripcion || ''));
                    }}
                    disabled={loading || loadingMotivos}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">-- Selecciona un motivo --</option>
                    {motivos.map((motivo) => (
                      <option key={motivo.id} value={motivo.id}>
                        {motivo.descripcion}
                      </option>
                    ))}
                  </select>
                )}
              </div>


              {/* Observaciones */}
              <div>
                <label htmlFor="observaciones" className="block text-sm font-semibold text-gray-700 mb-2">
                  Observaciones (Opcional)
                </label>
                <textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Agrega detalles adicionales sobre tu solicitud..."
                  rows={4}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* Prioridad (auto-asignada, solo lectura) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prioridad
                  <span className="ml-2 text-xs font-normal text-gray-400">(asignada automáticamente según el motivo)</span>
                </label>
                {idMotivo ? (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold ${PRIORIDAD_CONFIG[prioridad]?.color}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${PRIORIDAD_CONFIG[prioridad]?.dot}`} />
                    {PRIORIDAD_CONFIG[prioridad]?.label}
                  </div>
                ) : (
                  <div className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm">
                    Se asignará al seleccionar un motivo
                  </div>
                )}
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
                  disabled={loading || !idMotivo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creando...' : 'Crear Ticket'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrearTicketModal;
