// ========================================================================
// RescatarPacienteEnfermeria.jsx – Rescatar Paciente Módulo Enfermería
// ------------------------------------------------------------------------
// Permite rescatar pacientes en el módulo de enfermería
// ========================================================================

import React from "react";
import { Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RescatarPacienteEnfermeria() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Rescatar Paciente
            </h1>
          </div>

          <div className="text-center py-12">
            <div className="bg-green-50 rounded-xl p-8 border border-green-200">
              <Users className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Módulo en Desarrollo
              </h2>
              <p className="text-gray-500">
                Esta funcionalidad estará disponible próximamente.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
