import React, { useState, useMemo } from "react";
import {
  Calendar,
  Loader2,
  Plus,
  Eye,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  MoreVertical,
  X,
} from "lucide-react";

import { fmtDate, safeNum } from "../utils/ui";

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const calcOcupacion = (p) => {
  // Soporta distintos nombres posibles
  const total = safeNum(p.totalTurnos ?? p.turnosDisponibles ?? p.total ?? 0);
  const asignados = safeNum(p.turnosAsignados ?? p.asignados ?? 0);

  // Si tu API ya manda porcentaje:
  if (p.ocupacion != null) return clamp(Number(p.ocupacion));

  if (!total) return 0;
  return clamp((asignados / total) * 100);
};

export default function TabPeriodos({
  periodos,
  loading,
  onTogglePeriodo,
  onCrearPeriodo,
  onVerDetallePeriodo,
  getEstadoBadge,
  onEditarPeriodo,
  onEliminarPeriodo,
  filtros,
  onFiltrosChange,
  aniosDisponibles = [new Date().getFullYear()],
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedFilters, setExpandedFilters] = useState(true);
  const [activeKPIFilter, setActiveKPIFilter] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const kpiFilteredPeriodos = useMemo(() => {
    let filtered = periodos || [];

    if (activeKPIFilter === 'activo') {
      filtered = filtered.filter(p => p.estado === 'ACTIVO');
    } else if (activeKPIFilter === 'cerrado') {
      filtered = filtered.filter(p => p.estado === 'CERRADO');
    }

    return filtered;
  }, [periodos, activeKPIFilter]);

  const sortedPeriodos = useMemo(() => {
    if (!sortConfig.key) return kpiFilteredPeriodos;

    return [...kpiFilteredPeriodos].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'descripcion' || sortConfig.key === 'nombrePeriodo') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [kpiFilteredPeriodos, sortConfig]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white rounded-lg">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Cargando periodos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0A5BA9]" />
          <h2 className="text-base font-bold text-gray-900">Programaciones vigentes</h2>
          <span className="text-xs text-gray-500">({(periodos || []).length})</span>
        </div>

        <button
          onClick={onCrearPeriodo}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0A5BA9] to-[#084a8a] text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:from-[#084a8a] hover:to-[#0A5BA9] transition-all duration-300 active:translate-y-0 active:shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-90" />
          <span>Nueva Programación</span>
        </button>
      </div>

      {/* Collapsible Filters Section */}
      {filtros && onFiltrosChange && (
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
          <button
            onClick={() => setExpandedFilters(!expandedFilters)}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-2">
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters ? 'rotate-180' : ''}`} />
              Filtros Avanzados
            </span>
            {(filtros.estado !== "TODOS" || filtros.anio !== new Date().getFullYear()) && (
              <span className="text-xs font-semibold text-white bg-[#0A5BA9] px-2 py-1 rounded-md">
                {[filtros.estado !== "TODOS" && 'Estado', filtros.anio !== new Date().getFullYear() && 'Año'].filter(Boolean).join(', ')}
              </span>
            )}
          </button>

          {expandedFilters && (
            <div className="px-4 py-3 border-t border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Filtro Estado */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Estado</label>
                  <div className="relative">
                    <select
                      value={filtros.estado || "TODOS"}
                      onChange={(e) => onFiltrosChange({ ...filtros, estado: e.target.value })}
                      className="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] appearance-none"
                    >
                      <option value="TODOS">Todos</option>
                      <option value="ACTIVO">Activo</option>
                      <option value="CERRADO">Cerrado</option>
                      <option value="BORRADOR">Borrador</option>
                    </select>
                    {filtros.estado !== "TODOS" && (
                      <button
                        onClick={() => onFiltrosChange({ ...filtros, estado: "TODOS" })}
                        className="absolute right-6 top-1.5 p-0.5 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtro Año */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Año</label>
                  <div className="relative">
                    <select
                      value={filtros.anio || new Date().getFullYear()}
                      onChange={(e) => onFiltrosChange({ ...filtros, anio: parseInt(e.target.value) })}
                      className="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] appearance-none"
                    >
                      {aniosDisponibles.map(anio => (
                        <option key={anio} value={anio}>{anio}</option>
                      ))}
                    </select>
                    {filtros.anio !== new Date().getFullYear() && (
                      <button
                        onClick={() => onFiltrosChange({ ...filtros, anio: new Date().getFullYear() })}
                        className="absolute right-6 top-1.5 p-0.5 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Clear All Button */}
              {(filtros.estado !== "TODOS" || filtros.anio !== new Date().getFullYear()) && (
                <button
                  onClick={() => onFiltrosChange({ estado: "TODOS", anio: new Date().getFullYear() })}
                  className="w-full px-3 py-1.5 text-xs font-medium text-[#0A5BA9] bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                >
                  Limpiar Todos los Filtros
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {sortedPeriodos.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <Calendar className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {(periodos || []).length === 0 ? 'No hay períodos configurados' : 'No coinciden con los filtros'}
          </h3>
          <p className="text-sm text-gray-500">
            {(periodos || []).length === 0
              ? 'Aperture un nuevo período para comenzar a gestionar solicitudes'
              : 'Intente ajustar los filtros o la búsqueda'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#0A5BA9] to-[#084a8a]">
                <tr>
                  <th
                    className="px-3 py-2.5 text-left text-xs font-bold text-white cursor-pointer hover:bg-blue-700/40 transition-colors"
                    onClick={() => handleSort('descripcion')}
                  >
                    Descripción <SortIcon columnKey="descripcion" />
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-bold text-white">
                    Total
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-bold text-white">
                    Enviadas
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-bold text-white">
                    Iniciadas
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-xs font-bold text-white cursor-pointer hover:bg-blue-700/40 transition-colors"
                    onClick={() => handleSort('estado')}
                  >
                    Estado <SortIcon columnKey="estado" />
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-white">
                    Fechas
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-bold text-white">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedPeriodos.map((p) => {
                  const cantidadSolicitudes = safeNum(p.totalSolicitudes ?? p.cantidadSolicitudes ?? 0);
                  const solicitudesEnviadas = safeNum(p.solicitudesEnviadas ?? 0);
                  const solicitudesIniciadas = safeNum(p.solicitudesIniciadas ?? 0);
                  // const ocupacion = calcOcupacion(p);
                  const isActivo = p.estado === "ACTIVO";
                  const isCerrado = p.estado === "CERRADO";

                  return (
                    <tr
                      key={p.idPeriodo}
                      className="hover:bg-blue-50 transition-colors border-l-4 border-l-transparent hover:border-l-[#0A5BA9]"
                    >
                      <td className="px-3 py-2">
                        <div className="text-xs font-semibold text-gray-900">
                          {p.descripcion ?? p.nombrePeriodo ?? `Periodo ${p.periodo ?? p.idPeriodo}`}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-[#0A5BA9]/10 text-[#0A5BA9] text-xs font-bold border border-[#0A5BA9]/30">
                          {cantidadSolicitudes}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-300">
                          {solicitudesEnviadas}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold border border-amber-300">
                          {solicitudesIniciadas}
                        </span>
                      </td>
                      {/* <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-[60px]">
                            <div
                              className={`h-2 ${
                                ocupacion >= 80 ? 'bg-green-500' :
                                ocupacion >= 50 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${ocupacion}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 min-w-[40px]">
                            {ocupacion.toFixed(1)}%
                          </span>
                        </div>
                      </td> */}
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold border ${getEstadoBadge(p.estado)}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">Inicio:</span>
                            <span className="font-medium">{p.fechaInicio ? fmtDate(p.fechaInicio) : "—"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">Fin:</span>
                            <span className="font-medium">{p.fechaFin ? fmtDate(p.fechaFin) : "—"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          {/* Ver Button - Primary Action */}
                          <button
                            onClick={() => onVerDetallePeriodo?.(p)}
                            className="inline-flex items-center justify-center px-2 py-1.5 bg-[#0A5BA9] text-white rounded-lg hover:bg-[#084a8a] transition-colors font-medium text-xs"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button - solo si está ACTIVO */}
                          <button
                            onClick={() => onEditarPeriodo?.(p)}
                            disabled={p.estado !== "ACTIVO"}
                            className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors ${
                              p.estado === "ACTIVO"
                                ? 'text-[#0A5BA9] hover:bg-blue-100'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title={p.estado === "ACTIVO" ? "Editar fechas" : "Solo se puede editar períodos activos"}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => onEliminarPeriodo?.(p)}
                            className="inline-flex items-center justify-center p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar período"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Toggle Button - Activar/Cerrar */}
                          <button
                            onClick={() => onTogglePeriodo(p)}
                            className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors ${
                              isActivo
                                ? 'text-orange-600 hover:bg-orange-100'
                                : 'text-green-600 hover:bg-green-100'
                            }`}
                            title={isActivo ? "Cerrar período" : "Activar período"}
                          >
                            {isActivo ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

          {/* Footer con contador */}
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-xs">
            <p className="text-gray-600">
              Mostrando <span className="font-semibold">{sortedPeriodos.length}</span> de <span className="font-semibold">{(periodos || []).length}</span> período{sortedPeriodos.length !== 1 ? 's' : ''}
            </p>
            {activeKPIFilter && (
              <button
                onClick={() => setActiveKPIFilter(null)}
                className="text-[#0A5BA9] hover:text-[#084a8a] font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Limpiar filtro
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
