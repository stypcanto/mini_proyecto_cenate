// ========================================================================
// RolesCRUD.jsx – CRUD de Roles (CENATE 2025)
// ------------------------------------------------------------------------
// Componente para gestionar roles del sistema
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Shield,
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
import { rolService } from '../../../services/rolService';

export default function RolesCRUD() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);
  const [formData, setFormData] = useState({
    descRol: '',
    statRol: 'A',
    nivelJerarquia: 10,
    activo: true
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ============================================================
  // Cargar Roles
  // ============================================================
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rolService.obtenerTodos();
      setRoles(data);
    } catch (err) {
      console.error('Error al cargar roles:', err);
      setError('No se pudieron cargar los roles. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // Filtrar y Ordenar Roles (por nivel jerarquico)
  // ============================================================
  const filteredRoles = roles
    .filter(rol =>
      rol.descRol?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.nivelJerarquia || 99) - (b.nivelJerarquia || 99));

  // ============================================================
  // Abrir Modal (Crear/Editar)
  // ============================================================
  const handleOpenModal = (rol = null) => {
    if (rol) {
      setSelectedRol(rol);
      setFormData({
        descRol: rol.descRol || '',
        statRol: rol.statRol || 'A',
        nivelJerarquia: rol.nivelJerarquia || 10,
        activo: rol.activo !== false
      });
    } else {
      setSelectedRol(null);
      setFormData({
        descRol: '',
        statRol: 'A',
        nivelJerarquia: 10,
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRol(null);
    setFormData({
      descRol: '',
      statRol: 'A',
      nivelJerarquia: 10,
      activo: true
    });
  };

  // ============================================================
  // Guardar Rol
  // ============================================================
  const handleSave = async () => {
    if (!formData.descRol.trim()) {
      alert('El nombre del rol es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        descRol: formData.descRol.trim().toUpperCase(),
        statRol: formData.statRol,
        nivelJerarquia: parseInt(formData.nivelJerarquia) || 10,
        activo: formData.activo
      };

      if (selectedRol) {
        await rolService.actualizar(selectedRol.idRol, dataToSend);
      } else {
        await rolService.crear(dataToSend);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      console.error('Error al guardar rol:', err);
      alert('Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Eliminar Rol
  // ============================================================
  const handleDelete = async (id) => {
    try {
      await rolService.eliminar(id);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      console.error('Error al eliminar rol:', err);
      alert('Error al eliminar: ' + (err.message || 'Error desconocido'));
    }
  };

  // ============================================================
  // Toggle Estado
  // ============================================================
  const handleToggleEstado = async (rol) => {
    try {
      const nuevoEstado = rol.statRol === 'A' ? 'I' : 'A';
      await rolService.actualizar(rol.idRol, {
        ...rol,
        descRol: rol.descRol,
        statRol: nuevoEstado,
        activo: nuevoEstado === 'A'
      });
      loadData();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al cambiar estado: ' + (err.message || 'Error desconocido'));
    }
  };

  // ============================================================
  // Obtener etiqueta y color por nivel de jerarquia
  // ============================================================
  const getNivelInfo = (nivel) => {
    if (!nivel || nivel === 0) {
      return { label: 'Sin asignar', className: 'bg-gray-100 text-gray-600' };
    }
    if (nivel === 1) {
      return { label: 'Máxima Autoridad', className: 'bg-red-100 text-red-700' };
    }
    if (nivel <= 3) {
      return { label: 'Alta Autoridad', className: 'bg-orange-100 text-orange-700' };
    }
    if (nivel <= 5) {
      return { label: 'Autoridad Media', className: 'bg-yellow-100 text-yellow-700' };
    }
    if (nivel <= 7) {
      return { label: 'Autoridad Básica', className: 'bg-blue-100 text-blue-700' };
    }
    return { label: 'Usuario Estándar', className: 'bg-slate-100 text-slate-600' };
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
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Gestión de Roles
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Administra los roles del sistema CENATE
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
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
            Nuevo Rol
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all"
          />
        </div>
      </div>

      {/* Leyenda de Niveles de Jerarquía */}
      <div className="mb-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Niveles de Jerarquía del Sistema
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-700 rounded-xl px-3 py-2 shadow-sm border border-slate-100 dark:border-slate-600">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              Nivel 1
            </span>
            <div className="text-xs">
              <p className="font-medium text-slate-700 dark:text-slate-200">Máxima Autoridad</p>
              <p className="text-slate-500 dark:text-slate-400">SUPERADMIN</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-700 rounded-xl px-3 py-2 shadow-sm border border-slate-100 dark:border-slate-600">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
              Nivel 2-3
            </span>
            <div className="text-xs">
              <p className="font-medium text-slate-700 dark:text-slate-200">Alta Autoridad</p>
              <p className="text-slate-500 dark:text-slate-400">ADMIN, DIRECTOR, GERENTE</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-700 rounded-xl px-3 py-2 shadow-sm border border-slate-100 dark:border-slate-600">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
              Nivel 4-5
            </span>
            <div className="text-xs">
              <p className="font-medium text-slate-700 dark:text-slate-200">Autoridad Media</p>
              <p className="text-slate-500 dark:text-slate-400">COORDINADOR, JEFE, SUPERVISOR</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-700 rounded-xl px-3 py-2 shadow-sm border border-slate-100 dark:border-slate-600">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Nivel 6-7
            </span>
            <div className="text-xs">
              <p className="font-medium text-slate-700 dark:text-slate-200">Autoridad Básica</p>
              <p className="text-slate-500 dark:text-slate-400">MEDICO, ENFERMERIA, OBSTETRA</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-700 rounded-xl px-3 py-2 shadow-sm border border-slate-100 dark:border-slate-600">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              Nivel 8-10
            </span>
            <div className="text-xs">
              <p className="font-medium text-slate-700 dark:text-slate-200">Usuario Estándar</p>
              <p className="text-slate-500 dark:text-slate-400">TECNICO, ASISTENTE, SECRETARIA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#0A5BA9] animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Cargando roles...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 dark:text-red-300 font-medium mb-2">
            {error}
          </p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium"
          >
            Reintentar
          </button>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
          <Shield className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
            {searchTerm ? 'No se encontraron roles' : 'No hay roles registrados'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza creando tu primer rol'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-[#0A5BA9] hover:bg-[#084a8a] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Crear Primer Rol
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
                    Rol
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Nivel Jerarquía
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
                {filteredRoles.map((rol, index) => (
                  <tr key={rol.idRol} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-lg">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {rol.descRol}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {rol.idRol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getNivelInfo(rol.nivelJerarquia).className}`}>
                        {getNivelInfo(rol.nivelJerarquia).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleToggleEstado(rol)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            rol.statRol === 'A'
                              ? 'bg-emerald-500 focus:ring-emerald-500'
                              : 'bg-gray-300 focus:ring-gray-400'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                              rol.statRol === 'A' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`ml-2 text-xs font-semibold ${rol.statRol === 'A' ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {rol.statRol === 'A' ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {/* Botón Ver Detalle */}
                        <div className="relative group">
                          <button
                            onClick={() => handleOpenModal(rol)}
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
                            onClick={() => handleOpenModal(rol)}
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
                            onClick={() => setDeleteConfirm(rol)}
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
                {selectedRol ? 'Editar Rol' : 'Nuevo Rol'}
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
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  value={formData.descRol}
                  onChange={(e) => setFormData({ ...formData, descRol: e.target.value })}
                  placeholder="Ej: COORDINADOR, SUPERVISOR..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nivel de Jerarquía
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.nivelJerarquia}
                  onChange={(e) => setFormData({ ...formData, nivelJerarquia: e.target.value })}
                  placeholder="1 = más alto, 100 = más bajo"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all"
                />
                <p className="text-xs text-slate-500 mt-1">
                  1 = Mayor jerarquía (ej: SUPERADMIN), números mayores = menor jerarquía
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.statRol}
                  onChange={(e) => setFormData({ ...formData, statRol: e.target.value, activo: e.target.value === 'A' })}
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
                ¿Estás seguro de eliminar el rol <strong>{deleteConfirm.descRol}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.idRol)}
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
