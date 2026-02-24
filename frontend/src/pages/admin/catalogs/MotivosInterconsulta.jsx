/**
 * Componente: Motivos de Interconsulta
 * v1.0.0 - CRUD de motivos predefinidos para derivación de interconsulta (rol ENFERMERÍA)
 *
 * Características:
 * - CRUD completo (Create, Read, Update, Delete)
 * - Búsqueda con debounce (300ms)
 * - Paginación backend (30 items/página)
 * - Modales para crear/editar/ver/eliminar
 * - Toggle de estado (activo/inactivo)
 * - Estadísticas en tiempo real
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Stethoscope,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import motivosInterconsultaService from '../../../services/motivosInterconsultaService';

// ============================================================================
// DATOS INICIALES (Fallback si backend no responde)
// ============================================================================

const MOTIVOS_INICIALES = [
  { id: 1, codigo: 'SIN_ATENCION',                          descripcion: 'SIN ATENCIÓN',                          activo: true, orden: 1 },
  { id: 2, codigo: 'LABORATORIOS_COMPLETOS_SIN_ALTERACION', descripcion: 'LABORATORIOS COMPLETOS SIN ALTERACIÓN', activo: true, orden: 2 },
  { id: 3, codigo: 'SIN_LABORATORIOS',                      descripcion: 'SIN LABORATORIOS',                       activo: true, orden: 3 },
  { id: 4, codigo: 'SIN_TRATAMIENTO',                       descripcion: 'SIN TRATAMIENTO',                        activo: true, orden: 4 },
  { id: 5, codigo: 'TRATAMIENTO_INCOMPLETO',                descripcion: 'TRATAMIENTO INCOMPLETO',                 activo: true, orden: 5 },
  { id: 6, codigo: 'LABORATORIOS_ALTERADOS',                descripcion: 'LABORATORIOS ALTERADOS',                 activo: true, orden: 6 },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const MotivosInterconsulta = () => {
  // Estados principales
  const [motivos, setMotivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros con debounce
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [debouncedCodigo, setDebouncedCodigo] = useState('');
  const [debouncedDescripcion, setDebouncedDescripcion] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(30);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({ codigo: '', descripcion: '', orden: 0 });

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({ totalMotivos: 0, motivosActivos: 0, motivosInactivos: 0 });

  // ========================================================================
  // DEBOUNCE
  // ========================================================================

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedCodigo(filtroCodigo); setCurrentPage(0); }, 300);
    return () => clearTimeout(t);
  }, [filtroCodigo]);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedDescripcion(filtroDescripcion); setCurrentPage(0); }, 300);
    return () => clearTimeout(t);
  }, [filtroDescripcion]);

  // ========================================================================
  // CARGAR DATOS
  // ========================================================================

  const cargarMotivos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const busqueda = [debouncedCodigo, debouncedDescripcion].filter(Boolean).join(' ');
      const resultado = await motivosInterconsultaService.buscar(busqueda || null, null, currentPage, pageSize);
      setMotivos(resultado.content || []);
      setTotalElements(resultado.totalElements || 0);
      setTotalPages(resultado.totalPages || 0);
    } catch (err) {
      console.error('Error al cargar motivos:', err);
      setMotivos(MOTIVOS_INICIALES.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
      setTotalElements(MOTIVOS_INICIALES.length);
      setTotalPages(Math.ceil(MOTIVOS_INICIALES.length / pageSize));
    } finally {
      setLoading(false);
    }
  }, [debouncedCodigo, debouncedDescripcion, currentPage, pageSize]);

  useEffect(() => { cargarMotivos(); }, [cargarMotivos]);

  useEffect(() => {
    motivosInterconsultaService.obtenerEstadisticas()
      .then(stats => setEstadisticas(stats))
      .catch(() => setEstadisticas({
        totalMotivos: MOTIVOS_INICIALES.length,
        motivosActivos: MOTIVOS_INICIALES.length,
        motivosInactivos: 0
      }));
  }, []);

  // ========================================================================
  // HANDLERS CRUD
  // ========================================================================

  const abrirModalCrear = () => {
    setModalMode('create');
    setFormData({ codigo: '', descripcion: '', orden: 0 });
    setShowModal(true);
  };

  const abrirModalEditar = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({ codigo: item.codigo, descripcion: item.descripcion, orden: item.orden || 0 });
    setShowModal(true);
  };

  const abrirModalVer = (item) => { setSelectedItem(item); setShowViewModal(true); };
  const abrirModalEliminar = (item) => { setSelectedItem(item); setShowDeleteModal(true); };

  const cerrarModales = () => {
    setShowModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedItem(null);
    setFormData({ codigo: '', descripcion: '', orden: 0 });
  };

  const guardarMotivo = async () => {
    if (!formData.codigo.trim() || !formData.descripcion.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    try {
      if (modalMode === 'create') {
        await motivosInterconsultaService.crear(formData);
        alert('Motivo creado exitosamente');
      } else {
        await motivosInterconsultaService.actualizar(selectedItem.id, formData);
        alert('Motivo actualizado exitosamente');
      }
      cerrarModales();
      cargarMotivos();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const eliminarMotivo = async () => {
    try {
      await motivosInterconsultaService.eliminar(selectedItem.id);
      alert('Motivo eliminado exitosamente');
      cerrarModales();
      cargarMotivos();
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleEstado = async (item) => {
    try {
      await motivosInterconsultaService.cambiarEstado(item.id, !item.activo);
      cargarMotivos();
    } catch (err) {
      alert('Error al cambiar estado: ' + err.message);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Stethoscope size={24} className="text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Motivos de Interconsulta</h1>
          </div>
          <p className="text-gray-600">
            Gestión de motivos predefinidos para derivación de interconsulta (rol Enfermería)
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
            <p className="text-sm text-indigo-600 font-medium">Total de Motivos</p>
            <p className="text-2xl font-bold text-indigo-900">{estadisticas.totalMotivos}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Motivos Activos</p>
            <p className="text-2xl font-bold text-green-900">{estadisticas.motivosActivos}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-600 font-medium">Motivos Inactivos</p>
            <p className="text-2xl font-bold text-red-900">{estadisticas.motivosInactivos}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Código</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="SIN_ATENCION, LABORATORIOS..."
                  value={filtroCodigo}
                  onChange={(e) => setFiltroCodigo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Descripción</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sin atención, laboratorios..."
                  value={filtroDescripcion}
                  onChange={(e) => setFiltroDescripcion(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => { setFiltroCodigo(''); setFiltroDescripcion(''); setCurrentPage(0); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Botón nuevo + contador */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {motivos.length} de {totalElements} motivos
          </h2>
          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            <Plus size={20} />
            Nuevo Motivo
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Código</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Descripción</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Orden</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Estado</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-red-600">{error}</td>
                </tr>
              ) : motivos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No hay motivos de interconsulta registrados
                  </td>
                </tr>
              ) : (
                motivos.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition'}>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.codigo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.descripcion}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{item.orden}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleEstado(item)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                          item.activo
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirModalVer(item)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition"
                          title="Ver"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => abrirModalEditar(item)}
                          className="p-2 hover:bg-yellow-100 rounded-lg text-yellow-600 transition"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => abrirModalEliminar(item)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Página {currentPage + 1} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`px-3 py-1 rounded-lg ${currentPage === idx ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200'}`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Modal Crear/Editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {modalMode === 'create' ? 'Crear Motivo' : 'Editar Motivo'}
                </h2>
                <button onClick={cerrarModales} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    placeholder="SIN_ATENCION"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Texto del motivo que verá la enfermería"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden de visualización</label>
                  <input
                    type="number"
                    value={formData.orden}
                    onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button onClick={cerrarModales} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                  Cancelar
                </button>
                <button onClick={guardarMotivo} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  {modalMode === 'create' ? 'Crear' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ver */}
        {showViewModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Detalle del Motivo</h2>
                <button onClick={cerrarModales} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <p className="text-gray-900">{selectedItem.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Código</label>
                  <p className="text-gray-900 font-semibold">{selectedItem.codigo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <p className="text-gray-900">{selectedItem.descripcion}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Orden</label>
                  <p className="text-gray-900">{selectedItem.orden}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <p className={`font-semibold ${selectedItem.activo ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedItem.activo ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Creación</label>
                  <p className="text-gray-600 text-sm">
                    {selectedItem.fechaCreacion ? new Date(selectedItem.fechaCreacion).toLocaleString() : '-'}
                  </p>
                </div>
              </div>
              <button onClick={cerrarModales} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Modal Eliminar */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <h2 className="text-xl font-bold">Eliminar Motivo</h2>
              </div>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de eliminar el motivo <strong>{selectedItem?.codigo}</strong>?
                Será desactivado (eliminación lógica).
              </p>
              <div className="flex gap-2 justify-end">
                <button onClick={cerrarModales} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                  Cancelar
                </button>
                <button onClick={eliminarMotivo} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MotivosInterconsulta;
