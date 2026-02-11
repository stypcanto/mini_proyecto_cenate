/**
 * 📈 ComparativeExecutiveSummary.jsx
 * Resumen ejecutivo con comparativas período actual vs anterior
 *
 * Características:
 * - KPIs principales con tendencias (↑↓)
 * - Comparación automática vs período anterior
 * - Indicadores de color según desempeño
 * - Selector de período
 *
 * @version 1.0.0
 * @since 2026-02-11
 */

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  AlertTriangle,
  Activity,
} from "lucide-react";

const COLORES_TENDENCIA = {
  mejora: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: "text-green-600",
  },
  empeoramiento: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "text-red-600",
  },
  neutral: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
    icon: "text-gray-600",
  },
};

const getTendenciaColor = (cambio, esMejorSiNegativo = false) => {
  if (cambio === undefined || cambio === null) return COLORES_TENDENCIA.neutral;

  const esPositivo = cambio > 0;
  const esMejora = esMejorSiNegativo ? !esPositivo : esPositivo;

  if (Math.abs(cambio) < 0.5) return COLORES_TENDENCIA.neutral;
  return esMejora ? COLORES_TENDENCIA.mejora : COLORES_TENDENCIA.empeoramiento;
};

const TendenciaIndicador = ({ cambio, esMejorSiNegativo = false }) => {
  if (cambio === undefined || cambio === null) {
    return <span className="text-gray-500">—</span>;
  }

  const colors = getTendenciaColor(cambio, esMejorSiNegativo);
  const esPositivo = cambio > 0;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${colors.bg}`}>
      {esPositivo ? (
        <TrendingUp className={`w-3 h-3 ${colors.icon}`} />
      ) : (
        <TrendingDown className={`w-3 h-3 ${colors.icon}`} />
      )}
      <span className={`text-xs font-semibold ${colors.text}`}>
        {esPositivo ? "+" : ""}{cambio.toFixed(1)}%
      </span>
    </div>
  );
};

const KPICard = ({
  titulo,
  valor,
  unidad,
  cambio,
  icono: Icono,
  bgColor,
  esMejorSiNegativo = false,
}) => {
  const colorTendencia = getTendenciaColor(cambio, esMejorSiNegativo);

  return (
    <div className={`${bgColor} rounded-lg p-4 md:p-5 border-l-4 ${colorTendencia.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
            {titulo}
          </p>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-2xl md:text-3xl font-bold text-gray-900">
              {typeof valor === "number" ? valor.toFixed(1) : valor}
            </p>
            <p className="text-xs text-gray-600">{unidad}</p>
          </div>

          {cambio !== undefined && cambio !== null && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-600">
                {esMejorSiNegativo ? "vs período anterior" : "vs período anterior"}
              </span>
              <TendenciaIndicador cambio={cambio} esMejorSiNegativo={esMejorSiNegativo} />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 opacity-10">
          <Icono className="w-8 h-8 md:w-10 md:h-10 text-gray-900" />
        </div>
      </div>
    </div>
  );
};

export default function ComparativeExecutiveSummary({ data, loading }) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          📊 Resumen Ejecutivo
        </h3>
        <div className="text-center py-12 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  const {
    totalEcgs = 0,
    tatPromedioMinutos = 0,
    slaCumplimientoPorcentaje = 0,
    tasaRechazoPorcentaje = 0,
    comparacion = {},
  } = data;

  const {
    cambioVolumenPorcentaje = null,
    cambioTatPorcentaje = null,
    cambioRechazosPorcentaje = null,
  } = comparacion;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 md:p-8 mb-8 text-white">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">📊 Dashboard Analítico</h2>
        <p className="text-blue-100">
          Resumen ejecutivo de métricas de TeleECG
        </p>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total ECGs */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm border border-white border-opacity-20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">
                Total ECGs
              </p>
              <p className="text-3xl font-bold text-white mt-2">{totalEcgs}</p>
              {cambioVolumenPorcentaje !== null && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-blue-100 text-xs">
                    período anterior
                  </span>
                  <TendenciaIndicador cambio={cambioVolumenPorcentaje} />
                </div>
              )}
            </div>
            <Users className="w-8 h-8 text-blue-100 opacity-50" />
          </div>
        </div>

        {/* TAT Promedio */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm border border-white border-opacity-20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">
                TAT Promedio
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {tatPromedioMinutos.toFixed(1)}
              </p>
              <p className="text-blue-100 text-xs mt-1">minutos</p>
              {cambioTatPorcentaje !== null && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-blue-100 text-xs">mejora</span>
                  <TendenciaIndicador cambio={cambioTatPorcentaje} esMejorSiNegativo={true} />
                </div>
              )}
            </div>
            <Clock className="w-8 h-8 text-blue-100 opacity-50" />
          </div>
        </div>

        {/* SLA Cumplimiento */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm border border-white border-opacity-20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">
                SLA Cumplimiento
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {slaCumplimientoPorcentaje.toFixed(1)}%
              </p>
              <p className="text-blue-100 text-xs mt-1">meta: 15 minutos</p>
              {slaCumplimientoPorcentaje >= 90 && (
                <p className="text-green-300 text-xs mt-2 font-semibold">
                  ✅ Excelente
                </p>
              )}
              {slaCumplimientoPorcentaje >= 70 && slaCumplimientoPorcentaje < 90 && (
                <p className="text-yellow-300 text-xs mt-2 font-semibold">
                  ⚠️ Aceptable
                </p>
              )}
              {slaCumplimientoPorcentaje < 70 && (
                <p className="text-red-300 text-xs mt-2 font-semibold">
                  🔴 Crítico
                </p>
              )}
            </div>
            <Activity className="w-8 h-8 text-blue-100 opacity-50" />
          </div>
        </div>

        {/* Tasa Rechazo */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm border border-white border-opacity-20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">
                Tasa Rechazo
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {tasaRechazoPorcentaje.toFixed(1)}%
              </p>
              <p className="text-blue-100 text-xs mt-1">calidad de muestra</p>
              {cambioRechazosPorcentaje !== null && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-blue-100 text-xs">mejora</span>
                  <TendenciaIndicador cambio={cambioRechazosPorcentaje} esMejorSiNegativo={true} />
                </div>
              )}
            </div>
            <AlertTriangle className="w-8 h-8 text-blue-100 opacity-50" />
          </div>
        </div>
      </div>

      {/* Footer con insights */}
      <div className="mt-6 pt-6 border-t border-white border-opacity-20">
        <p className="text-sm text-blue-100">
          💡 {slaCumplimientoPorcentaje >= 90
            ? "✅ Excelente cumplimiento de SLA. El equipo está respondiendo rápidamente."
            : slaCumplimientoPorcentaje >= 70
            ? "⚠️ Cumplimiento aceptable pero hay espacio para mejora en velocidad de respuesta."
            : "🔴 Crítico. Se necesita acción inmediata para mejorar tiempos de evaluación."}
        </p>
      </div>
    </div>
  );
}
