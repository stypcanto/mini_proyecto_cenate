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

  const sortedPeriodos = useMemo(() => {
    if (!sortConfig.key) return periodos || [];

    return [...(periodos || [])].sort((a, b) => {
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
  }, [periodos, sortConfig]);

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
    <div className="space-y-3">
      {/* Header con botón de crear */}
      <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] rounded-lg shadow-sm p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Historial de Periodos</h2>
          <p className="text-xs text-blue-100 mt-0.5">Administre los periodos de solicitud de turnos</p>
        </div>

        <button
          onClick={onCrearPeriodo}
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#0A5BA9] text-sm font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Aperturar Nuevo Periodo
        </button>
      </div>

      {/* Filtros */}
      {filtros && onFiltrosChange && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            {/* Filtro Estado */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Estado
              </label>
              <select
                value={filtros.estado || "TODOS"}
                onChange={(e) => onFiltrosChange({ ...filtros, estado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TODOS">Todos</option>
                <option value="ACTIVO">Activo</option>
                <option value="CERRADO">Cerrado</option>
                <option value="BORRADOR">Borrador</option>
              </select>
            </div>

            {/* Filtro Año */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Año
              </label>
              <select
                value={filtros.anio || new Date().getFullYear()}
                onChange={(e) => onFiltrosChange({ ...filtros, anio: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {aniosDisponibles.map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
            </div>

            {/* Botón Limpiar Filtros */}
            <div className="flex-shrink-0 pt-6">
              <button
                onClick={() => onFiltrosChange({ estado: "TODOS", anio: new Date().getFullYear() })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-3 text-xs text-gray-600">
            Mostrando <span className="font-semibold">{(periodos || []).length}</span> periodo(s)
            {filtros.estado !== "TODOS" && <span> con estado <span className="font-semibold">{filtros.estado}</span></span>}
            {filtros.anio && <span> del año <span className="font-semibold">{filtros.anio}</span></span>}
          </div>
        </div>
      )}

      {(periodos || []).length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <Calendar className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No hay períodos configurados</h3>
          <p className="text-sm text-gray-500">Aperture un nuevo período para comenzar a gestionar solicitudes</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB]">
                <tr>
                  <th 
                    className="px-3 py-2.5 text-left text-xs font-bold text-white cursor-pointer hover:bg-blue-700/50"
                    onClick={() => handleSort('idPeriodo')}
                  >
                    ID <SortIcon columnKey="idPeriodo" />
                  </th>
                  <th 
                    className="px-3 py-2.5 text-left text-xs font-bold text-white cursor-pointer hover:bg-blue-700/50"
                    onClick={() => handleSort('descripcion')}
                  >
                    Descripción <SortIcon columnKey="descripcion" />
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-bold text-white">
                    Total Solicitudes
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-bold text-white">
                    Solicitudes Enviadas
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-bold text-white">
                    Solicitudes Iniciadas
                  </th>
                  {/* <th className="px-3 py-2.5 text-center text-xs font-bold text-white">
                    Ocupación
                  </th> */}
                  <th 
                    className="px-3 py-2.5 text-center text-xs font-bold text-white cursor-pointer hover:bg-blue-700/50"
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
                    <tr key={p.idPeriodo} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-sm text-gray-900 font-medium">
                        {p.idPeriodo}
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm font-medium text-gray-900">
                          {p.descripcion ?? p.nombrePeriodo ?? `Periodo ${p.periodo ?? p.idPeriodo}`}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          {cantidadSolicitudes}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-8 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          {solicitudesEnviadas}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-8 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
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
                            <Clock className="w-3 h-3" />
                            <span>{p.fechaInicio ? fmtDate(p.fechaInicio) : "—"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{p.fechaFin ? fmtDate(p.fechaFin) : "—"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onVerDetallePeriodo?.(p)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          
                          {/* Botón Editar - solo disponible si está ACTIVO */}
                          <button
                            onClick={() => onEditarPeriodo?.(p)}
                            disabled={p.estado !== "ACTIVO"}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                              p.estado === "ACTIVO"
                                ? 'bg-amber-600 text-white hover:bg-amber-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title={p.estado === "ACTIVO" ? "Editar fechas" : "Solo se puede editar periodos activos"}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          
                          {/* Botón Eliminar */}
                          <button
                            onClick={() => onEliminarPeriodo?.(p)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                            title="Eliminar período"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          
                          {/* Botón Activar/Cerrar */}
                          <button
                            onClick={() => onTogglePeriodo(p)}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                              isActivo
                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                            title={isActivo ? "Cerrar período" : "Activar período"}
                          >
                            {isActivo ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
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
              Mostrando <span className="font-semibold">{sortedPeriodos.length}</span> período{sortedPeriodos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
