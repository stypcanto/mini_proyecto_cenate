// ========================================================================
// ModalSeleccionarFechas.jsx - Modal para seleccionar fechas específicas
// ------------------------------------------------------------------------
// Permite al usuario seleccionar fechas concretas para turnos de mañana/tarde
// ========================================================================

import React, { useState, useEffect } from "react";
import { Calendar, Sun, Moon, X, Loader2 } from "lucide-react";
import { solicitudTurnoService } from "../../../../../services/solicitudTurnoService";

// Helper para formatear fecha corta
const formatFechaRango = (fecha) => {
  if (!fecha) return "—";
  try {
    const fechaStr = fecha.split('T')[0];
    const [anio, mes, dia] = fechaStr.split('-');
    return `${dia}/${mes}/${anio}`;
  } catch {
    return fecha;
  }
};

/**
 * Modal para seleccionar fechas específicas por especialidad
 * @param {Object} props
 * @param {Boolean} props.open - Si el modal está abierto
 * @param {Function} props.onClose - Callback al cerrar
 * @param {String} props.especialidad - Nombre de la especialidad
 * @param {Number} props.turnoManana - Cantidad de turnos mañana
 * @param {Number} props.turnoTarde - Cantidad de turnos tarde
 * @param {Number} props.idDetalle - ID del detalle (para cargar fechas del backend)
 * @param {Array} props.fechasIniciales - Fechas ya seleccionadas (fallback)
 * @param {Function} props.onConfirm - Callback al confirmar (recibe array de fechas)
 * @param {Object} props.periodo - Periodo seleccionado con fechaInicio y fechaFin
 */
export default function ModalSeleccionarFechas({
  open,
  onClose,
  especialidad = "",
  turnoManana = 0,
  turnoTarde = 0,
  idDetalle = null,
  fechasIniciales = [],
  onConfirm = () => {},
  periodo = null,
}) {
  const [tipoTurno, setTipoTurno] = useState("MANANA"); // MANANA | TARDE
  const [fechaInput, setFechaInput] = useState("");
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      cargarFechas();
      setFechaInput("");
      setTipoTurno("MANANA");
    }
  }, [open, idDetalle]);

  const cargarFechas = async () => {
    // Si hay idDetalle, cargar desde el backend
    if (idDetalle) {
      setLoading(true);
      try {
        const response = await solicitudTurnoService.obtenerFechasDetalle(idDetalle);
        
        // Convertir formato backend a formato del modal
        const fechasDelBackend = (response.fechas || []).map(f => ({
          fecha: f.fecha,
          turno: f.bloque,  // "MANANA" o "TARDE"
          id: `${f.fecha}-${f.bloque}`
        }));
        
        console.log("📥 Fechas cargadas desde backend:", fechasDelBackend);
        setFechasSeleccionadas(fechasDelBackend);
      } catch (error) {
        console.error("Error al cargar fechas:", error);
        // Si falla, usar fechas iniciales como fallback
        setFechasSeleccionadas(fechasIniciales || []);
      } finally {
        setLoading(false);
      }
    } else {
      // Sin idDetalle, usar fechas iniciales
      setFechasSeleccionadas(fechasIniciales || []);
    }
  };

  const agregarFecha = () => {
    if (!fechaInput) return;

    const nueva = {
      fecha: fechaInput,
      turno: tipoTurno,
      id: `${fechaInput}-${tipoTurno}`,
    };

    // Evitar duplicados
    if (fechasSeleccionadas.some((f) => f.id === nueva.id)) {
      alert("Esta fecha y turno ya fueron agregados");
      return;
    }

    setFechasSeleccionadas([...fechasSeleccionadas, nueva]);
    setFechaInput("");
  };

  const eliminarFecha = (id) => {
    setFechasSeleccionadas(fechasSeleccionadas.filter((f) => f.id !== id));
  };

  const handleConfirmar = () => {
    onConfirm(fechasSeleccionadas);
    onClose();
  };

  // Contar fechas seleccionadas por turno
  const contarFechas = (turno) => {
    return fechasSeleccionadas.filter((f) => f.turno === turno).length;
  };

  const fechasManana = contarFechas("MANANA");
  const fechasTarde = contarFechas("TARDE");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl my-8 overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
          {/* Header Azul */}
          <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Seleccionar Fechas</h2>
                  <p className="text-blue-100 text-sm">{especialidad}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Loading state */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-[#0A5BA9] mb-3" />
                <p className="text-slate-600">Cargando fechas registradas...</p>
              </div>
            ) : (
              <>
                {/* Tarjetas de resumen */}
                <div className="grid grid-cols-2 gap-4">
              {/* Turnos Mañana */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <Sun className="w-5 h-5" />
                  <span className="font-bold text-sm">TURNOS MAÑANA</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-orange-600">{fechasManana}</span>
                  <span className="text-lg text-orange-500">/ {turnoManana}</span>
                </div>
                <p className="text-xs text-orange-600 mt-1">{turnoManana - fechasManana} disponible(s)</p>
              </div>

              {/* Turnos Tarde */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Moon className="w-5 h-5" />
                  <span className="font-bold text-sm">TURNOS TARDE</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-purple-600">{fechasTarde}</span>
                  <span className="text-lg text-purple-500">/ {turnoTarde}</span>
                </div>
                <p className="text-xs text-purple-600 mt-1">{turnoTarde - fechasTarde} disponible(s)</p>
              </div>
            </div>

            {/* Agregar nueva fecha */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800">Agregar nueva fecha</h3>

              {/* Botones Mañana/Tarde */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoTurno("MANANA")}
                  className={`py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    tipoTurno === "MANANA"
                      ? "bg-orange-500 text-white shadow-lg"
                      : "bg-orange-50 text-orange-600 border-2 border-orange-200"
                  }`}
                >
                  <Sun className="w-5 h-5" />
                  Mañana
                </button>

                <button
                  type="button"
                  onClick={() => setTipoTurno("TARDE")}
                  className={`py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    tipoTurno === "TARDE"
                      ? "bg-purple-500 text-white shadow-lg"
                      : "bg-purple-50 text-purple-600 border-2 border-purple-200"
                  }`}
                >
                  <Moon className="w-5 h-5" />
                  Tarde
                </button>
              </div>

              {/* Input fecha y botón agregar */}
              <div className="flex gap-3">
                <input
                  type="date"
                  value={fechaInput}
                  onChange={(e) => setFechaInput(e.target.value)}
                  min={periodo?.fechaInicio ? periodo.fechaInicio.split('T')[0] : undefined}
                  max={periodo?.fechaFin ? periodo.fechaFin.split('T')[0] : undefined}
                  className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                  placeholder="dd/mm/aaaa"
                />
                <button
                  type="button"
                  onClick={agregarFecha}
                  disabled={!fechaInput}
                  className="px-6 py-3 bg-[#0A5BA9] text-white font-bold rounded-xl hover:bg-[#2563EB] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Agregar
                </button>
              </div>
              
              {/* Información del rango de fechas permitido */}
              {periodo?.fechaInicio && periodo?.fechaFin && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <span className="font-bold">Rango permitido:</span> {formatFechaRango(periodo.fechaInicio)} - {formatFechaRango(periodo.fechaFin)}
                  </p>
                </div>
              )}
            </div>

            {/* Fechas seleccionadas */}
            {fechasSeleccionadas.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 uppercase text-sm">Fechas Seleccionadas</h3>
                  <span className="bg-[#0A5BA9] text-white px-3 py-1 rounded-full text-xs font-bold">
                    {fechasSeleccionadas.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {fechasSeleccionadas.map((f) => (
                    <div
                      key={f.id}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                        f.turno === "MANANA"
                          ? "bg-orange-50 border-orange-200"
                          : "bg-purple-50 border-purple-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {f.turno === "MANANA" ? (
                          <Sun className="w-5 h-5 text-orange-600" />
                        ) : (
                          <Moon className="w-5 h-5 text-purple-600" />
                        )}
                        <div>
                          <p className="font-bold text-slate-800">
                            {new Date(f.fecha + "T00:00:00").toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p
                            className={`text-xs font-semibold ${
                              f.turno === "MANANA" ? "text-orange-600" : "text-purple-600"
                            }`}
                          >
                            {f.turno === "MANANA" ? "🌅 Turno Mañana" : "🌙 Turno Tarde"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarFecha(f.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </>
            )}

            {/* Botón Guardar */}
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
