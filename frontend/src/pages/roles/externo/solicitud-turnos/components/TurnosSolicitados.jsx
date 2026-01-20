import React, { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { formatSoloFecha, nombreTurno } from "../utils/helpers";

/**
 * =======================================================================
 * Tabla resumen "Turnos Solicitados"
 * =======================================================================
 */
export default function TurnosSolicitados({ registros, onRemove, onClear }) {
  const rows = useMemo(() => {
    const arr = Array.isArray(registros) ? registros : [];
    // ordenar por fecha, luego turno
    return [...arr].sort((a, b) => {
      if (a.ymd !== b.ymd) return a.ymd.localeCompare(b.ymd);
      return (a.turno || "").localeCompare(b.turno || "");
    });
  }, [registros]);

  const tot = useMemo(() => {
    const t = { dias: new Set(), man: 0, tar: 0, tc: 0, tl: 0, total: 0 };
    rows.forEach((r) => {
      t.dias.add(r.ymd);
      if (r.turno === "M") t.man += 1;
      if (r.turno === "T") t.tar += 1;
      t.tc += Number(r.cantidadTC || 0);
      t.tl += Number(r.cantidadTL || 0);
      t.total += Number(r.cantidadTC || 0) + Number(r.cantidadTL || 0);
    });
    return { ...t, diasCount: t.dias.size };
  }, [rows]);

  const badgeModalidad = (tc, tl) => {
    const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border";
    return (
      <div className="flex flex-wrap gap-2">
        {tc ? <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>TC</span> : null}
        {tl ? <span className={`${base} bg-indigo-50 text-indigo-700 border-indigo-200`}>TL</span> : null}
        {!tc && !tl ? <span className={`${base} bg-slate-50 text-slate-600 border-slate-200`}>—</span> : null}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="text-lg font-bold text-slate-900">Turnos Solicitados</div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
          disabled={rows.length === 0}
        >
          <Trash2 className="w-4 h-4" />
          Limpiar todos
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50 text-xs text-slate-700">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-bold border-b border-slate-200">
              <th>Fecha</th>
              <th>Turno</th>
              <th>Especialidad</th>
              <th>Modalidad</th>
              <th className="text-right">Cantidad TC</th>
              <th className="text-right">Cantidad TL</th>
              <th>Estado</th>
              <th className="text-right">Acción</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  Aún no registras turnos. Selecciona una especialidad y luego elige M/T en el calendario.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={`${r.ymd}|${r.turno}|${r.idServicio}`} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm text-slate-700">{formatSoloFecha(`${r.ymd}T00:00:00`)}</td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                        r.turno === "M"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-sky-50 text-sky-700 border-sky-200"
                      }`}
                    >
                      {nombreTurno(r.turno)}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900">{r.especialidad || "—"}</div>
                    <div className="text-xs text-slate-500">
                      Servicio ID: <span className="font-semibold">{r.idServicio ?? "—"}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4">{badgeModalidad(r.tc, r.tl)}</td>

                  <td className="px-4 py-4 text-right font-bold text-slate-900">{r.cantidadTC || 0}</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900">{r.cantidadTL || 0}</td>

                  <td className="px-4 py-4">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border border-amber-200 bg-amber-50 text-amber-800">
                      {r.estado || "Pendiente"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove?.(r)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Quitar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="p-5 border-t border-slate-200 bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <div className="text-xs text-orange-700 font-bold">Turnos Mañana</div>
            <div className="text-2xl font-extrabold text-orange-900">{tot.man}</div>
          </div>
          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
            <div className="text-xs text-purple-700 font-bold">Turnos Tarde</div>
            <div className="text-2xl font-extrabold text-purple-900">{tot.tar}</div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-xs text-emerald-700 font-bold">Total TC</div>
            <div className="text-2xl font-extrabold text-emerald-900">{tot.tc}</div>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
            <div className="text-xs text-indigo-700 font-bold">Total TL</div>
            <div className="text-2xl font-extrabold text-indigo-900">{tot.tl}</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-slate-700">
            Días con turnos: <strong>{tot.diasCount}</strong> · Total de turnos: <strong>{tot.total}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
