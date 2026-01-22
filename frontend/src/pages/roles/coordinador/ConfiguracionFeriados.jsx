// ============================================================================
// 📅 ConfiguracionFeriados - Configuración de Días Feriados
// ----------------------------------------------------------------------------
// Módulo para gestionar los días feriados del sistema
// Estado: Placeholder - Pendiente de implementación
// ============================================================================

import React from 'react';

const ConfiguracionFeriados = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Configuración de Feriados
        </h1>
        <p className="text-gray-600 mt-1">
          Gestión de días feriados del sistema
        </p>
      </div>

      {/* Contenido placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Módulo en Desarrollo
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            El módulo de configuración de feriados está siendo desarrollado.
            Próximamente podrás gestionar los días feriados del calendario.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionFeriados;
