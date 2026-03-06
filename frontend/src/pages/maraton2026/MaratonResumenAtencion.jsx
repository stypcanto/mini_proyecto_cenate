import { Activity, Clock, Wrench } from 'lucide-react';

export default function MaratonResumenAtencion() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">

      {/* Icono animado */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
          <Wrench className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
        </div>
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 items-center justify-center">
            <Clock className="w-3 h-3 text-white" />
          </span>
        </span>
      </div>

      {/* Título */}
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-800">Resumen de Atención</h1>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
          Maratón 2026
        </span>
      </div>

      <p className="text-slate-500 text-base max-w-md mb-2">
        Esta sección está actualmente en construcción.
      </p>
      <p className="text-slate-400 text-sm max-w-sm">
        Próximamente mostrará el resumen de atenciones realizadas durante la campaña Maratón 2026: atendidos, no atendidos, reprogramados y tasas de efectividad por segmento.
      </p>

      {/* Barra decorativa de progreso */}
      <div className="mt-10 w-64">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Desarrollo en progreso</span>
          <span>60%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }} />
        </div>
      </div>

    </div>
  );
}
