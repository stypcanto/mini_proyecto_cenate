/**
 * 🏥 MedicalRiskIndicator.jsx
 * Indicador visual de riesgo clínico para pacientes con EKGs
 * v1.0.0 - CENATE 2026
 */

import React from "react";
import { AlertCircle, AlertTriangle, AlertOctagon, Clock } from "lucide-react";

/**
 * Calcula el nivel de riesgo basado en:
 * - Tiempo de espera
 * - Indicador de urgencia (esUrgente)
 * - Antecedentes clínicos
 */
function calcularNivelRiesgo(tiempoMinutos, esUrgente = false, edadPaciente = null) {
  // 🔴 CRÍTICO: Si es urgente O tiempo > 60 minutos
  if (esUrgente || tiempoMinutos >= 60) {
    return {
      nivel: "CRÍTICO",
      color: "bg-red-600",
      textColor: "text-red-600",
      bgLight: "bg-red-50",
      borderColor: "border-red-300",
      icono: AlertOctagon,
      tiempo: "⏱️ RESPUESTA INMEDIATA",
    };
  }

  // 🟠 URGENTE: 30-60 minutos
  if (tiempoMinutos >= 30) {
    return {
      nivel: "URGENTE",
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgLight: "bg-orange-50",
      borderColor: "border-orange-300",
      icono: AlertTriangle,
      tiempo: "⏱️ <30 minutos",
    };
  }

  // 🟡 MODERADO: 15-30 minutos
  if (tiempoMinutos >= 15) {
    return {
      nivel: "MODERADO",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgLight: "bg-yellow-50",
      borderColor: "border-yellow-300",
      icono: AlertCircle,
      tiempo: "⏱️ <15 minutos",
    };
  }

  // 🟢 RUTINA: < 15 minutos
  return {
    nivel: "RUTINA",
    color: "bg-green-500",
    textColor: "text-green-600",
    bgLight: "bg-green-50",
    borderColor: "border-green-300",
    icono: Clock,
    tiempo: "⏱️ Puede esperar",
  };
}

export default function MedicalRiskIndicator({
  tiempoTranscurrido,
  esUrgente = false,
  edadPaciente = null,
  tamano = "md", // sm, md, lg
}) {
  // Convertir tiempo transcurrido a minutos
  let tiempoMinutos = 0;
  if (typeof tiempoTranscurrido === "string") {
    if (tiempoTranscurrido.includes("d")) {
      tiempoMinutos = parseInt(tiempoTranscurrido) * 1440;
    } else if (tiempoTranscurrido.includes("h")) {
      tiempoMinutos = parseInt(tiempoTranscurrido) * 60;
    } else if (tiempoTranscurrido.includes("m")) {
      tiempoMinutos = parseInt(tiempoTranscurrido);
    }
  }

  const riesgo = calcularNivelRiesgo(tiempoMinutos, esUrgente, edadPaciente);
  const IconoRiesgo = riesgo.icono;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border ${riesgo.bgLight} ${riesgo.borderColor} ${sizeClasses[tamano]}`}
    >
      <IconoRiesgo className={`w-5 h-5 ${riesgo.textColor}`} />
      <div>
        <div className={`font-semibold ${riesgo.textColor}`}>{riesgo.nivel}</div>
        <div className={`text-xs ${riesgo.textColor} opacity-75`}>{riesgo.tiempo}</div>
      </div>
    </div>
  );
}

export { calcularNivelRiesgo };
