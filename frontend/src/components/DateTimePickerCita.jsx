/**
 * DateTimePickerCita - Date/Time Picker Profesional para Citas Médicas
 * - Bloquear fechas pasadas
 * - Entrada manual con máscara DD/MM/AAAA
 * - Intervalos de 5 minutos — picker de dos paneles (Hora + Minuto)
 * - Portal a document.body para escapar overflow:hidden de tablas
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const HORAS_PANEL = [
  { valor: 6,  label: "6 AM"  },
  { valor: 7,  label: "7 AM"  },
  { valor: 8,  label: "8 AM"  },
  { valor: 9,  label: "9 AM"  },
  { valor: 10, label: "10 AM" },
  { valor: 11, label: "11 AM" },
  { valor: 12, label: "12 PM" },
  { valor: 13, label: "1 PM"  },
  { valor: 14, label: "2 PM"  },
  { valor: 15, label: "3 PM"  },
  { valor: 16, label: "4 PM"  },
  { valor: 17, label: "5 PM"  },
  { valor: 18, label: "6 PM"  },
  { valor: 19, label: "7 PM"  },
  { valor: 20, label: "8 PM"  },
  { valor: 21, label: "9 PM"  },
  { valor: 22, label: "10 PM" },
  { valor: 23, label: "11 PM" },
  { valor: 0,  label: "12 AM" },
];

const MINUTOS_PANEL = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const formatAMPM = (hora24) => {
  if (!hora24) return "--:--";
  const [hStr, mStr] = hora24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr;
  if (h === 0)  return `12:${m} AM`;
  if (h < 12)  return `${h}:${m} AM`;
  if (h === 12) return `12:${m} PM`;
  return `${h - 12}:${m} PM`;
};

// ─── Portal flotante ────────────────────────────────────────────────────────
function FloatingPanel({ anchorRef, align = "left", children, onClose }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const panelRef = useRef(null);

  const recalc = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    setPos({
      top:   rect.bottom + scrollY + 4,
      left:  align === "right"
               ? rect.right + scrollX
               : rect.left + scrollX,
      width: rect.width,
    });
  }, [anchorRef, align]);

  useEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [recalc]);

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [anchorRef, onClose]);

  const style =
    align === "right"
      ? { position: "absolute", top: pos.top, right: window.innerWidth - pos.left, zIndex: 99999 }
      : { position: "absolute", top: pos.top, left: pos.left, zIndex: 99999 };

  return ReactDOM.createPortal(
    <div ref={panelRef} style={style}>
      {children}
    </div>,
    document.body
  );
}
// ────────────────────────────────────────────────────────────────────────────

export default function DateTimePickerCita({
  value = "",
  onChange = () => {},
  disabled = false,
  idMedico = null,
  onValidationChange = () => {},
}) {
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarHoras, setMostrarHoras]           = useState(false);
  const [fechaInput, setFechaInput]               = useState("");
  const [horaSeleccionada, setHoraSeleccionada]   = useState("");
  const [horaElegida, setHoraElegida]             = useState(null);
  const [mesActual, setMesActual]                 = useState(new Date());
  const [validacionError, setValidacionError]     = useState("");
  const [validando, setValidando]                 = useState(false);

  const containerRef  = useRef(null);
  const fechaTrigger  = useRef(null);  // ancla para el calendario
  const horaTrigger   = useRef(null);  // ancla para el picker de hora

  // Sincronizar value externo
  useEffect(() => {
    if (value) {
      const [fecha, hora] = value.split("T");
      if (fecha) {
        const [año, mes, día] = fecha.split("-");
        setFechaInput(`${día}/${mes}/${año}`);
      }
      if (hora) {
        setHoraSeleccionada(hora.slice(0, 5));
        setHoraElegida(parseInt(hora.split(":")[0], 10));
      }
    } else {
      setFechaInput("");
      setHoraSeleccionada("");
      setHoraElegida(null);
    }
  }, [value]);

  // Máscara DD/MM/AAAA
  const handleFechaInput = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length <= 2)      setFechaInput(v);
    else if (v.length <= 4) setFechaInput(`${v.slice(0,2)}/${v.slice(2)}`);
    else                    setFechaInput(`${v.slice(0,2)}/${v.slice(2,4)}/${v.slice(4,8)}`);
  };

  const parseFecha = (str) => {
    const m = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!m) return null;
    return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
  };

  const esFechaPasada = (f) => {
    const hoy = new Date(); hoy.setHours(0,0,0,0); return f < hoy;
  };

  const validarDisponibilidad = async (fecha, hora) => {
    if (!idMedico || !fecha || !hora) return true;
    setValidando(true);
    try {
      const res = await fetch(
        `/api/citas/validar-disponibilidad/${idMedico}?fecha=${fecha}&hora=${hora}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (!data.disponible) {
          setValidacionError(`❌ Médico no disponible a las ${hora}`);
          onValidationChange(false);
          return false;
        }
      }
      setValidacionError("");
      onValidationChange(true);
      return true;
    } catch {
      setValidacionError("");
      onValidationChange(true);
      return true;
    } finally {
      setValidando(false);
    }
  };

  const seleccionarFecha = async (día) => {
    const nuevaFecha = new Date(mesActual);
    nuevaFecha.setDate(día);
    if (esFechaPasada(nuevaFecha)) { toast.error("No se pueden agendar citas en fechas pasadas"); return; }
    const año     = nuevaFecha.getFullYear();
    const mes     = String(nuevaFecha.getMonth() + 1).padStart(2, "0");
    const día_str = String(día).padStart(2, "0");
    setFechaInput(`${día_str}/${mes}/${año}`);
    setMostrarCalendario(false);
    setMostrarHoras(true);
    setHoraElegida(null);
    const horaActual = horaSeleccionada || "08:00";
    onChange(`${año}-${mes}-${día_str}T${horaActual}`);
    if (horaSeleccionada) await validarDisponibilidad(`${año}-${mes}-${día_str}`, horaSeleccionada);
  };

  const elegirHora = (h) => setHoraElegida(h);

  const elegirMinuto = async (m) => {
    const fecha = parseFecha(fechaInput);
    if (!fecha) { toast.error("Selecciona una fecha primero"); return; }
    const hh   = String(horaElegida).padStart(2, "0");
    const mm   = String(m).padStart(2, "0");
    const hora = `${hh}:${mm}`;
    setHoraSeleccionada(hora);
    setMostrarHoras(false);
    setHoraElegida(null);
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const día = String(fecha.getDate()).padStart(2, "0");
    const ok = await validarDisponibilidad(`${año}-${mes}-${día}`, hora);
    if (ok) onChange(`${año}-${mes}-${día}T${hora}`);
  };

  const generarDíasCalendario = () => {
    const año = mesActual.getFullYear(), mes = mesActual.getMonth();
    const primer = new Date(año, mes, 1), ultimo = new Date(año, mes + 1, 0);
    const dias = [];
    for (let i = 0; i < primer.getDay(); i++) dias.push(null);
    for (let i = 1; i <= ultimo.getDate(); i++) dias.push(i);
    return dias;
  };

  const diasCalendario = generarDíasCalendario();
  const fecha = parseFecha(fechaInput);
  const minutoActual =
    horaSeleccionada && horaElegida === parseInt(horaSeleccionada.split(":")[0], 10)
      ? parseInt(horaSeleccionada.split(":")[1], 10)
      : null;

  return (
    <div ref={containerRef} className="relative">
      {disabled && (
        <div className="text-xs text-amber-600 mb-2 flex items-center gap-1">
          ℹ️ <strong>Selecciona un médico primero</strong> para agendar fecha/hora
        </div>
      )}

      {/* CÁPSULA Fecha + Hora */}
      <div
        className={`flex items-center border-2 rounded-lg transition-all ${
          validacionError  ? "border-red-500 bg-red-50"
          : disabled       ? "border-gray-300 bg-gray-100"
                           : "border-blue-400 focus-within:ring-2 focus-within:ring-blue-500"
        }`}
      >
        {/* FECHA */}
        <div className="flex-1 px-3" ref={fechaTrigger}>
          {fechaInput ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setMostrarCalendario(!mostrarCalendario)}
              className={`w-full py-2 text-sm font-medium flex items-center justify-center gap-1.5 focus:outline-none transition-colors ${
                disabled ? "text-gray-400 cursor-not-allowed" : "text-gray-900 hover:text-blue-700"
              }`}
            >
              <Calendar className="w-4 h-4" strokeWidth={2} />
              <span className="font-semibold">{fechaInput}</span>
            </button>
          ) : (
            <input
              type="text"
              value={fechaInput}
              onChange={handleFechaInput}
              placeholder="DD/MM/AAAA"
              disabled={disabled}
              onFocus={() => !disabled && setMostrarCalendario(true)}
              className={`w-full px-2 py-2 text-sm focus:outline-none ${
                disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : "text-gray-600"
              }`}
              maxLength="10"
            />
          )}
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* HORA */}
        <div className="w-28 px-3" ref={horaTrigger}>
          <button
            type="button"
            disabled={disabled || !fecha}
            onClick={() => {
              if (!disabled && fecha) {
                setMostrarHoras(!mostrarHoras);
                setHoraElegida(null);
              }
            }}
            className={`w-full py-2 text-sm font-medium flex items-center justify-center gap-1.5 focus:outline-none transition-colors ${
              disabled || !fecha
                ? "text-gray-400 cursor-not-allowed"
                : horaSeleccionada ? "text-gray-900 hover:text-blue-700"
                : "text-gray-500 hover:text-blue-600"
            }`}
            title={fecha ? "Seleccionar hora" : "Selecciona fecha primero"}
          >
            <Clock className="w-4 h-4" strokeWidth={2} />
            <span className="font-semibold">
              {horaSeleccionada ? formatAMPM(horaSeleccionada) : "--:--"}
            </span>
          </button>
        </div>
      </div>

      {/* Error */}
      {validacionError && (
        <div className="mt-1 bg-red-100 border border-red-500 text-red-700 text-xs px-3 py-2 rounded-lg">
          {validacionError}
        </div>
      )}

      {/* ── CALENDARIO (portal) ── */}
      {mostrarCalendario && !disabled && (
        <FloatingPanel
          anchorRef={fechaTrigger}
          align="left"
          onClose={() => setMostrarCalendario(false)}
        >
          <div className="bg-white border-2 border-blue-400 rounded-xl shadow-2xl p-4" style={{ minWidth: 320 }}>
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1))} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="font-semibold text-sm capitalize">
                {mesActual.toLocaleDateString("es-PE", { month: "long", year: "numeric" })}
              </h3>
              <button onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1))} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Do","Lu","Ma","Mi","Ju","Vi","Sa"].map(d => (
                <div key={d} className="text-center text-xs font-bold text-gray-600 h-8 flex items-center justify-center">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {diasCalendario.map((día, idx) => {
                const esSeleccionado = día && fecha &&
                  día === fecha.getDate() &&
                  mesActual.getMonth() === fecha.getMonth() &&
                  mesActual.getFullYear() === fecha.getFullYear();
                const esPasado = día && esFechaPasada(new Date(mesActual.getFullYear(), mesActual.getMonth(), día));
                return (
                  <button
                    key={idx}
                    onClick={() => día && !esPasado && seleccionarFecha(día)}
                    disabled={!día || esPasado}
                    className={`h-8 rounded text-sm font-medium transition-colors ${
                      !día ? "" : esPasado ? "text-gray-300 cursor-not-allowed"
                        : esSeleccionado ? "bg-blue-600 text-white"
                        : "hover:bg-blue-100 text-gray-700"
                    }`}
                  >
                    {día}
                  </button>
                );
              })}
            </div>
          </div>
        </FloatingPanel>
      )}

      {/* ── PICKER DOS PANELES (portal) ── */}
      {mostrarHoras && !disabled && fecha && (
        <FloatingPanel
          anchorRef={horaTrigger}
          align="right"
          onClose={() => { setMostrarHoras(false); setHoraElegida(null); }}
        >
          <div className="bg-white border-2 border-blue-400 rounded-xl shadow-2xl overflow-hidden" style={{ minWidth: 340 }}>
            {/* Cabecera */}
            <div className="bg-blue-600 px-4 py-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" strokeWidth={2} />
              <span className="text-white text-xs font-semibold tracking-wide">
                {horaElegida === null
                  ? "1. Elige la hora"
                  : `2. Elige los minutos — ${HORAS_PANEL.find(h => h.valor === horaElegida)?.label}`}
              </span>
              {horaElegida !== null && (
                <button
                  onClick={() => setHoraElegida(null)}
                  className="ml-auto text-blue-200 hover:text-white text-xs underline"
                >
                  ← volver
                </button>
              )}
            </div>

            <div className="flex">
              {/* Panel Horas */}
              <div className="w-1/2 border-r border-gray-200 p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Hora</p>
                <div className="grid grid-cols-3 gap-1">
                  {HORAS_PANEL.map(({ valor, label }) => {
                    const esActiva = horaElegida === valor;
                    const esActual = horaSeleccionada && parseInt(horaSeleccionada.split(":")[0], 10) === valor;
                    return (
                      <button
                        key={valor}
                        onClick={() => elegirHora(valor)}
                        className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          esActiva  ? "bg-blue-600 text-white shadow-md scale-105"
                          : esActual ? "bg-blue-100 text-blue-700 ring-1 ring-blue-400"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Panel Minutos */}
              <div className="w-1/2 p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Minutos</p>
                {horaElegida === null ? (
                  <div className="flex items-center justify-center min-h-[80px]">
                    <p className="text-xs text-gray-400 text-center leading-relaxed">
                      ← Selecciona<br />la hora primero
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1">
                    {MINUTOS_PANEL.map((m) => (
                      <button
                        key={m}
                        onClick={() => elegirMinuto(m)}
                        disabled={validando}
                        className={`py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                          minutoActual === m
                            ? "bg-blue-600 text-white shadow-md scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        :{String(m).padStart(2, "0")}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {horaSeleccionada && (
              <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">Hora actual:</span>
                <span className="text-xs font-bold text-blue-700">{formatAMPM(horaSeleccionada)}</span>
              </div>
            )}
          </div>
        </FloatingPanel>
      )}

      {validando && (
        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          Validando disponibilidad...
        </div>
      )}
    </div>
  );
}
