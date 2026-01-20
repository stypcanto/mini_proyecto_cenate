import React from "react";
import { Calendar, Lock } from "lucide-react";
import { formatFecha } from "../utils/helpers";

/**
 * =======================================================================
 * Tarjeta detalle Periodo/Solicitud (sin combo)
 * =======================================================================
 */
export default function PeriodoDetalleCard({ periodo, solicitud, modoModal, periodoForzado }) {
  const estado = solicitud?.estado || (modoModal === "NUEVA" ? "BORRADOR" : "—");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#0A5BA9]" />
        Periodo y Estado
      </h2>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">Periodo</div>
            <div className="text-lg font-bold text-slate-900">{periodo?.descripcion || "—"}</div>
            <div className="text-sm text-slate-600 mt-1">
              Código: <strong>{periodo?.periodo || "—"}</strong> · ID Periodo:{" "}
              <strong>{periodo?.idPeriodo ?? "—"}</strong>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800">
            <Lock className="w-4 h-4" />
            {periodoForzado ? "Periodo fijo" : "Bloqueado"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Estado</div>
            <div className="font-bold text-slate-900">{estado}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Fecha inicio</div>
            <div className="font-semibold text-slate-800">{formatFecha(periodo?.fechaInicio)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Fecha fin</div>
            <div className="font-semibold text-slate-800">{formatFecha(periodo?.fechaFin)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Fecha creación</div>
            <div className="font-semibold text-slate-800">{formatFecha(solicitud?.createdAt)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Fecha actualización</div>
            <div className="font-semibold text-slate-800">{formatFecha(solicitud?.updatedAt)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Fecha envío</div>
            <div className="font-semibold text-slate-800">{formatFecha(solicitud?.fechaEnvio)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
