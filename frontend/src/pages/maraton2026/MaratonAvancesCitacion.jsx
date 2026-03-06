import { useState, useEffect, useCallback } from 'react';
import { CalendarCheck, RefreshCw, Download, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export default function MaratonAvancesCitacion() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPacientes: 0,
    citados: 0,
    pendientes: 0,
    porcentajeAvance: 0,
  });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: conectar endpoint real cuando esté disponible
      // const res = await fetch(`${API_BASE}/maraton2026/avances-citacion`, { headers: { Authorization: `Bearer ${token}` } });
      // const data = await res.json();
      // setStats(data);
    } catch (err) {
      console.error('Error cargando avances de citación Maratón 2026:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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
            Seguimiento del avance en la citación de pacientes registrados en la Maratón de Salud 2026
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Pacientes</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {stats.totalPacientes.toLocaleString('es-PE')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Registrados en Maratón</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Citados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {stats.citados.toLocaleString('es-PE')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Con cita asignada</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pendientes</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">
            {stats.pendientes.toLocaleString('es-PE')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Sin cita asignada aún</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Avance</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">
            {stats.porcentajeAvance}%
          </p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.porcentajeAvance}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contenido principal — placeholder hasta conectar endpoint */}
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
        <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Tabla de avances de citación</p>
        <p className="text-sm text-slate-400 mt-1">
          Conectar endpoint <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/api/v1/maraton2026/avances-citacion</code>
        </p>
      </div>
    </div>
  );
}
