import React from "react";
import { Calendar, Lock, FileText, TrendingUp, Users } from "lucide-react";
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
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0A5BA9]" />
          Periodo y Estado
        </h2>
        
        {solicitud?.idSolicitud && (
          <div className="text-sm text-slate-500">
            Solicitud #{solicitud.idSolicitud}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Periodo</div>
            <div className="text-xl font-bold text-slate-900 mb-2">{periodo?.descripcion || "—"}</div>
            <div className="text-sm text-slate-600">
              Código: <strong className="text-slate-800">{periodo?.periodo || "—"}</strong> · ID Periodo:{" "}
              <strong className="text-slate-800">{periodo?.idPeriodo ?? "—"}</strong>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${estadoBadgeClass(estado)}`}>
              {estado}
            </span>
            {periodoForzado && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800">
                <Lock className="w-3.5 h-3.5" />
                Periodo fijo
              </span>
            )}
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Fecha inicio</div>
            <div className="font-semibold text-slate-800 text-sm">{formatFecha(periodo?.fechaInicio)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Fecha fin</div>
            <div className="font-semibold text-slate-800 text-sm">{formatFecha(periodo?.fechaFin)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Fecha creación</div>
            <div className="font-semibold text-slate-800 text-sm">{formatFecha(solicitud?.fechaCreacion || solicitud?.createdAt)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Fecha actualización</div>
            <div className="font-semibold text-slate-800 text-sm">{formatFecha(solicitud?.fechaActualizacion || solicitud?.updatedAt)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Fecha envío</div>
            <div className="font-semibold text-slate-800 text-sm">{formatFecha(solicitud?.fechaEnvio) || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
