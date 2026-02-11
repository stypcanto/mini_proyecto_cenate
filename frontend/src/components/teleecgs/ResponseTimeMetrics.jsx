/**
 * ⏱️ ResponseTimeMetrics.jsx
 * Métricas de tiempo de respuesta (TAT, SLA)
 *
 * Características:
 * - TAT promedio (general, urgentes, no urgentes)
 * - Indicador de SLA (verde/amarillo/rojo)
 * - Gráfica de tendencia TAT
 * - Meta SLA configurable (15 minutos)
 *
 * @version 1.0.0
 * @since 2026-02-11
 */

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Clock, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const SLA_META = 15; // minutos

export default function ResponseTimeMetrics({ data, loading }) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          ⏱️ Indicadores de Tiempo de Respuesta
        </h3>
        <div className="text-center py-12 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  const {
    tatPromedioMinutos = 0,
    tatPromedioUrgentes = 0,
    tatPromedioNoUrgentes = 0,
    slaCumplimientoPorcentaje = 0,
    tatDiario = {},
  } = data;

  // Determinar color de SLA
  let slaColor = "text-gray-600";
  let slaBg = "bg-gray-50";
  let slaIndicador = "⚪";
  let slaEstado = "Por definir";

  if (slaCumplimientoPorcentaje >= 90) {
    slaColor = "text-green-600";
    slaBg = "bg-green-50";
    slaIndicador = "✅";
    slaEstado = "Excelente";
  } else if (slaCumplimientoPorcentaje >= 70) {
    slaColor = "text-yellow-600";
    slaBg = "bg-yellow-50";
    slaIndicador = "⚠️";
    slaEstado = "Aceptable";
  } else if (slaCumplimientoPorcentaje > 0) {
    slaColor = "text-red-600";
    slaBg = "bg-red-50";
    slaIndicador = "🔴";
    slaEstado = "Crítico";
  }

  // Transformar TAT diario para gráfica
  const chartData = Object.entries(tatDiario || {})
    .map(([fecha, tat]) => ({
      fecha: new Date(fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
      }),
      tat: parseFloat(tat.toFixed(1)),
    }))
    .slice(-14); // Últimas 2 semanas

  const MetricaCard = ({ titulo, valor, unidad, icon: Icon, color, bg }) => (
    <div className={`${bg} rounded-lg p-4 border-l-4 ${color.replace("text-", "border-")}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
            {titulo}
          </p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>
            {valor.toFixed(1)}
          </p>
          <p className="text-xs text-gray-600 mt-1">{unidad}</p>
        </div>
        <Icon className={`${color} opacity-20 w-8 h-8 flex-shrink-0`} />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6 text-blue-600" />
        ⏱️ Indicadores de Tiempo de Respuesta
      </h3>

      {/* Principales KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* TAT Promedio General */}
        <MetricaCard
          titulo="TAT Promedio General"
          valor={tatPromedioMinutos}
          unidad="minutos (envío → evaluación)"
          icon={Clock}
          color="text-blue-600"
          bg="bg-blue-50"
        />

        {/* SLA Cumplimiento */}
        <div className={`${slaBg} rounded-lg p-4 border-l-4 ${slaColor.replace("text-", "border-")}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                Cumplimiento SLA (&lt;{SLA_META} min)
              </p>
              <p className={`text-3xl font-bold mt-2 ${slaColor}`}>
                {slaCumplimientoPorcentaje.toFixed(1)}%
              </p>
              <p className={`text-xs mt-1 font-semibold ${slaColor}`}>
                Estado: {slaIndicador} {slaEstado}
              </p>
            </div>
            {slaCumplimientoPorcentaje >= 90 ? (
              <CheckCircle className={`${slaColor} opacity-20 w-8 h-8 flex-shrink-0`} />
            ) : (
              <AlertCircle className={`${slaColor} opacity-20 w-8 h-8 flex-shrink-0`} />
            )}
          </div>
        </div>
      </div>

      {/* Comparativa Urgentes vs No Urgentes */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-800 mb-4 uppercase">
          📌 Comparativa Urgentes vs No Urgentes
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-600">
            <p className="text-xs text-gray-600 font-medium">TAT Casos Urgentes</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {tatPromedioUrgentes.toFixed(1)}{" "}
              <span className="text-sm">min</span>
            </p>
            {tatPromedioUrgentes <= SLA_META && (
              <p className="text-xs text-green-600 mt-1 font-semibold">
                ✅ Dentro de SLA
              </p>
            )}
          </div>
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
            <p className="text-xs text-gray-600 font-medium">
              TAT Casos No Urgentes
            </p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {tatPromedioNoUrgentes.toFixed(1)}{" "}
              <span className="text-sm">min</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Referencia
            </p>
          </div>
        </div>
      </div>

      {/* Gráfica de Tendencia */}
      {chartData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-4 uppercase">
            📈 Tendencia TAT - Últimos {chartData.length} Días
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: "TAT (min)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                }}
                formatter={(value) => [`${value.toFixed(1)} min`, "TAT"]}
              />
              <Line
                type="monotone"
                dataKey="tat"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
              {/* Línea de meta SLA */}
              <line
                x1="0"
                y1={SLA_META}
                x2="100%"
                y2={SLA_META}
                stroke="#ef4444"
                strokeDasharray="5,5"
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-600 mt-2 text-center">
            <strong>Línea roja punteada:</strong> Meta SLA ({SLA_META} minutos)
          </p>
        </div>
      )}

      {/* Recomendaciones */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-800">
          <strong>💡 Insights:</strong>{" "}
          {slaCumplimientoPorcentaje >= 90
            ? "✅ Excelente desempeño. El equipo está cumpliendo las metas de tiempo de respuesta de manera consistente."
            : slaCumplimientoPorcentaje >= 70
            ? "⚠️ Aceptable pero mejorable. Considere revisar procesos para reducir tiempos de evaluación."
            : "🔴 Crítico. Se requiere acción inmediata para reducir el tiempo de respuesta."}
        </p>
      </div>
    </div>
  );
}
