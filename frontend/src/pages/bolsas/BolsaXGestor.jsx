/**
 * BolsaXGestor.jsx
 * Vista "Bolsa x Gestor" — distribución de pacientes por gestora de citas
 * v3.0 – Filtro temporal: Hoy / Esta semana / Este mes / Rango personalizado
 *
 * Acceso: SUPERADMIN, COORDINADOR_GESTION_CITAS
 * Datos: GET /api/bolsas/solicitudes/estadisticas/por-gestora?fechaDesde=&fechaHasta=
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../../lib/apiClient';
import {
  Users, RefreshCw, CalendarCheck, PhoneMissed,
  AlertCircle, CheckCircle2, XCircle, Clock, Calendar,
  ChevronDown,
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

// ── Opciones de período ───────────────────────────────────────
const PERIODOS = [
  { key: 'todo',    label: 'Todo' },
  { key: 'hoy',     label: 'Hoy' },
  { key: 'semana',  label: 'Esta semana' },
  { key: 'mes',     label: 'Este mes' },
  { key: 'rango',   label: 'Rango' },
];

// ── Helpers de fecha ─────────────────────────────────────────
const toISO = (d) => d.toISOString().slice(0, 10); // 'YYYY-MM-DD'

function calcularRango(periodo) {
  const hoy = new Date();
  if (periodo === 'hoy') {
    const s = toISO(hoy);
    return { desde: s, hasta: s };
  }
  if (periodo === 'semana') {
    const dow = hoy.getDay(); // 0=dom
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((dow + 6) % 7));
    return { desde: toISO(lunes), hasta: toISO(hoy) };
  }
  if (periodo === 'mes') {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return { desde: toISO(inicio), hasta: toISO(hoy) };
  }
  return { desde: null, hasta: null };
}

function labelPeriodo(periodo, rangoDesde, rangoHasta) {
  if (periodo === 'hoy')    return `Hoy (${toISO(new Date())})`;
  if (periodo === 'semana') return `Esta semana`;
  if (periodo === 'mes')    return `${new Date().toLocaleString('es-PE', { month: 'long', year: 'numeric' })}`;
  if (periodo === 'rango' && rangoDesde && rangoHasta) return `${rangoDesde} → ${rangoHasta}`;
  return 'Todos los tiempos';
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

// ══════════════════════════════════════════════════════════════
// Componente principal
// ══════════════════════════════════════════════════════════════
export default function BolsaXGestor() {
  const [gestoras, setGestoras]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [filtroCat, setFiltroCat]     = useState(null);

  // ── Filtro temporal ──────────────────────────────────────
  const [periodo, setPeriodo]         = useState('todo');
  const [rangoDesde, setRangoDesde]   = useState('');
  const [rangoHasta, setRangoHasta]   = useState('');
  const [showRango, setShowRango]     = useState(false);

  const cargar = useCallback(async (pd = periodo, desde = rangoDesde, hasta = rangoHasta) => {
    setLoading(true);
    setError('');
    try {
      let url = '/bolsas/solicitudes/estadisticas/por-gestora';
      const params = new URLSearchParams();

      if (pd !== 'todo' && pd !== 'rango') {
        const { desde: d, hasta: h } = calcularRango(pd);
        if (d) params.set('fechaDesde', d);
        if (h) params.set('fechaHasta', h);
      } else if (pd === 'rango') {
        if (desde) params.set('fechaDesde', desde);
        if (hasta) params.set('fechaHasta', hasta);
      }

      if (params.toString()) url += `?${params.toString()}`;
      const data = await apiClient.get(url, true);
      setGestoras(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando estadísticas por gestora:', err);
      setError('No se pudieron cargar las estadísticas.');
    } finally {
      setLoading(false);
    }
  }, [periodo, rangoDesde, rangoHasta]);

  useEffect(() => { cargar(); }, []); // carga inicial

  const handlePeriodo = (pd) => {
    setPeriodo(pd);
    setShowRango(pd === 'rango');
    setFiltroCat(null);
    if (pd !== 'rango') cargar(pd, '', '');
  };

  const aplicarRango = () => {
    if (rangoDesde && rangoHasta) cargar('rango', rangoDesde, rangoHasta);
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

  const etiquetaPeriodo = labelPeriodo(periodo, rangoDesde, rangoHasta);

  // ── Loading skeleton ─────────────────────────────────────
  if (loading) return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ height: '32px', background: '#f1f5f9', borderRadius: '8px', width: '220px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '52px', background: '#f1f5f9', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {[...Array(7)].map((_, i) => <div key={i} style={{ height: '80px', background: '#f1f5f9', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />)}
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
        <button onClick={() => cargar()} style={{ padding: '8px 16px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
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
          onClick={() => cargar()}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* ── Filtro temporal ─────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Calendar size={15} color="#64748b" />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Período de asignación</span>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginLeft: '4px' }}>
            {PERIODOS.map(p => {
              const activo = periodo === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => handlePeriodo(p.key)}
                  style={{
                    padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: activo ? '#0D5BA9' : '#f8fafc',
                    color: activo ? '#fff' : '#475569',
                    border: `1.5px solid ${activo ? '#0D5BA9' : '#e2e8f0'}`,
                    boxShadow: activo ? '0 2px 8px rgba(13,91,169,0.3)' : 'none',
                  }}
                >
                  {p.key === 'rango' && <Calendar size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector de rango personalizado */}
        {showRango && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Desde</span>
            <input
              type="date"
              value={rangoDesde}
              onChange={e => setRangoDesde(e.target.value)}
              style={{ padding: '6px 10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#1e293b', outline: 'none', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Hasta</span>
            <input
              type="date"
              value={rangoHasta}
              min={rangoDesde}
              onChange={e => setRangoHasta(e.target.value)}
              style={{ padding: '6px 10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#1e293b', outline: 'none', cursor: 'pointer' }}
            />
            <button
              onClick={aplicarRango}
              disabled={!rangoDesde || !rangoHasta}
              style={{
                padding: '6px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                background: rangoDesde && rangoHasta ? '#0D5BA9' : '#e2e8f0',
                color: rangoDesde && rangoHasta ? '#fff' : '#94a3b8',
                border: 'none', transition: 'all 0.15s',
              }}
            >
              Aplicar
            </button>
            {(rangoDesde || rangoHasta) && (
              <button
                onClick={() => { setRangoDesde(''); setRangoHasta(''); }}
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', background: 'none', border: '1px solid #e2e8f0', color: '#64748b' }}
              >
                Limpiar
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {/* Total */}
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

      {/* ── Tabla ────────────────────────────────────────────── */}
      {gestoras.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
          <Users size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '15px' }}>No hay datos para el período seleccionado</p>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#cbd5e1' }}>Prueba con otro rango de fechas</p>
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
                  .sort((a, b) => filtroCat ? n(b[filtroCat]) - n(a[filtroCat]) : n(b.total) - n(a.total))
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
            <span style={{ fontWeight: '600', color: '#475569' }}>Filtro temporal:</span>
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
