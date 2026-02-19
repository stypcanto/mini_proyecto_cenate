import React, { useEffect, useState, useRef } from 'react';
import { Zap, AlertCircle, RotateCw, ChevronDown, UserCircle, PlayCircle, Clock, CheckCircle2, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
 * - Columna "Personal Asignado" con auto-asignación (v1.65.1)
 *
 * @version v1.65.1 (2026-02-19)
 */
function ListaTickets() {
  const { user } = useAuth();
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
  const [ticketDetalle, setTicketDetalle] = useState(null);

  // Dropdown asignación
  const [dropdownTicketId, setDropdownTicketId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [personalMesaAyuda, setPersonalMesaAyuda] = useState([]);
  const dropdownRef = useRef(null);

  // Usuario actual desde contexto de autenticación
  const usuario = {
    id: user?.id_personal || user?.idPersonal || user?.id,
    nombre: user?.nombreCompleto || user?.username || 'Personal Mesa de Ayuda',
  };

  useEffect(() => {
    fetchTickets();
  }, [currentPage, pageSize, filtroEstado, filtroPrioridad]);

  // Cargar lista de personal Mesa de Ayuda al montar
  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const { mesaAyudaService } = await import('../../services/mesaAyudaService');
        const data = await mesaAyudaService.obtenerPersonalMesaAyuda();
        setPersonalMesaAyuda(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando personal Mesa de Ayuda:', err);
      }
    };
    fetchPersonal();
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownTicketId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleAsignar = async (ticketId, idPersonal, nombrePersonal) => {
    try {
      const { mesaAyudaService } = await import('../../services/mesaAyudaService');
      await mesaAyudaService.asignarTicket(ticketId, {
        idPersonalAsignado: idPersonal,
        nombrePersonalAsignado: nombrePersonal,
      });
      setDropdownTicketId(null);
      fetchTickets();
    } catch (err) {
      console.error('Error asignando ticket:', err);
    }
  };

  const handleDesasignar = async (ticketId) => {
    try {
      const { mesaAyudaService } = await import('../../services/mesaAyudaService');
      await mesaAyudaService.desasignarTicket(ticketId);
      setDropdownTicketId(null);
      fetchTickets();
    } catch (err) {
      console.error('Error desasignando ticket:', err);
    }
  };

  const getEstadoConfig = (estado) => {
    const config = {
      NUEVO: { label: 'Nuevo', color: 'bg-yellow-50 text-yellow-700 border-yellow-300', icon: Clock },
      EN_PROCESO: { label: 'En Proceso', color: 'bg-orange-50 text-orange-700 border-orange-300', icon: PlayCircle },
      RESUELTO: { label: 'Resuelto', color: 'bg-green-50 text-green-700 border-green-300', icon: CheckCircle2 },
    };
    return config[estado] || { label: estado, color: 'bg-gray-50 text-gray-600 border-gray-300', icon: Clock };
  };

  const getPrioridadBadgeColor = (prioridad) => {
    const colors = {
      ALTA: 'bg-red-100 text-red-800',
      MEDIA: 'bg-orange-100 text-orange-800',
      BAJA: 'bg-blue-100 text-blue-800',
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-800';
  };

  // Color del avatar basado en la inicial del nombre
  const getAvatarColor = (nombre) => {
    const colores = [
      'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600',
      'bg-pink-600', 'bg-teal-600', 'bg-indigo-600', 'bg-red-600',
    ];
    const index = nombre ? nombre.charCodeAt(0) % colores.length : 0;
    return colores[index];
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
          <Zap size={32} className="text-yellow-500" />
          Tablero de Tickets
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {ticketsFiltrados.length} tickets
          </span>
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
              <option value="NUEVO">Nuevos</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="RESUELTO">Resueltos</option>
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
              className="w-full px-4 py-2 bg-[#0a5ba9] text-white rounded-lg font-medium hover:bg-[#084a8a] disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCw size={18} className={loading ? 'animate-spin' : ''} />
              Refrescar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Tickets */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full border-collapse">
              <thead className="bg-[#0a5ba9]">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider w-16">
                    Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Código Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Médico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Fecha y Hora de Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Tipo Doc.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    N° Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Nombre del Asegurado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Motivo de Incidencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Estado de Atención
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Personal Asignado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
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
                    <td className="px-4 py-4 text-center">
                      <button
                        className="p-1.5 rounded-lg text-[#0a5ba9] hover:bg-blue-50 transition-colors"
                        title="Ver detalle"
                        onClick={() => setTicketDetalle(ticket)}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-700 font-bold">
                      {ticket.numeroTicket || `#${ticket.id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ticket.nombreMedico || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ticket.especialidad || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(ticket.fechaCreacion).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ticket.tipoDocumento || 'DNI'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {ticket.dniPaciente || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ticket.nombrePaciente || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-[220px]">
                      <span className="line-clamp-3 break-words">{ticket.nombreMotivo || ticket.titulo || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const cfg = getEstadoConfig(ticket.estado);
                        const Icon = cfg.icon;
                        const isResuelto = ticket.estado === 'RESUELTO';
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${cfg.color}`}>
                            <Icon size={14} />
                            {cfg.label}
                            {!isResuelto && <ChevronDown size={12} className="ml-0.5 opacity-60" />}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPrioridadBadgeColor(ticket.prioridad)}`}>
                        {ticket.prioridad}
                      </span>
                    </td>
                    {/* Columna Personal Asignado */}
                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-2 ${ticket.estado !== 'RESUELTO' ? 'cursor-pointer group' : 'cursor-default opacity-80'}`}
                        onClick={(e) => {
                          if (ticket.estado === 'RESUELTO') return;
                          if (dropdownTicketId === ticket.id) {
                            setDropdownTicketId(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDropdownPos({ top: rect.top, left: rect.left });
                            setDropdownTicketId(ticket.id);
                          }
                        }}
                      >
                        {ticket.nombrePersonalAsignado ? (
                          <>
                            <div className={`w-7 h-7 rounded-full ${getAvatarColor(ticket.nombrePersonalAsignado)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                              {ticket.nombrePersonalAsignado.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-900 truncate max-w-[120px]">
                              {ticket.nombrePersonalAsignado}
                            </span>
                          </>
                        ) : (
                          <>
                            <UserCircle size={20} className="text-gray-300 flex-shrink-0" />
                            <span className="text-sm text-gray-400 italic">Sin asignar</span>
                          </>
                        )}
                        {ticket.estado !== 'RESUELTO' && (
                          <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                        )}
                      </div>

                    </td>
                    <td className="px-6 py-4">
                      {ticket.estado === 'NUEVO' || ticket.estado === 'EN_PROCESO' ? (
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

      {/* Dropdown Fixed - Asignar Personal */}
      {dropdownTicketId && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownTicketId(null)} />
          <div
            ref={dropdownRef}
            className="fixed bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[280px] max-h-[240px] overflow-y-auto"
            style={{ top: dropdownPos.top - 8, left: dropdownPos.left, transform: 'translateY(-100%)' }}
          >
            <div className="px-4 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-t-xl">
              Asignar personal
            </div>
            {personalMesaAyuda.length > 0 ? (
              personalMesaAyuda.map((persona) => {
                const ticketActual = ticketsFiltrados.find(t => t.id === dropdownTicketId);
                const isSelected = ticketActual?.idPersonalAsignado === persona.idPersonal;
                return (
                  <button
                    key={persona.idPersonal}
                    onClick={() => handleAsignar(dropdownTicketId, persona.idPersonal, persona.nombreCompleto)}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                      isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full ${getAvatarColor(persona.nombreCompleto)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {persona.nombreCompleto?.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{persona.nombreCompleto}</span>
                    {isSelected && <span className="ml-auto text-blue-500 text-xs">●</span>}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-gray-400 italic">
                No hay personal disponible
              </div>
            )}
            {(() => {
              const ticketActual = ticketsFiltrados.find(t => t.id === dropdownTicketId);
              return ticketActual?.nombrePersonalAsignado ? (
                <button
                  onClick={() => handleDesasignar(dropdownTicketId)}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 border-t border-gray-200 transition-colors"
                >
                  <UserCircle size={16} className="text-red-400" />
                  Desasignar
                </button>
              ) : null;
            })()}
          </div>
        </>
      )}

      {/* Modal Detalle Ticket */}
      {ticketDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setTicketDetalle(null)} />
          <div className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="bg-white px-8 py-5 border-b border-gray-200 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Detalle del Ticket</h2>
                <p className="text-sm text-gray-500 mt-0.5">Ticket {ticketDetalle.numeroTicket}</p>
              </div>
              <button
                onClick={() => setTicketDetalle(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Contenido - 3 tarjetas */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tarjeta 1: Información del Solicitante */}
              <div className="bg-white rounded-xl border-2 border-teal-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <UserCircle size={20} className="text-teal-600" />
                  <h3 className="font-semibold text-gray-900">Información del Solicitante</h3>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${getAvatarColor(ticketDetalle.nombreMedico || 'N')} flex items-center justify-center text-white font-bold`}>
                    {(ticketDetalle.nombreMedico || 'N').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nombre</p>
                    <p className="font-semibold text-gray-900">{ticketDetalle.nombreMedico || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500">Especialidad</p>
                  <p className="text-sm font-medium text-gray-900">{ticketDetalle.especialidad || 'N/A'}</p>
                </div>

                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Categoría</p>
                  <span className="inline-block bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                    {ticketDetalle.nombreMotivo || ticketDetalle.titulo || 'Sin categoría'}
                  </span>
                </div>
              </div>

              {/* Tarjeta 2: Descripción del Problema */}
              <div className="bg-white rounded-xl border-2 border-teal-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <h3 className="font-semibold text-gray-900">Descripción del Problema</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {ticketDetalle.observaciones || ticketDetalle.descripcion || 'Sin descripción'}
                </p>
              </div>

              {/* Tarjeta 3: Datos del Paciente */}
              <div className="bg-white rounded-xl border-2 border-teal-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <h3 className="font-semibold text-gray-900">Datos del Paciente</h3>
                </div>

                <div className="bg-teal-50 rounded-lg p-3 mb-3 border border-teal-100">
                  <p className="text-xs text-gray-500">Nombre del Paciente</p>
                  <p className="font-semibold text-gray-900">{ticketDetalle.nombrePaciente || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3 flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
                  <div>
                    <p className="text-xs text-gray-500">{ticketDetalle.tipoDocumento || 'DNI'}</p>
                    <p className="text-sm font-semibold text-gray-900">{ticketDetalle.dniPaciente || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  <div>
                    <p className="text-xs text-gray-500">IPRESS</p>
                    <p className="text-sm font-semibold text-gray-900">{ticketDetalle.ipress || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Ocultar detalles */}
            <div className="px-8 pb-6 flex justify-center">
              <button
                onClick={() => setTicketDetalle(null)}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                Ocultar detalles
              </button>
            </div>
          </div>
        </div>
      )}

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
