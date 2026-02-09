// ========================================================================
// ModalHorarioTeleconsultorio.jsx - Modal para configurar horarios de teleconsultorio
// ------------------------------------------------------------------------
// Permite configurar los días y horarios específicos para teleconsultorio
// ========================================================================

import React, { useState, useEffect, useMemo } from "react";
import { X, Clock, Info, Calendar } from "lucide-react";

const DIAS_SEMANA = [
  { id: 'LUN', nombre: 'LUN', nombreCompleto: 'Lunes' },
  { id: 'MAR', nombre: 'MAR', nombreCompleto: 'Martes' },
  { id: 'MIE', nombre: 'MIÉ', nombreCompleto: 'Miércoles' },
  { id: 'JUE', nombre: 'JUE', nombreCompleto: 'Jueves' },
  { id: 'VIE', nombre: 'VIE', nombreCompleto: 'Viernes' },
  { id: 'SAB', nombre: 'SÁB', nombreCompleto: 'Sábado' },
  { id: 'DOM', nombre: 'DOM', nombreCompleto: 'Domingo' }
];

const HORARIOS_MANANA = [
  '8:00', '9:00', '10:00', '11:00', '12:00', '13:00'
];

const HORARIOS_TARDE = [
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

/**
 * Modal para configurar horarios de teleconsultorio
 * @param {Object} props
 * @param {Boolean} props.open - Si el modal está abierto
 * @param {Function} props.onClose - Callback al cerrar
 * @param {String} props.especialidad - Nombre de la especialidad
 * @param {Object} props.horariosIniciales - Horarios previamente configurados
 * @param {Function} props.onConfirm - Callback al confirmar (recibe configuración de horarios)
 */
export default function ModalHorarioTeleconsultorio({
  open,
  onClose,
  especialidad = "",
  horariosIniciales = null,
  onConfirm = () => {},
}) {
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [tipoHorario, setTipoHorario] = useState("laborables"); // laborables | todos
  const [horariosManana, setHorariosManana] = useState([]);
  const [horariosTarde, setHorariosTarde] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    if (open && horariosIniciales) {
      setDiasSeleccionados(horariosIniciales.dias || []);
      setTipoHorario(horariosIniciales.tipo || "laborables");
      setHorariosManana(horariosIniciales.horariosManana || []);
      setHorariosTarde(horariosIniciales.horariosTarde || []);
    } else if (open) {
      // Reset al abrir - por defecto seleccionar lunes a viernes
      setDiasSeleccionados(['LUN', 'MAR', 'MIE', 'JUE', 'VIE']);
      setTipoHorario("laborables");
      setHorariosManana([]);
      setHorariosTarde([]);
    }
  }, [open, horariosIniciales]);

  // Días disponibles según el tipo
  const diasDisponibles = useMemo(() => {
    // Siempre mostrar todos los días
    return DIAS_SEMANA;
  }, []);

  // Auto-seleccionar días cuando cambia el tipo
  useEffect(() => {
    if (tipoHorario === "laborables") {
      setDiasSeleccionados(['LUN', 'MAR', 'MIE', 'JUE', 'VIE']);
    }
    // En modo "todos", mantener la selección actual sin cambiarla
  }, [tipoHorario]);

  // Toggle día
  const toggleDia = (diaId) => {
    setDiasSeleccionados(prev => 
      prev.includes(diaId) 
        ? prev.filter(d => d !== diaId)
        : [...prev, diaId]
    );
  };

  // Toggle horario mañana
  const toggleHorarioManana = (horario) => {
    setHorariosManana(prev => 
      prev.includes(horario) 
        ? prev.filter(h => h !== horario)
        : [...prev, horario]
    );
  };

  // Toggle horario tarde
  const toggleHorarioTarde = (horario) => {
    setHorariosTarde(prev => 
      prev.includes(horario) 
        ? prev.filter(h => h !== horario)
        : [...prev, horario]
    );
  };

  // Seleccionar todos los horarios de mañana
  const seleccionarTodosManana = () => {
    setHorariosManana([...HORARIOS_MANANA]);
  };

  // Deseleccionar todos los horarios de mañana
  const deseleccionarTodosManana = () => {
    setHorariosManana([]);
  };

  // Seleccionar todos los horarios de tarde
  const seleccionarTodosTarde = () => {
    setHorariosTarde([...HORARIOS_TARDE]);
  };

  // Deseleccionar todos los horarios de tarde
  const deseleccionarTodosTarde = () => {
    setHorariosTarde([]);
  };

  // Calcular total de horas
  const totalHoras = useMemo(() => {
    return (horariosManana.length + horariosTarde.length) * diasSeleccionados.length;
  }, [horariosManana.length, horariosTarde.length, diasSeleccionados.length]);

  // Validar que hay selecciones
  const esValido = diasSeleccionados.length > 0 && (horariosManana.length > 0 || horariosTarde.length > 0);

  const handleConfirmar = () => {
    if (!esValido) return;

    const configuracion = {
      especialidad,
      dias: diasSeleccionados,
      tipo: tipoHorario,
      horariosManana,
      horariosTarde,
      totalHoras,
      resumen: {
        diasTexto: diasSeleccionados.map(id => DIAS_SEMANA.find(d => d.id === id)?.nombre).join(', '),
        horasManana: horariosManana.length,
        horasTarde: horariosTarde.length,
        rangoManana: horariosManana.length > 0 ? `8:00 - ${horariosManana.length >= 6 ? '14:00' : '13:00'}` : null,
        rangoTarde: horariosTarde.length > 0 ? `14:00 - ${horariosTarde.length >= 6 ? '20:00' : '19:00'}` : null
      }
    };

    onConfirm(configuracion);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Horario Teleconsultorio</h2>
              <p className="text-blue-100 text-sm">{especialidad}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Instrucciones</h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Selecciona las horas específicas en las que prestarás atención de <span className="font-semibold">Teleconsultorio</span>. 
                  Puedes elegir horas individuales o seleccionar turnos completos.
                </p>
              </div>
            </div>
          </div>

          {/* Días de Atención */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0A5BA9]" />
                Días de Atención
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTipoHorario("laborables")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    tipoHorario === "laborables"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Laborables
                </button>
                <button
                  type="button"
                  onClick={() => setTipoHorario("todos")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    tipoHorario === "todos"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Todos
                </button>
              </div>
            </div>

            {/* Botones de días */}
            <div className="grid grid-cols-7 gap-2">
              {diasDisponibles.map(dia => {
                const esFinDeSemana = ['SAB', 'DOM'].includes(dia.id);
                const estaDeshabilitado = tipoHorario === "laborables" && esFinDeSemana;
                
                return (
                  <button
                    key={dia.id}
                    type="button"
                    onClick={() => !estaDeshabilitado && toggleDia(dia.id)}
                    disabled={estaDeshabilitado}
                    className={`py-2 px-1 rounded-lg font-bold text-sm transition-all ${
                      diasSeleccionados.includes(dia.id)
                        ? "bg-[#5B73E8] text-white shadow-lg"
                        : estaDeshabilitado
                        ? "bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <div className="text-xs">{dia.nombre}</div>
                    <div className="text-[10px] opacity-75">{dia.nombreCompleto.slice(0, 3)}</div>
                  </button>
                );
              })}}
            </div>

            {/* Contador días seleccionados */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                ✓ {diasSeleccionados.length} días seleccionados
              </span>
            </div>
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-4">
            {/* Solo Mañana */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-orange-800 flex items-center gap-2">
                  ☀️ Solo Mañana
                </h3>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={seleccionarTodosManana}
                    className="px-2 py-1 text-xs bg-orange-200 text-orange-800 rounded hover:bg-orange-300 transition-colors"
                  >
                    Seleccionar Todo
                  </button>
                  <button
                    type="button"
                    onClick={deseleccionarTodosManana}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Deseleccionar
                  </button>
                </div>
              </div>
              <p className="text-orange-700 text-sm mb-3">8:00 AM - 2:00 PM</p>
              
              <div className="grid grid-cols-3 gap-2">
                {HORARIOS_MANANA.map(horario => (
                  <button
                    key={horario}
                    type="button"
                    onClick={() => toggleHorarioManana(horario)}
                    className={`py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                      horariosManana.includes(horario)
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-white text-orange-600 border border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    {horario}
                    {horariosManana.includes(horario) && <span className="ml-1">✓</span>}
                  </button>
                ))}
              </div>
              
              <div className="mt-3 text-center">
                <span className="text-sm font-semibold text-orange-700">
                  ✓ {horariosManana.length} horas seleccionadas
                </span>
              </div>
            </div>

            {/* Solo Tarde */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-purple-800 flex items-center gap-2">
                  🌙 Solo Tarde
                </h3>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={seleccionarTodosTarde}
                    className="px-2 py-1 text-xs bg-purple-200 text-purple-800 rounded hover:bg-purple-300 transition-colors"
                  >
                    Seleccionar Todo
                  </button>
                  <button
                    type="button"
                    onClick={deseleccionarTodosTarde}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Deseleccionar
                  </button>
                </div>
              </div>
              <p className="text-purple-700 text-sm mb-3">14:00 - 19:00</p>
              
              <div className="grid grid-cols-3 gap-2">
                {HORARIOS_TARDE.map(horario => (
                  <button
                    key={horario}
                    type="button"
                    onClick={() => toggleHorarioTarde(horario)}
                    className={`py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                      horariosTarde.includes(horario)
                        ? "bg-purple-500 text-white shadow-md"
                        : "bg-white text-purple-600 border border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    {horario}
                    {horariosTarde.includes(horario) && <span className="ml-1">✓</span>}
                  </button>
                ))}
              </div>
              
              <div className="mt-3 text-center">
                <span className="text-sm font-semibold text-purple-700">
                  ✓ {horariosTarde.length} horas seleccionadas
                </span>
              </div>
            </div>
          </div>

          {/* Resumen */}
          {(diasSeleccionados.length > 0 && (horariosManana.length > 0 || horariosTarde.length > 0)) && (
            <div className="bg-white border-2 border-green-300 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Resumen de Horarios Seleccionados</h3>
              </div>

              {/* Días */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-600 mb-3 text-sm tracking-wider">DÍAS DE ATENCIÓN</h4>
                <div className="flex flex-wrap gap-2">
                  {diasSeleccionados.map(diaId => {
                    const dia = DIAS_SEMANA.find(d => d.id === diaId);
                    return (
                      <span key={diaId} className="px-4 py-2 bg-[#5B73E8] text-white rounded-lg text-sm font-bold shadow-sm">
                        {dia.nombre}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Horarios */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {horariosManana.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-bold text-orange-600 mb-2 text-sm tracking-wider">SOLO MAÑANA</h4>
                    <p className="text-3xl font-bold text-orange-700 mb-1">{horariosManana.length} hrs</p>
                    <p className="text-sm text-gray-600">8:00 - 13:00</p>
                  </div>
                )}
                
                {horariosTarde.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-bold text-purple-600 mb-2 text-sm tracking-wider">SOLO TARDE</h4>
                    <p className="text-3xl font-bold text-purple-700 mb-1">{horariosTarde.length} hrs</p>
                    <p className="text-sm text-gray-600">14:00 - 19:00</p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="text-center">
                <p className="text-gray-600 mb-1">Total:</p>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {totalHoras} horas de atención
                </p>
                <p className="text-sm text-gray-500">durante {diasSeleccionados.length} días a la semana</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!esValido}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white rounded-lg font-semibold transition-all hover:from-[#0854A3] hover:to-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {esValido ? `Confirmar (${totalHoras} hrs)` : 'Selecciona horarios'}
          </button>
        </div>
      </div>
    </div>
  );
}