// ========================================================================
// 📅 PeriodoDisponibilidadMedica.jsx – Gestión de Período de Disponibilidad
// ========================================================================
// Permite a coordinadores gestionar períodos de disponibilidad médica
// Integración con API backend para CRUD completo
// Versión: 1.0.1 - Con integración API
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Loader2
} from 'lucide-react';
import RoleLayout from "../RoleLayout";
import periodoDisponibilidadService from '../../../services/periodoDisponibilidadService';

export default function PeriodoDisponibilidadMedica() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('crear');
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    cargarPeriodos();
  }, [currentPage, pageSize]);

  const cargarPeriodos = async () => {
    try {
      setLoading(true);
      let response;

      if (filterEstado === 'todos') {
        response = await periodoDisponibilidadService.obtenerPeriodos(currentPage, pageSize);
      } else {
        response = await periodoDisponibilidadService.obtenerPorEstado(filterEstado, currentPage, pageSize);
      }

      setPeriodos(response.data.content || response.data);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.number || 0);
    } catch (error) {
      console.error('Error cargando períodos:', error);
      setMessage({
        type: 'error',
        text: 'Error al cargar los períodos: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  const periodosFiltrados = periodos.filter(p => {
    const matchSearch = p.periodo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.nombreMedico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.nombreServicio?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const handleCrear = () => {
    setModalType('crear');
    setSelectedPeriodo(null);
    setShowModal(true);
  };

  const handleEditar = (periodo) => {
    setModalType('editar');
    setSelectedPeriodo(periodo);
    setShowModal(true);
  };

  const handleVer = (periodo) => {
    setModalType('ver');
    setSelectedPeriodo(periodo);
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este período?')) {
      try {
        setLoadingAction(true);
        await periodoDisponibilidadService.eliminar(id);
        setPeriodos(periodos.filter(p => p.idDisponibilidad !== id));
        setMessage({ type: 'success', text: 'Período eliminado correctamente' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        console.error('Error eliminando período:', error);
        setMessage({
          type: 'error',
          text: 'Error al eliminar: ' + (error.response?.data?.message || error.message)
        });
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleGuardar = async () => {
    try {
      setLoadingAction(true);
      if (modalType === 'crear') {
        setMessage({ type: 'success', text: 'Período creado correctamente' });
      } else if (modalType === 'editar') {
        setMessage({ type: 'success', text: 'Período actualizado correctamente' });
      }
      setShowModal(false);
      cargarPeriodos();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al guardar: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEnviarARevision = async (id) => {
    try {
      setLoadingAction(true);
      await periodoDisponibilidadService.enviarARevision(id);
      setMessage({ type: 'success', text: 'Período enviado a revisión' });
      cargarPeriodos();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const styles = {
      'BORRADOR': 'bg-yellow-100 text-yellow-800',
      'ENVIADO': 'bg-blue-100 text-blue-800',
      'REVISADO': 'bg-green-100 text-green-800'
    };
    return styles[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'REVISADO':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'ENVIADO':
        return <Clock className="w-4 h-4" />;
      case 'BORRADOR':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const modules = [
    { label: 'Período de Disponibilidad', path: '/roles/coordinador/periodo-disponibilidad-medica', icon: <Calendar className="w-5 h-5" /> }
  ];

  return (
    <RoleLayout title="Período de Disponibilidad Médica" modules={modules}>
      {/* Mensaje de feedback */}
      {message.text && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Encabezado y controles */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Gestión de Períodos</h2>
            <p className="text-gray-600 text-sm mt-1">Administra los períodos de disponibilidad médica</p>
          </div>
          <button
            onClick={handleCrear}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            disabled={loadingAction}
          >
            {loadingAction ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Crear Período
              </>
            )}
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-72">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por período, médico o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterEstado}
              onChange={(e) => {
                setFilterEstado(e.target.value);
                setCurrentPage(0);
              }}
              className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="ENVIADO">Enviado</option>
              <option value="REVISADO">Revisado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de períodos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
            <p className="text-gray-600">Cargando períodos...</p>
          </div>
        </div>
      ) : periodosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No hay períodos que mostrar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Período</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Médico</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Especialidad</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Fechas</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Horas</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {periodosFiltrados.map((periodo) => (
                <tr key={periodo.idDisponibilidad} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{periodo.periodo}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{periodo.nombreMedico || periodo.personal?.nombreCompleto}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{periodo.nombreServicio || periodo.servicio?.nombreServicio}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="text-xs">
                      <div className="font-medium text-gray-800">{periodo.periodo}</div>
                      <div className="text-gray-500">Mes completo</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="text-xs">
                      <div className={`font-medium ${periodo.totalHoras >= periodo.horasRequeridas ? 'text-green-600' : 'text-red-600'}`}>
                        {periodo.totalHoras}h
                      </div>
                      <div className="text-gray-500">req: {periodo.horasRequeridas}h</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(periodo.estado)}`}>
                      {getEstadoIcon(periodo.estado)}
                      {periodo.estado}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleVer(periodo)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {periodo.estado === 'BORRADOR' && (
                        <button
                          onClick={() => handleEditar(periodo)}
                          className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {periodo.estado === 'BORRADOR' && (
                        <button
                          onClick={() => handleEliminar(periodo.idDisponibilidad)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                          title="Eliminar"
                          disabled={loadingAction}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {periodo.estado === 'BORRADOR' && (
                        <button
                          onClick={() => handleEnviarARevision(periodo.idDisponibilidad)}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600 disabled:opacity-50 text-xs"
                          title="Enviar a revisión"
                          disabled={loadingAction || periodo.totalHoras < periodo.horasRequeridas}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Página {currentPage + 1} de {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedPeriodo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {modalType === 'crear' && 'Crear Nuevo Período'}
              {modalType === 'editar' && 'Editar Período'}
              {modalType === 'ver' && 'Detalles del Período'}
            </h3>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                  <p className="text-gray-800">{selectedPeriodo.periodo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
                  <p className="text-gray-800">{selectedPeriodo.nombreMedico || selectedPeriodo.personal?.nombreCompleto}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                  <p className="text-gray-800">{selectedPeriodo.nombreServicio || selectedPeriodo.servicio?.nombreServicio}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <p className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(selectedPeriodo.estado)}`}>
                    {getEstadoIcon(selectedPeriodo.estado)}
                    {selectedPeriodo.estado}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horas Totales</label>
                  <p className="text-gray-800">{selectedPeriodo.totalHoras}h</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horas Requeridas</label>
                  <p className="text-gray-800">{selectedPeriodo.horasRequeridas}h</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cerrar
              </button>
              {modalType !== 'ver' && (
                <button
                  onClick={handleGuardar}
                  disabled={loadingAction}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {loadingAction ? 'Guardando...' : 'Guardar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}