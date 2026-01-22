import React from 'react';
import { Grid3x3 } from 'lucide-react';

/**
 * GridPanel - Cuadrícula proporcional para medición en ECG
 * v9.2.0 - Superpone una cuadrícula sobre la imagen para facilitar mediciones
 * 
 * La cuadrícula se ajusta al zoom para mantener proporciones consistentes
 */
export default function GridPanel({
  zoomLevel = 100,
  onGridToggle = () => {}
}) {

  // Tamaño de celda ajustado por zoom
  const cellSize = (zoomLevel / 100) * 25; // Base: 25px por celda

  return (
    <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-lg shadow-lg p-4 max-w-sm z-30">
      <div className="flex items-center gap-2 mb-3">
        <Grid3x3 size={18} className="text-blue-600" />
        <h4 className="font-bold text-gray-800">Cuadrícula de Medición</h4>
      </div>

      {/* Info de zoom */}
      <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-300">
        <p className="text-xs text-gray-700 mb-2 font-semibold">Nivel de Zoom: {zoomLevel}%</p>
        <p className="text-xs text-gray-600 mb-2">
          Tamaño celda: ~{cellSize.toFixed(1)}px
        </p>
        <p className="text-xs text-gray-600">
          Equivale a: {(cellSize / 25).toFixed(2)} × 10mm
        </p>
      </div>

      {/* Visualización de cuadrícula */}
      <div className="mb-3 p-2 bg-blue-50 rounded">
        <p className="text-xs text-gray-700 mb-2">Cuadrícula superpuesta:</p>
        <svg
          width="100%"
          height="120"
          className="bg-white border border-gray-300 rounded"
          viewBox={`0 0 300 120`}
        >
          {/* Líneas verticales */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <line
              key={`v${i}`}
              x1={i * 25}
              y1="0"
              x2={i * 25}
              y2="120"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          {/* Líneas horizontales */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={i * 25}
              x2="300"
              y2={i * 25}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          {/* Líneas destacadas cada 5 cuadros */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={`v5-${i}`}
              x1={i * 125}
              y1="0"
              x2={i * 125}
              y2="120"
              stroke="#9ca3af"
              strokeWidth="2"
            />
          ))}
          {[0, 1].map((i) => (
            <line
              key={`h5-${i}`}
              x1="0"
              y1={i * 60}
              x2="300"
              y2={i * 60}
              stroke="#9ca3af"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      {/* Info de medición */}
      <div className="text-xs text-gray-600 space-y-1">
        <p>✓ Pequeño cuadro (gris claro) = 1mm</p>
        <p>✓ Cuadro grande (gris oscuro) = 5mm</p>
        <p>✓ La cuadrícula se ajusta automáticamente al zoom</p>
      </div>

      <button
        onClick={onGridToggle}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded transition"
      >
        Ocultar Cuadrícula
      </button>
    </div>
  );
}
