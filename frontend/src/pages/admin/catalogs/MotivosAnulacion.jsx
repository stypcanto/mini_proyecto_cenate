/**
 * Componente: Motivos de Anulación de Citas
 * v1.85.27 - CRUD de motivos predefinidos para anular citas desde Mesa de Ayuda
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Eye, Edit2, Trash2, X, AlertCircle,
  XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import motivosAnulacionService from '../../../services/motivosAnulacionService';

const MOTIVOS_INICIALES = [
  { id: 1,  codigo: 'YA_ATENDIDO_OTRA_VIA',       descripcion: 'El paciente ya fue atendido por otra vía (emergencia, presencial) y la teleconsulta ya no es necesaria', activo: true, orden: 1  },
  { id: 2,  codigo: 'REQUIERE_MAYOR_COMPLEJIDAD',  descripcion: 'El estado del paciente requiere una atención de mayor complejidad o presencialidad', activo: true, orden: 2  },
  { id: 3,  codigo: 'CITA_DUPLICADA_ERROR',        descripcion: 'El profesional detecta que la cita fue duplicada o registrada por error', activo: true, orden: 3  },
  { id: 4,  codigo: 'EMERGENCIA_MEDICO',           descripcion: 'El profesional tiene una emergencia médica o incapacidad imprevista', activo: true, orden: 4  },
  { id: 5,  codigo: 'FALLA_TECNICA',               descripcion: 'Falla técnica que imposibilita la teleconsulta (conectividad, equipo)', activo: true, orden: 5  },
  { id: 6,  codigo: 'PACIENTE_NO_CONECTADO',       descripcion: 'El paciente no se conectó y no hubo comunicación previa', activo: true, orden: 6  },
  { id: 7,  codigo: 'CAMBIO_TURNO_NO_COORDINADO',  descripcion: 'Cambio de turno o reemplazo de médico no coordinado a tiempo', activo: true, orden: 7  },
  { id: 8,  codigo: 'IPRESS_INCORRECTA',           descripcion: 'La cita fue generada en un IPRESS incorrecto o fuera de la Red correspondiente', activo: true, orden: 8  },
  { id: 9,  codigo: 'NO_CUMPLE_CRITERIOS',         descripcion: 'El paciente no cumple los criterios de atención por telemedicina para ese servicio', activo: true, orden: 9  },
  { id: 10, codigo: 'SOLICITUD_PACIENTE',          descripcion: 'Solicitud expresa del paciente canalizada a través del profesional', activo: true, orden: 10 },
  { id: 11, codigo: 'VENCIMIENTO_HORARIO',         descripcion: 'Vencimiento del horario sin que el paciente se haya presentado', activo: true, orden: 11 },
];

const MotivosAnulacion = () => {
  const [motivos, setMotivos]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error,   setError]           = useState(null);

  const [filtroCodigo,      setFiltroCodigo]      = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [debouncedCodigo,   setDebouncedCodigo]   = useState('');
  const [debouncedDesc,     setDebouncedDesc]     = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 30;
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);

  const [showModal,       setShowModal]       = useState(false);
  const [showViewModal,   setShowViewModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode,       setModalMode]       = useState('create');
  const [selectedItem,    setSelectedItem]    = useState(null);

  const [formData, setFormData] = useState({ codigo: '', descripcion: '', orden: 0 });

  const [estadisticas, setEstadisticas] = useState({ totalMotivos: 0, motivosActivos: 0, motivosInactivos: 0 });

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedCodigo(filtroCodigo); setCurrentPage(0); }, 300);
    return () => clearTimeout(t);
  }, [filtroCodigo]);
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedDesc(filtroDescripcion); setCurrentPage(0); }, 300);
    return () => clearTimeout(t);
  }, [filtroDescripcion]);

  const cargarMotivos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const busqueda = [debouncedCodigo, debouncedDesc].filter(Boolean).join(' ');
      const res = await motivosAnulacionService.buscar(busqueda || null, null, currentPage, pageSize);
      setMotivos(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 0);
    } catch {
      setMotivos(MOTIVOS_INICIALES.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
      setTotalElements(MOTIVOS_INICIALES.length);
      setTotalPages(Math.ceil(MOTIVOS_INICIALES.length / pageSize));
    } finally {
      setLoading(false);
    }
  }, [debouncedCodigo, debouncedDesc, currentPage]);

  useEffect(() => { cargarMotivos(); }, [cargarMotivos]);

  useEffect(() => {
    motivosAnulacionService.obtenerEstadisticas()
      .then(s => setEstadisticas(s))
      .catch(() => setEstadisticas({
        totalMotivos:     MOTIVOS_INICIALES.length,
        motivosActivos:   MOTIVOS_INICIALES.length,
        motivosInactivos: 0
      }));
  }, []);

  const abrirModalCrear    = () => { setModalMode('create'); setFormData({ codigo: '', descripcion: '', orden: 0 }); setShowModal(true); };
  const abrirModalEditar   = (item) => { setModalMode('edit'); setSelectedItem(item); setFormData({ codigo: item.codigo, descripcion: item.descripcion, orden: item.orden || 0 }); setShowModal(true); };
  const abrirModalVer      = (item) => { setSelectedItem(item); setShowViewModal(true); };
  const abrirModalEliminar = (item) => { setSelectedItem(item); setShowDeleteModal(true); };

  const cerrarModales = () => {
    setShowModal(false); setShowViewModal(false); setShowDeleteModal(false);
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
        await motivosAnulacionService.crear(formData);
        alert('Motivo creado exitosamente');
      } else {
        await motivosAnulacionService.actualizar(selectedItem.id, formData);
        alert('Motivo actualizado exitosamente');
      }
      cerrarModales(); cargarMotivos();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const eliminarMotivo = async () => {
    try {
      await motivosAnulacionService.eliminar(selectedItem.id);
      alert('Motivo eliminado exitosamente');
      cerrarModales(); cargarMotivos();
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleEstado = async (item) => {
    try {
      await motivosAnulacionService.cambiarEstado(item.id, !item.activo);
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
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle size={24} className="text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Motivos de Anulación de Citas</h1>
          </div>
          <p className="text-gray-600">
            Catálogo de motivos predefinidos para cancelar citas desde el módulo Mesa de Ayuda
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-50    to-red-100    p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-600    font-medium">Total de Motivos</p>
            <p className="text-2xl font-bold text-red-900">{estadisticas.totalMotivos}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50  to-green-100  p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600  font-medium">Motivos Activos</p>
            <p className="text-2xl font-bold text-green-900">{estadisticas.motivosActivos}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50   to-gray-100   p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600   font-medium">Motivos Inactivos</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.motivosInactivos}</p>
          </div>
        </div>

        {/* Filtros + Botón */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Código</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder="FALLA_TECNICA, IPRESS_INCORRECTA..." value={filtroCodigo}
                  onChange={(e) => setFiltroCodigo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Descripción</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder="falla técnica, paciente..." value={filtroDescripcion}
                  onChange={(e) => setFiltroDescripcion(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <button
              onClick={abrirModalCrear}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium whitespace-nowrap"
            >
              <Plus size={18} /> Nuevo Motivo
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start text-sm text-red-800">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
            {totalElements} motivo{totalElements !== 1 ? 's' : ''} encontrado{totalElements !== 1 ? 's' : ''}
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando...</div>
          ) : motivos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No se encontraron motivos</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-red-600 text-white text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left w-10">ID</th>
                  <th className="px-4 py-3 text-left w-56">Código</th>
                  <th className="px-4 py-3 text-left">Descripción</th>
                  <th className="px-4 py-3 text-center w-16">Orden</th>
                  <th className="px-4 py-3 text-center w-24">Estado</th>
                  <th className="px-4 py-3 text-center w-28">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {motivos.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{m.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{m.codigo}</td>
                    <td className="px-4 py-3 text-gray-800 leading-snug">{m.descripcion}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{m.orden}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleEstado(m)}
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          m.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {m.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => abrirModalVer(m)}      title="Ver"     className="p-1.5 text-blue-600  hover:bg-blue-50  rounded"><Eye   size={15}/></button>
                        <button onClick={() => abrirModalEditar(m)}    title="Editar"  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"><Edit2  size={15}/></button>
                        <button onClick={() => abrirModalEliminar(m)}  title="Eliminar"className="p-1.5 text-red-600   hover:bg-red-50   rounded"><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
              <span className="text-gray-500">Página {currentPage + 1} de {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}
                  className="p-1.5 border rounded disabled:opacity-40 hover:bg-gray-50">
                  <ChevronLeft size={16}/>
                </button>
                <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}
                  className="p-1.5 border rounded disabled:opacity-40 hover:bg-gray-50">
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                {modalMode === 'create' ? 'Nuevo Motivo de Anulación' : 'Editar Motivo'}
              </h2>
              <button onClick={cerrarModales} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Código <span className="text-red-500">*</span></label>
                <input type="text" value={formData.codigo}
                  onChange={(e) => setFormData(p => ({ ...p, codigo: e.target.value.toUpperCase().replace(/\s/g, '_') }))}
                  placeholder="FALLA_TECNICA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                <textarea value={formData.descripcion}
                  onChange={(e) => setFormData(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Describe el motivo de anulación..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Orden</label>
                <input type="number" value={formData.orden}
                  onChange={(e) => setFormData(p => ({ ...p, orden: parseInt(e.target.value) || 0 }))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 border-t">
              <button onClick={cerrarModales} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={guardarMotivo} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
                {modalMode === 'create' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Detalle del Motivo</h2>
              <button onClick={cerrarModales} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500 font-medium mb-0.5">ID</p><p className="text-gray-900">{selectedItem.id}</p></div>
                <div><p className="text-xs text-gray-500 font-medium mb-0.5">Orden</p><p className="text-gray-900">{selectedItem.orden}</p></div>
              </div>
              <div><p className="text-xs text-gray-500 font-medium mb-0.5">Código</p><p className="font-mono text-gray-900">{selectedItem.codigo}</p></div>
              <div><p className="text-xs text-gray-500 font-medium mb-0.5">Descripción</p><p className="text-gray-900 leading-snug">{selectedItem.descripcion}</p></div>
              <div><p className="text-xs text-gray-500 font-medium mb-0.5">Estado</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedItem.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {selectedItem.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              {selectedItem.fechaCreacion && (
                <div><p className="text-xs text-gray-500 font-medium mb-0.5">Fecha Creación</p>
                  <p className="text-gray-900">{new Date(selectedItem.fechaCreacion).toLocaleString('es-ES')}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end px-6 py-4 border-t">
              <button onClick={cerrarModales} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h2>
              <button onClick={cerrarModales} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700 mb-3">
                ¿Estás seguro de que deseas desactivar este motivo?
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                <p className="font-mono text-gray-700">{selectedItem.codigo}</p>
                <p className="text-gray-600 text-xs mt-1 leading-snug">{selectedItem.descripcion}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 border-t">
              <button onClick={cerrarModales} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={eliminarMotivo} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Desactivar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotivosAnulacion;
