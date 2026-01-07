// ========================================================================
// SignosVitalesCard.jsx - Tarjeta de Signos Vitales
// ------------------------------------------------------------------------
// CENATE 2026 | Componente reutilizable para mostrar signos vitales
// ========================================================================

import React from 'react';
import {
  Heart,
  Thermometer,
  Wind,
  Activity,
  Weight,
  Ruler,
  TrendingUp,
  Droplet
} from 'lucide-react';

export default function SignosVitalesCard({ signosVitales, className = '' }) {
  // ============================================================
  // Validación
  // ============================================================
  if (!signosVitales) {
    return (
      <div className={`bg-slate-50 border-2 border-slate-200 rounded-xl p-6 text-center ${className}`}>
        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm font-medium">
          No hay signos vitales registrados
        </p>
      </div>
    );
  }

  // ============================================================
  // Funciones de Evaluación de Rangos
  // ============================================================
  const evaluarTemperatura = (temp) => {
    if (!temp) return { color: 'slate', estado: 'N/A' };
    if (temp < 36.0) return { color: 'blue', estado: 'Hipotermia' };
    if (temp >= 36.0 && temp <= 37.5) return { color: 'green', estado: 'Normal' };
    if (temp > 37.5 && temp <= 38.0) return { color: 'yellow', estado: 'Febrícula' };
    return { color: 'red', estado: 'Fiebre' };
  };

  const evaluarSaturacion = (sat) => {
    if (!sat) return { color: 'slate', estado: 'N/A' };
    if (sat >= 95) return { color: 'green', estado: 'Normal' };
    if (sat >= 90 && sat < 95) return { color: 'yellow', estado: 'Precaución' };
    return { color: 'red', estado: 'Crítico' };
  };

  const evaluarFrecuenciaCardiaca = (fc) => {
    if (!fc) return { color: 'slate', estado: 'N/A' };
    if (fc < 60) return { color: 'blue', estado: 'Bradicardia' };
    if (fc >= 60 && fc <= 100) return { color: 'green', estado: 'Normal' };
    return { color: 'red', estado: 'Taquicardia' };
  };

  const evaluarFrecuenciaRespiratoria = (fr) => {
    if (!fr) return { color: 'slate', estado: 'N/A' };
    if (fr < 12) return { color: 'blue', estado: 'Bradipnea' };
    if (fr >= 12 && fr <= 20) return { color: 'green', estado: 'Normal' };
    return { color: 'red', estado: 'Taquipnea' };
  };

  const evaluarIMC = (imc) => {
    if (!imc) return { color: 'slate', estado: 'N/A', categoria: '' };
    if (imc < 18.5) return { color: 'blue', estado: 'Bajo peso', categoria: 'Desnutrición' };
    if (imc >= 18.5 && imc < 25) return { color: 'green', estado: 'Normal', categoria: 'Peso saludable' };
    if (imc >= 25 && imc < 30) return { color: 'yellow', estado: 'Sobrepeso', categoria: 'Pre-obesidad' };
    if (imc >= 30 && imc < 35) return { color: 'orange', estado: 'Obesidad I', categoria: 'Obesidad leve' };
    if (imc >= 35 && imc < 40) return { color: 'red', estado: 'Obesidad II', categoria: 'Obesidad moderada' };
    return { color: 'red', estado: 'Obesidad III', categoria: 'Obesidad mórbida' };
  };

  // Evaluaciones
  const tempEval = evaluarTemperatura(signosVitales.temperatura);
  const satEval = evaluarSaturacion(signosVitales.saturacionO2);
  const fcEval = evaluarFrecuenciaCardiaca(signosVitales.frecuenciaCardiaca);
  const frEval = evaluarFrecuenciaRespiratoria(signosVitales.frecuenciaRespiratoria);
  const imcEval = evaluarIMC(signosVitales.imc);

  // ============================================================
  // Componente de Signo Individual
  // ============================================================
  const SignoVital = ({ icono: Icono, label, valor, unidad, evaluacion, detalle }) => {
    const colorClasses = {
      green: 'bg-green-50 border-green-200 text-green-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      slate: 'bg-slate-50 border-slate-200 text-slate-600'
    };

    const iconColorClasses = {
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
      blue: 'text-blue-600',
      slate: 'text-slate-400'
    };

    const badgeColorClasses = {
      green: 'bg-green-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      orange: 'bg-orange-500 text-white',
      red: 'bg-red-500 text-white',
      blue: 'bg-blue-500 text-white',
      slate: 'bg-slate-400 text-white'
    };

    return (
      <div className={`border-2 rounded-xl p-4 transition-all hover:shadow-md ${colorClasses[evaluacion.color]}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icono className={`w-5 h-5 ${iconColorClasses[evaluacion.color]}`} />
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {label}
            </span>
          </div>
          {evaluacion.estado !== 'N/A' && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColorClasses[evaluacion.color]}`}>
              {evaluacion.estado}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {valor || '—'}
          </span>
          {unidad && (
            <span className="text-sm font-medium opacity-70">
              {unidad}
            </span>
          )}
        </div>
        {detalle && (
          <p className="text-xs mt-1 opacity-70 font-medium">
            {detalle}
          </p>
        )}
      </div>
    );
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-lg">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Signos Vitales
          </h3>
          <p className="text-sm text-slate-500">
            Mediciones y evaluación clínica
          </p>
        </div>
      </div>

      {/* Grid de Signos Vitales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Presión Arterial */}
        {signosVitales.presionArterial && (
          <div className="border-2 border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-[#0A5BA9]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Presión Arterial
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {signosVitales.presionArterial}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              mmHg (Sistólica/Diastólica)
            </p>
          </div>
        )}

        {/* Temperatura */}
        {signosVitales.temperatura && (
          <SignoVital
            icono={Thermometer}
            label="Temperatura"
            valor={signosVitales.temperatura.toFixed(1)}
            unidad="°C"
            evaluacion={tempEval}
          />
        )}

        {/* Saturación de O2 */}
        {signosVitales.saturacionO2 && (
          <SignoVital
            icono={Droplet}
            label="Saturación O₂"
            valor={signosVitales.saturacionO2}
            unidad="%"
            evaluacion={satEval}
          />
        )}

        {/* Frecuencia Cardíaca */}
        {signosVitales.frecuenciaCardiaca && (
          <SignoVital
            icono={Heart}
            label="Frecuencia Cardíaca"
            valor={signosVitales.frecuenciaCardiaca}
            unidad="lpm"
            evaluacion={fcEval}
            detalle="Latidos por minuto"
          />
        )}

        {/* Frecuencia Respiratoria */}
        {signosVitales.frecuenciaRespiratoria && (
          <SignoVital
            icono={Wind}
            label="Frecuencia Respiratoria"
            valor={signosVitales.frecuenciaRespiratoria}
            unidad="rpm"
            evaluacion={frEval}
            detalle="Respiraciones por minuto"
          />
        )}

        {/* Peso */}
        {signosVitales.pesoKg && (
          <div className="border-2 border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Weight className="w-5 h-5 text-[#0A5BA9]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Peso
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {signosVitales.pesoKg.toFixed(1)}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Kilogramos
            </p>
          </div>
        )}

        {/* Talla */}
        {signosVitales.tallaCm && (
          <div className="border-2 border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-5 h-5 text-[#0A5BA9]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Talla
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {signosVitales.tallaCm.toFixed(0)}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Centímetros
            </p>
          </div>
        )}

        {/* IMC */}
        {signosVitales.imc && (
          <SignoVital
            icono={TrendingUp}
            label="Índice de Masa Corporal"
            valor={signosVitales.imc.toFixed(1)}
            unidad="kg/m²"
            evaluacion={imcEval}
            detalle={imcEval.categoria}
          />
        )}
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-900 font-medium">
          ℹ️ <strong>Nota:</strong> Los rangos de normalidad son orientativos y pueden variar según edad,
          condición física y contexto clínico del paciente.
        </p>
      </div>
    </div>
  );
}
