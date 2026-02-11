import React from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * 📊 Gráfica de Distribución de Diagnósticos
 * v1.72.0 - Componente stub (datos pendientes de backend)
 */
export default function DiagnosticDistributionChart({ data, onSegmentClick, loading }) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Distribución de Hallazgos Clínicos</h3>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <p>Análisis de hallazgos clínicos</p>
          <p className="text-sm text-gray-400 mt-2">Datos no disponibles</p>
        </div>
      )}
    </div>
  );
}
