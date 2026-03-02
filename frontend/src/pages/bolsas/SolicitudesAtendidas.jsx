import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import HistorialPacienteBtn from '../../components/trazabilidad/HistorialPacienteBtn';
import {
  Search, CheckCircle, ChevronLeft, ChevronRight, Calendar,
  RefreshCw, ChevronDown, Users, RotateCcw, X, AlertTriangle
} from 'lucide-react';
import bolsasService from '../../services/bolsasService';
import toast from 'react-hot-toast';

/**
 * SolicitudesAtendidas v5.0.0
 * + Multi-select con barra flotante
 * + Devolver a Pendientes con modal de motivo (v1.81.5)
 */

const ESTADOS_GESTIONADOS =
  'CITADO,ATENDIDO_IPRESS,HC_BLOQUEADA,NO_DESEA,NO_GRUPO_ETARIO,' +
  'SIN_VIGENCIA,NUM_NO_EXISTE,TEL_SIN_SERVICIO,YA_NO_REQUIERE,' +
  'REPROG_FALLIDA,APAGADO,FALLECIDO,DESERCION,ANULADO,ANULADA,' +
  'PARTICULAR,NO_IPRESS_CENATE,HOSPITALIZADO';

const ESTADOS_OPCIONES = ESTADOS_GESTIONADOS.split(',').sort();
const PAGE_SIZE = 50;

const ESTADO_BADGE = {
  CITADO:           { bg: 'bg-blue-100',   text: 'text-blue-800'   },
  ATENDIDO_IPRESS:  { bg: 'bg-green-100',  text: 'text-green-800'  },
  HC_BLOQUEADA:     { bg: 'bg-red-100',    text: 'text-red-800'    },
  NO_DESEA:         { bg: 'bg-orange-100', text: 'text-orange-800' },
  NO_GRUPO_ETARIO:  { bg: 'bg-purple-100', text: 'text-purple-800' },
  SIN_VIGENCIA:     { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  NUM_NO_EXISTE:    { bg: 'bg-gray-100',   text: 'text-gray-700'   },
  TEL_SIN_SERVICIO: { bg: 'bg-gray-100',   text: 'text-gray-700'   },
  YA_NO_REQUIERE:   { bg: 'bg-orange-100', text: 'text-orange-800' },
  REPROG_FALLIDA:   { bg: 'bg-red-100',    text: 'text-red-700'    },
  APAGADO:          { bg: 'bg-gray-100',   text: 'text-gray-600'   },
  FALLECIDO:        { bg: 'bg-gray-200',   text: 'text-gray-700'   },
  DESERCION:        { bg: 'bg-amber-100',  text: 'text-amber-800'  },
  ANULADO:          { bg: 'bg-gray-100',   text: 'text-gray-600'   },
  ANULADA:          { bg: 'bg-gray-100',   text: 'text-gray-600'   },
  PARTICULAR:       { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  NO_IPRESS_CENATE: { bg: 'bg-pink-100',   text: 'text-pink-800'   },
  HOSPITALIZADO:    { bg: 'bg-teal-100',   text: 'text-teal-800'   },
};

function getEstadoBadge(cod) {
  const upper = (cod || '').toUpperCase();
  const style = ESTADO_BADGE[upper] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${style.bg} ${style.text} whitespace-nowrap`}>
      {cod || '—'}
    </span>
  );
}

function SortIcon({ columnKey, sortConfig }) {
  const isActive = sortConfig.key === columnKey;
  if (!isActive) return <span className="ml-1 text-white/30 text-xs">⇅</span>;
  return sortConfig.direction === 'asc'
    ? <span className="ml-1 text-yellow-300 font-bold">↑</span>
    : <span className="ml-1 text-yellow-300 font-bold">↓</span>;
}

const COLUMNAS = [
  { label: 'F. Ingreso Bolsa',      key: 'fechaSolicitud',        raw: 'fecha_solicitud'      },
  { label: 'Estado de Bolsa',       key: 'estado'                                              },
  { label: 'Origen de la Bolsa',    key: 'nombreBolsa'                                         },
  { label: 'Fecha Preferida',       key: 'fechaPreferidaNoAtendida'                            },
  { label: 'T-Nº Documento',        key: 'dni'                                                 },
  { label: 'Paciente',              key: 'paciente'                                            },
  { label: 'Teléfonos',             key: 'telefono'                                            },
  { label: 'Tipo de Cita',          key: 'tipoCita'                                            },
  { label: 'Especialidad',          key: 'especialidad'                                        },
  { label: 'IPRESS - Adscripción',  key: 'ipress'                                              },
  { label: 'IPRESS - Atención',     key: 'ipressAtencion'                                      },
  { label: 'Red',                   key: 'red'                                                 },
  { label: 'Estado de Gestora',     key: 'estadoCodigo'                                        },
  { label: 'F/H Cita',              key: 'fechaHoraCita',         raw: 'fecha_atencion'        },
  { label: 'Médico Asignado',       key: 'nombreMedicoAsignado'                                },
  { label: 'Est. Atención Médica',  key: 'condicionMedica'                                     },
  { label: 'F. Atención Méd.',      key: 'fechaAtencionMedica',   raw: 'fecha_atencion_medica' },
  { label: 'Fecha Asignación',      key: 'fechaAsignacion',       raw: 'fecha_asignacion'      },
  { label: 'Gestora Asignada',      key: 'gestoraAsignada'                                     },
  { label: 'Usuario Cambio Estado', key: 'usuarioCambioEstado'                                 },
];

const RAW_FIELD = {
  fechaSolicitud:      'fecha_solicitud',
  fechaHoraCita:       'fecha_atencion',
  fechaAtencionMedica: 'fecha_atencion_medica',
  fechaAsignacion:     'fecha_asignacion',
};

function mapSolicitud(s) {
  return {
    ...s,
    id: s.id_solicitud,
    dni: s.paciente_dni || '',
    paciente: s.paciente_nombre || '',
    telefono: s.paciente_telefono || '',
    telefonoAlterno: s.paciente_telefono_alterno || '',
    sexo: s.paciente_sexo || 'N/A',
    edad: s.paciente_edad || 'N/A',
    estado: s.estado || 'N/A',
    estadoCodigo: s.cod_estado_cita || '',
    estadoDisplay: s.desc_estado_cita || '',
    especialidad: s.especialidad || '',
    red: s.desc_red || '—',
    ipress: s.desc_ipress || 'N/A',
    macroregion: s.desc_macro || '—',
    nombreBolsa: s.desc_tipo_bolsa || 'Sin clasificar',
    fechaSolicitud: s.fecha_solicitud
      ? new Date(s.fecha_solicitud).toLocaleString('es-PE') : null,
    fechaAsignacion: s.fecha_asignacion
      ? new Date(s.fecha_asignacion).toLocaleString('es-PE', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
        })
      : null,
    gestoraAsignada: s.nombre_gestora || null,
    gestoraAsignadaId: s.responsable_gestora_id,
    fechaPreferidaNoAtendida: s.fecha_preferida_no_atendida
      ? (() => { const [y, m, d] = s.fecha_preferida_no_atendida.split('-'); return `${d}/${m}/${y}`; })()
      : 'N/A',
    tipoDocumento: s.tipo_documento || 'N/A',
    tipoCita: s.tipo_cita ? s.tipo_cita.toUpperCase() : 'N/A',
    ipressAtencion: s.desc_ipress_atencion || 'N/A',
    idIpressAtencion: s.id_ipress_atencion || null,
    codIpressAtencion: s.cod_ipress_atencion || 'N/A',
    fechaHoraCita: s.fecha_atencion && s.hora_atencion
      ? (() => { const [y, m, d] = s.fecha_atencion.split('-'); return `${d}/${m}/${y} ${s.hora_atencion.substring(0, 5)}`; })()
      : s.fecha_atencion
        ? (() => { const [y, m, d] = s.fecha_atencion.split('-'); return `${d}/${m}/${y}`; })()
        : null,
    condicionMedica: s.condicion_medica || null,
    fechaAtencionMedica: s.fecha_atencion_medica
      ? new Date(s.fecha_atencion_medica).toLocaleString('es-PE', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : null,
    nombreMedicoAsignado: s.nombre_medico_asignado || null,
    usuarioCambioEstado: s.nombre_usuario_cambio_estado || null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal: Motivo de devolución
// ─────────────────────────────────────────────────────────────────────────────
function ModalMotivo({ cantidad, onConfirmar, onCancelar, procesando }) {
  const [motivo, setMotivo] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleConfirmar = () => {
    if (!motivo.trim()) {
      toast.error('El motivo es obligatorio');
      return;
    }
    onConfirmar(motivo.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <RotateCcw className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Devolver a Pendientes</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {cantidad} solicitud{cantidad !== 1 ? 'es' : ''} seleccionada{cantidad !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onCancelar} disabled={procesando} className="p-1 rounded-lg hover:bg-amber-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex items-start gap-3 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Las solicitudes volverán al estado <strong>PENDIENTE_CITA</strong>. Se limpiarán el médico asignado, fecha/hora de cita y condición médica. Esta acción queda registrada en base de datos.
            </p>
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Motivo de devolución <span className="text-red-500">*</span>
          </label>
          <textarea
            ref={textareaRef}
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Describe el motivo por el que se devuelven estas solicitudes a pendientes..."
            rows={4}
            maxLength={500}
            disabled={procesando}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none disabled:opacity-50"
          />
          <div className="text-right text-xs text-gray-400 mt-1">{motivo.length}/500</div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button
            onClick={onCancelar}
            disabled={procesando}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={procesando || !motivo.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {procesando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            {procesando ? 'Procesando...' : 'Confirmar devolución'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export default function SolicitudesAtendidas() {
  // ── Estado de datos ────────────────────────────────────────────────────────
  const [solicitudes,    setSolicitudes]    = useState([]);
  const [totalElementos, setTotalElementos] = useState(0);
  const [isLoading,      setIsLoading]      = useState(true);
  const [errorMessage,   setErrorMessage]   = useState('');

  // ── Multi-select ───────────────────────────────────────────────────────────
  const [seleccionados,    setSeleccionados]    = useState(new Set());
  const [modalMotivo,      setModalMotivo]      = useState(false);
  const [procesandoDevolver, setProcesandoDevolver] = useState(false);

  // ── Filtros (server-side) ──────────────────────────────────────────────────
  const [searchTerm,        setSearchTerm]        = useState('');
  const [filtroEstado,      setFiltroEstado]      = useState('todos');
  const [filtroEstadoBolsa, setFiltroEstadoBolsa] = useState('todos');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin,    setFiltroFechaFin]    = useState('');

  // ── Paginación y orden ─────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig,  setSortConfig]  = useState({ key: null, direction: 'asc' });

  const isMountedRef = useRef(true);
  const isFirstLoad  = useRef(true);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    cargarSolicitudes(1);
    return () => { isMountedRef.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-fetch cuando cambian filtros ───────────────────────────────────────
  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return; }
    setCurrentPage(1);
    setSeleccionados(new Set());
    cargarSolicitudes(1);
  }, [filtroEstado, filtroEstadoBolsa, filtroFechaInicio, filtroFechaFin, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-fetch al cambiar de página ─────────────────────────────────────────
  useEffect(() => {
    if (currentPage > 1) cargarSolicitudes(currentPage);
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Función de carga ───────────────────────────────────────────────────────
  const cargarSolicitudes = useCallback(async (page = 1) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const estadoParam = filtroEstado !== 'todos' ? filtroEstado : ESTADOS_GESTIONADOS;

      const response = await bolsasService.obtenerSolicitudesPaginado(
        page - 1, PAGE_SIZE, null, null, null, null, null,
        estadoParam, null, null, null,
        searchTerm.trim() || null,
        filtroFechaInicio || null,
        filtroFechaFin    || null,
        null, null,
        filtroEstadoBolsa !== 'todos' ? filtroEstadoBolsa : null
      );

      if (!isMountedRef.current) return;

      const data  = response?.content || [];
      const total = response?.totalElements ?? data.length;

      setSolicitudes(data.map(mapSolicitud));
      setTotalElementos(total);
    } catch (e) {
      console.error('❌ Error cargando solicitudes atendidas:', e);
      if (isMountedRef.current)
        setErrorMessage('Error al cargar las solicitudes. Intenta nuevamente.');
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [filtroEstado, filtroEstadoBolsa, filtroFechaInicio, filtroFechaFin, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Ordenamiento client-side ───────────────────────────────────────────────
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const sortedSolicitudes = useMemo(() => {
    if (!sortConfig.key) return solicitudes;
    const rawField = RAW_FIELD[sortConfig.key];
    return [...solicitudes].sort((a, b) => {
      let aVal = rawField ? (a[rawField] ?? '') : (a[sortConfig.key] ?? '');
      let bVal = rawField ? (b[rawField] ?? '') : (b[sortConfig.key] ?? '');
      if (rawField && aVal && bVal)
        return sortConfig.direction === 'asc'
          ? new Date(aVal) - new Date(bVal)
          : new Date(bVal) - new Date(aVal);
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [solicitudes, sortConfig]);

  // ── Multi-select helpers ───────────────────────────────────────────────────
  const toggleSeleccion = (id) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    if (seleccionados.size === sortedSolicitudes.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(sortedSolicitudes.map(s => s.id)));
    }
  };

  const todosSeleccionados = sortedSolicitudes.length > 0 && seleccionados.size === sortedSolicitudes.length;
  const algunosSeleccionados = seleccionados.size > 0 && !todosSeleccionados;

  // ── Devolver a pendientes ─────────────────────────────────────────────────
  const handleDevolverAPendientes = async (motivo) => {
    const ids = Array.from(seleccionados);
    setProcesandoDevolver(true);
    try {
      await bolsasService.devolverAPendientes(ids, motivo);
      toast.success(`${ids.length} solicitud${ids.length !== 1 ? 'es' : ''} devuelta${ids.length !== 1 ? 's' : ''} a pendientes`);
      setModalMotivo(false);
      setSeleccionados(new Set());
      cargarSolicitudes(currentPage);
    } catch (e) {
      console.error('Error al devolver solicitudes:', e);
      toast.error('Error al devolver las solicitudes a pendientes');
    } finally {
      setProcesandoDevolver(false);
    }
  };

  // ── Paginación ─────────────────────────────────────────────────────────────
  const totalPaginas   = Math.max(1, Math.ceil(totalElementos / PAGE_SIZE));
  const registroInicio = totalElementos === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const registroFin    = Math.min(currentPage * PAGE_SIZE, totalElementos);

  const hayFiltros = searchTerm || filtroFechaInicio || filtroFechaFin || filtroEstado !== 'todos' || filtroEstadoBolsa !== 'todos';

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
    setFiltroEstado('todos');
    setFiltroEstadoBolsa('todos');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-4">

      {/* Modal motivo */}
      {modalMotivo && (
        <ModalMotivo
          cantidad={seleccionados.size}
          onConfirmar={handleDevolverAPendientes}
          onCancelar={() => setModalMotivo(false)}
          procesando={procesandoDevolver}
        />
      )}

      {/* Barra flotante multi-select */}
      {seleccionados.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-700 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
              {seleccionados.size}
            </div>
            <span className="text-sm font-medium">
              solicitud{seleccionados.size !== 1 ? 'es' : ''} seleccionada{seleccionados.size !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="w-px h-6 bg-gray-600" />
          <button
            onClick={() => setModalMotivo(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Devolver a Pendientes
          </button>
          <button
            onClick={() => setSeleccionados(new Set())}
            className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
            title="Limpiar selección"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* ENCABEZADO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-100">
            <CheckCircle className="text-green-600" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Solicitudes Atendidas</h1>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{totalElementos.toLocaleString('es-PE')}</span>
              {hayFiltros ? ' registros (filtrados)' : ' registros gestionados por las coordinadoras'}
            </p>
          </div>
        </div>
        <button
          onClick={() => cargarSolicitudes(currentPage)}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Buscar por DNI..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">Estado de Bolsa</label>
            <select
              value={filtroEstadoBolsa}
              onChange={e => setFiltroEstadoBolsa(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="todos">Todos</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="OBSERVADO">OBSERVADO</option>
              <option value="ATENDIDO">ATENDIDO</option>
            </select>
            <ChevronDown className="absolute right-3 bottom-2 text-gray-400 pointer-events-none" size={14} />
          </div>

          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">Estado de Gestora</label>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="todos">Todos</option>
              {ESTADOS_OPCIONES.map(cod => (
                <option key={cod} value={cod}>{cod}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 bottom-2 text-gray-400 pointer-events-none" size={14} />
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <Calendar size={12} className="text-gray-400" />
              <label className="text-xs font-medium text-gray-500">Desde</label>
            </div>
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={e => setFiltroFechaInicio(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <Calendar size={12} className="text-gray-400" />
              <label className="text-xs font-medium text-gray-500">Hasta</label>
            </div>
            <input
              type="date"
              value={filtroFechaFin}
              onChange={e => setFiltroFechaFin(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {hayFiltros && (
          <div className="mt-2 flex justify-end">
            <button onClick={limpiarFiltros} className="text-xs text-blue-600 hover:underline">
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {isLoading && (
          <div className="flex flex-col justify-center items-center py-24 gap-3">
            <div className="animate-spin w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-500">Cargando registros...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="p-10 text-center">
            <p className="text-red-600 font-medium">{errorMessage}</p>
            <button
              onClick={() => cargarSolicitudes(currentPage)}
              className="mt-3 px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && solicitudes.length === 0 && (
          <div className="p-14 text-center">
            <Users className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-500">
              {hayFiltros
                ? 'No se encontraron registros con los filtros aplicados.'
                : 'No se encontraron solicitudes gestionadas.'}
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && solicitudes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#0D5BA9] text-white sticky top-0 z-40">
                <tr className="border-b-2 border-blue-900">
                  {/* Checkbox "seleccionar todos" */}
                  <th className="px-3 py-3 text-center bg-[#0D5BA9] w-10">
                    <input
                      type="checkbox"
                      checked={todosSeleccionados}
                      ref={el => { if (el) el.indeterminate = algunosSeleccionados; }}
                      onChange={toggleTodos}
                      className="w-4 h-4 rounded cursor-pointer accent-amber-400"
                      title="Seleccionar todos"
                    />
                  </th>
                  <th className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider whitespace-nowrap bg-[#0D5BA9] w-10">#</th>
                  {COLUMNAS.map(({ label, key }) => {
                    const isActive = sortConfig.key === key;
                    return (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className={`px-3 py-3 text-left text-sm font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none transition-colors
                          ${isActive ? 'bg-[#073f7a]' : 'bg-[#0D5BA9] hover:bg-[#0a4f96]'}`}
                      >
                        {label}<SortIcon columnKey={key} sortConfig={sortConfig} />
                      </th>
                    );
                  })}
                  {/* Columna acciones */}
                  <th className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider whitespace-nowrap bg-[#0D5BA9] w-20">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSolicitudes.map((s, idx) => {
                  const estaSeleccionado = seleccionados.has(s.id);
                  return (
                    <tr
                      key={s.id ?? idx}
                      className={`border-b border-gray-100 transition-colors ${
                        estaSeleccionado ? 'bg-amber-50 border-amber-200' : 'hover:bg-blue-50/40'
                      }`}
                    >
                      {/* Checkbox individual */}
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={estaSeleccionado}
                          onChange={() => toggleSeleccion(s.id)}
                          className="w-4 h-4 rounded cursor-pointer accent-amber-500"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs text-gray-400 font-medium">
                        {registroInicio + idx}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.fechaSolicitud || '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.estado || '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          {s.nombreBolsa}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.fechaPreferidaNoAtendida || '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="text-xs font-semibold text-gray-500">{s.tipoDocumento}</div>
                        <div className="font-bold text-blue-700">{s.dni}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-gray-900 whitespace-nowrap">{s.paciente}</div>
                        <HistorialPacienteBtn dni={s.dni} nombrePaciente={s.paciente} />
                        <div className="text-xs text-gray-400">{s.sexo} · {s.edad} años</div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">
                        <div>{s.telefono || '—'}</div>
                        {s.telefonoAlterno && <div className="text-gray-400">{s.telefonoAlterno}</div>}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.tipoCita || '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.especialidad || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 max-w-[160px] truncate" title={s.ipress}>{s.ipress}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 max-w-[160px] truncate" title={s.ipressAtencion}>{s.ipressAtencion}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.red}</td>
                      <td className="px-3 py-2.5">{getEstadoBadge(s.estadoCodigo)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.fechaHoraCita || '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.nombreMedicoAsignado || '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.condicionMedica || '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.fechaAtencionMedica || '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.fechaAsignacion || '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.gestoraAsignada || '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">{s.usuarioCambioEstado || '—'}</td>
                      {/* Acciones */}
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => {
                            setSeleccionados(new Set([s.id]));
                            setModalMotivo(true);
                          }}
                          title="Devolver a Pendientes"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-medium"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Devolver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINACIÓN */}
        {!isLoading && totalElementos > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600 font-medium">
              Mostrando{' '}
              <span className="font-bold text-gray-900">{registroInicio}</span>–
              <span className="font-bold text-gray-900">{registroFin}</span> de{' '}
              <span className="font-bold text-gray-900">{totalElementos.toLocaleString('es-PE')}</span>
              {seleccionados.size > 0 && (
                <span className="ml-3 text-amber-600 font-semibold">
                  · {seleccionados.size} seleccionada{seleccionados.size !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={13} /> Anterior
                </button>
                <span className="text-xs font-semibold text-gray-700 px-2">
                  {currentPage} / {totalPaginas}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPaginas, p + 1))}
                  disabled={currentPage === totalPaginas || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
