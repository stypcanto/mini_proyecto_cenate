/**
 * BolsaXGestor.jsx
 * Vista "Bolsa x Gestor" — distribución de pacientes por gestora de citas
 * v5.0 – Drill-down con panel lateral: ver pacientes + reasignar gestora
 *
 * Acceso: SUPERADMIN, COORDINADOR_GESTION_CITAS
 * Datos: GET /api/bolsas/solicitudes/estadisticas/por-gestora?fechaDesde=&fechaHasta=
 *        GET /api/bolsas/solicitudes/estadisticas/conteo-por-fecha?mes=YYYY-MM
 *        GET /api/bolsas/solicitudes?gestoraId={id}&size=500
 *        GET /api/bolsas/solicitudes/gestoras-disponibles
 *        POST /api/bolsas/solicitudes/asignar-gestora-masivo
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import apiClient from '../../lib/apiClient';
import {
  Users, RefreshCw, CalendarCheck, PhoneMissed,
  AlertCircle, CheckCircle2, XCircle, Clock, Calendar,
  ChevronLeft, ChevronRight, Search, ArrowUp, ArrowDown, ArrowUpDown,
  UserCheck, ChevronDown, Loader2, ArrowRightLeft, X,
} from 'lucide-react';

// ── Categorías de estado ──────────────────────────────────────
const CATS = [
  { key: 'por_citar',      label: 'Por Citar',       desc: 'Sin gestionar aún',             accent: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', icon: Clock        },
  { key: 'citados',        label: 'Citados',          desc: 'Cita agendada',                 accent: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: CalendarCheck },
  { key: 'en_seguimiento', label: 'En Seguimiento',   desc: 'No contesta / apagado',         accent: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: PhoneMissed   },
  { key: 'observados',     label: 'Observados',       desc: 'Hospitalizado / HC bloqueada',  accent: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', icon: AlertCircle   },
  { key: 'cerrados',       label: 'Cerrados',         desc: 'Fallecido / Sin vigencia / No desea', accent: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: XCircle },
  { key: 'atendidos',      label: 'Atendidos',        desc: 'Atención completada',           accent: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle2  },
];

// Códigos de estado agrupados por categoría (para filtrar en drawer)
const COD_POR_CAT = {
  por_citar:      ['PENDIENTE_CITA', 'PENDIENTE', null],
  citados:        ['CITADO', 'EN_PROCESO'],
  en_seguimiento: ['NO_CONTESTA', 'APAGADO', 'TEL_SIN_SERVICIO', 'REPROG_FALLIDA'],
  observados:     ['HOSPITALIZADO', 'HC_BLOQUEADA', 'NO_GRUPO_ETARIO', 'PARTICULAR'],
  cerrados:       ['YA_NO_REQUIERE', 'SIN_VIGENCIA', 'FALLECIDO', 'NO_DESEA', 'NUM_NO_EXISTE', 'NO_IPRESS_CENATE', 'ANULADO', 'ANULADA', 'DESERCION'],
  atendidos:      ['ATENDIDO', 'ATENDIDO_PRESENCIAL', 'ATENDIDO_IPRESS'],
};

// ── Helpers de fecha ─────────────────────────────────────────
const toISO = (d) => d.toISOString().slice(0, 10);
const HOY = toISO(new Date());

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ── Componente calendario con badges ──────────────────────────
function CalendarioFechas({ fechaSeleccionada, onSelectFecha, conteoPorFecha, onMesCambio }) {
  const hoyObj = new Date();
  const [anio, setAnio] = useState(hoyObj.getFullYear());
  const [mes, setMes]   = useState(hoyObj.getMonth());

  const primerDia = new Date(anio, mes, 1).getDay();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  const padDia = (d) => String(d).padStart(2, '0');
  const padMes = (m) => String(m + 1).padStart(2, '0');

  const irAtras = () => {
    const nm = mes === 0 ? 11 : mes - 1;
    const na = mes === 0 ? anio - 1 : anio;
    setMes(nm); setAnio(na);
    onMesCambio(`${na}-${padMes(nm)}`);
  };
  const irAdelante = () => {
    const nm = mes === 11 ? 0 : mes + 1;
    const na = mes === 11 ? anio + 1 : anio;
    setMes(nm); setAnio(na);
    onMesCambio(`${na}-${padMes(nm)}`);
  };

  return (
    <div style={{ background: '#fff', border: '1.5px solid #0D5BA9', borderRadius: '12px', overflow: 'hidden', minWidth: '280px', boxShadow: '0 4px 16px rgba(13,91,169,0.12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f0f7ff', borderBottom: '1px solid #bfdbfe' }}>
        <button onClick={irAtras} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: '#0D5BA9' }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e3a5f' }}>
          {MESES_ES[mes]} De {anio}
        </span>
        <button onClick={irAdelante} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: '#0D5BA9' }}>
          <ChevronRight size={18} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 8px 0', gap: '2px' }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#94a3b8', padding: '2px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px 8px 10px', gap: '2px' }}>
        {Array.from({ length: primerDia }, (_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: diasEnMes }, (_, idx) => {
          const dia      = idx + 1;
          const fechaStr = `${anio}-${padMes(mes)}-${padDia(dia)}`;
          const conteo   = conteoPorFecha[fechaStr] || 0;
          const esHoy    = fechaStr === HOY;
          const activo   = fechaStr === fechaSeleccionada;
          return (
            <button
              key={fechaStr}
              onClick={() => onSelectFecha(activo ? null : fechaStr)}
              title={conteo > 0 ? `${conteo} pacientes asignados` : fechaStr}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '4px 2px', borderRadius: '8px', minHeight: '40px', cursor: 'pointer',
                border: esHoy ? '2px solid #0D5BA9' : '2px solid transparent',
                background: activo ? '#0D5BA9' : conteo > 0 ? '#eff6ff' : 'transparent',
                color: activo ? '#fff' : '#1e293b', transition: 'all 0.1s',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: (esHoy || activo) ? '800' : '500', lineHeight: 1 }}>{dia}</span>
              {conteo > 0 && (
                <span style={{
                  marginTop: '2px', minWidth: '18px', height: '18px', borderRadius: '50%',
                  fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', lineHeight: 1, padding: '0 3px',
                  background: activo ? 'rgba(255,255,255,0.3)' : '#0D5BA9', color: '#fff',
                }}>
                  {conteo > 9 ? '9+' : conteo}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {fechaSeleccionada && (
        <div style={{ padding: '0 8px 10px', textAlign: 'center' }}>
          <button
            onClick={() => onSelectFecha(null)}
            style={{ fontSize: '11px', color: '#0D5BA9', background: 'none', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontWeight: '600' }}
          >
            Ver todos los tiempos
          </button>
        </div>
      )}
    </div>
  );
}

// ── Helpers numéricos ─────────────────────────────────────────
const n = (v) => Number(v) || 0;
const pct = (num, den) => den ? Math.round((num / den) * 100) : 0;

// ── Barra segmentada ──────────────────────────────────────────
function BarraSegmentada({ gestora }) {
  const total = n(gestora.total);
  if (!total) return <span style={{ color: '#cbd5e1', fontSize: '11px' }}>—</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '10px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex', minWidth: '80px' }}>
        {CATS.map((c, i) => {
          const val = n(gestora[c.key]);
          if (!val) return null;
          return (
            <div key={i}
              title={`${c.label}: ${val} (${pct(val, total)}%)`}
              style={{ width: `${pct(val, total)}%`, background: c.accent, transition: 'width 0.5s' }}
            />
          );
        })}
      </div>
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', minWidth: '32px', textAlign: 'right' }}>
        {pct(n(gestora.atendidos), total)}%
      </span>
    </div>
  );
}

// ── Badge de conteo ───────────────────────────────────────────
function Badge({ valor, accent, bg }) {
  if (!valor) return <span style={{ color: '#e2e8f0', fontSize: '12px' }}>—</span>;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '20px',
      background: bg, color: accent, fontWeight: '700', fontSize: '12px',
    }}>
      {Number(valor).toLocaleString()}
    </span>
  );
}

// ── Mes actual en formato YYYY-MM ─────────────────────────────
function mesActual() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}`;
}

// ── Botón de ordenamiento de columna ──────────────────────────
function SortBtn({ label, col, sortCol, sortDir, onSort }) {
  const active = sortCol === col;
  const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      onClick={() => onSort(col)}
      title={active ? (sortDir === 'asc' ? 'Ascendente — clic para descendente' : 'Descendente — clic para ascendente') : `Ordenar por ${label}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
        border: active ? '1px solid rgba(255,255,255,0.35)' : '1px solid transparent',
        borderRadius: '5px', cursor: 'pointer', color: '#fff',
        fontWeight: '700', fontSize: '10px', textTransform: 'uppercase',
        letterSpacing: '0.06em', padding: '3px 6px', transition: 'background 0.15s, border 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {label}
      <Icon size={11} strokeWidth={active ? 2.5 : 1.8} style={{ opacity: active ? 1 : 0.45, flexShrink: 0 }} />
    </button>
  );
}

// ── AutocompleteInput para selector de gestora destino ────────
function AutocompleteGestora({ gestoras, value, onChange, placeholder }) {
  const [texto, setTexto]         = useState('');
  const [abierto, setAbierto]     = useState(false);
  const [iniciado, setIniciado]   = useState(false);
  const ref                       = useRef(null);

  // Sincronizar cuando value cambia externamente
  useEffect(() => {
    if (!value) { setTexto(''); setIniciado(false); return; }
    const found = gestoras.find(g => String(g.id) === String(value));
    if (found) setTexto(found.nombre);
  }, [value, gestoras]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtradas = useMemo(() => {
    if (!iniciado || !texto.trim()) return gestoras.slice(0, 30);
    return gestoras
      .filter(g => g.nombre.toLowerCase().includes(texto.toLowerCase()))
      .slice(0, 20);
  }, [texto, gestoras, iniciado]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={texto}
          placeholder={placeholder || 'Buscar gestora...'}
          onChange={e => { setTexto(e.target.value); setIniciado(true); setAbierto(true); onChange(null); }}
          onFocus={() => setAbierto(true)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '9px 32px 9px 12px',
            border: `1.5px solid ${value ? '#0D5BA9' : '#cbd5e1'}`,
            borderRadius: '8px', fontSize: '13px', outline: 'none',
            background: value ? '#f0f7ff' : '#fff', color: '#1e293b',
          }}
        />
        {texto ? (
          <button
            onMouseDown={e => { e.preventDefault(); setTexto(''); onChange(null); setIniciado(false); setAbierto(false); }}
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
        )}
      </div>
      {abierto && filtradas.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
          background: '#fff', border: '1.5px solid #bfdbfe', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(13,91,169,0.18)', maxHeight: '220px', overflowY: 'auto',
        }}>
          {filtradas.map(g => (
            <div
              key={g.id}
              onMouseDown={e => { e.preventDefault(); setTexto(g.nombre); onChange(String(g.id)); setAbierto(false); setIniciado(false); }}
              style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: '13px',
                color: String(g.id) === String(value) ? '#0D5BA9' : '#1e293b',
                background: String(g.id) === String(value) ? '#eff6ff' : 'transparent',
                fontWeight: String(g.id) === String(value) ? '600' : '400',
                borderBottom: '1px solid #f1f5f9',
              }}
              onMouseEnter={e => { if (String(g.id) !== String(value)) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (String(g.id) !== String(value)) e.currentTarget.style.background = 'transparent'; }}
            >
              {g.nombre}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Panel Drawer — detalle de pacientes de una gestora
// ══════════════════════════════════════════════════════════════
function DrawerGestora({ gestora, onClose, onReasignacionExitosa }) {
  const [pacientes,       setPacientes]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [busqueda,        setBusqueda]        = useState('');
  const [filtroCat,       setFiltroCat]       = useState(null); // null = todos
  const [seleccionados,   setSeleccionados]   = useState(new Set());
  const [gestoras,        setGestoras]        = useState([]);
  const [modalAbierto,    setModalAbierto]    = useState(false);
  const [gestoraDestino,  setGestoraDestino]  = useState(null);
  const [reasignando,     setReasignando]     = useState(false);
  const [progreso,        setProgreso]        = useState({ ok: 0, err: 0, total: 0 });

  // Cargar pacientes de la gestora
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await apiClient.get(
          `/bolsas/solicitudes?gestoraId=${gestora.id_gestora}&size=500`, true
        );
        const lista = data?.content ?? data ?? [];
        setPacientes(Array.isArray(lista) ? lista : []);
      } catch (e) {
        console.error('Error cargando pacientes de gestora:', e);
        setPacientes([]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [gestora.id_gestora]);

  // Cargar gestoras disponibles para selector
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await apiClient.get('/bolsas/solicitudes/gestoras-disponibles', true);
        const lista = Array.isArray(data) ? data : (data?.gestoras ?? []);
        // Excluir la gestora actual
        setGestoras(lista.filter(g => String(g.id) !== String(gestora.id_gestora)));
      } catch (e) {
        console.error('Error cargando gestoras disponibles:', e);
      }
    };
    cargar();
  }, [gestora.id_gestora]);

  // Categoría de un paciente
  const categoriaDe = (p) => {
    const cod = p.cod_estado_cita || null;
    for (const [cat, codes] of Object.entries(COD_POR_CAT)) {
      if (codes.includes(cod)) return cat;
    }
    return 'por_citar';
  };

  // Lista filtrada
  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter(p => {
      const matchCat = !filtroCat || categoriaDe(p) === filtroCat;
      const matchBusq = !busqueda || (
        (p.paciente_nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.paciente_dni || '').includes(busqueda)
      );
      return matchCat && matchBusq;
    });
  }, [pacientes, filtroCat, busqueda]);

  // Conteos por categoría
  const conteosCat = useMemo(() => {
    const c = {};
    CATS.forEach(cat => { c[cat.key] = 0; });
    pacientes.forEach(p => { const cat = categoriaDe(p); if (c[cat] !== undefined) c[cat]++; });
    return c;
  }, [pacientes]);

  const todosSeleccionados = pacientesFiltrados.length > 0 &&
    pacientesFiltrados.every(p => seleccionados.has(p.id_solicitud));

  const toggleTodos = () => {
    if (todosSeleccionados) {
      const nuevo = new Set(seleccionados);
      pacientesFiltrados.forEach(p => nuevo.delete(p.id_solicitud));
      setSeleccionados(nuevo);
    } else {
      const nuevo = new Set(seleccionados);
      pacientesFiltrados.forEach(p => nuevo.add(p.id_solicitud));
      setSeleccionados(nuevo);
    }
  };

  const toggleUno = (id) => {
    const nuevo = new Set(seleccionados);
    nuevo.has(id) ? nuevo.delete(id) : nuevo.add(id);
    setSeleccionados(nuevo);
  };

  const abrirModal = () => {
    setGestoraDestino(null);
    setProgreso({ ok: 0, err: 0, total: 0 });
    setModalAbierto(true);
  };

  const confirmarReasignacion = async () => {
    if (!gestoraDestino || seleccionados.size === 0) return;
    const ids = Array.from(seleccionados);
    setReasignando(true);
    setProgreso({ ok: 0, err: 0, total: ids.length });

    try {
      await apiClient.post(
        '/bolsas/solicitudes/asignar-gestora-masivo',
        { ids, idGestora: Number(gestoraDestino) },
        true,
      );
      setProgreso({ ok: ids.length, err: 0, total: ids.length });
      setTimeout(() => {
        setModalAbierto(false);
        setReasignando(false);
        setSeleccionados(new Set());
        onReasignacionExitosa();
        onClose();
      }, 1200);
    } catch (e) {
      console.error('Error reasignando:', e);
      setProgreso({ ok: 0, err: ids.length, total: ids.length });
      setReasignando(false);
    }
  };

  const gestoraDestNombre = gestoras.find(g => String(g.id) === String(gestoraDestino))?.nombre;

  return (
    <>
      {/* Overlay semitransparente */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
          zIndex: 80, backdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Panel lateral */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(680px, 95vw)',
        background: '#fff', zIndex: 90,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
        animation: 'slideInRight 0.25s ease',
      }}>

        {/* ── Cabecera ─────────────────────────────────────── */}
        <div style={{ background: '#0D5BA9', padding: '16px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                {(gestora.nombre_gestora || 'G').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '15px', lineHeight: 1.2 }}>
                  {gestora.nombre_gestora || 'Sin nombre'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '2px' }}>
                  {n(gestora.total).toLocaleString()} pacientes asignados
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', display: 'flex', padding: '6px' }}>
              <X size={18} />
            </button>
          </div>

          {/* Mini KPIs por estado */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {CATS.map(c => {
              const val = n(gestora[c.key]);
              if (!val) return null;
              const activo = filtroCat === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setFiltroCat(prev => prev === c.key ? null : c.key)}
                  title={`Filtrar: ${c.label}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: activo ? '#fff' : 'rgba(255,255,255,0.18)',
                    color: activo ? c.accent : '#fff',
                    fontWeight: '700', fontSize: '11px', transition: 'all 0.15s',
                  }}
                >
                  <span>{val.toLocaleString()}</span>
                  <span style={{ fontWeight: '400', opacity: activo ? 1 : 0.85 }}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Barra de búsqueda + acciones ─────────────────── */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', flexShrink: 0, background: '#fafafa', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px 7px 30px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', outline: 'none', background: '#fff' }}
            />
          </div>
          {seleccionados.size > 0 && (
            <button
              onClick={abrirModal}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: '#0D5BA9', color: '#fff', fontWeight: '600', fontSize: '12px',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <ArrowRightLeft size={13} />
              Reasignar ({seleccionados.size})
            </button>
          )}
        </div>

        {/* ── Tabla de pacientes ───────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px', color: '#64748b' }}>
              <Loader2 size={28} color="#0D5BA9" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '13px' }}>Cargando pacientes...</span>
            </div>
          ) : pacientesFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
              <Users size={36} style={{ opacity: 0.2, marginBottom: '10px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                {filtroCat ? `No hay pacientes en "${CATS.find(c=>c.key===filtroCat)?.label}"` : 'No hay pacientes para esta gestora'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', width: '36px' }}>
                    <input
                      type="checkbox"
                      checked={todosSeleccionados}
                      onChange={toggleTodos}
                      style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: '#0D5BA9' }}
                      title={todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    />
                  </th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paciente</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Especialidad</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.map((p, idx) => {
                  const cat        = categoriaDe(p);
                  const catInfo    = CATS.find(c => c.key === cat);
                  const selec      = seleccionados.has(p.id_solicitud);
                  const rowBg      = selec ? '#eff6ff' : idx % 2 === 0 ? '#fff' : '#fafafa';
                  return (
                    <tr
                      key={p.id_solicitud}
                      onClick={() => toggleUno(p.id_solicitud)}
                      style={{ background: rowBg, cursor: 'pointer', borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}
                      onMouseEnter={e => { if (!selec) e.currentTarget.style.background = '#f0f7ff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
                    >
                      <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selec}
                          onChange={() => toggleUno(p.id_solicitud)}
                          onClick={e => e.stopPropagation()}
                          style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: '#0D5BA9' }}
                        />
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', lineHeight: 1.3 }}>
                          {p.paciente_nombre || 'Sin nombre'}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '1px' }}>
                          DNI: {p.paciente_dni || '—'} · {p.desc_ipress || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '9px 12px', color: '#475569', fontSize: '11px' }}>
                        {p.especialidad || '—'}
                      </td>
                      <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
                          background: catInfo?.bg, color: catInfo?.accent,
                          fontWeight: '600', fontSize: '10px', whiteSpace: 'nowrap',
                        }}>
                          {p.desc_estado_cita || catInfo?.label || 'Por Citar'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer con resumen de selección ─────────────── */}
        {!loading && pacientesFiltrados.length > 0 && (
          <div style={{
            padding: '12px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc',
            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {pacientesFiltrados.length.toLocaleString()} pacientes
              {filtroCat && ` en ${CATS.find(c=>c.key===filtroCat)?.label}`}
              {seleccionados.size > 0 && (
                <strong style={{ color: '#0D5BA9', marginLeft: '6px' }}>
                  · {seleccionados.size} seleccionados
                </strong>
              )}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {seleccionados.size > 0 && (
                <button
                  onClick={() => setSeleccionados(new Set())}
                  style={{ fontSize: '11px', color: '#64748b', background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}
                >
                  Limpiar selección
                </button>
              )}
              <button
                onClick={toggleTodos}
                style={{ fontSize: '11px', color: '#0D5BA9', background: 'none', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: '600' }}
              >
                {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal de confirmación de reasignación ──────────── */}
      {modalAbierto && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15,23,42,0.6)',
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '420px', maxWidth: '95vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            overflow: 'visible',
            animation: 'slideUp 0.2s ease',
          }}>
            {/* Header */}
            <div style={{ background: '#0D5BA9', borderRadius: '16px 16px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ArrowRightLeft size={18} color="#fff" />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>Reasignar pacientes</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                  {seleccionados.size} pacientes de {gestora.nombre_gestora}
                </div>
              </div>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#fff', display: 'flex', padding: '4px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Resumen */}
              <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <UserCheck size={20} color="#0D5BA9" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '12px', color: '#1e40af' }}>
                  Se moverán <strong>{seleccionados.size} pacientes</strong> de{' '}
                  <strong>{gestora.nombre_gestora}</strong> a la gestora que selecciones.
                </div>
              </div>

              {/* Selector gestora destino */}
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Gestora destino
              </label>
              <div style={{ position: 'relative', zIndex: 150 }}>
                <AutocompleteGestora
                  gestoras={gestoras}
                  value={gestoraDestino}
                  onChange={setGestoraDestino}
                  placeholder="Escribe para buscar gestora..."
                />
              </div>

              {/* Barra de progreso */}
              {reasignando && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px', color: '#64748b' }}>
                    <span>Reasignando...</span>
                    <span>{progreso.ok + progreso.err} / {progreso.total}</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${progreso.total ? ((progreso.ok + progreso.err) / progreso.total) * 100 : 0}%`,
                      background: progreso.err > 0 ? '#ef4444' : '#10b981',
                      borderRadius: '8px', transition: 'width 0.3s',
                    }} />
                  </div>
                  {progreso.ok === progreso.total && progreso.total > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: '600' }}>
                      <CheckCircle2 size={14} /> Reasignación completada
                    </div>
                  )}
                </div>
              )}

              {/* Botones */}
              {!reasignando && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={() => setModalAbierto(false)}
                    style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarReasignacion}
                    disabled={!gestoraDestino}
                    style={{
                      flex: 2, padding: '9px', borderRadius: '8px', border: 'none', cursor: gestoraDestino ? 'pointer' : 'not-allowed',
                      background: gestoraDestino ? '#0D5BA9' : '#e2e8f0',
                      color: gestoraDestino ? '#fff' : '#94a3b8',
                      fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    <ArrowRightLeft size={14} />
                    Confirmar reasignación
                    {gestoraDestNombre && (
                      <span style={{ fontWeight: '400', fontSize: '11px', opacity: 0.85 }}>
                        → {gestoraDestNombre.split(' ')[0]}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animaciones */}
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn       { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp      { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin         { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// Componente principal
// ══════════════════════════════════════════════════════════════
export default function BolsaXGestor() {
  const [gestoras, setGestoras]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [filtroCat, setFiltroCat]           = useState(null);
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [sortCol, setSortCol]               = useState('nombre_gestora');
  const [sortDir, setSortDir]               = useState('asc');

  // Drawer
  const [gestoraDrawer, setGestoraDrawer]   = useState(null);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir(col === 'nombre_gestora' ? 'asc' : 'desc');
    }
  };

  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [conteoPorFecha, setConteoPorFecha]       = useState({});
  const [showCalendario, setShowCalendario]        = useState(false);
  const calendarioRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (calendarioRef.current && !calendarioRef.current.contains(e.target)) {
        setShowCalendario(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const cargarConteos = useCallback(async (mes) => {
    try {
      const data = await apiClient.get(`/bolsas/solicitudes/estadisticas/conteo-por-fecha?mes=${mes}`, true);
      if (Array.isArray(data)) {
        const mapa = {};
        data.forEach(({ fecha, total }) => { mapa[fecha] = Number(total); });
        setConteoPorFecha(mapa);
      }
    } catch (err) {
      console.error('Error cargando conteo por fecha:', err);
    }
  }, []);

  const cargar = useCallback(async (fecha) => {
    setLoading(true);
    setError('');
    try {
      let url = '/bolsas/solicitudes/estadisticas/por-gestora';
      if (fecha) url += `?fechaDesde=${fecha}&fechaHasta=${fecha}`;
      const data = await apiClient.get(url, true);
      setGestoras(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando estadísticas por gestora:', err);
      setError('No se pudieron cargar las estadísticas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar(null);
    cargarConteos(mesActual());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectFecha = (fecha) => {
    setFechaSeleccionada(fecha);
    setFiltroCat(null);
    cargar(fecha);
    if (fecha) setShowCalendario(false);
  };

  const totales = useMemo(() => {
    const t = { total: 0 };
    CATS.forEach(c => { t[c.key] = 0; });
    gestoras.forEach(g => {
      t.total += n(g.total);
      CATS.forEach(c => { t[c.key] += n(g[c.key]); });
    });
    return t;
  }, [gestoras]);

  const etiquetaPeriodo = fechaSeleccionada || 'Todos los tiempos';

  if (loading) return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ height: '32px', background: '#f1f5f9', borderRadius: '8px', width: '220px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '52px', background: '#f1f5f9', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {Array.from({ length: 7 }, (_, i) => <div key={i} style={{ height: '80px', background: '#f1f5f9', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />)}
      </div>
      <div style={{ height: '300px', background: '#f1f5f9', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: '24px' }}>
      <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '20px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertCircle size={20} />
        <div style={{ flex: 1 }}>
          <strong>Error al cargar datos</strong>
          <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{error}</p>
        </div>
        <button onClick={() => cargar(fechaSeleccionada)} style={{ padding: '8px 16px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* ── Encabezado ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: '#0D5BA9', borderRadius: '12px', display: 'flex' }}>
            <Users size={22} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>Bolsa x Gestor</h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              {etiquetaPeriodo} · <strong style={{ color: '#0D5BA9' }}>{totales.total.toLocaleString()}</strong> pacientes · {gestoras.length} gestoras ·{' '}
              <span style={{ color: '#94a3b8' }}>Clic en una fila para ver detalle y reasignar</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => cargar(fechaSeleccionada)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* ── Filtro por calendario ────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Calendar size={15} color="#64748b" />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha de asignación</span>
          <div ref={calendarioRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowCalendario(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                border: `1.5px solid ${showCalendario || fechaSeleccionada ? '#0D5BA9' : '#cbd5e1'}`,
                background: showCalendario || fechaSeleccionada ? '#eff6ff' : '#f8fafc',
                color: fechaSeleccionada ? '#0D5BA9' : '#475569',
                fontSize: '13px', fontWeight: '600', transition: 'all 0.15s',
              }}
            >
              <Calendar size={14} color={fechaSeleccionada ? '#0D5BA9' : '#64748b'} />
              {fechaSeleccionada || 'Seleccionar fecha'}
              <ChevronRight size={14} style={{ transform: showCalendario ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }} />
            </button>
            {showCalendario && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 50 }}>
                <CalendarioFechas
                  fechaSeleccionada={fechaSeleccionada}
                  onSelectFecha={handleSelectFecha}
                  conteoPorFecha={conteoPorFecha}
                  onMesCambio={(mes) => cargarConteos(mes)}
                />
              </div>
            )}
          </div>
          {fechaSeleccionada && (
            <button
              onClick={() => handleSelectFecha(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '20px',
                background: '#0D5BA9', color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              }}
            >
              {fechaSeleccionada} <XCircle size={13} style={{ opacity: 0.8 }} />
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        <div style={{ background: '#0D5BA9', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 2px 8px rgba(13,91,169,0.25)' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Asignados</span>
          <span style={{ fontSize: '30px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>{totales.total.toLocaleString()}</span>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{gestoras.length} gestoras</span>
        </div>
        {CATS.map(c => {
          const Icono = c.icon;
          const activo = filtroCat === c.key;
          return (
            <div
              key={c.key}
              onClick={() => setFiltroCat(prev => prev === c.key ? null : c.key)}
              title={`${activo ? 'Quitar filtro' : 'Filtrar'}: ${c.label} — ${c.desc}`}
              style={{
                background: activo ? c.accent : c.bg,
                border: `2px solid ${activo ? c.accent : c.border}`,
                borderLeft: `4px solid ${c.accent}`,
                borderRadius: '12px', padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: '4px',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: activo ? `0 4px 12px ${c.accent}40` : '0 1px 2px rgba(0,0,0,0.04)',
                transform: activo ? 'translateY(-1px)' : 'none', userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: activo ? 'rgba(255,255,255,0.85)' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</span>
                <Icono size={13} color={activo ? 'rgba(255,255,255,0.7)' : c.accent} />
              </div>
              <span style={{ fontSize: '26px', fontWeight: '800', lineHeight: 1, color: activo ? '#fff' : c.accent }}>
                {totales[c.key].toLocaleString()}
              </span>
              <span style={{ fontSize: '10px', color: activo ? 'rgba(255,255,255,0.65)' : '#94a3b8' }}>
                {pct(totales[c.key], totales.total)}% del total
              </span>
            </div>
          );
        })}
      </div>

      {filtroCat && (() => {
        const c = CATS.find(x => x.key === filtroCat);
        return c ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Ordenando por:</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px 3px 12px', background: c.accent, color: '#fff', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
              {c.label}
              <button onClick={() => setFiltroCat(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', padding: 0, opacity: 0.8 }}>
                <XCircle size={14} />
              </button>
            </span>
          </div>
        ) : null;
      })()}

      {/* ── Buscador por nombre ──────────────────────────────── */}
      <div style={{ position: 'relative', maxWidth: '320px' }}>
        <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Buscar gestora..."
          value={busquedaNombre}
          onChange={e => setBusquedaNombre(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '8px 12px 8px 36px',
            border: '1.5px solid #e2e8f0', borderRadius: '8px',
            fontSize: '13px', color: '#1e293b', outline: 'none',
            background: '#fff',
          }}
        />
        {busquedaNombre && (
          <button
            onClick={() => setBusquedaNombre('')}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}
          >
            <XCircle size={15} />
          </button>
        )}
      </div>

      {/* ── Tabla ────────────────────────────────────────────── */}
      {gestoras.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
          <Users size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '15px' }}>No hay datos para la fecha seleccionada</p>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#cbd5e1' }}>Selecciona otra fecha en el calendario</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#0D5BA9' }}>
                  <th style={TH}>#</th>
                  <th style={{ ...TH, textAlign: 'left', minWidth: '180px' }}>
                    <SortBtn label="Gestora" col="nombre_gestora" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th style={TH}>
                    <SortBtn label="Total" col="total" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  {CATS.map(c => (
                    <th key={c.key} style={{ ...TH, whiteSpace: 'nowrap' }}>
                      <SortBtn label={c.label} col={c.key} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                    </th>
                  ))}
                  <th style={{ ...TH, minWidth: '140px' }}>Avance</th>
                </tr>
                <tr style={{ background: '#1e40af' }}>
                  <td colSpan={3} />
                  {CATS.map(c => (
                    <td key={c.key} style={{ padding: '3px 14px', textAlign: 'center', fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                      {c.desc}
                    </td>
                  ))}
                  <td />
                </tr>
              </thead>
              <tbody>
                {[...gestoras]
                  .filter(g => !busquedaNombre || (g.nombre_gestora || '').toLowerCase().includes(busquedaNombre.toLowerCase()))
                  .sort((a, b) => {
                    const dir = sortDir === 'asc' ? 1 : -1;
                    if (sortCol === 'nombre_gestora') return dir * (a.nombre_gestora || '').localeCompare(b.nombre_gestora || '', 'es', { sensitivity: 'base' });
                    return dir * (n(a[sortCol]) - n(b[sortCol]));
                  })
                  .map((g, idx) => {
                    const rowBg = idx % 2 === 0 ? '#fff' : '#fafafa';
                    return (
                      <tr
                        key={g.id_gestora}
                        onClick={() => setGestoraDrawer(g)}
                        title="Clic para ver detalle y reasignar pacientes"
                        style={{ borderBottom: '1px solid #f1f5f9', background: rowBg, cursor: 'pointer', transition: 'background 0.12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.boxShadow = 'inset 3px 0 0 #0D5BA9'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = rowBg; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <td style={{ padding: '11px 14px', textAlign: 'center', color: '#94a3b8', fontWeight: '600', fontSize: '12px' }}>{idx + 1}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#1d4ed8', flexShrink: 0 }}>
                              {(g.nombre_gestora || 'S').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>{g.nombre_gestora || 'Sin nombre'}</div>
                              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>
                                {pct(n(g.citados) + n(g.atendidos), n(g.total))}% avanzado · ver detalle →
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                          <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>{n(g.total).toLocaleString()}</span>
                        </td>
                        {CATS.map(c => (
                          <td key={c.key} style={{ padding: '11px 14px', textAlign: 'center' }}>
                            <Badge valor={n(g[c.key])} accent={c.accent} bg={c.bg} />
                          </td>
                        ))}
                        <td style={{ padding: '11px 14px' }}>
                          <BarraSegmentada gestora={g} />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f1f5f9', borderTop: '2px solid #e2e8f0', fontWeight: '700' }}>
                  <td colSpan={2} style={{ padding: '12px 14px', color: '#1e293b', fontSize: '12px' }}>
                    TOTAL ({gestoras.length} gestoras)
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', color: '#0f172a', fontWeight: '800', fontSize: '15px' }}>
                    {totales.total.toLocaleString()}
                  </td>
                  {CATS.map(c => (
                    <td key={c.key} style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <Badge valor={totales[c.key]} accent={c.accent} bg={c.bg} />
                    </td>
                  ))}
                  <td style={{ padding: '12px 14px' }}>
                    <BarraSegmentada gestora={totales} />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── Leyenda ───────────────────────────────────────────── */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Leyenda</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {CATS.map(c => {
            const Icono = c.icon;
            return (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#374151' }}>
                <Icono size={12} color={c.accent} />
                <span style={{ fontWeight: '600', color: c.accent }}>{c.label}:</span>
                <span style={{ color: '#64748b' }}>{c.desc}</span>
              </div>
            );
          })}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#374151', borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
            <span style={{ fontWeight: '600', color: '#475569' }}>Filtro:</span>
            <span style={{ color: '#64748b' }}>Basado en fecha de asignación del paciente a la gestora</span>
          </div>
        </div>
      </div>

      {/* ── Drawer lateral ────────────────────────────────────── */}
      {gestoraDrawer && (
        <DrawerGestora
          gestora={gestoraDrawer}
          onClose={() => setGestoraDrawer(null)}
          onReasignacionExitosa={() => cargar(fechaSeleccionada)}
        />
      )}
    </div>
  );
}

// ── Estilo TH reutilizable ────────────────────────────────────
const TH = {
  padding: '11px 14px',
  textAlign: 'center',
  fontSize: '10px',
  fontWeight: '700',
  color: '#e0f2fe',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};
