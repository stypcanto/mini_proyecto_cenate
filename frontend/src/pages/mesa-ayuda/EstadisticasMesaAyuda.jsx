// ============================================================================
// 📊 EstadisticasMesaAyuda.jsx – Dashboard Estadísticas Mesa de Ayuda
// v1.69.1 - CENATE 2026 - Filtro de período en Mi Producción
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from 'recharts';
import {
  BarChart3, Ticket, CheckCircle2, AlertCircle, Loader2,
  RefreshCw, Users, TrendingUp, Timer, Trophy, Medal,
  ChevronDown, User, Target, Zap, Award, Clock, Calendar,
} from 'lucide-react';
import { mesaAyudaService } from '../../services/mesaAyudaService';

// ─── Constantes ───────────────────────────────────────────────────────────
const AZUL      = '#0a5ba9';
const AZUL_SOFT = '#e8f1fb';

const ESTADO_COLOR = {
  resueltos: '#22c55e',
  enProceso: '#f59e0b',
  nuevos:    '#3b82f6',
  cerrados:  '#94a3b8',
};

const PRIORIDAD_CFG = {
  ALTA:  { label: 'Alta',  bg: '#fee2e2', text: '#dc2626', bar: '#ef4444' },
  MEDIA: { label: 'Media', bg: '#fef3c7', text: '#d97706', bar: '#f59e0b' },
  BAJA:  { label: 'Baja',  bg: '#dcfce7', text: '#16a34a', bar: '#22c55e' },
};

const MEDALLAS = [
  { Icon: Trophy, color: '#f59e0b', bg: '#fef3c7', label: '1°' },
  { Icon: Medal,  color: '#94a3b8', bg: '#f1f5f9', label: '2°' },
  { Icon: Award,  color: '#cd7c3f', bg: '#fff7ed', label: '3°' },
];

const AVATAR_COLORS = ['#0a5ba9','#7c3aed','#db2777','#059669','#d97706','#dc2626'];

const PERIODOS = [
  { key: 'dia',    label: 'Hoy',   labelLargo: 'del día de hoy'    },
  { key: 'semana', label: 'Semana', labelLargo: 'de esta semana'   },
  { key: 'mes',    label: 'Mes',   labelLargo: 'de este mes'       },
  { key: 'ano',    label: 'Año',   labelLargo: 'de este año'       },
];

// ─── Helpers ──────────────────────────────────────────────────────────────
function formatTiempo(min) {
  if (!min || min === 0) return '—';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
function formatFecha(str) {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}
function getIniciales(nombre) {
  if (!nombre) return '?';
  const p = nombre.trim().split(' ').filter(Boolean);
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[1][0]).toUpperCase();
}
function getAvatarColor(nombre) {
  let hash = 0;
  for (const c of (nombre || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      {label && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color || AZUL }} className="font-medium">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Gauge circular ───────────────────────────────────────────────────────
function GaugeResolucion({ pct = 0, size = 140, label = 'resolución' }) {
  const safe  = Math.min(100, Math.max(0, Math.round(pct)));
  const color = safe >= 80 ? '#22c55e' : safe >= 50 ? '#f59e0b' : '#ef4444';
  const data  = [{ value: safe }, { value: 100 - safe }];
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie data={data} cx={size / 2 - 1} cy={size / 2 - 1}
          startAngle={90} endAngle={-270}
          innerRadius={size * 0.32} outerRadius={size * 0.44}
          dataKey="value" stroke="none">
          <Cell fill={color} />
          <Cell fill="#e2e8f0" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-bold text-slate-800" style={{ fontSize: size * 0.18 }}>{safe}%</span>
        <span className="text-slate-500 uppercase tracking-wide" style={{ fontSize: size * 0.07 }}>{label}</span>
      </div>
    </div>
  );
}

// ─── Mini donut ───────────────────────────────────────────────────────────
function MiniGauge({ pct = 0, size = 52 }) {
  const safe  = Math.min(100, Math.max(0, Math.round(pct)));
  const color = safe >= 80 ? '#22c55e' : safe >= 50 ? '#f59e0b' : '#ef4444';
  const data  = [{ value: safe }, { value: 100 - safe }];
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie data={data} cx={size / 2 - 1} cy={size / 2 - 1}
          startAngle={90} endAngle={-270}
          innerRadius={size * 0.31} outerRadius={size * 0.46}
          dataKey="value" stroke="none">
          <Cell fill={color} />
          <Cell fill="#e2e8f0" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span style={{ fontSize: 9, color, fontWeight: 700 }}>{safe}%</span>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, iconBg, iconColor, borderColor }) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3 ${borderColor || 'border-slate-200'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">{label}</p>
        <p className="text-xl font-bold text-slate-800 leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Barra horizontal ─────────────────────────────────────────────────────
function BarraSencilla({ label, valor, pct, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-600 flex-shrink-0 truncate" style={{ width: 130 }} title={label}>{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color || AZUL }} />
      </div>
      <span className="text-xs font-bold text-slate-700 w-6 text-right">{valor}</span>
      <span className="text-[10px] text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Tab button ──────────────────────────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, label, badge }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
        active
          ? 'bg-[#0a5ba9] text-white shadow-md shadow-[#0a5ba9]/30'
          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
      }`}>
      <Icon className="w-4 h-4" />
      {label}
      {badge != null && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
        }`}>{badge}</span>
      )}
    </button>
  );
}

// ─── Período filter buttons ───────────────────────────────────────────────
function PeriodoBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        active
          ? 'bg-[#0a5ba9] text-white shadow-sm'
          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
      }`}>
      {label}
    </button>
  );
}

// ─── Panel "Mi Producción" con filtro de período ──────────────────────────
function DetallePersonalPanel({
  personalSelData, porPersonalDetalle, promEquipoResolucion,
  periodo, setPeriodo, periodoData, periodoLoading,
}) {
  if (!personalSelData) return null;

  const rank        = porPersonalDetalle.findIndex(p => p.personal === personalSelData.personal) + 1;
  const avatarColor = getAvatarColor(personalSelData.personal);
  const tasaGlobal  = Math.round(personalSelData.tasaResolucion);
  const vsEquipo    = tasaGlobal - promEquipoResolucion;
  const medalCfg    = rank <= 3 ? MEDALLAS[rank - 1] : null;
  const periodoLabel = PERIODOS.find(p => p.key === periodo)?.labelLargo || '';

  // KPIs del período
  const kpis    = periodoData?.kpis    || {};
  const evolucion = periodoData?.evolucion || [];
  const ppPrioridad = periodoData?.porPrioridad || [];
  const tasaPeriodo = Math.round(kpis.tasaResolucion || 0);

  const promTotal = porPersonalDetalle.length > 0
    ? Math.round(porPersonalDetalle.reduce((s, p) => s + p.total, 0) / porPersonalDetalle.length)
    : 0;
  const maxRef = Math.max(personalSelData.total, promTotal, 1);

  const estadoData = [
    { name: 'Resueltos',  value: kpis.resueltos || 0, fill: ESTADO_COLOR.resueltos },
    { name: 'En Proceso', value: kpis.enProceso || 0, fill: ESTADO_COLOR.enProceso },
    { name: 'Nuevos',     value: kpis.nuevos    || 0, fill: ESTADO_COLOR.nuevos    },
  ];

  return (
    <div className="space-y-4">

      {/* Header del operador (datos globales) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
            style={{ backgroundColor: avatarColor }}>
            {getIniciales(personalSelData.personal)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-base font-bold text-slate-800">{personalSelData.personal}</h2>
              {medalCfg ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: medalCfg.bg }}>
                  <medalCfg.Icon className="w-3 h-3" style={{ color: medalCfg.color }} />
                  <span className="text-[10px] font-bold" style={{ color: medalCfg.color }}>Puesto {rank}° global</span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">Puesto {rank}° global</span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Total global: <span className="font-semibold text-slate-700">{personalSelData.total} tickets</span>
              {' · '}
              Tasa global: <span className="font-semibold text-slate-700">{tasaGlobal}%</span>
              {' · '}
              <span className={`font-semibold ${vsEquipo >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {vsEquipo >= 0 ? '+' : ''}{vsEquipo}% vs equipo
              </span>
            </p>
          </div>
          {/* Gauge global */}
          <GaugeResolucion pct={tasaGlobal} size={100} label="global" />
        </div>
      </div>

      {/* ── Selector de período ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0a5ba9]" />
            <span className="text-sm font-semibold text-slate-700">Estadísticas por Período</span>
          </div>
          <div className="flex gap-1.5">
            {PERIODOS.map(p => (
              <PeriodoBtn key={p.key} label={p.label}
                active={periodo === p.key}
                onClick={() => setPeriodo(p.key)} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenido del período ── */}
      {periodoLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#0a5ba9]" />
          <span className="text-sm text-slate-500">Cargando datos {periodoLabel}…</span>
        </div>
      ) : (
        <div className="space-y-4">

          {/* KPIs del período */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center gap-1 col-span-1">
              <GaugeResolucion pct={tasaPeriodo} size={90} label="resolución" />
            </div>
            <KpiCard icon={Ticket}       label="Total" value={kpis.total ?? 0}
              iconBg="bg-[#e8f1fb]" iconColor="text-[#0a5ba9]" />
            <KpiCard icon={CheckCircle2} label="Resueltos" value={kpis.resueltos ?? 0}
              sub={`${tasaPeriodo}%`}
              iconBg="bg-green-50" iconColor="text-green-600" borderColor="border-green-100" />
            <KpiCard icon={Zap}          label="En Proceso" value={kpis.enProceso ?? 0}
              iconBg="bg-amber-50" iconColor="text-amber-600" borderColor="border-amber-100" />
            <KpiCard icon={Timer}        label="Tiempo Prom." value={formatTiempo(kpis.tiempoPromedioMinutos)}
              iconBg="bg-purple-50" iconColor="text-purple-600" />
          </div>

          {/* Gráfica evolución + distribución */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Evolución en el período */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Evolución {periodoLabel}
              </p>
              {evolucion.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-300 gap-2">
                  <BarChart3 className="w-8 h-8" />
                  <p className="text-xs text-slate-400">Sin actividad {periodoLabel}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={evolucion.map(d => ({ name: d.etiqueta, value: d.cantidad }))}
                    margin={{ top: 12, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Tickets" fill={AZUL} radius={[4, 4, 0, 0]} maxBarSize={40}>
                      <LabelList dataKey="value" position="top"
                        style={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Distribución por estado + prioridad */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              {/* Por estado */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Por Estado {periodoLabel}
                </p>
                {kpis.total > 0 ? (
                  <div className="space-y-2">
                    {estadoData.map(d => {
                      const pct = kpis.total > 0 ? Math.round((d.value / kpis.total) * 100) : 0;
                      return (
                        <div key={d.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                          <span className="text-xs text-slate-600 flex-1">{d.name}</span>
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: d.fill }} />
                          </div>
                          <span className="text-xs font-bold text-slate-700 w-5 text-right">{d.value}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Sin tickets {periodoLabel}</p>
                )}
              </div>

              {/* Por prioridad */}
              {ppPrioridad.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Por Prioridad {periodoLabel}
                  </p>
                  <div className="space-y-2">
                    {['ALTA','MEDIA','BAJA'].map(p => {
                      const cfg  = PRIORIDAD_CFG[p];
                      const item = ppPrioridad.find(x => x.prioridad === p) || { cantidad: 0 };
                      const tot  = ppPrioridad.reduce((s, x) => s + x.cantidad, 0);
                      const pct  = tot > 0 ? Math.round((item.cantidad / tot) * 100) : 0;
                      return (
                        <div key={p} className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cfg.bar }} />
                          </div>
                          <span className="text-xs font-bold text-slate-700 w-5 text-right">{item.cantidad}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparativa global vs equipo */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Comparativa Global vs Equipo
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tasa resolución */}
              <div>
                <p className="text-xs text-slate-500 font-medium mb-2">Tasa de Resolución (global)</p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Operador', width: tasaGlobal,           color: tasaGlobal >= 80 ? '#22c55e' : tasaGlobal >= 50 ? '#f59e0b' : '#ef4444', val: `${tasaGlobal}%`,           bold: true  },
                    { label: 'Equipo',   width: promEquipoResolucion,  color: '#94a3b8', val: `${promEquipoResolucion}%`, bold: false },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-2">
                      <span className={`text-[10px] w-16 flex-shrink-0 ${row.bold ? 'font-semibold text-slate-600' : 'font-medium text-slate-400'}`}>{row.label}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${row.width}%`, backgroundColor: row.color }} />
                      </div>
                      <span className={`text-xs font-bold w-9 text-right ${row.bold ? 'text-slate-700' : 'text-slate-400'}`}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Tickets totales */}
              <div>
                <p className="text-xs text-slate-500 font-medium mb-2">Tickets Totales vs Promedio equipo</p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Operador', width: (personalSelData.total / maxRef) * 100, color: AZUL,      val: personalSelData.total, bold: true  },
                    { label: 'Prom.',    width: (promTotal / maxRef) * 100,             color: '#94a3b8', val: promTotal,             bold: false },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-2">
                      <span className={`text-[10px] w-16 flex-shrink-0 ${row.bold ? 'font-semibold text-slate-600' : 'font-medium text-slate-400'}`}>{row.label}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${row.width}%`, backgroundColor: row.color }} />
                      </div>
                      <span className={`text-xs font-bold w-9 text-right ${row.bold ? 'text-slate-700' : 'text-slate-400'}`}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Badge resumen */}
            <div className={`mt-4 rounded-lg p-3 text-center ${vsEquipo >= 0 ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
              <p className={`text-sm font-bold ${vsEquipo >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {vsEquipo >= 0 ? '↑' : '↓'} {Math.abs(vsEquipo)}%{' '}
                {vsEquipo >= 0 ? 'por encima del promedio del equipo' : 'por debajo del promedio del equipo'}
              </p>
              <p className={`text-[10px] mt-0.5 ${vsEquipo >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                {vsEquipo >= 0 ? '¡Buen desempeño!' : 'Oportunidad de mejora'}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function EstadisticasMesaAyuda() {
  const [datos, setDatos]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [lastUpdate, setLastUpdate]     = useState(null);
  const [tab, setTab]                   = useState('general');
  const [personalSel, setPersonalSel]   = useState('');
  const [periodo, setPeriodo]           = useState('mes');
  const [periodoData, setPeriodoData]   = useState(null);
  const [periodoLoading, setPeriodoLoading] = useState(false);

  // ── Carga global ─────────────────────────────────────────────────────────
  const cargar = async () => {
    setLoading(true); setError(null);
    try {
      const data = await mesaAyudaService.obtenerEstadisticas();
      setDatos(data);
      setLastUpdate(new Date());
      if (data?.porPersonalDetalle?.length && !personalSel) {
        setPersonalSel(data.porPersonalDetalle[0].personal);
      }
    } catch {
      setError('No se pudieron cargar las estadísticas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // ── Carga por período cuando cambia persona o período ────────────────────
  useEffect(() => {
    if (!personalSel) { setPeriodoData(null); return; }
    let cancelled = false;
    const fetchPeriodo = async () => {
      setPeriodoLoading(true);
      try {
        const data = await mesaAyudaService.obtenerEstadisticasPersonal(personalSel, periodo);
        if (!cancelled) setPeriodoData(data);
      } catch {
        if (!cancelled) setPeriodoData(null);
      } finally {
        if (!cancelled) setPeriodoLoading(false);
      }
    };
    fetchPeriodo();
    return () => { cancelled = true; };
  }, [personalSel, periodo]);

  // ── Datos derivados ───────────────────────────────────────────────────────
  const {
    resumen = {}, porPrioridad = [], porMotivo = [],
    porPersonalDetalle = [], porDia = [], tiempoPromedioMinutos = 0,
  } = datos || {};

  const personalSelData = useMemo(
    () => porPersonalDetalle.find(p => p.personal === personalSel) || null,
    [porPersonalDetalle, personalSel]
  );

  const totalMotivos = porMotivo.reduce((s, m) => s + m.cantidad, 0);

  const estadoDonutData = [
    { name: 'Resueltos',  value: resumen.resueltos || 0, color: ESTADO_COLOR.resueltos },
    { name: 'En Proceso', value: resumen.enProceso || 0, color: ESTADO_COLOR.enProceso },
    { name: 'Nuevos',     value: resumen.nuevos    || 0, color: ESTADO_COLOR.nuevos    },
  ].filter(d => d.value > 0);

  const promEquipoResolucion = porPersonalDetalle.length > 0
    ? Math.round(porPersonalDetalle.reduce((s, p) => s + p.tasaResolucion, 0) / porPersonalDetalle.length)
    : 0;

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#0a5ba9]" />
        <p className="text-sm font-medium text-slate-500">Cargando estadísticas…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-sm shadow-sm">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-slate-700 font-medium mb-4">{error}</p>
        <button onClick={cargar} className="px-4 py-2 bg-[#0a5ba9] text-white rounded-lg text-sm font-medium hover:bg-[#073b6c]">
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: AZUL_SOFT }}>
            <BarChart3 className="w-5 h-5" style={{ color: AZUL }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Estadísticas · Mesa de Ayuda</h1>
            {lastUpdate && (
              <p className="text-[11px] text-slate-400">
                Actualizado: {lastUpdate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                {' · '}{porPersonalDetalle.length} operador{porPersonalDetalle.length !== 1 ? 'es' : ''} activo{porPersonalDetalle.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <button onClick={cargar}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 shadow-sm">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">
        <TabBtn active={tab === 'general'} onClick={() => setTab('general')} icon={BarChart3} label="Vista General" />
        <TabBtn active={tab === 'equipo'}  onClick={() => setTab('equipo')}  icon={Users}    label="Ranking Equipo" badge={porPersonalDetalle.length} />
        <TabBtn active={tab === 'detalle'} onClick={() => setTab('detalle')} icon={Target}   label="Mi Producción" />
      </div>

      {/* ════ TAB: VISTA GENERAL ════════════════════════════════════════════ */}
      {tab === 'general' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Ticket}       label="Total Tickets"  value={resumen.total ?? 0}     iconBg="bg-[#e8f1fb]" iconColor="text-[#0a5ba9]" />
            <KpiCard icon={AlertCircle}  label="Nuevos"         value={resumen.nuevos ?? 0}     sub="Pendientes"      iconBg="bg-blue-50"   iconColor="text-blue-600"  borderColor="border-blue-100" />
            <KpiCard icon={Zap}          label="En Proceso"     value={resumen.enProceso ?? 0}  sub="Siendo atendidos" iconBg="bg-amber-50"  iconColor="text-amber-600" borderColor="border-amber-100" />
            <KpiCard icon={CheckCircle2} label="Resueltos"      value={resumen.resueltos ?? 0}  sub={`Tasa: ${resumen.tasaResolucion ?? 0}%`} iconBg="bg-green-50" iconColor="text-green-600" borderColor="border-green-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Donut estado */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Distribución por Estado</p>
              <div className="flex items-center gap-4">
                {estadoDonutData.length > 0 ? (
                  <PieChart width={110} height={110}>
                    <Pie data={estadoDonutData} cx={54} cy={54} innerRadius={32} outerRadius={50}
                      startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                      {estadoDonutData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                ) : <div className="w-[110px] h-[110px] flex items-center justify-center text-xs text-slate-300">Sin datos</div>}
                <div className="space-y-2 flex-1">
                  {[
                    { label: 'Resueltos',  val: resumen.resueltos || 0, color: ESTADO_COLOR.resueltos },
                    { label: 'En Proceso', val: resumen.enProceso || 0, color: ESTADO_COLOR.enProceso },
                    { label: 'Nuevos',     val: resumen.nuevos    || 0, color: ESTADO_COLOR.nuevos    },
                  ].map(e => (
                    <div key={e.label} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                      <span className="text-xs text-slate-600 flex-1">{e.label}</span>
                      <span className="text-xs font-bold text-slate-800">{e.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Gauge resolución */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col items-center justify-center gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider self-start w-full">Tasa de Resolución</p>
              <GaugeResolucion pct={resumen.tasaResolucion ?? 0} size={130} />
              <p className="text-[11px] text-slate-400">{resumen.resueltos} de {resumen.total} resueltos</p>
            </div>
            {/* Tiempo + prioridad */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Timer className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tiempo prom. resolución</p>
                  <p className="text-xl font-bold text-slate-800">{formatTiempo(tiempoPromedioMinutos)}</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Por Prioridad</p>
                <div className="space-y-2">
                  {['ALTA','MEDIA','BAJA'].map(p => {
                    const cfg  = PRIORIDAD_CFG[p];
                    const item = porPrioridad.find(x => x.prioridad === p) || { cantidad: 0 };
                    const tot  = porPrioridad.reduce((s, x) => s + x.cantidad, 0);
                    const pct  = tot > 0 ? Math.round((item.cantidad / tot) * 100) : 0;
                    return (
                      <div key={p} className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cfg.bar }} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-5 text-right">{item.cantidad}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Motivos */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Motivos Más Frecuentes</p>
              {porMotivo.length === 0
                ? <p className="text-xs text-slate-400 text-center py-8">Sin datos</p>
                : <div className="space-y-3">
                    {porMotivo.map((m, i) => {
                      const pct   = totalMotivos > 0 ? Math.round((m.cantidad / totalMotivos) * 100) : 0;
                      const label = m.motivo.length > 50 ? m.motivo.substring(0, 50) + '…' : m.motivo;
                      return <BarraSencilla key={i} label={label} valor={m.cantidad} pct={pct} color={AZUL} />;
                    })}
                  </div>
              }
            </div>
            {/* Evolución */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Evolución · Últimos 7 días</p>
              {porDia.length === 0
                ? <p className="text-xs text-slate-400 text-center py-8">Sin actividad en los últimos 7 días</p>
                : <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={porDia.map(d => ({ ...d, fecha: formatFecha(d.fecha) }))}
                      margin={{ top: 12, right: 8, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="cantidad" name="Tickets" fill={AZUL} radius={[4, 4, 0, 0]} maxBarSize={48}>
                        <LabelList dataKey="cantidad" position="top" style={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>
          </div>
        </div>
      )}

      {/* ════ TAB: RANKING EQUIPO ════════════════════════════════════════════ */}
      {tab === 'equipo' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Users}      label="Operadores Activos"   value={porPersonalDetalle.length}       iconBg="bg-[#e8f1fb]" iconColor="text-[#0a5ba9]" />
            <KpiCard icon={Ticket}     label="Total Tickets Equipo" value={resumen.total ?? 0}               iconBg="bg-slate-50"  iconColor="text-slate-600" />
            <KpiCard icon={TrendingUp} label="Prom. Resolución"     value={`${promEquipoResolucion}%`}       iconBg="bg-green-50"  iconColor="text-green-600" />
            <KpiCard icon={Timer}      label="Tiempo Prom. Global"  value={formatTiempo(tiempoPromedioMinutos)} iconBg="bg-purple-50" iconColor="text-purple-600" />
          </div>

          {porPersonalDetalle.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-sm">No hay operadores con tickets asignados aún</div>
          ) : (
            <div className="space-y-3">
              {porPersonalDetalle.map((p, i) => {
                const medalCfg    = i < 3 ? MEDALLAS[i] : null;
                const avatarColor = getAvatarColor(p.personal);
                const tasa        = Math.round(p.tasaResolucion);
                return (
                  <div key={p.personal}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md hover:border-[#0a5ba9]/30 transition-all cursor-pointer"
                    onClick={() => { setPersonalSel(p.personal); setTab('detalle'); }}>
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-9 flex flex-col items-center flex-shrink-0">
                        {medalCfg ? (
                          <><medalCfg.Icon className="w-5 h-5" style={{ color: medalCfg.color }} />
                            <span className="text-[10px] font-bold" style={{ color: medalCfg.color }}>{medalCfg.label}</span></>
                        ) : <span className="text-sm font-bold text-slate-400">{i + 1}°</span>}
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: avatarColor }}>{getIniciales(p.personal)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate mb-1">{p.personal}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${tasa}%`, backgroundColor: tasa >= 80 ? '#22c55e' : tasa >= 50 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span className="text-xs font-bold text-slate-600 flex-shrink-0">{tasa}%</span>
                        </div>
                      </div>
                      <MiniGauge pct={tasa} size={50} />
                      <div className="hidden md:flex gap-2 flex-shrink-0">
                        {[
                          { label: 'Total',    val: p.total,     bg: '#f1f5f9', txt: '#475569' },
                          { label: 'Resuelto', val: p.resueltos, bg: '#dcfce7', txt: '#16a34a' },
                          { label: 'Proceso',  val: p.enProceso, bg: '#fef3c7', txt: '#d97706' },
                        ].map(chip => (
                          <div key={chip.label} className="flex flex-col items-center px-2.5 py-1 rounded-lg" style={{ background: chip.bg }}>
                            <span className="text-sm font-bold" style={{ color: chip.txt }}>{chip.val}</span>
                            <span className="text-[9px] font-medium" style={{ color: chip.txt }}>{chip.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="hidden lg:flex flex-col items-center flex-shrink-0 w-16">
                        <Clock className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                        <span className="text-xs font-bold text-slate-700">{formatTiempo(p.tiempoPromedioMinutos)}</span>
                        <span className="text-[9px] text-slate-400">prom.</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {porPersonalDetalle.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Comparativa Tasa de Resolución por Operador</p>
              <ResponsiveContainer width="100%" height={Math.max(120, porPersonalDetalle.length * 44)}>
                <BarChart layout="vertical"
                  data={porPersonalDetalle.map(p => ({ name: p.personal.split(' ').slice(0, 2).join(' '), tasa: Math.round(p.tasaResolucion) }))}
                  margin={{ top: 0, right: 50, bottom: 0, left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={95} />
                  <Tooltip formatter={v => [`${v}%`, 'Tasa Resolución']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="tasa" name="Tasa Resolución" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {porPersonalDetalle.map((p, i) => {
                      const t = Math.round(p.tasaResolucion);
                      return <Cell key={i} fill={t >= 80 ? '#22c55e' : t >= 50 ? '#f59e0b' : '#ef4444'} />;
                    })}
                    <LabelList dataKey="tasa" position="right" style={{ fontSize: 11, fill: '#475569', fontWeight: 700 }} formatter={v => `${v}%`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ════ TAB: MI PRODUCCIÓN ════════════════════════════════════════════ */}
      {tab === 'detalle' && (
        <div className="space-y-5">
          {/* Selector de operador */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Seleccionar Operador</label>
            {porPersonalDetalle.length === 0 ? (
              <p className="text-sm text-slate-400">No hay operadores con tickets asignados</p>
            ) : (
              <div className="relative max-w-sm">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select value={personalSel} onChange={e => setPersonalSel(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#0a5ba9]/30 focus:border-[#0a5ba9]">
                  <option value="">— Seleccione un operador —</option>
                  {porPersonalDetalle.map(p => <option key={p.personal} value={p.personal}>{p.personal}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Sin selección */}
          {!personalSelData && (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">Selecciona un operador para ver su producción detallada</p>
            </div>
          )}

          {/* Panel detalle con filtro de período */}
          <DetallePersonalPanel
            personalSelData={personalSelData}
            porPersonalDetalle={porPersonalDetalle}
            promEquipoResolucion={promEquipoResolucion}
            periodo={periodo}
            setPeriodo={setPeriodo}
            periodoData={periodoData}
            periodoLoading={periodoLoading}
          />
        </div>
      )}

    </div>
  );
}
