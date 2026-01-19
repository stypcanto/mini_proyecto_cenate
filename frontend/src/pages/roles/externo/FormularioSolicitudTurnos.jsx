// ========================================================================
// FormularioSolicitudTurnos.jsx
// ------------------------------------------------------------------------
// ✅ REQUERIMIENTOS IMPLEMENTADOS (según tu mensaje):
// 1) Filtros: Tipo de periodo (VIGENTES vs ACTIVOS), Año (2025/2026/2027),
//    Periodo (depende del año y tipo), Estado (de la solicitud).
// 2) Tabla por periodo: Año, Periodo, Solicitud, Inicio, Fin, Estado, Acción.
// 3) Al INICIAR (o EDITAR) NO aparece combo de periodo: se muestra tarjeta detalle
//    (inicio/fin/creación/actualización/envío/estado/periodo).
// 4) Registro de turnos NUEVO (UX):
//    - Combo especialidades
//    - Calendario del periodo (mes)
//    - Por día: botones M y T
//    - Click en M/T -> modal: Teleconsultorio y/o Teleconsulta + cantidades
//    - Abajo: tabla resumen (día, especialidad, turno, modalidades, cantidades, estado)
//    - Por día puede tener 2 registros (M y T).
// 5) Mantiene tus services existentes (solicitudTurnoService / periodoSolicitudService).
//    ⚠️ Nota: el payload final que se envía lo agregué como "payloadV2" y también
//    una agregación simple por especialidad por si tu backend actual solo entiende "detalles".
// ========================================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  Save,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Lock,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";

import { periodoSolicitudService } from "../../../services/periodoSolicitudService";
import { solicitudTurnoService } from "../../../services/solicitudTurnoService";

/** =======================================================================
 * Helpers
 * ======================================================================= */
function formatFecha(fechaIso) {
  if (!fechaIso) return "—";
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
}

function formatSoloFecha(fechaIso) {
  if (!fechaIso) return "—";
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" });
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function isoDateYMD(d) {
  // YYYY-MM-DD
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function getYearFromPeriodo(p) {
  const f = p?.fechaInicio || p?.fechaFin;
  if (f) {
    const d = new Date(f);
    if (!Number.isNaN(d.getTime())) return String(d.getFullYear());
  }
  const txt = `${p?.descripcion || ""} ${p?.periodo || ""}`;
  const m = txt.match(/\b(2025|2026|2027)\b/);
  return m ? m[1] : "";
}

function estadoBadgeClass(estado) {
  if (estado === "ENVIADO") return "bg-green-50 text-green-700 border-green-200";
  if (estado === "REVISADO") return "bg-purple-50 text-purple-700 border-purple-200";
  if (estado === "APROBADA") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (estado === "RECHAZADA") return "bg-red-50 text-red-700 border-red-200";
  if (estado === "SIN_SOLICITUD") return "bg-slate-50 text-slate-600 border-slate-200";
  return "bg-yellow-50 text-yellow-800 border-yellow-200"; // BORRADOR u otro
}

function nombreTurno(turno) {
  return turno === "M" ? "Mañana" : "Tarde";
}

/** =======================================================================
 * Modal simple
 * ======================================================================= */
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="font-bold text-slate-900">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
          <div className="overflow-auto max-h-[calc(92vh-68px)]">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** =======================================================================
 * Modal Configurar Turno (M/T)
 * ======================================================================= */
function ModalConfigTurno({ open, onClose, data, onConfirm }) {
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

/** =======================================================================
 * Calendario del periodo (mes)
 * ======================================================================= */
function CalendarPeriodo({ periodo, onClickTurno, registrosIndex, esSoloLectura }) {
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

/** =======================================================================
 * Tabla resumen "Turnos Solicitados"
 * ======================================================================= */
function TurnosSolicitados({ registros, onRemove, onClear }) {
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

/** =======================================================================
 * Tarjeta detalle Periodo/Solicitud (sin combo)
 * ======================================================================= */
function PeriodoDetalleCard({ periodo, solicitud, modoModal, periodoForzado }) {
  const estado = solicitud?.estado || (modoModal === "NUEVA" ? "BORRADOR" : "—");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#0A5BA9]" />
        Periodo y Estado
      </h2>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">Periodo</div>
            <div className="text-lg font-bold text-slate-900">{periodo?.descripcion || "—"}</div>
            <div className="text-sm text-slate-600 mt-1">
              Código: <strong>{periodo?.periodo || "—"}</strong> · ID Periodo:{" "}
              <strong>{periodo?.idPeriodo ?? "—"}</strong>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800">
            <Lock className="w-4 h-4" />
            {periodoForzado ? "Periodo fijo" : "Bloqueado"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Estado</div>
            <div className="font-bold text-slate-900">{estado}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Fecha inicio</div>
            <div className="font-semibold text-slate-800">{formatFecha(periodo?.fechaInicio)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Fecha fin</div>
            <div className="font-semibold text-slate-800">{formatFecha(periodo?.fechaFin)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Fecha creación</div>
            <div className="font-semibold text-slate-800">{formatFecha(solicitud?.createdAt)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Fecha actualización</div>
            <div className="font-semibold text-slate-800">{formatFecha(solicitud?.updatedAt)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="text-xs text-slate-500">Fecha envío</div>
            <div className="font-semibold text-slate-800">{formatFecha(solicitud?.fechaEnvio)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** =======================================================================
 * COMPONENTE PRINCIPAL
 * ======================================================================= */
export default function FormularioSolicitudTurnos() {
  // estados generales
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // datos usuario
  const [miIpress, setMiIpress] = useState(null);

  // periodos
  const [tipoPeriodos, setTipoPeriodos] = useState("VIGENTES"); // VIGENTES | ACTIVOS
  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);

  // especialidades
  const [especialidades, setEspecialidades] = useState([]);

  // solicitudes del usuario (listado)
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [loadingTabla, setLoadingTabla] = useState(false);

  // filtros tabla
  const [filtroAnio, setFiltroAnio] = useState("2026");
  const [filtroPeriodoId, setFiltroPeriodoId] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("ALL");

  // modal
  const [openFormModal, setOpenFormModal] = useState(false);
  const [modoModal, setModoModal] = useState("NUEVA"); // NUEVA | EDITAR | VER

  // periodo seleccionado
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  const [periodoForzado, setPeriodoForzado] = useState(false);

  // solicitud actual
  const [solicitudActual, setSolicitudActual] = useState(null);

  // registro NUEVO: array de registros por día/turno/especialidad
  // registro = {ymd, turno:'M'|'T', idServicio, especialidad, codServicio, tc, tl, cantidadTC, cantidadTL, estado}
  const [registros, setRegistros] = useState([]);

  // UX: especialidad seleccionada para calendar
  const [idServicioSel, setIdServicioSel] = useState("");
  const especialidadSel = useMemo(
    () => especialidades.find((e) => String(e.idServicio) === String(idServicioSel)) || null,
    [especialidades, idServicioSel]
  );

  // modal configurar turno
  const [openCfg, setOpenCfg] = useState(false);
  const [cfgData, setCfgData] = useState(null); // { ymd, turno, esp }

  // =====================================================================
  // Periodos: VIGENTES y ACTIVOS (según tu endpoint)
  // =====================================================================
  const cargarPeriodos = useCallback(async () => {
    setLoadingPeriodos(true);
    try {
      // ✅ Usa tus endpoints existentes:
      // - /api/periodos-solicitud/vigentes
      // - /api/periodos-solicitud/activos (asumido; si tu service usa otro path, ajusta ahí)
      let data = [];
      if (tipoPeriodos === "VIGENTES") {
        data = await periodoSolicitudService.obtenerVigentes();
      } else {
        // si no existe método, créalo en periodoSolicitudService: obtenerActivos()
        data = await periodoSolicitudService.obtenerActivos();
      }

      setPeriodos(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error(e);
      setPeriodos([]);
      return [];
    } finally {
      setLoadingPeriodos(false);
    }
  }, [tipoPeriodos]);

  // =====================================================================
  // Tabla solicitudes (tu servicio)
  // =====================================================================
  const refrescarMisSolicitudes = useCallback(async () => {
    setLoadingTabla(true);
    try {
      const data = await solicitudTurnoService.listarMisSolicitudes();
      setMisSolicitudes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMisSolicitudes([]);
    } finally {
      setLoadingTabla(false);
    }
  }, []);

  const handleRefreshAll = useCallback(async () => {
    setError(null);
    setSuccess(null);
    await Promise.all([refrescarMisSolicitudes(), cargarPeriodos()]);
  }, [refrescarMisSolicitudes, cargarPeriodos]);

  // =====================================================================
  // Inicialización
  // =====================================================================
  const inicializar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [ipressData, especialidadesData] = await Promise.all([
        solicitudTurnoService.obtenerMiIpress(),
        solicitudTurnoService.obtenerEspecialidadesCenate(),
      ]);

      setMiIpress(ipressData);
      setEspecialidades(Array.isArray(especialidadesData) ? especialidadesData : []);

      await Promise.all([cargarPeriodos(), refrescarMisSolicitudes()]);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los datos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [cargarPeriodos, refrescarMisSolicitudes]);

  useEffect(() => {
    inicializar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recargar periodos si cambias tipo
  useEffect(() => {
    cargarPeriodos();
  }, [tipoPeriodos, cargarPeriodos]);

  // =====================================================================
  // Index solicitud por periodo
  // =====================================================================
  const solicitudPorPeriodo = useMemo(() => {
    const map = new Map();
    (misSolicitudes || []).forEach((s) => {
      if (s?.idPeriodo != null) map.set(Number(s.idPeriodo), s);
    });
    return map;
  }, [misSolicitudes]);

  const aniosDisponibles = useMemo(() => ["2025", "2026", "2027"], []);

  const periodosPorAnio = useMemo(() => {
    const arr = Array.isArray(periodos) ? periodos : [];
    if (!filtroAnio) return arr;
    return arr.filter((p) => getYearFromPeriodo(p) === String(filtroAnio));
  }, [periodos, filtroAnio]);

  const filasPorPeriodo = useMemo(() => {
    let base = Array.isArray(periodos) ? [...periodos] : [];

    if (filtroAnio) base = base.filter((p) => getYearFromPeriodo(p) === String(filtroAnio));
    if (filtroPeriodoId) base = base.filter((p) => String(p.idPeriodo) === String(filtroPeriodoId));

    let rows = base.map((p) => {
      const sol = solicitudPorPeriodo.get(Number(p.idPeriodo)) || null;
      return {
        anio: getYearFromPeriodo(p) || "—",
        idPeriodo: p.idPeriodo,
        periodoLabel: p.descripcion || p.periodo || `Periodo #${p.idPeriodo}`,
        periodoCode: p.periodo || "",
        fechaInicio: p.fechaInicio || null,
        fechaFin: p.fechaFin || null,
        solicitud: sol,
        estado: sol?.estado || "SIN_SOLICITUD",
        periodoObj: p,
      };
    });

    if (filtroEstado && filtroEstado !== "ALL") rows = rows.filter((r) => r.estado === filtroEstado);

    // orden por fechaInicio desc
    rows.sort((a, b) => {
      const da = a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
      const db = b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
      return db - da;
    });

    return rows;
  }, [periodos, filtroAnio, filtroPeriodoId, filtroEstado, solicitudPorPeriodo]);

  // =====================================================================
  // Abrir modal desde fila periodo (Iniciar/Editar/Ver)
  // =====================================================================
  const abrirSolicitudDesdeTabla = async (rowSolicitud) => {
    setError(null);
    setSuccess(null);

    const modo = rowSolicitud.estado === "BORRADOR" ? "EDITAR" : "VER";
    setModoModal(modo);
    setOpenFormModal(true);
    setLoading(true);

    try {
      const solicitud = await solicitudTurnoService.obtenerPorId(rowSolicitud.idSolicitud);
      setSolicitudActual(solicitud);

      // set periodo + bloquear selección
      const p = (periodos || []).find((x) => Number(x.idPeriodo) === Number(solicitud.idPeriodo));
      setPeriodoSeleccionado(
        p || {
          idPeriodo: solicitud.idPeriodo,
          periodo: "",
          descripcion: solicitud.periodoDescripcion,
          fechaInicio: null,
          fechaFin: null,
        }
      );

      // VER: solo lectura (no armamos calendario)
      if (solicitud.estado !== "BORRADOR") {
        setRegistros([]);
        return;
      }

      // EDITAR BORRADOR:
      // Si tu backend ya tiene un modelo día/turno, aquí deberías mapearlo a "registros".
      // Por ahora dejamos vacío y que el usuario vuelva a registrar.
      setRegistros([]);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el detalle de la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const abrirDesdePeriodo = async (fila) => {
    setError(null);
    setSuccess(null);

    // periodo fijo (sin combo)
    setPeriodoForzado(true);

    // set periodo seleccionado desde fila (directo)
    setPeriodoSeleccionado(fila.periodoObj);

    // reset registros y selección especialidad
    setRegistros([]);
    setIdServicioSel("");

    // si ya existe solicitud, abrirla
    if (fila?.solicitud?.idSolicitud) {
      return abrirSolicitudDesdeTabla(fila.solicitud);
    }

    // no existe => iniciar
    setModoModal("NUEVA");
    setSolicitudActual(null);
    setOpenFormModal(true);
  };

  const abrirNuevaSolicitud = async () => {
    // flujo libre (con combo) -> en este rediseño lo mantenemos,
    // pero tu requerimiento principal es iniciar desde la tabla por periodo.
    setPeriodoForzado(false);
    setError(null);
    setSuccess(null);

    setModoModal("NUEVA");
    setSolicitudActual(null);
    setPeriodoSeleccionado(null);

    setRegistros([]);
    setIdServicioSel("");

    setOpenFormModal(true);
    await cargarPeriodos();
  };

  const cerrarModal = async () => {
    setOpenFormModal(false);
    setSaving(false);
    setPeriodoForzado(false);
    setCfgData(null);
    setOpenCfg(false);

    await refrescarMisSolicitudes();
  };

  // =====================================================================
  // Solo lectura?
  // =====================================================================
  const esSoloLectura =
    modoModal === "VER" ||
    solicitudActual?.estado === "ENVIADO" ||
    solicitudActual?.estado === "REVISADO" ||
    solicitudActual?.estado === "APROBADA" ||
    solicitudActual?.estado === "RECHAZADA";

  // =====================================================================
  // Registros index (por día|turno) para marcar calendario
  // =====================================================================
  const registrosIndex = useMemo(() => {
    const idx = {};
    (registros || []).forEach((r) => {
      const k = `${r.ymd}|${r.turno}`;
      idx[k] = true;
    });
    return idx;
  }, [registros]);

  // =====================================================================
  // Click M/T en calendario
  // =====================================================================
  const handleClickTurno = (ymd, turno) => {
    if (!especialidadSel) {
      setError("Selecciona una especialidad antes de registrar turnos en el calendario.");
      return;
    }
    setError(null);
    setCfgData({ ymd, turno, esp: especialidadSel });
    setOpenCfg(true);
  };

  // Confirmar modal -> inserta/actualiza registro por (ymd, turno, idServicio)
  const onConfirmCfg = (nuevo) => {
    setRegistros((prev) => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      const i = arr.findIndex(
        (r) => r.ymd === nuevo.ymd && r.turno === nuevo.turno && String(r.idServicio) === String(nuevo.idServicio)
      );

      // si cantidades 0, eliminar
      const total = Number(nuevo.cantidadTC || 0) + Number(nuevo.cantidadTL || 0);
      if (total <= 0) {
        if (i >= 0) arr.splice(i, 1);
        return arr;
      }

      if (i >= 0) {
        arr[i] = { ...arr[i], ...nuevo };
      } else {
        arr.push(nuevo);
      }
      return arr;
    });
  };

  const onRemoveRegistro = (r) => {
    setRegistros((prev) =>
      (Array.isArray(prev) ? prev : []).filter(
        (x) => !(x.ymd === r.ymd && x.turno === r.turno && String(x.idServicio) === String(r.idServicio))
      )
    );
  };

  const onClearRegistros = () => setRegistros([]);

  // =====================================================================
  // Payload (para enviar/guardar)
  // =====================================================================
  const buildPayload = () => {
    if (!periodoSeleccionado?.idPeriodo) return null;

    // Payload V2 (día/turno)
    const payloadV2 = {
      idPeriodo: periodoSeleccionado.idPeriodo,
      idSolicitud: solicitudActual?.idSolicitud || null,
      registros: (registros || []).map((r) => ({
        fecha: r.ymd,
        turno: r.turno, // M/T
        idServicio: r.idServicio,
        tc: r.tc,
        tl: r.tl,
        cantidadTC: r.cantidadTC,
        cantidadTL: r.cantidadTL,
      })),
    };

    // Payload agregado simple por especialidad (por compat si tu backend aún usa "detalles")
    const map = new Map(); // idServicio => {idServicio, requiere:true, turnos, mananaActiva, diasManana, tardeActiva, diasTarde}
    (registros || []).forEach((r) => {
      const id = Number(r.idServicio);
      if (!map.has(id)) {
        map.set(id, {
          idServicio: id,
          requiere: true,
          turnos: 0,
          mananaActiva: false,
          diasManana: [],
          tardeActiva: false,
          diasTarde: [],
          observacion: "",
        });
      }
      const det = map.get(id);
      const suma = Number(r.cantidadTC || 0) + Number(r.cantidadTL || 0);
      det.turnos += suma;

      const d = new Date(`${r.ymd}T00:00:00`);
      const dia = d.toLocaleDateString("es-PE", { weekday: "short" }); // ej: "lun."
      // normalizamos a tus labels Lun/Mar/Mié...
      const norm = dia
        .replace(".", "")
        .toLowerCase();
      const mapDia = {
        dom: "Dom",
        lun: "Lun",
        mar: "Mar",
        mié: "Mié",
        mie: "Mié",
        jue: "Jue",
        vie: "Vie",
        sáb: "Sáb",
        sab: "Sáb",
      };
      const label = mapDia[norm] || "—";

      if (r.turno === "M") {
        det.mananaActiva = true;
        if (label !== "—" && !det.diasManana.includes(label)) det.diasManana.push(label);
      } else {
        det.tardeActiva = true;
        if (label !== "—" && !det.diasTarde.includes(label)) det.diasTarde.push(label);
      }
    });

    const detalles = Array.from(map.values());

    return { payloadV2, payloadCompat: { idPeriodo: periodoSeleccionado.idPeriodo, detalles } };
  };

  // =====================================================================
  // Guardar borrador / Enviar
  // =====================================================================
  const handleGuardarBorrador = async () => {
    if (!periodoSeleccionado?.idPeriodo) {
      setError("No hay periodo seleccionado.");
      return;
    }
    if (registros.length === 0) {
      setError("Registra al menos un turno antes de guardar.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { payloadV2, payloadCompat } = buildPayload();

      // ✅ si tu backend ya soporta V2, usa esto:
      // const resultado = await solicitudTurnoService.guardarBorradorV2(payloadV2);

      // ✅ si tu backend actual solo soporta "detalles", usa esto:
      const resultado = await solicitudTurnoService.guardarBorrador(payloadCompat);

      setSolicitudActual(resultado);
      setModoModal(resultado?.estado === "BORRADOR" ? "EDITAR" : "VER");

      setSuccess("Borrador guardado exitosamente");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error al guardar borrador");
    } finally {
      setSaving(false);
    }
  };

  const handleEnviar = async () => {
    if (!periodoSeleccionado?.idPeriodo) {
      setError("No hay periodo seleccionado.");
      return;
    }
    if (registros.length === 0) {
      setError("Registra al menos un turno antes de enviar.");
      return;
    }
    if (!window.confirm("¿Enviar la solicitud? Luego no podrás modificarla.")) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { payloadCompat } = buildPayload();

      const guardado = await solicitudTurnoService.guardarBorrador(payloadCompat);
      const enviado = await solicitudTurnoService.enviar(guardado.idSolicitud);

      setSolicitudActual(enviado);
      setModoModal("VER");
      setSuccess("Solicitud enviada exitosamente.");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error al enviar");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================================
  // RENDER
  // =====================================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0A5BA9]" />
        <p className="ml-3 text-slate-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Solicitudes de Turnos por Telemedicina</h1>
        </div>
        <p className="text-blue-100">Administra tus solicitudes y registra turnos por calendario.</p>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Datos del Usuario */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#0A5BA9]" />
          Datos de Contacto
          <span className="text-xs font-normal text-slate-500 ml-2">(auto-detectados)</span>
        </h2>

        {miIpress ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Building2 className="w-4 h-4" />
                Red / IPRESS
              </div>
              <p className="font-semibold text-slate-800">{miIpress.nombreRed || "Sin Red"}</p>
              <p className="text-sm text-slate-600">{miIpress.nombreIpress || "Sin IPRESS"}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <User className="w-4 h-4" />
                Coordinador / Usuario
              </div>
              <p className="font-semibold text-slate-800">{miIpress.nombreCompleto || "N/A"}</p>
              <p className="text-sm text-slate-600">DNI: {miIpress.dniUsuario || "N/A"}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Mail className="w-4 h-4" />
                Contacto
              </div>
              <p className="font-semibold text-slate-800 text-sm">{miIpress.emailContacto || "Sin email"}</p>
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {miIpress.telefonoContacto || "Sin teléfono"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500">No se encontraron datos de IPRESS asociados.</div>
        )}

        {miIpress && !miIpress.datosCompletos && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            {miIpress.mensajeValidacion}
          </div>
        )}
      </div>

      {/* Tabla por Periodo + Filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0A5BA9]" />
                Solicitudes por Periodo
              </h2>
              <p className="text-sm text-slate-500">
                Usa <strong>Iniciar</strong> para registrar turnos por calendario.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRefreshAll}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-2"
                disabled={loadingTabla || loadingPeriodos}
              >
                {(loadingTabla || loadingPeriodos) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Actualizar
              </button>

              <button
                type="button"
                onClick={abrirNuevaSolicitud}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white font-bold shadow hover:shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva solicitud
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Tipo periodos */}
            <div className="md:col-span-3">
              <label className="text-sm font-semibold text-slate-700">Tipo de periodos</label>
              <select
                className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                value={tipoPeriodos}
                onChange={(e) => {
                  setTipoPeriodos(e.target.value);
                  setFiltroPeriodoId("");
                }}
                disabled={loadingPeriodos}
              >
                <option value="VIGENTES">Vigentes</option>
                <option value="ACTIVOS">Activos</option>
              </select>
              <div className="text-xs text-slate-500 mt-1">* según tus endpoints /vigentes y /activos</div>
            </div>

            {/* Año */}
            <div className="md:col-span-3">
              <label className="text-sm font-semibold text-slate-700">Año</label>
              <select
                className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                value={filtroAnio}
                onChange={(e) => {
                  setFiltroAnio(e.target.value);
                  setFiltroPeriodoId("");
                }}
              >
                {aniosDisponibles.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Periodo */}
            <div className="md:col-span-4">
              <label className="text-sm font-semibold text-slate-700">Periodo</label>
              <select
                className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                value={filtroPeriodoId}
                onChange={(e) => setFiltroPeriodoId(e.target.value)}
                disabled={loadingPeriodos}
              >
                <option value="">Todos los periodos</option>
                {periodosPorAnio.map((p) => (
                  <option key={p.idPeriodo} value={p.idPeriodo}>
                    {p.descripcion} ({p.periodo})
                  </option>
                ))}
              </select>
              <div className="text-xs text-slate-500 mt-1">* Al elegir año, se listan periodos relacionados</div>
            </div>

            {/* Estado */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Estado</label>
              <select
                className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="ALL">Todos</option>
                <option value="SIN_SOLICITUD">Sin solicitud</option>
                <option value="BORRADOR">Borrador</option>
                <option value="ENVIADO">Enviado</option>
                <option value="REVISADO">Revisado</option>
                <option value="APROBADA">Aprobada</option>
                <option value="RECHAZADA">Rechazada</option>
              </select>
            </div>
          </div>
        </div>

        {filasPorPeriodo.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No hay periodos para los filtros seleccionados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50 text-sm text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">Año</th>
                  <th className="px-4 py-3 text-left">Periodo</th>
                  <th className="px-4 py-3 text-left">Solicitud</th>
                  <th className="px-4 py-3 text-left">Inicio</th>
                  <th className="px-4 py-3 text-left">Fin</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filasPorPeriodo.map((r) => {
                  const sol = r.solicitud;
                  const tieneSol = !!sol?.idSolicitud;
                  const esBorrador = sol?.estado === "BORRADOR";

                  return (
                    <tr key={r.idPeriodo} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-slate-700 font-semibold">{r.anio}</td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        <div className="font-semibold">{r.periodoLabel}</div>
                        <div className="text-xs text-slate-500">Código: {r.periodoCode} · ID: {r.idPeriodo}</div>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {tieneSol ? <span className="font-semibold">#{sol.idSolicitud}</span> : <span className="text-slate-400">—</span>}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">{formatFecha(r.fechaInicio)}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{formatFecha(r.fechaFin)}</td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${estadoBadgeClass(r.estado)}`}>
                          {r.estado === "SIN_SOLICITUD" ? "SIN SOLICITUD" : r.estado}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => abrirDesdePeriodo(r)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {!tieneSol ? (
                            <>
                              <Plus className="w-4 h-4" /> Iniciar
                            </>
                          ) : esBorrador ? (
                            <>
                              <Pencil className="w-4 h-4" /> Editar
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" /> Ver
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-3 text-xs text-slate-500">
              * Al iniciar/editar, se muestra detalle del periodo (sin combo) y registro por calendario.
            </div>
          </div>
        )}
      </div>

      {/* ========================= MODAL FORMULARIO ========================= */}
      <Modal
        open={openFormModal}
        onClose={cerrarModal}
        title={
          modoModal === "NUEVA"
            ? "Nueva Solicitud"
            : modoModal === "EDITAR"
            ? `Editar Solicitud #${solicitudActual?.idSolicitud ?? ""}`
            : `Detalle Solicitud #${solicitudActual?.idSolicitud ?? ""}`
        }
      >
        <div className="p-6 space-y-6">
          {/* Estado actual */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-slate-600">
              Estado:{" "}
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${estadoBadgeClass(solicitudActual?.estado || "BORRADOR")}`}>
                {solicitudActual?.estado || (modoModal === "NUEVA" ? "BORRADOR" : "—")}
              </span>
            </div>

            <div className="text-sm text-slate-500">
              {solicitudActual?.updatedAt ? (
                <>Última actualización: <strong>{formatFecha(solicitudActual.updatedAt)}</strong></>
              ) : (
                <>—</>
              )}
            </div>
          </div>

          {/* Detalle periodo / solicitud (SIN COMBO cuando inicias) */}
          {(periodoForzado || (modoModal === "EDITAR" && !!solicitudActual?.idPeriodo) || esSoloLectura) ? (
            <PeriodoDetalleCard
              periodo={periodoSeleccionado}
              solicitud={solicitudActual}
              modoModal={modoModal}
              periodoForzado={periodoForzado}
            />
          ) : (
            // flujo libre (si abres "Nueva solicitud" sin iniciar desde tabla)
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0A5BA9]" />
                Periodo de Solicitud
              </h2>

              {loadingPeriodos && (
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando periodos...
                </div>
              )}

              {periodos.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay periodos disponibles.</p>
                  <button
                    type="button"
                    onClick={cargarPeriodos}
                    className="mt-3 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <select
                  value={periodoSeleccionado?.idPeriodo || ""}
                  onChange={(e) => {
                    const p = periodos.find((x) => Number(x.idPeriodo) === Number(e.target.value));
                    setPeriodoSeleccionado(p || null);
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                >
                  <option value="">Seleccione un periodo...</option>
                  {periodos.map((p) => (
                    <option key={p.idPeriodo} value={p.idPeriodo}>
                      {p.descripcion} ({p.periodo})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* VER (solo lectura): aquí mantén tu vista anterior si ya la tienes.
              Por simplicidad, mostramos un mensaje. */}
          {esSoloLectura && (
            <div className="bg-slate-100 rounded-2xl p-6 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Solicitud{" "}
                {solicitudActual?.estado === "REVISADO"
                  ? "Revisada"
                  : solicitudActual?.estado === "APROBADA"
                  ? "Aprobada"
                  : solicitudActual?.estado === "RECHAZADA"
                  ? "Rechazada"
                  : "Enviada"}
              </h3>
              <p className="text-slate-600">
                {solicitudActual?.estado === "RECHAZADA"
                  ? "Tu solicitud fue rechazada. Revisa el motivo y genera una nueva solicitud si corresponde."
                  : solicitudActual?.estado === "APROBADA"
                  ? "Tu solicitud fue aprobada."
                  : solicitudActual?.estado === "REVISADO"
                  ? "Tu solicitud ha sido revisada por el coordinador."
                  : "Tu solicitud ha sido enviada y está pendiente de revisión."}
              </p>
            </div>
          )}

          {/* EDITAR/NUEVA: Registro por especialidad + calendario */}
          {!esSoloLectura && (
            <>
              {!periodoSeleccionado?.idPeriodo ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Selecciona un periodo para registrar turnos.
                </div>
              ) : (
                <>
                  {/* Selector especialidad */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                      <div className="flex-1">
                        <label className="text-sm font-bold text-slate-700">Especialidad</label>
                        <select
                          value={idServicioSel}
                          onChange={(e) => setIdServicioSel(e.target.value)}
                          className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                        >
                          <option value="">Seleccione una especialidad...</option>
                          {especialidades.map((e) => (
                            <option key={e.idServicio} value={e.idServicio}>
                              {e.descServicio} {e.codServicio ? `(${e.codServicio})` : ""}
                            </option>
                          ))}
                        </select>
                        <div className="text-xs text-slate-500 mt-2">
                          * Al seleccionar la especialidad, registra días/turnos en el calendario del periodo.
                        </div>
                      </div>

                      <div className="text-sm text-slate-600">
                        Registros actuales:{" "}
                        <span className="font-extrabold text-[#0A5BA9]">{registros.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Calendario */}
                  {especialidadSel ? (
                    <CalendarPeriodo
                      periodo={periodoSeleccionado}
                      onClickTurno={handleClickTurno}
                      registrosIndex={registrosIndex}
                      esSoloLectura={false}
                    />
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl">
                      Selecciona una especialidad para mostrar el calendario.
                    </div>
                  )}

                  {/* Resumen */}
                  <TurnosSolicitados registros={registros} onRemove={onRemoveRegistro} onClear={onClearRegistros} />

                  {/* Acciones */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-slate-600">
                        Periodo:{" "}
                        <strong className="text-slate-900">{periodoSeleccionado?.descripcion || "—"}</strong>
                        <div className="text-xs text-slate-500 mt-1">
                          * Guardar crea/actualiza BORRADOR. Enviar deja la solicitud en solo lectura.
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleGuardarBorrador}
                          disabled={saving || registros.length === 0}
                          className="px-5 py-2.5 border-2 border-[#0A5BA9] text-[#0A5BA9] font-semibold rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Guardar Borrador
                        </button>

                        <button
                          onClick={handleEnviar}
                          disabled={saving || registros.length === 0}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          Enviar Solicitud
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Modal configurar turno */}
        <ModalConfigTurno
          open={openCfg}
          onClose={() => setOpenCfg(false)}
          data={cfgData}
          onConfirm={onConfirmCfg}
        />
      </Modal>
    </div>
  );
}
