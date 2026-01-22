import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Trash2, Loader } from 'lucide-react';

/**
 * 📋 Solicitudes - Gestión de Solicitudes de Bolsas
 * v1.0.0 - Crear, ver y gestionar solicitudes de bolsas de pacientes
 *
 * Características:
 * - Tabla de solicitudes con búsqueda y filtros
 * - Crear nueva solicitud
 * - Ver detalles de solicitud
 * - Eliminar solicitud (si está pendiente)
 * - Estados: Pendiente, Aprobada, Rechazada
 */
export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    setIsLoading(true);
    try {
      // TODO: Llamar a API para obtener solicitudes
      // const response = await bolsasService.obtenerSolicitudes();
      // setSolicitudes(response.data);

      // Mock data
      setSolicitudes([
        {
          id: 1,
          numero: 'SOL-2026-001',
          paciente: 'Juan Pérez García',
          dni: '44914706',
          estado: 'pendiente',
          fecha: '2026-01-20',
          especialidad: 'Cardiología'
        },
        {
          id: 2,
          numero: 'SOL-2026-002',
          paciente: 'María López Rodríguez',
          dni: '45678901',
          estado: 'aprobada',
          fecha: '2026-01-18',
          especialidad: 'Neurología'
        },
      ]);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const solicitudesFiltradas = solicitudes.filter(sol => {
    const matchBusqueda = sol.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sol.dni.includes(searchTerm) ||
                         sol.numero.includes(searchTerm);
    const matchEstado = filtroEstado === 'todos' || sol.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const getEstadoBadge = (estado) => {
    const estilos = {
      pendiente: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      aprobada: 'bg-green-100 text-green-800 border border-green-300',
      rechazada: 'bg-red-100 text-red-800 border border-red-300'
    };
    return estilos[estado] || estilos.pendiente;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📋 Solicitudes</h1>
            <p className="text-gray-600">Gestiona solicitudes de bolsas de pacientes</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            <Plus size={20} />
            Nueva Solicitud
          </button>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente, DNI o solicitud..."
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
                <option value="pendiente">Pendiente</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </div>

            {/* Botón Refrescar */}
            <button
              onClick={cargarSolicitudes}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Cargando...' : 'Refrescar'}
            </button>
          </div>
        </div>

        {/* Tabla de solicitudes */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="animate-spin text-blue-600" size={32} />
            </div>
          ) : solicitudesFiltradas.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">#</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Paciente</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">DNI</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Especialidad</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Fecha</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Estado</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesFiltradas.map((solicitud) => (
                  <tr key={solicitud.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{solicitud.numero}</td>
                    <td className="px-6 py-4 text-gray-700">{solicitud.paciente}</td>
                    <td className="px-6 py-4 text-gray-700">{solicitud.dni}</td>
                    <td className="px-6 py-4 text-gray-700">{solicitud.especialidad}</td>
                    <td className="px-6 py-4 text-gray-700">{solicitud.fecha}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoBadge(solicitud.estado)}`}>
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2 justify-center">
                      <button
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      {solicitud.estado === 'pendiente' && (
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
              <p className="text-gray-600 font-semibold">No hay solicitudes para mostrar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
