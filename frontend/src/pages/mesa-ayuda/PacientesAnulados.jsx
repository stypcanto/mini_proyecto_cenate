// ========================================================================
// PacientesAnulados.jsx - Lista de pacientes anulados (Mesa de Ayuda)
// ========================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { UserX, Search, RefreshCw, Download, Calendar, User, Building2, Stethoscope, FileText, AlertTriangle } from 'lucide-react';
import apiClient from '../../services/apiClient';

const PacientesAnulados = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaInput, setBusquedaInput] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 50;

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, size: PAGE_SIZE });
      if (busqueda) params.set('busqueda', busqueda);
      const res = await apiClient.get(`/mesa-ayuda/pacientes-anulados?${params}`);
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      setError('No se pudo cargar la lista de pacientes anulados.');
    } finally {
      setLoading(false);
    }
  }, [busqueda, page]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleBuscar = (e) => {
    e.preventDefault();
    setPage(0);
    setBusqueda(busquedaInput.trim());
  };

  const handleLimpiar = () => {
    setBusquedaInput('');
    setBusqueda('');
    setPage(0);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    try {
      return new Date(fecha).toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-red-100 rounded-xl">
            <UserX className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pacientes Anulados</h1>
            <p className="text-sm text-gray-500">Historial de atenciones anuladas en el sistema</p>
          </div>
        </div>
      </div>

      {/* Stat card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Anulados</p>
            <p className="text-2xl font-bold text-red-600">{total.toLocaleString('es-PE')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mostrando</p>
            <p className="text-2xl font-bold text-blue-600">{data.length.toLocaleString('es-PE')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-lg">
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Páginas</p>
            <p className="text-2xl font-bold text-orange-600">{totalPages}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <form onSubmit={handleBuscar} className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Buscar (DNI, nombre, especialidad)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={busquedaInput}
                onChange={e => setBusquedaInput(e.target.value)}
                placeholder="Ej: 12345678 o Juan Pérez..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
          <button
            type="button"
            onClick={handleLimpiar}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Limpiar
          </button>
          <button
            type="button"
            onClick={cargarDatos}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando pacientes anulados...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 gap-3 text-red-500">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <UserX className="w-10 h-10" />
            <p className="text-sm font-medium">No se encontraron pacientes anulados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Paciente</div>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">DNI</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" />Especialidad</div>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />IPRESS</div>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Médico asignado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Motivo anulación</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Anulado por</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Fecha anulación</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row, idx) => (
                  <tr key={row.idSolicitud ?? idx} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{page * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{row.pacienteNombre || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{row.pacienteDni || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{row.especialidad || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px] truncate" title={row.ipress}>{row.ipress || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{row.medicoNombre?.trim() || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full max-w-[200px] inline-block truncate" title={row.motivoAnulacion}>
                        {row.motivoAnulacion || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{row.anuladoPor || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatFecha(row.fechaAnulacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Página {page + 1} de {totalPages} — {total.toLocaleString('es-PE')} registros totales
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PacientesAnulados;
