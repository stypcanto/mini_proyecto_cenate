import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

/**
 * 🔍 Panel de Filtros Analíticos
 * v1.72.0 - Filtros dinámicos para analytics
 */
export default function FilterPanelAnalytics({ filtros, ipressesList, onFilterChange, onClear, loading }) {
  const [expanded, setExpanded] = useState(false);

  const handleDateChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleSelectChange = (field, value) => {
    onFilterChange({ [field]: value || null });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Filtros Analíticos</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          {expanded ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => handleDateChange('fechaDesde', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => handleDateChange('fechaHasta', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {/* IPRESS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">IPRESS</label>
            <select
              value={filtros.idIpress || ''}
              onChange={(e) => handleSelectChange('idIpress', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Todas</option>
              {ipressesList.map((ipress) => (
                <option key={ipress.id} value={ipress.id}>
                  {ipress.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Evaluación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Evaluación</label>
            <select
              value={filtros.evaluacion || ''}
              onChange={(e) => handleSelectChange('evaluacion', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Todas</option>
              <option value="NORMAL">Normal</option>
              <option value="ANORMAL">Anormal</option>
              <option value="SIN_EVALUAR">Sin Evaluar</option>
            </select>
          </div>
        </div>
      )}

      {/* Botón Limpiar */}
      {expanded && (
        <button
          onClick={onClear}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 font-medium text-sm"
        >
          <X className="w-4 h-4" />
          Limpiar Filtros
        </button>
      )}
    </div>
  );
}
