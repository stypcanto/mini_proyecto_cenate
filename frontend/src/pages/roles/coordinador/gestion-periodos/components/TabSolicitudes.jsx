// src/pages/coordinador/turnos/components/TabSolicitudes.jsx
import React, { useMemo } from "react";
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  Loader2,
  Building2,
  Users,
  TrendingUp,
  Send,
} from "lucide-react";
import { fmtDateTime } from "../utils/ui";

export default function TabSolicitudes({
  solicitudes,
  loading,
  filtros,
  setFiltros,
  onVerDetalle,
  onAprobar,
  onRechazar,
  getEstadoBadge,
  periodos,
}) {
  const safeSolicitudes = Array.isArray(solicitudes) ? solicitudes : [];

  const periodoMap = useMemo(() => {
    const m = new Map();
    (periodos || []).forEach((p) =>
      m.set(Number(p.idPeriodo), p.descripcion ?? p.nombrePeriodo ?? `Periodo ${p.periodo ?? p.idPeriodo}`)
    );
    return m;
  }, [periodos]);

  // Estadísticas de solicitudes
  const stats = useMemo(() => {
    const total = safeSolicitudes.length;
    const enviadas = safeSolicitudes.filter(s => s.estado === "ENVIADO").length;
    const aprobadas = safeSolicitudes.filter(s => s.estado === "APROBADA").length;
    const rechazadas = safeSolicitudes.filter(s => s.estado === "RECHAZADA").length;
    const borradores = safeSolicitudes.filter(s => s.estado === "BORRADOR").length;
    return { total, enviadas, aprobadas, rechazadas, borradores };
  }, [safeSolicitudes]);

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Enviadas</p>
              <p className="text-2xl font-bold text-blue-700">{stats.enviadas}</p>
            </div>
            <Send className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Aprobadas</p>
              <p className="text-2xl font-bold text-green-700">{stats.aprobadas}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium">Rechazadas</p>
              <p className="text-2xl font-bold text-red-700">{stats.rechazadas}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium">Borradores</p>
              <p className="text-2xl font-bold text-gray-700">{stats.borradores}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Panel de filtros mejorado */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="TODAS">Todas</option>
              <option value="BORRADOR">BORRADOR</option>
              <option value="ENVIADO">ENVIADO</option>
              <option value="APROBADA">APROBADA</option>
              <option value="RECHAZADA">RECHAZADA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Período
            </label>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Todos los períodos</option>
              {(periodos || []).map((p) => (
                <option key={p.idPeriodo} value={p.idPeriodo}>
                  {p.descripcion ?? p.nombrePeriodo ?? `Periodo ${p.periodo ?? p.idPeriodo}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Buscar IPRESS
            </label>
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Nombre o código..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Lista de solicitudes mejorada */}
      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando solicitudes...</p>
          </div>
        </div>
      ) : safeSolicitudes.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border border-gray-200">
          <FileText className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron solicitudes</h3>
          <p className="text-gray-500">Ajuste los filtros o espere a que las IPRESS envíen solicitudes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {safeSolicitudes.map((s) => {
            const periodoLabel = periodoMap.get(Number(s.idPeriodo)) ?? `Periodo ${s.idPeriodo}`;
            const isEnviado = s.estado === "ENVIADO";

            return (
              <div
                key={s.idSolicitud}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{s.nombreIpress}</h3>
                          <p className="text-sm text-gray-500">Solicitud #{s.idSolicitud}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getEstadoBadge(s.estado)}`}>
                      {s.estado}
                    </span>
                  </div>

                  {/* Información destacada */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {s.totalTurnosSolicitados !== undefined && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">Total Turnos</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{s.totalTurnosSolicitados}</p>
                      </div>
                    )}

                    {s.totalEspecialidades !== undefined && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-purple-700">Especialidades</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">{s.totalEspecialidades}</p>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">Periodo</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{periodoLabel}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">Fecha Envío</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{fmtDateTime(s.fechaEnvio)}</p>
                    </div>
                  </div>

                  {/* Fechas adicionales */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Creación: <span className="font-medium">{fmtDateTime(s.fechaCreacion || s.createdAt)}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Actualización: <span className="font-medium">{fmtDateTime(s.fechaActualizacion || s.updatedAt)}</span></span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onVerDetalle(s)}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
