import { Wrench } from 'lucide-react';

export default function MaratonResumenAtencion() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">

      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <Wrench className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
      </div>

      <h1 className="text-xl font-semibold text-slate-700 mb-2">
        Resumen de Atención — Maratón 2026
      </h1>

      <p className="text-slate-400 text-sm max-w-sm">
        Esta sección está en construcción. Próximamente mostrará el resumen de
        atenciones: atendidos, no atendidos, reprogramados y tasas de efectividad
        por segmento.
      </p>

    </div>
  );
}
