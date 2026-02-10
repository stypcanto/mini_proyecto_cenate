// ========================================================================
// 📊 Modulo107EstadisticasAtencion.jsx – Estadísticas de Atención Módulo 107
// ========================================================================

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Calendar, Users, Award, Clock } from "lucide-react";
import { atencionesClinicasService } from "../../../services/atencionesClinicasService";

export default function Modulo107EstadisticasAtencion() {
  // Estados para datos
  const [resumenStats, setResumenStats] = useState(null);
  const [estadisticasMensuales, setEstadisticasMensuales] = useState([]);
  const [estadisticasIpress, setEstadisticasIpress] = useState([]);
  const [estadisticasEspecialidad, setEstadisticasEspecialidad] = useState([]);
  const [estadisticasTipoCita, setEstadisticasTipoCita] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todas las estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar todas las estadísticas en paralelo
      const [
        resumenData,
        mensualesData, 
        ipressData,
        especialidadData,
        tipoCitaData
      ] = await Promise.all([
        atencionesClinicasService.obtenerEstadisticasResumen(),
        atencionesClinicasService.obtenerEstadisticasMensuales(),
        atencionesClinicasService.obtenerEstadisticasIpress(10),
        atencionesClinicasService.obtenerEstadisticasEspecialidad(),
        atencionesClinicasService.obtenerEstadisticasTipoCita()
      ]);

      setResumenStats(resumenData);
      setEstadisticasMensuales(mensualesData.estadisticas || []);
      setEstadisticasIpress(ipressData.estadisticas || []);
      setEstadisticasEspecialidad(especialidadData.estadisticas || []);
      setEstadisticasTipoCita(tipoCitaData.estadisticas || []); 

    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError('Error al cargar las estadísticas. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-800 font-semibold">Error</div>
          <div className="text-red-600">{error}</div>
          <button 
            onClick={cargarEstadisticas}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Estadísticas de Atención - Módulo 107</h1>
            <p className="text-slate-600 mt-1">
              Análisis completo de atenciones clínicas y métricas de rendimiento
            </p>
          </div>
          <button
            onClick={cargarEstadisticas}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualizar
          </button>
        </div>

        {/* KPI Cards - Resumen General */}
        {resumenStats && (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">Total Atenciones</h3>
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{resumenStats.totalAtenciones?.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-2">Registro completo</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">Atendidos</h3>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">{resumenStats.totalAtendidos?.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-2">Completados exitosamente</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">Tasa de Cumplimiento</h3>
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600">{resumenStats.tasaCumplimiento?.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-2">Atenciones completadas</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">Pendientes</h3>
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-600">{resumenStats.totalPendientes?.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-2">En espera de atención</p>
            </div>
          </div>
        )}

        {/* Grid de Estadísticas Detalladas */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Estadísticas Mensuales */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Atenciones por Mes
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {estadisticasMensuales.length > 0 ? estadisticasMensuales.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-700 font-medium">{item.periodo}</span>
                  <span className="text-lg font-bold text-blue-600">{item.totalAtenciones?.toLocaleString()}</span>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-4">No hay datos mensuales disponibles</p>
              )}
            </div>
          </div>

          {/* Top IPRESS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-emerald-600" />
              Top 10 IPRESS
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {estadisticasIpress.length > 0 ? estadisticasIpress.map((item, index) => (
                <div key={index} className="border border-slate-100 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-800 text-sm">{item.nombreIpress}</span>
                    <span className="text-lg font-bold text-emerald-600">{item.totalAtenciones?.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    <span>Código: {item.codigoIpress}</span>
                    {item.red && <span className="ml-2">• {item.red}</span>}
                    {item.macroregion && <span className="ml-2">• {item.macroregion}</span>}
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-4">No hay datos de IPRESS disponibles</p>
              )}
            </div>
          </div>

          {/* Estadísticas por Especialidad */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              Atenciones por Especialidad
            </h3>
            <div className="space-y-3">
              {estadisticasEspecialidad.length > 0 ? estadisticasEspecialidad.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-700">{item.derivacionInterna}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-purple-600">{item.totalAtenciones?.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 ml-2">({item.porcentaje?.toFixed(1)}%)</span>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-4">No hay datos de especialidad disponibles</p>
              )}
            </div>
          </div>

          {/* Estadísticas por Tipo de Cita */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
              Atenciones por Tipo de Cita
            </h3>
            <div className="space-y-3">
              {estadisticasTipoCita.length > 0 ? estadisticasTipoCita.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-700">{item.tipoCita}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-orange-600">{item.totalAtenciones?.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 ml-2">({item.porcentaje?.toFixed(1)}%)</span>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-4">No hay datos de tipo de cita disponibles</p>
              )}
            </div>
          </div>

        </div>

        {/* Footer con última actualización */}
        <div className="text-center text-xs text-slate-500 mt-8">
          Última actualización: {new Date().toLocaleString('es-ES')}
        </div>
      </div>
    </div>
  );
}
