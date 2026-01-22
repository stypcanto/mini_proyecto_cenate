import React from "react";
import { Calendar, Lock, FileText, TrendingUp, Users, Hash } from "lucide-react";
import { formatFecha, estadoBadgeClass } from "../utils/helpers";

/**
 * =======================================================================
 * Tarjeta detalle Periodo/Solicitud (sin combo)
 * =======================================================================
 */
export default function PeriodoDetalleCard({ periodo, solicitud, modoModal, periodoForzado }) {
  const estado = solicitud?.estado || (modoModal === "NUEVA" ? "BORRADOR" : "—");
  const totalTurnos = solicitud?.totalTurnosSolicitados || 0;
  const totalEspecialidades = solicitud?.totalEspecialidades || 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#0A5BA9] bg-opacity-10 p-1.5 rounded-lg">
              <FileText className="w-4 h-4 text-[#0A5BA9]" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Detalle de la Solicitud</h2>
            {solicitud?.idSolicitud && (
              <span className="text-xs text-slate-500">• Solicitud #{solicitud.idSolicitud}</span>
            )}
          </div>
          
          <div className="flex gap-2 items-center">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${estadoBadgeClass(estado)}`}>
              {estado}
            </span>
            {periodoForzado && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800">
                <Lock className="w-3 h-3" />
                Fijo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contenido en dos columnas */}
      <div className="p-4 grid grid-cols-2 gap-6">
        {/* Columna izquierda: Información de fechas */}
        <div>
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Fechas</h3>
          </div>
          <table className="w-full">
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 pr-4 text-sm font-medium text-slate-600 w-2/5">Creación</td>
                <td className="py-2 text-sm text-slate-900">{formatFecha(solicitud?.fechaCreacion || solicitud?.createdAt)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-sm font-medium text-slate-600">Actualización</td>
                <td className="py-2 text-sm text-slate-900">{formatFecha(solicitud?.fechaActualizacion || solicitud?.updatedAt)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-sm font-medium text-slate-600">Envío</td>
                <td className="py-2 text-sm text-slate-900">{formatFecha(solicitud?.fechaEnvio) || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Columna derecha: Resumen */}
        <div>
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Resumen</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-slate-700">Total Especialidades</span>
              </div>
              <span className="text-lg font-bold text-blue-700">{totalEspecialidades}</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-green-600" />
                <span className="text-sm text-slate-700">Total Turnos</span>
              </div>
              <span className="text-lg font-bold text-green-700">{totalTurnos}</span>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Periodo</div>
              <div className="text-sm font-semibold text-slate-900">{periodo?.descripcion || "—"}</div>
              <div className="text-xs text-slate-600 mt-1">
                {periodo?.periodo} • ID: {periodo?.idPeriodo}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
