/**
 * 📋 Componente: Estados de Gestión de Citas
 * v1.33.0 - Gestión CRUD de estados de citas
 *
 * Características:
 * - CRUD completo (Create, Read, Update, Delete)
 * - Búsqueda con debounce (300ms)
 * - Paginación backend (30 items/página)
 * - Modales para crear/editar/ver/eliminar
 * - Toggle de estado (A ↔ I)
 * - Validación de duplicados
 * - Datos iniciales: 10 estados predefinidos
 * - Estadísticas en tiempo real
 *
 * 10 Estados Iniciales:
 * 1. CITADO - Citado
 * 2. ATENDIDO_IPRESS - Atendido por IPRESS
 * 3. NO_CONTESTA - No contesta
 * 4. SIN_VIGENCIA - Sin vigencia de Seguro
 * 5. APAGADO - Apagado
 * 6. NO_DESEA - No desea
 * 7. REPROG_FALLIDA - Reprogramación Fallida
 * 8. NUM_NO_EXISTE - Numero no existe
 * 9. HC_BLOQUEADA - Historia clinica bloqueada
 * 10. TEL_SIN_SERVICIO - Teléfono sin servicio
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  FileCheck2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import estadosGestionCitasService from '../../../services/estadosGestionCitasService';

// ============================================================================
// 🎨 DATOS INICIALES (Fallback si backend no responde)
// ============================================================================

const ESTADOS_INICIALES = [
  {
    idEstadoCita: 1,
    codEstadoCita: 'CITADO',
    descEstadoCita: 'Citado - Paciente agendado para atención',
    statEstadoCita: 'A',
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  },
  {
    idEstadoCita: 2,
    codEstadoCita: 'ATENDIDO_IPRESS',
    descEstadoCita: 'Atendido por IPRESS - Paciente recibió atención en institución',
    statEstadoCita: 'A',
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  },
  {
    idEstadoCita: 3,
    codEstadoCita: 'NO_CONTESTA',
    descEstadoCita: 'No contesta - Paciente no responde a las llamadas',
    statEstadoCita: 'A',
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  },
  {
    idEstadoCita: 4,
    codEstadoCita: 'SIN_VIGENCIA',
    descEstadoCita: 'Sin vigencia de Seguro - Seguro del paciente no vigente',
    statEstadoCita: 'A',
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  },
  {
    idEstadoCita: 5,
    codEstadoCita: 'APAGADO',
    descEstadoCita: 'Apagado - Teléfono del paciente apagado',
    statEstadoCita: 'A',
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  },
  {
    idEstadoCita: 6,
    codEstadoCita: 'NO_DESEA',
    descEstadoCita: 'No desea - Paciente rechaza la atención',
    statEstadoCita: 'A',
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  },
  {
    idEstadoCita: 7,
    codEstadoCita: 'REPROG_FALLIDA',
    descEstadoCita: 'Reprogramación Fallida - No se pudo reprogramar la cita',
    statEstadoCita: 'A',
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  },
  {
    idEstadoCita: 8,
    codEstadoCita: 'NUM_NO_EXISTE',
    descEstadoCita: 'Número no existe - Teléfono registrado no existe',
    statEstadoCita: 'A',
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  },
  {
    idEstadoCita: 9,
    codEstadoCita: 'HC_BLOQUEADA',
    descEstadoCita: 'Historia clínica bloqueada - HC del paciente bloqueada en sistema',
    statEstadoCita: 'A',
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  },
  {
    idEstadoCita: 10,
    codEstadoCita: 'TEL_SIN_SERVICIO',
    descEstadoCita: 'Teléfono sin servicio - Línea telefónica sin servicio',
    statEstadoCita: 'A',
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  }
];

// ============================================================================
// 🔧 COMPONENTE PRINCIPAL
// ============================================================================

const EstadosGestionCitas = () => {
  // ========================================================================
  // 📊 ESTADOS PRINCIPALES
  // ========================================================================

  const [estados, setEstados] = useState([]);
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
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedItem, setSelectedItem] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({
    codEstadoCita: '',
    descEstadoCita: ''
  });

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalEstados: 0,
    estadosActivos: 0,
    estadosInactivos: 0
  });

  // ========================================================================
  // ⏱️ DEBOUNCE PARA BÚSQUEDA
  // ========================================================================

  useEffect(() => {
    const timerCodigo = setTimeout(() => {
      setDebouncedCodigo(filtroCodigo);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timerCodigo);
  }, [filtroCodigo]);

  useEffect(() => {
    const timerDescripcion = setTimeout(() => {
      setFiltroDescripcion(filtroDescripcion);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timerDescripcion);
  }, [filtroDescripcion]);

  // ========================================================================
  // 🔄 CARGAR DATOS
  // ========================================================================

  const cargarEstados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Combinar búsquedas en un solo término
      const busquedaCombinada = [debouncedCodigo, debouncedDescripcion]
        .filter(Boolean)
        .join(' ');

      const resultado = await estadosGestionCitasService.buscar(
        busquedaCombinada || null,
        null,
        currentPage,
        pageSize
      );

      setEstados(resultado.content || []);
      setTotalElements(resultado.totalElements || 0);
      setTotalPages(resultado.totalPages || 0);
    } catch (err) {
      console.error('Error al cargar estados:', err);
      setError('Error al cargar estados');
      // Fallback a datos iniciales
      setEstados(ESTADOS_INICIALES.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
      setTotalElements(ESTADOS_INICIALES.length);
      setTotalPages(Math.ceil(ESTADOS_INICIALES.length / pageSize));
    } finally {
      setLoading(false);
    }
  }, [debouncedCodigo, debouncedDescripcion, currentPage, pageSize]);

  // Cargar datos cuando cambien filtros o página
  useEffect(() => {
    cargarEstados();
  }, [cargarEstados]);

  // Cargar estadísticas
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const stats = await estadosGestionCitasService.obtenerEstadisticas();
        setEstadisticas(stats);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
        setEstadisticas({
          totalEstados: ESTADOS_INICIALES.length,
          estadosActivos: ESTADOS_INICIALES.length,
          estadosInactivos: 0
        });
      }
    };
    cargarEstadisticas();
  }, []);

  // ========================================================================
  // 📝 HANDLERS CRUD
  // ========================================================================

  const abrirModalCrear = () => {
    setModalMode('create');
    setFormData({ codEstadoCita: '', descEstadoCita: '' });
    setShowModal(true);
  };

  const abrirModalEditar = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({
      codEstadoCita: item.codEstadoCita,
      descEstadoCita: item.descEstadoCita
    });
    setShowModal(true);
  };

  const abrirModalVer = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const abrirModalEliminar = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const cerrarModales = () => {
    setShowModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedItem(null);
    setFormData({ codEstadoCita: '', descEstadoCita: '' });
  };

  const guardarEstado = async () => {
    if (!formData.codEstadoCita.trim() || !formData.descEstadoCita.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      if (modalMode === 'create') {
        await estadosGestionCitasService.crear(formData);
        alert('Estado creado exitosamente');
      } else {
        await estadosGestionCitasService.actualizar(selectedItem.idEstadoCita, formData);
        alert('Estado actualizado exitosamente');
      }
      cerrarModales();
      cargarEstados();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const eliminarEstado = async () => {
    try {
      await estadosGestionCitasService.eliminar(selectedItem.idEstadoCita);
      alert('Estado eliminado exitosamente');
      cerrarModales();
      cargarEstados();
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleEstado = async (item) => {
    try {
      const nuevoEstado = item.statEstadoCita === 'A' ? 'I' : 'A';
      await estadosGestionCitasService.cambiarEstado(item.idEstadoCita, nuevoEstado);
      cargarEstados();
    } catch (err) {
      alert('Error al cambiar estado: ' + err.message);
    }
  };

  // ========================================================================
  // 🎨 RENDER - HEADER
  // ========================================================================

  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileCheck2 size={24} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Estados Gestión Citas</h1>
      </div>
      <p className="text-gray-600">
        Gestión centralizada de estados para seguimiento de citas de pacientes
      </p>
    </div>
  );

  // ========================================================================
  // 🎨 RENDER - TARJETAS DE ESTADÍSTICAS
  // ========================================================================

  const renderEstadisticas = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-600 font-medium">Total de Estados</p>
        <p className="text-2xl font-bold text-blue-900">{estadisticas.totalEstados}</p>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
        <p className="text-sm text-green-600 font-medium">Estados Activos</p>
        <p className="text-2xl font-bold text-green-900">{estadisticas.estadosActivos}</p>
      </div>
      <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
        <p className="text-sm text-red-600 font-medium">Estados Inactivos</p>
        <p className="text-2xl font-bold text-red-900">{estadisticas.estadosInactivos}</p>
      </div>
    </div>
  );

  // ========================================================================
  // 🎨 RENDER - FILTROS Y BÚSQUEDA
  // ========================================================================

  const renderFiltros = () => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Código</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="CITADO, NO_CONTESTA, ..."
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Descripción</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Citado, No contesta, ..."
              value={filtroDescripcion}
              onChange={(e) => setFiltroDescripcion(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => {
              setFiltroCodigo('');
              setFiltroDescripcion('');
              setCurrentPage(0);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );

  // ========================================================================
  // 🎨 RENDER - BOTÓN NUEVO
  // ========================================================================

  const renderBotonNuevo = () => (
    <div className="mb-6 flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-800">
        {estados.length} de {totalElements} estados
      </h2>
      <button
        onClick={abrirModalCrear}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
      >
        <Plus size={20} />
        Nuevo Estado de Cita
      </button>
    </div>
  );

  // ========================================================================
  // 🎨 RENDER - TABLA
  // ========================================================================

  const renderTabla = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">Código</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Descripción</th>
            <th className="px-6 py-4 text-center text-sm font-semibold">Estado</th>
            <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="px-6 py-8 text-center">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="4" className="px-6 py-8 text-center text-red-600">
                {error}
              </td>
            </tr>
          ) : estados.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                No hay estados de citas
              </td>
            </tr>
          ) : (
            estados.map((item, idx) => (
              <tr
                key={item.idEstadoCita}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition'}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.codEstadoCita}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.descEstadoCita}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleEstado(item)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      item.statEstadoCita === 'A'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {item.statEstadoCita === 'A' ? '✓ Activo' : '✗ Inactivo'}
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
  );

  // ========================================================================
  // 🎨 RENDER - PAGINACIÓN
  // ========================================================================

  const renderPaginacion = () => (
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
            className={`px-3 py-1 rounded-lg ${
              currentPage === idx ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
            }`}
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
  );

  // ========================================================================
  // 🎨 RENDER - MODALES
  // ========================================================================

  const renderModalFormulario = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {modalMode === 'create' ? 'Crear Estado de Cita' : 'Editar Estado de Cita'}
          </h2>
          <button onClick={cerrarModales} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input
              type="text"
              value={formData.codEstadoCita}
              onChange={(e) => setFormData({ ...formData, codEstadoCita: e.target.value.toUpperCase() })}
              placeholder="NUEVO_ESTADO"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.descEstadoCita}
              onChange={(e) => setFormData({ ...formData, descEstadoCita: e.target.value })}
              placeholder="Descripción del estado"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={cerrarModales}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={guardarEstado}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {modalMode === 'create' ? 'Crear' : 'Actualizar'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderModalVer = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalle del Estado</h2>
          <button onClick={cerrarModales} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {selectedItem && (
          <div className="space-y-3 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Código</label>
              <p className="text-gray-900 font-semibold">{selectedItem.codEstadoCita}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <p className="text-gray-900">{selectedItem.descEstadoCita}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <p className={`font-semibold ${selectedItem.statEstadoCita === 'A' ? 'text-green-600' : 'text-red-600'}`}>
                {selectedItem.statEstadoCita === 'A' ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Creado</label>
              <p className="text-gray-600 text-sm">{new Date(selectedItem.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}

        <button
          onClick={cerrarModales}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  );

  const renderModalEliminar = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertCircle size={24} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold">Eliminar Estado</h2>
        </div>

        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar el estado <strong>{selectedItem?.codEstadoCita}</strong>?
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={cerrarModales}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={eliminarEstado}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );

  // ========================================================================
  // 🎨 RENDER - COMPONENTE COMPLETO
  // ========================================================================

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">
        {renderHeader()}
        {renderEstadisticas()}
        {renderFiltros()}
        {renderBotonNuevo()}
        {renderTabla()}
        {totalPages > 0 && renderPaginacion()}

        {showModal && renderModalFormulario()}
        {showViewModal && renderModalVer()}
        {showDeleteModal && renderModalEliminar()}
      </div>
    </div>
  );
};

export default EstadosGestionCitas;
