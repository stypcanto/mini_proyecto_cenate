/**
 * 📊 EstadisticasTeleurgencias.jsx (v1.0 - Premium Design)
 *
 * Dashboard de estadísticas agregadas para Coordinador Teleurgencias
 * Muestra datos de todos los médicos que ya han atendido pacientes
 * - KPIs principales (Premium Design)
 * - Tabla de médicos con estadísticas detalladas
 * - Gráficos de productividad
 * - Filtros y búsqueda
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  Users,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader,
  RefreshCw,
  BarChart3,
  TrendingDown,
  Eye,
} from 'lucide-react';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function EstadisticasTeleurgencias() {
  const [medicos, setMedicos] = useState([]);
  const [filtrado, setFiltrado] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [periodo, setPeriodo] = useState('mes'); // 'semana', 'mes', 'año'

  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const response = await apiClient.get('/coordinador-medico/estadisticas/medicos');
      setMedicos(Array.isArray(response) ? response : []);
      setFiltrado(Array.isArray(response) ? response : []);
      toast.success('Estadísticas cargadas');
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setCargando(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let resultado = medicos;

    if (busqueda) {
      resultado = resultado.filter(m =>
        m.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.username?.includes(busqueda)
      );
    }

    setFiltrado(resultado);
  }, [busqueda, medicos]);

  // Calcular KPIs
  const calcularKPIs = () => {
    const totales = {
      medicosActivos: medicos.filter(m => m.atendidos > 0).length,
      atendidosTotal: medicos.reduce((sum, m) => sum + (m.atendidos || 0), 0),
      pendientesTotal: medicos.reduce((sum, m) => sum + (m.pendientes || 0), 0),
      desercionesTotal: medicos.reduce((sum, m) => sum + (m.desertadas || 0), 0),
    };

    const efectividad = totales.atendidosTotal + totales.desercionesTotal > 0
      ? ((totales.atendidosTotal / (totales.atendidosTotal + totales.desercionesTotal)) * 100).toFixed(1)
      : '0';

    return { ...totales, efectividad };
  };

  const kpis = calcularKPIs();

  // Preparar datos para gráfico de barras
  const datosGrafico = filtrado.slice(0, 10).map(m => ({
    nombre: m.nombreCompleto?.split(' ')[0] || m.username,
    atendidos: m.atendidos || 0,
    pendientes: m.pendientes || 0,
    desertadas: m.desertadas || 0,
  }));

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Encabezado */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Estadísticas de Teleurgencias
          </h1>
          <p className="text-gray-600">Análisis agregado de productividad médica</p>
        </div>
        <button
          onClick={cargarDatos}
          className="p-2 hover:bg-gray-200 rounded-lg transition flex items-center gap-2 text-sm font-medium"
          title="Recargar datos"
        >
          <RefreshCw className="w-5 h-5" />
          Actualizar
        </button>
      </div>

      {/* === EXECUTIVE VIEW: 4 KPIs Principales (Premium Design) === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI 1: Médicos Activos - AZUL */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-650 to-blue-800 rounded-lg p-6 shadow-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-100">Médicos Activos</h3>
                <Users className="w-5 h-5 text-blue-100 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
              </div>
              <div className="text-5xl font-bold mb-2">{kpis.medicosActivos}</div>
              <p className="text-sm text-blue-100">con atenciones</p>
            </div>
          </div>
        </div>

        {/* KPI 2: Atendidos - VERDE */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
          <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-650 to-emerald-800 rounded-lg p-6 shadow-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-emerald-100">Atendidos</h3>
                <CheckCircle2 className="w-5 h-5 text-emerald-100 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
              </div>
              <div className="text-5xl font-bold mb-2">{kpis.atendidosTotal}</div>
              <p className="text-sm text-emerald-100">pacientes</p>
            </div>
          </div>
        </div>

        {/* KPI 3: Pendientes - ÁMBAR */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
          <div className={`relative bg-gradient-to-br ${
            kpis.pendientesTotal > 0
              ? 'from-amber-600 via-amber-650 to-amber-800'
              : 'from-emerald-600 via-emerald-650 to-emerald-800'
          } rounded-lg p-6 shadow-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white overflow-hidden`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold opacity-90">Pendientes</h3>
                <Clock className="w-5 h-5 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
              </div>
              <div className="text-5xl font-bold mb-2">{kpis.pendientesTotal}</div>
              <p className="text-sm opacity-90">por atender</p>
            </div>
          </div>
        </div>

        {/* KPI 4: Efectividad - ROJO/VERDE */}
        <div className="group relative">
          <div className={`absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 ${
            kpis.efectividad >= 80
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              : 'bg-gradient-to-br from-red-500 to-red-600'
          }`} />
          <div className={`relative rounded-lg p-6 shadow-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white overflow-hidden bg-gradient-to-br ${
            kpis.efectividad >= 80
              ? 'from-emerald-600 via-emerald-650 to-emerald-800'
              : 'from-red-600 via-red-650 to-red-800'
          }`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold opacity-90">Efectividad</h3>
                <TrendingUp className="w-5 h-5 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
              </div>
              <div className="text-5xl font-bold mb-2">{kpis.efectividad}%</div>
              <p className="text-sm opacity-90">{kpis.efectividad >= 80 ? '✓ Excelente' : '⚠️ Revisar'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg p-4 shadow-md mb-6 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar médico por nombre o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Gráfico de Barras - Top 10 Médicos */}
      {datosGrafico.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Top 10 Médicos por Productividad
          </h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="atendidos" fill="#10b981" name="Atendidos" />
                <Bar dataKey="pendientes" fill="#f59e0b" name="Pendientes" />
                <Bar dataKey="desertadas" fill="#ef4444" name="Desertadas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabla de Médicos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-650 to-blue-700 px-6 py-4 text-white">
          <h2 className="font-bold text-lg">
            📊 Estadísticas de Médicos ({filtrado.length})
          </h2>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Médico
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Atendidos
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Pendientes
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Desertadas
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Tasa Deserción
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtrado.map((medico, idx) => {
                const tasaDesercion = (medico.atendidos + medico.desertadas) > 0
                  ? ((medico.desertadas / (medico.atendidos + medico.desertadas)) * 100).toFixed(1)
                  : '0';

                let nivelAlerta = 'optimo';
                if (parseFloat(tasaDesercion) > 25 || medico.pendientes > 5) nivelAlerta = 'critico';
                else if (parseFloat(tasaDesercion) >= 10) nivelAlerta = 'advertencia';

                const colores = {
                  critico: 'border-l-4 border-red-500 hover:bg-red-50',
                  advertencia: 'border-l-4 border-amber-500 hover:bg-amber-50',
                  optimo: 'border-l-4 border-emerald-500 hover:bg-emerald-50',
                };

                return (
                  <tr key={idx} className={`bg-white transition ${colores[nivelAlerta]}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{medico.nombreCompleto}</p>
                        <p className="text-xs text-gray-500">{medico.username}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-bold text-emerald-600 text-lg">{medico.atendidos || 0}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className={`font-bold text-lg ${
                        (medico.pendientes || 0) > 3 ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {medico.pendientes || 0}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-bold text-red-600 text-lg">{medico.desertadas || 0}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <p className={`font-bold ${
                          nivelAlerta === 'critico' ? 'text-red-600' :
                          nivelAlerta === 'advertencia' ? 'text-amber-600' :
                          'text-emerald-600'
                        }`}>
                          {tasaDesercion}%
                        </p>
                        {nivelAlerta === 'critico' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition">
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
