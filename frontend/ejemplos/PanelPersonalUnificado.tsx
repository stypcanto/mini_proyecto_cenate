// ============================================================================
// COMPONENTE: Panel Unificado de Personal
// ============================================================================
// Descripción: Panel principal para visualizar todo el personal del sistema
// Diferencia claramente entre personal CENATE y personal externo
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Building2, 
  Hospital,
  Calendar,
  Download,
  RefreshCw 
} from 'lucide-react';

// ============================================================================
// TIPOS
// ============================================================================

interface PersonalUnificado {
  id: number;
  tipoPersonal: 'CENATE' | 'EXTERNO';
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  edad: number;
  genero: string;
  telefono: string;
  emailPersonal: string;
  emailCorporativo: string;
  institucion: string;
  ipress?: {
    idIpress: number;
    codIpress: string;
    descIpress: string;
    statIpress: string;
  };
  estado: string;
  area?: {
    idArea: number;
    descArea: string;
  };
  regimenLaboral?: {
    idRegLab: number;
    descRegLab: string;
  };
  usuario?: {
    idUser: number;
    nameUser: string;
    statUser: string;
  };
  createAt: string;
  updateAt: string;
}

interface Filtros {
  tipoPersonal: 'CENATE' | 'EXTERNO' | '';
  mesCumpleanos: number | '';
  estado: 'ACTIVO' | 'INACTIVO' | '';
  idArea: number | '';
  searchTerm: string;
}

interface Estadisticas {
  totalCenate: number;
  totalExterno: number;
  totalGeneral: number;
  totalActivosCenate: number;
  totalInactivosCenate: number;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const PanelPersonalUnificado: React.FC = () => {
  const [personal, setPersonal] = useState<PersonalUnificado[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    tipoPersonal: '',
    mesCumpleanos: '',
    estado: '',
    idArea: '',
    searchTerm: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarEstadisticas();
    cargarPersonal();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      cargarPersonal();
    }, 500);

    return () => clearTimeout(timeout);
  }, [filtros]);

  // ========================================
  // FUNCIONES DE CARGA
  // ========================================

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('/api/personal-unificado/estadisticas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const cargarPersonal = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filtros.tipoPersonal) params.append('tipoPersonal', filtros.tipoPersonal);
      if (filtros.mesCumpleanos) params.append('mesCumpleanos', filtros.mesCumpleanos.toString());
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.idArea) params.append('idArea', filtros.idArea.toString());
      if (filtros.searchTerm) params.append('searchTerm', filtros.searchTerm);

      const response = await fetch(
        `/api/personal-unificado/filtrar?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await response.json();
      setPersonal(data);
    } catch (error) {
      console.error('Error cargando personal:', error);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipoPersonal: '',
      mesCumpleanos: '',
      estado: '',
      idArea: '',
      searchTerm: ''
    });
  };

  const exportarCSV = () => {
    const csv = convertirACSV(personal);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal_${new Date().toISOString()}.csv`;
    a.click();
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Personal del Sistema
        </h1>
        <p className="text-gray-600">
          Gestión unificada de personal interno (CENATE) y externo (otras instituciones)
        </p>
      </div>

      {/* Estadísticas */}
      {estadisticas && <EstadisticasCards estadisticas={estadisticas} />}

      {/* Barra de acciones */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Búsqueda rápida */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o documento..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filtros.searchTerm}
                onChange={(e) => setFiltros({ ...filtros, searchTerm: e.target.value })}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button
              onClick={cargarPersonal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {mostrarFiltros && (
          <PanelFiltros
            filtros={filtros}
            onChange={setFiltros}
            onLimpiar={limpiarFiltros}
          />
        )}
      </div>

      {/* Tabla de personal */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Cargando personal...</p>
        </div>
      ) : (
        <TablaPersonal personal={personal} />
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE: Tarjetas de Estadísticas
// ============================================================================

const EstadisticasCards: React.FC<{ estadisticas: Estadisticas }> = ({ estadisticas }) => {
  const cards = [
    {
      titulo: 'Total Personal',
      valor: estadisticas.totalGeneral,
      icon: Users,
      color: 'blue',
      descripcion: 'CENATE + Externos'
    },
    {
      titulo: 'Personal CENATE',
      valor: estadisticas.totalCenate,
      icon: Building2,
      color: 'indigo',
      descripcion: `${estadisticas.totalActivosCenate} activos`
    },
    {
      titulo: 'Personal Externo',
      valor: estadisticas.totalExterno,
      icon: Hospital,
      color: 'green',
      descripcion: 'Otras instituciones'
    },
    {
      titulo: 'Activos CENATE',
      valor: estadisticas.totalActivosCenate,
      icon: Users,
      color: 'emerald',
      descripcion: `${estadisticas.totalInactivosCenate} inactivos`
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.titulo}</p>
                <p className="text-3xl font-bold text-gray-900">{card.valor}</p>
                <p className="text-xs text-gray-500 mt-1">{card.descripcion}</p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// COMPONENTE: Panel de Filtros
// ============================================================================

const PanelFiltros: React.FC<{
  filtros: Filtros;
  onChange: (filtros: Filtros) => void;
  onLimpiar: () => void;
}> = ({ filtros, onChange, onLimpiar }) => {
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    if (filtros.tipoPersonal === 'CENATE') {
      cargarAreas();
    }
  }, [filtros.tipoPersonal]);

  const cargarAreas = async () => {
    try {
      const response = await fetch('/api/areas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAreas(data);
    } catch (error) {
      console.error('Error cargando áreas:', error);
    }
  };

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipo de Personal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Institución
          </label>
          <select
            value={filtros.tipoPersonal}
            onChange={(e) => onChange({ ...filtros, tipoPersonal: e.target.value as any, idArea: '' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="CENATE">🏢 CENATE (Interno)</option>
            <option value="EXTERNO">🏥 Externo</option>
          </select>
        </div>

        {/* Mes de Cumpleaños */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mes de Cumpleaños
          </label>
          <select
            value={filtros.mesCumpleanos}
            onChange={(e) => onChange({ ...filtros, mesCumpleanos: e.target.value ? Number(e.target.value) : '' as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los meses</option>
            {meses.map(m => (
              <option key={m.value} value={m.value}>
                🎂 {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={filtros.estado}
            onChange={(e) => onChange({ ...filtros, estado: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="ACTIVO">✅ Activos</option>
            <option value="INACTIVO">❌ Inactivos</option>
          </select>
        </div>

        {/* Área (solo para CENATE) */}
        {filtros.tipoPersonal === 'CENATE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área
            </label>
            <select
              value={filtros.idArea}
              onChange={(e) => onChange({ ...filtros, idArea: e.target.value ? Number(e.target.value) : '' as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las áreas</option>
              {areas.map((area: any) => (
                <option key={area.idArea} value={area.idArea}>
                  {area.descArea}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Botón limpiar filtros */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onLimpiar}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Tabla de Personal
// ============================================================================

const TablaPersonal: React.FC<{ personal: PersonalUnificado[] }> = ({ personal }) => {
  if (personal.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No se encontró personal</p>
        <p className="text-gray-400 text-sm mt-2">
          Intenta ajustar los filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Institución
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {personal.map((p) => (
              <FilaPersonal key={`${p.tipoPersonal}-${p.id}`} personal={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Fila de Personal
// ============================================================================

const FilaPersonal: React.FC<{ personal: PersonalUnificado }> = ({ personal }) => {
  const esCenate = personal.tipoPersonal === 'CENATE';
  
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {personal.nombreCompleto}
            </div>
            {personal.area && (
              <div className="text-xs text-gray-500">
                {personal.area.descArea}
              </div>
            )}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {personal.numeroDocumento}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          esCenate 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {esCenate ? '🏢' : '🏥'} {personal.tipoPersonal}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        {esCenate ? (
          <span className="text-sm font-semibold text-blue-600">
            CENATE
          </span>
        ) : (
          <div>
            <div className="text-sm text-gray-900">
              {personal.institucion}
            </div>
            {personal.ipress && (
              <div className="text-xs text-gray-500">
                {personal.ipress.codIpress}
              </div>
            )}
          </div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {personal.emailPersonal}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          personal.estado === 'A' || personal.estado === 'ACTIVO'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {personal.estado === 'A' || personal.estado === 'ACTIVO' ? '✅ Activo' : '❌ Inactivo'}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 mr-3">
          Ver
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          Editar
        </button>
      </td>
    </tr>
  );
};

// ============================================================================
// UTILIDADES
// ============================================================================

function convertirACSV(personal: PersonalUnificado[]): string {
  const headers = [
    'ID',
    'Tipo',
    'Nombre Completo',
    'Documento',
    'Institución',
    'Email',
    'Teléfono',
    'Estado',
    'Área',
    'Fecha Registro'
  ];

  const rows = personal.map(p => [
    p.id,
    p.tipoPersonal,
    p.nombreCompleto,
    p.numeroDocumento,
    p.institucion,
    p.emailPersonal,
    p.telefono || '',
    p.estado,
    p.area?.descArea || '',
    new Date(p.createAt).toLocaleDateString()
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
}

export default PanelPersonalUnificado;
