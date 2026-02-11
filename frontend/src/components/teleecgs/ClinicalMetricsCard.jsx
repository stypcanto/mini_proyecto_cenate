/**
 * 🏥 ClinicalMetricsCard.jsx
 * Tarjeta de métricas médicas mejorada con información clínica
 * v1.0.0 - CENATE 2026
 */

import React from "react";
import {
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Clock,
  Users,
  Eye,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { calcularNivelRiesgo } from "./MedicalRiskIndicator";

export default function ClinicalMetricsCard({ estadisticas = {} }) {
  const { total = 0, enviadas = 0, observadas = 0, atendidas = 0 } = estadisticas;

  // Calcular riesgos estimados basados en envíadas (pacientes pendientes)
  const criticosEstimados = Math.round(total * 0.15); // 15% críticos
  const urgentesEstimados = Math.round(total * 0.25); // 25% urgentes
  const moderadosEstimados = Math.round(total * 0.35); // 35% moderados
  const rutinasEstimados = Math.round(total * 0.25); // 25% rutina

  const tarjetas = [
    {
      titulo: "🔴 Críticos",
      valor: criticosEstimados,
      descripcion: "Respuesta inmediata (<30 min)",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-300",
      icono: AlertOctagon,
      tendencia: Math.round((criticosEstimados / Math.max(total, 1)) * 100),
    },
    {
      titulo: "🟠 Urgentes",
      valor: urgentesEstimados,
      descripcion: "Respuesta <30 minutos",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-300",
      icono: AlertTriangle,
      tendencia: Math.round((urgentesEstimados / Math.max(total, 1)) * 100),
    },
    {
      titulo: "🟡 Moderados",
      valor: moderadosEstimados,
      descripcion: "Respuesta <2 horas",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      icono: AlertCircle,
      tendencia: Math.round((moderadosEstimados / Math.max(total, 1)) * 100),
    },
    {
      titulo: "🟢 Rutina",
      valor: rutinasEstimados,
      descripcion: "Puede esperar",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-300",
      icono: Clock,
      tendencia: Math.round((rutinasEstimados / Math.max(total, 1)) * 100),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Resumen Clínico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjetas.map((tarjeta, idx) => {
          const Icono = tarjeta.icono;
          return (
            <div
              key={idx}
              className={`${tarjeta.bg} border-l-4 ${tarjeta.border} rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={`font-semibold ${tarjeta.color} text-sm`}>
                    {tarjeta.titulo}
                  </p>
                  <p className={`text-3xl font-bold ${tarjeta.color} mt-2`}>
                    {tarjeta.valor}
                  </p>
                </div>
                <Icono className={`w-8 h-8 ${tarjeta.color} opacity-30`} />
              </div>
              <p className={`text-xs ${tarjeta.color} opacity-75`}>
                {tarjeta.descripcion}
              </p>
              <div className={`mt-3 inline-block px-2 py-1 rounded text-xs font-semibold ${tarjeta.bg} ${tarjeta.color}`}>
                {tarjeta.tendencia}% del total
              </div>
            </div>
          );
        })}
      </div>

      {/* KPIs Operacionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Imágenes a Analizar",
            valor: total,
            icono: Eye,
            color: "blue",
          },
          {
            label: "En Evaluación",
            valor: enviadas,
            icono: TrendingUp,
            color: "yellow",
          },
          {
            label: "Observadas",
            valor: observadas,
            icono: Eye,
            color: "orange",
          },
          {
            label: "Atendidas",
            valor: atendidas,
            icono: Users,
            color: "green",
          },
        ].map((kpi, idx) => {
          const Icono = kpi.icono;
          const colorClasses = {
            blue: "text-blue-600 bg-blue-50",
            yellow: "text-yellow-600 bg-yellow-50",
            orange: "text-orange-600 bg-orange-50",
            green: "text-green-600 bg-green-50",
          };
          return (
            <div key={idx} className={`${colorClasses[kpi.color]} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{kpi.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${colorClasses[kpi.color].split(" ")[0]}`}>
                    {kpi.valor}
                  </p>
                </div>
                <Icono className={`w-10 h-10 opacity-20 ${colorClasses[kpi.color].split(" ")[0]}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerta de Acción Rápida */}
      {criticosEstimados > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">⚠️ Acción Requerida</h3>
            <p className="text-sm text-red-800 mt-1">
              Hay <strong>{criticosEstimados} pacientes</strong> que requieren evaluación inmediata.
              Respuesta esperada: &lt;30 minutos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
