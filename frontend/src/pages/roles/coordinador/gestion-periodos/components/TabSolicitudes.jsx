// src/pages/coordinador/turnos/components/TabSolicitudes.jsx
import React, { useMemo, useState } from "react";
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
  ChevronDown,
  ChevronUp,
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  // Ordenamiento
  const sortedSolicitudes = useMemo(() => {
    if (!sortConfig.key) return safeSolicitudes;

    return [...safeSolicitudes].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'nombreIpress') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [safeSolicitudes, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline ml-1" /> : 
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  return (
    <div className="space-y-4">
      {/* Estadísticas compactas */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 mb-0.5">Enviadas</p>
              <p className="text-xl font-bold text-blue-700">{stats.enviadas}</p>
            </div>
            <Send className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 mb-0.5">Aprobadas</p>
              <p className="text-xl font-bold text-green-700">{stats.aprobadas}</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 mb-0.5">Rechazadas</p>
              <p className="text-xl font-bold text-red-700">{stats.rechazadas}</p>
            </div>
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Borradores</p>
              <p className="text-xl font-bold text-gray-700">{stats.borradores}</p>
            </div>
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filtros compactos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <Filter className="w-3 h-3 inline mr-1" />
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="TODAS">Todas</option>
              <option value="BORRADOR">BORRADOR</option>
              <option value="ENVIADO">ENVIADO</option>
              <option value="APROBADA">APROBADA</option>
              <option value="RECHAZADA">RECHAZADA</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <Calendar className="w-3 h-3 inline mr-1" />
              Período
            </label>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <Search className="w-3 h-3 inline mr-1" />
              Buscar IPRESS
            </label>
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Nombre o código..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla compacta */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Cargando solicitudes...</p>
          </div>
        </div>
      ) : safeSolicitudes.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No se encontraron solicitudes</h3>
          <p className="text-sm text-gray-500">Ajuste los filtros o espere a que las IPRESS envíen solicitudes</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('idSolicitud')}
                  >
                    # <SortIcon columnKey="idSolicitud" />
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('nombreIpress')}
                  >
                    IPRESS <SortIcon columnKey="nombreIpress" />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    Periodo
                  </th>
                  <th 
                    className="px-3 py-2 text-center text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalEspecialidades')}
                  >
                    Esp. <SortIcon columnKey="totalEspecialidades" />
                  </th>
                  <th 
                    className="px-3 py-2 text-center text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalTurnosSolicitados')}
                  >
                    Turnos <SortIcon columnKey="totalTurnosSolicitados" />
                  </th>
                  <th 
                    className="px-3 py-2 text-center text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('estado')}
                  >
                    Estado <SortIcon columnKey="estado" />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                    Fecha Envío
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedSolicitudes.map((s) => {
                  const periodoLabel = periodoMap.get(Number(s.idPeriodo)) ?? `Periodo ${s.idPeriodo}`;

                  return (
                    <tr key={s.idSolicitud} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-sm text-gray-900 font-medium">
                        {s.idSolicitud}
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{s.nombreIpress}</div>
                          {s.codIpress && (
                            <div className="text-xs text-gray-500">Cód: {s.codIpress}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        {periodoLabel}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                          {s.totalEspecialidades ?? 0}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          {s.totalTurnosSolicitados ?? 0}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold border ${getEstadoBadge(s.estado)}`}>
                          {s.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {fmtDateTime(s.fechaEnvio)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => onVerDetalle(s)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Footer con contador */}
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Mostrando <span className="font-semibold">{sortedSolicitudes.length}</span> solicitud{sortedSolicitudes.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
