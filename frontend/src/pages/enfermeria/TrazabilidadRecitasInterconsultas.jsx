import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, GitBranch, RefreshCw, ChevronLeft, ChevronRight,
  Calendar, Filter, FileText, ClipboardList, Stethoscope,
  Pencil, Check, X, AlertCircle, ChevronUp, ChevronDown, ArrowUpDown
} from 'lucide-react';

/**
 * TrazabilidadRecitasInterconsultas v2.0.0
 * Vista Coordinadora de Enfermería — quién generó cada recita/interconsulta.
 * Diseño estándar CENATE: header coloreado, KPIs, filtros, tabla zebra.
 */

const PAGE_SIZE = 25;

// ─── Calendario de rango ──────────────────────────────────────────────────────
const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toYMD(d) {
  if (!d) return null;
  const p = d instanceof Date ? d : new Date(d + 'T12:00:00');
  return `${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,'0')}-${String(p.getDate()).padStart(2,'0')}`;
}

function RangoFechas({ inicio, fin, onCambio, fechasConDatos = new Map() }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(null);
  const today = new Date();
  const [mes, setMes] = useState(today.getMonth());
  const [anio, setAnio] = useState(today.getFullYear());
  const ref = useRef(null);

  // cerrar al hacer click fuera
  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function diasDelMes(m, a) {
    const primero = new Date(a, m, 1);
    const ultimo  = new Date(a, m + 1, 0);
    // lunes = 0
    const offset = (primero.getDay() + 6) % 7;
    const celdas = [];
    for (let i = 0; i < offset; i++) celdas.push(null);
    for (let d = 1; d <= ultimo.getDate(); d++) celdas.push(new Date(a, m, d));
    return celdas;
  }

  function handleDia(d) {
    const ymd = toYMD(d);
    if (!inicio || (inicio && fin)) {
      onCambio(ymd, null);
    } else {
      if (ymd < inicio) onCambio(ymd, inicio);
      else              onCambio(inicio, ymd);
      setOpen(false);
      setHover(null);
    }
  }

  function inRango(d) {
    const ymd = toYMD(d);
    const end = hover || fin;
    if (!inicio || !end) return false;
    const [a, b] = inicio <= end ? [inicio, end] : [end, inicio];
    return ymd > a && ymd < b;
  }
  function esInicio(d)    { return toYMD(d) === inicio; }
  function esFin(d)      { return toYMD(d) === fin; }
  function esHoy(d)      { return toYMD(d) === toYMD(today); }
  function conteoFecha(d) { return fechasConDatos.get(toYMD(d)) ?? 0; }

  const label = inicio && fin
    ? `${inicio.split('-').reverse().join('/')} — ${fin.split('-').reverse().join('/')}`
    : inicio
    ? `Desde ${inicio.split('-').reverse().join('/')}`
    : 'F. preferida';

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        <Calendar size={11} className="inline mr-1" />F. Preferida
      </label>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 py-2 px-3 text-sm border border-gray-300 rounded-lg bg-white hover:border-[#0a5ba9] focus:outline-none focus:ring-2 focus:ring-[#0a5ba9] whitespace-nowrap"
      >
        <Calendar size={14} className="text-gray-400" />
        <span className={inicio ? 'text-gray-800' : 'text-gray-400'}>{label}</span>
        {(inicio || fin) && (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); onCambio(null, null); }}
            className="ml-1 text-gray-400 hover:text-red-500"
          >✕</span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-72">
          {/* Navegación mes */}
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => { if (mes === 0) { setMes(11); setAnio(a => a-1); } else setMes(m => m-1); }}
              className="p-1 rounded hover:bg-gray-100"><ChevronLeft size={14}/></button>
            <span className="text-sm font-semibold text-gray-700">{MESES[mes]} {anio}</span>
            <button onClick={() => { if (mes === 11) { setMes(0); setAnio(a => a+1); } else setMes(m => m+1); }}
              className="p-1 rounded hover:bg-gray-100"><ChevronRight size={14}/></button>
          </div>

          {/* Días de semana */}
          <div className="grid grid-cols-7 mb-1">
            {DIAS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-0.5">{d}</div>
            ))}
          </div>

          {/* Celdas */}
          <div className="grid grid-cols-7">
            {diasDelMes(mes, anio).map((d, i) => {
              if (!d) return <div key={`e${i}`} />;
              const enRango   = inRango(d);
              const esI       = esInicio(d);
              const esF       = esFin(d);
              const esH    = esHoy(d);
              const selec  = esI || esF;
              const conteo = conteoFecha(d);
              const label  = conteo > 9 ? '9+' : conteo > 0 ? String(conteo) : null;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDia(d)}
                  onMouseEnter={() => inicio && !fin && setHover(toYMD(d))}
                  onMouseLeave={() => setHover(null)}
                  className={[
                    'relative text-xs py-0.5 rounded transition-colors flex flex-col items-center leading-none gap-0.5',
                    selec   ? 'bg-[#0a5ba9] text-white font-bold' :
                    enRango ? 'bg-blue-100 text-[#0a5ba9]' :
                    conteo > 0 ? 'bg-blue-50 text-[#0a5ba9] font-semibold ring-1 ring-[#0a5ba9]/30' :
                    esH ? 'border border-[#0a5ba9] text-[#0a5ba9] font-semibold' :
                    'hover:bg-gray-100 text-gray-700',
                  ].join(' ')}
                >
                  <span>{d.getDate()}</span>
                  {label && (
                    <span className={`text-[9px] font-bold leading-none ${selec ? 'text-white/90' : 'text-[#0a5ba9]'}`}>
                      {label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {inicio && !fin && (
            <p className="text-xs text-gray-400 text-center mt-2">Selecciona la fecha final</p>
          )}
        </div>
      )}
    </div>
  );
}

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
  } catch { return String(val); }
}

function formatFechaSolo(val) {
  if (!val) return null;
  try {
    return new Date(val + 'T12:00:00').toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return null; }
}

// ─── Badges ──────────────────────────────────────────────────────────────────

function BadgeTipo({ tipo }) {
  const t = tipo?.toUpperCase();
  if (t === 'RECITA')
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">RECITA</span>;
  if (t === 'INTERCONSULTA')
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">INTERCONSULTA</span>;
  return <span className="text-xs text-gray-400">—</span>;
}

function BadgeEstado({ cod, desc }) {
  const map = {
    PENDIENTE_CITA: 'bg-gray-100 text-gray-600 border-gray-200',
    CITADO:         'bg-blue-100 text-blue-700 border-blue-200',
    ATENDIDO:       'bg-green-100 text-green-700 border-green-200',
    NO_ASISTIO:     'bg-red-100 text-red-600 border-red-200',
    RECHAZADO:      'bg-red-100 text-red-600 border-red-200',
  };
  const cls = map[cod] || 'bg-gray-100 text-gray-600 border-gray-200';
  const label = (cod || desc || '—').split('_')[0];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Celda de fecha preferida editable ───────────────────────────────────────

function CeldaFechaPreferida({ fila, onGuardar }) {
  const [editando,   setEditando]   = useState(false);
  const [fechaInput, setFechaInput] = useState('');
  const [guardando,  setGuardando]  = useState(false);
  const inputRef = useRef(null);

  const abrir = () => {
    setFechaInput(fila.fechaPreferida ? fila.fechaPreferida.split('T')[0] : '');
    setEditando(true);
    setTimeout(() => inputRef.current?.showPicker?.(), 50);
  };

  const guardar = async () => {
    setGuardando(true);
    await onGuardar(fila.idSolicitud, fechaInput || null);
    setGuardando(false);
    setEditando(false);
  };

  if (editando) {
    return (
      <div className="flex items-center gap-1 min-w-max">
        <input
          ref={inputRef}
          type="date"
          value={fechaInput}
          onChange={e => setFechaInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') guardar();
            if (e.key === 'Escape') setEditando(false);
          }}
          autoFocus
          className="text-xs border border-blue-400 rounded px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-[#0a5ba9] bg-white"
        />
        <button
          onClick={guardar}
          disabled={guardando}
          className="p-1 rounded hover:bg-green-100 text-green-600 disabled:opacity-50"
          title="Guardar"
        >
          <Check size={13} />
        </button>
        <button
          onClick={() => setEditando(false)}
          className="p-1 rounded hover:bg-red-100 text-red-500"
          title="Cancelar"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  const fechaDisplay = formatFechaSolo(fila.fechaPreferida);
  return (
    <div className="flex items-center gap-1 group">
      <span className={fechaDisplay ? 'text-xs font-semibold text-[#0a5ba9]' : 'text-xs text-gray-400 italic'}>
        {fechaDisplay || 'Sin fecha'}
      </span>
      <button
        onClick={abrir}
        className="p-1 rounded hover:bg-blue-100 text-blue-400 hover:text-[#0a5ba9] transition-colors"
        title="Editar fecha preferida"
      >
        <Pencil size={11} />
      </button>
    </div>
  );
}

// ─── Buscador de enfermera con autocomplete ───────────────────────────────────

function BuscadorEnfermera({ value, onChange }) {
  const [lista,    setLista]    = useState([]);
  const [texto,    setTexto]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [cargando, setCargando] = useState(false);
  const ref = useRef(null);

  // cargar lista al montar
  useEffect(() => {
    setCargando(true);
    fetch(`${API_BASE}/bolsas/solicitudes/trazabilidad-recitas/enfermeras`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => setLista(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  // cerrar al click fuera
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const seleccionado = lista.find(e => String(e.idPersonal) === String(value));
  const filtradas = texto.trim()
    ? lista.filter(e => e.nombre?.toLowerCase().includes(texto.trim().toLowerCase()))
    : lista;

  function seleccionar(item) {
    onChange(item ? String(item.idPersonal) : '');
    setTexto('');
    setOpen(false);
  }

  return (
    <div className="relative min-w-[220px]" ref={ref}>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        <Search size={11} className="inline mr-1" />Enfermera / Profesional
      </label>

      {/* campo principal */}
      <div
        className={`flex items-center gap-1 py-2 px-3 text-sm border rounded-lg bg-white cursor-text
          ${open ? 'border-[#0a5ba9] ring-2 ring-[#0a5ba9]/20' : 'border-gray-300 hover:border-[#0a5ba9]'}`}
        onClick={() => setOpen(true)}
      >
        {seleccionado && !open ? (
          <>
            <span className="flex-1 truncate text-gray-800 text-xs">{seleccionado.nombre}</span>
            <span className="text-xs bg-[#0a5ba9] text-white rounded-full px-1.5 py-0.5 font-bold">{seleccionado.total}</span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); seleccionar(null); }}
              className="text-gray-400 hover:text-red-500 ml-1"
            >✕</button>
          </>
        ) : (
          <input
            autoFocus={open}
            type="text"
            value={texto}
            placeholder={seleccionado ? seleccionado.nombre : cargando ? 'Cargando…' : 'Buscar profesional…'}
            onChange={e => { setTexto(e.target.value); setOpen(true); }}
            className="flex-1 outline-none bg-transparent text-sm min-w-0"
          />
        )}
      </div>

      {/* dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filtradas.length === 0 ? (
            <div className="px-3 py-4 text-xs text-gray-400 text-center">Sin resultados</div>
          ) : (
            filtradas.map(item => (
              <button
                key={item.idPersonal}
                type="button"
                onClick={() => seleccionar(item)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-blue-50 transition-colors
                  ${String(item.idPersonal) === String(value) ? 'bg-blue-50 font-semibold' : ''}`}
              >
                <span className="text-xs text-gray-800 truncate flex-1">{item.nombre}</span>
                <span className="ml-2 text-xs font-bold text-[#0a5ba9] bg-blue-100 rounded-full px-2 py-0.5 whitespace-nowrap">
                  {item.total} caso{item.total !== 1 ? 's' : ''}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Columnas de la tabla (fuera del componente — constante estática) ────────
const COLUMNAS = [
  { label: 'F. Generación',              field: 'fechaSolicitud',  sortable: true  },
  { label: 'Tipo',                       field: 'tipoCita',        sortable: true  },
  { label: 'Paciente',                   field: 'pacienteNombre',  sortable: true  },
  { label: 'DNI',                        field: 'pacienteDni',     sortable: true  },
  { label: 'Especialidad',               field: 'especialidad',    sortable: true  },
  { label: 'Motivo interconsulta',       field: null,              sortable: false },
  { label: 'Origen bolsa',               field: 'origenBolsa',     sortable: true  },
  { label: 'Estado de Bolsa',            field: 'estadoBolsa',     sortable: true  },
  { label: 'Fecha preferida',            field: 'fechaPreferida',  sortable: true  },
  { label: 'Creado por',                 field: 'medicoCreador',   sortable: true  },
  { label: 'Estado',                     field: null,              sortable: false },
  { label: 'Estado de Personal Asist.', field: 'condicionMedica', sortable: true  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TrazabilidadRecitasInterconsultas() {
  const [filas,        setFilas]        = useState([]);
  const [total,        setTotal]        = useState(0);
  const [isLoading,    setIsLoading]    = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchTerm,        setSearchTerm]        = useState('');
  const [filtroTipo,        setFiltroTipo]        = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin,    setFiltroFechaFin]    = useState('');
  const [filtroEnfermera,   setFiltroEnfermera]   = useState('');
  const [fechasConDatos,    setFechasConDatos]    = useState(new Map());
  const [kpis,              setKpis]              = useState({ total: 0, recitas: 0, interconsultas: 0, sinCreador: 0 });

  const [filtroEspecialidad,       setFiltroEspecialidad]       = useState('');
  const [filtroMotivoInterconsulta, setFiltroMotivoInterconsulta] = useState('');
  const [filtroEstadoBolsa,        setFiltroEstadoBolsa]        = useState('');
  const [filtroCreadoPor,          setFiltroCreadoPor]          = useState('');
  const [facetas, setFacetas] = useState({ especialidades: [], motivos: [], estadosBolsa: [], creadosPor: [] });

  const [currentPage, setCurrentPage] = useState(1);
  const [sortDir,   setSortDir]   = useState('desc');           // 'desc' | 'asc'
  const [sortField, setSortField] = useState('fechaSolicitud'); // campo activo

  const isMountedRef = useRef(true);
  const isFirstLoad  = useRef(true);

  // Cargar KPIs globales y fechas al montar
  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    fetch(`${API_BASE}/bolsas/solicitudes/trazabilidad-recitas/kpis`, { headers })
      .then(r => r.json())
      .then(data => setKpis({
        total:          Number(data.total          ?? 0),
        recitas:        Number(data.recitas        ?? 0),
        interconsultas: Number(data.interconsultas ?? 0),
        sinCreador:     Number(data.sinCreador     ?? 0),
      }))
      .catch(() => {});

    fetch(`${API_BASE}/bolsas/solicitudes/trazabilidad-recitas/fechas`, { headers })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data))
          setFechasConDatos(new Map(data.map(d => [String(d.fecha).substring(0, 10), Number(d.total)])));
      })
      .catch(() => {});

    fetch(`${API_BASE}/bolsas/solicitudes/trazabilidad-recitas/facetas`, { headers })
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setFacetas({
            especialidades: Array.isArray(data.especialidades) ? data.especialidades : [],
            motivos:        Array.isArray(data.motivos)        ? data.motivos        : [],
            estadosBolsa:   Array.isArray(data.estadosBolsa)   ? data.estadosBolsa   : [],
            creadosPor:     Array.isArray(data.creadosPor)     ? data.creadosPor     : [],
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    cargar(1);
    return () => { isMountedRef.current = false; };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return; }
    setCurrentPage(1);
    cargar(1);
  }, [filtroFechaInicio, filtroFechaFin, filtroTipo, searchTerm, filtroEnfermera, sortDir, sortField, filtroEspecialidad, filtroMotivoInterconsulta, filtroEstadoBolsa, filtroCreadoPor]); // eslint-disable-line

  useEffect(() => {
    if (currentPage > 1) cargar(currentPage);
  }, [currentPage]); // eslint-disable-line

  const cargar = useCallback(async (page = 1) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const p = new URLSearchParams();
      p.set('page', page - 1);
      p.set('size', PAGE_SIZE);
      if (searchTerm.trim())            p.set('busqueda',             searchTerm.trim());
      if (filtroFechaInicio)            p.set('fechaInicio',          filtroFechaInicio);
      if (filtroFechaFin)               p.set('fechaFin',             filtroFechaFin);
      if (filtroTipo)                   p.set('tipoCita',             filtroTipo);
      if (filtroEnfermera)              p.set('idPersonal',           filtroEnfermera);
      if (filtroEspecialidad.trim())    p.set('especialidad',         filtroEspecialidad.trim());
      if (filtroMotivoInterconsulta.trim()) p.set('motivoInterconsulta', filtroMotivoInterconsulta.trim());
      if (filtroEstadoBolsa.trim())     p.set('estadoBolsa',          filtroEstadoBolsa.trim());
      if (filtroCreadoPor.trim())       p.set('creadoPor',            filtroCreadoPor.trim());
      p.set('sortDir',   sortDir);
      p.set('sortField', sortField);

      console.log('📤 Enviando request a endpoint:', `${API_BASE}/bolsas/solicitudes/trazabilidad-recitas`);
      console.log('📋 Parámetros:', Object.fromEntries(p));

      const res = await fetch(`${API_BASE}/bolsas/solicitudes/trazabilidad-recitas?${p}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      console.log('✅ RESPUESTA DEL BACKEND - Trazabilidad Recitas:', data);
      console.log('📊 Total registros:', data.total);
      console.log('📋 Solicitudes recibidas:', data.solicitudes);
      if (data.solicitudes && data.solicitudes.length > 0) {
        console.log('🔍 Estructura del primer registro:', data.solicitudes[0]);
        console.log('📌 Campo condicionMedica presente:', !!data.solicitudes[0].condicionMedica);
        console.log('📌 Valor condicionMedica:', data.solicitudes[0].condicionMedica);
      }
      
      if (!isMountedRef.current) return;
      setFilas(data.solicitudes || []);
      setTotal(data.total ?? 0);
    } catch (e) {
      console.error('❌ Error trazabilidad:', e);
      if (isMountedRef.current) setErrorMessage('Error al cargar los datos. Intenta nuevamente.');
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [searchTerm, filtroFechaInicio, filtroFechaFin, filtroTipo, filtroEnfermera, sortDir, sortField, filtroEspecialidad, filtroMotivoInterconsulta, filtroEstadoBolsa, filtroCreadoPor]); // eslint-disable-line

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroTipo('');
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
    setFiltroEnfermera('');
    setFiltroEspecialidad('');
    setFiltroMotivoInterconsulta('');
    setFiltroEstadoBolsa('');
    setFiltroCreadoPor('');
  };

  function handleSort(field) {
    if (!field) return;
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setCurrentPage(1);
  }

  const guardarFechaPreferida = async (idSolicitud, fecha) => {
    try {
      const p = new URLSearchParams();
      if (fecha) p.set('fecha', fecha);
      const res = await fetch(`${API_BASE}/bolsas/solicitudes/${idSolicitud}/fecha-preferida?${p}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFilas(prev => prev.map(f =>
        f.idSolicitud === idSolicitud ? { ...f, fechaPreferida: fecha || null } : f
      ));
    } catch (e) {
      console.error('❌ Error guardando fecha:', e);
    }
  };

  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <GitBranch size={22} className="text-[#0a5ba9]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Trazabilidad Recitas / Interconsultas</h1>
            <p className="text-sm text-gray-500">Historial de recitas e interconsultas — quién las generó y para cuándo</p>
          </div>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg"><FileText size={16} className="text-[#0a5ba9]" /></div>
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-800">{kpis.total.toLocaleString('es-PE')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg"><ClipboardList size={16} className="text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Recitas</p>
            <p className="text-xl font-bold text-blue-700">{kpis.recitas.toLocaleString('es-PE')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg"><Stethoscope size={16} className="text-orange-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Interconsultas</p>
            <p className="text-xl font-bold text-orange-700">{kpis.interconsultas.toLocaleString('es-PE')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg"><AlertCircle size={16} className="text-gray-500" /></div>
          <div>
            <p className="text-xs text-gray-500">Sin creador</p>
            <p className="text-xl font-bold text-gray-600">{kpis.sinCreador.toLocaleString('es-PE')}</p>
          </div>
        </div>
      </div>

      {/* ── Filtros ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">

          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Buscar por DNI o nombre</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (setCurrentPage(1), cargar(1))}
                placeholder="DNI o nombre del paciente..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a5ba9]"
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Filter size={11} className="inline mr-1" />Tipo
            </label>
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a5ba9]"
            >
              <option value="">Todos los tipos</option>
              <option value="RECITA">RECITA</option>
              <option value="INTERCONSULTA">INTERCONSULTA</option>
            </select>
          </div>

          {/* Enfermera / profesional */}
          <BuscadorEnfermera
            value={filtroEnfermera}
            onChange={setFiltroEnfermera}
          />

          {/* Especialidad */}
          <div className="min-w-[180px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Stethoscope size={11} className="inline mr-1" />
              Especialidad
              {facetas.especialidades.length > 0 && (
                <span className="ml-1 text-[10px] text-blue-500">({facetas.especialidades.length})</span>
              )}
            </label>
            <select
              value={filtroEspecialidad}
              onChange={e => setFiltroEspecialidad(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a5ba9] bg-white"
            >
              <option value="">Todas las especialidades</option>
              {facetas.especialidades.map(f => (
                <option key={f.valor} value={f.valor}>{f.valor} ({f.total})</option>
              ))}
            </select>
          </div>

          {/* Motivo interconsulta */}
          <div className="min-w-[190px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <FileText size={11} className="inline mr-1" />
              Motivo interconsulta
              {facetas.motivos.length > 0 && (
                <span className="ml-1 text-[10px] text-blue-500">({facetas.motivos.length})</span>
              )}
            </label>
            <select
              value={filtroMotivoInterconsulta}
              onChange={e => setFiltroMotivoInterconsulta(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a5ba9] bg-white"
            >
              <option value="">Todos los motivos</option>
              {facetas.motivos.map(f => (
                <option key={f.valor} value={f.valor}>{f.valor} ({f.total})</option>
              ))}
            </select>
          </div>

          {/* Estado de Bolsa */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Filter size={11} className="inline mr-1" />
              Estado de Bolsa
              {facetas.estadosBolsa.length > 0 && (
                <span className="ml-1 text-[10px] text-blue-500">({facetas.estadosBolsa.length})</span>
              )}
            </label>
            <select
              value={filtroEstadoBolsa}
              onChange={e => setFiltroEstadoBolsa(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a5ba9] bg-white"
            >
              <option value="">Todos los estados</option>
              {facetas.estadosBolsa.map(f => (
                <option key={f.valor} value={f.valor}>{f.valor} ({f.total})</option>
              ))}
            </select>
          </div>

          {/* Creado por */}
          <div className="min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Search size={11} className="inline mr-1" />
              Creado por
              {facetas.creadosPor.length > 0 && (
                <span className="ml-1 text-[10px] text-blue-500">({facetas.creadosPor.length})</span>
              )}
            </label>
            <select
              value={filtroCreadoPor}
              onChange={e => setFiltroCreadoPor(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a5ba9] bg-white"
            >
              <option value="">Todos los profesionales</option>
              {facetas.creadosPor.map(f => (
                <option key={f.valor} value={f.valor}>{f.valor} ({f.total})</option>
              ))}
            </select>
          </div>

          {/* Rango de fechas — calendario */}
          <RangoFechas
            inicio={filtroFechaInicio}
            fin={filtroFechaFin}
            onCambio={(ini, fin) => { setFiltroFechaInicio(ini); setFiltroFechaFin(fin); }}
            fechasConDatos={fechasConDatos}
          />

          {/* Limpiar */}
          <button
            onClick={limpiarFiltros}
            className="py-2 px-4 text-sm border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition"
          >
            Limpiar
          </button>

          {/* Actualizar */}
          <button
            onClick={() => { setCurrentPage(1); cargar(1); }}
            disabled={isLoading}
            className="py-2 px-4 text-sm bg-[#0a5ba9] hover:bg-[#0d4e90] text-white rounded-lg flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* ── Tabla ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Barra de estado */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {isLoading ? 'Cargando...' : `${total.toLocaleString('es-PE')} registro${total !== 1 ? 's' : ''}`}
          </span>
          <span className="text-xs text-gray-500">Página {currentPage} de {totalPaginas}</span>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-4 text-center text-red-600 text-sm flex items-center justify-center gap-2">
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}

        {/* Tabla — thead SIEMPRE visible, tbody cambia según estado */}
        {!errorMessage && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0a5ba9] text-white">
                  {COLUMNAS.map(({ label, field, sortable }) => {
                    const activo = sortable && field === sortField;
                    return (
                      <th
                        key={label}
                        onClick={() => sortable && handleSort(field)}
                        title={sortable ? (activo ? `Ordenado por ${label} — clic para invertir` : `Ordenar por ${label}`) : undefined}
                        className={[
                          'px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap select-none transition-colors',
                          sortable ? 'cursor-pointer hover:bg-[#0d4e90]' : 'cursor-default',
                        ].join(' ')}
                      >
                        <span className="flex items-center gap-1">
                          {label}
                          {sortable && (
                            activo
                              ? sortDir === 'asc'
                                ? <ChevronUp   size={12} className="opacity-90 shrink-0" />
                                : <ChevronDown size={12} className="opacity-90 shrink-0" />
                              : <ArrowUpDown  size={11} className="opacity-40 shrink-0" />
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filas.map((f, idx) => (
                  <tr
                    key={f.idSolicitud ?? idx}
                    className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    {/* F. Generación */}
                    <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                      {formatFecha(f.fechaSolicitud)}
                    </td>

                    {/* Tipo */}
                    <td className="px-3 py-2.5">
                      <BadgeTipo tipo={f.tipoCita} />
                    </td>

                    {/* Paciente */}
                    <td className="px-3 py-2.5 font-medium text-gray-800 text-xs max-w-[180px]">
                      <span title={f.pacienteNombre} className="block truncate">{f.pacienteNombre || '—'}</span>
                    </td>

                    {/* DNI */}
                    <td className="px-3 py-2.5 text-xs font-mono text-gray-700 whitespace-nowrap">
                      {f.pacienteDni || '—'}
                    </td>

                    {/* Especialidad — para INTERCONSULTA muestra solo la especialidad sin el motivo */}
                    <td className="px-3 py-2.5 text-xs text-gray-700 whitespace-nowrap">
                      {(() => {
                        if (!f.especialidadDestino) return '—';
                        if (f.tipoCita === 'INTERCONSULTA') {
                          const match = f.especialidadDestino.match(/^(.+?)\s*\((.+?)\)\s*$/);
                          return match ? match[1] : f.especialidadDestino;
                        }
                        return f.especialidadDestino;
                      })()}
                    </td>

                    {/* Motivo interconsulta — solo para INTERCONSULTA con motivo entre paréntesis */}
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                      {(() => {
                        if (f.tipoCita !== 'INTERCONSULTA' || !f.especialidadDestino) {
                          return <span className="text-gray-400">—</span>;
                        }
                        const match = f.especialidadDestino.match(/^.+?\((.+?)\)\s*$/);
                        if (!match) return <span className="text-gray-400">—</span>;
                        return (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            {match[1].trim()}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Origen bolsa */}
                    <td className="px-3 py-2.5 text-xs text-gray-500">
                      {f.origenBolsa || '—'}
                    </td>

                    {/* Estado de Bolsa */}
                    <td className="px-3 py-2.5 text-xs">
                      {f.estado ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-100 text-indigo-800 border border-indigo-300 whitespace-nowrap">
                          {f.estado}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>

                    {/* Fecha preferida — editable */}
                    <td className="px-3 py-2.5">
                      <CeldaFechaPreferida fila={f} onGuardar={guardarFechaPreferida} />
                    </td>

                    {/* Creado por */}
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                      {f.medicoCreador ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium border border-green-200">
                          {f.medicoCreador}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Sin datos</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-3 py-2.5">
                      <BadgeEstado cod={f.codEstado} desc={f.descEstado} />
                    </td>

                    {/* Estado de Personal Asistencial — condicion_medica */}
                    <td className="px-3 py-2.5 text-xs">
                      {f.condicionMedica ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
                          {f.condicionMedica}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Loading dentro del tbody — headers siempre visibles */}
                {isLoading && (
                  <tr>
                    <td colSpan={COLUMNAS.length} className="py-10 text-center text-gray-500 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw size={16} className="animate-spin" /> Cargando trazabilidad...
                      </div>
                    </td>
                  </tr>
                )}

                {/* Sin datos */}
                {!isLoading && filas.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNAS.length} className="py-12 text-center">
                      <GitBranch size={36} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 text-sm">No se encontraron registros con los filtros aplicados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Paginación ─────────────────────────────────────────────────── */}
        {!isLoading && totalPaginas > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-xs text-gray-500">
              Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)} de {total.toLocaleString('es-PE')}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              <span className="px-3 py-1.5 text-xs bg-blue-50 text-[#0a5ba9] rounded-lg font-semibold border border-blue-200">
                {currentPage} / {totalPaginas}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPaginas, p + 1))}
                disabled={currentPage >= totalPaginas}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
