import React from "react";
import {
  Calendar,
  Loader2,
  Plus,
  Eye,
  ToggleLeft,
  ToggleRight,
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
  onVerDetallePeriodo, // ✅ nuevo
  getEstadoBadge,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Historial de Periodos</h2>

        <button
          onClick={onCrearPeriodo}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Aperturar Nuevo Periodo
        </button>
      </div>

      {(periodos || []).length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">No hay períodos configurados</p>
          <p className="text-sm">Aperture un nuevo período para comenzar</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">PERIODO</th>
                <th className="px-6 py-4 text-left font-semibold">ESTADO</th>
                <th className="px-6 py-4 text-left font-semibold">FECHA APERTURA</th>
                <th className="px-6 py-4 text-left font-semibold">FECHA CIERRE</th>
                <th className="px-6 py-4 text-center font-semibold">TOTAL TURNOS</th>
                <th className="px-6 py-4 text-center font-semibold">TURNOS ASIGNADOS</th>
                <th className="px-6 py-4 text-center font-semibold">OCUPACIÓN</th>
                <th className="px-6 py-4 text-left font-semibold">ACCIONES</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {(periodos || []).map((p) => {
                const total = safeNum(p.totalTurnos ?? p.turnosDisponibles ?? p.total ?? 0);
                const asignados = safeNum(p.turnosAsignados ?? p.asignados ?? 0);
                const ocupacion = calcOcupacion(p);

                return (
                  <tr key={p.idPeriodo} className="hover:bg-gray-50">
                    {/* PERIODO */}
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {p.descripcion ?? p.nombrePeriodo ?? `Periodo ${p.periodo ?? p.idPeriodo}`}
                    </td>

                    {/* ESTADO */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(p.estado)}`}>
                        {p.estado === "ACTIVO" ? "Activo" : p.estado === "CERRADO" ? "Cerrado" : p.estado}
                      </span>
                    </td>

                    {/* FECHA APERTURA */}
                    <td className="px-6 py-4 text-gray-700">
                      {p.fechaInicio ? fmtDate(p.fechaInicio) : "—"}
                    </td>

                    {/* FECHA fin */}
                    <td className="px-6 py-4 text-gray-700">
                      {p.fechaFin ? fmtDate(p.fechaFin) : "—"}
                    </td>

                    {/* TOTAL TURNOS */}
                    <td className="px-6 py-4 text-center text-gray-700">{total}</td>

                    {/* TURNOS ASIGNADOS */}
                    <td className="px-6 py-4 text-center text-gray-700">{asignados}</td>

                    {/* OCUPACIÓN (barra como tu imagen) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-green-500"
                            style={{ width: `${ocupacion}%` }}
                          />
                        </div>
                        <span className="text-gray-700 font-medium text-xs">
                          {ocupacion.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    {/* ACCIONES (Ver detalle + iconos) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => onVerDetallePeriodo?.(p)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver Detalle
                        </button>

                        <div className="flex items-center gap-2">
                          {/* Toggle */}
                          <button
                            onClick={() => onTogglePeriodo(p)}
                            className="w-10 h-10 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center"
                            title={p.estado === "ACTIVO" ? "Cerrar período" : "Activar período"}
                          >
                            {p.estado === "ACTIVO" ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>

                          {/* Ver (iconito) */}
                          <button
                            onClick={() => onVerDetallePeriodo?.(p)}
                            className="w-10 h-10 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center"
                            title="Ver detalle"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
