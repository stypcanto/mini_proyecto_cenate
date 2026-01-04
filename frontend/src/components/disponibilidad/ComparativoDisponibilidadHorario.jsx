// ========================================================================
// Comparativo Disponibilidad vs Horario Chatbot
// ------------------------------------------------------------------------
// CENATE 2026 | Componente para verificar inconsistencias de sincronización
// ========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  GitCompare,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  GitMerge,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Stethoscope,
  Database
} from 'lucide-react';
import { integracionHorarioService } from '../../services/integracionHorarioService';
import toast from 'react-hot-toast';

/**
 * Componente de Comparativo Disponibilidad vs Horario Chatbot
 *
 * Permite al coordinador verificar inconsistencias entre lo declarado
 * por los médicos y lo sincronizado en el sistema chatbot.
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
export default function ComparativoDisponibilidadHorario() {
  // ============================================================================
  // ESTADO
  // ============================================================================

  const [periodo, setPeriodo] = useState('');
  const [comparativos, setComparativos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  // Estados para sincronización
  const [sincronizando, setSincronizando] = useState(null); // ID en proceso

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  useEffect(() => {
    // Calcular periodo actual (formato YYYYMM)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setPeriodo(`${year}${month}`);
  }, []);

  useEffect(() => {
    if (periodo) {
      cargarComparativos();
    }
  }, [periodo]);

  // ============================================================================
  // FUNCIONES DE CARGA
  // ============================================================================

  const cargarComparativos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await integracionHorarioService.obtenerComparativosPorPeriodo(periodo);
      setComparativos(data || []);
    } catch (err) {
      console.error('Error al cargar comparativos:', err);
      setError(err.response?.data?.message || 'Error al cargar comparativos');
      toast.error('Error al cargar comparativos del periodo');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FUNCIONES DE PERIODO
  // ============================================================================

  const cambiarPeriodo = (delta) => {
    const year = parseInt(periodo.substring(0, 4));
    const month = parseInt(periodo.substring(4, 6));

    const date = new Date(year, month - 1 + delta, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');

    setPeriodo(`${newYear}${newMonth}`);
  };

  const formatearPeriodo = (periodo) => {
    if (!periodo || periodo.length !== 6) return periodo;
    const year = periodo.substring(0, 4);
    const month = periodo.substring(4, 6);
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // ============================================================================
  // FUNCIONES DE SINCRONIZACIÓN
  // ============================================================================

  const sincronizarItem = async (item) => {
    setSincronizando(item.idDisponibilidad);
    try {
      const data = {
        idDisponibilidad: item.idDisponibilidad,
        idArea: item.idArea // Asumiendo que viene del comparativo
      };

      await integracionHorarioService.sincronizar(data);
      toast.success(`Sincronización completada para ${item.nombreMedico}`);

      // Recargar comparativos
      setTimeout(() => {
        cargarComparativos();
      }, 1500);
    } catch (err) {
      console.error('Error al sincronizar:', err);
      toast.error(err.response?.data?.message || 'Error al sincronizar');
    } finally {
      setSincronizando(null);
    }
  };

  // ============================================================================
  // CÁLCULOS Y FILTROS
  // ============================================================================

  const comparativosFiltrados = useMemo(() => {
    if (filtroEstado === 'TODOS') return comparativos;
    return comparativos.filter(c => c.estadoSincronizacion === filtroEstado);
  }, [comparativos, filtroEstado]);

  const estadisticas = useMemo(() => {
    const total = comparativos.length;
    const sincronizados = comparativos.filter(c => c.estadoSincronizacion === 'SINCRONIZADO').length;
    const conInconsistencias = comparativos.filter(c => c.tieneInconsistencia).length;
    const pendientes = comparativos.filter(c => c.estadoSincronizacion === 'REVISADO').length;

    return { total, sincronizados, conInconsistencias, pendientes };
  }, [comparativos]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getColorInconsistencia = (item) => {
    if (!item.tieneInconsistencia) return 'text-green-600';

    const diferencia = Math.abs(item.horasDeclaradas - item.horasChatbot);
    if (diferencia > 10) return 'text-red-600';
    if (diferencia > 5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getIconoEstado = (estado) => {
    switch (estado) {
      case 'SINCRONIZADO':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'REVISADO':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'ENVIADO':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <XCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <GitCompare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Comparativo Disponibilidad vs Chatbot
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Verificación de sincronización mensual
                </p>
              </div>
            </div>

            {/* Navegación de Periodo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => cambiarPeriodo(-1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>

              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-2 rounded-xl">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">
                  {formatearPeriodo(periodo)}
                </span>
              </div>

              <button
                onClick={() => cambiarPeriodo(1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>

              <button
                onClick={cargarComparativos}
                disabled={loading}
                className="ml-2 p-2 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{estadisticas.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Sincronizados</p>
                  <p className="text-2xl font-bold text-green-900">{estadisticas.sincronizados}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-900">{estadisticas.pendientes}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-700 font-medium">Inconsistencias</p>
                  <p className="text-2xl font-bold text-red-900">{estadisticas.conInconsistencias}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="font-medium text-slate-700">Filtrar por estado:</span>

            <div className="flex gap-2">
              {['TODOS', 'SINCRONIZADO', 'REVISADO', 'ENVIADO'].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filtroEstado === estado
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {estado}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla de Comparativos */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-600">
              <XCircle className="w-16 h-16 mb-4" />
              <p className="text-lg font-semibold">{error}</p>
            </div>
          ) : comparativosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Database className="w-16 h-16 mb-4" />
              <p className="text-lg">No hay comparativos para mostrar</p>
              <p className="text-sm mt-2">
                {filtroEstado !== 'TODOS'
                  ? `No hay registros con estado ${filtroEstado}`
                  : 'No hay datos sincronizados en este periodo'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Médico
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Especialidad
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center font-semibold">
                      Horas Declaradas
                    </th>
                    <th className="px-6 py-4 text-center font-semibold">
                      Horas Chatbot
                    </th>
                    <th className="px-6 py-4 text-center font-semibold">
                      Diferencia
                    </th>
                    <th className="px-6 py-4 text-center font-semibold">
                      Slots Generados
                    </th>
                    <th className="px-6 py-4 text-center font-semibold">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {comparativosFiltrados.map((item, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-purple-50 transition-colors ${
                        item.tieneInconsistencia ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {item.nombreMedico || 'N/A'}
                        </div>
                        <div className="text-sm text-slate-500">
                          CMP: {item.cmpMedico || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {item.especialidad || 'No especificado'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-blue-700">
                          {item.horasDeclaradas || 0}h
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-purple-700">
                          {item.horasChatbot || 0}h
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${getColorInconsistencia(item)}`}>
                          {Math.abs((item.horasDeclaradas || 0) - (item.horasChatbot || 0))}h
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {item.slotsGenerados || 0} slots
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getIconoEstado(item.estadoSincronizacion)}
                          <span className="text-sm font-medium text-slate-700">
                            {item.estadoSincronizacion}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.estadoSincronizacion === 'REVISADO' && (
                          <button
                            onClick={() => sincronizarItem(item)}
                            disabled={sincronizando === item.idDisponibilidad}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sincronizando === item.idDisponibilidad ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <GitMerge className="w-4 h-4" />
                            )}
                            <span className="text-sm font-medium">
                              {sincronizando === item.idDisponibilidad ? 'Sincronizando...' : 'Sincronizar'}
                            </span>
                          </button>
                        )}
                        {item.estadoSincronizacion === 'SINCRONIZADO' && (
                          <span className="text-sm text-green-600 font-medium">✓ Completado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Leyenda */}
        {comparativosFiltrados.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mt-6">
            <h3 className="font-semibold text-slate-700 mb-3">Leyenda de Inconsistencias:</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-sm text-slate-600">Sin inconsistencias</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                <span className="text-sm text-slate-600">Diferencia 1-5h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <span className="text-sm text-slate-600">Diferencia 6-10h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span className="text-sm text-slate-600">Diferencia {'>'} 10h (crítico)</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
