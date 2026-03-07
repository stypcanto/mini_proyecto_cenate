// ========================================================================
// PacientesAnulados.jsx - Lista de pacientes anulados (Mesa de Ayuda)
// ========================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { UserX, Search, RefreshCw, Calendar, User, Building2, Stethoscope, FileText, AlertTriangle, PlusCircle, X, CheckCircle } from 'lucide-react';
import apiClient from '../../lib/apiClient';

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

  // Estado modal nueva cita
  const [modalNuevaCita, setModalNuevaCita] = useState(null); // row seleccionada
  const [motivoNuevaCita, setMotivoNuevaCita] = useState('');
  const [creando, setCreando] = useState(false);
  const [resultadoNuevaCita, setResultadoNuevaCita] = useState(null); // {numeroSolicitud}
  const [errorNuevaCita, setErrorNuevaCita] = useState(null);

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

  const handleNuevaCita = async () => {
    if (!motivoNuevaCita.trim()) return;
    setCreando(true);
    setErrorNuevaCita(null);
    try {
      const res = await apiClient.post(
        `/bolsas/solicitudes/${modalNuevaCita.idSolicitud}/nueva-cita-desde-anulacion`,
        { motivo: motivoNuevaCita.trim() }
      );
      setResultadoNuevaCita(res.data);
    } catch (err) {
      setErrorNuevaCita(
        err.response?.data?.error || 'Error al crear la nueva cita. Intente nuevamente.'
      );
    } finally {
      setCreando(false);
    }
  };

  const cerrarModal = () => {
    setModalNuevaCita(null);
    setMotivoNuevaCita('');
    setErrorNuevaCita(null);
    setResultadoNuevaCita(null);
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
    <>
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
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap text-center">Acción</th>
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
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setModalNuevaCita(row); setMotivoNuevaCita(''); setResultadoNuevaCita(null); setErrorNuevaCita(null); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap mx-auto"
                        title="Crear nueva cita para este paciente"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Nueva Cita
                      </button>
                    </td>
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

    {/* Modal: Nueva Cita desde Anulación */}
    {modalNuevaCita && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/8 max-w-md w-full overflow-hidden">

          {/* Acento + Header */}
          <div className="border-t-4 border-blue-600">
            <div className="flex items-start justify-between px-6 pt-5 pb-4 bg-gradient-to-b from-slate-50/80 to-white border-b border-gray-100">
              <div className="flex-1 pr-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 mb-1">Solicitud de nueva atención</p>
                <h2 className="text-[15px] font-bold text-gray-900">Nueva Cita desde Anulación</h2>
              </div>
              <button onClick={cerrarModal} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            {resultadoNuevaCita ? (
              /* Estado éxito */
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">Cita creada correctamente</p>
                  <p className="text-sm text-gray-500 mt-1">El paciente fue ingresado a la bolsa en estado <span className="font-semibold text-blue-600">Pendiente de Citar</span></p>
                </div>
                <div className="bg-blue-50 rounded-xl px-4 py-3 text-left ring-1 ring-blue-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">N° Solicitud</p>
                  <p className="font-mono font-bold text-blue-900 text-lg">{resultadoNuevaCita.numeroSolicitud}</p>
                  <p className="text-xs text-blue-600 mt-0.5">Origen: #{resultadoNuevaCita.idSolicitudOrigen}</p>
                </div>
                <button
                  onClick={cerrarModal}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              /* Formulario */
              <>
                {/* Info del paciente anulado */}
                <div className="bg-white ring-1 ring-gray-100 shadow-sm rounded-xl overflow-hidden text-sm">
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Paciente</p>
                      <p className="font-semibold text-gray-900 text-[13px] leading-snug">{modalNuevaCita.pacienteNombre || '—'}</p>
                      <p className="font-mono text-xs text-gray-500 mt-0.5">DNI {modalNuevaCita.pacienteDni}</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Especialidad</p>
                      <p className="font-semibold text-gray-900 text-[13px] leading-snug">{modalNuevaCita.especialidad || '—'}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100 bg-red-50/40">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Motivo de anulación original</p>
                    <p className="text-[12px] text-red-800">{modalNuevaCita.motivoAnulacion || '—'}</p>
                  </div>
                </div>

                {/* Aviso auditoria */}
                <div className="flex items-start gap-2.5 bg-amber-50 ring-1 ring-amber-100 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-800 leading-snug">
                    El registro anulado <span className="font-semibold">no se modifica</span>. Se creará una <span className="font-semibold">nueva solicitud independiente</span> con trazabilidad hacia el origen.
                  </p>
                </div>

                {/* Motivo nueva cita */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Motivo de la nueva cita <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={motivoNuevaCita}
                    onChange={e => setMotivoNuevaCita(e.target.value)}
                    placeholder="Ej: Paciente solicita reagendamiento, error administrativo, condición médica persiste..."
                    rows={3}
                    autoFocus
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors resize-none"
                  />
                </div>

                {errorNuevaCita && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 ring-1 ring-red-100 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-red-800">{errorNuevaCita}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    disabled={creando}
                    className="px-4 py-2 rounded-xl text-[13px] text-gray-500 font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={handleNuevaCita}
                    disabled={creando || !motivoNuevaCita.trim()}
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-xl text-[13px] font-semibold hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {creando ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando...</>
                    ) : (
                      <><PlusCircle className="w-4 h-4" />Crear Nueva Cita</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default PacientesAnulados;
