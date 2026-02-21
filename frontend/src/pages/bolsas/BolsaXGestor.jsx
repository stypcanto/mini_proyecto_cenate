/**
 * BolsaXGestor.jsx
 * Vista "Bolsa x Gestor" — distribución de pacientes por gestora de citas
 * v4.0 – Filtro por calendario con badges de conteo por día
 *
 * Acceso: SUPERADMIN, COORDINADOR_GESTION_CITAS
 * Datos: GET /api/bolsas/solicitudes/estadisticas/por-gestora?fechaDesde=&fechaHasta=
 *        GET /api/bolsas/solicitudes/estadisticas/conteo-por-fecha?mes=YYYY-MM
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import apiClient from '../../lib/apiClient';
import {
  Users, RefreshCw, CalendarCheck, PhoneMissed,
  AlertCircle, CheckCircle2, XCircle, Clock, Calendar,
  ChevronLeft, ChevronRight, Search,
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
      {/* Cabecera mes/año */}
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

      {/* Encabezado días semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 8px 0', gap: '2px' }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#94a3b8', padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      {/* Días del mes */}
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

      {/* Botón limpiar selección */}
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

// ══════════════════════════════════════════════════════════════
// Componente principal
// ══════════════════════════════════════════════════════════════
export default function BolsaXGestor() {
  const [gestoras, setGestoras]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [filtroCat, setFiltroCat]           = useState(null);
  const [busquedaNombre, setBusquedaNombre] = useState('');

  // ── Filtro por calendario ─────────────────────────────────
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [conteoPorFecha, setConteoPorFecha]       = useState({});
  const [showCalendario, setShowCalendario]        = useState(false);
  const calendarioRef = useRef(null);

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (calendarioRef.current && !calendarioRef.current.contains(e.target)) {
        setShowCalendario(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cargar conteos por fecha (badges del calendario)
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

  // Cargar estadísticas por gestora
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

  // Carga inicial
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

  // ── Totales ───────────────────────────────────────────────
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

  // ── Loading skeleton ─────────────────────────────────────
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

  // ── Error ────────────────────────────────────────────────
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
              {etiquetaPeriodo} · <strong style={{ color: '#0D5BA9' }}>{totales.total.toLocaleString()}</strong> pacientes · {gestoras.length} gestoras
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

          {/* Botón selector de fecha */}
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

          {/* Chip fecha seleccionada con botón eliminar */}
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

      {/* Chip filtro categoría activo */}
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
                  <th style={{ ...TH, textAlign: 'left', minWidth: '180px' }}>Gestora</th>
                  <th style={TH}>Total</th>
                  {CATS.map(c => (
                    <th key={c.key} style={{ ...TH, whiteSpace: 'nowrap' }}>{c.label}</th>
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
                  .sort((a, b) => filtroCat ? n(b[filtroCat]) - n(a[filtroCat]) : (a.nombre_gestora || '').localeCompare(b.nombre_gestora || '', 'es', { sensitivity: 'base' }))
                  .map((g, idx) => {
                    const rowBg = idx % 2 === 0 ? '#fff' : '#fafafa';
                    return (
                      <tr
                        key={g.id_gestora}
                        style={{ borderBottom: '1px solid #f1f5f9', background: rowBg }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
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
                                {pct(n(g.citados) + n(g.atendidos), n(g.total))}% avanzado
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
