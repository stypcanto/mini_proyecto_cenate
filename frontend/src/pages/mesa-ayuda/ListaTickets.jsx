import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Zap, AlertCircle, RotateCw, ChevronDown, UserCircle, PlayCircle, Clock, CheckCircle2, Eye, Users, Archive, Pencil, Check, X, Timer, User, Stethoscope } from 'lucide-react';
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
  const { user, hasRole } = useAuth();
  const location = useLocation();

  // Detectar modo según la ruta actual
  const esPendientes = location.pathname.includes('tickets-pendientes');
  const esAtendidos = location.pathname.includes('tickets-atendidos');

  // Configuración según modo
  const modoConfig = useMemo(() => {
    if (esAtendidos) {
      return {
        titulo: 'Tickets Atendidos',
        subtitulo: 'Historial de tickets resueltos y cerrados',
        icon: Archive,
        estadosBackend: 'RESUELTO,CERRADO',
        mostrarSemaforo: false,
        mostrarSeleccionMultiple: false,
      };
    }
    if (esPendientes) {
      return {
        titulo: 'Tickets Pendientes',
        subtitulo: 'Tickets nuevos y en proceso que requieren atención',
        icon: Zap,
        estadosBackend: 'NUEVO,EN_PROCESO',
        mostrarSemaforo: true,
        mostrarSeleccionMultiple: true,
      };
    }
    // Modo genérico (todas las rutas)
    return {
      titulo: 'Tablero de Tickets',
      subtitulo: 'Gestiona los tickets creados por médicos y proporciona soporte',
      icon: Zap,
      estadosBackend: null,
      mostrarSemaforo: true,
      mostrarSeleccionMultiple: true,
    };
  }, [esPendientes, esAtendidos]);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);

  // Filtros
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [busquedaDni, setBusquedaDni] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroSemaforo, setFiltroSemaforo] = useState('');

  // Modal
  const [showModalResponder, setShowModalResponder] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [ticketDetalle, setTicketDetalle] = useState(null);
  const [ticketTiempo, setTicketTiempo] = useState(null);

  // Edición de teléfonos en modal detalle
  const [editandoTelefonos, setEditandoTelefonos] = useState(false);
  const [telPrincipalEdit, setTelPrincipalEdit] = useState('');
  const [telAlternoEdit, setTelAlternoEdit] = useState('');
  const [guardandoTelefonos, setGuardandoTelefonos] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Dropdown asignación
  const [dropdownTicketId, setDropdownTicketId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [personalMesaAyuda, setPersonalMesaAyuda] = useState([]);
  const dropdownRef = useRef(null);

  // Selección múltiple
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const bulkDropdownRef = useRef(null);

  // Usuario actual desde contexto de autenticación
  const usuario = {
    id: user?.id_personal || user?.idPersonal || user?.id,
    nombre: user?.nombreCompleto || user?.username || 'Personal Mesa de Ayuda',
  };

  // Reset page y filtro al cambiar de ruta
  useEffect(() => {
    setCurrentPage(0);
    setFiltroPrioridad('');
    setBusquedaDni('');
    setFiltroMedico('');
    setFiltroSemaforo('');
    setSelectedTickets(new Set());
  }, [location.pathname]);

  useEffect(() => {
    fetchTickets();
  }, [currentPage, pageSize, modoConfig.estadosBackend]);

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
      if (bulkDropdownRef.current && !bulkDropdownRef.current.contains(event.target)) {
        setShowBulkDropdown(false);
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

      // Usar los estados del modo (pendientes: NUEVO,EN_PROCESO; atendidos: RESUELTO,CERRADO)
      const estadoParam = modoConfig.estadosBackend || null;
      const response = await mesaAyudaService.obtenerTodos(currentPage, pageSize, estadoParam);

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

  // Asignación masiva
  const handleBulkAsignar = async (idPersonal, nombrePersonal) => {
    setBulkAssigning(true);
    try {
      const { mesaAyudaService } = await import('../../services/mesaAyudaService');
      await mesaAyudaService.asignarMasivo({
        ticketIds: Array.from(selectedTickets),
        idPersonalAsignado: idPersonal,
        nombrePersonalAsignado: nombrePersonal,
      });
      setSelectedTickets(new Set());
      setShowBulkDropdown(false);
      fetchTickets();
    } catch (err) {
      console.error('Error en asignación masiva:', err);
    } finally {
      setBulkAssigning(false);
    }
  };

  const toggleTicketSelection = (ticketId) => {
    setSelectedTickets(prev => {
      const next = new Set(prev);
      if (next.has(ticketId)) next.delete(ticketId);
      else next.add(ticketId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTickets.size === ticketsAsignables.length && ticketsAsignables.length > 0) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(ticketsAsignables.map(t => t.id)));
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

  // Semaforización por tiempo transcurrido desde creación
  const getSemaforo = (fechaCreacion) => {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const minutos = Math.floor((ahora - creacion) / 60000);

    if (minutos <= 20) {
      return { color: 'bg-green-500', shadow: 'shadow-green-400/50', anim: '', label: `${minutos} min`, titulo: 'Dentro de los 20 minutos' };
    } else if (minutos <= 40) {
      return { color: 'bg-yellow-400', shadow: 'shadow-yellow-400/50', anim: 'animate-pulse-slow', label: `${minutos} min`, titulo: 'Entre 20 y 40 minutos' };
    } else {
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      const label = horas > 0 ? `${horas}h ${mins}m` : `${minutos} min`;
      return { color: 'bg-red-500', shadow: 'shadow-red-400/50', anim: 'animate-pulse-fast', label, titulo: `Más de 40 minutos (${label})` };
    }
  };

  // Iniciar edición de teléfonos
  const handleEditarTelefonos = () => {
    setTelPrincipalEdit(ticketDetalle?.telefonoPaciente || '');
    setTelAlternoEdit(ticketDetalle?.telefonoPacienteAlterno || '');
    setEditandoTelefonos(true);
  };

  // Cancelar edición de teléfonos
  const handleCancelarTelefonos = () => {
    setEditandoTelefonos(false);
  };

  // Guardar teléfonos editados
  const handleGuardarTelefonos = async () => {
    setGuardandoTelefonos(true);
    try {
      const { mesaAyudaService } = await import('../../services/mesaAyudaService');
      const ticketActualizado = await mesaAyudaService.actualizarTelefonos(ticketDetalle.id, {
        telefonoPrincipal: telPrincipalEdit,
        telefonoAlterno: telAlternoEdit,
      });
      // Actualizar el detalle localmente
      setTicketDetalle({
        ...ticketDetalle,
        telefonoPaciente: telPrincipalEdit,
        telefonoPacienteAlterno: telAlternoEdit,
      });
      setEditandoTelefonos(false);
      setToastMsg({ tipo: 'ok', texto: 'Teléfonos actualizados correctamente' });
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      console.error('Error actualizando teléfonos:', err);
      setToastMsg({ tipo: 'error', texto: 'Error al actualizar teléfonos' });
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setGuardandoTelefonos(false);
    }
  };

  // Lista única de médicos para el dropdown
  const medicosUnicos = useMemo(() => {
    const nombres = new Set();
    tickets.forEach(t => { if (t.nombreMedico) nombres.add(t.nombreMedico); });
    return Array.from(nombres).sort();
  }, [tickets]);

  // Calcular semáforo helper para filtro
  const getSemaforoNivel = (fechaCreacion) => {
    const minutos = Math.floor((new Date() - new Date(fechaCreacion)) / 60000);
    if (minutos <= 20) return 'verde';
    if (minutos <= 40) return 'amarillo';
    return 'rojo';
  };

  // Filtrar tickets por filtros locales
  const ticketsFiltrados = tickets.filter(ticket => {
    // Filtro DNI
    if (busquedaDni && !ticket.dniPaciente?.toLowerCase().includes(busquedaDni.toLowerCase())) return false;
    // Filtro Médico
    if (filtroMedico && ticket.nombreMedico !== filtroMedico) return false;
    // Filtro Semáforo (nivel de importancia por tiempo)
    if (filtroSemaforo && modoConfig.mostrarSemaforo && getSemaforoNivel(ticket.fechaCreacion) !== filtroSemaforo) return false;
    // Filtro Prioridad
    if (filtroPrioridad && ticket.prioridad !== filtroPrioridad) return false;
    return true;
  });

  // Solo tickets asignables (sin personal y no resueltos)
  const ticketsAsignables = ticketsFiltrados.filter(t => !t.nombrePersonalAsignado && t.estado !== 'RESUELTO');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          {React.createElement(modoConfig.icon, { size: 32, className: esAtendidos ? 'text-green-500' : 'text-yellow-500' })}
          {modoConfig.titulo}
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {ticketsFiltrados.length} tickets
          </span>
        </h1>
        <p className="text-gray-600 mt-2">
          {modoConfig.subtitulo}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Buscar por DNI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por DNI
            </label>
            <input
              type="text"
              value={busquedaDni}
              onChange={(e) => setBusquedaDni(e.target.value)}
              placeholder="N° de documento..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro Médico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profesional de Salud
            </label>
            <select
              value={filtroMedico}
              onChange={(e) => {
                setFiltroMedico(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {medicosUnicos.map(nombre => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
            </select>
          </div>

          {/* Filtro Nivel de Importancia (Semáforo) */}
          {modoConfig.mostrarSemaforo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de Importancia
              </label>
              <select
                value={filtroSemaforo}
                onChange={(e) => {
                  setFiltroSemaforo(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="rojo">Rojo (&gt; 40 min)</option>
                <option value="amarillo">Amarillo (20 – 40 min)</option>
                <option value="verde">Verde (≤ 20 min)</option>
              </select>
            </div>
          )}

          {/* Filtro Prioridad de Ticket */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad de Ticket
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

      {/* Leyenda de Tiempo de espera - solo en modo pendientes */}
      {modoConfig.mostrarSemaforo && (
        <div className="flex items-center gap-5 mb-3 px-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tiempo de espera:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
            <span className="text-xs text-gray-600">≤ 20 min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
            <span className="text-xs text-gray-600">20 – 40 min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span className="text-xs text-gray-600">&gt; 40 min</span>
          </div>
        </div>
      )}

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
                  {modoConfig.mostrarSeleccionMultiple && (
                    <th className="px-3 py-3 text-center w-12">
                      <input
                        type="checkbox"
                        checked={ticketsAsignables.length > 0 && selectedTickets.size === ticketsAsignables.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-white/50 text-blue-400 focus:ring-blue-400 cursor-pointer accent-white"
                        title="Seleccionar todos los tickets sin asignar"
                      />
                    </th>
                  )}
                  {modoConfig.mostrarSemaforo && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider w-10">
                    </th>
                  )}
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-white uppercase tracking-wider w-12">
                    Info
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Ticket
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Profesional de Salud
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Especialidad
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Documento
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Asegurado
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Estado
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Prioridad
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Asignado a
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Espera
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {ticketsFiltrados.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${selectedTickets.has(ticket.id) ? 'bg-blue-50/50' : ''}`}
                  >
                    {modoConfig.mostrarSeleccionMultiple && (
                      <td className="px-3 py-2.5 text-center">
                        {!ticket.nombrePersonalAsignado && ticket.estado !== 'RESUELTO' ? (
                          <input
                            type="checkbox"
                            checked={selectedTickets.has(ticket.id)}
                            onChange={() => toggleTicketSelection(ticket.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </td>
                    )}
                    {modoConfig.mostrarSemaforo && (
                      <td className="px-2 py-2.5 text-center">
                        {(() => {
                          const sem = getSemaforo(ticket.fechaCreacion);
                          return (
                            <div className="flex justify-center" title={sem.titulo}>
                              <div className={`w-3.5 h-3.5 rounded-full ${sem.color} shadow-md ${sem.shadow} ${sem.anim}`} />
                            </div>
                          );
                        })()}
                      </td>
                    )}
                    <td className="px-3 py-2.5 text-center">
                      <button
                        className="p-1.5 rounded-lg text-[#0a5ba9] hover:bg-blue-50 transition-colors"
                        title="Ver detalle"
                        onClick={() => setTicketDetalle(ticket)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-blue-700 font-bold whitespace-nowrap">
                      {ticket.numeroTicket || `#${ticket.id}`}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900 max-w-[140px]">
                      <span className="block truncate" title={ticket.nombreMedico || 'N/A'}>{ticket.nombreMedico || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap max-w-[120px]">
                      <span className="block truncate" title={ticket.especialidad || 'N/A'}>{ticket.especialidad || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-700 whitespace-nowrap">
                      <span className="text-xs text-gray-400">{ticket.tipoDocumento || 'DNI'}</span>
                      {' '}
                      <span className="font-medium">{ticket.dniPaciente || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900 max-w-[160px]">
                      <span className="block truncate" title={ticket.nombrePaciente || 'N/A'}>{ticket.nombrePaciente || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-600 max-w-[180px]">
                      <span className="block truncate" title={ticket.nombreMotivo || ticket.titulo || 'N/A'}>{ticket.nombreMotivo || ticket.titulo || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {(() => {
                        const cfg = getEstadoConfig(ticket.estado);
                        const Icon = cfg.icon;
                        const isResuelto = ticket.estado === 'RESUELTO';
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-semibold whitespace-nowrap ${cfg.color}`}>
                            <Icon size={12} />
                            {cfg.label}
                            {!isResuelto && <ChevronDown size={11} className="ml-0.5 opacity-60" />}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getPrioridadBadgeColor(ticket.prioridad)}`}>
                        {ticket.prioridad}
                      </span>
                    </td>
                    {/* Columna Personal Asignado */}
                    <td className="px-3 py-2.5">
                      {ticket.nombrePersonalAsignado ? (
                        <div
                          className={`flex items-center gap-1.5 ${ticket.estado !== 'RESUELTO' && hasRole('SUPERADMIN') ? 'cursor-pointer group' : 'cursor-default'}`}
                          title={ticket.nombrePersonalAsignado}
                          onClick={(e) => {
                            if (ticket.estado === 'RESUELTO') return;
                            if (!hasRole('SUPERADMIN')) return;
                            if (dropdownTicketId === ticket.id) {
                              setDropdownTicketId(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDropdownPos({ top: rect.top, left: rect.left });
                              setDropdownTicketId(ticket.id);
                            }
                          }}
                        >
                          <div className={`w-6 h-6 rounded-full ${getAvatarColor(ticket.nombrePersonalAsignado)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {ticket.nombrePersonalAsignado.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-800 truncate max-w-[100px]">
                            {ticket.nombrePersonalAsignado}
                          </span>
                          {ticket.estado !== 'RESUELTO' && hasRole('SUPERADMIN') && (
                            <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                          )}
                        </div>
                      ) : ticket.estado === 'RESUELTO' ? (
                        <div className="flex items-center gap-1.5 opacity-50">
                          <UserCircle size={16} className="text-gray-300 flex-shrink-0" />
                          <span className="text-xs text-gray-400 italic">Sin asignar</span>
                        </div>
                      ) : hasRole('SUPERADMIN') ? (
                        <button
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all cursor-pointer group"
                          onClick={(e) => {
                            if (dropdownTicketId === ticket.id) {
                              setDropdownTicketId(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDropdownPos({ top: rect.top, left: rect.left });
                              setDropdownTicketId(ticket.id);
                            }
                          }}
                        >
                          <UserCircle size={14} className="text-blue-400 group-hover:text-blue-500 flex-shrink-0" />
                          <span className="text-xs text-blue-600 group-hover:text-blue-700 font-medium">Asignar</span>
                          <ChevronDown size={11} className="text-blue-400 group-hover:text-blue-500 flex-shrink-0" />
                        </button>
                      ) : (
                        <button
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all cursor-pointer group"
                          onClick={() => handleAsignar(ticket.id, usuario.id, usuario.nombre)}
                        >
                          <UserCircle size={14} className="text-blue-400 group-hover:text-blue-500 flex-shrink-0" />
                          <span className="text-xs text-blue-600 group-hover:text-blue-700 font-medium">Asignarme</span>
                        </button>
                      )}

                    </td>
                    {/* Columna Tiempo de Espera */}
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => setTicketTiempo(ticket)}
                        className="p-1 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
                        title="Ver tiempo de espera"
                      >
                        <Timer size={16} />
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      {ticket.estado === 'NUEVO' || ticket.estado === 'EN_PROCESO' ? (
                        <button
                          onClick={() => handleResponderClick(ticket)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Responder
                        </button>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-lg whitespace-nowrap">
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
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              Página <span className="font-semibold text-gray-700">{currentPage + 1}</span> de{' '}
              <span className="font-semibold text-gray-700">{totalPages}</span>
              {' '}·{' '}
              <span className="font-semibold text-gray-700">{tickets.length}</span> registros en esta página
            </div>
            <div className="flex items-center gap-1">
              {/* Primera página */}
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Primera página"
              >
                «
              </button>
              {/* Anterior */}
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ‹ Anterior
              </button>

              {/* Números de página */}
              {(() => {
                const pages = [];
                const delta = 2;
                const left = Math.max(0, currentPage - delta);
                const right = Math.min(totalPages - 1, currentPage + delta);

                if (left > 0) {
                  pages.push(0);
                  if (left > 1) pages.push('...');
                }
                for (let i = left; i <= right; i++) pages.push(i);
                if (right < totalPages - 1) {
                  if (right < totalPages - 2) pages.push('...');
                  pages.push(totalPages - 1);
                }

                return pages.map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-sm text-gray-400 select-none">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-9 h-8 rounded-lg text-sm font-medium transition-colors border ${
                        p === currentPage
                          ? 'bg-[#0a5ba9] text-white border-[#0a5ba9] shadow-sm'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p + 1}
                    </button>
                  )
                );
              })()}

              {/* Siguiente */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente ›
              </button>
              {/* Última página */}
              <button
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Última página"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Barra flotante de asignación masiva */}
      {selectedTickets.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0a5ba9] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {selectedTickets.size}
            </div>
            <span className="text-sm font-medium">
              {selectedTickets.size === 1 ? 'ticket seleccionado' : 'tickets seleccionados'}
            </span>
          </div>
          <div className="w-px h-8 bg-white/30" />
          {hasRole('SUPERADMIN') ? (
            <div className="relative" ref={bulkDropdownRef}>
              <button
                onClick={() => setShowBulkDropdown(!showBulkDropdown)}
                disabled={bulkAssigning}
                className="flex items-center gap-2 bg-white text-[#0a5ba9] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <Users size={16} />
                {bulkAssigning ? 'Asignando...' : 'Asignar personal'}
                <ChevronDown size={14} />
              </button>
              {showBulkDropdown && (
                <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-xl shadow-2xl min-w-[280px] max-h-[240px] overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-t-xl">
                    Asignar a los {selectedTickets.size} tickets
                  </div>
                  {personalMesaAyuda.map((persona) => (
                    <button
                      key={persona.idPersonal}
                      onClick={() => handleBulkAsignar(persona.idPersonal, persona.nombreCompleto)}
                      className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 hover:bg-blue-50 hover:text-blue-700 text-gray-700 transition-colors"
                    >
                      <div className={`w-7 h-7 rounded-full ${getAvatarColor(persona.nombreCompleto)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {persona.nombreCompleto?.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{persona.nombreCompleto}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleBulkAsignar(usuario.id, usuario.nombre)}
              disabled={bulkAssigning}
              className="flex items-center gap-2 bg-white text-[#0a5ba9] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <Users size={16} />
              {bulkAssigning ? 'Asignando...' : 'Asignarme todos'}
            </button>
          )}
          <button
            onClick={() => setSelectedTickets(new Set())}
            className="text-white/70 hover:text-white text-sm underline underline-offset-2 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

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
            {/* Desasignar solo visible para SUPERADMIN */}
            {(() => {
              const ticketActual = ticketsFiltrados.find(t => t.id === dropdownTicketId);
              return ticketActual?.nombrePersonalAsignado && hasRole('SUPERADMIN') ? (
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

      {/* Toast de confirmación */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top ${
          toastMsg.tipo === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toastMsg.tipo === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toastMsg.texto}
        </div>
      )}

      {/* Modal Detalle Ticket */}
      {ticketDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setTicketDetalle(null); setEditandoTelefonos(false); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="bg-[#0a5ba9] px-8 py-5 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Detalle del Ticket</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-blue-200">{ticketDetalle.numeroTicket}</span>
                    {ticketDetalle.prioridad && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        ticketDetalle.prioridad === 'ALTA' ? 'bg-red-500 text-white' :
                        ticketDetalle.prioridad === 'MEDIA' ? 'bg-amber-400 text-white' :
                        'bg-green-500 text-white'
                      }`}>{ticketDetalle.prioridad}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setTicketDetalle(null); setEditandoTelefonos(false); }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Contenido - 3 tarjetas */}
            <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Tarjeta 1: Información del Solicitante */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                  <UserCircle size={18} className="text-emerald-700" />
                  <h3 className="font-semibold text-emerald-700 text-sm">Información del Solicitante</h3>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(ticketDetalle.nombreMedico || 'N')} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {(ticketDetalle.nombreMedico || 'N').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Profesional de Salud</p>
                      <p className="font-semibold text-gray-900 text-sm">{ticketDetalle.nombreMedico || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-0.5">Especialidad</p>
                    <p className="text-sm font-medium text-gray-800">{ticketDetalle.especialidad || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Categoría</p>
                    <span className="inline-block bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg leading-snug">
                      {ticketDetalle.nombreMotivo || ticketDetalle.titulo || 'Sin categoría'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: Descripción del Problema */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-700"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <h3 className="font-semibold text-emerald-700 text-sm">Descripción del Problema</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {ticketDetalle.observaciones || ticketDetalle.descripcion || 'Sin descripción'}
                  </p>
                </div>
              </div>

              {/* Tarjeta 3: Datos del Paciente */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-700"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <h3 className="font-semibold text-emerald-700 text-sm">Datos del Paciente</h3>
                </div>
                <div className="p-5">
                  <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
                    <p className="text-xs text-gray-400 mb-0.5">Nombre del Paciente</p>
                    <p className="font-semibold text-gray-900 text-sm">{ticketDetalle.nombrePaciente || 'N/A'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-2.5 flex items-center gap-3 border border-gray-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0a5ba9] flex-shrink-0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
                    <div>
                      <p className="text-xs text-gray-400">{ticketDetalle.tipoDocumento || 'DNI'}</p>
                      <p className="text-sm font-semibold text-gray-900">{ticketDetalle.dniPaciente || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Teléfonos - Modo lectura o edición */}
                  {!editandoTelefonos ? (
                    <>
                      <div className="bg-gray-50 rounded-lg p-3 mb-2.5 flex items-center gap-3 group/tel border border-gray-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0a5ba9] flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400">Teléfono móvil principal</p>
                          <p className="text-sm font-semibold text-gray-900">{ticketDetalle.telefonoPaciente || 'N/A'}</p>
                        </div>
                        <button
                          onClick={handleEditarTelefonos}
                          className="opacity-0 group-hover/tel:opacity-100 p-1.5 rounded-lg hover:bg-blue-50 text-[#0a5ba9] transition-all"
                          title="Editar teléfonos"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-2.5 flex items-center gap-3 group/tel2 border border-gray-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0a5ba9] flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400">Teléfono alterno</p>
                          <p className="text-sm font-semibold text-gray-900">{ticketDetalle.telefonoPacienteAlterno || 'N/A'}</p>
                        </div>
                        <button
                          onClick={handleEditarTelefonos}
                          className="opacity-0 group-hover/tel2:opacity-100 p-1.5 rounded-lg hover:bg-blue-50 text-[#0a5ba9] transition-all"
                          title="Editar teléfonos"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="bg-blue-50 rounded-lg p-3 mb-2.5 border border-blue-200">
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 block mb-1">Teléfono móvil principal</label>
                        <input
                          type="text"
                          value={telPrincipalEdit}
                          onChange={(e) => setTelPrincipalEdit(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ej: 987654321"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 block mb-1">Teléfono celular o fijo alterno</label>
                        <input
                          type="text"
                          value={telAlternoEdit}
                          onChange={(e) => setTelAlternoEdit(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ej: 014567890"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleGuardarTelefonos}
                          disabled={guardandoTelefonos}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a5ba9] text-white text-xs font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
                        >
                          <Check size={14} />
                          {guardandoTelefonos ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          onClick={handleCancelarTelefonos}
                          disabled={guardandoTelefonos}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                        >
                          <X size={14} />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 border border-gray-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0a5ba9] flex-shrink-0"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    <div>
                      <p className="text-xs text-gray-400">IPRESS</p>
                      <p className="text-sm font-semibold text-gray-900">{ticketDetalle.ipress || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-center">
              <button
                onClick={() => { setTicketDetalle(null); setEditandoTelefonos(false); }}
                className="flex items-center gap-2 text-[#0a5ba9] hover:text-blue-800 font-medium text-sm transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                Cerrar detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tiempo de Espera */}
      {ticketTiempo && (() => {
        const inicio = new Date(ticketTiempo.fechaCreacion);
        const fechaAtencionReal = ticketTiempo.fechaAtencion || ticketTiempo.fechaRespuesta || (ticketTiempo.estado === 'RESUELTO' ? ticketTiempo.fechaActualizacion : null);
        const fin = fechaAtencionReal ? new Date(fechaAtencionReal) : new Date();
        const esResuelto = fechaAtencionReal != null;
        const diffMs = fin - inicio;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMin / 60);
        const diffDias = Math.floor(diffHrs / 24);

        let textoTiempo = '';
        let colorTiempo = 'text-emerald-600';
        let bgKpi = 'bg-emerald-50';
        if (diffDias > 0) {
          textoTiempo = `${diffDias} día${diffDias > 1 ? 's' : ''}`;
          if (diffDias >= 3) { colorTiempo = 'text-red-500'; bgKpi = 'bg-red-50'; }
          else { colorTiempo = 'text-amber-600'; bgKpi = 'bg-amber-50'; }
        } else if (diffHrs > 0) {
          textoTiempo = `${diffHrs}h ${diffMin % 60}m`;
          if (diffHrs >= 12) { colorTiempo = 'text-amber-600'; bgKpi = 'bg-amber-50'; }
        } else {
          textoTiempo = `${diffMin} min`;
        }

        const formatFecha = (f) => f ? new Date(f).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : null;
        const getInitials = (name) => name ? name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() : '?';

        const estadoConfig = {
          'NUEVO': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Nuevo' },
          'EN_PROCESO': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En Proceso' },
          'RESUELTO': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Resuelto' },
          'CERRADO': { bg: 'bg-gray-200', text: 'text-gray-600', label: 'Cerrado' },
        };
        const prioridadConfig = {
          'ALTA': { bg: 'bg-red-100', text: 'text-red-700' },
          'MEDIA': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
          'BAJA': { bg: 'bg-green-100', text: 'text-green-700' },
        };
        const est = estadoConfig[ticketTiempo.estado] || estadoConfig['NUEVO'];
        const prio = prioridadConfig[ticketTiempo.prioridad] || prioridadConfig['MEDIA'];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/30" onClick={() => setTicketTiempo(null)} />
            <div className="relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-[680px] mx-4 overflow-hidden">

              {/* Header: Ticket + Estado + Prioridad */}
              <div className="bg-gradient-to-r from-[#0a5ba9] to-[#1472c4] px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-bold text-base">Ticket #{ticketTiempo.numeroTicket || ticketTiempo.id}</h3>
                  <span className={`${est.bg} ${est.text} text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1`}>
                    <CheckCircle2 size={12} />
                    {est.label}
                  </span>
                  <span className={`${prio.bg} ${prio.text} text-[11px] font-semibold px-2.5 py-0.5 rounded-full`}>
                    {ticketTiempo.prioridad}
                  </span>
                </div>
                <button
                  onClick={() => setTicketTiempo(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>

              {/* Dos tarjetas */}
              <div className="p-5">
                <div className="grid grid-cols-2 gap-5">

                  {/* Tarjeta Izquierda - Solicitante (borde teal) */}
                  <div className="border-l-[3px] border-teal-400 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-white p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <Stethoscope size={16} className="text-teal-500" />
                      <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Solicitante</h4>
                    </div>

                    {/* Profesional con avatar */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{getInitials(ticketTiempo.nombreMedico)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400">Nombre completo</p>
                        <p className="text-sm font-bold text-gray-800 leading-tight">{ticketTiempo.nombreMedico || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Paciente con avatar */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-500 text-xs font-bold">{getInitials(ticketTiempo.nombrePaciente)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400">Paciente</p>
                        <p className="text-sm font-bold text-gray-800 leading-tight">{ticketTiempo.nombrePaciente || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Motivo */}
                    {ticketTiempo.nombreMotivo && (
                      <div className="mt-2">
                        <p className="text-[11px] text-gray-400 mb-1">Categoría</p>
                        <p className="text-sm text-gray-700 leading-relaxed" style={{ textTransform: 'lowercase' }}><span style={{ textTransform: 'capitalize' }}>{ticketTiempo.nombreMotivo?.charAt(0)}</span>{ticketTiempo.nombreMotivo?.slice(1)}</p>
                      </div>
                    )}
                  </div>

                  {/* Tarjeta Derecha - Tiempo de Atención (borde naranja) */}
                  <div className="border-l-[3px] border-orange-400 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-white p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-5">
                      <Timer size={16} className="text-orange-500" />
                      <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Tiempo de Atención</h4>
                    </div>

                    {/* KPI grande */}
                    <div className={`${bgKpi} rounded-xl p-5 text-center mb-5 flex-1 flex flex-col justify-center`}>
                      <p className={`text-4xl font-black ${colorTiempo} tracking-tight italic`}>{textoTiempo}</p>
                      <p className="text-xs text-gray-400 mt-2 font-medium">
                        {esResuelto ? 'desde la creación' : 'desde la incidencia'}
                      </p>
                    </div>

                    {/* Fechas en formato tabla */}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-medium">Registro de incidencia:</span>
                        <span className="font-semibold text-gray-700">{formatFecha(ticketTiempo.fechaCreacion) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-medium">Asignación:</span>
                        <span className="font-semibold text-gray-700">{formatFecha(ticketTiempo.fechaAsignacion) || <span className="text-gray-300 italic">Pendiente</span>}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-medium">Atención:</span>
                        <span className={`font-semibold ${fechaAtencionReal ? 'text-emerald-600' : 'text-gray-300 italic'}`}>
                          {formatFecha(fechaAtencionReal) || 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
