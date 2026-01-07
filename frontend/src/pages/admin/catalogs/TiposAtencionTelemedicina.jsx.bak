// ========================================================================
// TiposAtencionTelemedicina.jsx – CRUD de Tipos de Atención Telemedicina (CENATE 2026)
// ------------------------------------------------------------------------
// Componente para gestionar tipos de atención telemedicina del sistema
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Video,
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
  UserCheck
} from 'lucide-react';
import { tiposAtencionService } from '../../../services/tiposAtencionService';

export default function TiposAtencionTelemedicina() {
  const [tiposAtencion, setTiposAtencion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [formData, setFormData] = useState({
    codTipoAtencion: '',
    descTipoAtencion: '',
    sigla: '',
    requiereProfesional: true,
    estado: 'A'
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ============================================================
  // Cargar Tipos de Atención
  // ============================================================
  const loadData = async () => {
    console.log('🔵 [TiposAtencionTelemedicina] Iniciando carga de datos...');
    setLoading(true);
    setError(null);
    try {
      const data = await tiposAtencionService.obtenerTodos();
      console.log('✅ [TiposAtencionTelemedicina] Tipos de atención cargados:', data);
      setTiposAtencion(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ [TiposAtencionTelemedicina] Error al cargar tipos:', err);
      setError('No se pudieron cargar los tipos de atención. Verifique que el backend esté corriendo.');
      setTiposAtencion([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // Filtrar y Ordenar Tipos de Atención
  // ============================================================
  const filteredTipos = (tiposAtencion || [])
    .filter(tipo =>
      tipo.codTipoAtencion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipo.descTipoAtencion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipo.sigla?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.codTipoAtencion || '').localeCompare(b.codTipoAtencion || ''));

  // ============================================================
  // Abrir Modal (Crear/Editar)
  // ============================================================
  const handleOpenModal = (tipo = null) => {
    if (tipo) {
      setSelectedTipo(tipo);
      setFormData({
        codTipoAtencion: tipo.codTipoAtencion || '',
        descTipoAtencion: tipo.descTipoAtencion || '',
        sigla: tipo.sigla || '',
        requiereProfesional: tipo.requiereProfesional !== false, // default true
        estado: tipo.estado || 'A'
      });
    } else {
      setSelectedTipo(null);
      setFormData({
        codTipoAtencion: '',
        descTipoAtencion: '',
        sigla: '',
        requiereProfesional: true,
        estado: 'A'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTipo(null);
    setFormData({
      codTipoAtencion: '',
      descTipoAtencion: '',
      sigla: '',
      requiereProfesional: true,
      estado: 'A'
    });
  };

  // ============================================================
  // Guardar Tipo de Atención
  // ============================================================
  const handleSave = async () => {
    if (!formData.codTipoAtencion.trim()) {
      alert('El código de tipo de atención es obligatorio');
      return;
    }
    if (!formData.descTipoAtencion.trim()) {
      alert('La descripción es obligatoria');
      return;
    }
    if (!formData.sigla.trim()) {
      alert('La sigla es obligatoria');
      return;
    }

    // Verificar duplicados (solo al crear o si cambió el código)
    if (!selectedTipo || selectedTipo.codTipoAtencion !== formData.codTipoAtencion) {
      const codigoDuplicado = tiposAtencion.some(t =>
        t.codTipoAtencion?.toUpperCase() === formData.codTipoAtencion.trim().toUpperCase() &&
        (!selectedTipo || t.idTipoAtencion !== selectedTipo.idTipoAtencion)
      );
      if (codigoDuplicado) {
        alert('Ya existe un tipo de atención con este código');
        return;
      }
    }

    // Verificar sigla duplicada
    if (!selectedTipo || selectedTipo.sigla !== formData.sigla) {
      const siglaDuplicada = tiposAtencion.some(t =>
        t.sigla?.toUpperCase() === formData.sigla.trim().toUpperCase() &&
        (!selectedTipo || t.idTipoAtencion !== selectedTipo.idTipoAtencion)
      );
      if (siglaDuplicada) {
        alert('Ya existe un tipo de atención con esta sigla');
        return;
      }
    }

    setSaving(true);
    try {
      const dataToSend = {
        codTipoAtencion: formData.codTipoAtencion.trim().toUpperCase(),
        descTipoAtencion: formData.descTipoAtencion.trim().toUpperCase(),
        sigla: formData.sigla.trim().toUpperCase(),
        requiereProfesional: formData.requiereProfesional,
        estado: formData.estado
      };

      if (selectedTipo) {
        await tiposAtencionService.actualizar(selectedTipo.idTipoAtencion, dataToSend);
      } else {
        await tiposAtencionService.crear(dataToSend);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      console.error('Error al guardar tipo de atención:', err);
      alert('Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Eliminar Tipo de Atención
  // ============================================================
  const handleDelete = async (id) => {
    try {
      await tiposAtencionService.eliminar(id);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      console.error('Error al eliminar tipo de atención:', err);
      alert('Error al eliminar: ' + (err.message || 'Error desconocido'));
    }
  };

  // ============================================================
  // Toggle Estado
  // ============================================================
  const handleToggleEstado = async (tipo) => {
    try {
      const nuevoEstado = tipo.estado === 'A' ? 'I' : 'A';
      await tiposAtencionService.actualizar(tipo.idTipoAtencion, {
        codTipoAtencion: tipo.codTipoAtencion,
        descTipoAtencion: tipo.descTipoAtencion,
        sigla: tipo.sigla,
        requiereProfesional: tipo.requiereProfesional,
        estado: nuevoEstado
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
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Gestión de Tipos de Atención Telemedicina
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Administra los tipos de atención telemédica del sistema CENATE
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
            placeholder="Buscar por código, descripción o sigla..."
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
            Cargando tipos de atención...
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
          <Video className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
            {searchTerm ? 'No se encontraron tipos de atención' : 'No hay tipos de atención registrados'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza creando tu primer tipo de atención'}
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
                    Código
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Sigla
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Requiere Profesional
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTipos.map((tipo, index) => (
                  <tr key={tipo.idTipoAtencion} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-lg">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {tipo.codTipoAtencion}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {tipo.idTipoAtencion}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {tipo.descTipoAtencion}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                        {tipo.sigla}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tipo.requiereProfesional ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <UserCheck className="w-3 h-3" />
                          SÍ
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          NO
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleToggleEstado(tipo)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            tipo.estado === 'A'
                              ? 'bg-emerald-500 focus:ring-emerald-500'
                              : 'bg-gray-300 focus:ring-gray-400'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                              tipo.estado === 'A' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`ml-2 text-xs font-semibold ${tipo.estado === 'A' ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {tipo.estado === 'A' ? 'ACTIVO' : 'INACTIVO'}
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
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedTipo ? 'Editar Tipo de Atención' : 'Nuevo Tipo de Atención'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedTipo ? `ID: ${selectedTipo.idTipoAtencion}` : 'Complete los datos requeridos'}
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
                <div className="space-y-4">
                  {/* Campo: Código */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <Video className="w-4 h-4 text-[#0A5BA9]" />
                      Código de Tipo
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.codTipoAtencion}
                      onChange={(e) => setFormData({ ...formData, codTipoAtencion: e.target.value })}
                      placeholder="Ej: TAT-001"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all uppercase font-bold"
                      autoFocus
                    />
                  </div>

                  {/* Campo: Descripción */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Descripción
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.descTipoAtencion}
                      onChange={(e) => setFormData({ ...formData, descTipoAtencion: e.target.value })}
                      placeholder="Ej: TELECONSULTA MÉDICA ESPECIALIZADA"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all uppercase font-medium resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Campo: Sigla */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Sigla
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.sigla}
                      onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                      placeholder="Ej: TCM"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] transition-all uppercase font-bold"
                    />
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-4">
                  {/* Campo: Requiere Profesional */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      <UserCheck className="w-4 h-4 text-[#0A5BA9]" />
                      Requiere Profesional de Salud
                    </label>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                            {formData.requiereProfesional ? 'Sí requiere' : 'No requiere'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formData.requiereProfesional
                              ? 'Requiere asignación de profesional de salud'
                              : 'No requiere profesional de salud asignado'
                            }
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.requiereProfesional}
                          onChange={(e) => setFormData({ ...formData, requiereProfesional: e.target.checked })}
                          className="h-6 w-6 text-[#0A5BA9] focus:ring-[#0A5BA9] border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Campo: Estado */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      <svg className="w-4 h-4 text-[#0A5BA9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Estado del Tipo
                    </label>

                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                            {formData.estado === 'A' ? 'Activo' : 'Inactivo'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formData.estado === 'A'
                              ? 'El tipo estará disponible en el sistema'
                              : 'El tipo no estará disponible'
                            }
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            estado: formData.estado === 'A' ? 'I' : 'A'
                          })}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            formData.estado === 'A'
                              ? 'bg-emerald-500 focus:ring-emerald-500'
                              : 'bg-gray-300 focus:ring-gray-400'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                              formData.estado === 'A' ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Información Adicional */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-purple-900 dark:text-purple-100 mb-1">
                          Ejemplos de tipos de atención:
                        </p>
                        <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                          <li>• TAT-001 - Teleconsulta - TC</li>
                          <li>• TAT-002 - Telemonitoreo - TM</li>
                          <li>• TAT-003 - Interconsulta - IC</li>
                        </ul>
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
                          <span className="font-medium text-slate-900 dark:text-white">{selectedTipo.idTipoAtencion}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Código:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{selectedTipo.codTipoAtencion}</span>
                        </div>
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
                ¿Estás seguro de eliminar el tipo <strong>{deleteConfirm.codTipoAtencion}</strong> - {deleteConfirm.descTipoAtencion}? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.idTipoAtencion)}
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
