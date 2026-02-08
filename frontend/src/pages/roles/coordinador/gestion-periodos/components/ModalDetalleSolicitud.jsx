// src/pages/coordinador/turnos/components/ModalDetalleSolicitud.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  Mail,
  Phone,
  Hash,
  MapPin,
  ClipboardList,
  Loader2,
  MessageSquare,
  Edit,
  Save,
  Search,
  Filter,
  CheckCheck,
  XOctagon,
  Calendar,
  Download,
  Stethoscope,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";
import { chipDay, fmtDateTime, yesNoPill, TeleIcon } from "../utils/ui";
import { solicitudTurnosService } from "../../../../../services/solicitudTurnosService";
import { exportarSolicitudesAExcel, exportarSolicitudCompleta, exportarEspecialidadesAExcel } from "../utils/exportarExcel";
import Tooltip from "../../../../../components/ui/Tooltip";
import styles from "./ModalDetalleSolicitud.module.css";

export default function ModalDetalleSolicitud({
  loading,
  solicitud,
  onClose,
  onAprobar,
  onRechazar,
  getEstadoBadge,
  prefillRechazo = false,
  onRecargarDetalle,
}) {
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [showRechazoForm, setShowRechazoForm] = useState(prefillRechazo);
  const [observacionesDetalle, setObservacionesDetalle] = useState({});
  const [modalObservacion, setModalObservacion] = useState({ show: false, detalle: null, observacion: "" });
  const [modalAccion, setModalAccion] = useState({ show: false, tipo: null, detalle: null, observacion: "" });
  const [modalAccionMasiva, setModalAccionMasiva] = useState({ show: false, tipo: null, detalles: [], observacion: "" });
  const [modalFechas, setModalFechas] = useState({ show: false, detalle: null });
  const [modalCalendario, setModalCalendario] = useState(false);
  const [busquedaEspecialidad, setBusquedaEspecialidad] = useState("");
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [mostrarAccionesMasivas, setMostrarAccionesMasivas] = useState(false);
  const modalRef = useRef(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(busquedaEspecialidad);
    }, 300);

    return () => clearTimeout(timer);
  }, [busquedaEspecialidad]);

  // Handle ESC key and focus management
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Focus modal on open
    if (modalRef.current) {
      modalRef.current.focus();
    }

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  useEffect(() => {
    setShowRechazoForm(prefillRechazo);
    setMotivoRechazo("");
    setSeleccionadas(new Set());
    // Inicializar observaciones con las existentes
    if (solicitud?.detalles) {
      const obs = {};
      solicitud.detalles.forEach(d => {
        obs[d.idDetalle] = d.observacion || "";
      });
      setObservacionesDetalle(obs);
    }
  }, [prefillRechazo, solicitud?.idSolicitud, solicitud?.detalles]);

  const abrirModalObservacion = (detalle, soloLectura = false) => {
    setModalObservacion({
      show: true,
      detalle: detalle,
      observacion: observacionesDetalle[detalle.idDetalle] || "",
      soloLectura: soloLectura
    });
  };

  const cerrarModalObservacion = () => {
    setModalObservacion({ show: false, detalle: null, observacion: "" });
  };

  const abrirModalAprobarDetalle = (detalle) => {
    setModalAccion({
      show: true,
      tipo: 'aprobar',
      detalle: detalle,
      observacion: observacionesDetalle[detalle.idDetalle] || ""
    });
  };

  const abrirModalRechazarDetalle = (detalle) => {
    setModalAccion({
      show: true,
      tipo: 'rechazar',
      detalle: detalle,
      observacion: observacionesDetalle[detalle.idDetalle] || ""
    });
  };

  const cerrarModalAccion = () => {
    setModalAccion({ show: false, tipo: null, detalle: null, observacion: "" });
  };

  const abrirModalAprobarMasivo = (detalles) => {
    setModalAccionMasiva({
      show: true,
      tipo: 'aprobar',
      detalles: detalles,
      observacion: ""
    });
  };

  const abrirModalRechazarMasivo = (detalles) => {
    setModalAccionMasiva({
      show: true,
      tipo: 'rechazar',
      detalles: detalles,
      observacion: ""
    });
  };

  const cerrarModalAccionMasiva = () => {
    setModalAccionMasiva({ show: false, tipo: null, detalles: [], observacion: "" });
  };

  const guardarObservacion = async () => {
    if (modalObservacion.detalle) {
      try {
        await solicitudTurnosService.actualizarObservacionDetalle(
          modalObservacion.detalle.idDetalle, 
          modalObservacion.observacion
        );
        setObservacionesDetalle(prev => ({
          ...prev,
          [modalObservacion.detalle.idDetalle]: modalObservacion.observacion
        }));
        cerrarModalObservacion();
        alert("Observación guardada exitosamente");
      } catch (error) {
        console.error("Error al guardar observación:", error);
        alert("Error al guardar la observación. Intente nuevamente.");
      }
    }
  };

  const handleObservacionChange = (idDetalle, value) => {
    setObservacionesDetalle(prev => ({
      ...prev,
      [idDetalle]: value
    }));
  };

  const handleAprobarDetalle = async (detalle) => {
    if (!window.confirm(`¿Aprobar especialidad ${detalle.nombreServicio}?`)) return;
    const obs = observacionesDetalle[detalle.idDetalle] || "";
    try {
      await solicitudTurnosService.aprobarDetalle(detalle.idDetalle, obs);
      alert("Especialidad aprobada exitosamente");
      // Recargar detalles actualizados
      window.location.reload(); // O mejor, recargar solo el detalle
    } catch (error) {
      console.error("Error al aprobar detalle:", error);
      alert("Error al aprobar la especialidad. Intente nuevamente.");
    }
  };

  const handleRechazarDetalle = async (detalle) => {
    const obs = observacionesDetalle[detalle.idDetalle] || "";
    if (!obs.trim()) {
      alert("Debe ingresar una observación para rechazar la especialidad");
      return;
    }
    if (!window.confirm(`¿Rechazar especialidad ${detalle.nombreServicio}?`)) return;
    try {
      await solicitudTurnosService.rechazarDetalle(detalle.idDetalle, obs);
      alert("Especialidad rechazada exitosamente");
      // Recargar detalles actualizados
      window.location.reload(); // O mejor, recargar solo el detalle
    } catch (error) {
      console.error("Error al rechazar detalle:", error);
      alert("Error al rechazar la especialidad. Intente nuevamente.");
    }
  };

  const confirmarAccionDetalle = async () => {
    const { tipo, detalle, observacion } = modalAccion;
    
    if (tipo === 'rechazar' && !observacion.trim()) {
      alert("Debe ingresar una observación para rechazar la especialidad");
      return;
    }

    try {
      if (tipo === 'aprobar') {
        await solicitudTurnosService.aprobarDetalle(detalle.idDetalle, observacion);
        alert("Especialidad aprobada exitosamente");
      } else {
        await solicitudTurnosService.rechazarDetalle(detalle.idDetalle, observacion);
        alert("Especialidad rechazada exitosamente");
      }
      cerrarModalAccion();
      // Recargar detalles actualizados sin cerrar modal
      if (onRecargarDetalle) {
        await onRecargarDetalle(solicitud.idSolicitud);
      }
    } catch (error) {
      console.error(`Error al ${tipo} detalle:`, error);
      alert(`Error al ${tipo === 'aprobar' ? 'aprobar' : 'rechazar'} la especialidad. Intente nuevamente.`);
    }
  };

  const confirmarAccionMasiva = async () => {
    const { tipo, detalles, observacion } = modalAccionMasiva;
    
    if (tipo === 'rechazar' && !observacion.trim()) {
      alert("Debe ingresar una observación para rechazar las especialidades");
      return;
    }

    if (!window.confirm(`¿Está seguro de ${tipo === 'aprobar' ? 'aprobar' : 'rechazar'} ${detalles.length} especialidad(es)?`)) {
      return;
    }

    try {
      let exitosas = 0;
      let fallidas = 0;

      for (const detalle of detalles) {
        try {
          if (tipo === 'aprobar') {
            await solicitudTurnosService.aprobarDetalle(detalle.idDetalle, observacion);
          } else {
            await solicitudTurnosService.rechazarDetalle(detalle.idDetalle, observacion);
          }
          exitosas++;
        } catch (error) {
          console.error(`Error al ${tipo} detalle ${detalle.idDetalle}:`, error);
          fallidas++;
        }
      }

      alert(`Proceso completado:\n✔️ ${exitosas} exitosa(s)\n❌ ${fallidas} fallida(s)`);
      cerrarModalAccionMasiva();
      setSeleccionadas(new Set());
      
      // Recargar detalles actualizados
      if (onRecargarDetalle) {
        await onRecargarDetalle(solicitud.idSolicitud);
      }
    } catch (error) {
      console.error(`Error en acción masiva:`, error);
      alert(`Error al procesar las especialidades. Intente nuevamente.`);
    }
  };

  const isEnviado = solicitud?.estado === "ENVIADO";
  
  // Deduplicar detalles por idDetalle (fix para backend que envía duplicados)
  const detalles = useMemo(() => {
    if (!Array.isArray(solicitud?.detalles)) return [];
    
    const detallesUnicos = new Map();
    solicitud.detalles.forEach(detalle => {
      if (detalle.idDetalle && !detallesUnicos.has(detalle.idDetalle)) {
        detallesUnicos.set(detalle.idDetalle, detalle);
      }
    });
    
    return Array.from(detallesUnicos.values());
  }, [solicitud?.detalles]);

  // Estadísticas y filtrado
  const estadisticas = useMemo(() => {
    const pendientes = detalles.filter(d => !d.estado || d.estado === 'PENDIENTE').length;
    const asignados = detalles.filter(d => d.estado === 'ASIGNADO').length;
    const noProcede = detalles.filter(d => d.estado === 'NO PROCEDE').length;
    return { pendientes, asignados, noProcede, total: detalles.length };
  }, [detalles]);

  const detallesFiltrados = useMemo(() => {
    let resultado = detalles;

    // Filtro por búsqueda (use debouncedBusqueda)
    if (debouncedBusqueda.trim()) {
      const busqueda = debouncedBusqueda.toLowerCase();
      resultado = resultado.filter(d =>
        (d.nombreServicio || d.nombreEspecialidad || "").toLowerCase().includes(busqueda) ||
        (d.codigoServicio || d.codServicio || "").toLowerCase().includes(busqueda)
      );
    }

    // Filtro por estado
    if (filtroEstado !== "TODOS") {
      resultado = resultado.filter(d => {
        const estado = d.estado || 'PENDIENTE';
        return estado === filtroEstado;
      });
    }

    return resultado;
  }, [detalles, debouncedBusqueda, filtroEstado]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto overflow-x-hidden focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-4 py-2.5 sticky top-0 bg-cenate-600 rounded-t-lg z-10 border-b border-cenate-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0 p-1.5 bg-white/15 rounded-lg">
                <ClipboardList className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="modal-title" className="text-base font-bold text-white truncate">
                  Detalle de Solicitud
                </h3>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-xs text-cenate-100 font-medium truncate">{solicitud?.nombreIpress ?? "Cargando..."}</span>
                  {solicitud?.estado && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-block ${getEstadoBadge(solicitud.estado)}`}>
                      {solicitud.estado}
                    </span>
                  )}
                  {solicitud?.periodoDescripcion && (
                    <span className="text-[10px] text-cenate-200">• {solicitud.periodoDescripcion}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex-shrink-0 text-white bg-white/20 hover:bg-white/30 rounded-lg p-1.5 transition-all hover:scale-110"
              aria-label="Cerrar modal"
              title="Cerrar (ESC)"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 space-y-2.5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : !solicitud ? (
            <div className="p-6 text-center text-sm text-gray-500">No hay datos para mostrar.</div>
          ) : (
            <>
              {/* Cards de Información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {/* Card RESUMEN */}
                <div className="bg-white rounded-lg border-2 border-cenate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-2.5 border-b border-cenate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-cenate-100 rounded">
                        <BarChart3 className="w-4 h-4 text-cenate-600" />
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Resumen</h3>
                    </div>
                  </div>
                  <div className="p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-cenate-600" />
                        <span className="text-xs text-gray-700 font-medium">Especialidades</span>
                      </div>
                      <span className="text-lg font-bold text-cenate-600">{solicitud.totalEspecialidades ?? detalles.length}</span>
                    </div>
                    <div className="h-px bg-cenate-100"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cenate-600" />
                        <span className="text-xs text-gray-700 font-medium">Turnos</span>
                      </div>
                      <span className="text-lg font-bold text-cenate-600">{solicitud.totalTurnosSolicitados ?? "—"}</span>
                    </div>
                    <div className="h-px bg-cenate-100"></div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <ClipboardCheck className="w-3.5 h-3.5 text-cenate-600" />
                        <span className="text-[10px] font-semibold text-gray-600 uppercase">Período</span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 ml-5">{solicitud.periodoDescripcion}</p>
                      <p className="text-[10px] text-gray-500 ml-5">{solicitud.periodo} • ID: {solicitud.idPeriodo}</p>
                    </div>
                  </div>
                </div>

                {/* Card FECHAS */}
                <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-2.5 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 rounded">
                        <Clock className="w-4 h-4 text-gray-700" />
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Registros</h3>
                    </div>
                  </div>
                  <div className="p-2.5 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] text-gray-500 font-semibold uppercase mb-0.5">Creación</p>
                        <p className="text-xs font-semibold text-gray-900">{fmtDateTime(solicitud.fechaCreacion ?? solicitud.createdAt)}</p>
                      </div>
                      <div className="w-2 h-2 bg-cenate-500 rounded-full flex-shrink-0 mt-0.5"></div>
                    </div>
                    <div className="h-px bg-gray-100"></div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] text-gray-500 font-semibold uppercase mb-0.5">Actualización</p>
                        <p className="text-xs font-semibold text-gray-900">{fmtDateTime(solicitud.fechaActualizacion ?? solicitud.updatedAt)}</p>
                      </div>
                      <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-0.5"></div>
                    </div>
                    <div className="h-px bg-gray-100"></div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] text-gray-500 font-semibold uppercase mb-0.5">Envío</p>
                        <p className="text-xs font-semibold text-gray-900">{fmtDateTime(solicitud.fechaEnvio)}</p>
                      </div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso y estadísticas */}
              <div className="rounded-lg border-2 border-cenate-100 bg-white p-2.5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Progreso de Revisión</h4>
                  <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    {estadisticas.asignados + estadisticas.noProcede} de {estadisticas.total} procesadas
                  </span>
                </div>

                <div className="space-y-1 mb-2.5">
                  <div className="flex gap-1.5 items-center text-[10px]">
                    <div className="font-semibold text-emerald-700 min-w-fit">Asignadas</div>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 bg-emerald-500"
                        style={{ width: `${estadisticas.total > 0 ? (estadisticas.asignados / estadisticas.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="font-bold text-gray-700">{estadisticas.asignados}</span>
                  </div>
                  <div className="flex gap-1.5 items-center text-[10px]">
                    <div className="font-semibold text-red-700 min-w-fit">No procede</div>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 bg-red-500"
                        style={{ width: `${estadisticas.total > 0 ? (estadisticas.noProcede / estadisticas.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="font-bold text-gray-700">{estadisticas.noProcede}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setFiltroEstado('PENDIENTE')}
                    className={`rounded px-2 py-1.5 text-center font-semibold transition-all cursor-pointer border-2 ${
                      filtroEstado === 'PENDIENTE'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="text-[9px] font-medium opacity-75">Pendientes</div>
                    <div className="text-sm font-bold">{estadisticas.pendientes}</div>
                  </button>
                  <button
                    onClick={() => setFiltroEstado('ASIGNADO')}
                    className={`rounded px-2 py-1.5 text-center font-semibold transition-all cursor-pointer border-2 ${
                      filtroEstado === 'ASIGNADO'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    <div className="text-[9px] font-medium opacity-75">Asignadas</div>
                    <div className="text-sm font-bold">{estadisticas.asignados}</div>
                  </button>
                  <button
                    onClick={() => setFiltroEstado('NO PROCEDE')}
                    className={`rounded px-2 py-1.5 text-center font-semibold transition-all cursor-pointer border-2 ${
                      filtroEstado === 'NO PROCEDE'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'
                    }`}
                  >
                    <div className="text-[9px] font-medium opacity-75">No procede</div>
                    <div className="text-sm font-bold">{estadisticas.noProcede}</div>
                  </button>
                </div>
              </div>

              {/* Botón Ver Calendario */}
              {detalles.some(d => d.fechasDetalle && d.fechasDetalle.length > 0) && (
                <div className="rounded-lg border-2 border-cenate-200 bg-cenate-50 p-2">
                  <button
                    onClick={() => setModalCalendario(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-cenate-600 text-white text-xs font-semibold rounded hover:bg-cenate-700 transition-all hover:shadow-md"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Ver Calendario del Período
                  </button>
                </div>
              )}

              {/* Acciones masivas - Solo disponible si está ENVIADO */}
              {isEnviado && seleccionadas.size > 0 && (
                <div className="sticky top-0 z-20 rounded-xl border-2 border-cenate-300 bg-cenate-50 p-4 shadow-lg">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cenate-200 rounded-lg">
                        <CheckCheck className="w-5 h-5 text-cenate-700" />
                      </div>
                      <span className="text-sm font-bold text-cenate-900">
                        {seleccionadas.size} especialidad(es) seleccionada(s)
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          const detallesSeleccionados = detallesFiltrados.filter(d =>
                            seleccionadas.has(d.idDetalle) && (!d.estado || d.estado === 'PENDIENTE')
                          );
                          if (detallesSeleccionados.length === 0) {
                            alert("No hay especialidades pendientes seleccionadas");
                            return;
                          }
                          abrirModalAprobarMasivo(detallesSeleccionados);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-all hover:shadow-md"
                        aria-label={`Asignar ${seleccionadas.size} especialidades seleccionadas`}
                        title="Asignar disponibilidad para todas las especialidades seleccionadas"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Asignar ({seleccionadas.size})
                      </button>
                      <button
                        onClick={() => {
                          const detallesSeleccionados = detallesFiltrados.filter(d =>
                            seleccionadas.has(d.idDetalle) && (!d.estado || d.estado === 'PENDIENTE')
                          );
                          if (detallesSeleccionados.length === 0) {
                            alert("No hay especialidades pendientes seleccionadas");
                            return;
                          }
                          abrirModalRechazarMasivo(detallesSeleccionados);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-all hover:shadow-md"
                        aria-label={`Rechazar ${seleccionadas.size} especialidades seleccionadas`}
                        title="Rechazar todas las especialidades seleccionadas (requiere motivo)"
                      >
                        <XOctagon className="w-4 h-4" />
                        Rechazar ({seleccionadas.size})
                      </button>
                      <button
                        onClick={() => setSeleccionadas(new Set())}
                        className="flex items-center gap-1.5 px-3 py-2 border-2 border-gray-300 bg-white text-gray-700 text-xs font-semibold rounded-lg hover:border-gray-400 transition-colors"
                        aria-label="Deseleccionar todas las especialidades"
                        title="Deseleccionar todas las especialidades seleccionadas"
                      >
                        Limpiar selección
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje informativo para solicitudes que no están ENVIADO */}
              {!isEnviado && (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900">
                        Solicitud en modo lectura
                      </p>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        Las acciones de asignación, rechazo y observaciones están disponibles solo cuando la solicitud está en estado <span className="font-semibold">ENVIADO</span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Filtros y búsqueda */}
              <div className="rounded-lg border-2 border-gray-200 bg-white p-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={busquedaEspecialidad}
                      onChange={(e) => setBusquedaEspecialidad(e.target.value)}
                      placeholder="Buscar especialidad o código..."
                      className="w-full pl-8 pr-8 py-1.5 text-xs border-2 border-gray-200 rounded focus:border-cenate-500 focus:ring-1 focus:ring-cenate-200 transition-colors"
                    />
                    {busquedaEspecialidad !== debouncedBusqueda && (
                      <Loader2 className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-cenate-600 animate-spin" />
                    )}
                  </div>
                  <div className="relative">
                    <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="pl-8 pr-2 py-1.5 text-xs border-2 border-gray-200 rounded focus:border-cenate-500 focus:ring-1 focus:ring-cenate-200 transition-colors bg-white cursor-pointer"
                    >
                      <option value="TODOS">Todos</option>
                      <option value="PENDIENTE">Pendientes</option>
                      <option value="ASIGNADO">Asignadas</option>
                      <option value="NO PROCEDE">No procede</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Guía de Referencia Rápida */}
              <div className="rounded-lg border-2 border-cenate-200 bg-cenate-50 p-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex gap-2 items-start">
                    <span className="font-bold text-cenate-700 min-w-fit">MAÑANA:</span>
                    <span className="text-gray-700">Citas disponibles 08:00 - 13:00</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="font-bold text-cenate-700 min-w-fit">TARDE:</span>
                    <span className="text-gray-700">Citas disponibles 13:00 - 18:00</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="font-bold text-cenate-700 min-w-fit">TELECONSULTA:</span>
                    <span className="text-gray-700">Atención remota (virtual)</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="font-bold text-cenate-700 min-w-fit">CONSULTORIO:</span>
                    <span className="text-gray-700">Atención presencial</span>
                  </div>
                </div>
              </div>

              {/* Tabla */}
              <div className="rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm bg-white">
                <div className="p-3 bg-gradient-to-r from-cenate-50 to-white border-b-2 border-cenate-100">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-cenate-200 rounded-lg flex-shrink-0">
                        <Stethoscope className="w-4 h-4 text-cenate-700" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Revisión de Especialidades</h4>
                        <p className="text-[10px] text-gray-600 mt-0.5">
                          Revisa, asigna o rechaza cada especialidad. Selecciona el tipo de consulta y confirma disponibilidad de turnos.
                        </p>
                        {busquedaEspecialidad && (
                          <span className="text-[9px] text-cenate-600 font-semibold mt-1 inline-block">
                            Mostrando {detallesFiltrados.length} de {detalles.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">{detallesFiltrados.length} filas</span>
                        <button
                          onClick={() => exportarEspecialidadesAExcel(detalles, solicitud?.nombreIpress || 'IPRESS', 'Especialidades_Solicitadas')}
                          disabled={detalles.length === 0}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Descargar tabla de especialidades en formato Excel"
                          title="Exportar especialidades a Excel"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Exportar
                        </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-xs">
                    <thead className="bg-cenate-600 sticky top-0 z-10">
                      <tr className="border-b border-cenate-700">
                        <th className="px-2 py-1.5 text-left" aria-label="Selección masiva">
                          {isEnviado && detallesFiltrados.some(d => !d.estado || d.estado === 'PENDIENTE') && (
                            <Tooltip text="Seleccionar todas las pendientes" position="top">
                              <input
                                type="checkbox"
                                checked={
                                  detallesFiltrados.filter(d => !d.estado || d.estado === 'PENDIENTE').length > 0 &&
                                  detallesFiltrados.filter(d => !d.estado || d.estado === 'PENDIENTE').every(d => seleccionadas.has(d.idDetalle))
                                }
                                onChange={(e) => {
                                  const pendientes = detallesFiltrados.filter(d => !d.estado || d.estado === 'PENDIENTE');
                                  if (e.target.checked) {
                                    setSeleccionadas(new Set(pendientes.map(d => d.idDetalle)));
                                  } else {
                                    setSeleccionadas(new Set());
                                  }
                                }}
                                className="w-5 h-5 rounded border-2 border-white text-cenate-600 focus:ring-2 focus:ring-white cursor-pointer"
                                aria-label="Seleccionar todas las especialidades pendientes"
                              />
                            </Tooltip>
                          )}
                        </th>
                        <th className="px-2 py-1.5 text-center font-semibold text-white w-6 text-[10px]">#</th>
                        <th className="px-2 py-1.5 text-left font-semibold text-white flex-1 min-w-[160px] text-[10px]">
                          ESPECIALIDAD
                        </th>
                        <th className="px-2 py-1.5 text-center font-semibold text-white min-w-[80px] text-[10px]">
                          ESTADO
                        </th>
                        <th className="px-2 py-1.5 text-center font-semibold text-white min-w-[90px] text-[10px]" title="Citas disponibles en horario mañana (08:00 - 13:00)">
                          CITAS MAÑANA
                        </th>
                        <th className="px-2 py-1.5 text-center font-semibold text-white min-w-[90px] text-[10px]" title="Citas disponibles en horario tarde (13:00 - 18:00)">
                          CITAS TARDE
                        </th>
                        <th className="px-2 py-1.5 text-center font-semibold text-white min-w-[95px] text-[10px]" title="Teleconsulta: Atención virtual (remota)">
                          TELECONSULTA
                        </th>
                        <th className="px-2 py-1.5 text-center font-semibold text-white min-w-[130px] text-[10px]" title="Teleconsultorio: Atención presencial">
                          TELECONSULTORIO
                        </th>
                        <th className="px-2 py-1.5 text-center font-semibold text-white min-w-[80px] text-[10px]" title="Fechas programadas">
                          FECHAS
                        </th>
                        <th className="px-2 py-1.5 text-center font-semibold text-white min-w-[95px] text-[10px]" title="Observaciones clínicas">
                          OBSERVACIONES
                        </th>
                        {isEnviado && (
                          <th className="px-2 py-1.5 text-center font-semibold text-white min-w-[105px] text-[10px]" title="Asignar o rechazar">
                            ACCIONES
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white text-xs">
                      {detallesFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={isEnviado ? 11 : 10} className="px-4 py-6 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="w-8 h-8 text-gray-300" />
                              <p className="text-sm">No se encontraron especialidades con los filtros aplicados</p>
                              {(busquedaEspecialidad || filtroEstado !== "TODOS") && (
                                <button
                                  onClick={() => {
                                    setBusquedaEspecialidad("");
                                    setFiltroEstado("TODOS");
                                  }}
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  Limpiar filtros
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        detallesFiltrados.map((d, idx) => {
                          const estaPendiente = !d.estado || d.estado === 'PENDIENTE';
                          const estaSeleccionada = seleccionadas.has(d.idDetalle);

                          return (
                            <tr key={d.idDetalle ?? idx} className="hover:bg-blue-50 transition-colors duration-150 text-xs">
                          <td className="px-1.5 py-2">
                            {estaPendiente && isEnviado ? (
                              <input
                                type="checkbox"
                                checked={estaSeleccionada}
                                onChange={(e) => {
                                  const nuevasSeleccionadas = new Set(seleccionadas);
                                  if (e.target.checked) {
                                    nuevasSeleccionadas.add(d.idDetalle);
                                  } else {
                                    nuevasSeleccionadas.delete(d.idDetalle);
                                  }
                                  setSeleccionadas(nuevasSeleccionadas);
                                }}
                                className="w-4 h-4 rounded border-2 border-gray-300 text-cenate-600 focus:ring-1 focus:ring-cenate-300 cursor-pointer"
                              />
                            ) : null}
                          </td>
                          <td className="px-1.5 py-2 text-center font-semibold text-gray-700 text-xs">{idx + 1}</td>

                          <td className="px-2 py-2">
                            <div className="font-semibold text-gray-900 text-xs">{d.nombreServicio ?? d.nombreEspecialidad}</div>
                            <div className="text-[9px] text-gray-500 mt-0.5 font-medium">{d.codigoServicio ?? d.codServicio}</div>
                          </td>

                          <td className="px-1.5 py-2 text-center">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${getEstadoBadge(d.estado ?? 'PENDIENTE')}`}>
                              {d.estado ?? 'PEND'}
                            </span>
                          </td>

                          <td className="px-1.5 py-2 text-center">
                            <Tooltip text={`${d.turnoManana ?? 0} citas disponibles mañana (08:00-13:00)`} position="top">
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200 cursor-help text-xs">
                                {d.turnoManana ?? 0}
                              </span>
                            </Tooltip>
                          </td>

                          <td className="px-1.5 py-2 text-center">
                            <Tooltip text={`${d.turnoTarde ?? 0} citas disponibles tarde (13:00-18:00)`} position="top">
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-bold border border-sky-200 cursor-help text-xs">
                                {d.turnoTarde ?? 0}
                              </span>
                            </Tooltip>
                          </td>

                          <td className="px-1.5 py-2 text-center">
                            <Tooltip text={d.tc ? "Requiere" : "No requiere"} position="top">
                              <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold ${d.tc ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {d.tc ? '✓' : '✗'}
                              </span>
                            </Tooltip>
                          </td>
                          <td className="px-1.5 py-2 text-center">
                            <Tooltip text={d.tl ? "Requiere" : "No requiere"} position="top">
                              <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold ${d.tl ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                {d.tl ? '✓' : '✗'}
                              </span>
                            </Tooltip>
                          </td>

                          <td className="px-1.5 py-2 text-center">
                            {d.fechasDetalle && d.fechasDetalle.length > 0 ? (
                              <Tooltip text="Ver fechas" position="top">
                                <button
                                  onClick={() => setModalFechas({ show: true, detalle: d })}
                                  className="inline-flex items-center justify-center px-2 py-1 rounded bg-cenate-50 text-cenate-700 hover:bg-cenate-100 transition-colors font-bold text-xs border border-cenate-200"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                </button>
                              </Tooltip>
                            ) : (
                              <span className="text-gray-400 text-xs font-semibold">—</span>
                            )}
                          </td>

                          <td className="px-2 py-2 text-center bg-white border-r border-gray-100">
                            {estaPendiente ? (
                              <Tooltip text={observacionesDetalle[d.idDetalle]?.trim() ? "Editar" : "Agregar"} position="top">
                                <button
                                  onClick={() => abrirModalObservacion(d, false)}
                                  disabled={!isEnviado}
                                  className={`inline-flex items-center justify-center px-2 py-1 rounded font-semibold transition-all text-xs ${
                                    observacionesDetalle[d.idDetalle]?.trim()
                                      ? 'bg-green-600 text-white hover:bg-green-700'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
                                  }`}
                                  aria-label={`${observacionesDetalle[d.idDetalle]?.trim() ? 'Editar' : 'Agregar'} observación`}
                                >
                                  {observacionesDetalle[d.idDetalle]?.trim() ? '✓' : '+'}
                                </button>
                              </Tooltip>
                            ) : observacionesDetalle[d.idDetalle]?.trim() ? (
                              <Tooltip text="Ver observación" position="top">
                                <button
                                  onClick={() => abrirModalObservacion(d, true)}
                                  className="inline-flex items-center justify-center px-2 py-1 rounded bg-gray-500 text-white hover:bg-gray-600 transition-all font-semibold text-xs"
                                  aria-label="Ver observación"
                                >
                                  👁
                                </button>
                              </Tooltip>
                            ) : (
                              <span className="text-gray-300 font-semibold text-xs">—</span>
                            )}
                          </td>

                          {isEnviado && (
                            <td className="px-1.5 py-2 text-center bg-white border-l border-gray-200">
                              {estaPendiente ? (
                                <div className="inline-flex items-center justify-center gap-1">
                                  <Tooltip text="Asignar" position="top">
                                    <button
                                      onClick={() => abrirModalAprobarDetalle(d)}
                                      className="inline-flex items-center justify-center px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-bold text-xs"
                                      aria-label="Asignar"
                                      title="Asignar"
                                    >
                                      ✓
                                    </button>
                                  </Tooltip>
                                  <Tooltip text="Rechazar" position="top">
                                    <button
                                      onClick={() => abrirModalRechazarDetalle(d)}
                                      className="inline-flex items-center justify-center px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-all font-bold text-xs"
                                      aria-label="Rechazar"
                                      title="Rechazar"
                                    >
                                      ✕
                                    </button>
                                  </Tooltip>
                                </div>
                              ) : (
                                <span className="text-gray-300 font-semibold text-xs">—</span>
                              )}
                            </td>
                          )}
                        </tr>
                        );
                      })
                    )}
                    </tbody>
                  </table>
                  {/* Footer de tabla con contador */}
                    <div className="bg-gray-50 px-2 py-1 border-t border-gray-200 flex items-center justify-between">
                      <p className="text-[9px] text-gray-600">
                        Mostrando {detallesFiltrados.length} de {detalles.length} especialidades
                      </p>
                      {estadisticas.pendientes > 0 && (
                        <span className="text-[9px] text-amber-600 font-medium">
                          {estadisticas.pendientes} pendiente{estadisticas.pendientes !== 1 ? 's' : ''} de revisar
                        </span>
                      )}
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              {/* {isEnviado && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  {!showRechazoForm ? (
                    <div className="flex flex-col md:flex-row gap-3">
                      <button
                        onClick={() => onAprobar(solicitud.idSolicitud)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Asignar Solicitud
                      </button>

                      <button
                        onClick={() => setShowRechazoForm(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        No Procede
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Motivo del Rechazo *</label>
                      <textarea
                        value={motivoRechazo}
                        onChange={(e) => setMotivoRechazo(e.target.value)}
                        rows={3}
                        placeholder="Indique el motivo del rechazo..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />

                      <div className="flex flex-col md:flex-row gap-3">
                        <button
                          onClick={() => {
                            setShowRechazoForm(false);
                            setMotivoRechazo("");
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => onRechazar(solicitud.idSolicitud, motivoRechazo)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Confirmar Rechazo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )} */}
            </>
          )}
        </div>
      </div>

      {/* Modal de Observación */}
      {modalObservacion.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 bg-cenate-600 rounded-t-xl border-b-4 border-cenate-700">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {modalObservacion.soloLectura ? "Consultar Observación" : "Registrar Observación"}
                  </h4>
                  <p className="text-sm text-cenate-100 mt-2">
                    {modalObservacion.detalle?.nombreServicio ?? modalObservacion.detalle?.nombreEspecialidad}
                  </p>
                  <p className="text-xs text-cenate-200">
                    Código: {modalObservacion.detalle?.codigoServicio ?? modalObservacion.detalle?.codServicio}
                  </p>
                </div>
                <button
                  onClick={cerrarModalObservacion}
                  className="text-white bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-all hover:scale-110 flex-shrink-0"
                  aria-label="Cerrar"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Observación {modalObservacion.soloLectura && <span className="text-xs text-gray-500 font-normal ml-2">(Solo lectura)</span>}
              </label>
              <textarea
                value={modalObservacion.observacion}
                onChange={(e) => setModalObservacion(prev => ({ ...prev, observacion: e.target.value }))}
                placeholder={modalObservacion.soloLectura ? "" : "Escriba aquí sus observaciones..."}
                rows={6}
                readOnly={modalObservacion.soloLectura}
                className={`w-full px-4 py-3 border-2 rounded-lg resize-none ${
                  modalObservacion.soloLectura
                    ? 'border-gray-200 bg-gray-50 text-gray-700 cursor-default'
                    : 'border-gray-300 focus:border-cenate-500 focus:ring-2 focus:ring-cenate-200 transition-colors'
                }`}
              />
              {!modalObservacion.soloLectura && (
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {modalObservacion.observacion.length} caracteres
                </p>
              )}
            </div>

            <div className="p-6 border-t-2 border-gray-100 flex gap-3">
              <button
                onClick={cerrarModalObservacion}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
              >
                {modalObservacion.soloLectura ? "Cerrar" : "Cancelar"}
              </button>
              {!modalObservacion.soloLectura && (
                <button
                  onClick={guardarObservacion}
                  className="flex-1 px-4 py-2.5 bg-cenate-600 text-white font-semibold rounded-lg hover:bg-cenate-700 transition-all hover:shadow-md flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Aprobar/Rechazar Especialidad */}
      {modalAccion.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className={`p-6 rounded-t-xl border-b-4 ${
              modalAccion.tipo === 'aprobar'
                ? 'bg-emerald-600 border-emerald-700'
                : 'bg-red-600 border-red-700'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    {modalAccion.tipo === 'aprobar' ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <XCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg font-bold text-white">
                      {modalAccion.tipo === 'aprobar' ? 'Asignar Especialidad' : 'Rechazar Especialidad'}
                    </h4>
                    <p className="text-sm text-white/90 mt-1 truncate">
                      {modalAccion.detalle?.nombreServicio ?? modalAccion.detalle?.nombreEspecialidad}
                    </p>
                    <p className="text-xs text-white/80">
                      Código: {modalAccion.detalle?.codigoServicio ?? modalAccion.detalle?.codServicio}
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarModalAccion}
                  className="text-white bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-all hover:scale-110 flex-shrink-0"
                  aria-label="Cerrar"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {modalAccion.tipo === 'rechazar'
                  ? 'Motivo del Rechazo'
                  : 'Observaciones'
                }
                {modalAccion.tipo === 'rechazar' && <span className="text-red-600 ml-1">*</span>}
              </label>
              <textarea
                value={modalAccion.observacion}
                onChange={(e) => setModalAccion(prev => ({ ...prev, observacion: e.target.value }))}
                placeholder={modalAccion.tipo === 'rechazar'
                  ? "Indique el motivo del rechazo..."
                  : "Agregue observaciones (opcional)..."}
                rows={6}
                className={`w-full px-4 py-3 border-2 rounded-lg resize-none transition-colors ${
                  modalAccion.tipo === 'rechazar'
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                }`}
              />
              <div className="mt-3 flex items-center justify-between">
                {modalAccion.tipo === 'rechazar' && !modalAccion.observacion.trim() && (
                  <p className="text-xs text-red-600 font-semibold">
                    * Motivo obligatorio
                  </p>
                )}
                <p className={`text-xs ml-auto ${modalAccion.observacion.length > 500 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  {modalAccion.observacion.length} caracteres
                </p>
              </div>
            </div>

            <div className="p-6 border-t-2 border-gray-100 flex gap-3">
              <button
                onClick={cerrarModalAccion}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccionDetalle}
                disabled={modalAccion.tipo === 'rechazar' && !modalAccion.observacion.trim()}
                className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-lg transition-all hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  modalAccion.tipo === 'aprobar'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {modalAccion.tipo === 'aprobar' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Asignar
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Aprobar/Rechazar MASIVO */}
      {modalAccionMasiva.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className={`p-6 rounded-t-xl border-b-4 ${
              modalAccionMasiva.tipo === 'aprobar'
                ? 'bg-emerald-600 border-emerald-700'
                : 'bg-red-600 border-red-700'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    {modalAccionMasiva.tipo === 'aprobar' ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <XCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg font-bold text-white">
                      {modalAccionMasiva.tipo === 'aprobar' ? 'Asignar Especialidades' : 'Rechazar Especialidades'}
                    </h4>
                    <p className="text-sm text-white/90 mt-1">
                      Se procesarán <span className="font-bold">{modalAccionMasiva.detalles.length}</span> especialidad(es)
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarModalAccionMasiva}
                  className="text-white bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-all hover:scale-110 flex-shrink-0"
                  aria-label="Cerrar"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Lista de especialidades */}
              <div className="mb-5 max-h-44 overflow-y-auto border-2 border-gray-200 rounded-lg bg-gray-50">
                <div className="divide-y divide-gray-200">
                  {modalAccionMasiva.detalles.map((detalle, idx) => (
                    <div key={detalle.idDetalle} className="px-4 py-3 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 min-w-fit">{String(idx + 1).padStart(2, '0')}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {detalle.nombreServicio ?? detalle.nombreEspecialidad}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Código: {detalle.codigoServicio ?? detalle.codServicio}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {modalAccionMasiva.tipo === 'rechazar'
                  ? 'Motivo del Rechazo'
                  : 'Observaciones'
                }
                {modalAccionMasiva.tipo === 'rechazar' && <span className="text-red-600 ml-1">*</span>}
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Se aplicará a todas las {modalAccionMasiva.detalles.length} especialidad(es) seleccionada(s)
              </p>
              <textarea
                value={modalAccionMasiva.observacion}
                onChange={(e) => setModalAccionMasiva(prev => ({ ...prev, observacion: e.target.value }))}
                placeholder={modalAccionMasiva.tipo === 'rechazar'
                  ? "Indique el motivo del rechazo..."
                  : "Agregue observaciones (opcional)..."}
                rows={5}
                className={`w-full px-4 py-3 border-2 rounded-lg resize-none transition-colors ${
                  modalAccionMasiva.tipo === 'rechazar'
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                }`}
              />
              <div className="mt-3 flex items-center justify-between">
                {modalAccionMasiva.tipo === 'rechazar' && !modalAccionMasiva.observacion.trim() && (
                  <p className="text-xs text-red-600 font-semibold">
                    * Motivo obligatorio
                  </p>
                )}
                <p className={`text-xs ml-auto ${modalAccionMasiva.observacion.length > 500 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  {modalAccionMasiva.observacion.length} caracteres
                </p>
              </div>
            </div>

            <div className="p-6 border-t-2 border-gray-100 flex gap-3">
              <button
                onClick={cerrarModalAccionMasiva}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccionMasiva}
                disabled={modalAccionMasiva.tipo === 'rechazar' && !modalAccionMasiva.observacion.trim()}
                className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-lg transition-all hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  modalAccionMasiva.tipo === 'aprobar'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {modalAccionMasiva.tipo === 'aprobar' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Asignar {modalAccionMasiva.detalles.length}
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Rechazar {modalAccionMasiva.detalles.length}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fechas Seleccionadas */}
      {modalFechas.show && modalFechas.detalle && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 bg-cenate-600 rounded-t-xl border-b-4 border-cenate-700">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white">
                      Fechas Programadas
                    </h4>
                  </div>
                  <p className="text-sm text-cenate-100 ml-11 truncate">
                    {modalFechas.detalle.nombreServicio ?? modalFechas.detalle.nombreEspecialidad}
                  </p>
                  <p className="text-xs text-cenate-200 ml-11">
                    Código: {modalFechas.detalle.codigoServicio ?? modalFechas.detalle.codServicio}
                  </p>
                </div>
                <button
                  onClick={() => setModalFechas({ show: false, detalle: null })}
                  className="text-white bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-all hover:scale-110 flex-shrink-0"
                  aria-label="Cerrar"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {modalFechas.detalle.fechasDetalle && modalFechas.detalle.fechasDetalle.length > 0 ? (
                <div className="space-y-2">
                  {modalFechas.detalle.fechasDetalle.map((fecha, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3.5 rounded-lg border-2 transition-colors ${
                        fecha.bloque === 'MANANA'
                          ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                          : 'bg-orange-50 border-orange-300 hover:bg-orange-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Calendar className={`w-5 h-5 flex-shrink-0 ${
                          fecha.bloque === 'MANANA' ? 'text-cenate-600' : 'text-amber-600'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {new Date(fecha.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                          <p className="text-xs text-gray-600">{fecha.fecha}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                          fecha.bloque === 'MANANA'
                            ? 'bg-cenate-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {fecha.bloque === 'MANANA' ? 'Mañana' : 'Tarde'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium">Sin fechas registradas</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t-2 border-gray-100">
              <button
                onClick={() => setModalFechas({ show: false, detalle: null })}
                className="w-full px-4 py-2.5 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all hover:shadow-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Calendario del Periodo */}
      {modalCalendario && solicitud && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 bg-cenate-600 rounded-t-xl border-b-4 border-cenate-700">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg font-bold text-white">
                      Calendario del Período
                    </h4>
                    <p className="text-sm text-cenate-100 mt-1 truncate">
                      {solicitud.periodoDescripcion} • {solicitud.nombreIpress}
                    </p>
                    <p className="text-xs text-cenate-200">
                      {solicitud.fechaInicio} al {solicitud.fechaFin}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalCalendario(false)}
                  className="text-white bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-all hover:scale-110 flex-shrink-0"
                  aria-label="Cerrar"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {(() => {
                // Obtener todas las fechas registradas de todos los detalles
                const fechasRegistradas = new Map();
                detalles.forEach(detalle => {
                  if (detalle.fechasDetalle) {
                    detalle.fechasDetalle.forEach(f => {
                      const key = f.fecha;
                      if (!fechasRegistradas.has(key)) {
                        fechasRegistradas.set(key, []);
                      }
                      fechasRegistradas.get(key).push({
                        especialidad: detalle.nombreServicio,
                        bloque: f.bloque
                      });
                    });
                  }
                });

                // Generar calendario
                const inicio = new Date(solicitud.fechaInicio + 'T00:00:00');
                const fin = new Date(solicitud.fechaFin + 'T00:00:00');
                const diasCalendario = [];
                
                for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
                  const fechaStr = d.toISOString().split('T')[0];
                  diasCalendario.push({
                    fecha: fechaStr,
                    dia: d.getDate(),
                    nombreDia: d.toLocaleDateString('es-PE', { weekday: 'short' }),
                    registros: fechasRegistradas.get(fechaStr) || []
                  });
                }

                return (
                  <div className="grid grid-cols-7 gap-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                      <div key={dia} className="text-center font-semibold text-gray-700 text-sm py-2">
                        {dia}
                      </div>
                    ))}
                    
                    {/* Espacios vacíos para alinear el primer día */}
                    {Array(inicio.getDay()).fill(null).map((_, idx) => (
                      <div key={`empty-${idx}`} className="aspect-square" />
                    ))}
                    
                    {diasCalendario.map((dia) => {
                      const tieneRegistros = dia.registros.length > 0;
                      const tieneManana = dia.registros.some(r => r.bloque === 'MANANA');
                      const tieneTarde = dia.registros.some(r => r.bloque === 'TARDE');
                      
                      return (
                        <div
                          key={dia.fecha}
                          className={`aspect-square rounded-lg border-2 p-2 relative ${
                            tieneRegistros
                              ? 'border-blue-500 bg-blue-50 cursor-pointer hover:bg-blue-100'
                              : 'border-gray-200 bg-white'
                          }`}
                          title={tieneRegistros ? `${dia.registros.length} turno(s) registrado(s)` : ''}
                          onClick={() => {
                            if (tieneRegistros) {
                              alert(`Día ${dia.dia}\\n\\n` + 
                                dia.registros.map(r => `• ${r.especialidad} (${r.bloque})`).join('\\n'));
                            }
                          }}
                        >
                          <div className="text-center">
                            <div className={`text-xs font-medium ${tieneRegistros ? 'text-blue-900' : 'text-gray-500'}`}>
                              {dia.nombreDia}
                            </div>
                            <div className={`text-lg font-bold ${tieneRegistros ? 'text-blue-700' : 'text-gray-700'}`}>
                              {dia.dia}
                            </div>
                          </div>
                          
                          {tieneRegistros && (
                            <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 justify-center">
                              {tieneManana && (
                                <div className="w-2 h-2 rounded-full bg-blue-600" title="Mañana" />
                              )}
                              {tieneTarde && (
                                <div className="w-2 h-2 rounded-full bg-orange-600" title="Tarde" />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Leyenda */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200 flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-cenate-600" />
                  <span className="text-gray-700 font-medium">Turno Mañana</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-amber-600" />
                  <span className="text-gray-700 font-medium">Turno Tarde</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t-2 border-gray-100">
              <button
                onClick={() => setModalCalendario(false)}
                className="w-full px-4 py-2.5 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all hover:shadow-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, icon = null }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-500 uppercase font-medium">{label}</span>
      <span className="text-sm text-gray-900 text-right">{value ?? "—"}</span>
    </div>
  );
}
