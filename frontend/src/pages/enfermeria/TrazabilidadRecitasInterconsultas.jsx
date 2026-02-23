import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, GitBranch, RefreshCw, ChevronLeft, ChevronRight,
  Calendar, Filter, User, FileText, Pencil, Check, X
} from 'lucide-react';

/**
 * TrazabilidadRecitasInterconsultas v1.0.0
 * Vista de Coordinadora de Enfermería: quién generó cada recita/interconsulta,
 * para qué paciente y con qué especialidad destino.
 *
 * Endpoint: GET /api/bolsas/solicitudes/trazabilidad-recitas
 */

const PAGE_SIZE = 25;

function getToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('auth.token') ||
    sessionStorage.getItem('token') ||
    null
  );
}

const API_BASE = (() => {
  let url = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080';
  url = url.replace(/http:\/\/localhost/, 'http://127.0.0.1');
  if (!url.endsWith('/api')) url = url.endsWith('/') ? url + 'api' : url + '/api';
  return url;
})();

function formatFecha(val) {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return String(val);
  }
}

function BadgeTipo({ tipo }) {
  const esRecita = tipo?.toUpperCase() === 'RECITA';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
      esRecita
        ? 'bg-blue-100 text-blue-700'
        : 'bg-orange-100 text-orange-700'
    }`}>
      {tipo || '—'}
    </span>
  );
}

function BadgeEstado({ cod, desc }) {
  const colores = {
    PENDIENTE_CITA: 'bg-gray-100 text-gray-600',
    CITADO:         'bg-blue-100 text-blue-700',
    ATENDIDO:       'bg-green-100 text-green-700',
    NO_ASISTIO:     'bg-red-100 text-red-600',
    RECHAZADO:      'bg-red-100 text-red-600',
  };
  const cls = colores[cod] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {desc || cod || '—'}
    </span>
  );
}

function BadgeCreador({ nombre }) {
  if (!nombre) return <span className="text-xs text-gray-400 italic">Sin datos</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <User size={10} />
      {nombre}
    </span>
  );
}

export default function TrazabilidadRecitasInterconsultas() {
  const [filas,          setFilas]          = useState([]);
  const [total,          setTotal]          = useState(0);
  const [isLoading,      setIsLoading]      = useState(true);
  const [errorMessage,   setErrorMessage]   = useState('');

  const [searchTerm,        setSearchTerm]        = useState('');
  const [filtroTipo,        setFiltroTipo]        = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin,    setFiltroFechaFin]    = useState('');

  // Edición inline de fecha preferida
  const [editandoFechaId,   setEditandoFechaId]   = useState(null);
  const [fechaInputEdicion, setFechaInputEdicion] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const isMountedRef = useRef(true);
  const isFirstLoad  = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    cargar(1);
    return () => { isMountedRef.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return; }
    setCurrentPage(1);
    cargar(1);
  }, [filtroFechaInicio, filtroFechaFin, filtroTipo, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentPage > 1) cargar(currentPage);
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargar = useCallback(async (page = 1) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams();
      params.set('page', page - 1);
      params.set('size', PAGE_SIZE);
      if (searchTerm.trim())       params.set('busqueda',    searchTerm.trim());
      if (filtroFechaInicio)       params.set('fechaInicio', filtroFechaInicio);
      if (filtroFechaFin)          params.set('fechaFin',    filtroFechaFin);
      if (filtroTipo)              params.set('tipoCita',    filtroTipo);

      const res = await fetch(`${API_BASE}/bolsas/solicitudes/trazabilidad-recitas?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!isMountedRef.current) return;
      setFilas(data.solicitudes || []);
      setTotal(data.total ?? 0);
    } catch (e) {
      console.error('❌ Error trazabilidad recitas:', e);
      if (isMountedRef.current)
        setErrorMessage('Error al cargar la trazabilidad. Intenta nuevamente.');
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [searchTerm, filtroFechaInicio, filtroFechaFin, filtroTipo]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleBusqueda = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      cargar(1);
    }
  };

  const abrirEdicionFecha = (fila) => {
    setEditandoFechaId(fila.idSolicitud);
    setFechaInputEdicion(fila.fechaPreferida ? fila.fechaPreferida.split('T')[0] : '');
  };

  const guardarFechaPreferida = async (idSolicitud) => {
    try {
      const params = new URLSearchParams();
      if (fechaInputEdicion) params.set('fecha', fechaInputEdicion);
      const res = await fetch(
        `${API_BASE}/bolsas/solicitudes/${idSolicitud}/fecha-preferida?${params}`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Actualizar localmente sin recargar toda la tabla
      setFilas(prev => prev.map(f =>
        f.idSolicitud === idSolicitud
          ? { ...f, fechaPreferida: fechaInputEdicion || null }
          : f
      ));
    } catch (e) {
      console.error('❌ Error guardando fecha preferida:', e);
    } finally {
      setEditandoFechaId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Encabezado */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <GitBranch size={22} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Trazabilidad Recitas / Interconsultas</h1>
            <p className="text-sm text-gray-500">
              Historial de recitas e interconsultas — quién las generó, para qué paciente
            </p>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="mb-5 inline-flex items-center gap-2 bg-white border border-indigo-200 rounded-xl px-4 py-3 shadow-sm">
        <FileText size={18} className="text-indigo-500" />
        <span className="text-sm text-gray-600">Total registros:</span>
        <span className="text-lg font-bold text-indigo-600">{total.toLocaleString('es-PE')}</span>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">

          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Buscar por DNI o nombre
            </label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={handleBusqueda}
                placeholder="DNI o nombre del paciente..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Filter size={12} className="inline mr-1" />Tipo
            </label>
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Todos</option>
              <option value="RECITA">RECITA</option>
              <option value="INTERCONSULTA">INTERCONSULTA</option>
            </select>
          </div>

          {/* Fecha inicio */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Calendar size={12} className="inline mr-1" />Desde
            </label>
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={e => setFiltroFechaInicio(e.target.value)}
              className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Fecha fin */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Calendar size={12} className="inline mr-1" />Hasta
            </label>
            <input
              type="date"
              value={filtroFechaFin}
              onChange={e => setFiltroFechaFin(e.target.value)}
              className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Actualizar */}
          <button
            onClick={() => { setCurrentPage(1); cargar(1); }}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  'F. Generación', 'Tipo', 'Paciente', 'DNI',
                  'Especialidad destino', 'Origen de la bolsa', 'Fecha preferida',
                  'Creado por', 'Usuario', 'Solicitud origen', 'Estado'
                ].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-gray-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
                    Cargando trazabilidad...
                  </td>
                </tr>
              ) : filas.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-gray-400">
                    No se encontraron registros con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filas.map((f, i) => (
                  <tr key={f.idSolicitud ?? i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {formatFecha(f.fechaSolicitud)}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeTipo tipo={f.tipoCita} />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate" title={f.pacienteNombre}>
                      {f.pacienteNombre || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {f.pacienteDni || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {f.especialidadDestino || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {f.origenBolsa || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {editandoFechaId === f.idSolicitud ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="date"
                            value={fechaInputEdicion}
                            onChange={e => setFechaInputEdicion(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') guardarFechaPreferida(f.idSolicitud);
                              if (e.key === 'Escape') setEditandoFechaId(null);
                            }}
                            autoFocus
                            className="text-xs border border-indigo-400 rounded px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                          <button
                            onClick={() => guardarFechaPreferida(f.idSolicitud)}
                            className="p-1 rounded hover:bg-green-100 text-green-600"
                            title="Guardar"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={() => setEditandoFechaId(null)}
                            className="p-1 rounded hover:bg-red-100 text-red-500"
                            title="Cancelar"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 group">
                          <span className={`text-xs font-medium ${f.fechaPreferida ? 'text-indigo-700' : 'text-gray-400 italic'}`}>
                            {f.fechaPreferida
                              ? new Date(f.fechaPreferida + 'T12:00:00').toLocaleDateString('es-PE', {
                                  day: '2-digit', month: '2-digit', year: 'numeric'
                                })
                              : 'Sin fecha'}
                          </span>
                          <button
                            onClick={() => abrirEdicionFecha(f)}
                            className="p-1 rounded hover:bg-indigo-100 text-indigo-400 hover:text-indigo-600 transition-colors"
                            title="Editar fecha preferida"
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeCreador nombre={f.medicoCreador} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {f.usuarioCreador || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {f.solicitudOrigen || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEstado cod={f.codEstado} desc={f.descEstado} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!isLoading && filas.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)} de {total.toLocaleString('es-PE')} registros
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
                {currentPage} / {totalPaginas}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPaginas, p + 1))}
                disabled={currentPage >= totalPaginas}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
