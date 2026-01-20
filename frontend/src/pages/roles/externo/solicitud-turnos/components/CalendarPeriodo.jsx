import React, { useMemo } from "react";
import { formatSoloFecha, isoDateYMD } from "../utils/helpers";

/**
 * =======================================================================
 * Calendario del periodo (mes)
 * =======================================================================
 */
export default function CalendarPeriodo({ periodo, onClickTurno, registrosIndex, esSoloLectura }) {
  // periodo: {fechaInicio, fechaFin, periodo, descripcion}
  const baseDate = useMemo(() => {
    const f = periodo?.fechaInicio || null;
    if (!f) return null;
    const d = new Date(f);
    if (Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, [periodo?.fechaInicio]);

  const monthLabel = useMemo(() => {
    if (!baseDate) return "—";
    return baseDate.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
  }, [baseDate]);

  const days = useMemo(() => {
    if (!baseDate) return [];
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const firstDow = first.getDay(); // 0 dom ... 6 sáb
    const blanks = firstDow; // empieza domingo
    const arr = [];
    for (let i = 0; i < blanks; i++) arr.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      arr.push(new Date(year, month, d));
    }
    return arr;
  }, [baseDate]);

  const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const hasReg = (ymd, turno) => {
    const k = `${ymd}|${turno}`;
    return !!registrosIndex?.[k];
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">Calendario del periodo</div>
          <div className="text-lg font-bold text-slate-900 capitalize">{monthLabel}</div>
          <div className="text-sm text-slate-600">
            Inicio: <strong>{formatSoloFecha(periodo?.fechaInicio)}</strong> · Fin:{" "}
            <strong>{formatSoloFecha(periodo?.fechaFin)}</strong>
          </div>
        </div>
        <div className="text-xs text-slate-500">
          * Click en <strong>M</strong> o <strong>T</strong> para registrar turnos
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 text-xs font-bold text-slate-600 mb-2">
          {weekdays.map((w) => (
            <div key={w} className="px-2 py-2">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((d, idx) => {
            if (!d) return <div key={`b-${idx}`} className="h-[92px] rounded-xl border border-transparent" />;

            const ymd = isoDateYMD(d);
            const dia = d.getDate();

            const markM = hasReg(ymd, "M");
            const markT = hasReg(ymd, "T");

            return (
              <div
                key={ymd}
                className={`h-[92px] rounded-2xl border p-2 flex flex-col justify-between ${
                  (markM || markT) ? "border-blue-200 bg-blue-50/40" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`text-sm font-bold ${markM || markT ? "text-[#0A5BA9]" : "text-slate-700"}`}>
                    {dia}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={esSoloLectura}
                    onClick={() => onClickTurno?.(ymd, "M")}
                    className={`rounded-xl border px-2 py-2 text-xs font-bold transition ${
                      markM ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    } disabled:opacity-50`}
                    title="Turno Mañana"
                  >
                    M
                  </button>
                  <button
                    type="button"
                    disabled={esSoloLectura}
                    onClick={() => onClickTurno?.(ymd, "T")}
                    className={`rounded-xl border px-2 py-2 text-xs font-bold transition ${
                      markT ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    } disabled:opacity-50`}
                    title="Turno Tarde"
                  >
                    T
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
