/**
 * 📧 EmailAuditLogs.jsx - Auditoría de Correos
 *
 * Panel para visualizar el historial de envíos de correos
 * Muestra: estado, destinatario, tipo, errores, servidor SMTP, etc.
 */

import React, { useState, useEffect } from 'react';
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Filter,
  Search,
  Server,
  Zap,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import emailAuditService from '../../services/emailAuditService';

export default function EmailAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('fallidos'); // 'fallidos', 'errores', 'resumen'

  useEffect(() => {
    cargarDatos();
  }, [tab]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      if (tab === 'resumen') {
        const resumenData = await emailAuditService.obtenerResumen();
        setStats(resumenData.estadisticas);
      } else if (tab === 'fallidos') {
        const fallidos = await emailAuditService.obtenerCorreosFallidos(100);
        setLogs(fallidos.datos || []);
      } else if (tab === 'errores') {
        const errores = await emailAuditService.obtenerErroresConexion(100);
        setLogs(errores.datos || []);
      }

      toast.success('Datos cargados correctamente');
    } catch (error) {
      toast.error('Error al cargar los datos: ' + error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'ENVIADO':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'FALLIDO':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'PENDIENTE':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'EN_COLA':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'ENVIADO':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'FALLIDO':
        return <XCircle className="w-4 h-4" />;
      case 'PENDIENTE':
        return <Clock className="w-4 h-4" />;
      case 'EN_COLA':
        return <Zap className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTipoColor = (tipo) => {
    const colores = {
      'BIENVENIDO': 'bg-blue-100 text-blue-800',
      'RECUPERACION': 'bg-orange-100 text-orange-800',
      'RESET': 'bg-red-100 text-red-800',
      'APROBACION': 'bg-green-100 text-green-800',
      'RECHAZO': 'bg-red-100 text-red-800',
      'PRUEBA': 'bg-gray-100 text-gray-800',
      'GENERAL': 'bg-purple-100 text-purple-800'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800';
  };

  const registrosFiltrados = logs.filter(log => {
    const coincideBusqueda =
      log.destinatario?.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.username?.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.asunto?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado = !filtroEstado || log.estado === filtroEstado;
    const coincideTipo = !filtroTipo || log.tipoCorreo === filtroTipo;

    return coincideBusqueda && coincideEstado && coincideTipo;
  });

  if (loading && tab !== 'resumen') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">📧 Auditoría de Correos</h1>
          </div>
          <p className="text-gray-600">Seguimiento de envíos de correos electrónicos del sistema</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {['fallidos', 'errores', 'resumen'].map(tabName => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`px-4 py-2 font-medium transition-colors ${
                tab === tabName
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tabName === 'fallidos' && '❌ Fallidos'}
              {tabName === 'errores' && '⚠️ Errores Conexión'}
              {tabName === 'resumen' && '📊 Resumen'}
            </button>
          ))}
        </div>

        {/* Resumen Tab */}
        {tab === 'resumen' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <CheckCircle2 className="w-6 h-6 mb-2 text-green-600" />
              <div className="text-3xl font-bold text-green-900">{stats.enviados}</div>
              <div className="text-sm text-green-700">Correos Enviados</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <XCircle className="w-6 h-6 mb-2 text-red-600" />
              <div className="text-3xl font-bold text-red-900">{stats.noEntregados}</div>
              <div className="text-sm text-red-700">No Entregados</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <Mail className="w-6 h-6 mb-2 text-blue-600" />
              <div className="text-3xl font-bold text-blue-900">{stats.totalIntentosCorreo}</div>
              <div className="text-sm text-blue-700">Total Intentos</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <Zap className="w-6 h-6 mb-2 text-purple-600" />
              <div className="text-3xl font-bold text-purple-900">{stats.porcentajeExito.toFixed(1)}%</div>
              <div className="text-sm text-purple-700">Tasa Éxito</div>
            </div>
          </div>
        )}

        {/* Filtros */}
        {tab !== 'resumen' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">🔍 Buscar</label>
                <input
                  type="text"
                  placeholder="Email, usuario, asunto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">📊 Estado</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="ENVIADO">✅ Enviado</option>
                  <option value="FALLIDO">❌ Fallido</option>
                  <option value="PENDIENTE">⏳ Pendiente</option>
                  <option value="EN_COLA">🔄 En Cola</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">📧 Tipo</label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="BIENVENIDO">Bienvenido</option>
                  <option value="RECUPERACION">Recuperación</option>
                  <option value="RESET">Reset</option>
                  <option value="APROBACION">Aprobación</option>
                  <option value="RECHAZO">Rechazo</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Registros */}
        {tab !== 'resumen' && (
          <div className="space-y-3">
            {registrosFiltrados.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay registros para mostrar</p>
              </div>
            ) : (
              registrosFiltrados.map((log) => (
                <div
                  key={log.id}
                  className={`border rounded-lg p-4 transition-colors ${getStatusColor(log.estado)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.estado)}
                      <span className="font-medium">{log.destinatario}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getTipoColor(log.tipoCorreo)}`}>
                        {log.tipoCorreo}
                      </span>
                    </div>
                    <div className="text-xs opacity-75">
                      {new Date(log.fechaEnvio).toLocaleString()}
                    </div>
                  </div>

                  <p className="text-sm mb-2 opacity-90">{log.asunto}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="opacity-75">Usuario:</span>
                      <div className="font-mono">{log.username || '-'}</div>
                    </div>
                    <div>
                      <span className="opacity-75">Servidor:</span>
                      <div className="font-mono">{log.servidorSmtp}:{log.puertoSmtp}</div>
                    </div>
                    <div>
                      <span className="opacity-75">Tiempo:</span>
                      <div className="font-mono">{log.tiempoRespuestaMs ? `${log.tiempoRespuestaMs}ms` : '-'}</div>
                    </div>
                    <div>
                      <span className="opacity-75">Reintentos:</span>
                      <div className="font-mono">{log.reintentos}</div>
                    </div>
                  </div>

                  {log.errorMensaje && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs border border-red-200">
                      <div className="font-mono text-red-900">{log.errorMensaje}</div>
                      {log.errorCodigo && (
                        <div className="text-xs text-red-800 mt-1">Código: {log.errorCodigo}</div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
