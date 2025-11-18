// ========================================================================
// 🎓 ProfesionCRUD.jsx – CRUD de Profesiones (CENATE 2025)
// ------------------------------------------------------------------------
// Componente para gestionar profesiones del personal médico
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
  CheckCircle2,
  Power,
  PowerOff
} from 'lucide-react';
import { profesionService } from '../../../services/profesionService';

export default function ProfesionCRUD() {
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
  // 📦 Cargar Profesiones
  // ============================================================
  const loadProfesiones = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profesionService.obtenerTodas();
      setProfesiones(data);
    } catch (err) {
      console.error('Error al cargar profesiones:', err);
      setError('No se pudieron cargar las profesiones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfesiones();
  }, []);

  // ============================================================
  // 🔍 Filtrar Profesiones
  // ============================================================
  const filteredProfesiones = profesiones.filter(prof =>
    prof.descProf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.statProf?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================================
  // ➕ Abrir Modal (Crear/Editar)
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
  // 💾 Guardar Profesión
  // ============================================================
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.descProf.trim()) {
      alert('La descripción de la profesión es requerida');
      return;
    }

    setSaving(true);
    try {
      if (selectedProfesion) {
        // Actualizar
        await profesionService.actualizar(selectedProfesion.idProf, formData);
      } else {
        // Crear
        await profesionService.crear(formData);
      }
      handleCloseModal();
      loadProfesiones();
    } catch (err) {
      console.error('Error al guardar profesión:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al guardar la profesión';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // 🗑️ Eliminar Profesión
  // ============================================================
  const handleDelete = async (id) => {
    try {
      await profesionService.eliminar(id);
      setDeleteConfirm(null);
      loadProfesiones();
    } catch (err) {
      console.error('Error al eliminar profesión:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar la profesión';
      alert(errorMessage);
      setDeleteConfirm(null);
    }
  };

  // ============================================================
  // ⚡ Toggle Estado
  // ============================================================
  const handleToggleEstado = async (profesion) => {
    try {
      const nuevoEstado = profesion.statProf === 'A' ? 'I' : 'A';
      await profesionService.actualizar(profesion.idProf, {
        ...profesion,
        statProf: nuevoEstado
      });
      loadProfesiones();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al cambiar el estado de la profesión');
    }
  };

  // ============================================================
  // 📊 Estadísticas
  // ============================================================
  const totalProfesiones = profesiones.length;
  const activas = profesiones.filter(p => p.statProf === 'A').length;
  const inactivas = totalProfesiones - activas;

  // ============================================================
  // 🧠 Render
  // ============================================================
  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <GraduationCap className="w-7 h-7 text-[#0A5BA9]" />
              Gestión de Profesiones
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Administra las profesiones del personal médico
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" /> Nueva Profesión
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalProfesiones}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Activas</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{activas}</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Inactivas</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{inactivas}</p>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar profesiones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla de Profesiones */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <Loader2 className="w-10 h-10 animate-spin text-[#0A5BA9]" />
          <p className="ml-3 text-slate-600 dark:text-slate-400">Cargando profesiones...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg text-center">
          {error}
        </div>
      ) : filteredProfesiones.length === 0 ? (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-lg text-center">
          {searchTerm ? 'No se encontraron profesiones con ese criterio.' : 'No hay profesiones registradas.'}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {filteredProfesiones.map((prof) => (
                  <tr key={prof.idProf} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        #{prof.idProf}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {prof.descProf}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {prof.statProf === 'A' ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Activa
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3" />
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {prof.createdAt 
                          ? new Date(prof.createdAt).toLocaleDateString('es-PE', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            })
                          : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleEstado(prof)}
                          className={`p-2 rounded-full transition-colors ${
                            prof.statProf === 'A'
                              ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
                              : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                          }`}
                          title={prof.statProf === 'A' ? 'Desactivar' : 'Activar'}
                        >
                          {prof.statProf === 'A' ? (
                            <PowerOff className="w-5 h-5" />
                          ) : (
                            <Power className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenModal(prof)}
                          className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                          title="Editar profesión"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(prof.idProf)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                          title="Eliminar profesión"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
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
            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedProfesion ? '✏️ Editar Profesión' : '➕ Nueva Profesión'}
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  {selectedProfesion ? 'Modifica los datos de la profesión' : 'Crea una nueva profesión'}
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
                  value={formData.descProf}
                  onChange={(e) => setFormData({ ...formData, descProf: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all"
                  placeholder="Ej: Médico, Enfermero, Técnico..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.statProf}
                  onChange={(e) => setFormData({ ...formData, statProf: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all"
                >
                  <option value="A">Activa</option>
                  <option value="I">Inactiva</option>
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
                  ¿Eliminar profesión?
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

