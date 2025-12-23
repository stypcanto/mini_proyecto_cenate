// ========================================================================
// GestionPeriodosSolicitud.jsx - CMS de Periodos de Solicitud de Turnos
// ------------------------------------------------------------------------
// Permite al Coordinador crear y gestionar periodos de captura de turnos
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Play,
  Pause,
  Eye,
  FileText,
  Users,
  Clock,
  BarChart3
} from 'lucide-react';
import { periodoSolicitudService } from '../../../services/periodoSolicitudService';

// Helper para renderizar instrucciones con links clicables
const renderInstrucciones = (texto) => {
  if (!texto) return null;

  // Regex para detectar URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Dividir por saltos de línea o puntos numerados
  const lineas = texto.split(/(?=\d+\.\s)/g).filter(l => l.trim());

  return lineas.map((linea, idx) => {
    // Dividir la línea en partes (texto y URLs)
    const partes = linea.split(urlRegex);

    return (
      <p key={idx} className="mb-3 text-sm text-slate-700 dark:text-slate-300">
        {partes.map((parte, i) => {
          if (urlRegex.test(parte)) {
            return (
              <a
                key={i}
                href={parte}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {parte}
              </a>
            );
          }
          return <span key={i}>{parte}</span>;
        })}
      </p>
    );
  });
};

export default function GestionPeriodosSolicitud() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);
  const [viewMode, setViewMode] = useState(null); // Para ver detalles
  const [formData, setFormData] = useState({
    periodo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    instrucciones: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [estadoConfirm, setEstadoConfirm] = useState(null);

  // ============================================================
  // Cargar Periodos
  // ============================================================
  const loadPeriodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await periodoSolicitudService.obtenerTodos();
      setPeriodos(data);
    } catch (err) {
      console.error('Error al cargar periodos:', err);
      setError('No se pudieron cargar los periodos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeriodos();
  }, []);

  // ============================================================
  // Filtrar Periodos
  // ============================================================
  const filteredPeriodos = periodos.filter(p =>
    p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.periodo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.estado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================================
  // Abrir Modal (Crear/Editar)
  // ============================================================
  const handleOpenModal = (periodo = null) => {
    if (periodo) {
      setSelectedPeriodo(periodo);
      setFormData({
        periodo: periodo.periodo || '',
        descripcion: periodo.descripcion || '',
        fechaInicio: periodo.fechaInicio ? periodo.fechaInicio.split('T')[0] : '',
        fechaFin: periodo.fechaFin ? periodo.fechaFin.split('T')[0] : '',
        instrucciones: periodo.instrucciones || ''
      });
    } else {
      setSelectedPeriodo(null);
      // Generar valores por defecto para el proximo mes
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setFormData({
        periodo: periodoSolicitudService.generarCodigoPeriodo(nextMonth),
        descripcion: periodoSolicitudService.generarDescripcionPeriodo(nextMonth),
        fechaInicio: '',
        fechaFin: '',
        instrucciones: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPeriodo(null);
    setFormData({
      periodo: '',
      descripcion: '',
      fechaInicio: '',
      fechaFin: '',
      instrucciones: ''
    });
  };

  // ============================================================
  // Guardar Periodo
  // ============================================================
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.periodo.trim() || !formData.descripcion.trim()) {
      alert('El codigo y la descripcion del periodo son requeridos');
      return;
    }

    if (!formData.fechaInicio || !formData.fechaFin) {
      alert('Las fechas de inicio y fin son requeridas');
      return;
    }

    if (new Date(formData.fechaFin) < new Date(formData.fechaInicio)) {
      alert('La fecha de fin no puede ser anterior a la fecha de inicio');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        ...formData,
        fechaInicio: formData.fechaInicio + 'T00:00:00',
        fechaFin: formData.fechaFin + 'T23:59:59'
      };

      if (selectedPeriodo) {
        await periodoSolicitudService.actualizar(selectedPeriodo.idPeriodo, dataToSend);
      } else {
        await periodoSolicitudService.crear(dataToSend);
      }
      handleCloseModal();
      loadPeriodos();
    } catch (err) {
      console.error('Error al guardar periodo:', err);
      alert(err.message || 'Error al guardar el periodo');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Eliminar Periodo
  // ============================================================
  const handleDelete = async (id) => {
    try {
      await periodoSolicitudService.eliminar(id);
      setDeleteConfirm(null);
      loadPeriodos();
    } catch (err) {
      console.error('Error al eliminar periodo:', err);
      alert(err.message || 'Error al eliminar el periodo');
      setDeleteConfirm(null);
    }
  };

  // ============================================================
  // Cambiar Estado
  // ============================================================
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await periodoSolicitudService.cambiarEstado(id, nuevoEstado);
      setEstadoConfirm(null);
      loadPeriodos();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert(err.message || 'Error al cambiar el estado del periodo');
      setEstadoConfirm(null);
    }
  };

  // ============================================================
  // Ver Detalles
  // ============================================================
  const handleVerDetalles = async (periodo) => {
    try {
      const detalles = await periodoSolicitudService.obtenerConEstadisticas(periodo.idPeriodo);
      setViewMode(detalles);
    } catch (err) {
      console.error('Error al obtener detalles:', err);
      alert('Error al obtener los detalles del periodo');
    }
  };

  // ============================================================
  // Estadisticas
  // ============================================================
  const totalPeriodos = periodos.length;
  const activos = periodos.filter(p => p.estado === 'ACTIVO').length;
  const borradores = periodos.filter(p => p.estado === 'BORRADOR').length;
  const cerrados = periodos.filter(p => p.estado === 'CERRADO').length;

  // ============================================================
  // Helpers
  // ============================================================
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
            <Play className="w-3 h-3" />
            Activo
          </span>
        );
      case 'CERRADO':
        return (
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
            <Pause className="w-3 h-3" />
            Cerrado
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
            <FileText className="w-3 h-3" />
            Borrador
          </span>
        );
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Calendar className="w-7 h-7 text-[#0A5BA9]" />
              Gestion de Periodos de Solicitud
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Crea y administra los periodos de captura de turnos para telemedicina
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" /> Nuevo Periodo
          </button>
        </div>

        {/* Estadisticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalPeriodos}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Activos</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{activos}</p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Borradores</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{borradores}</p>
          </div>
          <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Cerrados</p>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{cerrados}</p>
          </div>
        </div>

        {/* Busqueda */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por descripcion, codigo o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla de Periodos */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <Loader2 className="w-10 h-10 animate-spin text-[#0A5BA9]" />
          <p className="ml-3 text-slate-600 dark:text-slate-400">Cargando periodos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg text-center">
          {error}
        </div>
      ) : filteredPeriodos.length === 0 ? (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-lg text-center">
          {searchTerm ? 'No se encontraron periodos con ese criterio.' : 'No hay periodos registrados. Crea el primero.'}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Periodo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Descripcion
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Solicitudes
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {filteredPeriodos.map((periodo) => (
                  <tr key={periodo.idPeriodo} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-bold text-[#0A5BA9] dark:text-blue-400">
                        {periodo.periodo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {periodo.descripcion}
                      </p>
                      {periodo.instrucciones && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-xs">
                          {periodo.instrucciones}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatFecha(periodo.fechaInicio)}</span>
                        <span>-</span>
                        <span>{formatFecha(periodo.fechaFin)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(periodo.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {periodo.totalSolicitudes || 0}
                        </span>
                        {periodo.solicitudesEnviadas > 0 && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ({periodo.solicitudesEnviadas} env.)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        {/* Ver detalles */}
                        <button
                          onClick={() => handleVerDetalles(periodo)}
                          className="p-2 rounded-full text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* Cambiar estado */}
                        {periodo.estado === 'BORRADOR' && (
                          <button
                            onClick={() => setEstadoConfirm({ id: periodo.idPeriodo, nuevoEstado: 'ACTIVO', mensaje: 'activar' })}
                            className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                            title="Activar periodo"
                          >
                            <Play className="w-5 h-5" />
                          </button>
                        )}
                        {periodo.estado === 'ACTIVO' && (
                          <button
                            onClick={() => setEstadoConfirm({ id: periodo.idPeriodo, nuevoEstado: 'CERRADO', mensaje: 'cerrar' })}
                            className="p-2 rounded-full text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Cerrar periodo"
                          >
                            <Pause className="w-5 h-5" />
                          </button>
                        )}
                        {periodo.estado === 'CERRADO' && (
                          <button
                            onClick={() => setEstadoConfirm({ id: periodo.idPeriodo, nuevoEstado: 'ACTIVO', mensaje: 'reactivar' })}
                            className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                            title="Reactivar periodo"
                          >
                            <Play className="w-5 h-5" />
                          </button>
                        )}

                        {/* Editar (solo borrador) */}
                        {periodo.estado === 'BORRADOR' && (
                          <button
                            onClick={() => handleOpenModal(periodo)}
                            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                            title="Editar periodo"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}

                        {/* Eliminar (solo borrador) */}
                        {periodo.estado === 'BORRADOR' && (
                          <button
                            onClick={() => setDeleteConfirm(periodo.idPeriodo)}
                            className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                            title="Eliminar periodo"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-6 py-4 flex items-center justify-between rounded-t-3xl sticky top-0">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedPeriodo ? 'Editar Periodo' : 'Nuevo Periodo'}
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  {selectedPeriodo ? 'Modifica los datos del periodo' : 'Crea un nuevo periodo de solicitud'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Codigo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.periodo}
                    onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] font-mono"
                    placeholder="202601"
                    maxLength={6}
                    required
                    disabled={selectedPeriodo}
                  />
                  <p className="text-xs text-slate-500 mt-1">Formato: YYYYMM</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Descripcion <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                    placeholder="Enero 2026"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Fecha Inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Fecha Fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Instrucciones para IPRESS
                </label>
                <textarea
                  value={formData.instrucciones}
                  onChange={(e) => setFormData({ ...formData, instrucciones: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] resize-none"
                  rows={3}
                  placeholder="Instrucciones o notas importantes para las IPRESS..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] hover:from-[#2563EB] hover:to-[#3B82F6] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Ver Detalles */}
      {viewMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Detalles del Periodo
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  {viewMode.descripcion}
                </p>
              </div>
              <button
                onClick={() => setViewMode(null)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Codigo</p>
                  <p className="text-xl font-bold font-mono text-blue-700 dark:text-blue-400">{viewMode.periodo}</p>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Estado</p>
                  <div className="flex justify-center mt-1">{getEstadoBadge(viewMode.estado)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Solicitudes</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{viewMode.totalSolicitudes || 0}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Enviadas</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{viewMode.solicitudesEnviadas || 0}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Vigencia</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white">
                  {formatFecha(viewMode.fechaInicio)} - {formatFecha(viewMode.fechaFin)}
                </p>
              </div>

              {viewMode.instrucciones && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">Nota Importante</p>
                  <div className="space-y-1">
                    {renderInstrucciones(viewMode.instrucciones)}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode(null)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmacion de Eliminacion */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Eliminar periodo?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Esta accion no se puede deshacer
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmacion de Cambio de Estado */}
      {estadoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Confirmar cambio de estado
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Deseas {estadoConfirm.mensaje} este periodo?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEstadoConfirm(null)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleCambiarEstado(estadoConfirm.id, estadoConfirm.nuevoEstado)}
                className="px-4 py-2 bg-[#0A5BA9] hover:bg-[#2563EB] text-white font-semibold rounded-xl transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
