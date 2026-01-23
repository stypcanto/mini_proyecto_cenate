// ========================================================================
// ModalSeleccionarFechas.jsx - Modal para seleccionar fechas específicas
// ------------------------------------------------------------------------
// Permite al usuario seleccionar fechas concretas para turnos de mañana/tarde
// ========================================================================

import React, { useState, useEffect, useMemo } from "react";
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

// Días de la semana
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Helper para obtener el nombre del mes
const getNombreMes = (mes) => {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return meses[mes];
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
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calcular días del mes para el calendario (basado en el periodo)
  const diasDelMes = useMemo(() => {
    if (!periodo?.periodo) return [];
    
    const periodoStr = String(periodo.periodo);
    const anio = parseInt(periodoStr.substring(0, 4));
    const mes = parseInt(periodoStr.substring(4, 6)) - 1; // 0-indexed
    
    // Primer y último día del mes
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    
    // Días a mostrar (incluyendo espacios en blanco al inicio)
    const dias = [];
    const primerDiaSemana = primerDia.getDay(); // 0 = Domingo
    
    // Espacios en blanco al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }
    
    // Días del mes
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(new Date(anio, mes, dia));
    }
    
    return dias;
  }, [periodo]);

  // Calcular rango válido del periodo
  const rangoPeriodo = useMemo(() => {
    if (!periodo?.periodo) return { min: null, max: null };
    
    try {
      const periodoStr = String(periodo.periodo);
      const anio = periodoStr.substring(0, 4);
      const mes = periodoStr.substring(4, 6);
      
      const primerDia = new Date(parseInt(anio), parseInt(mes) - 1, 1);
      const ultimoDia = new Date(parseInt(anio), parseInt(mes), 0);
      
      return { min: primerDia, max: ultimoDia };
    } catch (error) {
      console.error("Error al calcular rango del periodo:", error);
      return { min: null, max: null };
    }
  }, [periodo]);

  useEffect(() => {
    if (open) {
      cargarFechas();
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

  const agregarFecha = (fecha) => {
    if (!fecha) return;

    // Convertir fecha a string YYYY-MM-DD
    const fechaStr = fecha.toISOString().split('T')[0];

    // Verificar que la fecha esté en el rango del periodo
    if (rangoPeriodo.min && rangoPeriodo.max) {
      if (fecha < rangoPeriodo.min || fecha > rangoPeriodo.max) {
        return; // Fecha fuera del rango
      }
    }

    // Verificar límite de turnos
    const conteoActual = fechasSeleccionadas.filter((f) => f.turno === tipoTurno).length;
    const limiteActual = tipoTurno === "MANANA" ? turnoManana : turnoTarde;
    
    const idFecha = `${fechaStr}-${tipoTurno}`;
    const yaExiste = fechasSeleccionadas.some((f) => f.id === idFecha);
    
    // Si ya existe, eliminarla (toggle)
    if (yaExiste) {
      setFechasSeleccionadas(fechasSeleccionadas.filter((f) => f.id !== idFecha));
      return;
    }
    
    // Si se alcanzó el límite, no agregar
    if (conteoActual >= limiteActual) {
      return;
    }

    const nueva = {
      fecha: fechaStr,
      turno: tipoTurno,
      id: idFecha,
    };

    setFechasSeleccionadas([...fechasSeleccionadas, nueva]);
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
  
  // Verificar si una fecha está seleccionada
  const estaSeleccionada = (fecha, turno) => {
    if (!fecha) return false;
    const fechaStr = fecha.toISOString().split('T')[0];
    return fechasSeleccionadas.some(f => f.fecha === fechaStr && f.turno === turno);
  };

  // Verificar si una fecha está fuera del rango
  const estaFueraDeRango = (fecha) => {
    if (!fecha || !rangoPeriodo.min || !rangoPeriodo.max) return false;
    return fecha < rangoPeriodo.min || fecha > rangoPeriodo.max;
  };

  // Verificar si se alcanzó el límite
  const limiteAlcanzado = tipoTurno === "MANANA" 
    ? fechasManana >= turnoManana 
    : fechasTarde >= turnoTarde;

  // Obtener nombre del mes del periodo
  const nombreMesPeriodo = useMemo(() => {
    if (!periodo?.periodo) return '';
    const periodoStr = String(periodo.periodo);
    const mes = parseInt(periodoStr.substring(4, 6)) - 1;
    const anio = periodoStr.substring(0, 4);
    return `${getNombreMes(mes)} ${anio}`;
  }, [periodo]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-5xl my-8 overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200">
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

          <div className="p-3 grid grid-cols-2 gap-4">
            {/* COLUMNA IZQUIERDA: Controles y Calendario */}
            <div className="space-y-2">
              {/* Botones Mañana/Tarde */}
              <div>
                <h3 className="font-bold text-slate-800 text-xs mb-1.5">Selecciona el tipo de turno</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoTurno("MANANA")}
                    className={`py-1.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 transition-all ${
                      tipoTurno === "MANANA"
                        ? "bg-orange-500 text-white shadow-lg"
                        : "bg-orange-50 text-orange-600 border-2 border-orange-200"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    Mañana
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoTurno("TARDE")}
                    className={`py-1.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 transition-all ${
                      tipoTurno === "TARDE"
                        ? "bg-purple-500 text-white shadow-lg"
                        : "bg-purple-50 text-purple-600 border-2 border-purple-200"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    Tarde
                  </button>
                </div>
              </div>

              {/* Alerta de límite alcanzado */}
              {limiteAlcanzado && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-1.5">
                  <p className="text-[10px] text-red-800 font-semibold flex items-center gap-1.5">
                    <span>⚠️</span>
                    Límite alcanzado para turnos de {tipoTurno === "MANANA" ? "Mañana" : "Tarde"} ({tipoTurno === "MANANA" ? turnoManana : turnoTarde})
                  </p>
                </div>
              )}

              {/* Calendario */}
              <div>
                <h3 className="font-bold text-slate-800 text-xs mb-1.5">Calendario - {nombreMesPeriodo}</h3>
                <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-2 border border-blue-200">
                  {/* Header del calendario */}
                  <div className="text-center mb-1.5">
                    <h4 className="font-bold text-slate-800 text-xs">
                      {nombreMesPeriodo}
                    </h4>
                    <p className="text-[9px] text-slate-500">Periodo {periodo?.descripcion}</p>
                  </div>

                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {DIAS_SEMANA.map((dia) => (
                      <div key={dia} className="text-center text-[9px] font-bold text-slate-500 py-0.5">
                        {dia}
                      </div>
                    ))}
                  </div>

                  {/* Días del mes */}
                  <div className="grid grid-cols-7 gap-0.5">
                    {diasDelMes.map((fecha, index) => {
                      if (!fecha) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                      }

                      const fueraDeRango = estaFueraDeRango(fecha);
                      const seleccionadaManana = estaSeleccionada(fecha, "MANANA");
                      const seleccionadaTarde = estaSeleccionada(fecha, "TARDE");
                      const ambosSeleccionados = seleccionadaManana && seleccionadaTarde;
                      const algunoSeleccionado = seleccionadaManana || seleccionadaTarde;
                      
                      let claseBoton = "w-full aspect-square rounded text-[10px] font-semibold transition-all ";
                      
                      if (fueraDeRango) {
                        claseBoton += "bg-gray-100 text-gray-300 cursor-not-allowed";
                      } else if (ambosSeleccionados) {
                        claseBoton += "bg-gradient-to-br from-orange-500 to-purple-500 text-white shadow-md border-2 border-white";
                      } else if (seleccionadaManana) {
                        claseBoton += "bg-orange-500 text-white shadow-md hover:shadow-lg";
                      } else if (seleccionadaTarde) {
                        claseBoton += "bg-purple-500 text-white shadow-md hover:shadow-lg";
                      } else if (limiteAlcanzado) {
                        claseBoton += "bg-white text-slate-400 cursor-not-allowed border border-slate-200";
                      } else {
                        claseBoton += "bg-white text-slate-700 hover:bg-blue-100 hover:border-blue-300 border border-slate-200 cursor-pointer";
                      }

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => !fueraDeRango && agregarFecha(fecha)}
                          disabled={fueraDeRango || (limiteAlcanzado && !algunoSeleccionado)}
                          className={claseBoton}
                        >
                          {fecha.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Leyenda */}
                  <div className="mt-1.5 pt-1.5 border-t border-blue-200 flex flex-wrap gap-1.5 text-[9px]">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded bg-orange-500"></div>
                      <span className="text-slate-600">Mañana</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded bg-purple-500"></div>
                      <span className="text-slate-600">Tarde</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded bg-gradient-to-br from-orange-500 to-purple-500"></div>
                      <span className="text-slate-600">Ambos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Badges y Fechas Seleccionadas */}
            <div className="space-y-2">
              {/* Tarjetas de resumen EN UNA FILA */}
              <div>
                <h3 className="font-bold text-slate-800 text-xs mb-1.5">Resumen de turnos</h3>
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
                      <span className={`text-2xl font-bold ${
                        fechasManana >= turnoManana ? 'text-red-600' : 'text-orange-600'
                      }`}>{fechasManana}</span>
                      <span className={`text-sm ${
                        fechasManana >= turnoManana ? 'text-red-500' : 'text-orange-500'
                      }`}>/ {turnoManana}</span>
                    </div>
                    <p className={`text-[9px] mt-0.5 font-semibold ${
                      fechasManana >= turnoManana ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {fechasManana >= turnoManana ? '⚠️ Límite' : `${turnoManana - fechasManana} disp.`}
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
                      <span className={`text-2xl font-bold ${
                        fechasTarde >= turnoTarde ? 'text-red-600' : 'text-purple-600'
                      }`}>{fechasTarde}</span>
                      <span className={`text-sm ${
                        fechasTarde >= turnoTarde ? 'text-red-500' : 'text-purple-500'
                      }`}>/ {turnoTarde}</span>
                    </div>
                    <p className={`text-[9px] mt-0.5 font-semibold ${
                      fechasTarde >= turnoTarde ? 'text-red-600' : 'text-purple-600'
                    }`}>
                      {fechasTarde >= turnoTarde ? '⚠️ Límite' : `${turnoTarde - fechasTarde} disp.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fechas seleccionadas EN 2 COLUMNAS */}
              {fechasSeleccionadas.length > 0 ? (() => {
                const fechasMananaList = fechasSeleccionadas.filter(f => f.turno === "MANANA");
                const fechasTardeList = fechasSeleccionadas.filter(f => f.turno === "TARDE");
                
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-xs">Fechas Seleccionadas</h3>
                      <span className="bg-[#0A5BA9] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {fechasSeleccionadas.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                      {/* Columna Izquierda: Turno Mañana */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 bg-orange-100 px-2 py-1.5 rounded-lg sticky top-0 z-10">
                          <Sun className="w-3.5 h-3.5 text-orange-600" />
                          <span className="text-[10px] font-bold text-orange-700 uppercase">Turno Mañana</span>
                          <span className="ml-auto bg-orange-600 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                            {fechasMananaList.length}
                          </span>
                        </div>
                        {fechasMananaList.length > 0 ? (
                          fechasMananaList.map((f) => (
                            <div
                              key={f.id}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-all"
                            >
                              <div className="flex items-center gap-1.5">
                                <Sun className="w-3 h-3 text-orange-600" />
                                <p className="text-[11px] font-semibold text-slate-800">
                                  {new Date(f.fecha + "T00:00:00").toLocaleDateString("es-ES", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => eliminarFecha(f.id)}
                                className="p-0.5 text-red-500 hover:bg-red-50 rounded transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-[9px] text-slate-400 text-center py-4 italic">Sin fechas</p>
                        )}
                      </div>

                      {/* Columna Derecha: Turno Tarde */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 bg-purple-100 px-2 py-1.5 rounded-lg sticky top-0 z-10">
                          <Moon className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-[10px] font-bold text-purple-700 uppercase">Turno Tarde</span>
                          <span className="ml-auto bg-purple-600 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                            {fechasTardeList.length}
                          </span>
                        </div>
                        {fechasTardeList.length > 0 ? (
                          fechasTardeList.map((f) => (
                            <div
                              key={f.id}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-all"
                            >
                              <div className="flex items-center gap-1.5">
                                <Moon className="w-3 h-3 text-purple-600" />
                                <p className="text-[11px] font-semibold text-slate-800">
                                  {new Date(f.fecha + "T00:00:00").toLocaleDateString("es-ES", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => eliminarFecha(f.id)}
                                className="p-0.5 text-red-500 hover:bg-red-50 rounded transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-[9px] text-slate-400 text-center py-4 italic">Sin fechas</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="text-center py-6 text-slate-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No hay fechas seleccionadas</p>
                  <p className="text-[10px]">Haz clic en el calendario</p>
                </div>
              )}
            </div>
          </div>

          {/* Loading state superpuesto */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#0A5BA9] mb-3" />
                <p className="text-slate-600">Cargando fechas registradas...</p>
              </div>
            </div>
          )}

          {/* Botones Cancelar y Guardar */}
          <div className="p-2.5 border-t border-slate-200 bg-slate-50">
            <div className="flex gap-2">
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
