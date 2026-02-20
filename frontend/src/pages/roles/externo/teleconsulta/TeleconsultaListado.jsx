// ========================================================================
// TeleconsultaListado.jsx – Listado de Pacientes Teleconsulta
// ========================================================================

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Search, Filter, Clock } from "lucide-react";

export default function TeleconsultaListado() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center gap-4 shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Atrás
        </button>
        <div>
          <h1 className="text-xl font-bold">Listado de Pacientes – Teleconsulta</h1>
          <p className="text-blue-100 text-xs mt-0.5">
            Gestión de pacientes para atención por teleconsulta
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por DNI o nombre del paciente..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Estado en construcción */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                Listado de Pacientes Teleconsulta
              </h2>
              <p className="text-slate-500 text-sm max-w-md">
                Esta sección mostrará el listado de pacientes programados para atención
                por teleconsulta desde tu IPRESS. Próximamente disponible.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
              <Clock className="w-4 h-4" />
              <span>Módulo en desarrollo</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
