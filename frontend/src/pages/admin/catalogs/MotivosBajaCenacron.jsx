/**
 * Componente: Motivos de Baja CENACRON
 * v1.83.0 - CRUD de motivos para dar de baja del programa CENACRON
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Eye, Edit2, Trash2, X, AlertCircle,
  HeartPulse, ChevronLeft, ChevronRight
} from 'lucide-react';
import motivosBajaCenacronService from '../../../services/motivosBajaCenacronService';

const MOTIVOS_FALLBACK = [
  { id: 1, codigo: 'SIN_DIAGNOSTICO_CIE10',  descripcion: 'Paciente no cuenta con diagnóstico registrado en la lista DX CIE 10 del programa.', activo: true, orden: 1 },
  { id: 2, codigo: 'FUERA_RANGO_EDAD',        descripcion: 'Paciente no se encuentra en el rango de edad de 30 a 77 años.',                     activo: true, orden: 2 },
  { id: 3, codigo: 'INSCRITO_PADOMI_CEDIH',   descripcion: 'Paciente se encuentra inscrito en PADOMI o CEDIH.',                                  activo: true, orden: 3 },
  { id: 4, codigo: 'REFERENCIA_ACTIVA',       descripcion: 'Paciente presenta referencia activa.',                                               activo: true, orden: 4 },
  { id: 5, codigo: 'PERIODO_CARENCIA',        descripcion: 'Paciente se encuentra dentro del periodo de carencia.',                              activo: true, orden: 5 },
  { id: 6, codigo: 'FUERA_AREA_ADSCRIPCION',  descripcion: 'Paciente se encuentra fuera del área de adscripción.',                               activo: true, orden: 6 },
  { id: 7, codigo: 'CUENTA_EPS',              descripcion: 'Paciente cuenta con EPS.',                                                           activo: true, orden: 7 },
  { id: 8, codigo: 'CONDICION_GESTANTE',      descripcion: 'Paciente se encuentra en condición de gestante.',                                    activo: true, orden: 8 },
];

const MotivosBajaCenacron = () => {
  const [motivos, setMotivos]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const [filtroCodigo, setFiltroCodigo]           = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [debouncedCodigo, setDebouncedCodigo]     = useState('');
  const [debouncedDesc, setDebouncedDesc]         = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize]                    = useState(30);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages]   = useState(0);

  const [showModal, setShowModal]           = useState(false);
  const [showViewModal, setShowViewModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode]           = useState('create');
  const [selectedItem, setSelectedItem]     = useState(null);

  const [formData, setFormData] = useState({ codigo: '', descripcion: '', orden: 0 });
  const [estadisticas, setEstadisticas] = useState({ totalMotivos: 0, motivosActivos: 0, motivosInactivos: 0 });

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedCodigo(filtroCodigo); setCurrentPage(0); }, 300);
    return () => clearTimeout(t);
  }, [filtroCodigo]);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedDesc(filtroDescripcion); setCurrentPage(0); }, 300);
    return () => clearTimeout(t);
  }, [filtroDescripcion]);

  const cargarMotivos = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const busqueda = [debouncedCodigo, debouncedDesc].filter(Boolean).join(' ');
      const resultado = await motivosBajaCenacronService.buscar(busqueda || null, null, currentPage, pageSize);
      setMotivos(resultado.content || []);
      setTotalElements(resultado.totalElements || 0);
      setTotalPages(resultado.totalPages || 0);
    } catch {
      setMotivos(MOTIVOS_FALLBACK.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
      setTotalElements(MOTIVOS_FALLBACK.length);
      setTotalPages(Math.ceil(MOTIVOS_FALLBACK.length / pageSize));
    } finally {
      setLoading(false);
    }
  }, [debouncedCodigo, debouncedDesc, currentPage, pageSize]);

  useEffect(() => { cargarMotivos(); }, [cargarMotivos]);

  useEffect(() => {
    motivosBajaCenacronService.obtenerEstadisticas()
      .then(s => setEstadisticas(s))
      .catch(() => setEstadisticas({ totalMotivos: MOTIVOS_FALLBACK.length, motivosActivos: MOTIVOS_FALLBACK.length, motivosInactivos: 0 }));
  }, []);

  const abrirModalCrear   = () => { setModalMode('create'); setFormData({ codigo: '', descripcion: '', orden: 0 }); setShowModal(true); };
  const abrirModalEditar  = (item) => { setModalMode('edit'); setSelectedItem(item); setFormData({ codigo: item.codigo, descripcion: item.descripcion, orden: item.orden || 0 }); setShowModal(true); };
  const abrirModalVer     = (item) => { setSelectedItem(item); setShowViewModal(true); };
  const abrirModalEliminar = (item) => { setSelectedItem(item); setShowDeleteModal(true); };

  const cerrarModales = () => {
    setShowModal(false); setShowViewModal(false); setShowDeleteModal(false);
    setSelectedItem(null); setFormData({ codigo: '', descripcion: '', orden: 0 });
  };

  const guardarMotivo = async () => {
    if (!formData.codigo.trim() || !formData.descripcion.trim()) {
      alert('Por favor completa los campos obligatorios'); return;
    }
    try {
      if (modalMode === 'create') {
        await motivosBajaCenacronService.crear(formData);
        alert('Motivo creado exitosamente');
      } else {
        await motivosBajaCenacronService.actualizar(selectedItem.id, formData);
        alert('Motivo actualizado exitosamente');
      }
      cerrarModales(); cargarMotivos();
      motivosBajaCenacronService.obtenerEstadisticas().then(s => setEstadisticas(s)).catch(() => {});
    } catch (err) {
      alert('Error: ' + (err.message || 'Error desconocido'));
    }
  };

  const eliminarMotivo = async () => {
    try {
      await motivosBajaCenacronService.eliminar(selectedItem.id);
      alert('Motivo eliminado exitosamente');
      cerrarModales(); cargarMotivos();
      motivosBajaCenacronService.obtenerEstadisticas().then(s => setEstadisticas(s)).catch(() => {});
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const toggleEstado = async (item) => {
    try {
      await motivosBajaCenacronService.cambiarEstado(item.id, !item.activo);
      cargarMotivos();
    } catch (err) {
      alert('Error al cambiar estado: ' + err.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <HeartPulse size={24} className="text-teal-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Motivos de Baja CENACRON</h1>
          </div>
          <p className="text-gray-600">
            Catálogo de motivos clínicos para dar de baja a un paciente del programa CENACRON
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
            <p className="text-sm text-teal-600 font-medium">Total de Motivos</p>
            <p className="text-2xl font-bold text-teal-900">{estadisticas.totalMotivos}</p>
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
                <input type="text" placeholder="SIN_DIAGNOSTICO_CIE10..."
                  value={filtroCodigo} onChange={e => setFiltroCodigo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Descripción</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder="diabetes, gestante, EPS..."
                  value={filtroDescripcion} onChange={e => setFiltroDescripcion(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={() => { setFiltroCodigo(''); setFiltroDescripcion(''); setCurrentPage(0); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Contador + Botón nuevo */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {motivos.length} de {totalElements} motivos
          </h2>
          <button onClick={abrirModalCrear}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
            <Plus size={20} /> Nuevo Motivo
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
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
                <tr><td colSpan="6" className="px-6 py-8 text-center">
                  <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" /></div>
                </td></tr>
              ) : error ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-red-600">{error}</td></tr>
              ) : motivos.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No hay motivos de baja CENACRON registrados</td></tr>
              ) : motivos.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition'}>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.id}</td>
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{item.codigo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md">{item.descripcion}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{item.orden}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleEstado(item)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        item.activo ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}>
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirModalVer(item)} className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition" title="Ver"><Eye size={18} /></button>
                      <button onClick={() => abrirModalEditar(item)} className="p-2 hover:bg-yellow-100 rounded-lg text-yellow-600 transition" title="Editar"><Edit2 size={18} /></button>
                      <button onClick={() => abrirModalEliminar(item)} className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition" title="Eliminar"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Página {currentPage + 1} de {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={20} /></button>
              {[...Array(Math.min(totalPages, 10))].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i)}
                  className={`px-3 py-1 rounded-lg ${currentPage === i ? 'bg-teal-600 text-white' : 'hover:bg-gray-200'}`}>{i + 1}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight size={20} /></button>
            </div>
          </div>
        )}

        {/* Modal Crear/Editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[480px] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{modalMode === 'create' ? 'Nuevo Motivo de Baja' : 'Editar Motivo'}</h2>
                <button onClick={cerrarModales} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.codigo}
                    onChange={e => setFormData({ ...formData, codigo: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                    placeholder="SIN_DIAGNOSTICO_CIE10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">Sin espacios, usa guiones bajos</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                  <textarea value={formData.descripcion}
                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Texto del motivo que verá el médico al dar de baja al paciente"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden de visualización</label>
                  <input type="number" value={formData.orden} min="0"
                    onChange={e => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={cerrarModales} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Cancelar</button>
                <button onClick={guardarMotivo} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  {modalMode === 'create' ? 'Crear' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ver */}
        {showViewModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[480px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Detalle del Motivo</h2>
                <button onClick={cerrarModales} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>
              <div className="space-y-3 mb-6">
                <div><label className="block text-sm font-medium text-gray-500">ID</label><p className="text-gray-900">{selectedItem.id}</p></div>
                <div><label className="block text-sm font-medium text-gray-500">Código</label><p className="text-gray-900 font-mono font-semibold">{selectedItem.codigo}</p></div>
                <div><label className="block text-sm font-medium text-gray-500">Descripción</label><p className="text-gray-900">{selectedItem.descripcion}</p></div>
                <div><label className="block text-sm font-medium text-gray-500">Orden</label><p className="text-gray-900">{selectedItem.orden}</p></div>
                <div><label className="block text-sm font-medium text-gray-500">Estado</label>
                  <p className={`font-semibold ${selectedItem.activo ? 'text-green-600' : 'text-red-600'}`}>{selectedItem.activo ? 'Activo' : 'Inactivo'}</p>
                </div>
                <div><label className="block text-sm font-medium text-gray-500">Fecha Creación</label>
                  <p className="text-gray-600 text-sm">{selectedItem.fechaCreacion ? new Date(selectedItem.fechaCreacion).toLocaleString('es-PE') : '—'}</p>
                </div>
              </div>
              <button onClick={cerrarModales} className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Cerrar</button>
            </div>
          </div>
        )}

        {/* Modal Eliminar */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-lg"><AlertCircle size={24} className="text-red-600" /></div>
                <h2 className="text-xl font-bold">Eliminar Motivo</h2>
              </div>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de eliminar el motivo <strong>{selectedItem?.codigo}</strong>?
                Será desactivado (eliminación lógica).
              </p>
              <div className="flex gap-2 justify-end">
                <button onClick={cerrarModales} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Cancelar</button>
                <button onClick={eliminarMotivo} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Eliminar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MotivosBajaCenacron;
