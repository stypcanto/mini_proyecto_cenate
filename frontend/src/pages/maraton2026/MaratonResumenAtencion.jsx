import { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, Download, CheckCircle2, XCircle, RotateCcw, BarChart2 } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export default function MaratonResumenAtencion() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    atendidos: 0,
    noAtendidos: 0,
    reprogramados: 0,
    totalCitados: 0,
  });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: conectar endpoint real cuando esté disponible
      // const res = await fetch(`${API_BASE}/maraton2026/resumen-atencion`, { headers: { Authorization: `Bearer ${token}` } });
      // const data = await res.json();
      // setStats(data);
    } catch (err) {
      console.error('Error cargando resumen de atención Maratón 2026:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const total = stats.atendidos + stats.noAtendidos + stats.reprogramados || 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-800">Resumen de Atención</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              Maratón 2026
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Resumen consolidado del estado de atenciones realizadas en la Maratón de Salud 2026
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
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Citados</span>
            <BarChart2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {stats.totalCitados.toLocaleString('es-PE')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Base de seguimiento</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Atendidos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {stats.atendidos.toLocaleString('es-PE')}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {Math.round((stats.atendidos / total) * 100)}% del total
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">No Atendidos</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2">
            {stats.noAtendidos.toLocaleString('es-PE')}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {Math.round((stats.noAtendidos / total) * 100)}% del total
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Reprogramados</span>
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">
            {stats.reprogramados.toLocaleString('es-PE')}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {Math.round((stats.reprogramados / total) * 100)}% del total
          </p>
        </div>
      </div>

      {/* Barra de distribución */}
      { (stats.atendidos + stats.noAtendidos + stats.reprogramados) > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-3">Distribución de estados</p>
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
            <div className="bg-emerald-500 transition-all" style={{ width: `${(stats.atendidos / total) * 100}%` }} title="Atendidos" />
            <div className="bg-rose-400 transition-all" style={{ width: `${(stats.noAtendidos / total) * 100}%` }} title="No Atendidos" />
            <div className="bg-amber-400 transition-all" style={{ width: `${(stats.reprogramados / total) * 100}%` }} title="Reprogramados" />
          </div>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Atendidos</span>
            <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />No Atendidos</span>
            <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Reprogramados</span>
          </div>
        </div>
      ) }

      {/* Contenido principal — placeholder hasta conectar endpoint */}
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
        <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Tabla detallada de atenciones</p>
        <p className="text-sm text-slate-400 mt-1">
          Conectar endpoint <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/api/v1/maraton2026/resumen-atencion</code>
        </p>
      </div>
    </div>
  );
}
