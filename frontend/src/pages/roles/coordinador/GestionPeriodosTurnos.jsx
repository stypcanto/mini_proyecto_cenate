// ========================================================================
// GestionPeriodosTurnos.jsx - Panel del Coordinador
// ------------------------------------------------------------------------
// Permite al coordinador:
// 1. Activar/desactivar períodos mensuales
// 2. Ver solicitudes recibidas de las IPRESS
// 3. Revisar detalles de cada solicitud
// 4. Aprobar/rechazar solicitudes
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  Download,
  AlertCircle,
  Loader2,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Building2,
  Users
} from 'lucide-react';
import { periodoSolicitudService } from '../../../services/periodoSolicitudService';
import { solicitudTurnosService } from '../../../services/solicitudTurnosService';

export default function GestionPeriodosTurnos() {
  const [activeTab, setActiveTab] = useState('periodos'); // 'periodos' | 'solicitudes'
  const [loading, setLoading] = useState(true);
  const [periodos, setPeriodos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);
  const [showNuevoPeriodoModal, setShowNuevoPeriodoModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [solicitudDetalle, setSolicitudDetalle] = useState(null);
  const [filtros, setFiltros] = useState({
    estado: 'TODAS',
    periodo: '',
    busqueda: ''
  });

  // ============================================================
  // Cargar datos iniciales
  // ============================================================
  useEffect(() => {
    cargarPeriodos();
  }, []);

  useEffect(() => {
    if (activeTab === 'solicitudes') {
      cargarSolicitudes();
    }
  }, [activeTab, filtros]);

  const cargarPeriodos = async () => {
    setLoading(true);
    try {
      const data = await periodoSolicitudService.obtenerTodos();
      setPeriodos(data);
    } catch (err) {
      console.error('Error al cargar períodos:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await solicitudTurnosService.obtenerTodas(filtros);
      setSolicitudes(data);
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Acciones de períodos
  // ============================================================
  const handleTogglePeriodo = async (periodo) => {
    try {
      if (periodo.estado === 'ACTIVO') {
        await periodoSolicitudService.desactivar(periodo.idPeriodo);
      } else {
        await periodoSolicitudService.activar(periodo.idPeriodo);
      }
      cargarPeriodos();
    } catch (err) {
      window.alert('Error al cambiar estado del período');
    }
  };

  const handleCrearPeriodo = async (nuevoPeriodo) => {
    try {
      console.log("**********************************");
      await periodoSolicitudService.crear(nuevoPeriodo);
      cargarPeriodos();
      setShowNuevoPeriodoModal(false);
    } catch (err) {
      window.alert('Error al crear período');
    }
  };

  // ============================================================
  // Acciones de solicitudes
  // ============================================================
  const handleVerDetalle = async (solicitud) => {
    try {
      const detalle = await solicitudTurnosService.obtenerDetalle(solicitud.idSolicitud);
      setSolicitudDetalle(detalle);
      setShowDetalleModal(true);
    } catch (err) {
      window.alert('Error al cargar detalle de la solicitud');
    }
  };

  const handleAprobarSolicitud = async (idSolicitud) => {
    if (!window.confirm('¿Está seguro de aprobar esta solicitud?')) return;

    try {
      await solicitudTurnosService.aprobar(idSolicitud);
      cargarSolicitudes();
      setShowDetalleModal(false);
    } catch (err) {
      window.alert('Error al aprobar solicitud');
    }
  };

  const handleRechazarSolicitud = async (idSolicitud, motivo) => {
    if (!motivo) {
      window.alert('Debe indicar el motivo del rechazo');
      return;
    }

    try {
      await solicitudTurnosService.rechazar(idSolicitud, motivo);
      cargarSolicitudes();
      setShowDetalleModal(false);
    } catch (err) {
      window.alert('Error al rechazar solicitud');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'ACTIVO': 'bg-green-100 text-green-800 border-green-300',
      'INACTIVO': 'bg-gray-100 text-gray-800 border-gray-300',
      'CERRADO': 'bg-red-100 text-red-800 border-red-300',
      'BORRADOR': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'ENVIADA': 'bg-blue-100 text-blue-800 border-blue-300',
      'APROBADA': 'bg-green-100 text-green-800 border-green-300',
      'RECHAZADA': 'bg-red-100 text-red-800 border-red-300'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  // ============================================================
  // Renderizado de Tabs
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Períodos y Solicitudes
          </h1>
          <p className="text-gray-600">
            Administre los períodos de solicitud y revise las peticiones de turnos de las IPRESS
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('periodos')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'periodos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Gestión de Períodos</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('solicitudes')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'solicitudes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Solicitudes Recibidas</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido según tab activo */}
        {activeTab === 'periodos' ? (
          <TabPeriodos
            periodos={periodos}
            loading={loading}
            onTogglePeriodo={handleTogglePeriodo}
            onCrearPeriodo={() => setShowNuevoPeriodoModal(true)}
            getEstadoBadge={getEstadoBadge}
          />
        ) : (
          <TabSolicitudes
            solicitudes={solicitudes}
            loading={loading}
            filtros={filtros}
            setFiltros={setFiltros}
            onVerDetalle={handleVerDetalle}
            getEstadoBadge={getEstadoBadge}
            periodos={periodos}
          />
        )}

        {/* Modal Nuevo Período */}
        {showNuevoPeriodoModal && (
          <ModalNuevoPeriodo
            onClose={() => setShowNuevoPeriodoModal(false)}
            onCrear={handleCrearPeriodo}
          />
        )}

        {/* Modal Detalle Solicitud */}
        {showDetalleModal && solicitudDetalle && (
          <ModalDetalleSolicitud
            solicitud={solicitudDetalle}
            onClose={() => setShowDetalleModal(false)}
            onAprobar={handleAprobarSolicitud}
            onRechazar={handleRechazarSolicitud}
            getEstadoBadge={getEstadoBadge}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Componente: Tab de Períodos
// ============================================================
function TabPeriodos({ periodos, loading, onTogglePeriodo, onCrearPeriodo, getEstadoBadge }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Períodos de Solicitud</h2>
        <button
          onClick={onCrearPeriodo}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Período
        </button>
      </div>

      <div className="divide-y divide-gray-200">
        {periodos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">No hay períodos configurados</p>
            <p className="text-sm">Cree un nuevo período para comenzar a recibir solicitudes</p>
          </div>
        ) : (
          periodos.map((periodo) => (
            <div key={periodo.idPeriodo} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {periodo.nombrePeriodo}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(periodo.estado)}`}>
                      {periodo.estado}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Inicio: {new Date(periodo.fechaInicio).toLocaleDateString('es-PE')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Fin: {new Date(periodo.fechaFin).toLocaleDateString('es-PE')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Solicitudes: {periodo.totalSolicitudes || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprobadas: {periodo.solicitudesAprobadas || 0}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onTogglePeriodo(periodo)}
                  className="ml-6 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title={periodo.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                >
                  {periodo.estado === 'ACTIVO' ? (
                    <ToggleRight className="w-8 h-8 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================
// Componente: Tab de Solicitudes
// ============================================================
function TabSolicitudes({ solicitudes, loading, filtros, setFiltros, onVerDetalle, getEstadoBadge, periodos }) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Filtros */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="TODAS">Todas</option>
              <option value="BORRADOR">Borrador</option>
              <option value="ENVIADA">Enviada</option>
              <option value="APROBADA">Aprobada</option>
              <option value="RECHAZADA">Rechazada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Período
            </label>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los períodos</option>
              {periodos.map((p) => (
                <option key={p.idPeriodo} value={p.codigoPeriodo}>
                  {p.nombrePeriodo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Buscar IPRESS
            </label>
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Nombre o código..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de solicitudes */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">No se encontraron solicitudes</p>
          <p className="text-sm">Ajuste los filtros o espere a que las IPRESS envíen sus solicitudes</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {solicitudes.map((solicitud) => (
            <div key={solicitud.idSolicitud} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {solicitud.nombreIpress}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(solicitud.estado)}`}>
                      {solicitud.estado}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{solicitud.codigoIpress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{solicitud.nombrePeriodo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{solicitud.totalEspecialidades} especialidades</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(solicitud.fechaEnvio || solicitud.fechaCreacion).toLocaleDateString('es-PE')}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onVerDetalle(solicitud)}
                  className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Modal: Nuevo Período
// ============================================================
function ModalNuevoPeriodo({ onClose, onCrear }) {
  const [formData, setFormData] = useState({
    nombrePeriodo: '',
    fechaInicio: '',
    fechaFin: '',
    descripcion: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCrear(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Crear Nuevo Período</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Período *
            </label>
            <input
              type="text"
              required
              value={formData.nombrePeriodo}
              onChange={(e) => setFormData({ ...formData, nombrePeriodo: e.target.value })}
              placeholder="Ej: Febrero 2026"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              required
              value={formData.fechaInicio}
              onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin *
            </label>
            <input
              type="date"
              required
              value={formData.fechaFin}
              onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              placeholder="Descripción del período..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Período
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Modal: Detalle de Solicitud
// ============================================================
function ModalDetalleSolicitud({ solicitud, onClose, onAprobar, onRechazar, getEstadoBadge }) {
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [showRechazoForm, setShowRechazoForm] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Detalle de Solicitud
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">{solicitud.nombreIpress}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(solicitud.estado)}`}>
                  {solicitud.estado}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Código IPRESS:</span>
              <span className="ml-2 text-gray-600">{solicitud.codigoIpress}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Período:</span>
              <span className="ml-2 text-gray-600">{solicitud.nombrePeriodo}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha de Envío:</span>
              <span className="ml-2 text-gray-600">
                {solicitud.fechaEnvio ? new Date(solicitud.fechaEnvio).toLocaleString('es-PE') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Turnos Solicitados:</span>
              <span className="ml-2 text-gray-600 font-semibold">{solicitud.totalTurnos || 0}</span>
            </div>
          </div>

          {/* Especialidades solicitadas */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Especialidades Solicitadas</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Especialidad
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Turnos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Horario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitud.detalles?.map((detalle, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {detalle.nombreEspecialidad}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">
                        {detalle.cantidadTurnos}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {detalle.horarioPreferido || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {detalle.observaciones || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Observaciones generales */}
          {solicitud.observacionesGenerales && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Observaciones Generales</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                {solicitud.observacionesGenerales}
              </p>
            </div>
          )}

          {/* Acciones (solo si está ENVIADA) */}
          {solicitud.estado === 'ENVIADA' && (
            <div className="border-t border-gray-200 pt-6">
              {!showRechazoForm ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => onAprobar(solicitud.idSolicitud)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Aprobar Solicitud
                  </button>
                  <button
                    onClick={() => setShowRechazoForm(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Rechazar Solicitud
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Motivo del Rechazo *
                  </label>
                  <textarea
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    rows={3}
                    placeholder="Indique el motivo del rechazo..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRechazoForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => onRechazar(solicitud.idSolicitud, motivoRechazo)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Confirmar Rechazo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
