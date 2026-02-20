/**
 * Componente: Motivos de Mesa de Ayuda
 * v1.65.0 - Gestion CRUD de motivos mesa de ayuda
 *
 * Caracteristicas:
 * - CRUD completo (Create, Read, Update, Delete)
 * - Busqueda con debounce (300ms)
 * - Paginacion backend (30 items/pagina)
 * - Modales para crear/editar/ver/eliminar
 * - Toggle de estado (activo/inactivo) con booleano
 * - Validacion de duplicados
 * - Estadisticas en tiempo real
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
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import motivosMesaAyudaService from '../../../services/motivosMesaAyudaService';

// ============================================================================
// DATOS INICIALES (Fallback si backend no responde)
// ============================================================================

const MOTIVOS_INICIALES = [
  { id: 1, codigo: 'PS_CITAR_ADICIONAL', descripcion: 'Citar paciente adicional', activo: true, orden: 1, fechaCreacion: '2026-02-18T00:00:00Z' },
  { id: 2, codigo: 'PS_ACTUALIZAR_LISTADO', descripcion: 'Actualizar listado de pacientes', activo: true, orden: 2, fechaCreacion: '2026-02-18T00:00:00Z' },
  { id: 3, codigo: 'PS_CONTACTAR_DESERCION', descripcion: 'Contactar paciente para evitar desercion', activo: true, orden: 3, fechaCreacion: '2026-02-18T00:00:00Z' },
  { id: 4, codigo: 'PS_ELIMINAR_EXCEDENTE', descripcion: 'Eliminar paciente excedente', activo: true, orden: 4, fechaCreacion: '2026-02-18T00:00:00Z' },
  { id: 5, codigo: 'PS_ENVIO_ACTO_MEDICO', descripcion: 'Enviar acto medico / receta / referencia', activo: true, orden: 5, fechaCreacion: '2026-02-18T00:00:00Z' },
  { id: 6, codigo: 'PS_ENVIO_IMAGENES', descripcion: 'Envio de imagenes / resultados', activo: true, orden: 6, fechaCreacion: '2026-02-18T00:00:00Z' },
  { id: 7, codigo: 'PS_PROG_CITA_ADICIONAL', descripcion: 'Programacion de cita adicional', activo: true, orden: 7, fechaCreacion: '2026-02-18T00:00:00Z' },
];

// ============================================================================
// HELPERS
// ============================================================================

const PRIORIDAD_CONFIG = {
  ALTA:  { label: 'Alta',  className: 'bg-red-100 text-red-800' },
  MEDIA: { label: 'Media', className: 'bg-amber-100 text-amber-800' },
  BAJA:  { label: 'Baja',  className: 'bg-green-100 text-green-800' },
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const MotivosMesaAyuda = () => {
  // ========================================================================
  // ESTADOS PRINCIPALES
  // ========================================================================

  const [motivos, setMotivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros con debounce
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [debouncedCodigo, setDebouncedCodigo] = useState('');
  const [debouncedDescripcion, setDebouncedDescripcion] = useState('');

  // Paginacion
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
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    orden: 0,
    prioridad: 'MEDIA'
  });

  // Estadisticas
  const [estadisticas, setEstadisticas] = useState({
    totalMotivos: 0,
    motivosActivos: 0,
    motivosInactivos: 0
  });

  // ========================================================================
  // DEBOUNCE PARA BUSQUEDA
  // ========================================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCodigo(filtroCodigo);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [filtroCodigo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDescripcion(filtroDescripcion);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [filtroDescripcion]);

  // ========================================================================
  // CARGAR DATOS
  // ========================================================================

  const cargarMotivos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const busquedaCombinada = [debouncedCodigo, debouncedDescripcion]
        .filter(Boolean)
        .join(' ');

      const resultado = await motivosMesaAyudaService.buscar(
        busquedaCombinada || null,
        null,
        currentPage,
        pageSize
      );

      setMotivos(resultado.content || []);
      setTotalElements(resultado.totalElements || 0);
      setTotalPages(resultado.totalPages || 0);
    } catch (err) {
      console.error('Error al cargar motivos:', err);
      setError('Error al cargar motivos');
      setMotivos(MOTIVOS_INICIALES.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
      setTotalElements(MOTIVOS_INICIALES.length);
      setTotalPages(Math.ceil(MOTIVOS_INICIALES.length / pageSize));
    } finally {
      setLoading(false);
    }
  }, [debouncedCodigo, debouncedDescripcion, currentPage, pageSize]);

  useEffect(() => {
    cargarMotivos();
  }, [cargarMotivos]);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const stats = await motivosMesaAyudaService.obtenerEstadisticas();
        setEstadisticas(stats);
      } catch (err) {
        console.error('Error al cargar estadisticas:', err);
        setEstadisticas({
          totalMotivos: MOTIVOS_INICIALES.length,
          motivosActivos: MOTIVOS_INICIALES.length,
          motivosInactivos: 0
        });
      }
    };
    cargarEstadisticas();
  }, []);

  // ========================================================================
  // HANDLERS CRUD
  // ========================================================================

  const abrirModalCrear = () => {
    setModalMode('create');
    setFormData({ codigo: '', descripcion: '', orden: 0, prioridad: 'MEDIA' });
    setShowModal(true);
  };

  const abrirModalEditar = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({
      codigo: item.codigo,
      descripcion: item.descripcion,
      orden: item.orden || 0,
      prioridad: item.prioridad || 'MEDIA'
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
    setFormData({ codigo: '', descripcion: '', orden: 0, prioridad: 'MEDIA' });
  };

  const guardarMotivo = async () => {
    if (!formData.codigo.trim() || !formData.descripcion.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      if (modalMode === 'create') {
        await motivosMesaAyudaService.crear(formData);
        alert('Motivo creado exitosamente');
      } else {
        await motivosMesaAyudaService.actualizar(selectedItem.id, formData);
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
      await motivosMesaAyudaService.eliminar(selectedItem.id);
      alert('Motivo eliminado exitosamente');
      cerrarModales();
      cargarMotivos();
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleEstado = async (item) => {
    try {
      const nuevoEstado = !item.activo;
      await motivosMesaAyudaService.cambiarEstado(item.id, nuevoEstado);
      cargarMotivos();
    } catch (err) {
      alert('Error al cambiar estado: ' + err.message);
    }
  };

  // ========================================================================
  // RENDER - HEADER
  // ========================================================================

  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MessageSquare size={24} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Motivos Mesa de Ayuda</h1>
      </div>
      <p className="text-gray-600">
        Gestion centralizada de motivos predefinidos para tickets de mesa de ayuda
      </p>
    </div>
  );

  // ========================================================================
  // RENDER - TARJETAS DE ESTADISTICAS
  // ========================================================================

  const renderEstadisticas = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-600 font-medium">Total de Motivos</p>
        <p className="text-2xl font-bold text-blue-900">{estadisticas.totalMotivos}</p>
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
  );

  // ========================================================================
  // RENDER - FILTROS Y BUSQUEDA
  // ========================================================================

  const renderFiltros = () => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Codigo</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="PS_CITAR_ADICIONAL, ..."
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Descripcion</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Citar paciente, Enviar acto medico, ..."
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
  // RENDER - BOTON NUEVO
  // ========================================================================

  const renderBotonNuevo = () => (
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
  );

  // ========================================================================
  // RENDER - TABLA
  // ========================================================================

  const renderTabla = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Codigo</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Descripcion</th>
            <th className="px-6 py-4 text-center text-sm font-semibold">Orden</th>
            <th className="px-6 py-4 text-center text-sm font-semibold">Prioridad</th>
            <th className="px-6 py-4 text-center text-sm font-semibold">Estado</th>
            <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-red-600">
                {error}
              </td>
            </tr>
          ) : motivos.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                No hay motivos de mesa de ayuda
              </td>
            </tr>
          ) : (
            motivos.map((item, idx) => (
              <tr
                key={item.id}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition'}
              >
                <td className="px-6 py-4 text-sm text-gray-500">{item.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.codigo}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.descripcion}</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">{item.orden}</td>
                <td className="px-6 py-4 text-center">
                  {(() => {
                    const cfg = PRIORIDAD_CONFIG[item.prioridad] || PRIORIDAD_CONFIG.MEDIA;
                    return (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    );
                  })()}
                </td>
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
  );

  // ========================================================================
  // RENDER - PAGINACION
  // ========================================================================

  const renderPaginacion = () => (
    <div className="flex justify-between items-center">
      <p className="text-sm text-gray-600">
        Pagina {currentPage + 1} de {totalPages}
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
  // RENDER - MODALES
  // ========================================================================

  const renderModalFormulario = () => (
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Codigo</label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
              placeholder="PS_NUEVO_MOTIVO"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripcion del motivo"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <input
              type="number"
              value={formData.orden}
              onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <select
              value={formData.prioridad}
              onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Media</option>
              <option value="BAJA">Baja</option>
            </select>
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
            onClick={guardarMotivo}
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
          <h2 className="text-xl font-bold">Detalle del Motivo</h2>
          <button onClick={cerrarModales} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {selectedItem && (
          <div className="space-y-3 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID</label>
              <p className="text-gray-900">{selectedItem.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Codigo</label>
              <p className="text-gray-900 font-semibold">{selectedItem.codigo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripcion</label>
              <p className="text-gray-900">{selectedItem.descripcion}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Orden</label>
              <p className="text-gray-900">{selectedItem.orden}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prioridad</label>
              {(() => {
                const cfg = PRIORIDAD_CONFIG[selectedItem.prioridad] || PRIORIDAD_CONFIG.MEDIA;
                return (
                  <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
                    {cfg.label}
                  </span>
                );
              })()}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <p className={`font-semibold ${selectedItem.activo ? 'text-green-600' : 'text-red-600'}`}>
                {selectedItem.activo ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Creacion</label>
              <p className="text-gray-600 text-sm">{selectedItem.fechaCreacion ? new Date(selectedItem.fechaCreacion).toLocaleString() : '-'}</p>
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
          <h2 className="text-xl font-bold">Eliminar Motivo</h2>
        </div>

        <p className="text-gray-600 mb-6">
          ¿Estas seguro de que deseas eliminar el motivo <strong>{selectedItem?.codigo}</strong>?
          El motivo sera desactivado (eliminacion logica).
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={cerrarModales}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={eliminarMotivo}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );

  // ========================================================================
  // RENDER - COMPONENTE COMPLETO
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

export default MotivosMesaAyuda;
