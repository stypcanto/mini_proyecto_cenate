import React from "react";
import { Info } from "lucide-react";

/**
 * 📐 ReferenciaEscalaPanel - Panel de Referencia de Escala ECG (v9.2.0)
 *
 * Muestra escala de referencia para validar la calidad de captura del ECG.
 * - Referencia visual: 1mm = 0.04s (ECG estándar 25mm/s)
 * - Amplitud: 10mm = 1mV
 *
 * @author Styp Canto Rondón
 * @version 9.2.0 (2026-01-21)
 */
export default function ReferenciaEscalaPanel() {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-blue-50 border-l-4 border-indigo-400 p-3 rounded-lg space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg">📐</span>
        <span className="font-bold text-sm text-indigo-900">Escala de Referencia</span>
      </div>

      {/* Info */}
      <div className="bg-blue-100 border border-blue-300 rounded p-2 text-xs text-blue-900">
        <div className="flex gap-1">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Control de Calidad ECG</p>
            <p>Use esta escala para verificar la calibración de la imagen</p>
          </div>
        </div>
      </div>

      {/* Escala Visual */}
      <div className="bg-white border border-gray-300 rounded p-3">
        <div className="space-y-3">
          {/* Escala horizontal - Tiempo */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">⏱️ Tiempo (horizontal):</p>
            <div className="flex items-center gap-2">
              <div className="w-16 h-4 border-2 border-red-500 bg-red-100 flex items-center justify-center">
                <span className="text-xs font-bold text-red-700">5mm</span>
              </div>
              <span className="text-xs text-gray-600">= 200ms (0.2s)</span>
            </div>
          </div>

          {/* Escala vertical - Amplitud */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">📊 Amplitud (vertical):</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-10 border-2 border-green-500 bg-green-100 flex items-center justify-center">
                <span className="text-xs font-bold text-green-700">10mm</span>
              </div>
              <span className="text-xs text-gray-600">= 1mV</span>
            </div>
          </div>
        </div>
      </div>

      {/* Referencias ECG estándar */}
      <div className="bg-purple-100 border border-purple-300 rounded p-2 text-xs text-purple-900">
        <p className="font-semibold mb-1">📋 Parámetros estándar:</p>
        <div className="space-y-0.5">
          <p>• Velocidad: 25 mm/s</p>
          <p>• Amplitud: 10 mm/mV</p>
          <p>• 1 cuadro pequeño = 1mm = 40ms</p>
          <p>• 1 cuadro grande = 5mm = 200ms</p>
        </div>
      </div>
    </div>
  );
}
