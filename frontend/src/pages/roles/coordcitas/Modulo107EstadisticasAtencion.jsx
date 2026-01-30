// ========================================================================
// 📊 Modulo107EstadisticasAtencion.jsx – Estadísticas de Atención Módulo 107
// ========================================================================

import React, { useState } from "react";
import { BarChart3, TrendingUp, Calendar, Filter } from "lucide-react";

export default function Modulo107EstadisticasAtencion() {
  const [filterMes, setFilterMes] = useState("");
  const [filterEspecialidad, setFilterEspecialidad] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Estadísticas de Atención - Módulo 107</h1>
          <p className="text-slate-600">
            Análisis de atenciones clínicas y rendimiento del módulo
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mes</label>
              <select
                value={filterMes}
                onChange={(e) => setFilterMes(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los meses</option>
                <option value="01">Enero</option>
                <option value="02">Febrero</option>
                <option value="03">Marzo</option>
                <option value="04">Abril</option>
                <option value="05">Mayo</option>
                <option value="06">Junio</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Especialidad</label>
              <select
                value={filterEspecialidad}
                onChange={(e) => setFilterEspecialidad(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las especialidades</option>
                <option value="medicina">Medicina General</option>
                <option value="psicologia">Psicología</option>
                <option value="nutricion">Nutrición</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Atenciones Realizadas</h3>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">0</p>
            <p className="text-xs text-slate-500 mt-2">Este período</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Pacientes Atendidos</h3>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">0</p>
            <p className="text-xs text-slate-500 mt-2">Únicos</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Tasa de Cumplimiento</h3>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">0%</p>
            <p className="text-xs text-slate-500 mt-2">De atenciones programadas</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Tiempo Promedio</h3>
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">0m</p>
            <p className="text-xs text-slate-500 mt-2">De atención</p>
          </div>
        </div>

        {/* Gráficos placeholder */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Atenciones por Especialidad</h3>
            <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">Gráfico de datos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Tendencia Mensual</h3>
            <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">Gráfico de tendencia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de detalle */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Detalle de Atenciones</h3>
          <div className="text-center py-12">
            <p className="text-slate-500">No hay atenciones registradas para los filtros seleccionados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
