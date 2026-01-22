import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Eye, Trash2, Users, Loader, Download } from 'lucide-react';

/**
 * 👥 GestionBolsasPacientes - Gestión de Bolsas de Pacientes
 * v1.0.0 - Administrar bolsas de pacientes, asignaciones y seguimiento
 *
 * Características:
 * - Tabla de bolsas de pacientes con paginación
 * - Búsqueda y filtros avanzados
 * - Ver detalles de bolsa (pacientes asignados)
 * - Editar bolsa (nombre, descripción, estado)
 * - Eliminar bolsa
 * - Exportar listado de bolsas
 * - Estadísticas por bolsa
 */
export default function GestionBolsasPacientes() {
  const [bolsas, setBolsas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    cargarBolsas();
  }, []);

  const cargarBolsas = async () => {
    setIsLoading(true);
    try {
      // TODO: Llamar a API para obtener bolsas
      // const response = await bolsasService.obtenerBolsas();
      // setBolsas(response.data);

      // Mock data
      setBolsas([
        {
          id: 1,
          nombre: 'Bolsa Cardiología 2026-01',
          descripcion: 'Bolsa de pacientes para evaluación cardiológica',
          totalPacientes: 45,
          pacientesAsignados: 38,
          estado: 'activa',
          fechaCreacion: '2026-01-10',
          responsable: 'Dr. Juan Pérez'
        },
        {
          id: 2,
          nombre: 'Bolsa Neurología Q1',
          descripcion: 'Pacientes neurología primer trimestre',
          totalPacientes: 32,
          pacientesAsignados: 28,
          estado: 'activa',
          fechaCreacion: '2026-01-05',
          responsable: 'Dra. María López'
        },
        {
          id: 3,
          nombre: 'Bolsa Oncología 2025-Q4',
          descripcion: 'Seguimiento cuarto trimestre 2025',
          totalPacientes: 20,
          pacientesAsignados: 20,
          estado: 'inactiva',
          fechaCreacion: '2025-10-01',
          responsable: 'Dr. Carlos Ruiz'
        },
      ]);
    } catch (error) {
      console.error('Error cargando bolsas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const bolsasFiltradas = bolsas.filter(bolsa => {
    const matchBusqueda = bolsa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bolsa.responsable.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || bolsa.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const getEstadoBadge = (estado) => {
    const estilos = {
      activa: 'bg-green-100 text-green-800 border border-green-300',
      inactiva: 'bg-gray-100 text-gray-800 border border-gray-300',
      cerrada: 'bg-red-100 text-red-800 border border-red-300'
    };
    return estilos[estado] || estilos.inactiva;
  };

  const calcularPorcentajeAsignacion = (asignados, total) => {
    return Math.round((asignados / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Users size={40} className="text-blue-600" />
              Gestión de Bolsas de Pacientes
            </h1>
            <p className="text-gray-600">Administra las bolsas de pacientes asignadas a especialidades</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              <Plus size={20} />
              Nueva Bolsa
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors">
              <Download size={20} />
              Exportar
            </button>
          </div>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total de Bolsas</p>
            <p className="text-3xl font-bold text-gray-800">{bolsas.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Bolsas Activas</p>
            <p className="text-3xl font-bold text-green-600">{bolsas.filter(b => b.estado === 'activa').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total de Pacientes</p>
            <p className="text-3xl font-bold text-blue-600">{bolsas.reduce((sum, b) => sum + b.totalPacientes, 0)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Pacientes Asignados</p>
            <p className="text-3xl font-bold text-purple-600">{bolsas.reduce((sum, b) => sum + b.pacientesAsignados, 0)}</p>
          </div>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por estado */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
                <option value="cerrada">Cerrada</option>
              </select>
            </div>

            {/* Botón Refrescar */}
            <button
              onClick={cargarBolsas}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Cargando...' : 'Refrescar'}
            </button>
          </div>
        </div>

        {/* Tabla de bolsas */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="animate-spin text-blue-600" size={32} />
            </div>
          ) : bolsasFiltradas.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Nombre</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Responsable</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-800">Asignación</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-800">Porcentaje</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Fecha</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Estado</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bolsasFiltradas.map((bolsa) => (
                  <tr key={bolsa.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{bolsa.nombre}</p>
                        <p className="text-sm text-gray-600">{bolsa.descripcion}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{bolsa.responsable}</td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {bolsa.pacientesAsignados}/{bolsa.totalPacientes}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${calcularPorcentajeAsignacion(bolsa.pacientesAsignados, bolsa.totalPacientes)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-8">
                          {calcularPorcentajeAsignacion(bolsa.pacientesAsignados, bolsa.totalPacientes)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">{bolsa.fechaCreacion}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoBadge(bolsa.estado)}`}>
                        {bolsa.estado.charAt(0).toUpperCase() + bolsa.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2 justify-center">
                      <button
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      {bolsa.estado !== 'cerrada' && (
                        <button
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600 font-semibold">No hay bolsas para mostrar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
