import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * ⚠️ Tarjeta de Indicadores de Calidad
 * v1.72.0 - Métricas de calidad y alertas
 */
export default function QualityAlertCard({ data, loading }) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-6 h-6 text-yellow-600" />
        <h3 className="text-xl font-bold text-gray-900">Indicadores de Calidad</h3>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Tasa de Rechazo</p>
            <p className="text-2xl font-bold text-blue-600">0%</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Cumplimiento SLA</p>
            <p className="text-2xl font-bold text-green-600">100%</p>
          </div>
        </div>
      )}
    </div>
  );
}
