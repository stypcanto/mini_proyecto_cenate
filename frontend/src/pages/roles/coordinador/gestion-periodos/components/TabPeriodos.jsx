import React from "react";
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
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 bg-white rounded-xl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando periodos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de crear */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historial de Periodos</h2>
          <p className="text-sm text-gray-600 mt-1">Administre los periodos de solicitud de turnos</p>
        </div>

        <button
          onClick={onCrearPeriodo}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Aperturar Nuevo Periodo
        </button>
      </div>

      {(periodos || []).length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border border-gray-200">
          <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay períodos configurados</h3>
          <p className="text-gray-500">Aperture un nuevo período para comenzar a gestionar solicitudes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {(periodos || []).map((p) => {
            const total = safeNum(p.totalTurnos ?? p.turnosDisponibles ?? p.total ?? 0);
            const asignados = safeNum(p.turnosAsignados ?? p.asignados ?? 0);
            const ocupacion = calcOcupacion(p);
            const isActivo = p.estado === "ACTIVO";
            const isCerrado = p.estado === "CERRADO";

            return (
              <div
                key={p.idPeriodo}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-green-300 transition-all shadow-sm hover:shadow-md overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isActivo ? 'bg-green-100' : isCerrado ? 'bg-orange-100' : 'bg-purple-100'
                        }`}>
                          <Calendar className={`w-5 h-5 ${
                            isActivo ? 'text-green-600' : isCerrado ? 'text-orange-600' : 'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {p.descripcion ?? p.nombrePeriodo ?? `Periodo ${p.periodo ?? p.idPeriodo}`}
                          </h3>
                          <p className="text-sm text-gray-500">ID: {p.idPeriodo}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getEstadoBadge(p.estado)}`}>
                      {p.estado}
                    </span>
                  </div>

                  {/* Estadísticas destacadas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">Total Turnos</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{total}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Asignados</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{asignados}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-700">Ocupación</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-2.5 ${
                                ocupacion >= 80 ? 'bg-green-500' :
                                ocupacion >= 50 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${ocupacion}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-lg font-bold text-purple-700">{ocupacion.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">Disponibles</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-700">{total - asignados}</p>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Fecha de apertura: <span className="font-medium">{p.fechaInicio ? fmtDate(p.fechaInicio) : "—"}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Fecha de cierre: <span className="font-medium">{p.fechaFin ? fmtDate(p.fechaFin) : "—"}</span></span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onVerDetallePeriodo?.(p)}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalle
                    </button>

                    <button
                      onClick={() => onTogglePeriodo(p)}
                      className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-2.5 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md ${
                        isActivo
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      title={isActivo ? "Cerrar período" : "Activar período"}
                    >
                      {isActivo ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          Cerrar Periodo
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Activar Periodo
                        </>
                      )}
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
