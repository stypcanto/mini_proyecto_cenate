// ========================================================================
// ProfesionesCRUD.jsx – CRUD de Profesiones (CENATE 2025)
// ------------------------------------------------------------------------
// Componente para gestionar profesiones de CENATE
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  X,
  Save,
  AlertCircle,
  Eye
} from 'lucide-react';
import { profesionService } from '../../../services/profesionService';

export default function ProfesionesCRUD() {
  const [profesiones, setProfesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProfesion, setSelectedProfesion] = useState(null);
  const [formData, setFormData] = useState({
    descProf: '',
    statProf: 'A'
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ============================================================
  // Cargar Profesiones
  // ============================================================
  const loadProfesiones = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profesionService.obtenerTodas();
      setProfesiones(data);
    } catch (err) {
      console.error('Error al cargar profesiones:', err);
      setError('No se pudieron cargar las profesiones. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfesiones();
  }, []);

  // ============================================================
  // Filtrar y ordenar Profesiones alfabéticamente
  // ============================================================
  const filteredProfesiones = profesiones
    .filter(profesion =>
      profesion.descProf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profesion.statProf?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.descProf || '').localeCompare(b.descProf || ''));

  // ============================================================
  // Abrir Modal (Crear/Editar)
  // ============================================================
  const handleOpenModal = (profesion = null) => {
    if (profesion) {
      setSelectedProfesion(profesion);
      setFormData({
        descProf: profesion.descProf || '',
        statProf: profesion.statProf || 'A'
      });
    } else {
      setSelectedProfesion(null);
      setFormData({
        descProf: '',
        statProf: 'A'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProfesion(null);
    setFormData({
      descProf: '',
      statProf: 'A'
    });
  };

  // ============================================================
  // Guardar Profesión
  // ============================================================
  const handleSave = async () => {
    if (!formData.descProf.trim()) {
      alert('La descripción es obligatoria');
      return;
    }

    setSaving(true);
    try {
      if (selectedProfesion) {
        await profesionService.actualizar(selectedProfesion.idProf, formData);
      } else {
        await profesionService.crear(formData);
      }
      handleCloseModal();
      loadProfesiones();
    } catch (err) {
      console.error('Error al guardar profesión:', err);
      alert('Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Eliminar Profesión
  // ============================================================
  const handleDelete = async (id) => {
    try {
      await profesionService.eliminar(id);
      setDeleteConfirm(null);
      loadProfesiones();
    } catch (err) {
      console.error('Error al eliminar profesión:', err);
      alert('Error al eliminar: ' + (err.message || 'Error desconocido'));
    }
  };

  // ============================================================
  // Toggle Estado
  // ============================================================
  const handleToggleEstado = async (profesion) => {
    try {
      const nuevoEstado = profesion.statProf === 'A' ? 'I' : 'A';
      await profesionService.actualizar(profesion.idProf, {
        descProf: profesion.descProf,
        statProf: nuevoEstado
      });
      loadProfesiones();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al cambiar estado: ' + (err.message || 'Error desconocido'));
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-2xl shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Gestión de Profesiones
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Administra las profesiones del personal de CENATE
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadProfesiones}
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
            Nueva Profesión
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar profesiones..."
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
            Cargando profesiones...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 dark:text-red-300 font-medium mb-2">
            {error}
          </p>
          <button
            onClick={loadProfesiones}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium"
          >
            Reintentar
          </button>
        </div>
      ) : filteredProfesiones.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
          <GraduationCap className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
            {searchTerm ? 'No se encontraron profesiones' : 'No hay profesiones registradas'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza creando tu primera profesión'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-[#0A5BA9] hover:bg-[#084a8a] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Crear Primera Profesión
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
                {filteredProfesiones.map((profesion, index) => (
                  <tr key={profesion.idProf} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {profesion.descProf}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {profesion.createdAt
                          ? new Date(profesion.createdAt).toLocaleDateString('es-PE', {
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
                          onClick={() => handleToggleEstado(profesion)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            profesion.statProf === 'A'
                              ? 'bg-emerald-500 focus:ring-emerald-500'
                              : 'bg-gray-300 focus:ring-gray-400'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                              profesion.statProf === 'A' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`ml-2 text-xs font-semibold ${profesion.statProf === 'A' ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {profesion.statProf === 'A' ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {/* Botón Ver Detalle */}
                        <div className="relative group">
                          <button
                            onClick={() => handleOpenModal(profesion)}
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
                            onClick={() => handleOpenModal(profesion)}
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
                            onClick={() => setDeleteConfirm(profesion.idProf)}
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

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedProfesion ? 'Editar Profesión' : 'Nueva Profesión'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={formData.descProf}
                  onChange={(e) => setFormData({ ...formData, descProf: e.target.value })}
                  placeholder="Ej: Médico, Enfermera, Tecnólogo..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.statProf}
                  onChange={(e) => setFormData({ ...formData, statProf: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all"
                >
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0A5BA9] hover:bg-[#084a8a] text-white rounded-xl transition-all font-medium shadow-lg disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
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
                ¿Estás seguro de eliminar esta profesión? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
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
  );
}
