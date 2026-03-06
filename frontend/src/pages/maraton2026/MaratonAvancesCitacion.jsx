import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CalendarCheck, RefreshCw, Download, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { obtenerDesgloseMaratonSegmentos, obtenerPacientesMaratonCategoria, obtenerOpcionesFiltrosMaraton, obtenerTotalesBrutosMaraton } from '../../services/bolsasService';
import { apiClient } from '../../lib/apiClient';

// ─── Hook: animación de contador suave (easeOutExpo) ─────────────────────────
function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === 0) { setDisplay(0); return; }
    const start = prevTarget.current;
    const diff  = target - start;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(start + diff * ease));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      else prevTarget.current = target;
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

// ─── Config de colores por estado ────────────────────────────────────────────
const CFG = {
  CITADOS:    { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  dot: 'bg-emerald-500', border: 'border-emerald-200' },
  OBSERVADOS: { bar: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',    dot: 'bg-amber-500',   border: 'border-amber-200'   },
  PENDIENTES: { bar: 'bg-rose-500',    text: 'text-rose-700',    bg: 'bg-rose-50',     dot: 'bg-rose-500',    border: 'border-rose-200'    },
};

// Mapa de categorías → título + color del badge
const MODAL_META = {
  UNIVERSO:                { titulo: 'Total Universo Maratón 2026',      badge: 'bg-blue-100 text-blue-700'    },
  CRONICOS:                { titulo: 'Maratón — Crónicos',               badge: 'bg-violet-100 text-violet-700' },
  ESPECIALIDADES:          { titulo: 'Maratón — Especialidades',         badge: 'bg-sky-100 text-sky-700'      },
  CITAS_LOGRADAS:          { titulo: 'Total Citados (global)',            badge: 'bg-emerald-100 text-emerald-700' },
  OBSERVADOS:              { titulo: 'Total Observados (global)',         badge: 'bg-amber-100 text-amber-700'  },
  PENDIENTES:              { titulo: 'Total Pendientes (global)',         badge: 'bg-rose-100 text-rose-700'    },
  CITADOS_CENACRON:        { titulo: 'Citados — Crónicos',               badge: 'bg-emerald-100 text-emerald-700' },
  OBSERVADOS_CENACRON:     { titulo: 'Observados — Crónicos',            badge: 'bg-amber-100 text-amber-700'  },
  PENDIENTES_CENACRON:     { titulo: 'Pendientes — Crónicos',            badge: 'bg-rose-100 text-rose-700'    },
  CITADOS_ESPECIALIDADES:  { titulo: 'Citados — Especialidades',         badge: 'bg-emerald-100 text-emerald-700' },
  OBSERVADOS_ESPECIALIDADES:{ titulo: 'Observados — Especialidades',     badge: 'bg-amber-100 text-amber-700'  },
  PENDIENTES_ESPECIALIDADES:{ titulo: 'Pendientes — Especialidades',     badge: 'bg-rose-100 text-rose-700'    },
};

// ─── Configuración de badges para Motivo (estado_gestion) ────────────────────
const MOTIVO_BADGE = {
  CITADO:           { label: 'Citado',            cls: 'bg-emerald-100 text-emerald-800' },
  ATENDIDO:         { label: 'Atendido',          cls: 'bg-emerald-100 text-emerald-800' },
  ATENDIDO_IPRESS:  { label: 'Atend. IPRESS',     cls: 'bg-blue-100 text-blue-800' },
  NO_CONTESTA:      { label: 'No contesta',       cls: 'bg-orange-100 text-orange-800' },
  NO_CONTESTO:      { label: 'No contestó',       cls: 'bg-orange-100 text-orange-800' },
  APAGADO:          { label: 'Tel. apagado',      cls: 'bg-orange-100 text-orange-800' },
  TEL_SIN_SERVICIO: { label: 'Sin servicio',      cls: 'bg-orange-100 text-orange-800' },
  NUM_NO_EXISTE:    { label: 'Núm. no existe',    cls: 'bg-orange-100 text-orange-800' },
  NO_DESEA:         { label: 'No desea',          cls: 'bg-red-100 text-red-800' },
  RECHAZADO:        { label: 'Rechazado',         cls: 'bg-red-100 text-red-800' },
  PARTICULAR:       { label: 'Particular',        cls: 'bg-slate-100 text-slate-700' },
  NO_IPRESS_CENATE: { label: 'No IPRESS CENATE',  cls: 'bg-blue-100 text-blue-700' },
  NO_GRUPO_ETARIO:  { label: 'No grupo etario',   cls: 'bg-slate-100 text-slate-700' },
  REPROG_FALLIDA:   { label: 'Reprog. fallida',   cls: 'bg-yellow-100 text-yellow-800' },
  SIN_VIGENCIA:     { label: 'Sin vigencia',      cls: 'bg-purple-100 text-purple-800' },
  FALLECIDO:        { label: 'Fallecido',         cls: 'bg-slate-200 text-slate-600' },
  YA_NO_REQUIERE:   { label: 'Ya no requiere',    cls: 'bg-slate-100 text-slate-600' },
  PENDIENTE_CITA:   { label: 'Pendiente cita',    cls: 'bg-rose-100 text-rose-800' },
};

const MOTIVO_OPTIONS = [
  { value: '', label: 'Todos los motivos' },
  { value: 'CITADO',           label: 'Citado' },
  { value: 'ATENDIDO',         label: 'Atendido' },
  { value: 'ATENDIDO_IPRESS',  label: 'Atend. IPRESS' },
  { value: 'NO_CONTESTA',      label: 'No contesta' },
  { value: 'NO_CONTESTO',      label: 'No contestó' },
  { value: 'APAGADO',          label: 'Tel. apagado' },
  { value: 'TEL_SIN_SERVICIO', label: 'Sin servicio' },
  { value: 'NUM_NO_EXISTE',    label: 'Núm. no existe' },
  { value: 'NO_DESEA',         label: 'No desea' },
  { value: 'RECHAZADO',        label: 'Rechazado' },
  { value: 'PARTICULAR',       label: 'Particular' },
  { value: 'NO_IPRESS_CENATE', label: 'No IPRESS CENATE' },
  { value: 'NO_GRUPO_ETARIO',  label: 'No grupo etario' },
  { value: 'REPROG_FALLIDA',   label: 'Reprog. fallida' },
  { value: 'SIN_VIGENCIA',     label: 'Sin vigencia' },
  { value: 'FALLECIDO',        label: 'Fallecido' },
  { value: 'YA_NO_REQUIERE',   label: 'Ya no requiere' },
  { value: 'PENDIENTE_CITA',   label: 'Pendiente cita' },
];

function MotivoBadge({ estado }) {
  const cfg = MOTIVO_BADGE[estado] ?? { label: estado ?? '—', cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

const FILTROS_EMPTY = { sexo: '', edadMin: '', edadMax: '', estadoGestion: '', macrorredFiltro: '', redFiltro: '', ipressFiltro: '' };

// ─── Modal de pacientes ───────────────────────────────────────────────────────
function PacientesModal({ categoria, onClose }) {
  const meta = MODAL_META[categoria] ?? { titulo: categoria, badge: 'bg-slate-100 text-slate-700' };
  const [busqueda,        setBusqueda]        = useState('');
  const [filtros,         setFiltros]         = useState(FILTROS_EMPTY);
  const [opcionesFiltros, setOpcionesFiltros] = useState({ macrorredes: [], redes: [], ipress: [] });
  const [page,            setPage]            = useState(0);
  const [rows,            setRows]            = useState([]);
  const [total,           setTotal]           = useState(0);
  const [totalPages,      setTotalPages]      = useState(0);
  const [loadingList,     setLoadingList]     = useState(false);
  const [exporting,       setExporting]       = useState(false);
  const searchTimeout = useRef(null);
  const SIZE = 50;

  // Cargar opciones dinámicas de filtros (macrorredes, redes, IPRESS)
  useEffect(() => {
    obtenerOpcionesFiltrosMaraton(categoria)
      .then(data => setOpcionesFiltros(data ?? { macrorredes: [], redes: [], ipress: [] }))
      .catch(() => {});
  }, [categoria]);

  const cargar = useCallback(async (q, p, flt) => {
    setLoadingList(true);
    try {
      const res = await obtenerPacientesMaratonCategoria(categoria, q, p, SIZE, flt);
      setRows(res?.content ?? []);
      setTotal(res?.totalElements ?? 0);
      setTotalPages(res?.totalPages ?? 0);
    } catch (e) {
      console.error('Error cargando pacientes maratón:', e);
    } finally {
      setLoadingList(false);
    }
  }, [categoria]);

  useEffect(() => { cargar(busqueda, page, filtros); }, [cargar, page]); // eslint-disable-line

  const handleBusqueda = (v) => {
    setBusqueda(v);
    setPage(0);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => cargar(v, 0, filtros), 400);
  };

  const handleFiltro = (key, value) => {
    const nuevo = { ...filtros, [key]: value };
    setFiltros(nuevo);
    setPage(0);
    cargar(busqueda, 0, nuevo);
  };

  const limpiarFiltros = () => {
    setFiltros(FILTROS_EMPTY);
    setBusqueda('');
    setPage(0);
    cargar('', 0, FILTROS_EMPTY);
  };

  const hayFiltros = busqueda || Object.values(filtros).some(v => v !== '');

  const handleExcel = async () => {
    setExporting(true);
    try {
      const res = await obtenerPacientesMaratonCategoria(categoria, busqueda, 0, 99999, filtros);
      const headers = ['#', 'Tipo Doc', 'N° Documento', 'Nombres y Apellidos', 'Sexo', 'Edad', 'IPRESS', 'Red', 'Macrorred', 'Especialidad', 'Motivo'];
      const dataRows = (res?.content ?? []).map((r, i) => [
        i + 1,
        r.tipo_doc        ?? '',
        String(r.num_doc  ?? ''),
        r.nombre_completo ?? '',
        r.sexo            ?? '',
        r.edad            ?? '',
        r.ipress          ?? '',
        r.red             ?? '',
        r.macrorred       ?? '',
        r.especialidad    ?? '',
        MOTIVO_BADGE[r.estado_gestion]?.label ?? r.estado_gestion ?? '',
      ]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
      // Forzar columna N° Documento (índice 2) como texto
      const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
      for (let row = 1; row <= range.e.r; row++) {
        const ref = XLSX.utils.encode_cell({ r: row, c: 2 });
        if (ws[ref]) { ws[ref].t = 's'; ws[ref].z = '@'; }
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
      const filename = `Maraton_${categoria}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', filename);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
    } catch (e) {
      console.error('Error exportando:', e);
    } finally {
      setExporting(false);
    }
  };

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const iniciales = (nombre) => {
    if (!nombre) return '?';
    const parts = nombre.trim().split(/\s+/);
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  };

  const COLORS = ['bg-orange-400','bg-violet-500','bg-sky-500','bg-emerald-500','bg-rose-500','bg-amber-500','bg-indigo-500','bg-teal-500'];
  const avatarColor = (s) => COLORS[(s?.charCodeAt(0) ?? 0) % COLORS.length];

  const selectCls = "h-8 text-xs border border-slate-200 rounded-lg px-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent";
  const inputCls  = "h-8 w-16 text-xs border border-slate-200 rounded-lg px-2 text-center text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-6xl max-h-[92vh]" onClick={e => e.stopPropagation()}>

        {/* Header modal */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">Pacientes MARATÓN</h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
                {meta.titulo}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              {total.toLocaleString('es-PE')} pacientes encontrados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExcel}
              disabled={exporting || loadingList}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exportando...' : 'Descargar Excel'}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Buscador + Filtros */}
        <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0 bg-slate-50 space-y-2">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={e => handleBusqueda(e.target.value)}
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Barra de filtros */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sexo */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Sexo:</span>
              {['', 'M', 'F'].map(s => (
                <button
                  key={s}
                  onClick={() => handleFiltro('sexo', s)}
                  className={`h-7 px-2.5 text-xs font-medium rounded-lg border transition-colors ${
                    filtros.sexo === s
                      ? s === 'M' ? 'bg-blue-600 text-white border-blue-600'
                        : s === 'F' ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-slate-700 text-white border-slate-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s === '' ? 'Todos' : s === 'M' ? '♂ M' : '♀ F'}
                </button>
              ))}
            </div>

            {/* Edad */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Edad:</span>
              <input
                type="number"
                value={filtros.edadMin}
                onChange={e => handleFiltro('edadMin', e.target.value)}
                placeholder="min"
                className={inputCls}
                min={0} max={120}
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                value={filtros.edadMax}
                onChange={e => handleFiltro('edadMax', e.target.value)}
                placeholder="max"
                className={inputCls}
                min={0} max={120}
              />
            </div>

            {/* Motivo */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Motivo:</span>
              <select value={filtros.estadoGestion} onChange={e => handleFiltro('estadoGestion', e.target.value)} className={selectCls + " min-w-[140px]"}>
                {MOTIVO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Macrorred */}
            {opcionesFiltros.macrorredes.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Macrorred:</span>
                <select value={filtros.macrorredFiltro} onChange={e => handleFiltro('macrorredFiltro', e.target.value)} className={selectCls + " min-w-[110px]"}>
                  <option value="">Todas</option>
                  {opcionesFiltros.macrorredes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}

            {/* Red */}
            {opcionesFiltros.redes.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Red:</span>
                <select value={filtros.redFiltro} onChange={e => handleFiltro('redFiltro', e.target.value)} className={selectCls + " min-w-[110px]"}>
                  <option value="">Todas</option>
                  {opcionesFiltros.redes.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}

            {/* IPRESS */}
            {opcionesFiltros.ipress.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">IPRESS:</span>
                <select value={filtros.ipressFiltro} onChange={e => handleFiltro('ipressFiltro', e.target.value)} className={selectCls + " min-w-[160px] max-w-[200px]"}>
                  <option value="">Todas</option>
                  {opcionesFiltros.ipress.map(ip => <option key={ip} value={ip}>{ip}</option>)}
                </select>
              </div>
            )}

            {/* Limpiar */}
            {hayFiltros && (
              <button
                onClick={limpiarFiltros}
                className="h-7 px-2.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr>
                {['Tipo Doc','N° Documento','Nombres y Apellidos','Sexo','Edad','IPRESS','Red','Macrorred','Especialidad','Motivo'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingList ? (
                <tr><td colSpan={10} className="text-center py-12 text-slate-400">Cargando...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-slate-400">Sin resultados</td></tr>
              ) : rows.map((r, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-3 py-2.5 text-xs text-slate-500">{r.tipo_doc ?? 'DNI'}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-blue-700 font-semibold">{r.num_doc}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(r.nombre_completo)}`}>
                        {iniciales(r.nombre_completo)}
                      </span>
                      <span className="font-medium text-slate-800 text-xs leading-tight">{r.nombre_completo}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {r.sexo === 'M' ? <span className="text-blue-600 font-semibold">♂ M</span>
                      : r.sexo === 'F' ? <span className="text-pink-600 font-semibold">♀ F</span>
                      : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-700 tabular-nums">
                    {r.edad ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 max-w-[140px] truncate" title={r.ipress}>{r.ipress ?? 'N/A'}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[110px] truncate" title={r.red}>{r.red ?? 'N/A'}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{r.macrorred ?? 'N/A'}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 max-w-[140px] truncate" title={r.especialidad}>{r.especialidad || '—'}</td>
                  <td className="px-3 py-2.5"><MotivoBadge estado={r.estado_gestion} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between flex-shrink-0 bg-slate-50 rounded-b-2xl">
          <span className="text-xs text-slate-500">
            Página {page + 1} de {totalPages} — {total.toLocaleString('es-PE')} registros
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loadingList}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loadingList}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Fila de estado (Citados / Observados / Pendientes) ──────────────────────
const LABEL_COLORS = {
  CITADOS:    'text-emerald-300',
  OBSERVADOS: 'text-amber-300',
  PENDIENTES: 'text-rose-300',
};

function StateRow({ label, value, total, accentBorder, onClick, tooltip }) {
  const cfg = CFG[label] ?? CFG.PENDIENTES;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  const animValue = useCountUp(value, 3500);
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 flex flex-col justify-center px-6 py-4 ${cfg.bg} border-b ${cfg.border} last:border-b-0 border-l-4 ${accentBorder} w-full text-left hover:brightness-97 active:brightness-94 transition-all cursor-pointer group`}
    >
      {tooltip && (
        <div className="absolute right-2 top-full mt-1 w-72 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
          <p className={`font-bold mb-1 ${LABEL_COLORS[label] ?? 'text-white'}`}>{label}</p>
          {tooltip}
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full inline-block flex-shrink-0 ${cfg.dot}`} />
          <span className="text-xs font-extrabold text-slate-700 tracking-widest uppercase">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-black ${cfg.text} tabular-nums`}>{animValue.toLocaleString('es-PE')}</span>
          <span className="text-xs font-medium text-slate-400">/ {total.toLocaleString('es-PE')}</span>
        </div>
      </div>
      <div className="w-full bg-white rounded-full h-2 shadow-inner">
        <div className={`${cfg.bar} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs font-medium text-slate-500 mt-1.5">{pct}% del segmento · <span className="text-slate-400">clic para ver listado</span></p>
    </button>
  );
}

// ─── SVG Conector de embudo ───────────────────────────────────────────────────
function FunnelConnector() {
  const violet = '#7c3aed';
  const sky    = '#0284c7';
  return (
    <svg viewBox="0 0 56 400" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6,100 C28,100 28,33  50,33"  stroke={violet} strokeWidth="1.8" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
      <path d="M6,100 C28,100 28,100 50,100" stroke={violet} strokeWidth="1.8" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
      <path d="M6,100 C28,100 28,167 50,167" stroke={violet} strokeWidth="1.8" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
      <polygon points="47,30 54,33 47,36"   fill={violet} opacity="0.45" />
      <polygon points="47,97 54,100 47,103" fill={violet} opacity="0.45" />
      <polygon points="47,164 54,167 47,170" fill={violet} opacity="0.45" />
      <circle cx="6" cy="100" r="3.5" fill={violet} opacity="0.5" />
      <path d="M6,300 C28,300 28,233 50,233" stroke={sky} strokeWidth="1.8" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
      <path d="M6,300 C28,300 28,300 50,300" stroke={sky} strokeWidth="1.8" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
      <path d="M6,300 C28,300 28,367 50,367" stroke={sky} strokeWidth="1.8" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
      <polygon points="47,230 54,233 47,236" fill={sky} opacity="0.45" />
      <polygon points="47,297 54,300 47,303" fill={sky} opacity="0.45" />
      <polygon points="47,364 54,367 47,370" fill={sky} opacity="0.45" />
      <circle cx="6" cy="300" r="3.5" fill={sky} opacity="0.5" />
    </svg>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MaratonAvancesCitacion() {
  const [loading,            setLoading]            = useState(false);
  const [universoTotal,      setUniversoTotal]      = useState(0);
  const [cenacron,           setCenacron]           = useState({ total: 0, citados: 0, observados: 0, pendientes: 0 });
  const [especialidades,     setEspecialidades]     = useState({ total: 0, citados: 0, observados: 0, pendientes: 0 });
  const [modalCategoria,     setModalCategoria]     = useState(null);
  const [totalesBrutos,      setTotalesBrutos]      = useState({ totalRegistros: 0, pacientesUnicos: 0, registrosExtra: 0, pacientesMultiplesCitas: 0 });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [universoRes, desgloseRes, brutosRes] = await Promise.all([
        apiClient.get('/asegurados?maraton=true&page=0&size=1', true).catch(() => null),
        obtenerDesgloseMaratonSegmentos().catch(() => null),
        obtenerTotalesBrutosMaraton().catch(() => null),
      ]);
      setUniversoTotal(universoRes?.totalElements ?? 0);
      if (brutosRes) setTotalesBrutos(brutosRes);
      if (Array.isArray(desgloseRes)) {
        const cen = { total: 0, citados: 0, observados: 0, pendientes: 0 };
        const esp = { total: 0, citados: 0, observados: 0, pendientes: 0 };
        desgloseRes.forEach(({ segmento, estado, cantidad }) => {
          const seg = segmento === 'CENACRON' ? cen : esp;
          const n   = Number(cantidad) || 0;
          seg.total += n;
          if (estado === 'CITADO') seg.citados += n;
          else if (estado === 'PENDIENTE_CITA' || estado === 'SIN_ESTADO') seg.pendientes += n;
          else seg.observados += n;
        });
        setCenacron(cen);
        setEspecialidades(esp);
      }
    } catch (err) {
      console.error('Error cargando avances Maratón 2026:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const totalCitados    = cenacron.citados    + especialidades.citados;
  const totalObservados = cenacron.observados + especialidades.observados;
  const totalPendientes = cenacron.pendientes + especialidades.pendientes;
  const META_TOTAL      = 3600 + 360; // 3,960 = meta citación de la campaña
  const pctGlobal = META_TOTAL > 0 ? Math.min(((totalCitados / META_TOTAL) * 100), 100).toFixed(1) : '0.0';
  const pct = (n, t) => t > 0 ? ((n / t) * 100).toFixed(1) : '0.0';

  // Contadores animados
  const cntUniverso       = useCountUp(universoTotal,         4000);
  const cntCronicos       = useCountUp(cenacron.total,        3500);
  const cntEspecialidades = useCountUp(especialidades.total,  3500);
  const cntCitados        = useCountUp(totalCitados,          3000);

  const [exporting, setExporting] = useState(false);

  const abrirModal = (cat) => setModalCategoria(cat);

  const handleExportarTodo = async () => {
    setExporting(true);
    try {
      const res = await obtenerPacientesMaratonCategoria('UNIVERSO', '', 0, 99999);
      const headers = ['#', 'Tipo Doc', 'N° Documento', 'Nombres y Apellidos', 'Sexo', 'Edad', 'IPRESS', 'Red', 'Macrorred', 'Estado Gestión'];
      const dataRows = (res?.content ?? []).map((r, i) => [
        i + 1,
        r.tipo_doc        ?? '',
        String(r.num_doc  ?? ''),
        r.nombre_completo ?? '',
        r.sexo            ?? '',
        r.edad            ?? '',
        r.ipress          ?? '',
        r.red             ?? '',
        r.macrorred       ?? '',
        r.estado_gestion  ?? '',
      ]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
      const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
      for (let row = 1; row <= range.e.r; row++) {
        const ref = XLSX.utils.encode_cell({ r: row, c: 2 });
        if (ws[ref]) { ws[ref].t = 's'; ws[ref].z = '@'; }
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Maratón 2026');
      const filename = `Maraton2026_Universo_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', filename);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
    } catch (e) {
      console.error('Error exportando:', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Avances de Citación</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              Maratón 2026
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Embudo de citación por segmento — Maratón de Salud 2026
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={handleExportarTodo}
            disabled={exporting || loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
            {exporting ? 'Exportando...' : 'Exportar Excel'}
          </button>
        </div>
      </div>

      {/* ── Barra de avance global ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 flex items-center gap-4 flex-wrap">
        <span className="text-xs font-bold text-blue-500 uppercase tracking-wider whitespace-nowrap">Avance hacia la meta</span>
        <div className="flex-1 min-w-[120px] bg-blue-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-700" style={{ width: `${pctGlobal}%` }} />
        </div>
        <span className="text-sm font-black text-blue-700 whitespace-nowrap">{cntCitados.toLocaleString('es-PE')} citados</span>
        <span className="text-sm text-blue-500 whitespace-nowrap">de meta {META_TOTAL.toLocaleString('es-PE')}</span>
        <span className="text-xl font-black text-blue-700">{pctGlobal}%</span>
      </div>

      {/* ── Embudo principal ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
        {/* Cabeceras */}
        <div className="grid grid-cols-[1fr_3.5rem_1fr] bg-slate-800 border-b border-slate-700">
          <div className="px-6 py-3 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Pacientes</span>
            <span className="text-base font-black text-white tabular-nums">{cntUniverso.toLocaleString('es-PE')}</span>
          </div>
          <div />
          <div className="px-5 py-3 text-xs font-bold text-slate-300 uppercase tracking-wider">Asignados Para Citar</div>
        </div>

        {/* Cuerpo */}
        <div className="grid grid-cols-[1fr_3.5rem_1fr]" style={{ minHeight: '420px' }}>

          {/* Izquierda: segmentos */}
          <div className="flex flex-col border-r border-slate-100">
            {/* CRÓNICOS */}
            <button
              onClick={() => abrirModal('CRONICOS')}
              className="relative flex-1 flex flex-col justify-center px-8 py-6 border-b border-violet-100 border-l-4 border-l-violet-500 text-left hover:bg-violet-50 active:bg-violet-100 transition-colors cursor-pointer group bg-white"
            >
              <div className="absolute right-2 top-full mt-1 w-80 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
                <p className="font-bold mb-1 text-violet-300">Maratón — Crónicos (CENACRON)</p>
                Pacientes inscritos en el programa CENACRON: Hipertensión Arterial y Diabetes Mellitus. Clic para ver el listado completo.
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-violet-500 inline-block flex-shrink-0" />
                <span className="text-xs font-extrabold text-violet-700 uppercase tracking-widest">Maratón — Crónicos</span>
              </div>
              <p className="text-5xl font-black text-violet-800 tabular-nums leading-none">{cntCronicos.toLocaleString('es-PE')}</p>
              <div className="mt-4">
                <div className="w-40 bg-violet-100 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full transition-all duration-700" style={{ width: `${pct(cenacron.total, universoTotal)}%` }} />
                </div>
                <p className="text-xs font-semibold text-violet-600 mt-1.5">{pct(cenacron.total, universoTotal)}% del universo total</p>
              </div>
            </button>
            {/* ESPECIALIDADES */}
            <button
              onClick={() => abrirModal('ESPECIALIDADES')}
              className="relative flex-1 flex flex-col justify-center px-8 py-6 border-l-4 border-l-sky-500 text-left hover:bg-sky-50 active:bg-sky-100 transition-colors cursor-pointer group bg-white"
            >
              <div className="absolute right-2 top-full mt-1 w-80 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
                <p className="font-bold mb-1 text-sky-300">Maratón — Especialidades</p>
                Pacientes referidos a atención especializada en CENATE: Cardiología, Neurología, Neumología, Gastroenterología, entre otras. Requieren citación para consulta con médico especialista vía telemedicina. Clic para ver el listado completo.
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-sky-500 inline-block flex-shrink-0" />
                <span className="text-xs font-extrabold text-sky-700 uppercase tracking-widest">Maratón — Especialidades</span>
              </div>
              <p className="text-5xl font-black text-sky-800 tabular-nums leading-none">{cntEspecialidades.toLocaleString('es-PE')}</p>
              <div className="mt-4">
                <div className="w-40 bg-sky-100 rounded-full h-2">
                  <div className="bg-sky-500 h-2 rounded-full transition-all duration-700" style={{ width: `${pct(especialidades.total, universoTotal)}%` }} />
                </div>
                <p className="text-xs font-semibold text-sky-600 mt-1.5">{pct(especialidades.total, universoTotal)}% del universo total</p>
              </div>
            </button>
          </div>

          {/* Centro: conector SVG */}
          <div className="relative">
            <FunnelConnector />
          </div>

          {/* Derecha: filas de estado */}
          <div className="flex flex-col border-l border-slate-100">
            <StateRow label="CITADOS"    value={cenacron.citados}         total={cenacron.total}       accentBorder="border-l-violet-300" onClick={() => abrirModal('CITADOS_CENACRON')}
              tooltip="Pacientes CENACRON con cita confirmada por CENATE (estado CITADO) o que ya fueron atendidos por el médico (estado ATENDIDO). Son los logros reales de la campaña para el segmento Crónicos. Meta: 3,600 pacientes." />
            <StateRow label="OBSERVADOS" value={cenacron.observados}       total={cenacron.total}       accentBorder="border-l-violet-300" onClick={() => abrirModal('OBSERVADOS_CENACRON')}
              tooltip="Pacientes CENACRON que fueron contactados por la gestora pero no pudieron ser citados: rechazaron la cita, número no existe, sin vigencia de seguro, fallecido, ya no requiere, IPRESS no cubre CENATE, sin grupo etario, particular, entre otros motivos." />
            <StateRow label="PENDIENTES" value={cenacron.pendientes}       total={cenacron.total}       accentBorder="border-l-violet-300" onClick={() => abrirModal('PENDIENTES_CENACRON')}
              tooltip="Pacientes CENACRON que aún no han sido citados ni gestionados. Están en espera de ser contactados por la gestora asignada o aún no tienen gestora asignada. Requieren acción prioritaria." />
            <StateRow label="CITADOS"    value={especialidades.citados}    total={especialidades.total} accentBorder="border-l-sky-300"    onClick={() => abrirModal('CITADOS_ESPECIALIDADES')}
              tooltip="Pacientes del segmento Especialidades con cita confirmada por CENATE (CITADO) o que ya fueron atendidos en consulta especializada (ATENDIDO). Son los logros reales de la campaña para este segmento. Meta: 360 pacientes." />
            <StateRow label="OBSERVADOS" value={especialidades.observados} total={especialidades.total} accentBorder="border-l-sky-300"    onClick={() => abrirModal('OBSERVADOS_ESPECIALIDADES')}
              tooltip="Pacientes del segmento Especialidades contactados por la gestora pero que no pudieron ser citados: número no contesta, apagado, sin vigencia de seguro, rechazó la cita, IPRESS no cubre CENATE, reprogramación fallida, entre otros motivos." />
            <StateRow label="PENDIENTES" value={especialidades.pendientes} total={especialidades.total} accentBorder="border-l-sky-300"    onClick={() => abrirModal('PENDIENTES_ESPECIALIDADES')}
              tooltip="Pacientes del segmento Especialidades que aún no han sido citados ni gestionados. Están en espera de contacto por parte de la gestora. Incluye pacientes sin gestora asignada y aquellos con estado pendiente de cita." />
          </div>
        </div>
      </div>

      {/* ── KPI resumen ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total universo',   value: universoTotal,    color: 'blue',    cat: 'UNIVERSO',       tooltip: 'Total de pacientes inscritos en la campaña Maratón 2026 (CENACRON + Especialidades). Clic para ver listado completo.' },
          { label: 'Total citados',    value: totalCitados,     color: 'emerald', cat: 'CITAS_LOGRADAS', tooltip: 'Pacientes con cita confirmada (CITADO) o ya atendidos (ATENDIDO) en ambos segmentos. Son los logros reales de la campaña.' },
          { label: 'Total observados', value: totalObservados,  color: 'amber',   cat: 'OBSERVADOS',     tooltip: 'Pacientes contactados pero que no pudieron ser citados: rechazo, número inactivo, sin vigencia, fallecido, entre otros.' },
          { label: 'Total pendientes', value: totalPendientes,  color: 'rose',    cat: 'PENDIENTES',     tooltip: 'Pacientes que aún no han sido citados ni tienen observación registrada. Requieren gestión activa.' },
        ].map(({ label, value, color, cat, tooltip }) => (
          <button
            key={label}
            onClick={() => abrirModal(cat)}
            title={tooltip}
            className={`group relative bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-left hover:shadow-md hover:border-${color}-200 transition-all cursor-pointer`}
          >
            <div className="absolute right-2 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
              {tooltip}
            </div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 text-${color}-700 tabular-nums`}>{value.toLocaleString('es-PE')}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {universoTotal > 0 ? `${((value / universoTotal) * 100).toFixed(1)}%` : '—'} del total · Ver listado →
            </p>
          </button>
        ))}
      </div>

      {/* ── Nota: pacientes con más de una cita (doble conteo) ── */}
      {totalesBrutos.pacientesMultiplesCitas > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
          <span className="text-base leading-none mt-0.5">⚠️</span>
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-900">
              {totalesBrutos.pacientesMultiplesCitas.toLocaleString('es-PE')} pacientes tienen más de una cita registrada en esta Maratón y se contabilizan más de una vez.
            </p>
            <p className="text-amber-700">
              Total registros en bolsa:&nbsp;<strong>{totalesBrutos.totalRegistros.toLocaleString('es-PE')}</strong>
              &nbsp;·&nbsp;
              Pacientes únicos:&nbsp;<strong>{totalesBrutos.pacientesUnicos.toLocaleString('es-PE')}</strong>
              &nbsp;·&nbsp;
              Registros duplicados:&nbsp;<strong className="text-amber-900">+{totalesBrutos.registrosExtra.toLocaleString('es-PE')}</strong>.
              Los contadores del embudo trabajan con <strong>paciente único por DNI</strong> (se toma la cita de mayor prioridad).
            </p>
          </div>
        </div>
      )}

      {/* ── Modal de pacientes ── */}
      {modalCategoria && (
        <PacientesModal
          categoria={modalCategoria}
          onClose={() => setModalCategoria(null)}
        />
      )}

    </div>
  );
}
