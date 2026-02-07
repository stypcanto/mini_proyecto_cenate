/**
 * 📊 Mis EKGs Recientes - Panel Derecho Mejorado
 * Muestra: Estadísticas del día + Últimas 3 cargas + Tooltips de observaciones
 *
 * v1.55.0 - Diseño médico profesional
 */

import React, { useState } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { COLORS, MEDICAL_PALETTE } from '../../config/designSystem';

export default function MisECGsRecientes({
  ultimas3 = [],
  estadisticas = {
    exitosas: 0,
    evaluacion: 0,
    observaciones: 0,
  },
  onVerRegistro = () => {},
  onRefrescar = () => {},
  loading = false,
}) {
  const [expandidoTooltip, setExpandidoTooltip] = useState(null);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 h-fit">
      {/* ==================== ESTADÍSTICAS EN PÍLDORAS ==================== */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">📊 Resumen de Hoy</h3>

        <div className="flex gap-2 flex-wrap">
          {/* Exitosas - Verde */}
          <div className="flex items-center gap-2 bg-green-50 border-2 border-green-300 rounded-full px-4 py-2.5 shadow-sm">
            <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
              {estadisticas.exitosas}
            </div>
            <span className="text-xs font-semibold text-green-900 whitespace-nowrap">
              Exitosas
            </span>
          </div>

          {/* En evaluación - Azul */}
          <div className="flex items-center gap-2 bg-blue-50 border-2 border-blue-300 rounded-full px-4 py-2.5 shadow-sm">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
              {estadisticas.evaluacion}
            </div>
            <span className="text-xs font-semibold text-blue-900 whitespace-nowrap">
              Evaluación
            </span>
          </div>

          {/* Observaciones - Ámbar */}
          <div className="flex items-center gap-2 bg-amber-50 border-2 border-amber-300 rounded-full px-4 py-2.5 shadow-sm">
            <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
              {estadisticas.observaciones}
            </div>
            <span className="text-xs font-semibold text-amber-900 whitespace-nowrap">
              Observaciones
            </span>
          </div>
        </div>
      </div>

      {/* ==================== ÚLTIMAS CARGAS CON TOOLTIPS ==================== */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">🕐 Últimas Cargas</h3>

        {ultimas3.length > 0 ? (
          <div className="space-y-3">
            {ultimas3.map((carga, idx) => {
              const esObservacion = carga.estado === 'OBSERVACION';
              const tooltipAbierto = expandidoTooltip === idx;

              return (
                <div
                  key={idx}
                  className={`relative rounded-lg border-2 transition-all duration-200
                    ${esObservacion
                      ? 'bg-amber-50 border-amber-300 hover:shadow-md hover:border-amber-400'
                      : 'bg-green-50 border-green-300 hover:shadow-md hover:border-green-400'
                    }`}
                >
                  <div className="p-3 flex items-start gap-3">
                    {/* Icono estado */}
                    <div className="flex-shrink-0 mt-0.5">
                      {carga.estado === 'ENVIADA' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                    </div>

                    {/* Info paciente */}
                    <div className="flex-1 min-w-0">
                      {/* Nombre paciente */}
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {carga.nombrePaciente}
                      </p>

                      {/* DNI */}
                      <p className="text-xs text-gray-600 font-mono mt-0.5">
                        DNI: {carga.dni}
                      </p>

                      {/* Tiempo transcurrido */}
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {carga.tiempoTranscurrido}
                      </p>

                      {/* 🔴 TOOLTIP INTEGRADO - Observaciones */}
                      {esObservacion && carga.observacion && (
                        <div
                          className={`mt-3 p-3 bg-white border-l-4 border-amber-600 rounded
                            transition-all duration-300 ease-out cursor-pointer
                            ${tooltipAbierto ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                          onClick={() =>
                            setExpandidoTooltip(tooltipAbierto ? null : idx)
                          }
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-bold text-amber-900 mb-1">
                                📌 Observación del médico:
                              </p>
                              <p className="text-xs text-amber-800 leading-relaxed">
                                "{carga.observacion}"
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Botón expandir/colapsar tooltip (si hay observación) */}
                      {esObservacion && carga.observacion && (
                        <button
                          onClick={() =>
                            setExpandidoTooltip(tooltipAbierto ? null : idx)
                          }
                          className="text-xs text-amber-600 hover:text-amber-700 font-medium mt-2
                            flex items-center gap-1 transition-colors"
                        >
                          {tooltipAbierto ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              Ocultar detalle
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              Ver detalle
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Botón "Ver" - Abre en nueva pestaña (ruta accesible para rol actual) */}
                    <button
                      onClick={() =>
                        window.open(`/teleekgs/listar?dni=${carga.dni}`, '_blank', 'noopener,noreferrer')
                      }
                      className="flex-shrink-0 p-2 hover:bg-blue-100 rounded-lg
                        transition-colors duration-200"
                      title="Ver en nueva pestaña"
                      aria-label={`Ver EKG de ${carga.nombrePaciente} en nueva pestaña`}
                    >
                      <ExternalLink className="w-4 h-4 text-blue-600 hover:text-blue-700" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              No hay cargas recientes. ¡Sube tu primer EKG!
            </p>
          </div>
        )}
      </div>

      {/* ==================== BOTONES DE ACCIÓN ==================== */}
      <div className="flex gap-2">
        {/* Ver Registro Completo - ABRE EN NUEVA PESTAÑA (ruta accesible para rol actual) */}
        <button
          onClick={onVerRegistro}
          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white
            rounded-lg font-semibold text-sm transition-all duration-200
            flex items-center justify-center gap-2 shadow-sm hover:shadow-md
            active:translate-y-0.5"
          title="Abrir registro completo de EKGs en nueva pestaña"
        >
          <ExternalLink className="w-4 h-4" />
          Ver Registro Completo ↗
        </button>

        {/* Refrescar */}
        <button
          onClick={onRefrescar}
          disabled={loading}
          className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800
            rounded-lg font-semibold text-sm transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md
            flex items-center justify-center gap-2"
          title="Refrescar estadísticas"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">🔄</span>
          <span className="sm:hidden">Refrescar</span>
        </button>
      </div>
    </div>
  );
}
