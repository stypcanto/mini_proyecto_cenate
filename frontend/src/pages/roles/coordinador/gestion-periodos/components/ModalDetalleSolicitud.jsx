// src/pages/coordinador/turnos/components/ModalDetalleSolicitud.jsx
import React, { useEffect, useState, useMemo } from "react";
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
  Save,
  Search,
  Filter,
  CheckCheck,
  XOctagon,
  Calendar,
} from "lucide-react";
import { chipDay, fmtDateTime, yesNoPill } from "../utils/ui";
import { solicitudTurnosService } from "../../../../../services/solicitudTurnosService";

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
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [mostrarAccionesMasivas, setMostrarAccionesMasivas] = useState(false);

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

    // Filtro por búsqueda
    if (busquedaEspecialidad.trim()) {
      const busqueda = busquedaEspecialidad.toLowerCase();
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
  }, [detalles, busquedaEspecialidad, filtroEstado]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-gray-700" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalle de Solicitud
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-gray-700 font-medium">{solicitud?.nombreIpress ?? "Cargando..."}</span>
                  {solicitud?.estado && (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getEstadoBadge(solicitud.estado)}`}>
                      {solicitud.estado}
                    </span>
                  )}
                  {solicitud?.periodoDescripcion && (
                    <span className="text-sm text-gray-500">• {solicitud.periodoDescripcion}</span>
                  )}
                </div>
              </div>
            </div>

            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : !solicitud ? (
            <div className="p-6 text-center text-sm text-gray-500">No hay datos para mostrar.</div>
          ) : (
            <>
              {/* Información en formato tabla */}
              <div className="grid grid-cols-3 gap-3 divide-x divide-gray-200">
                {/* Solicitud */}
                <div className="pr-3">
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-200">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-900">Solicitud</p>
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 text-gray-500 uppercase font-medium">ID SOLICITUD</td>
                        <td className="py-1 text-gray-900 text-right">{solicitud.idSolicitud}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 text-gray-500 uppercase font-medium">ID PERIODO</td>
                        <td className="py-1 text-gray-900 text-right">{solicitud.idPeriodo}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 text-gray-500 uppercase font-medium">ESPECIALIDADES</td>
                        <td className="py-1 text-gray-900 text-right">{solicitud.totalEspecialidades ?? detalles.length}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-gray-500 uppercase font-medium">TURNOS</td>
                        <td className="py-1 text-gray-900 text-right">{solicitud.totalTurnosSolicitados ?? "—"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* IPRESS */}
                <div className="px-3">
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-200">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-900">IPRESS</p>
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 text-gray-500 uppercase font-medium">RENAES</td>
                        <td className="py-1 text-gray-900 text-right">{solicitud.codigoRenaes ?? solicitud.codIpress ?? "—"}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 text-gray-500 uppercase font-medium">NOMBRE</td>
                        <td className="py-1 text-gray-900 text-right">{solicitud.nombreIpress ?? "—"}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-gray-500 uppercase font-medium">RED</td>
                        <td className="py-1 text-gray-900 text-right">{solicitud.nombreRed ?? "—"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Usuario */}
                <div className="pl-3">
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-200">
                    <Users className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-900">Usuario</p>
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 text-gray-500 uppercase font-medium">ID</td>
                        <td className="py-1 text-gray-900 text-right">{solicitud.idUsuarioCreador ?? "—"}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 text-gray-500 uppercase font-medium">NOMBRE</td>
                        <td className="py-1 text-gray-900 text-right">{solicitud.nombreUsuarioCreador ?? solicitud.nombreCompleto ?? "—"}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 text-gray-500 uppercase font-medium">EMAIL</td>
                        <td className="py-1 text-gray-900 text-right">{solicitud.emailContacto ?? "—"}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-gray-500 uppercase font-medium">TELÉFONO</td>
                        <td className="py-1 text-gray-900 text-right">{solicitud.telefonoContacto ?? "—"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase font-medium">Creado:</div>
                    <div className="text-sm text-gray-900">{fmtDateTime(solicitud.fechaCreacion ?? solicitud.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase font-medium">Actualizado:</div>
                    <div className="text-sm text-gray-900">{fmtDateTime(solicitud.fechaActualizacion ?? solicitud.updatedAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase font-medium">Enviado:</div>
                    <div className="text-sm text-gray-900">{fmtDateTime(solicitud.fechaEnvio)}</div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso y estadísticas */}
              <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-900">Progreso de Revisión</h4>
                  <span className="text-xs text-gray-600">
                    {estadisticas.asignados + estadisticas.noProcede} de {estadisticas.total} procesadas
                  </span>
                </div>
                
                <div className="flex gap-2 mb-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" 
                      style={{ width: `${estadisticas.total > 0 ? (estadisticas.asignados / estadisticas.total) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-2 bg-gradient-to-r from-red-500 to-rose-500" 
                      style={{ width: `${estadisticas.total > 0 ? (estadisticas.noProcede / estadisticas.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded px-2 py-1 text-center">
                    <div className="text-[10px] text-amber-600 font-medium">Pendientes</div>
                    <div className="text-base font-bold text-amber-700">{estadisticas.pendientes}</div>
                  </div>
                  <div className="bg-white rounded px-2 py-1 text-center">
                    <div className="text-[10px] text-green-600 font-medium">Asignadas</div>
                    <div className="text-base font-bold text-green-700">{estadisticas.asignados}</div>
                  </div>
                  <div className="bg-white rounded px-2 py-1 text-center">
                    <div className="text-[10px] text-red-600 font-medium">No procede</div>
                    <div className="text-base font-bold text-red-700">{estadisticas.noProcede}</div>
                  </div>
                </div>
              </div>

              {/* Botón Ver Calendario */}
              {detalles.some(d => d.fechasDetalle && d.fechasDetalle.length > 0) && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <button
                    onClick={() => setModalCalendario(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Ver Calendario del Periodo
                  </button>
                </div>
              )}

              {/* Acciones masivas - Solo disponible si está ENVIADO */}
              {isEnviado && seleccionadas.size > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {seleccionadas.size} especialidad(es) seleccionada(s)
                      </span>
                    </div>
                    <div className="flex gap-2">
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
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Asignar Seleccionadas
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
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XOctagon className="w-3.5 h-3.5" />
                        No Procede
                      </button>
                      <button
                        onClick={() => setSeleccionadas(new Set())}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje informativo para solicitudes que no están ENVIADO */}
              {!isEnviado && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        Solicitud en modo consulta
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Las acciones de aprobación, rechazo y comentarios solo están disponibles cuando la solicitud está en estado ENVIADO.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Filtros y búsqueda */}
              <div className="rounded-lg border border-gray-200 bg-white p-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={busquedaEspecialidad}
                      onChange={(e) => setBusquedaEspecialidad(e.target.value)}
                      placeholder="Buscar especialidad..."
                      className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="TODOS">Todos</option>
                      <option value="PENDIENTE">Pendientes</option>
                      <option value="ASIGNADO">Asignadas</option>
                      <option value="NO PROCEDE">No procede</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabla */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-2 bg-white border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-gray-500" />
                    <h4 className="text-xs font-semibold text-gray-900">Especialidades solicitadas</h4>
                    {busquedaEspecialidad && (
                      <span className="text-[10px] text-blue-600">
                        (mostrando {detallesFiltrados.length} de {detalles.length})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">{detallesFiltrados.length} filas</span>
                  </div>
                </div>

                <div className="overflow-x-auto bg-white max-h-[400px] overflow-y-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50 text-gray-700 sticky top-0">
                      <tr>
                        <th className="px-2 py-1.5 text-center font-semibold">
                          {isEnviado && detallesFiltrados.some(d => !d.estado || d.estado === 'PENDIENTE') && (
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
                              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </th>
                        <th className="px-2 py-1.5 text-left font-semibold">#</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Especialidad</th>
                        <th className="px-2 py-1.5 text-center font-semibold">Estado</th>
                        <th className="px-2 py-1.5 text-center font-semibold">Req</th>
                        <th className="px-2 py-1.5 text-center font-semibold">TM</th>
                        <th className="px-2 py-1.5 text-center font-semibold">Mañana</th>
                        <th className="px-2 py-1.5 text-center font-semibold">Tarde</th>
                        <th className="px-2 py-1.5 text-center font-semibold">TC</th>
                        <th className="px-2 py-1.5 text-center font-semibold">TL</th>
                        <th className="px-2 py-1.5 text-center font-semibold">Fechas</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Observación</th>
                        {isEnviado && <th className="px-2 py-1.5 text-center font-semibold">Acciones</th>}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {detallesFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan="12" className="px-4 py-8 text-center text-gray-500">
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
                          const estaAprobado = d.estado === 'APROBADO';
                          const estaRechazado = d.estado === 'RECHAZADO';
                          const estaSeleccionada = seleccionadas.has(d.idDetalle);
                          
                          return (
                            <tr key={d.idDetalle ?? idx} className={`hover:bg-gray-50 ${!estaPendiente ? 'bg-gray-50' : ''}`}>
                          <td className="px-2 py-1.5 text-center">
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
                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-2 py-1.5 text-gray-500">{idx + 1}</td>

                          <td className="px-2 py-1.5">
                            <div className="font-semibold text-gray-900">{d.nombreServicio ?? d.nombreEspecialidad}</div>
                            <div className="text-[10px] text-gray-500">Cód: {d.codigoServicio ?? d.codServicio ?? "—"}</div>
                          </td>

                          <td className="px-2 py-1.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getEstadoBadge(d.estado ?? 'PENDIENTE')}`}>
                              {d.estado ?? 'PENDIENTE'}
                            </span>
                          </td>

                          <td className="px-2 py-1.5 text-center">{yesNoPill(!!d.requiere)}</td>

                          <td className="px-2 py-1.5 text-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                              {d.turnoTM ?? 0}
                            </span>
                          </td>

                          <td className="px-2 py-1.5 text-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                              {d.turnoManana ?? 0}
                            </span>
                          </td>

                          <td className="px-2 py-1.5 text-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                              {d.turnoTarde ?? 0}
                            </span>
                          </td>

                          <td className="px-2 py-1.5 text-center">{yesNoPill(!!d.tc)}</td>
                          <td className="px-2 py-1.5 text-center">{yesNoPill(!!d.tl)}</td>

                          <td className="px-2 py-1.5 text-center">
                            {d.fechasDetalle && d.fechasDetalle.length > 0 ? (
                              <button
                                onClick={() => setModalFechas({ show: true, detalle: d })}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 transition-colors"
                                title="Ver días seleccionados"
                              >
                                <Calendar className="w-3 h-3" />
                                {d.fechasDetalle.length}
                              </button>
                            ) : (
                              <button
                                disabled
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg cursor-not-allowed"
                                title="Sin días registrados"
                              >
                                <Calendar className="w-3 h-3" />
                                0
                              </button>
                            )}
                          </td>

                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              {estaPendiente ? (
                                <button
                                  onClick={() => abrirModalObservacion(d, false)}
                                  disabled={!isEnviado}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                  title="Registrar observación"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  {observacionesDetalle[d.idDetalle]?.trim() ? "Editar" : "Añadir"}
                                </button>
                              ) : observacionesDetalle[d.idDetalle]?.trim() ? (
                                <button
                                  onClick={() => abrirModalObservacion(d, true)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
                                  title="Ver observación (solo lectura)"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  Ver
                                </button>
                              ) : (
                                <span className="text-xs text-gray-500">Sin observación</span>
                              )}
                              {observacionesDetalle[d.idDetalle]?.trim() && estaPendiente && (
                                <span className="text-xs text-green-600 font-medium">✓ Registrada</span>
                              )}
                            </div>
                          </td>

                          {isEnviado && (
                            <td className="px-4 py-3">
                              {estaPendiente ? (
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() => abrirModalAprobarDetalle(d)}
                                    className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                    title="Asignar especialidad"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => abrirModalRechazarDetalle(d)}
                                    className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                    title="No procede"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <span className="text-gray-400 text-lg font-bold">—</span>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                        );
                      })
                    )}
                    </tbody>
                  </table>
                </div>
                
                {/* Footer de tabla con contador */}
                <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-[10px] text-gray-600">
                    Mostrando {detallesFiltrados.length} de {detalles.length} especialidades
                  </p>
                  {estadisticas.pendientes > 0 && (
                    <span className="text-[10px] text-amber-600 font-medium">
                      {estadisticas.pendientes} pendiente{estadisticas.pendientes !== 1 ? 's' : ''} de revisar
                    </span>
                  )}
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
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    {modalObservacion.soloLectura ? "Consultar Observación" : "Registrar Observación"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {modalObservacion.detalle?.nombreServicio ?? modalObservacion.detalle?.nombreEspecialidad}
                  </p>
                  <p className="text-xs text-gray-500">
                    Código: {modalObservacion.detalle?.codigoServicio ?? modalObservacion.detalle?.codServicio}
                  </p>
                </div>
                <button
                  onClick={cerrarModalObservacion}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observación {modalObservacion.soloLectura && <span className="text-xs text-gray-500">(Solo lectura)</span>}
              </label>
              <textarea
                value={modalObservacion.observacion}
                onChange={(e) => setModalObservacion(prev => ({ ...prev, observacion: e.target.value }))}
                placeholder={modalObservacion.soloLectura ? "" : "Escriba aquí sus observaciones sobre esta especialidad..."}
                rows={6}
                readOnly={modalObservacion.soloLectura}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg resize-none ${
                  modalObservacion.soloLectura 
                    ? 'bg-gray-50 text-gray-700 cursor-default' 
                    : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {!modalObservacion.soloLectura && (
                <p className="text-xs text-gray-500 mt-2">
                  {modalObservacion.observacion.length} caracteres
                </p>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={cerrarModalObservacion}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                {modalObservacion.soloLectura ? "Cerrar" : "Cancelar"}
              </button>
              {!modalObservacion.soloLectura && (
                <button
                  onClick={guardarObservacion}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar Observación
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
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`text-lg font-semibold flex items-center gap-2 ${
                    modalAccion.tipo === 'aprobar' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {modalAccion.tipo === 'aprobar' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Asignar Especialidad
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        No Procede
                      </>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    {modalAccion.detalle?.nombreServicio ?? modalAccion.detalle?.nombreEspecialidad}
                  </p>
                  <p className="text-xs text-gray-500">
                    Código: {modalAccion.detalle?.codigoServicio ?? modalAccion.detalle?.codServicio}
                  </p>
                </div>
                <button
                  onClick={cerrarModalAccion}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observación {modalAccion.tipo === 'rechazar' && <span className="text-red-600">*</span>}
                {modalAccion.tipo === 'aprobar' && <span className="text-gray-500 text-xs ml-1">(Opcional)</span>}
              </label>
              <textarea
                value={modalAccion.observacion}
                onChange={(e) => setModalAccion(prev => ({ ...prev, observacion: e.target.value }))}
                placeholder={modalAccion.tipo === 'rechazar' 
                  ? "Indique el motivo del rechazo (obligatorio)..." 
                  : "Agregue observaciones adicionales (opcional)..."}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 resize-none ${
                  modalAccion.tipo === 'rechazar' 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                }`}
              />
              {modalAccion.tipo === 'rechazar' && !modalAccion.observacion.trim() && (
                <p className="text-xs text-red-600 mt-2">
                  * La observación es obligatoria para rechazar una especialidad
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {modalAccion.observacion.length} caracteres
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={cerrarModalAccion}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccionDetalle}
                disabled={modalAccion.tipo === 'rechazar' && !modalAccion.observacion.trim()}
                className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  modalAccion.tipo === 'aprobar'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {modalAccion.tipo === 'aprobar' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar Asignación
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Confirmar No Procede
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
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`text-lg font-semibold flex items-center gap-2 ${
                    modalAccionMasiva.tipo === 'aprobar' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {modalAccionMasiva.tipo === 'aprobar' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Asignar Especialidades
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        No Procede
                      </>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Se procesarán <span className="font-bold">{modalAccionMasiva.detalles.length}</span> especialidad(es) seleccionada(s)
                  </p>
                </div>
                <button
                  onClick={cerrarModalAccionMasiva}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Lista de especialidades */}
              <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="divide-y divide-gray-100">
                  {modalAccionMasiva.detalles.map((detalle, idx) => (
                    <div key={detalle.idDetalle} className="px-3 py-2 hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">{idx + 1}.</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {detalle.nombreServicio ?? detalle.nombreEspecialidad}
                          </p>
                          <p className="text-xs text-gray-500">
                            Cód: {detalle.codigoServicio ?? detalle.codServicio}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observación {modalAccionMasiva.tipo === 'rechazar' && <span className="text-red-600">*</span>}
                {modalAccionMasiva.tipo === 'aprobar' && <span className="text-gray-500 text-xs ml-1">(Opcional)</span>}
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Esta observación se aplicará a todas las especialidades seleccionadas
              </p>
              <textarea
                value={modalAccionMasiva.observacion}
                onChange={(e) => setModalAccionMasiva(prev => ({ ...prev, observacion: e.target.value }))}
                placeholder={modalAccionMasiva.tipo === 'rechazar' 
                  ? "Indique el motivo del rechazo para todas las especialidades (obligatorio)..." 
                  : "Agregue observaciones para todas las especialidades (opcional)..."}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 resize-none ${
                  modalAccionMasiva.tipo === 'rechazar' 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                }`}
              />
              {modalAccionMasiva.tipo === 'rechazar' && !modalAccionMasiva.observacion.trim() && (
                <p className="text-xs text-red-600 mt-2">
                  * La observación es obligatoria para rechazar especialidades
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {modalAccionMasiva.observacion.length} caracteres
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={cerrarModalAccionMasiva}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccionMasiva}
                disabled={modalAccionMasiva.tipo === 'rechazar' && !modalAccionMasiva.observacion.trim()}
                className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  modalAccionMasiva.tipo === 'aprobar'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {modalAccionMasiva.tipo === 'aprobar' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Asignar {modalAccionMasiva.detalles.length} Especialidad(es)
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    No Procede {modalAccionMasiva.detalles.length} Especialidad(es)
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
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Días Seleccionados
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    {modalFechas.detalle.nombreServicio ?? modalFechas.detalle.nombreEspecialidad}
                  </p>
                  <p className="text-xs text-gray-500">
                    Código: {modalFechas.detalle.codigoServicio ?? modalFechas.detalle.codServicio}
                  </p>
                </div>
                <button
                  onClick={() => setModalFechas({ show: false, detalle: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {modalFechas.detalle.fechasDetalle && modalFechas.detalle.fechasDetalle.length > 0 ? (
                <div className="space-y-2">
                  {modalFechas.detalle.fechasDetalle.map((fecha, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        fecha.bloque === 'MANANA'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className={`w-5 h-5 ${
                          fecha.bloque === 'MANANA' ? 'text-blue-600' : 'text-orange-600'
                        }`} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(fecha.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-gray-600">{fecha.fecha}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          fecha.bloque === 'MANANA'
                            ? 'bg-blue-600 text-white'
                            : 'bg-orange-600 text-white'
                        }`}
                      >
                        {fecha.bloque === 'MANANA' ? '🌅 Mañana' : '🌆 Tarde'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No hay días registrados</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setModalFechas({ show: false, detalle: null })}
                className="w-full px-4 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
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
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Calendario del Periodo
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    {solicitud.periodoDescripcion} - {solicitud.nombreIpress}
                  </p>
                  <p className="text-xs text-gray-500">
                    {solicitud.fechaInicio} al {solicitud.fechaFin}
                  </p>
                </div>
                <button
                  onClick={() => setModalCalendario(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
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
              <div className="mt-6 flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-gray-700">Turno Mañana</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-600" />
                  <span className="text-gray-700">Turno Tarde</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setModalCalendario(false)}
                className="w-full px-4 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
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
