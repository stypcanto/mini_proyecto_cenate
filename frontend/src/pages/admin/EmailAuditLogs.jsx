/**
 * 📧 EmailAuditLogs.jsx - Auditoría de Correos (v1.45.4)
 *
 * Panel profesional para visualizar el historial de envíos de correos
 * Incluye: tabla, filtros, estadísticas en tiempo real, y tabs mejorados
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Server,
  Zap,
  AlertTriangle,
  Send,
  Inbox,
  BarChart3,
  ChevronDown,
  ExternalLink,
  User,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import emailAuditService from '../../services/emailAuditService';

// Componente de Badge para estados
const StatusBadge = ({ estado }) => {
  const config = {
    ENVIADO: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2, label: 'Enviado' },
    FALLIDO: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Fallido' },
    PENDIENTE: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pendiente' },
    EN_COLA: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Zap, label: 'En Cola' }
  };

  const { bg, text, icon: Icon, label } = config[estado] || config.PENDIENTE;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

// Componente de Badge para tipos
const TypeBadge = ({ tipo }) => {
  const config = {
    BIENVENIDO: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    RECUPERACION: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    RESET: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    APROBACION: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    RECHAZO: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    PRUEBA: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    GENERAL: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
  };

  const { bg, text, border } = config[tipo] || config.GENERAL;

  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${bg} ${text} ${border}`}>
      {tipo}
    </span>
  );
};

// Componente de Stat Card
const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('700', '100').replace('600', '100')}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

export default function EmailAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('todos');
  const [expandedRow, setExpandedRow] = useState(null);

  const tabs = [
    { id: 'todos', label: 'Todos', icon: Inbox, count: null },
    { id: 'enviados', label: 'Enviados', icon: CheckCircle2, count: null },
    { id: 'fallidos', label: 'Fallidos', icon: XCircle, count: null },
    { id: 'errores', label: 'Errores Conexión', icon: AlertTriangle, count: null }
  ];

  const cargarDatos = useCallback(async (showToast = true) => {
    try {
      setRefreshing(true);

      // Cargar estadísticas siempre
      const resumenData = await emailAuditService.obtenerResumen();
      setStats(resumenData.estadisticas);

      // Cargar datos según tab
      let data;
      switch (tab) {
        case 'todos':
          data = await emailAuditService.obtenerTodos(100);
          break;
        case 'enviados':
          data = await emailAuditService.obtenerEnviados(100);
          break;
        case 'fallidos':
          data = await emailAuditService.obtenerCorreosFallidos(100);
          break;
        case 'errores':
          data = await emailAuditService.obtenerErroresConexion(100);
          break;
        default:
          data = await emailAuditService.obtenerTodos(100);
      }

      setLogs(data.datos || []);
      if (showToast) toast.success('Datos actualizados');
    } catch (error) {
      toast.error('Error al cargar: ' + error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useEffect(() => {
    cargarDatos(false);
  }, [tab, cargarDatos]);

  const registrosFiltrados = logs.filter(log => {
    if (!busqueda) return true;
    const search = busqueda.toLowerCase();
    return (
      log.destinatario?.toLowerCase().includes(search) ||
      log.username?.toLowerCase().includes(search) ||
      log.asunto?.toLowerCase().includes(search) ||
      log.tipoCorreo?.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <Mail className="w-16 h-16 text-blue-500 mx-auto" />
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">Cargando auditoría de correos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Auditoría de Correos</h1>
                <p className="text-blue-100 text-sm mt-1">
                  Monitoreo de envíos del sistema CENATE
                </p>
              </div>
            </div>
            <button
              onClick={() => cargarDatos(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Send}
              label="Correos Enviados"
              value={stats.enviados}
              color="text-emerald-600"
              subtext="Últimos 7 días"
            />
            <StatCard
              icon={XCircle}
              label="No Entregados"
              value={stats.noEntregados}
              color="text-red-600"
              subtext="Requieren atención"
            />
            <StatCard
              icon={Inbox}
              label="Total Intentos"
              value={stats.totalIntentosCorreo}
              color="text-blue-600"
              subtext="Enviados + Fallidos"
            />
            <StatCard
              icon={BarChart3}
              label="Tasa de Éxito"
              value={`${stats.porcentajeExito?.toFixed(1) || 0}%`}
              color="text-purple-600"
              subtext={stats.porcentajeExito >= 90 ? 'Excelente' : stats.porcentajeExito >= 70 ? 'Bueno' : 'Mejorable'}
            />
          </div>
        )}

        {/* Tabs + Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-100">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    tab === id
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mt-3 sm:mt-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por email, usuario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Results count */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{registrosFiltrados.length}</span> registros
            {busqueda && <span className="text-gray-500"> para "{busqueda}"</span>}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {registrosFiltrados.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No hay registros para mostrar</p>
                <p className="text-gray-400 text-sm mt-1">Prueba cambiando los filtros o la búsqueda</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Destinatario</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Usuario</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Servidor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registrosFiltrados.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedRow === log.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                      >
                        <td className="px-4 py-3">
                          <StatusBadge estado={log.estado} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                              {log.destinatario?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {log.destinatario}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {log.asunto || 'Sin asunto'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <TypeBadge tipo={log.tipoCorreo} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {log.username || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-mono">
                            <Server className="w-3.5 h-3.5 text-gray-400" />
                            {log.servidorSmtp ? `${log.servidorSmtp}:${log.puertoSmtp}` : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(log.fechaEnvio)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedRow === log.id ? 'rotate-180' : ''}`} />
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedRow === log.id && (
                        <tr className="bg-blue-50">
                          <td colSpan="7" className="px-4 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Tiempo respuesta</p>
                                <p className="font-mono font-medium">
                                  {log.tiempoRespuestaMs ? `${log.tiempoRespuestaMs} ms` : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Reintentos</p>
                                <p className="font-mono font-medium">{log.reintentos || 0}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs mb-1">ID Usuario</p>
                                <p className="font-mono font-medium">{log.idUsuario || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Fecha confirmación</p>
                                <p className="font-mono font-medium">{formatDate(log.fechaConfirmacion)}</p>
                              </div>
                            </div>

                            {log.errorMensaje && (
                              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium text-red-700">Error de envío</p>
                                    <p className="text-xs text-red-600 mt-1 font-mono break-all">
                                      {log.errorMensaje}
                                    </p>
                                    {log.errorCodigo && (
                                      <p className="text-xs text-red-500 mt-2">
                                        Código: <span className="font-mono">{log.errorCodigo}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-sm text-gray-500 pb-8">
          Sistema de Auditoría de Correos CENATE v1.45.4
        </div>
      </div>
    </div>
  );
}
