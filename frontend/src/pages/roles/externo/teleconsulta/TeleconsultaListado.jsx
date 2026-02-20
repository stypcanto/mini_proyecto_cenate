// ========================================================================
// TeleconsultaListado.jsx – Pacientes PADOMI · Bolsa Teleconsulta
// v1.1.0 – Estado basado en condicion_medica (dim_solicitud_bolsa)
// ========================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, X, RefreshCw,
  Users, CheckCircle, Clock, AlertTriangle, Phone,
  Stethoscope, AlertCircle,
  ChevronLeft, ChevronRight, UserPlus, PhoneCall,
} from 'lucide-react';
import {
  obtenerSolicitudesPaginado,
  obtenerEstadisticasCondicionMedicaPadomi,
  obtenerEstadisticasPorEspecialidad,
} from '../../../../services/bolsasService';

// ─── condicion_medica → meta de visualización ────────────────────────────────
const getCondicionMeta = (valor) => {
  const v = (valor ?? '').trim();
  if (v === 'Atendido')  return { grupo: 'ATENDIDO',    label: 'Atendido',     color: 'emerald' };
  if (v === 'Deserción') return { grupo: 'DESERCION',   label: 'Deserción',    color: 'red'     };
  if (v === 'Pendiente') return { grupo: 'PENDIENTE',   label: 'Pendiente',    color: 'blue'    };
  return                        { grupo: 'SIN_ATENCION', label: 'Sin atención', color: 'slate'  };
};

const BADGE_CLASSES = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  blue:    'bg-blue-100   text-blue-800   border-blue-300',
  slate:   'bg-slate-100  text-slate-700  border-slate-300',
  orange:  'bg-orange-100 text-orange-700 border-orange-300',
  red:     'bg-red-100    text-red-700    border-red-300',
};

const PAGE_SIZE    = 20;
const BOLSA_PADOMI = null;

// ─── Badge de condicion_medica ────────────────────────────────────────────────
function CondicionBadge({ valor }) {
  const meta = getCondicionMeta(valor);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${BADGE_CLASSES[meta.color]}`}>
      {meta.grupo === 'ATENDIDO'     && <CheckCircle   className="w-3 h-3" />}
      {meta.grupo === 'PENDIENTE'    && <Clock         className="w-3 h-3" />}
      {meta.grupo === 'SIN_ATENCION' && <Clock         className="w-3 h-3" />}
      {meta.grupo === 'DESERCION'    && <AlertTriangle className="w-3 h-3" />}
      {meta.label}
    </span>
  );
}

// ─── Skeleton de carga ───────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[1, 2, 3, 4, 5, 6, 7].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${50 + (i * 7) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function TeleconsultaListado() {
  const navigate = useNavigate();

  // Datos
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Paginación
  const [pagina, setPagina]             = useState(0);
  const [totalElementos, setTotal]      = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  // Filtros
  const [busqueda, setBusqueda]         = useState('');
  const [filtroGrupo, setFiltroGrupo]   = useState('TODOS'); // TODOS | ATENDIDO | PENDIENTE | DESERCION | SIN_ATENCION
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');

  // Especialidades con conteos (cargadas desde backend)
  const [especialidadesStat, setEspecialidadesStat] = useState([]);

  // Modal "Ingresar nuevos pacientes"
  const [modalNuevoPaciente, setModalNuevoPaciente] = useState(false);

  // Debounce ref
  const debounceRef = useRef(null);

  // ── Estadísticas globales por condicion_medica ────────────────────────────
  const [statsGlobal, setStatsGlobal] = useState({ ATENDIDO: 0, PENDIENTE: 0, DESERCION: 0, SIN_ATENCION: 0 });
  const [totalGeneral, setTotalGeneral] = useState(0);

  // ── Cargar datos ──────────────────────────────────────────────────────────
  const cargar = useCallback(async (pag = 0, busq = busqueda, grupo = filtroGrupo, esp = filtroEspecialidad) => {
    setLoading(true);
    setError(null);
    try {
      // Mapear grupo UI → valor de condicion_medica para filtrar en backend
      const condicionMedicaBackend =
        grupo === 'ATENDIDO'    ? 'Atendido'    :
        grupo === 'PENDIENTE'   ? 'Pendiente'   :
        grupo === 'DESERCION'   ? 'Deserción'   :
        grupo === 'SIN_ATENCION'? 'Sin atención':
        null; // TODOS → sin filtro

      const resp = await obtenerSolicitudesPaginado(
        pag, PAGE_SIZE,
        BOLSA_PADOMI,           // bolsa
        null, null, null,       // macrorregion, red, ipress
        esp || null,            // especialidad
        null,                   // estado (cod_estado_cita) – no usado aquí
        'PADOMI',               // ipressAtencion – solo pacientes IPRESS Atención PADOMI
        null, null,             // tipoCita, asignacion
        busq || null,           // busqueda
        null, null,             // fechaInicio, fechaFin
        condicionMedicaBackend, // condicionMedica – filtro por dim_solicitud_bolsa.condicion_medica
      );

      const content = resp?.content ?? resp ?? [];
      const total = resp?.totalElements ?? content.length;
      setPacientes(Array.isArray(content) ? content : []);
      setTotal(total);
      setTotalPaginas(resp?.totalPages ?? 1);
      setPagina(pag);
      if (grupo === 'TODOS' && !busq && !esp) setTotalGeneral(total);
    } catch (err) {
      console.error('Error cargando pacientes PADOMI:', err);
      setError('No se pudo cargar el listado. Verifica la conexión e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtroGrupo, filtroEspecialidad]);

  useEffect(() => {
    cargar(0);
    // Estadísticas por condicion_medica (dim_solicitud_bolsa)
    obtenerEstadisticasCondicionMedicaPadomi()
      .then(data => {
        if (!Array.isArray(data)) return;
        const acc = { ATENDIDO: 0, PENDIENTE: 0, DESERCION: 0, SIN_ATENCION: 0 };
        data.forEach(({ estado, cantidad }) => {
          const grupo = getCondicionMeta(estado).grupo;
          acc[grupo] = (acc[grupo] ?? 0) + (Number(cantidad) || 0);
        });
        setStatsGlobal(acc);
      })
      .catch(() => {});
    // Especialidades con conteos filtradas por PADOMI
    obtenerEstadisticasPorEspecialidad('PADOMI')
      .then(data => { if (Array.isArray(data)) setEspecialidadesStat(data); })
      .catch(() => {});
  }, []);

  // ── Filtro grupo (cards superiores) ──────────────────────────────────────
  const cambiarGrupo = (grupo) => {
    setFiltroGrupo(grupo);
    cargar(0, busqueda, grupo, filtroEspecialidad);
  };

  // ── Cambio de especialidad ────────────────────────────────────────────────
  const handleEspecialidad = (val) => {
    setFiltroEspecialidad(val);
    cargar(0, busqueda, filtroGrupo, val);
  };

  // ── Búsqueda con debounce ─────────────────────────────────────────────────
  const handleBusqueda = (val) => {
    setBusqueda(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => cargar(0, val, filtroGrupo, filtroEspecialidad), 500);
  };

  // El backend ya filtra por condicion_medica, los resultados son siempre correctos
  const pacientesFiltrados = pacientes;

  // ── Formatear fecha ───────────────────────────────────────────────────────
  const fmtFecha = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-4 flex items-center gap-4 shadow-lg sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Atrás
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-tight">Pacientes PADOMI · Teleconsulta</h1>
          <p className="text-blue-200 text-xs mt-0.5">Bolsa de pacientes derivados del Programa de Atención Domiciliaria</p>
        </div>
        <button
          onClick={() => setModalNuevoPaciente(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-semibold shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Ingresar nuevos pacientes</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
        <button
          onClick={() => cargar(pagina)}
          disabled={loading}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          title="Refrescar"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Modal: Ingresar nuevos pacientes ── */}
      {modalNuevoPaciente && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModalNuevoPaciente(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-t-2xl px-6 py-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl p-2.5">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base leading-tight">Ingresar nuevos pacientes</h2>
                  <p className="text-blue-200 text-xs mt-0.5">Bolsa PADOMI · Teleconsulta</p>
                </div>
              </div>
              <button
                onClick={() => setModalNuevoPaciente(false)}
                className="text-white/60 hover:text-white transition-colors mt-0.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  Esta funcionalidad se habilitará <span className="font-semibold">únicamente en coordinación con CENATE</span>.
                  El ingreso de nuevos pacientes a la bolsa PADOMI requiere autorización previa.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <p className="text-sm text-slate-700 leading-relaxed">
                  Para gestionar el ingreso de nuevos pacientes, comuníquese con el{' '}
                  <span className="font-semibold text-slate-900">Coordinador de Especialidades Médicas</span>:
                </p>
                <a
                  href="tel:+51945946714"
                  className="flex items-center gap-3 mt-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <div className="bg-white/20 rounded-lg p-1.5">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 leading-none mb-0.5">Teléfono de coordinación</p>
                    <p className="font-bold text-base tracking-wide">+51 945 946 714</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setModalNuevoPaciente(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">

        {/* ── Cards de estadísticas ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total */}
          <button
            onClick={() => cambiarGrupo('TODOS')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left shadow-sm hover:shadow-md ${
              filtroGrupo === 'TODOS'
                ? 'border-blue-500 bg-blue-600 text-white shadow-blue-200'
                : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300'
            }`}
          >
            <div className={`p-2 rounded-lg ${filtroGrupo === 'TODOS' ? 'bg-white/20' : 'bg-blue-50'}`}>
              <Users className={`w-5 h-5 ${filtroGrupo === 'TODOS' ? 'text-white' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold leading-none ${filtroGrupo === 'TODOS' ? 'text-white' : 'text-blue-700'}`}>
                {loading ? '…' : totalGeneral}
              </p>
              <p className={`text-xs font-medium mt-0.5 ${filtroGrupo === 'TODOS' ? 'text-blue-100' : 'text-slate-500'}`}>
                Total pacientes
              </p>
            </div>
          </button>

          {/* Atendidos */}
          <button
            onClick={() => cambiarGrupo('ATENDIDO')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left shadow-sm hover:shadow-md ${
              filtroGrupo === 'ATENDIDO'
                ? 'border-emerald-500 bg-emerald-600 text-white shadow-emerald-200'
                : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300'
            }`}
          >
            <div className={`p-2 rounded-lg ${filtroGrupo === 'ATENDIDO' ? 'bg-white/20' : 'bg-emerald-50'}`}>
              <CheckCircle className={`w-5 h-5 ${filtroGrupo === 'ATENDIDO' ? 'text-white' : 'text-emerald-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold leading-none ${filtroGrupo === 'ATENDIDO' ? 'text-white' : 'text-emerald-700'}`}>
                {loading ? '…' : statsGlobal.ATENDIDO}
              </p>
              <p className={`text-xs font-medium mt-0.5 ${filtroGrupo === 'ATENDIDO' ? 'text-emerald-100' : 'text-slate-500'}`}>
                Atendidos
              </p>
            </div>
          </button>

          {/* Pendientes */}
          <button
            onClick={() => cambiarGrupo('PENDIENTE')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left shadow-sm hover:shadow-md ${
              filtroGrupo === 'PENDIENTE'
                ? 'border-slate-600 bg-slate-700 text-white shadow-slate-200'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
            }`}
          >
            <div className={`p-2 rounded-lg ${filtroGrupo === 'PENDIENTE' ? 'bg-white/20' : 'bg-slate-100'}`}>
              <Clock className={`w-5 h-5 ${filtroGrupo === 'PENDIENTE' ? 'text-white' : 'text-slate-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold leading-none ${filtroGrupo === 'PENDIENTE' ? 'text-white' : 'text-slate-700'}`}>
                {loading ? '…' : statsGlobal.PENDIENTE}
              </p>
              <p className={`text-xs font-medium mt-0.5 ${filtroGrupo === 'PENDIENTE' ? 'text-slate-200' : 'text-slate-500'}`}>
                Pendientes
              </p>
            </div>
          </button>

          {/* Deserción */}
          <button
            onClick={() => cambiarGrupo('DESERCION')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left shadow-sm hover:shadow-md ${
              filtroGrupo === 'DESERCION'
                ? 'border-red-500 bg-red-500 text-white shadow-red-200'
                : 'border-slate-200 bg-white text-slate-800 hover:border-red-300'
            }`}
          >
            <div className={`p-2 rounded-lg ${filtroGrupo === 'DESERCION' ? 'bg-white/20' : 'bg-red-50'}`}>
              <AlertTriangle className={`w-5 h-5 ${filtroGrupo === 'DESERCION' ? 'text-white' : 'text-red-500'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold leading-none ${filtroGrupo === 'DESERCION' ? 'text-white' : 'text-red-600'}`}>
                {loading ? '…' : statsGlobal.DESERCION}
              </p>
              <p className={`text-xs font-medium mt-0.5 ${filtroGrupo === 'DESERCION' ? 'text-red-100' : 'text-slate-500'}`}>
                Deserción
              </p>
            </div>
          </button>
        </div>

        {/* ── Barra de búsqueda y filtros ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center flex-wrap">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px] w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={e => handleBusqueda(e.target.value)}
              placeholder="Buscar por DNI o nombre del paciente…"
              className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {busqueda && (
              <button
                onClick={() => handleBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro especialidad */}
          <div className="relative shrink-0">
            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filtroEspecialidad}
              onChange={e => handleEspecialidad(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 appearance-none cursor-pointer"
            >
              <option value="">Todas las especialidades</option>
              {especialidadesStat.map(({ especialidad, total }) => (
                <option key={especialidad} value={especialidad}>
                  {especialidad} ({total})
                </option>
              ))}
            </select>
          </div>

          {/* Indicador */}
          <p className="text-sm text-slate-500 whitespace-nowrap shrink-0">
            {loading ? 'Cargando…' : (
              <span>
                <span className="font-bold text-slate-800">{pacientesFiltrados.length}</span> de{' '}
                <span className="font-bold text-slate-800">{totalElementos}</span> pacientes
              </span>
            )}
          </p>

          {/* Limpiar filtros */}
          {(busqueda || filtroGrupo !== 'TODOS' || filtroEspecialidad) && (
            <button
              onClick={() => { setBusqueda(''); setFiltroGrupo('TODOS'); setFiltroEspecialidad(''); cargar(0, '', 'TODOS', ''); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Error al cargar datos</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <button
                onClick={() => cargar(pagina)}
                className="mt-2 text-xs text-red-700 underline hover:no-underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* ── Tabla ── */}
        {!error && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Leyenda de grupo seleccionado */}
            {filtroGrupo !== 'TODOS' && (
              <div className={`px-4 py-2 border-b text-xs font-semibold flex items-center gap-2 ${
                filtroGrupo === 'ATENDIDO'    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                filtroGrupo === 'PENDIENTE'   ? 'bg-slate-50   border-slate-200   text-slate-600'   :
                filtroGrupo === 'DESERCION'   ? 'bg-red-50     border-red-200     text-red-700'     :
                                                'bg-slate-50   border-slate-200   text-slate-600'
              }`}>
                {filtroGrupo === 'ATENDIDO'    && <><CheckCircle   className="w-3.5 h-3.5" /> Mostrando pacientes ATENDIDOS</>}
                {filtroGrupo === 'PENDIENTE'   && <><Clock         className="w-3.5 h-3.5" /> Mostrando pacientes PENDIENTES</>}
                {filtroGrupo === 'DESERCION'   && <><AlertTriangle className="w-3.5 h-3.5" /> Mostrando pacientes con DESERCIÓN</>}
                {filtroGrupo === 'SIN_ATENCION'&& <><Clock         className="w-3.5 h-3.5" /> Mostrando pacientes SIN ATENCIÓN registrada</>}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-xs w-10">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-xs">DNI</th>
                    <th className="px-4 py-3 text-left font-semibold text-xs">Paciente</th>
                    <th className="px-4 py-3 text-left font-semibold text-xs hidden md:table-cell">IPRESS</th>
                    <th className="px-4 py-3 text-left font-semibold text-xs hidden lg:table-cell">Especialidad</th>
                    <th className="px-4 py-3 text-left font-semibold text-xs">Estado</th>
                    <th className="px-4 py-3 text-left font-semibold text-xs hidden md:table-cell">Fecha Cita</th>
                    {filtroGrupo === 'ATENDIDO' && (
                      <th className="px-4 py-3 text-left font-semibold text-xs hidden md:table-cell">Fecha Atención</th>
                    )}
                    <th className="px-4 py-3 text-left font-semibold text-xs hidden lg:table-cell">Teléfono</th>
                  </tr>
                </thead>

                <tbody>
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                    : pacientesFiltrados.length === 0
                      ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <Users className="w-10 h-10 text-slate-300" />
                              <p className="text-slate-500 font-medium">No se encontraron pacientes</p>
                              <p className="text-slate-400 text-xs">
                                {busqueda
                                  ? `No hay resultados para "${busqueda}"`
                                  : 'No hay pacientes PADOMI registrados en este estado.'}
                              </p>
                              {(busqueda || filtroGrupo !== 'TODOS' || filtroEspecialidad) && (
                                <button
                                  onClick={() => { setBusqueda(''); setFiltroGrupo('TODOS'); setFiltroEspecialidad(''); cargar(0, '', 'TODOS', ''); }}
                                  className="text-xs text-blue-600 hover:underline mt-1"
                                >
                                  Ver todos los pacientes
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                      : pacientesFiltrados.map((p, idx) => {
                          const meta = getCondicionMeta(p.condicion_medica);

                          return (
                            <tr
                              key={p.id_solicitud ?? idx}
                              className={`border-b border-slate-100 transition-colors ${
                                meta.grupo === 'ATENDIDO'  ? 'hover:bg-emerald-50' :
                                meta.grupo === 'DESERCION' ? 'hover:bg-red-50'     :
                                'hover:bg-slate-50'
                              }`}
                            >
                              {/* # */}
                              <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                                {pagina * PAGE_SIZE + idx + 1}
                              </td>

                              {/* DNI */}
                              <td className="px-4 py-3 font-mono text-xs text-slate-700 font-semibold">
                                {p.paciente_dni ?? '—'}
                              </td>

                              {/* Nombre */}
                              <td className="px-4 py-3">
                                <p className="font-semibold text-slate-800 text-xs">
                                  {p.paciente_nombre ?? '—'}
                                </p>
                                {p.paciente_edad && (
                                  <p className="text-slate-400 text-xs">{p.paciente_edad} años · {p.paciente_sexo ?? '—'}</p>
                                )}
                              </td>

                              {/* IPRESS */}
                              <td className="px-4 py-3 hidden md:table-cell">
                                <p className="text-xs text-slate-700 line-clamp-1">{p.desc_ipress ?? p.codigo_ipress ?? '—'}</p>
                                {p.desc_red && (
                                  <p className="text-xs text-slate-400 mt-0.5">{p.desc_red}</p>
                                )}
                              </td>

                              {/* Especialidad */}
                              <td className="px-4 py-3 hidden lg:table-cell">
                                <span className="text-xs text-slate-600">{p.especialidad ?? '—'}</span>
                              </td>

                              {/* Estado (condicion_medica) */}
                              <td className="px-4 py-3">
                                <CondicionBadge valor={p.condicion_medica} />
                              </td>

                              {/* Fecha cita */}
                              <td className="px-4 py-3 hidden md:table-cell">
                                {p.fecha_atencion ? (
                                  <div>
                                    <p className="text-xs text-slate-700 font-medium">{fmtFecha(p.fecha_atencion)}</p>
                                    {p.hora_atencion && (
                                      <p className="text-xs text-slate-400">{String(p.hora_atencion).slice(0, 5)}</p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </td>

                              {/* Fecha Atención (solo cuando filtro = ATENDIDO) */}
                              {filtroGrupo === 'ATENDIDO' && (
                                <td className="px-4 py-3 hidden md:table-cell">
                                  {(p.fecha_atencion_medica || p.fecha_cambio_estado) ? (
                                    <p className="text-xs text-emerald-700 font-medium">
                                      {new Date(p.fecha_atencion_medica ?? p.fecha_cambio_estado).toLocaleString('es-PE', {
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                      })}
                                    </p>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">—</span>
                                  )}
                                </td>
                              )}

                              {/* Teléfono */}
                              <td className="px-4 py-3 hidden lg:table-cell">
                                {p.paciente_telefono ? (
                                  <a
                                    href={`tel:${p.paciente_telefono}`}
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {p.paciente_telefono}
                                  </a>
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                  }
                </tbody>
              </table>
            </div>

            {/* ── Paginación ── */}
            {!loading && totalPaginas > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-500">
                  Página <span className="font-bold">{pagina + 1}</span> de <span className="font-bold">{totalPaginas}</span>
                  {' · '}<span className="font-bold">{totalElementos}</span> pacientes en total
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cargar(pagina - 1)}
                    disabled={pagina === 0 || loading}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    const pg = Math.max(0, Math.min(pagina - 2, totalPaginas - 5)) + i;
                    return (
                      <button
                        key={pg}
                        onClick={() => cargar(pg)}
                        disabled={loading}
                        className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${
                          pg === pagina
                            ? 'bg-blue-600 text-white border border-blue-600'
                            : 'border border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        {pg + 1}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => cargar(pagina + 1)}
                    disabled={pagina >= totalPaginas - 1 || loading}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
