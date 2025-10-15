// ========================================================================
// 👥 AdminPersonalPanel.jsx - Panel de Administración de Personal
// ========================================================================
// Panel profesional estilo Apple para gestionar personal CENATE y Externo
// Integrado con sistema MBAC (Modular-Based Access Control)
// ========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Users,
  RefreshCw,
  Eye,
  Building2,
  Mail,
  Phone,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { getPersonalTotal, getDetalleCenate, getDetalleExterno } from '../../api/personal';
import { tienePermiso } from '../../api/permisosApi';
import PersonalDetailCard from '../../components/ui/PersonalDetailCard';
import useAuth from '../../hooks/useAuth';

const AdminPersonalPanel = () => {
  // Estado
  const [personal, setPersonal] = useState([]);
  const [filteredPersonal, setFilteredPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('TODOS');
  const [selectedRol, setSelectedRol] = useState('TODOS');
  const [selectedEstado, setSelectedEstado] = useState('TODOS');
  const [selectedPersonal, setSelectedPersonal] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [permisos, setPermisos] = useState({
    ver: false,
    crear: false,
    editar: false,
    eliminar: false,
    exportar: false,
  });

  const { hasRole } = useAuth();

  // Cargar permisos
  useEffect(() => {
    const cargarPermisos = async () => {
      const permisosCheck = {
        ver: await tienePermiso('/roles/admin/personal', 'ver') || hasRole(['SUPERADMIN']),
        crear: await tienePermiso('/roles/admin/personal', 'crear') || hasRole(['SUPERADMIN']),
        editar: await tienePermiso('/roles/admin/personal', 'editar') || hasRole(['SUPERADMIN']),
        eliminar: await tienePermiso('/roles/admin/personal', 'eliminar') || hasRole(['SUPERADMIN']),
        exportar: await tienePermiso('/roles/admin/personal', 'exportar') || hasRole(['SUPERADMIN']),
      };
      setPermisos(permisosCheck);
    };
    cargarPermisos();
  }, [hasRole]);

  // Cargar personal
  useEffect(() => {
    cargarPersonal();
  }, []);

  const cargarPersonal = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPersonalTotal();
      setPersonal(data);
      setFilteredPersonal(data);
    } catch (err) {
      console.error('Error al cargar personal:', err);
      setError('No se pudo cargar la información del personal');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar personal
  useEffect(() => {
    let result = [...personal];

    // Filtro por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre_completo?.toLowerCase().includes(search) ||
          p.numero_documento?.toLowerCase().includes(search) ||
          p.correo_corporativo?.toLowerCase().includes(search) ||
          p.username?.toLowerCase().includes(search)
      );
    }

    // Filtro por tipo
    if (selectedTipo !== 'TODOS') {
      result = result.filter((p) => p.tipo_personal === selectedTipo);
    }

    // Filtro por rol
    if (selectedRol !== 'TODOS') {
      result = result.filter((p) => p.roles?.includes(selectedRol));
    }

    // Filtro por estado
    if (selectedEstado !== 'TODOS') {
      result = result.filter((p) => p.estado_usuario === selectedEstado);
    }

    setFilteredPersonal(result);
  }, [searchTerm, selectedTipo, selectedRol, selectedEstado, personal]);

  // Obtener opciones únicas para filtros
  const rolesUnicos = useMemo(() => {
    const roles = new Set();
    personal.forEach((p) => {
      if (p.roles) {
        p.roles.split(',').forEach((r) => roles.add(r.trim()));
      }
    });
    return Array.from(roles).sort();
  }, [personal]);

  // Ver detalle
  const handleVerDetalle = async (persona) => {
    try {
      setLoading(true);
      let detalle;
      
      if (persona.tipo_personal === 'CENATE') {
        detalle = await getDetalleCenate(persona.id_personal);
      } else {
        detalle = await getDetalleExterno(persona.id_personal);
      }
      
      setSelectedPersonal({ ...detalle, tipo_personal: persona.tipo_personal });
      setShowDetail(true);
    } catch (err) {
      console.error('Error al obtener detalle:', err);
      alert('No se pudo cargar el detalle del personal');
    } finally {
      setLoading(false);
    }
  };

  // Exportar datos
  const handleExportar = () => {
    const csv = [
      ['Nombre', 'Tipo', 'Documento', 'IPRESS', 'Roles', 'Correo', 'Teléfono', 'Estado'],
      ...filteredPersonal.map((p) => [
        p.nombre_completo,
        p.tipo_personal,
        p.numero_documento,
        p.ipress_asignada,
        p.roles || '',
        p.correo_corporativo || '',
        p.telefono || '',
        p.estado_usuario === 'A' ? 'Activo' : 'Inactivo',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `personal_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Badge de estado
  const EstadoBadge = ({ estado }) => {
    const isActivo = estado === 'A';
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActivo
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isActivo ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  // Badge de tipo
  const TipoBadge = ({ tipo }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        tipo === 'CENATE'
          ? 'bg-indigo-100 text-indigo-800'
          : 'bg-purple-100 text-purple-800'
      }`}
    >
      {tipo}
    </span>
  );

  if (!permisos.ver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600">
            No tienes permisos para ver el panel de personal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Personal
              </h1>
              <p className="text-gray-600 mt-1">
                Personal CENATE e instituciones externas
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={cargarPersonal}
              disabled={loading}
              className="px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span className="text-sm font-medium">Actualizar</span>
            </motion.button>

            {permisos.exportar && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportar}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Exportar</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{personal.length}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CENATE</p>
              <p className="text-2xl font-bold text-indigo-600">
                {personal.filter((p) => p.tipo_personal === 'CENATE').length}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Externos</p>
              <p className="text-2xl font-bold text-purple-600">
                {personal.filter((p) => p.tipo_personal === 'EXTERNO').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {personal.filter((p) => p.estado_usuario === 'A').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none"
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="CENATE">CENATE</option>
              <option value="EXTERNO">Externos</option>
            </select>
          </div>

          {/* Filtro por rol */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedRol}
              onChange={(e) => setSelectedRol(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none"
            >
              <option value="TODOS">Todos los roles</option>
              {rolesUnicos.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="A">Activos</option>
              <option value="I">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredPersonal.length} de {personal.length} registros
        </div>
      </motion.div>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && filteredPersonal.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No se encontraron registros
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filteredPersonal.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Personal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IPRESS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
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
                {filteredPersonal.map((persona, index) => (
                  <motion.tr
                    key={persona.id_user || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {persona.nombre_completo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {persona.numero_documento}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TipoBadge tipo={persona.tipo_personal} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {persona.ipress_asignada || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {persona.roles || 'Sin rol'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {persona.correo_corporativo && (
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">
                              {persona.correo_corporativo}
                            </span>
                          </div>
                        )}
                        {persona.telefono && (
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{persona.telefono}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EstadoBadge estado={persona.estado_usuario} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleVerDetalle(persona)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver Detalle</span>
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal de detalle */}
      {showDetail && selectedPersonal && (
        <PersonalDetailCard
          personal={selectedPersonal}
          tipo={selectedPersonal.tipo_personal}
          onClose={() => {
            setShowDetail(false);
            setSelectedPersonal(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPersonalPanel;
