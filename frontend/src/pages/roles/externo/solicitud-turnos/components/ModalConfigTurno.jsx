import React, { useEffect, useMemo, useState } from "react";
import { X, CheckCircle } from "lucide-react";

/**
 * =======================================================================
 * Modal Configurar Turno (M/T)
 * =======================================================================
 */
export default function ModalConfigTurno({ open, onClose, data, onConfirm }) {
  // data: { ymd, turno, esp }
  const [tc, setTc] = useState(false);
  const [tl, setTl] = useState(false);
  const [cantTc, setCantTc] = useState(0);
  const [cantTl, setCantTl] = useState(0);

  useEffect(() => {
    if (!open) return;
    // reset al abrir
    setTc(false);
    setTl(false);
    setCantTc(0);
    setCantTl(0);
  }, [open]);

  const habilita = (tc || tl) && ((tc ? cantTc : 0) + (tl ? cantTl : 0) > 0);

  const tituloDia = useMemo(() => {
    if (!data?.ymd) return "—";
    const d = new Date(`${data.ymd}T00:00:00`);
    const dia = d.toLocaleDateString("es-PE", { weekday: "short", day: "numeric" });
    return dia.charAt(0).toUpperCase() + dia.slice(1);
  }, [data?.ymd]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="font-bold text-slate-900">Configurar turno</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-sm text-slate-500">Día seleccionado</div>
              <div className="text-3xl font-extrabold text-slate-900">{tituloDia}</div>
              <div className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700">
                Turno {data?.turno === "M" ? "Mañana" : "Tarde"}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Especialidad: <span className="font-semibold text-slate-700">{data?.esp?.descServicio || "—"}</span>
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-slate-900 mb-2">
                Tipo de atención <span className="text-slate-500 font-normal">(puedes seleccionar ambas opciones)</span>
              </div>

              {/* TC */}
              <button
                type="button"
                onClick={() => setTc((v) => !v)}
                className={`w-full text-left rounded-2xl border p-4 flex items-center gap-3 transition ${
                  tc ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    tc ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Teleconsultorio</div>
                  <div className="text-sm text-slate-500">Atención presencial en consultorio</div>
                </div>
              </button>

              {tc && (
                <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-sm font-bold text-emerald-800 mb-2">Cantidad de turnos Teleconsultorio</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCantTc((n) => Math.max(0, n - 1))}
                      className="w-10 h-10 rounded-xl border border-emerald-200 bg-white font-bold text-emerald-700 hover:bg-emerald-100"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={cantTc}
                      onChange={(e) => setCantTc(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="flex-1 rounded-xl border-2 border-emerald-300 bg-white px-4 py-2 text-center font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setCantTc((n) => Math.min(99, n + 1))}
                      className="w-10 h-10 rounded-xl border border-emerald-200 bg-white font-bold text-emerald-700 hover:bg-emerald-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* TL */}
              <button
                type="button"
                onClick={() => setTl((v) => !v)}
                className={`w-full text-left rounded-2xl border p-4 flex items-center gap-3 transition mt-3 ${
                  tl ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    tl ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Teleconsulta</div>
                  <div className="text-sm text-slate-500">Atención virtual remota</div>
                </div>
              </button>

              {tl && (
                <div className="mt-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                  <div className="text-sm font-bold text-indigo-800 mb-2">Cantidad de turnos Teleconsulta</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCantTl((n) => Math.max(0, n - 1))}
                      className="w-10 h-10 rounded-xl border border-indigo-200 bg-white font-bold text-indigo-700 hover:bg-indigo-100"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={cantTl}
                      onChange={(e) => setCantTl(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="flex-1 rounded-xl border-2 border-indigo-300 bg-white px-4 py-2 text-center font-bold text-indigo-800 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={() => setCantTl((n) => Math.min(99, n + 1))}
                      className="w-10 h-10 rounded-xl border border-indigo-200 bg-white font-bold text-indigo-700 hover:bg-indigo-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!habilita}
              onClick={() => {
                onConfirm?.({
                  ymd: data.ymd,
                  turno: data.turno,
                  idServicio: data.esp?.idServicio,
                  especialidad: data.esp?.descServicio || "",
                  codServicio: data.esp?.codServicio || "",
                  tc: !!tc,
                  tl: !!tl,
                  cantidadTC: tc ? Number(cantTc || 0) : 0,
                  cantidadTL: tl ? Number(cantTl || 0) : 0,
                  estado: "Pendiente",
                });
                onClose?.();
              }}
              className="w-full rounded-2xl px-4 py-3 font-bold text-white shadow transition disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] hover:shadow-lg"
            >
              Confirmar selección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
