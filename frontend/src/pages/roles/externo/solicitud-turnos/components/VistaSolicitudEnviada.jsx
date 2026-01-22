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
    <div className="space-y-4">
      {/* Header Compacto */}
      <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] rounded-lg p-4 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5" />
              <h2 className="text-lg font-bold">Solicitud #{solicitud.idSolicitud}</h2>
            </div>
            <div className="space-y-0.5 ml-7">
              <p className="text-blue-100 text-xs">
                <span className="font-semibold">Periodo:</span> {solicitud.periodoDescripcion} ({solicitud.periodo})
              </p>
              <p className="text-blue-100 text-xs">
                <span className="font-semibold">Rango:</span> {formatFechaCorta(solicitud.fechaInicio)} - {formatFechaCorta(solicitud.fechaFin)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
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
            <div className="flex gap-2 text-xs">
              <div className="bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                <span className="font-bold">{solicitud.totalEspecialidades}</span> Esp.
              </div>
              <div className="bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                <span className="font-bold">{solicitud.totalTurnosSolicitados}</span> Turnos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Compacta */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-3 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0A5BA9]" />
              <h3 className="text-sm font-bold text-gray-900">Especialidades Solicitadas</h3>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {especialidadesFiltradas.length} de {(solicitud.detalles || []).length}
            </span>
          </div>
          
          {/* Filtros Compactos */}
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={filtroEspecialidad}
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="w-36">
              <div className="relative">
                <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
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

        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] sticky top-0">
              <tr>
                <th className="px-2 py-2.5 text-left font-bold text-white w-8">#</th>
                <th className="px-2 py-2.5 text-left font-bold text-white">Especialidad</th>
                <th className="px-2 py-2.5 text-center font-bold text-white">Estado</th>
                <th className="px-2 py-2.5 text-center font-bold text-white">TM</th>
                <th className="px-2 py-2.5 text-center font-bold text-white">Mañana</th>
                <th className="px-2 py-2.5 text-center font-bold text-white">Tarde</th>
                <th className="px-2 py-2.5 text-center font-bold text-white">Total</th>
                <th className="px-2 py-2.5 text-center font-bold text-white">TC</th>
                <th className="px-2 py-2.5 text-center font-bold text-white">TL</th>
                <th className="px-2 py-2.5 text-center font-bold text-white">Fechas</th>
                <th className="px-2 py-2.5 text-center font-bold text-white">Obs.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">{especialidadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-medium">
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
                      <td className="px-2 py-2 text-gray-600 font-medium">{index + 1}</td>
                      
                      <td className="px-2 py-2">
                        <div className="font-bold text-gray-900 text-xs">{detalle.nombreServicio}</div>
                        <div className="text-[10px] text-gray-500">
                          {detalle.codigoServicio}
                        </div>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
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

                      <td className="px-2 py-2 text-center bg-purple-50/50">
                        <span className="inline-flex items-center justify-center w-7 h-6 rounded text-xs font-bold bg-purple-100 text-purple-700 border border-purple-300">
                          {detalle.turnoTM || 0}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-center bg-yellow-50/50">
                        <span className="inline-flex items-center justify-center w-7 h-6 rounded text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-300">
                          {detalle.turnoManana || 0}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-center bg-orange-50/50">
                        <span className="inline-flex items-center justify-center w-7 h-6 rounded text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300">
                          {detalle.turnoTarde || 0}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-center bg-blue-50/50">
                        <span className="inline-flex items-center justify-center w-8 h-7 rounded text-sm font-black bg-blue-100 text-blue-700 border-2 border-blue-400">
                          {totalTurnos}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-center">
                        {detalle.tc ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 mx-auto" />
                        )}
                      </td>

                      <td className="px-2 py-2 text-center">
                        {detalle.tl ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 mx-auto" />
                        )}
                      </td>

                      <td className="px-2 py-2 text-center">
                        {tieneFechas ? (
                          <button
                            onClick={() => setModalFechas(detalle)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            {detalle.fechasDetalle.length}
                          </button>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-2 py-2 text-center">
                        {tieneObservacion ? (
                          <button
                            onClick={() => setModalObservacion(detalle)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-gray-400">—</span>
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
            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-6 py-4 rounded-t-lg flex items-center justify-between">
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
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-4 py-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white bg-opacity-20 p-1.5 rounded-lg">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Días Seleccionados</h3>
                  <p className="text-blue-100 text-xs">{modalFechas.nombreServicio} • Código: {modalFechas.codigoServicio}</p>
                </div>
              </div>
              <button
                onClick={() => setModalFechas(null)}
                className="text-white bg-white/20 hover:bg-white/30 rounded-lg p-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 max-h-96">
              <div className="grid grid-cols-2 gap-2">
                {modalFechas.fechasDetalle.map((fechaItem, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-bold text-blue-800 uppercase">Fecha {idx + 1}</span>
                    </div>
                    <div className="text-sm font-black text-blue-900 mb-1.5">
                      {formatFechaCorta(fechaItem.fecha)}
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
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
            <div className="px-4 pb-4">
              <button
                onClick={() => setModalFechas(null)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors text-sm"
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
