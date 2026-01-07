// ========================================================================
// 🏢 AreasCRUD.jsx – CRUD de Áreas (CENATE 2025)
// ------------------------------------------------------------------------
// Componente para gestionar áreas internas de CENATE
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Building,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  X,
  Save,
  AlertCircle,
  Eye,
  Search
} from 'lucide-react';
import { areaService } from '../../../services/areaService';

export default function AreasCRUD() {
  console.log('🏢 AreasCRUD: Componente renderizado');

  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [formData, setFormData] = useState({
    descArea: '',
    statArea: '1'
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ============================================================
  // 📦 Cargar Áreas
  // ============================================================
  const loadAreas = async () => {
    console.log('🏢 AreasCRUD: Iniciando carga de áreas...');
    setLoading(true);
    setError(null);
    try {
      const data = await areaService.obtenerTodas();
      console.log('🏢 AreasCRUD: Áreas recibidas:', data);
      setAreas(data);
    } catch (err) {
      console.error('🏢 AreasCRUD: Error al cargar áreas:', err);
      setError('No se pudieron cargar las áreas. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  // ============================================================
  // 🔍 Filtrar y Ordenar Áreas (alfabéticamente)
  // ============================================================
  const filteredAreas = areas
    .filter(area =>
      area.descArea?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.statArea?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.descArea || '').localeCompare(b.descArea || '', 'es'));

  // ============================================================
  // ➕ Abrir Modal (Crear/Editar)
  // ============================================================
  const handleOpenModal = (area = null) => {
    if (area) {
      setSelectedArea(area);
      setFormData({
        descArea: area.descArea || '',
        statArea: area.statArea === 'A' ? '1' : '0'
      });
    } else {
      setSelectedArea(null);
      setFormData({
        descArea: '',
        statArea: '1'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedArea(null);
    setFormData({
      descArea: '',
      statArea: '1'
    });
  };

  // ============================================================
  // 💾 Guardar Área
  // ============================================================
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.descArea.trim()) {
      alert('La descripción del área es requerida');
      return;
    }

    setSaving(true);
    try {
      if (selectedArea) {
        // Actualizar
        await areaService.actualizar(selectedArea.idArea, formData);
      } else {
        // Crear
        await areaService.crear(formData);
      }
      handleCloseModal();
      loadAreas();
    } catch (err) {
      console.error('Error al guardar área:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al guardar el área';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // 🗑️ Eliminar Área
  // ============================================================
  const handleDelete = async (id) => {
    try {
      await areaService.eliminar(id);
      setDeleteConfirm(null);
      loadAreas();
    } catch (err) {
      console.error('Error al eliminar área:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar el área';
      alert(errorMessage);
      setDeleteConfirm(null);
    }
  };

  // ============================================================
  // ⚡ Toggle Estado
  // ============================================================
  const handleToggleEstado = async (area) => {
    try {
      const nuevoEstado = area.statArea === 'A' ? '0' : '1';
      await areaService.actualizar(area.idArea, {
        descArea: area.descArea,
        statArea: nuevoEstado
      });
      loadAreas();
    } catch (err) {
      console.error('Error al cambiar estado del área:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al cambiar el estado';
      alert(errorMessage);
    }
  };

  // ============================================================
  // 🎨 Render
  // ============================================================
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-2xl shadow-lg">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Gestión de Áreas
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Administra las áreas internas de CENATE
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadAreas}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium shadow-sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0A5BA9] hover:bg-[#084a8a] text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Nueva Área
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar áreas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all"
          />
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#0A5BA9] animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Cargando áreas...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 dark:text-red-300 font-medium mb-2">
            {error}
          </p>
          <button
            onClick={loadAreas}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium"
          >
            Reintentar
          </button>
        </div>
      ) : filteredAreas.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
          <Building className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
            {searchTerm ? 'No se encontraron áreas' : 'No hay áreas registradas'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza creando tu primera área'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-[#0A5BA9] hover:bg-[#084a8a] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Crear Primera Área
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A5BA9]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAreas.map((area, index) => (
                  <tr key={area.idArea} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {area.descArea}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {area.createdAt
                          ? new Date(area.createdAt).toLocaleDateString('es-PE', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            })
                          : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleToggleEstado(area)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            area.statArea === 'A'
                              ? 'bg-emerald-500 focus:ring-emerald-500'
                              : 'bg-gray-300 focus:ring-gray-400'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                              area.statArea === 'A' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`ml-2 text-xs font-semibold ${area.statArea === 'A' ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {area.statArea === 'A' ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {/* Botón Ver Detalle */}
                        <div className="relative group">
                          <button
                            onClick={() => handleOpenModal(area)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                            Ver detalle
                          </span>
                        </div>

                        {/* Botón Editar */}
                        <div className="relative group">
                          <button
                            onClick={() => handleOpenModal(area)}
                            className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                            Editar
                          </span>
                        </div>

                        {/* Botón Eliminar */}
                        <div className="relative group">
                          <button
                            onClick={() => setDeleteConfirm(area.idArea)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                            Eliminar
                          </span>
                        </div>
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
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-[#0A5BA9] px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedArea ? '✏️ Editar Área' : '➕ Nueva Área'}
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  {selectedArea ? 'Modifica los datos del área' : 'Crea una nueva área'}
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
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.descArea}
                  onChange={(e) => setFormData({ ...formData, descArea: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all"
                  placeholder="Ej: TELECONSULTAS, ADMINISTRACIÓN..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.statArea}
                  onChange={(e) => setFormData({ ...formData, statArea: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all"
                >
                  <option value="1">Activa</option>
                  <option value="0">Inactiva</option>
                </select>
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
                  className="px-5 py-2.5 bg-[#0A5BA9] hover:bg-[#084a8a] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  ¿Eliminar área?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Esta acción no se puede deshacer
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
    </div>
  );
}
