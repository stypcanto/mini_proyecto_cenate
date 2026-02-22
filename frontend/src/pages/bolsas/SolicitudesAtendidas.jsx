import React, { useState, useEffect, useRef } from 'react';
import {
  Search, CheckCircle, ChevronLeft, ChevronRight, Calendar, RefreshCw
} from 'lucide-react';
import bolsasService from '../../services/bolsasService';

/**
 * SolicitudesAtendidas
 * Muestra solicitudes de bolsas con estado ATENDIDO_IPRESS (solo lectura)
 *
 * @version 1.0.0
 * @since 2026-02-21
 */
export default function SolicitudesAtendidas() {
  const [solicitudes, setSolicitudes]         = useState([]);
  const [totalElementos, setTotalElementos]   = useState(0);
  const [isLoading, setIsLoading]             = useState(true);
  const [errorMessage, setErrorMessage]       = useState('');
  const [searchTerm, setSearchTerm]           = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin]   = useState('');
  const [currentPage, setCurrentPage]         = useState(1);
  const registrosPorPagina                    = 50;
  const isMountedRef                          = useRef(true);
  const isFirstLoad                           = useRef(true);

  // Estado fijo: solo ATENDIDO_IPRESS
  const ESTADO_ATENDIDO = 'ATENDIDO_IPRESS';

  // ── Montaje ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    cargarSolicitudes(0);
    return () => { isMountedRef.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filtros cambian → volver a página 1 ──────────────────────────────────────
  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return; }
    setCurrentPage(1);
    cargarSolicitudes(0);
  }, [searchTerm, filtroFechaInicio, filtroFechaFin]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Paginación ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentPage > 1) cargarSolicitudes(currentPage - 1);
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Carga de datos ───────────────────────────────────────────────────────────
  const cargarSolicitudes = async (page) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await bolsasService.obtenerSolicitudesPaginado(
        page,
        registrosPorPagina,
        null,                          // bolsa
        null,                          // macrorregion
        null,                          // red
        null,                          // ipress
        null,                          // especialidad
        ESTADO_ATENDIDO,               // estado fijo
        null,                          // ipressAtencion
        null,                          // tipoCita
        null,                          // asignacion
        searchTerm.trim() || null,     // búsqueda libre
        filtroFechaInicio || null,     // fechaInicio
        filtroFechaFin || null,        // fechaFin
        null,                          // condicionMedica
        null                           // gestoraId
      );

      if (!isMountedRef.current) return;

      const data = response?.content || [];
      setTotalElementos(response?.totalElements || 0);

      const mapped = data.map(s => ({
        id:                  s.id_solicitud,
        dni:                 s.paciente_dni || '',
        paciente:            s.paciente_nombre || '',
        sexo:                s.paciente_sexo || 'N/A',
        edad:                s.paciente_edad || 'N/A',
        especialidad:        s.especialidad || '—',
        ipress:              s.desc_ipress || 'N/A',
        descIpressAtencion:  s.desc_ipress_atencion || '—',
        nombreBolsa:         s.desc_tipo_bolsa || 'Sin clasificar',
        estadoCita:          s.desc_estado_cita || 'ATENDIDO',
        fechaSolicitud:      s.fecha_solicitud
          ? new Date(s.fecha_solicitud).toLocaleDateString('es-PE')
          : '—',
        fechaCambioEstado:   s.fecha_cambio_estado
          ? new Date(s.fecha_cambio_estado).toLocaleDateString('es-PE')
          : '—',
        gestoraAsignada:     s.nombre_gestora || '—',
        nombreMedicoAsignado: s.nombre_medico_asignado || '—',
        red:                 s.desc_red || '—',
      }));

      setSolicitudes(mapped);
    } catch (e) {
      console.error('❌ Error cargando solicitudes atendidas:', e);
      if (isMountedRef.current) setErrorMessage('Error al cargar las solicitudes. Intenta nuevamente.');
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  const totalPaginas = Math.ceil(totalElementos / registrosPorPagina);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5">

      {/* ENCABEZADO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-100">
            <CheckCircle className="text-green-600" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Solicitudes Atendidas</h1>
            <p className="text-sm text-gray-500">
              {totalElementos.toLocaleString('es-PE')} registros con estado <span className="font-semibold text-green-700">ATENDIDO</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => cargarSolicitudes(currentPage - 1)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} />
          Actualizar
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Buscar por DNI, nombre, IPRESS..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Fecha desde */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Calendar size={12} className="inline mr-1" />
              Fecha desde
            </label>
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={e => setFiltroFechaInicio(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Calendar size={12} className="inline mr-1" />
              Fecha hasta
            </label>
            <input
              type="date"
              value={filtroFechaFin}
              onChange={e => setFiltroFechaFin(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {isLoading ? 'Cargando...' : `${totalElementos.toLocaleString('es-PE')} registros`}
          </span>
          {totalPaginas > 1 && (
            <span className="text-xs text-gray-400">
              Página {currentPage} / {totalPaginas}
            </span>
          )}
        </div>

        {/* Estado de carga */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-9 h-9 border-4 border-green-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error */}
        {!isLoading && errorMessage && (
          <div className="p-8 text-center">
            <p className="text-red-600 font-medium">{errorMessage}</p>
            <button
              onClick={() => cargarSolicitudes(currentPage - 1)}
              className="mt-3 px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Sin resultados */}
        {!isLoading && !errorMessage && solicitudes.length === 0 && (
          <div className="p-12 text-center">
            <CheckCircle className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-500">No se encontraron solicitudes atendidas con los filtros aplicados.</p>
          </div>
        )}

        {/* Tabla de datos */}
        {!isLoading && !errorMessage && solicitudes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">F. Ingreso</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">DNI</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bolsa</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Especialidad</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IPRESS Adscripción</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IPRESS Atención</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">F. Atendido</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Médico</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gestora</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s, idx) => (
                  <tr
                    key={s.id ?? idx}
                    className="border-b border-gray-100 hover:bg-green-50 transition-colors"
                  >
                    {/* F. Ingreso */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-blue-400 flex-shrink-0" />
                        <span className="text-gray-600 text-xs">{s.fechaSolicitud}</span>
                      </div>
                    </td>

                    {/* DNI */}
                    <td className="px-3 py-3 font-bold text-blue-600 whitespace-nowrap">{s.dni}</td>

                    {/* Paciente */}
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-900 whitespace-nowrap">{s.paciente}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.sexo} · {s.edad} años</div>
                    </td>

                    {/* Bolsa */}
                    <td className="px-3 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 whitespace-nowrap">
                        {s.nombreBolsa}
                      </span>
                    </td>

                    {/* Especialidad */}
                    <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">{s.especialidad}</td>

                    {/* IPRESS Adscripción */}
                    <td className="px-3 py-3 text-gray-600 text-xs max-w-[160px] truncate" title={s.ipress}>{s.ipress}</td>

                    {/* IPRESS Atención */}
                    <td className="px-3 py-3 text-gray-600 text-xs max-w-[160px] truncate" title={s.descIpressAtencion}>{s.descIpressAtencion}</td>

                    {/* F. Atendido */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle size={11} />
                        {s.fechaCambioEstado}
                      </span>
                    </td>

                    {/* Médico */}
                    <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">{s.nombreMedicoAsignado}</td>

                    {/* Gestora */}
                    <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">{s.gestoraAsignada}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINACIÓN */}
        {!isLoading && totalPaginas > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-500">
              Mostrando {((currentPage - 1) * registrosPorPagina) + 1}–
              {Math.min(currentPage * registrosPorPagina, totalElementos)} de{' '}
              {totalElementos.toLocaleString('es-PE')} registros
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={13} /> Anterior
              </button>
              <span className="text-xs font-medium text-gray-700 px-2">
                {currentPage} / {totalPaginas}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPaginas, p + 1))}
                disabled={currentPage === totalPaginas}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
