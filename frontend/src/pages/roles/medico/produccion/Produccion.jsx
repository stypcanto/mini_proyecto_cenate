/**
 * 📊 Producción.jsx - Dashboard Completo de Productividad Médica (v1.59.0)
 *
 * Panel avanzado que muestra:
 * - KPIs totales: Atendidos, Pendientes, Deserciones, Interconsultas
 * - Gráfico de deserciones por motivo
 * - Análisis de productividad y tendencias
 * - Listado de pacientes pendientes
 * - Calendario interactivo con detalles por día
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Share2,
  Heart,
  RefreshCw,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import gestionPacientesService from '../../../../services/gestionPacientesService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function Produccion() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesActual, setMesActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date());

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await gestionPacientesService.obtenerPacientesMedico();
      setPacientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos de producción');
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener pacientes atendidos en una fecha específica
  const getPacientesDelDia = (fecha) => {
    return pacientes.filter(p => {
      if (p.condicion !== 'Atendido' || !p.fechaAtencion) return false;
      try {
        const fechaAtencion = new Date(p.fechaAtencion);
        return (
          fechaAtencion.getDate() === fecha.getDate() &&
          fechaAtencion.getMonth() === fecha.getMonth() &&
          fechaAtencion.getFullYear() === fecha.getFullYear()
        );
      } catch {
        return false;
      }
    });
  };

  // Obtener todos los días del mes que tienen atenciones
  const getDiasConAtenciones = () => {
    const diasSet = new Set();
    pacientes.forEach(p => {
      if (p.condicion === 'Atendido' && p.fechaAtencion) {
        try {
          const fecha = new Date(p.fechaAtencion);
          if (fecha.getMonth() === mesActual.getMonth() && fecha.getFullYear() === mesActual.getFullYear()) {
            diasSet.add(fecha.getDate());
          }
        } catch {}
      }
    });
    return diasSet;
  };

  const pacientesDiaSeleccionado = getPacientesDelDia(diaSeleccionado);
  const diasConAtenciones = getDiasConAtenciones();

  // ✅ v1.59.0: ESTADÍSTICAS TOTALES (Período completo)
  const statsTotales = {
    atendidos: pacientes.filter(p => p.condicion === 'Atendido').length,
    pendientes: pacientes.filter(p => p.condicion === 'Pendiente').length,
    deserciones: pacientes.filter(p => p.condicion === 'Deserción').length,
    interconsultas: pacientes.filter(p => p.tieneInterconsulta).length,
    cronicas: pacientes.filter(p => p.esCronico).length,
  };

  // ✅ v1.59.0: Análisis de deserciones por motivo
  const deserciones = pacientes.filter(p => p.condicion === 'Deserción');
  const motivosDesercion = {};
  deserciones.forEach(p => {
    if (p.observaciones) {
      const motivo = p.observaciones.split('Razón: ')[1] || 'Otro';
      motivosDesercion[motivo] = (motivosDesercion[motivo] || 0) + 1;
    }
  });

  const datosDeserciones = Object.entries(motivosDesercion).map(([motivo, cantidad]) => ({
    name: motivo,
    value: cantidad
  }));

  // ✅ v1.59.0: Pacientes pendientes (próximos a atender)
  const pacientesPendientes = pacientes.filter(p => p.condicion === 'Pendiente')
    .sort((a, b) => {
      const fechaA = new Date(a.fechaAsignacion || '');
      const fechaB = new Date(b.fechaAsignacion || '');
      return fechaB - fechaA;
    });

  // ✅ v1.59.0: Estadísticas del día seleccionado
  const statsDelDia = {
    total: pacientesDiaSeleccionado.length,
    interconsultas: pacientesDiaSeleccionado.filter(p => p.tieneInterconsulta).length,
    cronicas: pacientesDiaSeleccionado.filter(p => p.esCronico).length,
  };

  // ✅ v1.59.0: Productividad promedio
  const productividadPromedio = statsTotales.atendidos > 0
    ? (statsTotales.atendidos / (diasConAtenciones.size || 1)).toFixed(1)
    : 0;

  // ✅ v1.59.0: Colores para el gráfico de deserciones
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#0ea5e9', '#6366f1'];

  const getColorMotivo = (index) => COLORS[index % COLORS.length];

  // Generar calendario
  const primerDiaDelMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
  const ultimoDiaDelMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
  const diasDelMes = ultimoDiaDelMes.getDate();
  const diaInicialSemana = primerDiaDelMes.getDay();

  const mesAnterior = () => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1));
  const mesSiguiente = () => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1));

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      const partes = fecha.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (!partes) return '-';
      return `${partes[3]}/${partes[2]}/${partes[1]}`;
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#0A5BA9] mx-auto mb-4" />
          <p className="text-gray-600">Cargando producción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-[#0A5BA9]" />
            <h1 className="text-3xl font-bold text-gray-900">📊 Mi Productividad</h1>
          </div>
          <p className="text-gray-600 font-medium">Análisis completo de tu desempeño médico</p>
        </div>

        {/* ✅ v1.59.0: KPIs PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Pacientes Atendidos */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Atendidos</p>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-4xl font-bold text-emerald-900">{statsTotales.atendidos}</p>
            <p className="text-xs text-emerald-700 mt-2">Pacientes completamente atendidos</p>
          </div>

          {/* Pacientes Pendientes */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-amber-700 uppercase tracking-wider">Pendientes</p>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-4xl font-bold text-amber-900">{statsTotales.pendientes}</p>
            <p className="text-xs text-amber-700 mt-2">Requieren seguimiento</p>
          </div>

          {/* Deserciones */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-red-700 uppercase tracking-wider">Deserciones</p>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-4xl font-bold text-red-900">{statsTotales.deserciones}</p>
            <p className="text-xs text-red-700 mt-2">Pacientes que no asistieron</p>
          </div>

          {/* Interconsultas */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-purple-700 uppercase tracking-wider">Interconsultas</p>
              <Share2 className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-4xl font-bold text-purple-900">{statsTotales.interconsultas}</p>
            <p className="text-xs text-purple-700 mt-2">Referencias a especialistas</p>
          </div>
        </div>

        {/* SECCIÓN DE ANÁLISIS DE DESERCIONES Y ESTADÍSTICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Deserciones */}
          {datosDeserciones.length > 0 && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Deserciones por Motivo
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosDeserciones}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datosDeserciones.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorMotivo(index)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} pacientes`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-4 text-center">
                Total de deserciones: <span className="font-bold text-red-600">{statsTotales.deserciones}</span>
              </p>
            </div>
          )}

          {/* Productividad e Interconsultas */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Análisis de Productividad</h2>
            <div className="space-y-6">
              {/* Productividad Promedio */}
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm text-gray-600 mb-1">Promedio de pacientes/día</p>
                <p className="text-3xl font-bold text-blue-600">{productividadPromedio}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {diasConAtenciones.size > 0 ? `En ${diasConAtenciones.size} días con atenciones` : 'Sin datos disponibles'}
                </p>
              </div>

              {/* Días Activos */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="text-sm text-gray-600 mb-1">Días con atenciones</p>
                <p className="text-3xl font-bold text-green-600">{diasConAtenciones.size}</p>
                <p className="text-xs text-gray-500 mt-1">Este mes</p>
              </div>

              {/* Interconsultas Ratio */}
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="text-sm text-gray-600 mb-1">Tasa de interconsultas</p>
                <p className="text-3xl font-bold text-purple-600">
                  {statsTotales.atendidos > 0
                    ? ((statsTotales.interconsultas / statsTotales.atendidos) * 100).toFixed(1)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {statsTotales.interconsultas} de {statsTotales.atendidos} pacientes referidos
                </p>
              </div>

              {/* Crónicos */}
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <p className="text-sm text-gray-600 mb-1">Pacientes crónicos registrados</p>
                <p className="text-3xl font-bold text-red-600">{statsTotales.cronicas}</p>
                <p className="text-xs text-gray-500 mt-1">Con enfermedades crónicas</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE PACIENTES PENDIENTES */}
        {pacientesPendientes.length > 0 && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Pacientes Pendientes de Atender ({pacientesPendientes.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Paciente</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">DNI</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Teléfono</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">IPRESS</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha Asignación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pacientesPendientes.slice(0, 10).map((paciente, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{paciente.apellidosNombres}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{paciente.numDoc}</td>
                      <td className="px-4 py-3 text-gray-600">{paciente.telefono || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{paciente.ipress || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{formatearFecha(paciente.fechaAsignacion)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pacientesPendientes.length > 10 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  ... y {pacientesPendientes.length - 10} más pendientes
                </p>
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN DE CALENDARIO Y DETALLES POR DÍA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              {/* Navegación de meses */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={mesAnterior}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="font-semibold text-gray-900">
                  {mesActual.toLocaleString('es-PE', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={mesSiguiente}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(dia => (
                  <div key={dia} className="text-center text-xs font-semibold text-gray-600">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-2">
                {/* Espacios vacíos al inicio */}
                {Array.from({ length: diaInicialSemana }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Días del mes */}
                {Array.from({ length: diasDelMes }).map((_, i) => {
                  const dia = i + 1;
                  const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
                  const tieneAtenciones = diasConAtenciones.has(dia);
                  const esSeleccionado =
                    diaSeleccionado.getDate() === dia &&
                    diaSeleccionado.getMonth() === mesActual.getMonth() &&
                    diaSeleccionado.getFullYear() === mesActual.getFullYear();

                  return (
                    <button
                      key={dia}
                      onClick={() => setDiaSeleccionado(fecha)}
                      className={`
                        aspect-square rounded-lg font-semibold text-sm flex items-center justify-center
                        transition-all duration-200
                        ${esSeleccionado
                          ? 'bg-[#0A5BA9] text-white shadow-md'
                          : tieneAtenciones
                          ? 'bg-blue-50 text-[#0A5BA9] border-2 border-[#0A5BA9] hover:bg-blue-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }
                      `}
                    >
                      {dia}
                    </button>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-600">
                <p className="mb-2">
                  <span className="inline-block w-3 h-3 bg-[#0A5BA9] rounded mr-2"></span>
                  Día seleccionado
                </p>
                <p>
                  <span className="inline-block w-3 h-3 border-2 border-[#0A5BA9] rounded mr-2"></span>
                  Con atenciones
                </p>
              </div>
            </div>
          </div>

          {/* Detalles del día */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPIs del día seleccionado */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 capitalize">
                {diaSeleccionado.toLocaleString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow">
                  <p className="text-sm text-gray-600 font-medium">Atendidos</p>
                  <p className="text-3xl font-bold text-[#0A5BA9] mt-2">{statsDelDia.total}</p>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow">
                  <p className="text-sm text-gray-600 font-medium">Interconsultas</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{statsDelDia.interconsultas}</p>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow">
                  <p className="text-sm text-gray-600 font-medium">Crónicos</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{statsDelDia.cronicas}</p>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow">
                  <p className="text-sm text-gray-600 font-medium">Recitas</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {pacientesDiaSeleccionado.filter(p => p.tieneRecita).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Listado de pacientes del día */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0A5BA9]" />
                Pacientes atendidos ({pacientesDiaSeleccionado.length})
              </h3>

              {pacientesDiaSeleccionado.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">No hay atenciones este día</p>
                  <p className="text-sm text-gray-500 mt-1">Selecciona otro día para ver detalles</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pacientesDiaSeleccionado.map((paciente, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors duration-150">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{paciente.apellidosNombres}</p>
                          <p className="text-sm text-gray-600">DNI: {paciente.numDoc}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-4">
                          {paciente.tieneRecita && (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                              📋 Recita
                            </span>
                          )}
                          {paciente.tieneInterconsulta && (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                              🔗 Inter
                            </span>
                          )}
                          {paciente.esCronico && (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                              ❤️ Crónico
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 text-sm text-gray-600 gap-2 border-t border-gray-100 pt-2">
                        <p>📞 {paciente.telefono || '-'}</p>
                        <p>🏥 {paciente.ipress || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón actualizar */}
        <div className="mt-8 text-center">
          <button
            onClick={cargarDatos}
            className="px-6 py-2 bg-[#0A5BA9] text-white rounded-lg hover:bg-[#083d78] transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar datos
          </button>
        </div>
      </div>
    </div>
  );
}
