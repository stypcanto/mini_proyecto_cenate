// ========================================================================
// ProgramacionCenateDetalle.jsx - Detalle de Periodo
// ------------------------------------------------------------------------
// Vista detallada con estadisticas por especialidad, red e IPRESS
// ========================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Users,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  Building2,
  Stethoscope,
  Network,
  CheckCircle2,
  Clock,
  Eye
} from 'lucide-react';
import { programacionCenateService } from '../../services/programacionCenateService';

export default function ProgramacionCenateDetalle() {
  const { idPeriodo } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [activeTab, setActiveTab] = useState('especialidades');
  const [exporting, setExporting] = useState(false);

  // ============================================================
  // Cargar datos
  // ============================================================
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);

      try {
        const [resumenData, solicitudesData] = await Promise.all([
          programacionCenateService.obtenerResumenPorPeriodo(idPeriodo),
          programacionCenateService.obtenerSolicitudesPorPeriodo(idPeriodo)
        ]);

        setResumen(resumenData);
        setSolicitudes(solicitudesData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos del periodo.');
      } finally {
        setLoading(false);
      }
    };

    if (idPeriodo) {
      cargarDatos();
    }
  }, [idPeriodo]);

  // ============================================================
  // Handlers
  // ============================================================
  const handleExportar = async () => {
    setExporting(true);
    try {
      await programacionCenateService.descargarCsv(
        idPeriodo,
        `programacion_${resumen?.periodo}_detalle.csv`
      );
    } catch (err) {
      console.error('Error al exportar:', err);
      alert('Error al exportar el archivo CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleMarcarRevisada = async (idSolicitud) => {
    try {
      await programacionCenateService.marcarSolicitudRevisada(idSolicitud);
      // Actualizar la lista
      setSolicitudes(prev =>
        prev.map(s =>
          s.idSolicitud === idSolicitud ? { ...s, estado: 'REVISADO' } : s
        )
      );
    } catch (err) {
      console.error('Error al marcar como revisada:', err);
      alert('Error al marcar la solicitud como revisada');
    }
  };

  // ============================================================
  // Helpers
  // ============================================================
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'ENVIADO':
        return (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
            Enviado
          </span>
        );
      case 'REVISADO':
        return (
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium">
            Revisado
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium">
            Borrador
          </span>
        );
    }
  };

  // ============================================================
  // Render Loading/Error
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0A5BA9]" />
        <p className="ml-3 text-slate-600 dark:text-slate-400">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
        <button
          onClick={() => navigate('/programacion/dashboard')}
          className="mt-4 text-[#0A5BA9] hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al dashboard
        </button>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] rounded-2xl p-6 text-white shadow-lg">
        <button
          onClick={() => navigate('/programacion/dashboard')}
          className="mb-4 text-blue-100 hover:text-white flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </button>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">{resumen?.descripcion}</h1>
                <p className="text-blue-100 font-mono">{resumen?.periodo}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportar}
            disabled={exporting}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Estadisticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-slate-500">Solicitudes</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {resumen?.totalSolicitudes || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-slate-500">Enviadas</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {resumen?.solicitudesEnviadas || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-slate-500">Turnos Totales</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {resumen?.totalTurnosSolicitados || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-slate-500">Especialidades</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {resumen?.especialidadesSolicitadas || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('especialidades')}
              className={`px-6 py-4 font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'especialidades'
                  ? 'text-[#0A5BA9] border-b-2 border-[#0A5BA9] bg-blue-50 dark:bg-blue-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              Por Especialidad
            </button>
            <button
              onClick={() => setActiveTab('redes')}
              className={`px-6 py-4 font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'redes'
                  ? 'text-[#0A5BA9] border-b-2 border-[#0A5BA9] bg-blue-50 dark:bg-blue-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Network className="w-5 h-5" />
              Por Red
            </button>
            <button
              onClick={() => setActiveTab('ipress')}
              className={`px-6 py-4 font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'ipress'
                  ? 'text-[#0A5BA9] border-b-2 border-[#0A5BA9] bg-blue-50 dark:bg-blue-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Building2 className="w-5 h-5" />
              Por IPRESS
            </button>
            <button
              onClick={() => setActiveTab('solicitudes')}
              className={`px-6 py-4 font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'solicitudes'
                  ? 'text-[#0A5BA9] border-b-2 border-[#0A5BA9] bg-blue-50 dark:bg-blue-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              Solicitudes
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tab: Por Especialidad */}
          {activeTab === 'especialidades' && (
            <div className="space-y-3">
              {resumen?.resumenPorEspecialidad?.length > 0 ? (
                resumen.resumenPorEspecialidad.map((esp, idx) => (
                  <div
                    key={esp.idServicio || idx}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Stethoscope className="w-5 h-5 text-[#0A5BA9]" />
                      <span className="font-medium text-slate-800 dark:text-white">
                        {esp.nombreEspecialidad}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#0A5BA9]">
                        {esp.totalTurnos}
                      </span>
                      <span className="text-sm text-slate-500 ml-1">turnos</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">No hay datos de especialidades</p>
              )}
            </div>
          )}

          {/* Tab: Por Red */}
          {activeTab === 'redes' && (
            <div className="space-y-3">
              {resumen?.resumenPorRed?.length > 0 ? (
                resumen.resumenPorRed.map((red, idx) => (
                  <div
                    key={red.idRed || idx}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Network className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-slate-800 dark:text-white">
                        {red.nombreRed}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-purple-600">
                        {red.totalTurnos}
                      </span>
                      <span className="text-sm text-slate-500 ml-1">turnos</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">No hay datos de redes</p>
              )}
            </div>
          )}

          {/* Tab: Por IPRESS */}
          {activeTab === 'ipress' && (
            <div className="overflow-x-auto">
              {resumen?.resumenPorIpress?.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        IPRESS
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Red
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Turnos
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {resumen.resumenPorIpress.map((ipr, idx) => (
                      <tr key={ipr.idIpress || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">
                              {ipr.nombreIpress}
                            </p>
                            <p className="text-xs text-slate-500">{ipr.codIpress}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {ipr.nombreRed || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-lg font-bold text-[#0A5BA9]">
                            {ipr.totalTurnos}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getEstadoBadge(ipr.estado)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-slate-500 py-8">No hay datos de IPRESS</p>
              )}
            </div>
          )}

          {/* Tab: Solicitudes */}
          {activeTab === 'solicitudes' && (
            <div className="overflow-x-auto">
              {solicitudes.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        IPRESS
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Contacto
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Turnos
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {solicitudes.map((sol) => (
                      <tr key={sol.idSolicitud} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">
                              {sol.nombreIpress || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500">{sol.nombreRed || '-'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-slate-800 dark:text-white">
                              {sol.nombreCompleto || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500">{sol.emailContacto || '-'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-lg font-bold text-[#0A5BA9]">
                            {sol.totalTurnosSolicitados || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getEstadoBadge(sol.estado)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/solicitudes-turno/${sol.idSolicitud}`)}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {sol.estado === 'ENVIADO' && (
                              <button
                                onClick={() => handleMarcarRevisada(sol.idSolicitud)}
                                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Marcar como revisada"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-slate-500 py-8">No hay solicitudes para este periodo</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
