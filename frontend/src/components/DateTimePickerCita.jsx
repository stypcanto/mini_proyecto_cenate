/**
 * DateTimePickerCita - Date/Time Picker Profesional para Citas Médicas
 * Requisitos:
 * - Bloquear fechas pasadas
 * - Entrada manual con máscara DD/MM/AAAA
 * - Intervalos de 15 minutos para hora
 * - Validación de disponibilidad async
 * - Custom styling (azul corporativo)
 * - Z-index correcto
 */

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const HORAS = [
  "08:00", "08:15", "08:30", "08:45",
  "09:00", "09:15", "09:30", "09:45",
  "10:00", "10:15", "10:30", "10:45",
  "11:00", "11:15", "11:30", "11:45",
  "12:00", "12:15", "12:30", "12:45",
  "13:00", "13:15", "13:30", "13:45",
  "14:00", "14:15", "14:30", "14:45",
  "15:00", "15:15", "15:30", "15:45",
  "16:00", "16:15", "16:30", "16:45",
  "17:00", "17:15", "17:30", "17:45",
];

export default function DateTimePickerCita({
  value = "",
  onChange = () => {},
  disabled = false,
  idMedico = null,
  onValidationChange = () => {},
}) {
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarHoras, setMostrarHoras] = useState(false);
  const [fechaInput, setFechaInput] = useState("");
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [mesActual, setMesActual] = useState(new Date());
  const [validacionError, setValidacionError] = useState("");
  const [validando, setValidando] = useState(false);
  const containerRef = useRef(null);
  const calendarRef = useRef(null);

  // Parse value en formato "YYYY-MM-DDTHH:mm"
  useEffect(() => {
    if (value) {
      const [fecha, hora] = value.split("T");
      if (fecha) {
        const [año, mes, día] = fecha.split("-");
        setFechaInput(`${día}/${mes}/${año}`);
      }
      if (hora) {
        setHoraSeleccionada(hora);
      }
    } else {
      setFechaInput("");
      setHoraSeleccionada("");
    }
  }, [value]);

  // Cerrar calendarios al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setMostrarCalendario(false);
        setMostrarHoras(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Formatear entrada con máscara DD/MM/AAAA
  const handleFechaInput = (e) => {
    let valor = e.target.value.replace(/\D/g, "");

    if (valor.length <= 2) {
      setFechaInput(valor);
    } else if (valor.length <= 4) {
      setFechaInput(`${valor.slice(0, 2)}/${valor.slice(2)}`);
    } else {
      setFechaInput(`${valor.slice(0, 2)}/${valor.slice(2, 4)}/${valor.slice(4, 8)}`);
    }
  };

  // Convertir DD/MM/AAAA a Date
  const parseFecha = (str) => {
    const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return null;
    const [, día, mes, año] = match;
    return new Date(parseInt(año), parseInt(mes) - 1, parseInt(día));
  };

  // Validar fecha pasada
  const esFechaPasada = (fecha) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha < hoy;
  };

  // Validar disponibilidad del médico (async)
  const validarDisponibilidad = async (fecha, hora) => {
    if (!idMedico || !fecha || !hora) return true;

    setValidando(true);
    try {
      const response = await fetch(
        `/api/citas/validar-disponibilidad/${idMedico}?fecha=${fecha}&hora=${hora}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (!data.disponible) {
          setValidacionError(`❌ Médico no disponible a las ${hora}`);
          onValidationChange(false);
          return false;
        }
      }
      setValidacionError("");
      onValidationChange(true);
      return true;
    } catch (error) {
      console.error("Error validando disponibilidad:", error);
      // En caso de error, permitir continuar
      setValidacionError("");
      onValidationChange(true);
      return true;
    } finally {
      setValidando(false);
    }
  };

  // Seleccionar fecha del calendario
  const seleccionarFecha = async (día) => {
    const nuevaFecha = new Date(mesActual);
    nuevaFecha.setDate(día);

    // Validar fecha pasada
    if (esFechaPasada(nuevaFecha)) {
      toast.error("No se pueden agendar citas en fechas pasadas");
      return;
    }

    const año = nuevaFecha.getFullYear();
    const mes = String(nuevaFecha.getMonth() + 1).padStart(2, "0");
    const día_str = String(día).padStart(2, "0");

    setFechaInput(`${día_str}/${mes}/${año}`);
    setMostrarCalendario(false);

    // Si hay hora seleccionada, validar disponibilidad
    if (horaSeleccionada) {
      await validarDisponibilidad(`${año}-${mes}-${día_str}`, horaSeleccionada);
    }
  };

  // Seleccionar hora
  const seleccionarHora = async (hora) => {
    const fecha = parseFecha(fechaInput);
    if (!fecha) {
      toast.error("Selecciona una fecha primero");
      return;
    }

    setHoraSeleccionada(hora);
    setMostrarHoras(false);

    // Validar disponibilidad
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const día = String(fecha.getDate()).padStart(2, "0");

    const disponible = await validarDisponibilidad(
      `${año}-${mes}-${día}`,
      hora
    );

    if (disponible) {
      // Emitir valor al padre
      onChange(`${año}-${mes}-${día}T${hora}`);
    }
  };

  // Generar días del calendario
  const generarDíasCalendario = () => {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    const primerDía = new Date(año, mes, 1);
    const últimoDía = new Date(año, mes + 1, 0);
    const diasDelMes = [];

    // Días vacíos antes del primer día
    for (let i = 0; i < primerDía.getDay(); i++) {
      diasDelMes.push(null);
    }

    // Días del mes
    for (let i = 1; i <= últimoDía.getDate(); i++) {
      diasDelMes.push(i);
    }

    return diasDelMes;
  };

  const diasCalendario = generarDíasCalendario();
  const fecha = parseFecha(fechaInput);
  const esHoy = fecha && fecha.toDateString() === new Date().toDateString();

  return (
    <div ref={containerRef} className="relative">
      {/* CÁPSULA UNIFICADA: Fecha + Hora */}
      <div
        className={`flex items-center border-2 rounded-lg transition-all ${
          validacionError
            ? "border-red-500 bg-red-50"
            : disabled
            ? "border-gray-300 bg-gray-100"
            : "border-blue-400 focus-within:ring-2 focus-within:ring-blue-500"
        }`}
      >
        {/* FECHA - Lado Izquierdo */}
        <div className="flex-1 flex items-center relative px-3">
          <Calendar className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={fechaInput}
            onChange={handleFechaInput}
            placeholder="DD/MM/AAAA"
            disabled={disabled}
            onFocus={() => !disabled && setMostrarCalendario(true)}
            className={`w-full pl-7 pr-2 py-2 text-sm focus:outline-none ${
              fechaInput
                ? "bg-white text-gray-900"
                : "bg-gray-50 text-gray-400"
            } ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : ""}`}
            maxLength="10"
          />
        </div>

        {/* SEPARADOR VERTICAL */}
        <div className="h-6 w-px bg-gray-300"></div>

        {/* HORA - Lado Derecho */}
        <div className="w-24 px-3">
          <button
            type="button"
            disabled={disabled || !fecha}
            onClick={() => !disabled && setMostrarHoras(!mostrarHoras)}
            className={`w-full py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors focus:outline-none ${
              disabled || !fecha
                ? "text-gray-400 cursor-not-allowed"
                : horaSeleccionada
                ? "text-gray-900 hover:text-blue-700"
                : "text-gray-500 hover:text-blue-600"
            }`}
            title={fecha ? "Seleccionar hora (intervalos de 15 min)" : "Selecciona fecha primero"}
          >
            <Clock className="w-4 h-4" strokeWidth={2} />
            <span className="font-semibold">{horaSeleccionada || "--:--"}</span>
          </button>
        </div>
      </div>

      {/* MENSAJE DE ERROR */}
      {validacionError && (
        <div className="absolute top-full left-0 mt-2 bg-red-100 border border-red-500 text-red-700 text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg z-40">
          ❌ {validacionError}
        </div>
      )}

      {/* Calendario Flotante */}
      {mostrarCalendario && !disabled && (
        <div
          ref={calendarRef}
          className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50"
          style={{ minWidth: "320px" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() =>
                setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1))
              }
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-semibold text-sm">
              {mesActual.toLocaleDateString("es-PE", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={() =>
                setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1))
              }
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((día) => (
              <div key={día} className="text-center text-xs font-bold text-gray-600 h-8 flex items-center justify-center">
                {día}
              </div>
            ))}
          </div>

          {/* Días */}
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
                    !día
                      ? ""
                      : esPasado
                      ? "text-gray-300 cursor-not-allowed"
                      : esSeleccionado
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "hover:bg-blue-100 text-gray-700"
                  }`}
                >
                  {día}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selector de Horas */}
      {mostrarHoras && !disabled && fecha && (
        <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50" style={{ maxWidth: "200px" }}>
          <h4 className="text-xs font-bold text-gray-700 mb-2">Intervalos de 15 min</h4>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {HORAS.map((hora) => (
              <button
                key={hora}
                onClick={() => seleccionarHora(hora)}
                disabled={validando}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                  horaSeleccionada === hora
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                } disabled:opacity-50`}
              >
                {hora}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Indicador de Validación */}
      {validando && (
        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          Validando disponibilidad...
        </div>
      )}
    </div>
  );
}
