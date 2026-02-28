// ============================================================================
// 🩺 GestionCoordinacionMedica.jsx
// Módulo: Gestión de Coordinador Médico (id_modulo = 19)
// Ruta:   /roles/coordinador/gestion-coordinacion-medica
// Acceso: COORD. ESPECIALIDADES | SUPERADMIN
// ============================================================================
import React from 'react';
import { Stethoscope } from 'lucide-react';

export default function GestionCoordinacionMedica() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Stethoscope size={32} className="text-blue-600" />
          Gestión de coordinación médica
        </h1>
        <p className="text-gray-600 mt-2">
          Coordinación y seguimiento de actividades médicas del módulo.
        </p>
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Stethoscope className="w-16 h-16 text-blue-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-500 mb-2">Página en construcción</h2>
        <p className="text-gray-400 text-sm">Las funcionalidades de esta sección estarán disponibles próximamente.</p>
      </div>
    </div>
  );
}
