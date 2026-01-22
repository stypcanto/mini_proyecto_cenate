import React from "react";
import { Grid, ZoomIn, ZoomOut, Info } from "lucide-react";

/**
 * 🔲 GridPanel - Panel de Cuadrícula ECG Proporcional (v9.2.0)
 *
 * Muestra controles para la cuadrícula superpuesta al ECG.
 * - Cuadrícula estándar ECG (5mm grandes, 1mm pequeños)
 * - Zoom proporcional que mantiene escala
 *
 * @author Styp Canto Rondón
 * @version 9.2.0 (2026-01-21)
 */
export default function GridPanel({ zoomLevel = 100, onGridToggle = () => {} }) {
  return (
    <div className="bg-gradient-to-b from-pink-50 to-rose-50 border-l-4 border-pink-400 p-3 rounded-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-pink-600" />
          <span className="font-bold text-sm text-pink-900">🔲 Cuadrícula ECG</span>
        </div>
        <button
          onClick={onGridToggle}
          className="p-1 hover:bg-pink-200 rounded text-pink-600 transition-colors text-xs"
          title="Ocultar cuadrícula"
        >
          ✕
        </button>
      </div>

      {/* Info */}
      <div className="bg-pink-100 border border-pink-300 rounded p-2 text-xs text-pink-900">
        <div className="flex gap-1">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Cuadrícula proporcional</p>
            <p>La cuadrícula mantiene escala al hacer zoom</p>
          </div>
        </div>
      </div>

      {/* Zoom actual */}
      <div className="bg-white border border-gray-300 rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700">Nivel de zoom:</span>
          <span className="text-sm font-bold text-pink-600">{zoomLevel}%</span>
        </div>

        {/* Barra de zoom visual */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-pink-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(zoomLevel, 200) / 2}%` }}
          />
        </div>

        {/* Controles de zoom */}
        <div className="flex justify-center gap-2 mt-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <ZoomOut size={14} />
            <span>50%</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>200%</span>
            <ZoomIn size={14} />
          </div>
        </div>
      </div>

      {/* Leyenda de cuadrícula */}
      <div className="bg-rose-100 border border-rose-300 rounded p-2 text-xs text-rose-900">
        <p className="font-semibold mb-1">📐 Leyenda:</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-red-400 bg-red-50"></div>
            <span>Cuadro grande = 5mm (200ms)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-red-300 bg-red-50"></div>
            <span>Cuadro pequeño = 1mm (40ms)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
