// ========================================================================
// 📋 AprobacionSolicitudes.jsx – Panel SUPERADMIN (CENATE 2025)
// ------------------------------------------------------------------------
// Panel profesional para que el SUPERADMIN revise, apruebe o rechace
// las solicitudes de registro de nuevos usuarios.
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  AlertTriangle,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../lib/apiClient";

export default function AprobacionSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("PENDIENTE"); // PENDIENTE, TODAS, APROBADA, RECHAZADA
  const [estadisticas, setEstadisticas] = useState({});
  const [modalRechazo, setModalRechazo] = useState({ open: false, solicitudId: null });
  const [motivoRechazo, setMotivoRechazo] = useState("");

  useEffect(() => {
    cargarSolicitudes();
    cargarEstadisticas();
  }, [filtro]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const endpoint =
        filtro === "PENDIENTE"
          ? "/admin/solicitudes-registro/pendientes"
          : "/admin/solicitudes-registro";
      const data = await apiClient.get(endpoint, true);

      // Filtrar en el frontend si se seleccionó un estado específico
      let filtradas = data;
      if (filtro !== "TODAS") {
        // Convertir filtro frontend a estado backend
        const estadoBackend = filtro === "APROBADA" ? "APROBADO" : 
                             filtro === "RECHAZADA" ? "RECHAZADO" : filtro;
        filtradas = data.filter((s) => s.estado === estadoBackend);
      }

      setSolicitudes(filtradas);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      toast.error("Error al cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const data = await apiClient.get("/admin/solicitudes-registro/estadisticas", true);
      setEstadisticas(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  const aprobarSolicitud = async (id) => {
    if (!window.confirm("¿Está seguro de aprobar esta solicitud? Se creará un usuario con las credenciales: Usuario = DNI, Contraseña = @Cenate2025")) {
      return;
    }

    try {
      await apiClient.put(`/admin/solicitudes-registro/${id}/aprobar`, {}, true);
      toast.success("Solicitud aprobada y usuario creado exitosamente");
      cargarSolicitudes();
      cargarEstadisticas();
    } catch (error) {
      console.error("Error al aprobar solicitud:", error);
      toast.error(error.response?.data?.error || "Error al aprobar la solicitud");
    }
  };

  const rechazarSolicitud = async () => {
    if (!motivoRechazo.trim()) {
      toast.error("Debe ingresar un motivo de rechazo");
      return;
    }

    try {
      await apiClient.put(`/admin/solicitudes-registro/${modalRechazo.solicitudId}/rechazar`, {
        motivo: motivoRechazo,
      }, true);
      toast.success("Solicitud rechazada exitosamente");
      setModalRechazo({ open: false, solicitudId: null });
      setMotivoRechazo("");
      cargarSolicitudes();
      cargarEstadisticas();
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      toast.error(error.response?.data?.error || "Error al rechazar la solicitud");
    }
  };

  const getBadgeColor = (estado) => {
    switch (estado) {
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "APROBADO":
      case "APROBADA":
        return "bg-green-100 text-green-800 border-green-300";
      case "RECHAZADO":
      case "RECHAZADA":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getIconoEstado = (estado) => {
    switch (estado) {
      case "PENDIENTE":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "APROBADO":
      case "APROBADA":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "RECHAZADO":
      case "RECHAZADA":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Aprobación de Solicitudes
          </h1>
          <p className="text-slate-600 mt-1">
            Revise y apruebe las solicitudes de registro de nuevos usuarios
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 font-semibold text-sm uppercase tracking-wide">
                Pendientes
              </p>
              <p className="text-4xl font-bold text-yellow-900 mt-2">
                {estadisticas.pendientes || 0}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-600 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold text-sm uppercase tracking-wide">
                Aprobadas
              </p>
              <p className="text-4xl font-bold text-green-900 mt-2">
                {estadisticas.aprobadas || 0}
              </p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-600 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 font-semibold text-sm uppercase tracking-wide">
                Rechazadas
              </p>
              <p className="text-4xl font-bold text-red-900 mt-2">
                {estadisticas.rechazadas || 0}
              </p>
            </div>
            <XCircle className="w-12 h-12 text-red-600 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">Filtrar por:</span>
          {["PENDIENTE", "TODAS", "APROBADA", "RECHAZADA"].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filtro === estado
                  ? "bg-[#0A5BA9] text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {estado}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Solicitudes */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-16 h-16 border-4 border-[#0A5BA9] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">No hay solicitudes {filtro.toLowerCase()}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.idSolicitud}
              className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Header con estado */}
                  <div className="flex items-center gap-3">
                    {getIconoEstado(solicitud.estado)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(
                        solicitud.estado
                      )}`}
                    >
                      {solicitud.estado}
                    </span>
                    <span className="text-sm text-slate-500">
                      Solicitud #{solicitud.idSolicitud}
                    </span>
                    <span className="text-sm text-slate-400">
                      {new Date(solicitud.createdAt).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Información del solicitante */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">
                          {solicitud.nombres} {solicitud.apellidoPaterno}{" "}
                          {solicitud.apellidoMaterno}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium">{solicitud.tipoDocumento}:</span>
                        <span>{solicitud.numeroDocumento}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-600">
                          {solicitud.correoPersonal}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-600">{solicitud.telefono}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-700">
                          {solicitud.nombreIpress}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-600">
                          Nacimiento:{" "}
                          {new Date(solicitud.fechaNacimiento).toLocaleDateString("es-PE")}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">Género:</span> {solicitud.genero === "M" ? "Masculino" : "Femenino"}
                      </div>
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">Tipo:</span> {solicitud.tipoPersonal}
                      </div>
                    </div>
                  </div>

                  {/* Motivo de rechazo (si existe) */}
                  {(solicitud.estado === "RECHAZADO" || solicitud.estado === "RECHAZADA") && solicitud.motivoRechazo && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        <span className="font-semibold">Motivo de rechazo:</span>{" "}
                        {solicitud.motivoRechazo}
                      </p>
                    </div>
                  )}
                </div>

                {/* Botones de acción (solo para pendientes) */}
                {solicitud.estado === "PENDIENTE" && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => aprobarSolicitud(solicitud.idSolicitud)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() =>
                        setModalRechazo({ open: true, solicitudId: solicitud.idSolicitud })
                      }
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Rechazo */}
      {modalRechazo.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Rechazar Solicitud</h3>
            <p className="text-slate-600 mb-4">
              Por favor, indique el motivo del rechazo:
            </p>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ej: Documentación incompleta, datos incorrectos, etc."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setModalRechazo({ open: false, solicitudId: null });
                  setMotivoRechazo("");
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={rechazarSolicitud}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}