// ========================================================================
// ModulosManagement.jsx – CRUD de Módulos del Sistema (CENATE 2025)
// ------------------------------------------------------------------------
// Componente para gestionar los módulos del sistema MBAC
// Con selector de iconos de Lucide
// ========================================================================

import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Layers,
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
  ToggleLeft,
  ToggleRight,
  Route,
  Hash,
  FileText,
  Folder,
  ChevronDown,
  Check
} from 'lucide-react';
import { moduloService } from '../../services/moduloService';

// Lista de iconos comunes para módulos del sistema
const ICONOS_DISPONIBLES = [
  'Settings', 'Users', 'UserCog', 'Shield', 'Lock', 'Key',
  'LayoutDashboard', 'BarChart3', 'PieChart', 'TrendingUp', 'Activity',
  'FileText', 'Files', 'FolderOpen', 'Clipboard', 'ClipboardList', 'ClipboardCheck',
  'Calendar', 'CalendarCheck', 'Clock', 'Timer',
  'Stethoscope', 'HeartPulse', 'Heart', 'Hospital', 'Pill', 'Syringe',
  'UsersRound', 'UserCheck', 'UserPlus', 'UserMinus',
  'Building', 'Building2', 'Home', 'MapPin', 'Map',
  'Search', 'Eye', 'Bell', 'Mail', 'MessageSquare',
  'Database', 'Server', 'Cloud', 'Wifi', 'Globe',
  'Layers', 'Grid', 'Layout', 'Columns', 'Rows',
  'FileCheck', 'FilePlus', 'FileSearch', 'FileBarChart',
  'Wallet', 'CreditCard', 'DollarSign', 'Receipt',
  'Truck', 'Package', 'ShoppingCart', 'ShoppingBag',
  'Wrench', 'Tool', 'Cog', 'SlidersHorizontal',
  'BookOpen', 'GraduationCap', 'Award', 'Star',
  'CheckCircle', 'AlertCircle', 'Info', 'HelpCircle',
  'ArrowRight', 'ArrowLeft', 'ChevronRight', 'Menu',
  'Network', 'Share2', 'Link', 'Unlink',
  'Image', 'Camera', 'Video', 'Music',
  'Folder', 'FolderTree', 'Archive', 'Box', 'BoxSelect',
  'ClipboardType', 'ListChecks', 'ListTodo', 'List'
];

// Obtener componente de icono por nombre
const getIconComponent = (iconName) => {
  if (!iconName) return Folder;
  const icon = LucideIcons[iconName];
  return icon || Folder;
};

export default function ModulosManagement() {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [formData, setFormData] = useState({
    nombreModulo: '',
    descripcion: '',
    rutaBase: '',
    icono: 'Folder',
    activo: true,
    orden: 1
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  // ============================================================
  // Cargar Módulos
  // ============================================================
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moduloService.obtenerTodos();
      const sorted = Array.isArray(data)
        ? data.sort((a, b) => (a.nombreModulo || '').localeCompare(b.nombreModulo || '', 'es'))
        : [];
      setModulos(sorted);
    } catch (err) {
      console.error('Error al cargar módulos:', err);
      setError('No se pudieron cargar los módulos. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // Filtrar Módulos
  // ============================================================
  const filteredModulos = modulos.filter(mod =>
    mod.nombreModulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.rutaBase?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar iconos disponibles
  const filteredIcons = ICONOS_DISPONIBLES.filter(icon =>
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  // ============================================================
  // Abrir Modal (Crear/Editar/Ver)
  // ============================================================
  const handleOpenModal = (modulo = null, mode = 'create') => {
    setModalMode(mode);
    setShowIconPicker(false);
    setIconSearch('');
    if (modulo) {
      setSelectedModulo(modulo);
      setFormData({
        nombreModulo: modulo.nombreModulo || '',
        descripcion: modulo.descripcion || '',
        rutaBase: modulo.rutaBase || '',
        icono: modulo.icono || 'Folder',
        activo: modulo.activo !== false,
        orden: modulo.orden || 1
      });
    } else {
      setSelectedModulo(null);
      setFormData({
        nombreModulo: '',
        descripcion: '',
        rutaBase: '',
        icono: 'Folder',
        activo: true,
        orden: modulos.length + 1
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedModulo(null);
    setModalMode('create');
    setShowIconPicker(false);
    setIconSearch('');
    setFormData({
      nombreModulo: '',
      descripcion: '',
      rutaBase: '',
      icono: 'Folder',
      activo: true,
      orden: 1
    });
  };

  // ============================================================
  // Guardar Módulo
  // ============================================================
  const handleSave = async () => {
    if (!formData.nombreModulo.trim()) {
      alert('El nombre del módulo es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        nombreModulo: formData.nombreModulo.trim(),
        descripcion: formData.descripcion.trim(),
        rutaBase: formData.rutaBase.trim(),
        icono: formData.icono || 'Folder',
        activo: formData.activo,
        orden: parseInt(formData.orden) || 1
      };

      if (selectedModulo) {
        await moduloService.actualizar(selectedModulo.idModulo, dataToSend);
      } else {
        await moduloService.crear(dataToSend);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      console.error('Error al guardar módulo:', err);
      alert('Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Eliminar Módulo
  // ============================================================
  const handleDelete = async (id) => {
    try {
      await moduloService.eliminar(id);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      console.error('Error al eliminar módulo:', err);
      alert('Error al eliminar: ' + (err.message || 'Error desconocido'));
    }
  };

  // ============================================================
  // Toggle Estado
  // ============================================================
  const handleToggleEstado = async (modulo) => {
    try {
      const nuevoEstado = !modulo.activo;
      await moduloService.actualizar(modulo.idModulo, {
        ...modulo,
        activo: nuevoEstado
      });
      loadData();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al cambiar estado: ' + (err.message || 'Error desconocido'));
    }
  };

  // ============================================================
  // Seleccionar Icono
  // ============================================================
  const handleSelectIcon = (iconName) => {
    setFormData({ ...formData, icono: iconName });
    setShowIconPicker(false);
    setIconSearch('');
  };

  // ============================================================
  // Render
  // ============================================================
  const SelectedIcon = getIconComponent(formData.icono);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-2xl shadow-lg">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                  Gestión de Módulos
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Administra los módulos del sistema MBAC CENATE
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
                Nuevo Módulo
              </button>
            </div>
          </div>
        </div>

        {/* Buscador y Estadísticas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar módulos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all"
              />
            </div>

            <div className="flex gap-4">
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{modulos.length}</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Activos</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {modulos.filter(m => m.activo).length}
                </p>
              </div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Inactivos</p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                  {modulos.filter(m => !m.activo).length}
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
              <p className="text-slate-600 dark:text-slate-400 font-medium">Cargando módulos...</p>
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
          ) : filteredModulos.length === 0 ? (
            <div className="m-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
              <Layers className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
                {searchTerm ? 'No se encontraron módulos' : 'No hay módulos registrados'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => handleOpenModal(null, 'create')}
                  className="px-6 py-3 bg-[#0A5BA9] hover:bg-[#084a8a] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Crear Primer Módulo
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A5BA9]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Orden</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Icono</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Módulo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Ruta Base</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filteredModulos.map((modulo, index) => {
                    const ModuleIcon = getIconComponent(modulo.icono);
                    return (
                      <tr
                        key={modulo.idModulo}
                        className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                          index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/50 dark:bg-slate-800/30'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl">
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                              {modulo.orden || '-'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-lg">
                              <ModuleIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              {modulo.icono || 'Folder'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {modulo.nombreModulo}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              ID: {modulo.idModulo}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-slate-300 max-w-xs truncate">
                            {modulo.descripcion || '-'}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Route className="w-4 h-4 text-slate-400" />
                            <code className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                              {modulo.rutaBase || '-'}
                            </code>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggleEstado(modulo)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                modulo.activo
                                  ? 'bg-emerald-500 focus:ring-emerald-500'
                                  : 'bg-gray-300 dark:bg-slate-600 focus:ring-gray-400'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                                  modulo.activo ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <span className={`ml-2 text-xs font-semibold ${
                              modulo.activo ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-slate-400'
                            }`}>
                              {modulo.activo ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenModal(modulo, 'view')}
                              className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(modulo, 'edit')}
                              className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(modulo)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
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
          )}
        </div>

        {/* Modal Crear/Editar/Ver */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-xl">
                    <SelectedIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {modalMode === 'create' && 'Nuevo Módulo'}
                    {modalMode === 'edit' && 'Editar Módulo'}
                    {modalMode === 'view' && 'Detalle del Módulo'}
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
                {/* Selector de Icono */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Icono del Módulo
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => modalMode !== 'view' && setShowIconPicker(!showIconPicker)}
                      disabled={modalMode === 'view'}
                      className={`w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white transition-all flex items-center justify-between disabled:opacity-60 disabled:cursor-not-allowed ${
                        showIconPicker ? 'ring-2 ring-[#0A5BA9] border-[#0A5BA9]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-lg">
                          <SelectedIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-mono text-sm">{formData.icono}</span>
                      </div>
                      {modalMode !== 'view' && <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showIconPicker ? 'rotate-180' : ''}`} />}
                    </button>

                    {/* Dropdown de iconos */}
                    {showIconPicker && modalMode !== 'view' && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-xl z-20 max-h-72 overflow-hidden">
                        {/* Buscador de iconos */}
                        <div className="p-3 border-b border-slate-200 dark:border-slate-600 sticky top-0 bg-white dark:bg-slate-700">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Buscar icono..."
                              value={iconSearch}
                              onChange={(e) => setIconSearch(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                            />
                          </div>
                        </div>

                        {/* Grid de iconos */}
                        <div className="p-3 overflow-y-auto max-h-52">
                          <div className="grid grid-cols-6 gap-2">
                            {filteredIcons.map((iconName) => {
                              const IconComp = getIconComponent(iconName);
                              const isSelected = formData.icono === iconName;
                              return (
                                <button
                                  key={iconName}
                                  type="button"
                                  onClick={() => handleSelectIcon(iconName)}
                                  className={`p-2 rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
                                    isSelected
                                      ? 'bg-[#0A5BA9] text-white ring-2 ring-[#0A5BA9] ring-offset-2'
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                                  }`}
                                  title={iconName}
                                >
                                  <IconComp className="w-5 h-5" />
                                  {isSelected && <Check className="w-3 h-3" />}
                                </button>
                              );
                            })}
                          </div>
                          {filteredIcons.length === 0 && (
                            <p className="text-center text-slate-500 dark:text-slate-400 py-4 text-sm">
                              No se encontraron iconos
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Este icono se mostrará en el menú lateral
                  </p>
                </div>

                {/* Nombre del Módulo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Layers className="w-4 h-4 inline mr-2" />
                    Nombre del Módulo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombreModulo}
                    onChange={(e) => setFormData({ ...formData, nombreModulo: e.target.value })}
                    placeholder="Ej: Gestión de Usuarios, Panel Médico..."
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Describe brevemente el propósito del módulo..."
                    rows={3}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Ruta Base */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Route className="w-4 h-4 inline mr-2" />
                    Ruta Base
                  </label>
                  <input
                    type="text"
                    value={formData.rutaBase}
                    onChange={(e) => setFormData({ ...formData, rutaBase: e.target.value })}
                    placeholder="Ej: /admin, /roles/medico..."
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all font-mono disabled:opacity-60 disabled:cursor-not-allowed"
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
                      max="100"
                      value={formData.orden}
                      onChange={(e) => setFormData({ ...formData, orden: e.target.value })}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {formData.activo ? (
                        <ToggleRight className="w-4 h-4 inline mr-2 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 inline mr-2 text-slate-400" />
                      )}
                      Estado
                    </label>
                    <button
                      type="button"
                      onClick={() => modalMode !== 'view' && setFormData({ ...formData, activo: !formData.activo })}
                      disabled={modalMode === 'view'}
                      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                        formData.activo
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {formData.activo ? (
                        <>
                          <ToggleRight className="w-5 h-5" />
                          Activo
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5" />
                          Inactivo
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {modalMode === 'view' && selectedModulo && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <strong>ID del Módulo:</strong> {selectedModulo.idModulo}
                    </p>
                  </div>
                )}
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
                  ¿Eliminar el módulo <strong className="text-slate-900 dark:text-white">{deleteConfirm.nombreModulo}</strong>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm.idModulo)}
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
