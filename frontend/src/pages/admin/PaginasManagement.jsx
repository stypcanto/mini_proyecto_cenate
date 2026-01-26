// ========================================================================
// PaginasManagement.jsx – CRUD de Páginas del Sistema (CENATE 2025)
// ------------------------------------------------------------------------
// Componente para gestionar las páginas/submenús de los módulos MBAC
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  X,
  Save,
  AlertCircle,
  Eye,
  Route,
  Hash,
  Layers,
  Filter
} from 'lucide-react';
import { paginaModuloService } from '../../services/paginaModuloService';
import { moduloService } from '../../services/moduloService';

export default function PaginasManagement() {
  const [paginas, setPaginas] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPagina, setSelectedPagina] = useState(null);
  const [formData, setFormData] = useState({
    idModulo: '',
    nombrePagina: '',
    rutaPagina: '',
    descripcion: '',
    orden: 1,
    activo: true
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ============================================================
  // Cargar Datos
  // ============================================================
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [paginasData, modulosData] = await Promise.all([
        paginaModuloService.obtenerTodas(),
        moduloService.obtenerTodos()
      ]);

      const sortedPaginas = Array.isArray(paginasData)
        ? paginasData.sort((a, b) => {
            if (a.idModulo !== b.idModulo) return a.idModulo - b.idModulo;
            return (a.orden || 99) - (b.orden || 99);
          })
        : [];

      setPaginas(sortedPaginas);
      setModulos(Array.isArray(modulosData) ? modulosData : []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron cargar los datos. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // Obtener nombre del módulo
  // ============================================================
  const getNombreModulo = (idModulo) => {
    const modulo = modulos.find(m => m.idModulo === idModulo);
    return modulo ? modulo.nombreModulo : 'Sin módulo';
  };

  // ============================================================
  // Filtrar Páginas
  // ============================================================
  const filteredPaginas = paginas.filter(pag => {
    const matchSearch =
      pag.nombrePagina?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pag.rutaPagina?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pag.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchModulo = !filtroModulo || pag.idModulo === parseInt(filtroModulo);

    return matchSearch && matchModulo;
  });

  // Agrupar por módulo para mostrar
  const paginasAgrupadas = filteredPaginas.reduce((acc, pag) => {
    const moduloId = pag.idModulo;
    if (!acc[moduloId]) {
      acc[moduloId] = {
        modulo: getNombreModulo(moduloId),
        paginas: []
      };
    }
    acc[moduloId].paginas.push(pag);
    return acc;
  }, {});

  // ============================================================
  // Abrir Modal
  // ============================================================
  const handleOpenModal = (pagina = null, mode = 'create') => {
    setModalMode(mode);
    if (pagina) {
      setSelectedPagina(pagina);
      setFormData({
        idModulo: pagina.idModulo || '',
        nombrePagina: pagina.nombrePagina || '',
        rutaPagina: pagina.rutaPagina || '',
        descripcion: pagina.descripcion || '',
        orden: pagina.orden || 1,
        activo: pagina.activo !== false
      });
    } else {
      setSelectedPagina(null);
      setFormData({
        idModulo: filtroModulo || '',
        nombrePagina: '',
        rutaPagina: '',
        descripcion: '',
        orden: paginas.length + 1,
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPagina(null);
    setModalMode('create');
    setFormData({
      idModulo: '',
      nombrePagina: '',
      rutaPagina: '',
      descripcion: '',
      orden: 1,
      activo: true
    });
  };

  // ============================================================
  // Guardar Página
  // ============================================================
  const handleSave = async () => {
    if (!formData.nombrePagina.trim()) {
      alert('El nombre de la página es obligatorio');
      return;
    }
    if (!formData.idModulo) {
      alert('Debe seleccionar un módulo');
      return;
    }
    if (!formData.rutaPagina.trim()) {
      alert('La ruta de la página es obligatoria');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        idModulo: parseInt(formData.idModulo),
        nombrePagina: formData.nombrePagina.trim(),
        rutaPagina: formData.rutaPagina.trim(),
        descripcion: formData.descripcion.trim(),
        orden: parseInt(formData.orden) || 1,
        activo: formData.activo
      };

      if (selectedPagina) {
        await paginaModuloService.actualizar(selectedPagina.idPagina, dataToSend);
      } else {
        await paginaModuloService.crear(dataToSend);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      console.error('Error al guardar página:', err);
      alert('Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Eliminar Página
  // ============================================================
  const handleDelete = async (id) => {
    try {
      await paginaModuloService.eliminar(id);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      console.error('Error al eliminar página:', err);
      alert('Error al eliminar: ' + (err.message || 'Error desconocido'));
    }
  };

  // ============================================================
  // Toggle Estado
  // ============================================================
  const handleToggleEstado = async (pagina) => {
    try {
      const nuevoEstado = !pagina.activo;
      await paginaModuloService.actualizar(pagina.idPagina, {
        ...pagina,
        activo: nuevoEstado
      });
      loadData();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al cambiar estado: ' + (err.message || 'Error desconocido'));
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-2xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                  Gestión de Páginas
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Administra las páginas/submenús de cada módulo MBAC
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium shadow-sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                onClick={() => handleOpenModal(null, 'create')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0A5BA9] hover:bg-[#084a8a] text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                Nueva Página
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Buscador */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar páginas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all"
              />
            </div>

            {/* Filtro por Módulo */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filtroModulo}
                onChange={(e) => setFiltroModulo(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all min-w-[200px]"
              >
                <option value="">Todos los módulos</option>
                {modulos.map(mod => (
                  <option key={mod.idModulo} value={mod.idModulo}>
                    {mod.nombreModulo}
                  </option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{paginas.length}</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Activas</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {paginas.filter(p => p.activo).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#0A5BA9] animate-spin mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Cargando páginas...
              </p>
            </div>
          ) : error ? (
            <div className="m-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-700 dark:text-red-300 font-medium mb-2">{error}</p>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium"
              >
                Reintentar
              </button>
            </div>
          ) : filteredPaginas.length === 0 ? (
            <div className="m-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
                {searchTerm || filtroModulo ? 'No se encontraron páginas' : 'No hay páginas registradas'}
              </p>
              {!searchTerm && !filtroModulo && (
                <button
                  onClick={() => handleOpenModal(null, 'create')}
                  className="px-6 py-3 bg-[#0A5BA9] hover:bg-[#084a8a] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Crear Primera Página
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A5BA9]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Módulo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Página
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Ruta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filteredPaginas.map((pagina, index) => (
                    <tr
                      key={pagina.idPagina}
                      className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                        index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      {/* Orden */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          {pagina.orden || index + 1}
                        </span>
                      </td>

                      {/* Módulo */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-violet-500" />
                          <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                            {getNombreModulo(pagina.idModulo)}
                          </span>
                        </div>
                      </td>

                      {/* Página */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-lg">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {pagina.nombrePagina}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              ID: {pagina.idPagina}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Ruta */}
                      <td className="px-6 py-4">
                        <code className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                          {pagina.rutaPagina}
                        </code>
                      </td>

                      {/* Descripción */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-slate-300 max-w-xs truncate">
                          {pagina.descripcion || '-'}
                        </p>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleToggleEstado(pagina)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              pagina.activo
                                ? 'bg-emerald-500 focus:ring-emerald-500'
                                : 'bg-gray-300 dark:bg-slate-600 focus:ring-gray-400'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                                pagina.activo ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenModal(pagina, 'view')}
                            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(pagina, 'edit')}
                            className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(pagina)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Crear/Editar/Ver */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-xl">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {modalMode === 'create' && 'Nueva Página'}
                    {modalMode === 'edit' && 'Editar Página'}
                    {modalMode === 'view' && 'Detalle de Página'}
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Módulo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Layers className="w-4 h-4 inline mr-2" />
                    Módulo *
                  </label>
                  <select
                    value={formData.idModulo}
                    onChange={(e) => setFormData({ ...formData, idModulo: e.target.value })}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all disabled:opacity-60"
                  >
                    <option value="">Seleccionar módulo...</option>
                    {modulos.map(mod => (
                      <option key={mod.idModulo} value={mod.idModulo}>
                        {mod.nombreModulo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Nombre de la Página *
                  </label>
                  <input
                    type="text"
                    value={formData.nombrePagina}
                    onChange={(e) => setFormData({ ...formData, nombrePagina: e.target.value })}
                    placeholder="Ej: Dashboard Admin, Gestión de Usuarios..."
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all disabled:opacity-60"
                  />
                </div>

                {/* Ruta */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Route className="w-4 h-4 inline mr-2" />
                    Ruta de la Página *
                  </label>
                  <input
                    type="text"
                    value={formData.rutaPagina}
                    onChange={(e) => setFormData({ ...formData, rutaPagina: e.target.value })}
                    placeholder="Ej: /admin/dashboard, /admin/users..."
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all font-mono disabled:opacity-60"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción de la página..."
                    rows={3}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all resize-none disabled:opacity-60"
                  />
                </div>

                {/* Orden y Estado */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Hash className="w-4 h-4 inline mr-2" />
                      Orden
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.orden}
                      onChange={(e) => setFormData({ ...formData, orden: e.target.value })}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Estado
                    </label>
                    <button
                      type="button"
                      onClick={() => modalMode !== 'view' && setFormData({ ...formData, activo: !formData.activo })}
                      disabled={modalMode === 'view'}
                      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        formData.activo
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                      } disabled:cursor-not-allowed`}
                    >
                      {formData.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium"
                >
                  {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0A5BA9] hover:bg-[#084a8a] text-white rounded-xl transition-all font-medium shadow-lg disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Confirmar Eliminación */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Confirmar Eliminación
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  ¿Eliminar la página <strong className="text-slate-900 dark:text-white">{deleteConfirm.nombrePagina}</strong>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm.idPagina)}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
