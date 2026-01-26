// ========================================================================
// 🔍 RevisionDisponibilidad.jsx - Revisión de Disponibilidad Médica
// ------------------------------------------------------------------------
// Permite al Coordinador revisar y ajustar las disponibilidades de turnos
// enviadas por los médicos, con opción de marcar como REVISADO.
//
// Funcionalidades:
// - Listar solicitudes ENVIADAS por periodo
// - Filtrar por especialidad y buscar por médico
// - Ver calendario completo de disponibilidad
// - Ajustar turnos individuales
// - Marcar como REVISADO
//
// @author Ing. Styp Canto Rondon
// @version 1.0.0
// @since 2025-12-27
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Filter,
  Loader2,
  Search,
  UserCheck,
  X,
  AlertCircle,
  Save,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  GitMerge,
  Database
} from 'lucide-react';
import { disponibilidadService } from '../../../services/disponibilidadService';
import { especialidadService } from '../../../services/especialidadService';
import { integracionHorarioService } from '../../../services/integracionHorarioService';
import toast from 'react-hot-toast';

export default function RevisionDisponibilidad() {
  // ============================================================
  // ESTADOS
  // ============================================================
  const [periodo, setPeriodo] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [solicitudes, setSolicitudes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');

  // Modal de revisión
  const [showModal, setShowModal] = useState(false);
  const [selectedDisponibilidad, setSelectedDisponibilidad] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Ajuste de turnos
  const [ajusteMode, setAjusteMode] = useState(null); // { idDetalle, fecha, turnoActual }
  const [nuevoTurno, setNuevoTurno] = useState('');
  const [observacionAjuste, setObservacionAjuste] = useState('');
  const [saving, setSaving] = useState(false);

  // Confirmación de revisado
  const [confirmRevisado, setConfirmRevisado] = useState(false);

  // Modal de sincronización (NUEVO v2.0)
  const [showModalSincronizar, setShowModalSincronizar] = useState(false);
  const [areaSeleccionada, setAreaSeleccionada] = useState('');
  const [areas, setAreas] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);
  const [resultadoSincronizacion, setResultadoSincronizacion] = useState(null);

  // ============================================================
  // CARGAR ESPECIALIDADES
  // ============================================================
  useEffect(() => {
    cargarEspecialidades();
  }, []);

  const cargarEspecialidades = async () => {
    try {
      const data = await especialidadService.listarActivas();
      setEspecialidades(data);
    } catch (err) {
      console.error('Error al cargar especialidades:', err);
    }
  };

  // ============================================================
  // CARGAR SOLICITUDES ENVIADAS POR PERIODO
  // ============================================================
  useEffect(() => {
    if (periodo) {
      cargarSolicitudes();
    }
  }, [periodo]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await disponibilidadService.listarEnviadas(periodo);
      setSolicitudes(data);
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
      setError('No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FILTROS
  // ============================================================
  const solicitudesFiltradas = solicitudes.filter((s) => {
    const matchSearch = searchTerm === '' ||
      s.nombreMedico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.documentoMedico.includes(searchTerm);

    const matchEspecialidad = filtroEspecialidad === '' ||
      s.idEspecialidad === parseInt(filtroEspecialidad);

    return matchSearch && matchEspecialidad;
  });

  // ============================================================
  // ABRIR MODAL DE REVISIÓN
  // ============================================================
  const abrirModal = async (solicitud) => {
    setShowModal(true);
    setLoadingDetalle(true);
    setSelectedDisponibilidad(null);
    setAjusteMode(null);
    setObservacionAjuste('');
    setConfirmRevisado(false);

    try {
      const detalle = await disponibilidadService.obtenerPorId(solicitud.idDisponibilidad);
      setSelectedDisponibilidad(detalle);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      setError('No se pudo cargar el detalle de la disponibilidad.');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedDisponibilidad(null);
    setAjusteMode(null);
    setObservacionAjuste('');
    setConfirmRevisado(false);
  };

  // ============================================================
  // AJUSTAR TURNO
  // ============================================================
  const iniciarAjuste = (detalle) => {
    setAjusteMode({
      idDetalle: detalle.idDetalle,
      fecha: detalle.fecha,
      turnoActual: detalle.turno
    });
    setNuevoTurno(detalle.turno);
    setObservacionAjuste('');
  };

  const cancelarAjuste = () => {
    setAjusteMode(null);
    setNuevoTurno('');
    setObservacionAjuste('');
  };

  const guardarAjuste = async () => {
    if (!nuevoTurno) {
      window.alert('Debe seleccionar un turno.');
      return;
    }

    setSaving(true);
    try {
      await disponibilidadService.ajustarTurno(selectedDisponibilidad.idDisponibilidad, {
        idDetalle: ajusteMode.idDetalle,
        nuevoTurno,
        observacion: observacionAjuste
      });

      // Recargar detalle
      const detalle = await disponibilidadService.obtenerPorId(selectedDisponibilidad.idDisponibilidad);
      setSelectedDisponibilidad(detalle);
      setAjusteMode(null);
      setObservacionAjuste('');

      // Actualizar lista
      cargarSolicitudes();
    } catch (err) {
      console.error('Error al ajustar turno:', err);
      window.alert('No se pudo ajustar el turno. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // MARCAR COMO REVISADO
  // ============================================================
  const marcarComoRevisado = async () => {
    if (!confirmRevisado) {
      setConfirmRevisado(true);
      return;
    }

    setSaving(true);
    try {
      await disponibilidadService.marcarRevisado(selectedDisponibilidad.idDisponibilidad);
      toast.success('Disponibilidad marcada como REVISADO correctamente');
      cerrarModal();
      cargarSolicitudes();
    } catch (err) {
      console.error('Error al marcar como revisado:', err);
      toast.error('No se pudo marcar como revisado. Intente nuevamente.');
    } finally {
      setSaving(false);
      setConfirmRevisado(false);
    }
  };

  // ============================================================
  // SINCRONIZACIÓN CON CHATBOT (NUEVO v2.0)
  // ============================================================
  const abrirModalSincronizar = async (disponibilidad) => {
    setSelectedDisponibilidad(disponibilidad);
    setShowModalSincronizar(true);
    setResultadoSincronizacion(null);
    setAreaSeleccionada('');

    // Cargar áreas disponibles
    try {
      const response = await fetch('/api/areas/activas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const areasData = await response.json();
      setAreas(areasData);
    } catch (err) {
      console.error('Error al cargar áreas:', err);
      toast.error('Error al cargar áreas de atención');
    }
  };

  const cerrarModalSincronizar = () => {
    setShowModalSincronizar(false);
    setSelectedDisponibilidad(null);
    setResultadoSincronizacion(null);
    setAreaSeleccionada('');
  };

  const sincronizarConChatbot = async () => {
    if (!areaSeleccionada) {
      toast.error('Debes seleccionar un área de atención');
      return;
    }

    setSincronizando(true);
    try {
      const data = {
        idDisponibilidad: selectedDisponibilidad.idDisponibilidad,
        idArea: parseInt(areaSeleccionada)
      };

      const resultado = await integracionHorarioService.sincronizar(data);
      setResultadoSincronizacion(resultado);
      toast.success('Sincronización completada exitosamente');

      // Recargar solicitudes
      setTimeout(() => {
        cargarSolicitudes();
      }, 2000);
    } catch (err) {
      console.error('Error al sincronizar:', err);
      toast.error(err.response?.data?.message || 'Error al sincronizar con chatbot');
    } finally {
      setSincronizando(false);
    }
  };

  // ============================================================
  // NAVEGACIÓN DE PERIODO
  // ============================================================
  const cambiarPeriodo = (direccion) => {
    const año = parseInt(periodo.substring(0, 4));
    let mes = parseInt(periodo.substring(4, 6));

    if (direccion === 'prev') {
      mes--;
      if (mes < 1) {
        mes = 12;
        return `${año - 1}${String(mes).padStart(2, '0')}`;
      }
    } else {
      mes++;
      if (mes > 12) {
        mes = 1;
        return `${año + 1}${String(mes).padStart(2, '0')}`;
      }
    }

    setPeriodo(`${año}${String(mes).padStart(2, '0')}`);
  };

  // ============================================================
  // HELPERS
  // ============================================================
  const formatPeriodo = (p) => {
    if (!p || p.length !== 6) return p;
    const año = p.substring(0, 4);
    const mes = p.substring(4, 6);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[parseInt(mes) - 1]} ${año}`;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getTurnoNombre = (turno) => {
    switch (turno) {
      case 'M': return 'Mañana';
      case 'T': return 'Tarde';
      case 'MT': return 'Completo';
      default: return turno;
    }
  };

  const getTurnoColor = (turno) => {
    switch (turno) {
      case 'M': return 'bg-green-100 text-green-800 border-green-300';
      case 'T': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MT': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            Revisión de Disponibilidad Médica
          </h1>
          <p className="text-slate-600 mt-2">
            Revisa y ajusta las disponibilidades de turnos enviadas por los médicos
          </p>
        </div>

        {/* Selector de Periodo */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Periodo a revisar
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => cambiarPeriodo('prev')}
              className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 max-w-xs">
              <div className="text-center text-lg font-semibold text-slate-800 bg-slate-50 py-2 px-4 rounded-lg border border-slate-200">
                {formatPeriodo(periodo)}
              </div>
            </div>

            <button
              onClick={() => cambiarPeriodo('next')}
              className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-800">Filtros</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Búsqueda por médico */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Buscar médico
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nombre o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtro por especialidad */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Especialidad
              </label>
              <select
                value={filtroEspecialidad}
                onChange={(e) => setFiltroEspecialidad(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas</option>
                {especialidades.map((esp) => (
                  <option key={esp.idServicio} value={esp.idServicio}>
                    {esp.nombreServicio}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Solicitudes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              Solicitudes Enviadas ({solicitudesFiltradas.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 py-12 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : solicitudesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Clock className="w-12 h-12 mb-3" />
              <p>No hay solicitudes enviadas para este periodo</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Médico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Especialidad
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total Horas
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Fecha Envío
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {solicitudesFiltradas.map((solicitud) => (
                    <tr key={solicitud.idDisponibilidad} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            {solicitud.nombreMedico}
                          </div>
                          <div className="text-sm text-slate-500">
                            DNI: {solicitud.documentoMedico}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {solicitud.nombreEspecialidad}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          solicitud.totalHoras >= 150
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {solicitud.totalHoras}h
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-600">
                        {solicitud.fechaEnvio ? new Date(solicitud.fechaEnvio).toLocaleDateString('es-ES') : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {solicitud.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Botón Revisar - para estado ENVIADO */}
                          {solicitud.estado === 'ENVIADO' && (
                            <button
                              onClick={() => abrirModal(solicitud)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Revisar
                            </button>
                          )}

                          {/* Botones para estado REVISADO */}
                          {solicitud.estado === 'REVISADO' && (
                            <>
                              <button
                                onClick={() => abrirModal(solicitud)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                              >
                                <Eye className="w-4 h-4" />
                                Ver
                              </button>
                              <button
                                onClick={() => abrirModalSincronizar(solicitud)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <GitMerge className="w-4 h-4" />
                                Sincronizar con Chatbot
                              </button>
                            </>
                          )}

                          {/* Botón Ver - para estado SINCRONIZADO */}
                          {solicitud.estado === 'SINCRONIZADO' && (
                            <button
                              onClick={() => abrirModal(solicitud)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              <Database className="w-4 h-4" />
                              Ver Detalles
                            </button>
                          )}

                          {/* Fallback para otros estados */}
                          {!['ENVIADO', 'REVISADO', 'SINCRONIZADO'].includes(solicitud.estado) && (
                            <button
                              onClick={() => abrirModal(solicitud)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Ver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Revisión */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header del Modal */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-6 h-6" />
                  Revisión de Disponibilidad
                </h3>
                <button
                  onClick={cerrarModal}
                  className="p-2 hover:bg-blue-500 rounded-lg transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido del Modal */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingDetalle ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : selectedDisponibilidad ? (
                  <div className="space-y-6">
                    {/* Información del Médico */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Médico</label>
                          <p className="text-slate-900 font-semibold">
                            {selectedDisponibilidad.nombreMedico}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Especialidad</label>
                          <p className="text-slate-900 font-semibold">
                            {selectedDisponibilidad.nombreEspecialidad}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Periodo</label>
                          <p className="text-slate-900 font-semibold">
                            {formatPeriodo(selectedDisponibilidad.periodo)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Total Horas</label>
                          <p className="text-2xl font-bold text-blue-600">
                            {selectedDisponibilidad.totalHoras}h / {selectedDisponibilidad.horasRequeridas}h
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Cumplimiento</label>
                          <p className={`text-2xl font-bold ${
                            selectedDisponibilidad.cumpleMinimo ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedDisponibilidad.cumpleMinimo ? '✓ Cumple' : '✗ No cumple'}
                          </p>
                        </div>
                      </div>

                      {selectedDisponibilidad.observaciones && (
                        <div className="mt-4">
                          <label className="text-sm font-medium text-slate-600">Observaciones del Médico</label>
                          <p className="text-slate-700 mt-1">{selectedDisponibilidad.observaciones}</p>
                        </div>
                      )}
                    </div>

                    {/* Lista de Turnos */}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">
                        Turnos Declarados ({selectedDisponibilidad.detalles.length} días)
                      </h4>

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedDisponibilidad.detalles.map((detalle) => (
                          <div
                            key={detalle.idDetalle}
                            className={`border rounded-lg p-4 ${
                              detalle.fueAjustado ? 'border-orange-300 bg-orange-50' : 'border-slate-200'
                            }`}
                          >
                            {ajusteMode?.idDetalle === detalle.idDetalle ? (
                              // Modo edición
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-800">
                                    {formatFecha(detalle.fecha)}
                                  </span>
                                  <button
                                    onClick={cancelarAjuste}
                                    className="text-sm text-slate-600 hover:text-slate-800"
                                  >
                                    Cancelar
                                  </button>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nuevo Turno
                                  </label>
                                  <select
                                    value={nuevoTurno}
                                    onChange={(e) => setNuevoTurno(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="M">Mañana</option>
                                    <option value="T">Tarde</option>
                                    <option value="MT">Completo</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Observación del Ajuste
                                  </label>
                                  <textarea
                                    value={observacionAjuste}
                                    onChange={(e) => setObservacionAjuste(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Motivo del ajuste..."
                                  />
                                </div>

                                <button
                                  onClick={guardarAjuste}
                                  disabled={saving}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                  {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4" />
                                  )}
                                  Guardar Ajuste
                                </button>
                              </div>
                            ) : (
                              // Modo visualización
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <span className="font-semibold text-slate-800 w-32">
                                    {formatFecha(detalle.fecha)}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTurnoColor(detalle.turno)}`}>
                                    {getTurnoNombre(detalle.turno)} ({detalle.horas}h)
                                  </span>
                                  {detalle.fueAjustado && (
                                    <span className="text-xs text-orange-600 flex items-center gap-1">
                                      <Edit className="w-3 h-3" />
                                      Ajustado por {detalle.ajustadoPor}
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => iniciarAjuste(detalle)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {detalle.observacionAjuste && !ajusteMode && (
                              <div className="mt-2 text-sm text-slate-600 bg-white p-2 rounded border border-orange-200">
                                <strong>Observación:</strong> {detalle.observacionAjuste}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer del Modal */}
              {!loadingDetalle && selectedDisponibilidad && (
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                  {confirmRevisado ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-yellow-800 mb-3">
                        <AlertCircle className="w-5 h-5" />
                        <strong>¿Está seguro?</strong>
                      </div>
                      <p className="text-sm text-yellow-700 mb-4">
                        Al marcar como REVISADO, el médico ya no podrá editar su disponibilidad.
                        Solo usted podrá realizar ajustes posteriores.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={marcarComoRevisado}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Sí, Marcar como REVISADO
                        </button>
                        <button
                          onClick={() => setConfirmRevisado(false)}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={marcarComoRevisado}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Marcar como REVISADO
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== MODAL DE SINCRONIZACIÓN (NUEVO v2.0) ========== */}
        {showModalSincronizar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <GitMerge className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      Sincronizar con Chatbot
                    </h3>
                    <p className="text-sm text-slate-600">
                      {selectedDisponibilidad?.nombreMedico} - {selectedDisponibilidad?.periodo}
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarModalSincronizar}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {!resultadoSincronizacion ? (
                  <>
                    {/* Información de la disponibilidad */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Resumen de Disponibilidad
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-600 font-medium">Total Horas:</span>
                          <span className="ml-2 text-blue-900 font-bold">
                            {selectedDisponibilidad?.totalHoras}h
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Días Trabajados:</span>
                          <span className="ml-2 text-blue-900 font-bold">
                            {selectedDisponibilidad?.detalles?.filter(d => d.turno).length || 0} días
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Estado:</span>
                          <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                            {selectedDisponibilidad?.estado}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Selector de Área */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Área de Atención <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={areaSeleccionada}
                        onChange={(e) => setAreaSeleccionada(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Seleccionar área...</option>
                        {areas.map((area) => (
                          <option key={area.idArea} value={area.idArea}>
                            {area.descArea}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-slate-600">
                        Selecciona el área donde se sincronizarán los horarios del médico
                      </p>
                    </div>

                    {/* Advertencia */}
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-semibold mb-1">Antes de sincronizar:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>La disponibilidad debe estar en estado REVISADO</li>
                            <li>Se crearán slots en el sistema de chatbot</li>
                            <li>El estado cambiará a SINCRONIZADO</li>
                            <li>Esta acción no se puede deshacer automáticamente</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Resultado de Sincronización */
                  <div className="space-y-4">
                    <div className={`border-2 rounded-lg p-6 ${
                      resultadoSincronizacion.resultado === 'EXITOSO'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className={`w-8 h-8 ${
                          resultadoSincronizacion.resultado === 'EXITOSO'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`} />
                        <div>
                          <h4 className={`text-lg font-bold ${
                            resultadoSincronizacion.resultado === 'EXITOSO'
                              ? 'text-green-900'
                              : 'text-red-900'
                          }`}>
                            {resultadoSincronizacion.mensaje}
                          </h4>
                          <p className="text-sm text-slate-600">
                            Operación: {resultadoSincronizacion.tipoOperacion}
                          </p>
                        </div>
                      </div>

                      {resultadoSincronizacion.resultado === 'EXITOSO' && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-white bg-opacity-50 rounded p-3">
                            <div className="text-green-700 font-medium">ID Horario Generado:</div>
                            <div className="text-green-900 font-bold text-lg">
                              #{resultadoSincronizacion.idHorario}
                            </div>
                          </div>
                          <div className="bg-white bg-opacity-50 rounded p-3">
                            <div className="text-green-700 font-medium">Detalles Procesados:</div>
                            <div className="text-green-900 font-bold text-lg">
                              {resultadoSincronizacion.detallesCreados}/{resultadoSincronizacion.detallesProcesados}
                            </div>
                          </div>
                          <div className="bg-white bg-opacity-50 rounded p-3">
                            <div className="text-green-700 font-medium">Horas Sincronizadas:</div>
                            <div className="text-green-900 font-bold text-lg">
                              {resultadoSincronizacion.horasSincronizadas}h
                            </div>
                          </div>
                          <div className="bg-white bg-opacity-50 rounded p-3">
                            <div className="text-green-700 font-medium">Errores:</div>
                            <div className="text-green-900 font-bold text-lg">
                              {resultadoSincronizacion.detallesConError}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-200 bg-slate-50">
                {!resultadoSincronizacion ? (
                  <div className="flex gap-4">
                    <button
                      onClick={cerrarModalSincronizar}
                      className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-white font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={sincronizarConChatbot}
                      disabled={sincronizando || !areaSeleccionada}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                    >
                      {sincronizando ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5" />
                          Sincronizar Ahora
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={cerrarModalSincronizar}
                    className="w-full px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-semibold"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
