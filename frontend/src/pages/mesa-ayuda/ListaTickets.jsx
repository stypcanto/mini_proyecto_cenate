import React, { useEffect, useState } from 'react';
import { ListChecks, AlertCircle, RotateCw, ChevronDown } from 'lucide-react';
import ResponderTicketModal from './components/ResponderTicketModal';

/**
 * Página de Lista de Tickets para Mesa de Ayuda
 * Muestra todos los tickets con opción de filtrar, buscar y responder
 *
 * Funcionalidades:
 * - Filtros por estado y prioridad
 * - Búsqueda por título o DNI
 * - Tabla con paginación
 * - Modal para responder tickets
 * - Cambio rápido de estado
 *
 * @version v1.64.0 (2026-02-18)
 */
function ListaTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Modal
  const [showModalResponder, setShowModalResponder] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);

  // Usuario actual (en un proyecto real, vendría del contexto de autenticación)
  const usuario = {
    id: 1, // Reemplazar con ID del usuario de sesión
    nombre: 'Personal Mesa de Ayuda', // Reemplazar con nombre del usuario
  };

  useEffect(() => {
    fetchTickets();
  }, [currentPage, pageSize, filtroEstado, filtroPrioridad]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lazy import para evitar problemas de circular dependencies
      const { mesaAyudaService } = await import('../../services/mesaAyudaService');

      const response = await mesaAyudaService.obtenerTodos(currentPage, pageSize, filtroEstado || null);

      setTickets(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error('Error cargando tickets:', err);
      setError('Error al cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleResponderClick = (ticket) => {
    setTicketSeleccionado(ticket);
    setShowModalResponder(true);
  };

  const handleResponderSuccess = (ticketActualizado) => {
    setShowModalResponder(false);
    setTicketSeleccionado(null);
    fetchTickets();
  };

  const getEstadoBadgeColor = (estado) => {
    const colors = {
      ABIERTO: 'bg-red-100 text-red-800',
      EN_PROCESO: 'bg-yellow-100 text-yellow-800',
      RESUELTO: 'bg-green-100 text-green-800',
      CERRADO: 'bg-gray-100 text-gray-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadBadgeColor = (prioridad) => {
    const colors = {
      ALTA: 'bg-red-100 text-red-800',
      MEDIA: 'bg-orange-100 text-orange-800',
      BAJA: 'bg-blue-100 text-blue-800',
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-800';
  };

  // Filtrar tickets por búsqueda local
  const ticketsFiltrados = tickets.filter(ticket => {
    const searchLower = busqueda.toLowerCase();
    return (
      ticket.titulo.toLowerCase().includes(searchLower) ||
      ticket.dniPaciente?.toLowerCase().includes(searchLower) ||
      ticket.nombreMedico?.toLowerCase().includes(searchLower) ||
      ticket.nombrePaciente?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ListChecks size={32} className="text-blue-600" />
          Lista de Tickets
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona los tickets creados por médicos y proporciona soporte
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={fetchTickets}
            className="text-red-600 hover:text-red-800 flex-shrink-0"
          >
            <RotateCw size={20} />
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Título, DNI, médico, paciente..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="ABIERTO">Abiertos</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="RESUELTO">Resueltos</option>
              <option value="CERRADO">Cerrados</option>
            </select>
          </div>

          {/* Filtro Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              value={filtroPrioridad}
              onChange={(e) => {
                setFiltroPrioridad(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Media</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>

          {/* Botón Refrescar */}
          <div className="flex items-end">
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCw size={18} className={loading ? 'animate-spin' : ''} />
              Refrescar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Tickets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tickets...</p>
          </div>
        ) : ticketsFiltrados.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No hay tickets para mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Médico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {ticketsFiltrados.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      #{ticket.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {ticket.titulo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ticket.nombreMedico || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ticket.nombrePaciente || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadgeColor(ticket.estado)}`}>
                        {ticket.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPrioridadBadgeColor(ticket.prioridad)}`}>
                        {ticket.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(ticket.fechaCreacion).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </td>
                    <td className="px-6 py-4">
                      {ticket.estado === 'ABIERTO' || ticket.estado === 'EN_PROCESO' ? (
                        <button
                          onClick={() => handleResponderClick(ticket)}
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Responder
                        </button>
                      ) : (
                        <span className="inline-block px-4 py-2 bg-green-100 text-green-800 text-xs font-semibold rounded-lg">
                          Resuelto
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && totalPages > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Página {currentPage + 1} de {totalPages} ({tickets.length} registros)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Responder */}
      {ticketSeleccionado && (
        <ResponderTicketModal
          isOpen={showModalResponder}
          onClose={() => setShowModalResponder(false)}
          ticket={ticketSeleccionado}
          usuario={usuario}
          onSuccess={handleResponderSuccess}
        />
      )}
    </div>
  );
}

export default ListaTickets;
