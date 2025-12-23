// ========================================================================
// ProgramacionCenateDashboard.jsx - Dashboard de Programacion CENATE
// ------------------------------------------------------------------------
// Vista consolidada de todas las solicitudes de turnos por periodo
// ========================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  Users,
  FileText,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  TrendingUp,
  Building2,
  RefreshCw,
  Play,
  Pause,
  CheckCircle2
} from 'lucide-react';
import { programacionCenateService } from '../../services/programacionCenateService';

export default function ProgramacionCenateDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [exporting, setExporting] = useState(null);

  // ============================================================
  // Cargar datos
  // ============================================================
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await programacionCenateService.obtenerResumenGeneral();
      setPeriodos(data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron cargar los datos de programacion.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ============================================================
  // Handlers
  // ============================================================
  const handleVerDetalle = (idPeriodo) => {
    navigate(`/programacion/detalle/${idPeriodo}`);
  };

  const handleExportar = async (periodo) => {
    setExporting(periodo.idPeriodo);
    try {
      await programacionCenateService.descargarCsv(
        periodo.idPeriodo,
        `programacion_${periodo.periodo}_${periodo.descripcion.replace(/\s+/g, '_')}.csv`
      );
    } catch (err) {
      console.error('Error al exportar:', err);
      alert('Error al exportar el archivo CSV');
    } finally {
      setExporting(null);
    }
  };

  // ============================================================
  // Calculos
  // ============================================================
  const totalSolicitudes = periodos.reduce((sum, p) => sum + (p.totalSolicitudes || 0), 0);
  const totalEnviadas = periodos.reduce((sum, p) => sum + (p.solicitudesEnviadas || 0), 0);
  const totalIpressRespondieron = periodos.reduce((sum, p) => sum + (p.ipressRespondieron || 0), 0);
  const periodosActivos = periodos.filter(p => p.estado === 'ACTIVO').length;

  // ============================================================
  // Helpers
  // ============================================================
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
            <Play className="w-3 h-3" />
            Activo
          </span>
        );
      case 'CERRADO':
        return (
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium flex items-center gap-1">
            <Pause className="w-3 h-3" />
            Cerrado
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Borrador
          </span>
        );
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Programacion CENATE</h1>
            </div>
            <p className="text-blue-100">
              Vista consolidada de solicitudes de turnos por telemedicina
            </p>
          </div>
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Estadisticas Generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Periodos</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{periodos.length}</p>
            </div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">
            {periodosActivos} activos
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Solicitudes</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalSolicitudes}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {totalEnviadas} enviadas
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">IPRESS</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalIpressRespondieron}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            respondieron
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tasa Resp.</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {totalSolicitudes > 0 ? Math.round((totalEnviadas / totalSolicitudes) * 100) : 0}%
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            de respuesta
          </p>
        </div>
      </div>

      {/* Tabla de Periodos */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <Loader2 className="w-10 h-10 animate-spin text-[#0A5BA9]" />
          <p className="ml-3 text-slate-600 dark:text-slate-400">Cargando datos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      ) : periodos.length === 0 ? (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 px-4 py-8 rounded-xl text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay periodos de solicitud registrados.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Periodos de Solicitud
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Periodo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Solicitudes
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Enviadas
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    IPRESS
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {periodos.map((periodo) => (
                  <tr key={periodo.idPeriodo} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">
                          {periodo.descripcion}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                          {periodo.periodo}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getEstadoBadge(periodo.estado)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-slate-800 dark:text-white">
                        {periodo.totalSolicitudes || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {periodo.solicitudesEnviadas || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {periodo.ipressRespondieron || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleVerDetalle(periodo.idPeriodo)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleExportar(periodo)}
                          disabled={exporting === periodo.idPeriodo}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Exportar CSV"
                        >
                          {exporting === periodo.idPeriodo ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
                        </button>
                      </div>
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
