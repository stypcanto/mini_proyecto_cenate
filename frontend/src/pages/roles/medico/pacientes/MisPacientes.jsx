/**
 * 👨‍⚕️ MisPacientes.jsx - Listado de Pacientes para Médicos
 *
 * Panel que muestra los pacientes asignados al médico con información
 * de su situación, especialidad, estado de atención, etc.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Heart,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  ChevronDown,
  Loader,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../../../services/apiClient';

export default function MisPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      // Endpoint para obtener pacientes del sistema
      // TODO: Cambiar a endpoint de pacientes asignados al médico cuando esté disponible
      const response = await apiClient.get('/api/gestion-paciente', true);

      if (response.data) {
        setPacientes(Array.isArray(response.data) ? response.data : []);
        toast.success('Pacientes cargados');
      }
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      toast.error('Error al cargar pacientes');
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const pacientesFiltrados = pacientes.filter(p => {
    const coincideBusqueda =
      (p.nombre?.toLowerCase().includes(busqueda.toLowerCase())) ||
      (p.numeroDocumento?.includes(busqueda)) ||
      (p.apellido?.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideEstado = !filtroEstado || (p.estado === filtroEstado);

    return coincideBusqueda && coincideEstado;
  });

  const toggleExpandido = (id) => {
    setExpandidos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando pacientes...</p>
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
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">👨‍⚕️ Mis Pacientes</h1>
          </div>
          <p className="text-gray-600">Gestiona la información de tus pacientes asignados</p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Buscar por nombre o DNI
              </label>
              <input
                type="text"
                placeholder="Ingresa nombre o DNI..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro de estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Atendido">Atendido</option>
              </select>
            </div>

            {/* Botón refrescar */}
            <div className="flex items-end">
              <button
                onClick={cargarPacientes}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {pacientesFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay pacientes para mostrar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pacientesFiltrados.map((paciente) => (
              <div
                key={paciente.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
              >
                {/* Header del paciente */}
                <button
                  onClick={() => toggleExpandido(paciente.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        {paciente.nombre} {paciente.apellido}
                      </p>
                      <p className="text-sm text-gray-600">
                        DNI: {paciente.numeroDocumento}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition ${
                      expandidos[paciente.id] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Detalles expandibles */}
                {expandidos[paciente.id] && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Contacto */}
                      {paciente.telefono && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600">Teléfono</p>
                            <p className="font-medium text-gray-900">{paciente.telefono}</p>
                          </div>
                        </div>
                      )}

                      {paciente.email && (
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{paciente.email}</p>
                          </div>
                        </div>
                      )}

                      {/* Estado */}
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Estado</p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              paciente.estado === 'Activo'
                                ? 'bg-green-100 text-green-800'
                                : paciente.estado === 'Atendido'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {paciente.estado || 'Sin asignar'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Especialidad */}
                      {paciente.especialidad && (
                        <div className="flex items-start gap-3">
                          <Heart className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600">Especialidad</p>
                            <p className="font-medium text-gray-900">{paciente.especialidad}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Estadísticas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Total de Pacientes</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{pacientes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Filtrados</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{pacientesFiltrados.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Activos</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {pacientes.filter(p => p.estado === 'Activo').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
