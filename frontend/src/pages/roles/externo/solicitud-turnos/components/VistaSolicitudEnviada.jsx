import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Building2,
  User,
  CheckCircle2,
  Sun,
  Moon,
  Sunrise,
  TrendingUp,
  Users,
  FileText,
  Hash,
  Eye,
  X,
  Search,
  Filter,
} from "lucide-react";

/**
 * Componente para visualizar una solicitud en estado ENVIADO/REVISADO/APROBADO
 */
export default function VistaSolicitudEnviada({ solicitud }) {
  const [modalObservacion, setModalObservacion] = useState(null);
  const [modalFechas, setModalFechas] = useState(null);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    try {
      const d = new Date(fecha);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const anio = d.getFullYear();
      const hora = String(d.getHours()).padStart(2, '0');
      const minuto = String(d.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${anio}, ${hora}:${minuto}`;
    } catch {
      return fecha;
    }
  };

  const formatFechaCorta = (fecha) => {
    if (!fecha) return "—";
    try {
      // Extraer año, mes y día directamente del string para evitar problemas de zona horaria
      const fechaStr = fecha.split('T')[0]; // Obtener solo la parte de fecha "2026-01-01"
      const [anio, mes, dia] = fechaStr.split('-');
      return `${dia}/${mes}/${anio}`;
    } catch {
      return fecha;
    }
  };

  // Filtrar especialidades
  const especialidadesFiltradas = useMemo(() => {
    let resultado = solicitud.detalles || [];

    // Filtro por especialidad
    if (filtroEspecialidad.trim() !== "") {
      resultado = resultado.filter((detalle) =>
        detalle.nombreServicio?.toLowerCase().includes(filtroEspecialidad.toLowerCase())
      );
    }

    // Filtro por estado
    if (filtroEstado !== "TODAS") {
      resultado = resultado.filter((detalle) => detalle.estado === filtroEstado);
    }

    return resultado;
  }, [solicitud.detalles, filtroEspecialidad, filtroEstado]);

  if (!solicitud) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos de la solicitud
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Mejorado */}
      <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Solicitud de Turnos #{solicitud.idSolicitud}</h2>
            </div>
            <div className="space-y-1 ml-9">
              <p className="text-blue-100 text-sm">
                <span className="font-semibold">Periodo:</span> {solicitud.periodoDescripcion} ({solicitud.periodo})
              </p>
              <p className="text-blue-100 text-sm">
                <span className="font-semibold">Rango:</span> {formatFechaCorta(solicitud.fechaInicio)} - {formatFechaCorta(solicitud.fechaFin)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-md ${
              solicitud.estado === "ENVIADO"
                ? "bg-white text-blue-600"
                : solicitud.estado === "REVISADO"
                ? "bg-yellow-400 text-yellow-900"
                : solicitud.estado === "APROBADA"
                ? "bg-green-400 text-green-900"
                : "bg-red-400 text-red-900"
            }`}>
              {solicitud.estado}
            </span>
            <div className="flex gap-3 text-sm">
              <div className="bg-white/20 px-3 py-1 rounded-md backdrop-blur-sm">
                <span className="font-bold">{solicitud.totalEspecialidades}</span> Especialidades
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-md backdrop-blur-sm">
                <span className="font-bold">{solicitud.totalTurnosSolicitados}</span> Turnos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Información */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card IPRESS */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
            <Building2 className="w-5 h-5 text-[#0A5BA9]" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">IPRESS</h3>
          </div>
          <div className="space-y-2">
            <InfoRow label="Nombre" value={solicitud.nombreIpress} />
            <InfoRow label="RENAES" value={solicitud.codigoRenaes} />
            <InfoRow label="ID" value={solicitud.idIpress} />
          </div>
        </div>

        {/* Card Usuario Creador */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
            <User className="w-5 h-5 text-[#0A5BA9]" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Usuario Creador</h3>
          </div>
          <div className="space-y-2">
            <InfoRow label="Nombre" value={solicitud.nombreUsuarioCreador} />
            <InfoRow label="ID Usuario" value={solicitud.idUsuarioCreador} />
          </div>
        </div>

        {/* Card Fechas */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
            <Clock className="w-5 h-5 text-[#0A5BA9]" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Fechas</h3>
          </div>
          <div className="space-y-2">
            <InfoRow label="Creación" value={formatFecha(solicitud.fechaCreacion)} />
            <InfoRow label="Actualización" value={formatFecha(solicitud.fechaActualizacion)} />
            <InfoRow label="Envío" value={formatFecha(solicitud.fechaEnvio)} />
          </div>
        </div>
      </div>

      {/* Tabla de Especialidades Mejorada */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0A5BA9]" />
              <h3 className="font-bold text-gray-900">Especialidades Solicitadas</h3>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Mostrando {especialidadesFiltradas.length} de {(solicitud.detalles || []).length} especialidad(es)
            </span>
          </div>
          
          {/* Filtros */}
          <div className="flex gap-3">
            {/* Buscar por especialidad */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar especialidad..."
                  value={filtroEspecialidad}
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div className="w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="TODAS">TODAS</option>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="ASIGNADO">ASIGNADO</option>
                  <option value="NO PROCEDE">NO PROCEDE</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0">
              <tr>
                <th className="px-3 py-3 text-left font-bold text-gray-700 w-12">#</th>
                <th className="px-3 py-3 text-left font-bold text-gray-700">Especialidad</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">Estado</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700 bg-purple-50">TM</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700 bg-yellow-50">Mañana</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700 bg-orange-50">Tarde</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700 bg-blue-50">Total</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">TC</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">TL</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">Fechas</th>
                <th className="px-3 py-3 text-center font-bold text-gray-700">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {especialidadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium">
                      {(solicitud.detalles || []).length === 0
                        ? "No hay especialidades registradas"
                        : "No se encontraron especialidades con los filtros aplicados"}
                    </p>
                  </td>
                </tr>
              ) : (
                especialidadesFiltradas.map((detalle, index) => {
                  const totalTurnos = (detalle.turnoTM || 0) + (detalle.turnoManana || 0) + (detalle.turnoTarde || 0);
                  const tieneObservacion = detalle.observacion && detalle.observacion.trim() !== "";
                  const tieneFechas = detalle.fechasDetalle && detalle.fechasDetalle.length > 0;

                  return (
                    <tr key={`${detalle.idDetalle}-${index}`} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-3 py-3 text-gray-600 font-medium">{index + 1}</td>
                      
                      <td className="px-3 py-3">
                        <div className="font-bold text-gray-900">{detalle.nombreServicio}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          <span className="font-medium">Código:</span> {detalle.codigoServicio}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          detalle.estado === "ASIGNADO"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : detalle.estado === "NO PROCEDE"
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : detalle.estado === "PENDIENTE"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-gray-100 text-gray-800 border border-gray-300"
                        }`}>
                          {detalle.estado}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center bg-purple-50/50">
                        <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg text-sm font-bold bg-purple-100 text-purple-700 border-2 border-purple-300 shadow-sm">
                          {detalle.turnoTM || 0}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center bg-yellow-50/50">
                        <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg text-sm font-bold bg-yellow-100 text-yellow-700 border-2 border-yellow-300 shadow-sm">
                          {detalle.turnoManana || 0}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center bg-orange-50/50">
                        <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg text-sm font-bold bg-orange-100 text-orange-700 border-2 border-orange-300 shadow-sm">
                          {detalle.turnoTarde || 0}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center bg-blue-50/50">
                        <span className="inline-flex items-center justify-center w-12 h-10 rounded-lg text-lg font-black bg-blue-100 text-blue-700 border-2 border-blue-400 shadow-md">
                          {totalTurnos}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center">
                        {detalle.tc ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-gray-300 mx-auto" />
                        )}
                      </td>

                      <td className="px-3 py-3 text-center">
                        {detalle.tl ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-gray-300 mx-auto" />
                        )}
                      </td>

                      <td className="px-3 py-3 text-center">
                        {tieneFechas ? (
                          <button
                            onClick={() => setModalFechas(detalle)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver ({detalle.fechasDetalle.length})
                          </button>
                        ) : (
                          <span className="text-gray-400 font-medium">—</span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-center">
                        {tieneObservacion ? (
                          <button
                            onClick={() => setModalObservacion(detalle)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver
                          </button>
                        ) : (
                          <span className="text-gray-400 font-medium">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Observación */}
      {modalObservacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalObservacion(null)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-lg flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Observación</h3>
                <p className="text-blue-100 text-sm">{modalObservacion.nombreServicio}</p>
              </div>
              <button
                onClick={() => setModalObservacion(null)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 leading-relaxed whitespace-pre-wrap">
                {modalObservacion.observacion}
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setModalObservacion(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fechas */}
      {modalFechas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalFechas(null)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-lg flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Fechas Programadas</h3>
                <p className="text-blue-100 text-sm">{modalFechas.nombreServicio}</p>
              </div>
              <button
                onClick={() => setModalFechas(null)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {modalFechas.fechasDetalle.map((fechaItem, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-bold text-blue-800 uppercase">Fecha {idx + 1}</span>
                    </div>
                    <div className="text-lg font-black text-blue-900 mb-1">
                      {formatFechaCorta(fechaItem.fecha)}
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
                      fechaItem.bloque === "MANANA"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-orange-200 text-orange-800"
                    }`}>
                      {fechaItem.bloque === "MANANA" ? <Sunrise className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                      {fechaItem.bloque}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setModalFechas(null)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
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

// Componente auxiliar para filas de información
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-gray-100 last:border-b-0">
      <span className="text-xs text-gray-600 font-medium">{label}:</span>
      <span className="text-sm text-gray-900 font-semibold text-right ml-2">{value ?? "—"}</span>
    </div>
  );
}
