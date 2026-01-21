// src/pages/coordinador/turnos/components/ModalDetalleSolicitud.jsx
import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { chipDay, fmtDateTime, yesNoPill } from "../utils/ui";

export default function ModalDetalleSolicitud({
  loading,
  solicitud,
  onClose,
  onAprobar,
  onRechazar,
  getEstadoBadge,
  prefillRechazo = false,
}) {
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [showRechazoForm, setShowRechazoForm] = useState(prefillRechazo);
  const [observacionesDetalle, setObservacionesDetalle] = useState({});
  const [modalObservacion, setModalObservacion] = useState({ show: false, detalle: null, observacion: "" });

  useEffect(() => {
    setShowRechazoForm(prefillRechazo);
    setMotivoRechazo("");
    // Inicializar observaciones con las existentes
    if (solicitud?.detalles) {
      const obs = {};
      solicitud.detalles.forEach(d => {
        obs[d.idDetalle] = d.observacion || "";
      });
      setObservacionesDetalle(obs);
    }
  }, [prefillRechazo, solicitud?.idSolicitud, solicitud?.detalles]);

  const abrirModalObservacion = (detalle) => {
    setModalObservacion({
      show: true,
      detalle: detalle,
      observacion: observacionesDetalle[detalle.idDetalle] || ""
    });
  };

  const cerrarModalObservacion = () => {
    setModalObservacion({ show: false, detalle: null, observacion: "" });
  };

  const guardarObservacion = () => {
    if (modalObservacion.detalle) {
      setObservacionesDetalle(prev => ({
        ...prev,
        [modalObservacion.detalle.idDetalle]: modalObservacion.observacion
      }));
      cerrarModalObservacion();
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
    console.log("Aprobar detalle:", detalle.idDetalle, "Observación:", obs);
    // TODO: Llamar al endpoint para aprobar especialidad individual
    alert("Funcionalidad de aprobar especialidad individual pendiente de implementar");
  };

  const handleRechazarDetalle = async (detalle) => {
    const obs = observacionesDetalle[detalle.idDetalle] || "";
    if (!obs.trim()) {
      alert("Debe ingresar una observación para rechazar la especialidad");
      return;
    }
    if (!window.confirm(`¿Rechazar especialidad ${detalle.nombreServicio}?`)) return;
    console.log("Rechazar detalle:", detalle.idDetalle, "Observación:", obs);
    // TODO: Llamar al endpoint para rechazar especialidad individual
    alert("Funcionalidad de rechazar especialidad individual pendiente de implementar");
  };

  const isEnviado = solicitud?.estado === "ENVIADO";
  const detalles = Array.isArray(solicitud?.detalles) ? solicitud.detalles : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-gray-700" />
                Detalle de Solicitud
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-gray-700 font-medium">{solicitud?.nombreIpress ?? "Cargando..."}</span>

                {solicitud?.estado && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(solicitud.estado)}`}>
                    {solicitud.estado}
                  </span>
                )}

                {solicitud?.periodoDescripcion && (
                  <span className="text-sm text-gray-500">• {solicitud.periodoDescripcion}</span>
                )}
              </div>
            </div>

            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : !solicitud ? (
            <div className="p-8 text-center text-gray-500">No hay datos para mostrar.</div>
          ) : (
            <>
              {/* Resumen (cards) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Solicitud */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <p className="font-semibold text-gray-900">Solicitud</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label="ID Solicitud" value={solicitud.idSolicitud} />
                    <Row label="ID Periodo" value={solicitud.idPeriodo} />
                    <Row label="Total Especialidades" value={solicitud.totalEspecialidades ?? detalles.length} />
                    <Row label="Total Turnos" value={solicitud.totalTurnosSolicitados ?? "—"} />
                  </div>
                </div>

                {/* IPRESS */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <p className="font-semibold text-gray-900">IPRESS</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label="Código RENAES" value={solicitud.codigoRenaes ?? solicitud.codIpress ?? "—"} />
                    <Row label="Nombre IPRESS" value={solicitud.nombreIpress ?? "—"} />
                    <Row label="Red" value={solicitud.nombreRed ?? "—"} icon={<MapPin className="w-4 h-4 text-gray-400" />} />
                  </div>
                </div>

                {/* Usuario */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <p className="font-semibold text-gray-900">Usuario / Contacto</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label="ID Usuario" value={solicitud.idUsuarioCreador ?? "—"} />
                    <Row label="Nombre" value={solicitud.nombreUsuarioCreador ?? solicitud.nombreCompleto ?? "—"} />
                    <Row label="Email" value={solicitud.emailContacto ?? "—"} icon={<Mail className="w-4 h-4 text-gray-400" />} />
                    <Row label="Teléfono" value={solicitud.telefonoContacto ?? "—"} icon={<Phone className="w-4 h-4 text-gray-400" />} />
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Creado:</span>
                    <span className="text-gray-600">{fmtDateTime(solicitud.fechaCreacion ?? solicitud.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Actualizado:</span>
                    <span className="text-gray-600">{fmtDateTime(solicitud.fechaActualizacion ?? solicitud.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Enviado:</span>
                    <span className="text-gray-600">{fmtDateTime(solicitud.fechaEnvio)}</span>
                  </div>
                </div>
              </div>

              {/* Tabla */}
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <h4 className="font-semibold text-gray-900">Especialidades solicitadas</h4>
                  </div>
                  <span className="text-sm text-gray-500">{detalles.length} filas</span>
                </div>

                <div className="overflow-x-auto bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">#</th>
                        <th className="px-4 py-3 text-left font-semibold">Especialidad</th>
                        <th className="px-4 py-3 text-center font-semibold">Estado</th>
                        <th className="px-4 py-3 text-center font-semibold">Requiere</th>
                        <th className="px-4 py-3 text-center font-semibold">TM</th>
                        <th className="px-4 py-3 text-center font-semibold">Mañana</th>
                        <th className="px-4 py-3 text-center font-semibold">Tarde</th>
                        <th className="px-4 py-3 text-center font-semibold">TC</th>
                        <th className="px-4 py-3 text-center font-semibold">TL</th>
                        <th className="px-4 py-3 text-left font-semibold">Observación</th>
                        {isEnviado && <th className="px-4 py-3 text-center font-semibold">Acciones</th>}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {detalles.map((d, idx) => (
                        <tr key={d.idDetalle ?? idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{d.nombreServicio ?? d.nombreEspecialidad}</div>
                            <div className="text-xs text-gray-500">Código: {d.codigoServicio ?? d.codServicio ?? "—"}</div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(d.estado ?? 'PENDIENTE')}`}>
                              {d.estado ?? 'PENDIENTE'}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">{yesNoPill(!!d.requiere)}</td>

                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                              {d.turnoTM ?? 0}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                              {d.turnoManana ?? 0}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                              {d.turnoTarde ?? 0}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">{yesNoPill(!!d.tc)}</td>
                          <td className="px-4 py-3 text-center">{yesNoPill(!!d.tl)}</td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => abrirModalObservacion(d)}
                                disabled={!isEnviado}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                title="Registrar observación"
                              >
                                <MessageSquare className="w-4 h-4" />
                                {observacionesDetalle[d.idDetalle]?.trim() ? "Editar" : "Añadir"}
                              </button>
                              {observacionesDetalle[d.idDetalle]?.trim() && (
                                <span className="text-xs text-green-600 font-medium">✓ Registrada</span>
                              )}
                            </div>
                          </td>

                          {isEnviado && (
                            <td className="px-4 py-3">
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => handleAprobarDetalle(d)}
                                  className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                  title="Aprobar especialidad"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRechazarDetalle(d)}
                                  className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                  title="Rechazar especialidad"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Acciones */}
              {isEnviado && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  {!showRechazoForm ? (
                    <div className="flex flex-col md:flex-row gap-3">
                      <button
                        onClick={() => onAprobar(solicitud.idSolicitud)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Aprobar Solicitud
                      </button>

                      <button
                        onClick={() => setShowRechazoForm(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        Rechazar Solicitud
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
              )}
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
                    Registrar Observación
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
                Observación
              </label>
              <textarea
                value={modalObservacion.observacion}
                onChange={(e) => setModalObservacion(prev => ({ ...prev, observacion: e.target.value }))}
                placeholder="Escriba aquí sus observaciones sobre esta especialidad..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {modalObservacion.observacion.length} caracteres
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={cerrarModalObservacion}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarObservacion}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Observación
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
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-gray-800 font-medium text-right break-all">{value ?? "—"}</div>
    </div>
  );
}
