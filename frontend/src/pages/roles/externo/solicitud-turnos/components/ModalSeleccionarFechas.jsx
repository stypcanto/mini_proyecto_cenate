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

// Helper para calcular rango de fechas del periodo (basado en el código del periodo)
const calcularRangoPeriodo = (periodo) => {
  if (!periodo?.periodo) return { min: undefined, max: undefined };
  
  try {
    // El periodo viene en formato AAAAMM (ejemplo: "202601" = Enero 2026)
    const periodoStr = String(periodo.periodo);
    const anio = periodoStr.substring(0, 4);
    const mes = periodoStr.substring(4, 6);
    
    // Primer día del mes
    const primerDia = `${anio}-${mes}-01`;
    
    // Último día del mes
    const ultimoDia = new Date(parseInt(anio), parseInt(mes), 0).getDate();
    const ultimoDiaStr = `${anio}-${mes}-${String(ultimoDia).padStart(2, '0')}`;
    
    return { min: primerDia, max: ultimoDiaStr };
  } catch (error) {
    console.error("Error al calcular rango del periodo:", error);
    return { min: undefined, max: undefined };
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

    // Verificar límite de turnos
    const conteoActual = fechasSeleccionadas.filter((f) => f.turno === tipoTurno).length;
    const limiteActual = tipoTurno === "MANANA" ? turnoManana : turnoTarde;
    
    if (conteoActual >= limiteActual) {
      const nombreTurno = tipoTurno === "MANANA" ? "Mañana" : "Tarde";
      alert(`Has alcanzado el límite de turnos de ${nombreTurno} (${limiteActual}). No puedes agregar más fechas para este turno.`);
      return;
    }

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
  
  // Calcular rango de fechas basado en el periodo
  const rangoPeriodo = calcularRangoPeriodo(periodo);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl my-8 overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200">
          {/* Header Azul */}
          <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white bg-opacity-20 p-1.5 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Seleccionar Fechas</h2>
                  <p className="text-blue-100 text-xs">{especialidad}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-1.5 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Loading state */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-[#0A5BA9] mb-3" />
                <p className="text-slate-600">Cargando fechas registradas...</p>
              </div>
            ) : (
              <>
                {/* Tarjetas de resumen */}
                <div className="grid grid-cols-2 gap-2">
              {/* Turnos Mañana */}
              <div className={`rounded-lg p-2 border ${
                fechasManana >= turnoManana 
                  ? 'bg-red-50 border-red-300' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className={`flex items-center gap-1 mb-1 ${
                  fechasManana >= turnoManana ? 'text-red-600' : 'text-orange-600'
                }`}>
                  <Sun className="w-3 h-3" />
                  <span className="font-bold text-[10px]">TURNOS MAÑANA</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-bold ${
                    fechasManana >= turnoManana ? 'text-red-600' : 'text-orange-600'
                  }`}>{fechasManana}</span>
                  <span className={`text-sm ${
                    fechasManana >= turnoManana ? 'text-red-500' : 'text-orange-500'
                  }`}>/ {turnoManana}</span>
                </div>
                <p className={`text-[9px] mt-0.5 font-semibold ${
                  fechasManana >= turnoManana ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {fechasManana >= turnoManana ? '⚠️ Límite alcanzado' : `${turnoManana - fechasManana} disponible(s)`}
                </p>
              </div>

              {/* Turnos Tarde */}
              <div className={`rounded-lg p-2 border ${
                fechasTarde >= turnoTarde 
                  ? 'bg-red-50 border-red-300' 
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <div className={`flex items-center gap-1 mb-1 ${
                  fechasTarde >= turnoTarde ? 'text-red-600' : 'text-purple-600'
                }`}>
                  <Moon className="w-3 h-3" />
                  <span className="font-bold text-[10px]">TURNOS TARDE</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-bold ${
                    fechasTarde >= turnoTarde ? 'text-red-600' : 'text-purple-600'
                  }`}>{fechasTarde}</span>
                  <span className={`text-sm ${
                    fechasTarde >= turnoTarde ? 'text-red-500' : 'text-purple-500'
                  }`}>/ {turnoTarde}</span>
                </div>
                <p className={`text-[9px] mt-0.5 font-semibold ${
                  fechasTarde >= turnoTarde ? 'text-red-600' : 'text-purple-600'
                }`}>
                  {fechasTarde >= turnoTarde ? '⚠️ Límite alcanzado' : `${turnoTarde - fechasTarde} disponible(s)`}
                </p>
              </div>
            </div>

            {/* Agregar nueva fecha */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-sm">Agregar nueva fecha</h3>

              {/* Botones Mañana/Tarde */}
              <div className="grid grid-cols-2 gap-2">
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
              <div className="flex gap-2">
                <input
                  type="date"
                  value={fechaInput}
                  onChange={(e) => setFechaInput(e.target.value)}
                  min={rangoPeriodo.min}
                  max={rangoPeriodo.max}
                  className="flex-1 px-3 py-2 text-sm border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                  placeholder="dd/mm/aaaa"
                />
                <button
                  type="button"
                  onClick={agregarFecha}
                  disabled={!fechaInput || (tipoTurno === "MANANA" && fechasManana >= turnoManana) || (tipoTurno === "TARDE" && fechasTarde >= turnoTarde)}
                  className="px-4 py-2 text-sm bg-[#0A5BA9] text-white font-bold rounded-lg hover:bg-[#2563EB] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Agregar
                </button>
              </div>
              
              {/* Alerta de límite alcanzado */}
              {((tipoTurno === "MANANA" && fechasManana >= turnoManana) || (tipoTurno === "TARDE" && fechasTarde >= turnoTarde)) && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-semibold flex items-center gap-2">
                    <span>⚠️</span>
                    Has alcanzado el límite de turnos de {tipoTurno === "MANANA" ? "Mañana" : "Tarde"} ({tipoTurno === "MANANA" ? turnoManana : turnoTarde}). No puedes agregar más fechas para este turno.
                  </p>
                </div>
              )}
              
              {/* Información del rango de fechas permitido */}
              {rangoPeriodo.min && rangoPeriodo.max && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <span className="font-bold">Periodo {periodo?.descripcion}:</span> {formatFechaRango(rangoPeriodo.min)} - {formatFechaRango(rangoPeriodo.max)}
                  </p>
                </div>
              )}
            </div>

            {/* Fechas seleccionadas */}
            {fechasSeleccionadas.length > 0 && (() => {
              const fechasMananaList = fechasSeleccionadas.filter(f => f.turno === "MANANA");
              const fechasTardeList = fechasSeleccionadas.filter(f => f.turno === "TARDE");
              
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase">Fechas Seleccionadas</h3>
                    <span className="bg-[#0A5BA9] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {fechasSeleccionadas.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {/* Columna Izquierda: Turno Mañana */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 bg-orange-100 px-2 py-1 rounded-lg sticky top-0 z-10">
                        <Sun className="w-3 h-3 text-orange-600" />
                        <span className="text-[10px] font-bold text-orange-700 uppercase">Turno Mañana</span>
                        <span className="ml-auto bg-orange-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                          {fechasMananaList.length}
                        </span>
                      </div>
                      {fechasMananaList.length > 0 ? (
                        fechasMananaList.map((f) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-orange-50 border border-orange-200"
                          >
                            <div className="flex items-center gap-2">
                              <Sun className="w-3 h-3 text-orange-600" />
                              <p className="text-xs font-semibold text-slate-800">
                                {new Date(f.fecha + "T00:00:00").toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarFecha(f.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-400 text-center py-2">Sin fechas</p>
                      )}
                    </div>

                    {/* Columna Derecha: Turno Tarde */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 bg-purple-100 px-2 py-1 rounded-lg sticky top-0 z-10">
                        <Moon className="w-3 h-3 text-purple-600" />
                        <span className="text-[10px] font-bold text-purple-700 uppercase">Turno Tarde</span>
                        <span className="ml-auto bg-purple-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                          {fechasTardeList.length}
                        </span>
                      </div>
                      {fechasTardeList.length > 0 ? (
                        fechasTardeList.map((f) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-purple-50 border border-purple-200"
                          >
                            <div className="flex items-center gap-2">
                              <Moon className="w-3 h-3 text-purple-600" />
                              <p className="text-xs font-semibold text-slate-800">
                                {new Date(f.fecha + "T00:00:00").toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarFecha(f.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-400 text-center py-2">Sin fechas</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
              </>
            )}

            {/* Botones Cancelar y Guardar */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-red-600 text-white font-bold text-base rounded-lg shadow-lg hover:bg-red-700 hover:shadow-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white font-bold text-base rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
