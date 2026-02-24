import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Search, XCircle, ChevronLeft, ChevronRight, Calendar,
  RefreshCw, Users
} from 'lucide-react';
import bolsasService from '../../services/bolsasService';

/**
 * PacientesRechazados v1.0.0
 * Muestra pacientes marcados como RECHAZADO desde CitasAgendadas.
 * Server-side pagination + filtros de búsqueda y fechas.
 *
 * @version 1.0.0
 * @since 2026-02-23
 */

const PAGE_SIZE = 20;

function mapSolicitud(s) {
  return {
    id: s.id_solicitud,
    dni: s.paciente_dni || '',
    paciente: s.paciente_nombre || '',
    telefono: s.paciente_telefono || '',
    especialidad: s.especialidad || '—',
    ipress: s.desc_ipress || '—',
    red: s.desc_red || '—',
    estadoCodigo: s.cod_estado_cita || 'RECHAZADO',
    estadoDisplay: s.desc_estado_cita || 'Rechazado',
    gestoraAsignada: s.nombre_gestora || '—',
    usuarioCambioEstado: s.nombre_usuario_cambio_estado || '—',
    fechaCambioEstado: s.fecha_cambio_estado
      ? new Date(s.fecha_cambio_estado).toLocaleString('es-PE', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : '—',
    fechaSolicitud: s.fecha_solicitud
      ? new Date(s.fecha_solicitud).toLocaleString('es-PE') : '—',
  };
}

export default function PacientesRechazados() {
  const [solicitudes,    setSolicitudes]    = useState([]);
  const [totalElementos, setTotalElementos] = useState(0);
  const [isLoading,      setIsLoading]      = useState(true);
  const [errorMessage,   setErrorMessage]   = useState('');

  const [searchTerm,        setSearchTerm]        = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin,    setFiltroFechaFin]    = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const isMountedRef = useRef(true);
  const isFirstLoad  = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    cargarSolicitudes(1);
    return () => { isMountedRef.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return; }
    setCurrentPage(1);
    cargarSolicitudes(1);
  }, [filtroFechaInicio, filtroFechaFin, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentPage > 1) cargarSolicitudes(currentPage);
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarSolicitudes = useCallback(async (page = 1) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await bolsasService.obtenerSolicitudesPaginado(
        page - 1,
        PAGE_SIZE,
        null, null, null, null, null,
        'RECHAZADO',
        null, null, null,
        searchTerm.trim() || null,
        filtroFechaInicio || null,
        filtroFechaFin    || null,
        null, null, null
      );

      if (!isMountedRef.current) return;

      const data  = response?.content || [];
      const total = response?.totalElements ?? data.length;

      setSolicitudes(data.map(mapSolicitud));
      setTotalElementos(total);
    } catch (e) {
      console.error('❌ Error cargando pacientes rechazados:', e);
      if (isMountedRef.current)
        setErrorMessage('Error al cargar los pacientes rechazados. Intenta nuevamente.');
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [filtroFechaInicio, filtroFechaFin, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPaginas = Math.max(1, Math.ceil(totalElementos / PAGE_SIZE));

  const handleBusqueda = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      cargarSolicitudes(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Encabezado */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-red-100 rounded-xl">
            <XCircle size={22} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Pacientes Rechazados</h1>
            <p className="text-sm text-gray-500">Pacientes devueltos desde Citas Agendadas</p>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="mb-5 inline-flex items-center gap-2 bg-white border border-red-200 rounded-xl px-4 py-3 shadow-sm">
        <Users size={18} className="text-red-500" />
        <span className="text-sm text-gray-600">Total rechazados:</span>
        <span className="text-lg font-bold text-red-600">{totalElementos.toLocaleString('es-PE')}</span>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Búsqueda DNI */}
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
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
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
              className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
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
              className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <button
            onClick={() => { setSearchTerm(''); setFiltroFechaInicio(''); setFiltroFechaFin(''); }}
            className="py-2 px-4 text-sm border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition"
          >
            Limpiar
          </button>

          <button
            onClick={() => { setCurrentPage(1); cargarSolicitudes(1); }}
            className="py-2 px-4 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Barra de estado */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {isLoading ? 'Cargando...' : `${totalElementos.toLocaleString('es-PE')} registro${totalElementos !== 1 ? 's' : ''}`}
          </span>
          <span className="text-xs text-gray-500">
            Página {currentPage} de {totalPaginas}
          </span>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-4 text-center text-red-600 text-sm">{errorMessage}</div>
        )}

        {/* Loading */}
        {isLoading && !errorMessage && (
          <div className="p-8 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin" /> Cargando pacientes rechazados...
          </div>
        )}

        {/* Sin datos */}
        {!isLoading && !errorMessage && solicitudes.length === 0 && (
          <div className="p-10 text-center">
            <XCircle size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">No hay pacientes rechazados</p>
          </div>
        )}

        {/* Tabla */}
        {!isLoading && !errorMessage && solicitudes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-red-600 text-white">
                  {['F. Rechazo', 'Paciente', 'DNI', 'Especialidad', 'Gestora', 'IPRESS', 'Red', 'Rechazado por', 'Estado'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s, idx) => (
                  <tr key={s.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{s.fechaCambioEstado}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800 text-xs">{s.paciente}</td>
                    <td className="px-3 py-2.5 text-xs font-mono text-gray-700">{s.dni}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{s.especialidad}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{s.gestoraAsignada}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{s.ipress}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{s.red}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{s.usuarioCambioEstado}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 whitespace-nowrap">
                        RECHAZADO
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!isLoading && totalPaginas > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <span className="text-xs text-gray-600">
              {currentPage} / {totalPaginas}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPaginas, p + 1))}
              disabled={currentPage === totalPaginas}
              className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
