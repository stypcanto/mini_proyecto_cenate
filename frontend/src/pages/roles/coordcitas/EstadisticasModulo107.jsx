import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, CheckCircle2, AlertCircle, Clock, Loader } from 'lucide-react';
import { obtenerEstadisticasModulo107 } from '../../../services/formulario107Service';
import toast from 'react-hot-toast';

/**
 * 📊 EstadisticasModulo107 - Tab de Estadísticas del Módulo 107 (v3.0)
 *
 * Dashboard completo con KPIs, distribuciones y evolución temporal
 * Novedad v3.0: Utiliza datos de dim_solicitud_bolsa
 */
export default function EstadisticasModulo107() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const response = await obtenerEstadisticasModulo107();
      setEstadisticas(response);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar estadísticas');
      setEstadisticas(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Error al cargar estadísticas</p>
          <button
            onClick={cargarEstadisticas}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const kpis = estadisticas.kpis || {};
  const porEstado = estadisticas.distribucion_estado || [];
  const porEspecialidad = estadisticas.distribucion_especialidad || [];
  const topIpress = estadisticas.top_10_ipress || [];
  const evolucion = estadisticas.evolucion_temporal || [];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-lg overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Estadísticas del Módulo 107</h2>
        <p className="text-gray-600">Dashboard con métricas clave de rendimiento</p>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Pacientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Total Pacientes</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {kpis.total_pacientes || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </div>

        {/* Atendidos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Atendidos</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {kpis.atendidos || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {kpis.tasa_completacion || 0}% completación
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {kpis.pendientes || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {kpis.pendientes_vencidas || 0} vencidas
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500 opacity-20" />
          </div>
        </div>

        {/* Cancelados */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Cancelados</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {kpis.cancelados || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {kpis.tasa_abandono || 0}% tasa abandono
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500 opacity-20" />
          </div>
        </div>

        {/* Horas Promedio */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Horas Promedio</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {kpis.horas_promedio || 0}h
              </p>
              <p className="text-xs text-gray-500 mt-1">Tiempo atención</p>
            </div>
            <Clock className="w-8 h-8 text-indigo-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Tablas de Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Distribución por Estado */}
        {porEstado.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Distribución por Estado</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Porcentaje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {porEstado.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {item.descripcion || item.estado || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{item.total}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {item.porcentaje}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top 10 IPRESS */}
        {topIpress.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Top 10 IPRESS</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">IPRESS</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Pacientes
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Atendidos
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topIpress.slice(0, 10).map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {item.codigo_ipress || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{item.total}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {item.atendidos || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Distribución por Especialidad */}
      {porEspecialidad.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Distribución por Especialidad
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Especialidad
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Atendidos</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Pendientes
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Completación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {porEspecialidad.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {item.especialidad || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{item.total}</td>
                    <td className="px-4 py-3 text-right text-green-600">{item.atendidos || 0}</td>
                    <td className="px-4 py-3 text-right text-yellow-600">
                      {item.pendientes || 0}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {item.tasa_completacion || 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evolución Temporal */}
      {evolucion.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Evolución Temporal (Últimos 30 días)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Atendidas</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Pendientes</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Canceladas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {evolucion.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {item.fecha || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{item.total || 0}</td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {item.atendidas || 0}
                    </td>
                    <td className="px-4 py-3 text-right text-yellow-600">
                      {item.pendientes || 0}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      {item.canceladas || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
