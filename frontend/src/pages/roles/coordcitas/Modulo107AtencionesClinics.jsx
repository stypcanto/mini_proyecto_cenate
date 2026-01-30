// ========================================================================
// 🏥 Modulo107AtencionesClinics.jsx – Atenciones Clínicas Módulo 107
// ========================================================================

import React, { useState } from "react";
import { Activity, Search, Filter } from "lucide-react";

export default function Modulo107AtencionesClinics() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Atenciones Clínicas - Módulo 107</h1>
          <p className="text-slate-600">
            Registro y seguimiento de atenciones realizadas a pacientes del Módulo 107
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-lg px-4 py-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar paciente, expediente o especialista..."
                className="flex-1 bg-transparent outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-4 py-2 transition-colors">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Filtrar</span>
            </button>
          </div>
        </div>

        {/* Tabla vacía - Placeholder */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Sin atenciones registradas
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Aún no hay atenciones clínicas registradas. Las atenciones aparecerán aquí una vez que se carguen.
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">📝 Sobre Atenciones Clínicas</h3>
          <p className="text-sm text-slate-700">
            Esta sección permite consultar y gestionar todas las atenciones realizadas a los pacientes del Módulo 107.
            Puedes filtrar por fecha, especialista, tipo de atención y estado.
          </p>
        </div>
      </div>
    </div>
  );
}
