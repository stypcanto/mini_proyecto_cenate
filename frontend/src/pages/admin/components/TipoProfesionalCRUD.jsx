// ========================================================================
// TipoProfesionalCRUD.jsx – CRUD de Tipos Profesionales (CENATE 2025)
// ------------------------------------------------------------------------
// Componente para gestionar tipos profesionales del sistema
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
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
import { tipoProfesionalService } from '../../../services/tipoProfesionalService';

export default function TipoProfesionalCRUD() {
  const [tiposProfesionales, setTiposProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [formData, setFormData] = useState({
    descTipPers: '',
    statTipPers: 'A'
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ============================================================
  // Cargar Tipos Profesionales
  // ============================================================
  const loadData = async () => {
    console.log('🔵 [TipoProfesionalCRUD] Iniciando carga de datos...');
    setLoading(true);
    setError(null);
    try {
      console.log('🔵 [TipoProfesionalCRUD] Llamando a tipoProfesionalService.obtenerTodos()...');
      const data = await tipoProfesionalService.obtenerTodos();
      console.log('✅ [TipoProfesionalCRUD] Tipos profesionales cargados:', data);
      console.log('✅ [TipoProfesionalCRUD] Tipo de dato:', typeof data, 'Es array:', Array.isArray(data));
      setTiposProfesionales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ [TipoProfesionalCRUD] Error al cargar tipos profesionales:', err);
      console.error('❌ [TipoProfesionalCRUD] Error completo:', err.message, err.stack);
      setError('No se pudieron cargar los tipos profesionales. Verifique que el backend esté corriendo.');
      setTiposProfesionales([]);
    } finally {
      setLoading(false);
      console.log('🔵 [TipoProfesionalCRUD] Carga finalizada');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // Filtrar y Ordenar Tipos Profesionales
  // ============================================================
  const filteredTipos = (tiposProfesionales || [])
    .filter(tipo =>
      tipo.descTipPers?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.descTipPers || '').localeCompare(b.descTipPers || ''));

  // ============================================================
  // Abrir Modal (Crear/Editar)
  // ============================================================
  const handleOpenModal = (tipo = null) => {
    if (tipo) {
      setSelectedTipo(tipo);
      setFormData({
        descTipPers: tipo.descTipPers || '',
        statTipPers: tipo.statTipPers || 'A'
      });
    } else {
      setSelectedTipo(null);
      setFormData({
        descTipPers: '',
        statTipPers: 'A'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTipo(null);
    setFormData({
      descTipPers: '',
      statTipPers: 'A'
    });
  };

  // ============================================================
  // Guardar Tipo Profesional
  // ============================================================
  const handleSave = async () => {
    if (!formData.descTipPers.trim()) {
      alert('El nombre del tipo profesional es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        descTipPers: formData.descTipPers.trim().toUpperCase(),
        statTipPers: formData.statTipPers
      };

      if (selectedTipo) {
        await tipoProfesionalService.actualizar(selectedTipo.idTipPers, dataToSend);
      } else {
        await tipoProfesionalService.crear(dataToSend);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      console.error('Error al guardar tipo profesional:', err);
      alert('Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Eliminar Tipo Profesional
  // ============================================================
  const handleDelete = async (id) => {
    try {
      await tipoProfesionalService.eliminar(id);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      console.error('Error al eliminar tipo profesional:', err);
      alert('Error al eliminar: ' + (err.message || 'Error desconocido'));
    }
  };

  // ============================================================
  // Toggle Estado
  // ============================================================
  const handleToggleEstado = async (tipo) => {
    try {
      const nuevoEstado = tipo.statTipPers === 'A' ? 'I' : 'A';
      await tipoProfesionalService.actualizar(tipo.idTipPers, {
        descTipPers: tipo.descTipPers,
        statTipPers: nuevoEstado
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-2xl shadow-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Gestión de Tipos Profesionales
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Administra los tipos profesionales del sistema CENATE
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
            Nuevo Tipo
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar tipos profesionales..."
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
            Cargando tipos profesionales...
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
      ) : filteredTipos.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
          <Briefcase className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
            {searchTerm ? 'No se encontraron tipos profesionales' : 'No hay tipos profesionales registrados'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza creando tu primer tipo profesional'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-[#0A5BA9] hover:bg-[#084a8a] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Crear Primer Tipo
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
                    Tipo Profesional
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
                {filteredTipos.map((tipo, index) => (
                  <tr key={tipo.idTipPers} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-lg">
                          <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {tipo.descTipPers}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {tipo.idTipPers}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleToggleEstado(tipo)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            tipo.statTipPers === 'A'
                              ? 'bg-emerald-500 focus:ring-emerald-500'
                              : 'bg-gray-300 focus:ring-gray-400'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                              tipo.statTipPers === 'A' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`ml-2 text-xs font-semibold ${tipo.statTipPers === 'A' ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {tipo.statTipPers === 'A' ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {/* Botón Ver Detalle */}
                        <div className="relative group">
                          <button
                            onClick={() => handleOpenModal(tipo)}
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
                            onClick={() => handleOpenModal(tipo)}
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
                            onClick={() => setDeleteConfirm(tipo)}
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-xl shadow-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedTipo ? 'Editar Tipo Profesional' : 'Nuevo Tipo Profesional'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedTipo ? `ID: ${selectedTipo.idTipPers}` : 'Complete los datos requeridos'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Contenido del Modal - 2 Columnas */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna Izquierda */}
                <div className="space-y-6">
                  {/* Campo: Nombre del Tipo Profesional */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <Briefcase className="w-4 h-4 text-[#0A5BA9]" />
                      Nombre del Tipo Profesional
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.descTipPers}
                      onChange={(e) => setFormData({ ...formData, descTipPers: e.target.value })}
                      placeholder="Ej: ADMINISTRATIVO"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all uppercase font-medium"
                      autoFocus
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-1">
                      Ingrese el tipo de personal (se convertirá a mayúsculas)
                    </p>
                  </div>

                  {/* Campo: Descripción o Ejemplo */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Ejemplos de tipos profesionales:
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• ADMINISTRATIVO - Personal de oficina</li>
                          <li>• ASISTENCIAL - Personal de salud</li>
                          <li>• PRACTICANTE - En formación</li>
                          <li>• TÉCNICO - Personal técnico especializado</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-6">
                  {/* Campo: Estado */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      <svg className="w-4 h-4 text-[#0A5BA9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Estado del Tipo Profesional
                    </label>

                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                            {formData.statTipPers === 'A' ? 'Activo' : 'Inactivo'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formData.statTipPers === 'A'
                              ? 'El tipo profesional estará disponible en el sistema'
                              : 'El tipo profesional no estará disponible'
                            }
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            statTipPers: formData.statTipPers === 'A' ? 'I' : 'A'
                          })}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            formData.statTipPers === 'A'
                              ? 'bg-emerald-500 focus:ring-emerald-500'
                              : 'bg-gray-300 focus:ring-gray-400'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                              formData.statTipPers === 'A' ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Información Adicional */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Información Importante
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          Los tipos profesionales permiten clasificar al personal según su función en la organización. Asegúrese de no crear duplicados.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metadatos (solo en modo edición) */}
                  {selectedTipo && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        Información del Registro
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">ID:</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedTipo.idTipPers}</span>
                        </div>
                        {selectedTipo.createdAt && (
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Creado:</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {new Date(selectedTipo.createdAt).toLocaleDateString('es-PE')}
                            </span>
                          </div>
                        )}
                        {selectedTipo.updatedAt && (
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Actualizado:</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {new Date(selectedTipo.updatedAt).toLocaleDateString('es-PE')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer con Botones */}
            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-6 py-3 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl transition-all font-semibold shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A5BA9] to-[#084a8a] hover:from-[#084a8a] hover:to-[#063d75] text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Guardar Cambios</span>
                  </>
                )}
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
                ¿Estás seguro de eliminar el tipo profesional <strong>{deleteConfirm.descTipPers}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.idTipPers)}
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
