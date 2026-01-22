import React, { useState } from 'react';
import { Ruler } from 'lucide-react';

/**
 * ReferenciaEscalaPanel - Escala de referencia milimétrica para ECG
 * v9.2.0 - Herramienta de medición para validar calibración
 * 
 * En un ECG estándar:
 * - Papel es de 10mm x 10mm
 * - Velocidad de papel: 25 mm/s
 * - 1mm = 0.04 segundos (tiempo)
 * - 1mm = 0.1 mV (voltaje)
 */
export default function ReferenciaEscalaPanel() {
  const [showMeasurements, setShowMeasurements] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg shadow-lg p-4 max-w-xs z-30">
      <div className="flex items-center gap-2 mb-3">
        <Ruler size={18} className="text-blue-600" />
        <h4 className="font-bold text-gray-800">Escala de Referencia</h4>
      </div>

      {/* Escala visual de 10mm */}
      <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-300">
        <p className="text-xs text-gray-700 mb-2 font-semibold">Calibración Estándar:</p>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between items-center">
            <span>Temporal (X):</span>
            <span>1 mm = 0.04 seg</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Voltaje (Y):</span>
            <span>1 mm = 0.1 mV</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Velocidad Papel:</span>
            <span>25 mm/s</span>
          </div>
        </div>
      </div>

      {/* Barra visual de 10mm */}
      <div className="mb-3 p-2 bg-blue-50 rounded">
        <p className="text-xs text-gray-700 mb-2">10 mm de referencia:</p>
        <div className="w-full h-8 bg-white border-l-4 border-r-4 border-red-500 flex items-center justify-center">
          <span className="text-xs text-gray-600">← 10 mm →</span>
        </div>
      </div>

      {/* Toggle para mostrar medidas */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showMeasurements}
          onChange={(e) => setShowMeasurements(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-xs text-gray-700">Mostrar medidas en imagen</span>
      </label>

      <p className="text-xs text-gray-500 mt-3 italic">
        Usa esta escala para validar que el ECG tiene calibración correcta (25 mm/s).
      </p>
    </div>
  );
}
