import React, { useState, useEffect } from 'react';
import {
  Network,
  Users,
  FileText,
  Building2,
  Download,
  RefreshCw,
  AlertCircle,
  MapPin
} from 'lucide-react';
import apiClient from '../../../../../lib/apiClient';

/**
 * Dashboard para Coordinadores de Red
 * Muestra informacion de la red asignada, personal externo y formularios
 */
export default function RedDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [personal, setPersonal] = useState([]);
  const [formularios, setFormularios] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, personalRes, formRes] = await Promise.all([
        apiClient.get('/api/red/mi-red'),
        apiClient.get('/api/red/personal'),
        apiClient.get('/api/red/formularios')
      ]);
      setDashboard(dashRes.data);
      setPersonal(personalRes.data || []);
      setFormularios(formRes.data || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar datos de la red');
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    const data = activeTab === 'personal' ? personal : formularios;
    if (data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    let csvContent, filename;

    if (activeTab === 'personal') {
      const headers = ['DNI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Email', 'Telefono', 'IPRESS'];
      csvContent = [
        headers.join(','),
        ...data.map(item => [
          item.numDocExt || '',
          item.nomExt || '',
          item.apePaterExt || '',
          item.apeMaterExt || '',
          item.emailPersExt || '',
          item.movilExt || '',
          item.ipress?.descIpress || item.nombreInstitucion || ''
        ].map(field => `"${field}"`).join(','))
      ].join('\n');
      filename = `personal_externo_${dashboard?.red?.codigo || 'red'}_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      const headers = ['ID', 'IPRESS', 'Codigo IPRESS', 'Anio', 'Estado', 'Usuario Registro', 'Fecha Creacion'];
      csvContent = [
        headers.join(','),
        ...data.map(item => [
          item.idFormulario || '',
          item.nombreIpress || '',
          item.codigoIpress || '',
          item.anio || '',
          item.estado || '',
          item.usuarioRegistro || '',
          item.fechaCreacion ? new Date(item.fechaCreacion).toLocaleString('es-PE') : ''
        ].map(field => `"${field}"`).join(','))
      ].join('\n');
      filename = `formularios_${dashboard?.red?.codigo || 'red'}_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Cargando datos de la red...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error al cargar el dashboard</h3>
            <p className="mt-1">{error}</p>
            <button
              onClick={cargarDatos}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-lg">
            <Network className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{dashboard?.red?.nombre || 'Mi Red'}</h1>
            <div className="flex items-center gap-4 mt-1 text-blue-200">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {dashboard?.red?.macroregion || 'Sin macroregion'}
              </span>
              <span>|</span>
              <span>Codigo: {dashboard?.red?.codigo || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estadisticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="IPRESS"
          value={dashboard?.estadisticas?.total_ipress || 0}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Personal Externo"
          value={dashboard?.estadisticas?.total_personal_externo || 0}
          color="green"
        />
        <StatCard
          icon={FileText}
          label="Formularios"
          value={dashboard?.estadisticas?.total_formularios || 0}
          color="purple"
        />
        <StatCard
          icon={FileText}
          label="Formularios Enviados"
          value={dashboard?.estadisticas?.formularios_enviados || 0}
          color="orange"
          subtitle={`${dashboard?.estadisticas?.formularios_en_proceso || 0} en proceso`}
        />
      </div>

      {/* Tabs y Contenido */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b flex flex-wrap">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'personal'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            Personal Externo ({personal.length})
          </button>
          <button
            onClick={() => setActiveTab('formularios')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'formularios'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            Formularios ({formularios.length})
          </button>
          <div className="ml-auto p-2 flex gap-2">
            <button
              onClick={cargarDatos}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'personal' ? (
            <TablaPersonal data={personal} />
          ) : (
            <TablaFormularios data={formularios} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, subtitle }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  const iconColors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className={`bg-white rounded-lg shadow border p-4 flex items-center gap-4 ${colors[color]}`}>
      <div className={`p-3 rounded-lg ${iconColors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function TablaPersonal({ data }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No hay personal externo registrado en esta red</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefono</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IPRESS</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, idx) => (
            <tr key={item.idPersExt || idx} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-mono">{item.numDocExt || '-'}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {item.nombreCompleto || `${item.nomExt || ''} ${item.apePaterExt || ''} ${item.apeMaterExt || ''}`.trim() || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {item.emailPersExt || '-'}
              </td>
              <td className="px-4 py-3 text-sm">{item.movilExt || '-'}</td>
              <td className="px-4 py-3 text-sm">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {item.ipress?.descIpress || item.nombreInstitucion || '-'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TablaFormularios({ data }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No hay formularios de diagnostico registrados en esta red</p>
      </div>
    );
  }

  const estadoConfig = {
    'EN_PROCESO': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En Proceso' },
    'ENVIADO': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Enviado' },
    'APROBADO': { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobado' },
    'RECHAZADO': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IPRESS</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anio</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creacion</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, idx) => {
            const config = estadoConfig[item.estado] || { bg: 'bg-gray-100', text: 'text-gray-800', label: item.estado };
            return (
              <tr key={item.idFormulario || idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">#{item.idFormulario}</td>
                <td className="px-4 py-3 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{item.nombreIpress || '-'}</div>
                    <div className="text-xs text-gray-500">{item.codigoIpress || ''}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{item.anio || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                    {config.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.usuarioRegistro || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.fechaCreacion ? new Date(item.fechaCreacion).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
