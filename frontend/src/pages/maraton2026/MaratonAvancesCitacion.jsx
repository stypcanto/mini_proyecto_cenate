import { useState, useEffect, useCallback } from 'react';
import { CalendarCheck, RefreshCw, Download } from 'lucide-react';
import { obtenerDesgloseMaratonSegmentos } from '../../services/bolsasService';
import { apiClient } from '../../lib/apiClient';

// ─── Fila de estado (Citados / Observados / Pendientes) ──────────────────────
const CFG = {
  CITADOS:    { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50/60',  dot: 'bg-emerald-500' },
  OBSERVADOS: { bar: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50/60',    dot: 'bg-amber-400'   },
  PENDIENTES: { bar: 'bg-rose-400',    text: 'text-rose-700',    bg: 'bg-rose-50/60',     dot: 'bg-rose-400'    },
};

function StateRow({ label, value, total, accentBorder }) {
  const cfg = CFG[label] ?? CFG.PENDIENTES;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  return (
    <div className={`flex-1 flex flex-col justify-center px-5 py-2.5 ${cfg.bg} border-b border-slate-100 last:border-b-0 border-l-4 ${accentBorder}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full inline-block flex-shrink-0 ${cfg.dot}`} />
          <span className="text-xs font-bold text-slate-600 tracking-wide">{label}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-base font-black ${cfg.text} tabular-nums`}>{value.toLocaleString('es-PE')}</span>
          <span className="text-xs text-slate-400">/ {total.toLocaleString('es-PE')}</span>
        </div>
      </div>
      <div className="w-full bg-white/70 rounded-full h-1.5">
        <div
          className={`${cfg.bar} h-1.5 rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1">{pct}% del segmento</p>
    </div>
  );
}

// ─── SVG Conector de embudo ───────────────────────────────────────────────────
// viewBox 56×400: izquierda tiene 2 mitades (centros en y=100 y y=300),
// derecha tiene 6 filas iguales (centros en y=33, 100, 167, 233, 300, 367).
function FunnelConnector() {
  const violet = '#7c3aed';
  const sky    = '#0284c7';
  return (
    <svg
      viewBox="0 0 56 400"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── CRÓNICOS ─→ 3 filas derechas ── */}
      <path d="M6,100 C28,100 28,33  50,33"  stroke={violet} strokeWidth="1.8" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
      <path d="M6,100 C28,100 28,100 50,100" stroke={violet} strokeWidth="1.8" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
      <path d="M6,100 C28,100 28,167 50,167" stroke={violet} strokeWidth="1.8" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
      {/* puntas de flecha */}
      <polygon points="47,30 54,33 47,36"  fill={violet} opacity="0.45" />
      <polygon points="47,97 54,100 47,103" fill={violet} opacity="0.45" />
      <polygon points="47,164 54,167 47,170" fill={violet} opacity="0.45" />
      {/* punto de origen */}
      <circle cx="6" cy="100" r="3.5" fill={violet} opacity="0.5" />

      {/* ── ESPECIALIDADES ─→ 3 filas derechas ── */}
      <path d="M6,300 C28,300 28,233 50,233" stroke={sky} strokeWidth="1.8" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
      <path d="M6,300 C28,300 28,300 50,300" stroke={sky} strokeWidth="1.8" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
      <path d="M6,300 C28,300 28,367 50,367" stroke={sky} strokeWidth="1.8" fill="none" strokeOpacity="0.45" strokeLinecap="round" />
      {/* puntas de flecha */}
      <polygon points="47,230 54,233 47,236" fill={sky} opacity="0.45" />
      <polygon points="47,297 54,300 47,303" fill={sky} opacity="0.45" />
      <polygon points="47,364 54,367 47,370" fill={sky} opacity="0.45" />
      {/* punto de origen */}
      <circle cx="6" cy="300" r="3.5" fill={sky} opacity="0.5" />
    </svg>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MaratonAvancesCitacion() {
  const [loading, setLoading] = useState(false);
  const [universoTotal,  setUniversoTotal]  = useState(0);
  const [cenacron,       setCenacron]       = useState({ total: 0, citados: 0, observados: 0, pendientes: 0 });
  const [especialidades, setEspecialidades] = useState({ total: 0, citados: 0, observados: 0, pendientes: 0 });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [universoRes, desgloseRes] = await Promise.all([
        apiClient.get('/asegurados?maraton=true&page=0&size=1', true).catch(() => null),
        obtenerDesgloseMaratonSegmentos().catch(() => null),
      ]);

      setUniversoTotal(universoRes?.totalElements ?? 0);

      if (Array.isArray(desgloseRes)) {
        const cen = { total: 0, citados: 0, observados: 0, pendientes: 0 };
        const esp = { total: 0, citados: 0, observados: 0, pendientes: 0 };
        desgloseRes.forEach(({ segmento, estado, cantidad }) => {
          const seg = segmento === 'CENACRON' ? cen : esp;
          const n   = Number(cantidad) || 0;
          seg.total += n;
          if (estado === 'CITADO')       seg.citados    += n;
          else if (estado === 'PENDIENTE_CITA' || estado === 'SIN_ESTADO') seg.pendientes += n;
          else                           seg.observados += n;
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

  const totalCitados = cenacron.citados + especialidades.citados;
  const pctGlobal    = universoTotal > 0 ? ((totalCitados / universoTotal) * 100).toFixed(1) : '0.0';
  const pct          = (n, t) => t > 0 ? ((n / t) * 100).toFixed(1) : '0.0';

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
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* ── Barra de avance global ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 flex items-center gap-4 flex-wrap">
        <span className="text-xs font-bold text-blue-500 uppercase tracking-wider whitespace-nowrap">Avance global</span>
        <div className="flex-1 min-w-[120px] bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-700"
            style={{ width: `${pctGlobal}%` }}
          />
        </div>
        <span className="text-sm font-black text-blue-700 whitespace-nowrap">
          {totalCitados.toLocaleString('es-PE')} citados
        </span>
        <span className="text-sm text-blue-500 whitespace-nowrap">
          de {universoTotal.toLocaleString('es-PE')}
        </span>
        <span className="text-xl font-black text-blue-700">{pctGlobal}%</span>
      </div>

      {/* ── Embudo principal ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Cabeceras */}
        <div className="grid grid-cols-[1fr_3.5rem_1fr] bg-slate-50 border-b border-slate-200">
          <div className="px-6 py-3 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pacientes</span>
            <span className="text-sm font-black text-slate-700 tabular-nums">{universoTotal.toLocaleString('es-PE')}</span>
          </div>
          <div />
          <div className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Asignados Para Citar
          </div>
        </div>

        {/* Cuerpo del embudo */}
        <div className="grid grid-cols-[1fr_3.5rem_1fr]" style={{ minHeight: '300px' }}>

          {/* ─ Izquierda: segmentos ─ */}
          <div className="flex flex-col border-r border-slate-100">

            {/* MARATÓN - CRÓNICOS */}
            <div className="flex-1 flex flex-col justify-center px-6 py-4 border-b border-slate-100 border-l-4 border-l-violet-400">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-violet-500 inline-block flex-shrink-0" />
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">Maratón — Crónicos</span>
              </div>
              <p className="text-4xl font-black text-violet-700 mt-1 pl-5 tabular-nums">
                {cenacron.total.toLocaleString('es-PE')}
              </p>
              <div className="mt-3 pl-5">
                <div className="w-36 bg-violet-100 rounded-full h-1.5">
                  <div
                    className="bg-violet-500 h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct(cenacron.total, universoTotal)}%` }}
                  />
                </div>
                <p className="text-xs text-violet-400 mt-1">
                  {pct(cenacron.total, universoTotal)}% del universo total
                </p>
              </div>
            </div>

            {/* MARATÓN - ESPECIALIDADES */}
            <div className="flex-1 flex flex-col justify-center px-6 py-4 border-l-4 border-l-sky-400">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-sky-500 inline-block flex-shrink-0" />
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wide">Maratón — Especialidades</span>
              </div>
              <p className="text-4xl font-black text-sky-700 mt-1 pl-5 tabular-nums">
                {especialidades.total.toLocaleString('es-PE')}
              </p>
              <div className="mt-3 pl-5">
                <div className="w-36 bg-sky-100 rounded-full h-1.5">
                  <div
                    className="bg-sky-500 h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct(especialidades.total, universoTotal)}%` }}
                  />
                </div>
                <p className="text-xs text-sky-400 mt-1">
                  {pct(especialidades.total, universoTotal)}% del universo total
                </p>
              </div>
            </div>
          </div>

          {/* ─ Centro: conector SVG ─ */}
          <div className="relative">
            <FunnelConnector />
          </div>

          {/* ─ Derecha: estados ─ */}
          <div className="flex flex-col border-l border-slate-100">
            <StateRow label="CITADOS"    value={cenacron.citados}          total={cenacron.total}          accentBorder="border-l-violet-300" />
            <StateRow label="OBSERVADOS" value={cenacron.observados}        total={cenacron.total}          accentBorder="border-l-violet-300" />
            <StateRow label="PENDIENTES" value={cenacron.pendientes}        total={cenacron.total}          accentBorder="border-l-violet-300" />
            <StateRow label="CITADOS"    value={especialidades.citados}     total={especialidades.total}    accentBorder="border-l-sky-300" />
            <StateRow label="OBSERVADOS" value={especialidades.observados}  total={especialidades.total}    accentBorder="border-l-sky-300" />
            <StateRow label="PENDIENTES" value={especialidades.pendientes}  total={especialidades.total}    accentBorder="border-l-sky-300" />
          </div>

        </div>
      </div>

      {/* ── KPI resumen inferior ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total universo',    value: universoTotal,                        color: 'slate'  },
          { label: 'Total citados',     value: cenacron.citados + especialidades.citados,    color: 'emerald' },
          { label: 'Total observados',  value: cenacron.observados + especialidades.observados, color: 'amber'  },
          { label: 'Total pendientes',  value: cenacron.pendientes + especialidades.pendientes, color: 'rose'   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 text-${color}-700 tabular-nums`}>
              {value.toLocaleString('es-PE')}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {universoTotal > 0 ? `${((value / universoTotal) * 100).toFixed(1)}%` : '—'} del total
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
