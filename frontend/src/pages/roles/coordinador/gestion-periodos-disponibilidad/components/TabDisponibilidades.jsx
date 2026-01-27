// src/pages/coordinador/gestion-periodos-disponibilidad/components/TabDisponibilidades.jsx
import React, { useMemo, useState } from "react";
import {
  Calendar,
  FileText,
  Eye,
  Search,
  Filter,
  Loader2,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { fmtDateTime } from "../utils/ui";

export default function TabDisponibilidades({
  disponibilidades,
  loading,
  filtros,
  setFiltros,
  onVerDetalle,
  getEstadoBadge,
  periodos,
  onConsultar,
}) {
  const safeDisponibilidades = Array.isArray(disponibilidades) ? disponibilidades : [];
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const periodoMap = useMemo(() => {
    const m = new Map();
    (periodos || []).forEach((p) =>
      m.set(Number(p.idPeriodo || p.idDisponibilidad), p.descripcion ?? p.nombrePeriodo ?? `Periodo ${p.periodo ?? p.idPeriodo}`)
    );
    return m;
  }, [periodos]);

  // Ordenamiento
  const sortedDisponibilidades = useMemo(() => {
    if (!sortConfig.key) return safeDisponibilidades;

    return [...safeDisponibilidades].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'nombreMedico' || sortConfig.key === 'nombreServicio') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [safeDisponibilidades, sortConfig]);

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
    <div className="space-y-3">
      {/* Header con título */}
      <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] rounded-lg shadow-sm p-4">
        <div>
          <h2 className="text-xl font-bold text-white">Historial de Disponibilidades</h2>
          <p className="text-xs text-blue-100 mt-0.5">Revise y gestione las disponibilidades médicas enviadas</p>
        </div>
      </div>

      {/* Filtros compactos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <Filter className="w-3 h-3 inline mr-1" />
              Estado
            </label>
            <select
              value={filtros.estado || "TODAS"}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="TODAS">Todas</option>
              <option value="BORRADOR">Borrador</option>
              <option value="ENVIADO">Enviado</option>
              <option value="REVISADO">Revisado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <Calendar className="w-3 h-3 inline mr-1" />
              Período
            </label>
            <select
              value={filtros.periodo || ""}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los períodos</option>
              {(periodos || []).map((p) => (
                <option key={p.idPeriodo || p.idDisponibilidad} value={p.idPeriodo || p.idDisponibilidad}>
                  {p.descripcion ?? p.nombrePeriodo ?? `Periodo ${p.periodo ?? p.idPeriodo}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <Search className="w-3 h-3 inline mr-1" />
              Buscar Médico
            </label>
            <input
              type="text"
              value={filtros.busqueda || ""}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Nombre..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <Search className="w-3 h-3 inline mr-1" />
              Buscar Especialidad
            </label>
            <input
              type="text"
              value={filtros.busquedaEspecialidad || ""}
              onChange={(e) => setFiltros({ ...filtros, busquedaEspecialidad: e.target.value })}
              placeholder="Especialidad..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={onConsultar}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Consultar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla compacta */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Cargando disponibilidades...</p>
          </div>
        </div>
      ) : safeDisponibilidades.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No se encontraron disponibilidades</h3>
          <p className="text-sm text-gray-500">Ajuste los filtros o espere a que los médicos envíen disponibilidades</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB]">
                <tr>
                  <th 
                    className="px-3 py-2.5 text-left text-xs font-bold text-white cursor-pointer hover:bg-blue-700/50"
                    onClick={() => handleSort('idDisponibilidad')}
                  >
                    # <SortIcon columnKey="idDisponibilidad" />
                  </th>
                  <th 
                    className="px-3 py-2.5 text-left text-xs font-bold text-white cursor-pointer hover:bg-blue-700/50"
                    onClick={() => handleSort('nombreMedico')}
                  >
                    Médico <SortIcon columnKey="nombreMedico" />
                  </th>
                  <th 
                    className="px-3 py-2.5 text-left text-xs font-bold text-white cursor-pointer hover:bg-blue-700/50"
                    onClick={() => handleSort('nombreServicio')}
                  >
                    Especialidad <SortIcon columnKey="nombreServicio" />
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-white">
                    Periodo
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-bold text-white">
                    Horas
                  </th>
                  <th 
                    className="px-3 py-2.5 text-center text-xs font-bold text-white cursor-pointer hover:bg-blue-700/50"
                    onClick={() => handleSort('estado')}
                  >
                    Estado <SortIcon columnKey="estado" />
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-white">
                    Fecha Envío
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-bold text-white">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedDisponibilidades.map((d) => {
                  const periodoLabel = periodoMap.get(Number(d.idPeriodo)) ?? `Periodo ${d.periodo || d.idPeriodo}`;
                  const nombreMedico = d.nombreMedico || d.personal?.nombreCompleto || "—";
                  const nombreServicio = d.nombreServicio || d.servicio?.nombreServicio || "—";

                  return (
                    <tr key={d.idDisponibilidad} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-sm text-gray-900 font-medium">
                        {d.idDisponibilidad}
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm font-medium text-gray-900">{nombreMedico}</div>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        {nombreServicio}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        {periodoLabel}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="text-xs">
                          <div className={`font-medium ${d.totalHoras >= (d.horasRequeridas || 0) ? 'text-green-600' : 'text-red-600'}`}>
                            {d.totalHoras || 0}h
                          </div>
                          <div className="text-gray-500">req: {d.horasRequeridas || 0}h</div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold border ${getEstadoBadge(d.estado)}`}>
                          {d.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {fmtDateTime(d.fechaEnvio || d.fechaCreacion)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => onVerDetalle(d)}
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
              Mostrando <span className="font-semibold">{sortedDisponibilidades.length}</span> disponibilidad{sortedDisponibilidades.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
