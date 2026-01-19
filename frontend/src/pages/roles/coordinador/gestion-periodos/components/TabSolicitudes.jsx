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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Filtros */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="TODAS">Todas</option>
              <option value="BORRADOR">BORRADOR</option>
              <option value="ENVIADO">ENVIADO</option>
              <option value="APROBADA">APROBADA</option>
              <option value="RECHAZADA">RECHAZADA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Período
            </label>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Buscar IPRESS (local)
            </label>
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Nombre o código..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : safeSolicitudes.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">No se encontraron solicitudes</p>
          <p className="text-sm">Ajuste los filtros o espere a que las IPRESS envíen solicitudes</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {safeSolicitudes.map((s) => {
            const periodoLabel = periodoMap.get(Number(s.idPeriodo)) ?? `Periodo ${s.idPeriodo}`;
            const isEnviado = s.estado === "ENVIADO";

            return (
              <div key={s.idSolicitud} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{s.nombreIpress}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(s.estado)}`}>
                        {s.estado}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>Solicitud: {s.idSolicitud}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Periodo: {s.idPeriodo} <span className="text-gray-400">•</span> {periodoLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Creación: {fmtDateTime(s.fechaCreacion || s.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Envío: {fmtDateTime(s.fechaEnvio)}</span>
                      </div>

                      <div className="flex items-center gap-2 md:col-span-2">
                        <Users className="w-4 h-4" />
                        <span>Actualización: {fmtDateTime(s.fechaActualizacion || s.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botonera */}
                  <div className="min-w-[190px] flex flex-col gap-2">
                    <button
                      onClick={() => onVerDetalle(s)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalle
                    </button>

                    {isEnviado && (
                      <>
                        <button
                          onClick={() => onAprobar(s.idSolicitud)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Aprobar
                        </button>

                        <button
                          onClick={() => onRechazar(s)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </button>
                      </>
                    )}
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
