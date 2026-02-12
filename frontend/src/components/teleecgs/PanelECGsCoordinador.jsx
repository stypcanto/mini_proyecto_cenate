/**
 * 🆕 v1.59.0: Panel ECGs para Coordinadores
 * Permite ver, filtrar y atender ECGs cargados por IPRESS
 */

import React, { useState, useEffect } from 'react';
import {
  Eye, Download, Send, AlertTriangle, Filter, RefreshCw, Loader2, Check,
  X, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../lib/apiClient';

export default function PanelECGsCoordinador({ onAtenderClick = null }) {
  const [ecgs, setEcgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroDNI, setFiltroDNI] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Cargar ECGs
  useEffect(() => {
    cargarECGs();
  }, [page, filtroEstado, filtroDNI]);

  const cargarECGs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', pageSize);
      if (filtroEstado) params.append('estado', filtroEstado);
      if (filtroDNI) params.append('numDoc', filtroDNI);

      const response = await apiClient.get(`/gestion-pacientes/teleecgs?${params}`);

      setEcgs(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('❌ Error cargando ECGs:', error);
      toast.error('Error al cargar ECGs');
    } finally {
      setLoading(false);
    }
  };

  const handleAtender = async (ecg) => {
    if (onAtenderClick) {
      onAtenderClick(ecg);
    } else {
      // Modal simplificado para atender
      toast.success('ECG listo para atender: ' + ecg.nombresPaciente);
    }
  };

  const handleDescargar = async (idImagen) => {
    try {
      const response = await apiClient.get(`/teleekgs/${idImagen}/descargar`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ECG_${idImagen}.jpg`;
      link.click();
      toast.success('ECG descargado');
    } catch (error) {
      toast.error('Error descargando ECG');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'ENVIADA':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'OBSERVADA':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'ATENDIDA':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">📊 Panel de ECGs</h2>
        <button
          onClick={() => cargarECGs()}
          disabled={loading}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Filter className="w-4 h-4 inline mr-2" />
            Estado
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPage(0); }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="ENVIADA">Enviada</option>
            <option value="OBSERVADA">Observada</option>
            <option value="ATENDIDA">Atendida</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">DNI Paciente</label>
          <input
            type="text"
            placeholder="Buscar DNI..."
            value={filtroDNI}
            onChange={(e) => { setFiltroDNI(e.target.value); setPage(0); }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => { setFiltroEstado(''); setFiltroDNI(''); setPage(0); }}
            className="w-full px-3 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-lg text-sm font-medium transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando ECGs...</p>
        </div>
      ) : ecgs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600">No hay ECGs disponibles</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">DNI</th>
                  <th className="px-4 py-3 text-left font-semibold">Paciente</th>
                  <th className="px-4 py-3 text-left font-semibold">IPRESS</th>
                  <th className="px-4 py-3 text-center font-semibold">Urgente</th>
                  <th className="px-4 py-3 text-center font-semibold">Estado</th>
                  <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ecgs.map((ecg, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                      ecg.esUrgente ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {ecg.numDocPaciente}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {ecg.nombresPaciente} {ecg.apellidosPaciente}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-sm">
                      {ecg.nombreIpress}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {ecg.esUrgente && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          <AlertTriangle className="w-3 h-3" /> URGENTE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(ecg.estado)}`}>
                        {ecg.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => { setSelectedImage(ecg); setShowModal(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Ver imagen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDescargar(ecg.idImagen)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {ecg.estado !== 'ATENDIDA' && (
                          <button
                            onClick={() => handleAtender(ecg)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                            title="Atender"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Vista Previa Imagen */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                ECG - {selectedImage.nombresPaciente}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                DNI: {selectedImage.numDocPaciente} | IPRESS: {selectedImage.nombreIpress}
              </p>

              {selectedImage.contenidoImagen ? (
                <img
                  src={`data:${selectedImage.mimeType || 'image/jpeg'};base64,${selectedImage.contenidoImagen}`}
                  alt="ECG"
                  className="w-full max-h-[400px] object-contain mb-4"
                />
              ) : (
                <div className="bg-slate-100 h-64 flex items-center justify-center rounded-lg mb-4">
                  <p className="text-slate-500">Imagen no disponible</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-slate-600">Estado</p>
                  <p className="font-semibold">{selectedImage.estado}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Urgencia</p>
                  <p className="font-semibold">{selectedImage.esUrgente ? 'URGENTE' : 'Normal'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Tamaño</p>
                  <p className="font-semibold">
                    {selectedImage.tamanioByte
                      ? (selectedImage.tamanioByte / 1024 / 1024).toFixed(2) + ' MB'
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Tipo</p>
                  <p className="font-semibold">{selectedImage.tipoContenido || '-'}</p>
                </div>
              </div>

              {selectedImage.observaciones && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4">
                  <p className="text-xs font-semibold text-amber-900 mb-2">Observaciones</p>
                  <p className="text-sm text-amber-800">{selectedImage.observaciones}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleDescargar(selectedImage.idImagen)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
                {selectedImage.estado !== 'ATENDIDA' && (
                  <button
                    onClick={() => {
                      handleAtender(selectedImage);
                      setShowModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Atender
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
