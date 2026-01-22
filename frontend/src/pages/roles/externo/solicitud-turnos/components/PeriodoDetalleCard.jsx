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
    <>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-3 py-2 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#0A5BA9] bg-opacity-10 p-1 rounded">
                <FileText className="w-3.5 h-3.5 text-[#0A5BA9]" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">Detalle de la Solicitud</h2>
              {solicitud?.idSolicitud && (
                <span className="text-xs text-slate-500">• #{solicitud.idSolicitud}</span>
              )}
            </div>
            
            <div className="flex gap-1.5 items-center">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${estadoBadgeClass(estado)}`}>
                {estado}
              </span>
              {periodoForzado && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800">
                  <Lock className="w-3 h-3" />
                  Fijo
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

// Componente separado para las fechas que se renderiza después de la tabla
export function SeccionFechas({ solicitud }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Registro de Fechas</h3>
        </div>
      </div>
      
      {/* Contenido */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Fecha de Creación */}
          <div className="bg-white rounded-lg p-3 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Creación</span>
            </div>
            <p className="text-sm font-bold text-slate-900 ml-10">
              {formatFecha(solicitud?.fechaCreacion || solicitud?.createdAt)}
            </p>
          </div>

          {/* Fecha de Actualización */}
          <div className="bg-white rounded-lg p-3 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Actualización</span>
            </div>
            <p className="text-sm font-bold text-slate-900 ml-10">
              {formatFecha(solicitud?.fechaActualizacion || solicitud?.updatedAt)}
            </p>
          </div>

          {/* Fecha de Envío */}
          <div className="bg-white rounded-lg p-3 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Envío</span>
            </div>
            <p className="text-sm font-bold text-slate-900 ml-10">
              {formatFecha(solicitud?.fechaEnvio) || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
