import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Stethoscope,
  Filter,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * 🏥 Gestión de Solicitudes Diagnóstico
 *
 * Módulo para gestionar solicitudes de diagnósticos de pacientes.
 * Funcionalidades:
 * - Crear nuevas solicitudes
 * - Listar solicitudes con filtros
 * - Actualizar estado de solicitudes
 * - Eliminar solicitudes
 * - Ver detalles de solicitud
 */
export default function GestionSolicitudesDiagnostico() {
  // ========================================================================
  // 📊 STATE MANAGEMENT
  // ========================================================================
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ========================================================================
  // 🔄 LIFECYCLE
  // ========================================================================
  useEffect(() => {
    cargarSolicitudes();
  }, []);

  // ========================================================================
  // 📂 FUNCIONES
  // ========================================================================

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      // TODO: Reemplazar con llamada real al API
      // Datos de ejemplo para demostración
      const datosEjemplo = [
        {
          id: 1,
          numeroSolicitud: 'SOL-2026-0001',
          paciente: 'Juan Pérez García',
          dni: '12345678',
          fechaCreacion: '2026-02-08',
          fechaVencimiento: '2026-02-15',
          tiposDiagnostico: ['Radiografía', 'Tomografía'],
          estado: 'pendiente',
          prioridad: 'alta',
          medico: 'Dr. Carlos López',
          observaciones: 'Dolor en costado izquierdo',
        },
        {
          id: 2,
          numeroSolicitud: 'SOL-2026-0002',
          paciente: 'María Rodríguez López',
          dni: '87654321',
          fechaCreacion: '2026-02-07',
          fechaVencimiento: '2026-02-14',
          tiposDiagnostico: ['Ecografía'],
          estado: 'aprobada',
          prioridad: 'media',
          medico: 'Dra. Ana Martínez',
          observaciones: 'Control prenatal',
        },
        {
          id: 3,
          numeroSolicitud: 'SOL-2026-0003',
          paciente: 'Pedro Fernández González',
          dni: '11223344',
          fechaCreacion: '2026-02-06',
          fechaVencimiento: '2026-02-13',
          tiposDiagnostico: ['Resonancia Magnética'],
          estado: 'completada',
          prioridad: 'baja',
          medico: 'Dr. Roberto Sánchez',
          observaciones: 'Evaluación post-operatoria',
        },
      ];
      setSolicitudes(datosEjemplo);
      toast.success('Solicitudes cargadas correctamente');
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      toast.error('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const filtrarSolicitudes = () => {
    return solicitudes.filter((sol) => {
      const matchSearch =
        sol.numeroSolicitud.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sol.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sol.dni.includes(searchTerm);

      const matchEstado = filterEstado === 'todos' || sol.estado === filterEstado;

      return matchSearch && matchEstado;
    });
  };

  const handleCrearSolicitud = () => {
    setModalMode('create');
    setSelectedSolicitud(null);
    setShowModal(true);
  };

  const handleVerSolicitud = (solicitud) => {
    setModalMode('view');
    setSelectedSolicitud(solicitud);
    setShowModal(true);
  };

  const handleEditarSolicitud = (solicitud) => {
    setModalMode('edit');
    setSelectedSolicitud(solicitud);
    setShowModal(true);
  };

  const handleEliminarSolicitud = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta solicitud?')) {
      setSolicitudes(solicitudes.filter((sol) => sol.id !== id));
      toast.success('Solicitud eliminada');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'Pendiente',
      },
      aprobada: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: CheckCircle,
        label: 'Aprobada',
      },
      completada: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Completada',
      },
      rechazada: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
        label: 'Rechazada',
      },
    };
    return badges[estado] || badges.pendiente;
  };

  const getPrioridadBadge = (prioridad) => {
    const badges = {
      alta: { bg: 'bg-red-100', text: 'text-red-800', emoji: '🔴' },
      media: { bg: 'bg-orange-100', text: 'text-orange-800', emoji: '🟠' },
      baja: { bg: 'bg-green-100', text: 'text-green-800', emoji: '🟢' },
    };
    return badges[prioridad] || badges.media;
  };

  const solicitudesFiltradas = filtrarSolicitudes();
  const totalPages = Math.ceil(solicitudesFiltradas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const solicitudesPaginadas = solicitudesFiltradas.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // ========================================================================
  // 🎨 RENDER
  // ========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-lg">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Gestión de Solicitudes Diagnóstico
                </h1>
                <p className="text-gray-600 mt-1">
                  Administra las solicitudes de diagnósticos médicos
                </p>
              </div>
            </div>

            <button
              onClick={handleCrearSolicitud}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Nueva Solicitud
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número, paciente o DNI..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro Estado */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterEstado}
                onChange={(e) => {
                  setFilterEstado(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobada">Aprobada</option>
                <option value="completada">Completada</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </div>

            {/* Botón Refrescar */}
            <button
              onClick={cargarSolicitudes}
              disabled={loading}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              🔄 Refrescar
            </button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-2xl font-bold text-blue-600">{solicitudes.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {solicitudes.filter((s) => s.estado === 'pendiente').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Aprobadas</p>
              <p className="text-2xl font-bold text-blue-600">
                {solicitudes.filter((s) => s.estado === 'aprobada').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Completadas</p>
              <p className="text-2xl font-bold text-green-600">
                {solicitudes.filter((s) => s.estado === 'completada').length}
              </p>
            </div>
          </div>
        </div>

        {/* Tabla de solicitudes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando solicitudes...</p>
            </div>
          ) : solicitudesFiltradas.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron solicitudes</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Número</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Paciente</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Diagnósticos</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Prioridad</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Médico</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {solicitudesPaginadas.map((solicitud) => {
                      const estadoBadge = getEstadoBadge(solicitud.estado);
                      const prioridadBadge = getPrioridadBadge(solicitud.prioridad);
                      const IconoEstado = estadoBadge.icon;

                      return (
                        <tr
                          key={solicitud.id}
                          className="hover:bg-blue-50 transition-colors border-l-4 border-l-blue-600"
                        >
                          <td className="px-6 py-4 font-mono font-semibold text-gray-900">
                            {solicitud.numeroSolicitud}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {solicitud.paciente}
                              </p>
                              <p className="text-xs text-gray-500">
                                DNI: {solicitud.dni}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex flex-wrap gap-1">
                              {solicitud.tiposDiagnostico.map((tipo, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                >
                                  {tipo}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${estadoBadge.bg} ${estadoBadge.text}`}
                            >
                              <IconoEstado className="w-4 h-4" />
                              {estadoBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${prioridadBadge.bg} ${prioridadBadge.text}`}
                            >
                              {prioridadBadge.emoji} {solicitud.prioridad}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {solicitud.medico}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(solicitud.fechaCreacion).toLocaleDateString(
                                'es-PE'
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleVerSolicitud(solicitud)}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditarSolicitud(solicitud)}
                                className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEliminarSolicitud(solicitud.id)}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                  >
                    ← Anterior
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                  >
                    Siguiente →
                  </button>

                  <span className="ml-4 text-sm font-semibold text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal (simplificado por ahora) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {modalMode === 'create'
                ? 'Nueva Solicitud'
                : modalMode === 'edit'
                ? 'Editar Solicitud'
                : 'Detalles Solicitud'}
            </h2>

            {selectedSolicitud && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Número
                  </label>
                  <p className="text-gray-900 font-mono">
                    {selectedSolicitud.numeroSolicitud}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Paciente
                  </label>
                  <p className="text-gray-900">{selectedSolicitud.paciente}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Observaciones
                  </label>
                  <p className="text-gray-900">{selectedSolicitud.observaciones}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              {modalMode !== 'view' && (
                <button
                  onClick={() => {
                    toast.success('Cambios guardados');
                    setShowModal(false);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
