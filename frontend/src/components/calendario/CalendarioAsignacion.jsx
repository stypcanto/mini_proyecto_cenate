/**
 * 📅 CalendarioAsignacion.jsx - Calendario Profesional de Asignaciones
 *
 * Componente calendario visual que:
 * - Muestra días con pacientes asignados marcados con badges
 * - Permite selección intuitiva de fechas
 * - Integra con MisPacientes para filtrar por fecha específica
 *
 * @version v1.66.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

function CalendarioAsignacion({
  fechaSeleccionada,
  onFechaChange,
  fechasConAsignaciones = {},
}) {
  const [mesActual, setMesActual] = useState(new Date());
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const calendarRef = useRef(null);

  // Cerrar calendario cuando se hace click fuera
  useEffect(() => {
    const handleClickAfuera = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setCalendarioAbierto(false);
      }
    };

    if (calendarioAbierto) {
      document.addEventListener('mousedown', handleClickAfuera);
      return () => document.removeEventListener('mousedown', handleClickAfuera);
    }
  }, [calendarioAbierto]);

  /**
   * Genera array de días del mes con información útil
   */
  const generarDiasDelMes = () => {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const primerDiaSemana = primerDia.getDay();

    const hoy = new Date().toISOString().split('T')[0];
    const dias = [];

    // Días en blanco del mes anterior
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push({ numero: null, valido: false, fecha: null });
    }

    // Días del mes actual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const fecha = `${año}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      dias.push({
        numero: i,
        fecha,
        valido: true,
        esHoy: fecha === hoy,
      });
    }

    return dias;
  };

  /**
   * Obtiene la cantidad de pacientes para un día específico
   */
  const getPacientesPorDia = (fecha) => {
    return fechasConAsignaciones[fecha] || 0;
  };

  /**
   * Cambia el mes mostrado en el calendario
   */
  const cambiarMes = (incremento) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + incremento, 1));
  };

  /**
   * Formatea la fecha seleccionada para mostrar en el botón
   */
  const formatearFechaBoton = (fecha) => {
    if (!fecha) return 'Seleccionar fecha';
    const [año, mes, día] = fecha.split('-');
    const date = new Date(año, mes - 1, día);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const dias = generarDiasDelMes();
  const nombreMes = mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="relative" ref={calendarRef}>
      {/* Botón para abrir calendario */}
      <button
        onClick={() => setCalendarioAbierto(!calendarioAbierto)}
        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all shadow-sm hover:border-slate-400 flex items-center gap-2 text-left text-gray-700 font-medium"
      >
        <Calendar className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="flex-1">
          {fechaSeleccionada ? formatearFechaBoton(fechaSeleccionada) : 'Seleccionar fecha'}
        </span>
        {calendarioAbierto ? (
          <ChevronLeft className="w-4 h-4 text-gray-500 transform rotate-90" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Calendario flotante */}
      {calendarioAbierto && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white shadow-lg rounded-lg p-4 w-full sm:w-80 border border-gray-200">
          {/* Header: Navegación de meses */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => cambiarMes(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {nombreMes}
              </p>
            </div>
            <button
              onClick={() => cambiarMes(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Grid de encabezados de días semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
              <div
                key={dia}
                className="text-center text-xs font-semibold text-gray-500 py-2"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Grid de días del mes */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dias.map((dia, idx) => {
              if (!dia.valido) {
                return (
                  <div key={`empty-${idx}`} className="p-2"></div>
                );
              }

              const cantidadPacientes = getPacientesPorDia(dia.fecha);
              const tienePacientes = cantidadPacientes > 0;
              const estaSeleccionado = dia.fecha === fechaSeleccionada;
              const esHoy = dia.esHoy;

              return (
                <button
                  key={dia.fecha}
                  onClick={() => {
                    onFechaChange(dia.fecha);
                    setCalendarioAbierto(false);
                  }}
                  className={`
                    relative p-2 rounded-lg text-sm font-medium transition-all
                    ${
                      estaSeleccionado
                        ? 'bg-[#0A5BA9] text-white shadow-md'
                        : esHoy && !estaSeleccionado
                        ? 'border-2 border-[#0A5BA9] text-gray-900 bg-blue-50'
                        : tienePacientes
                        ? 'bg-blue-50 text-gray-900 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  title={
                    tienePacientes
                      ? `${cantidadPacientes} paciente${cantidadPacientes > 1 ? 's' : ''} asignado${cantidadPacientes > 1 ? 's' : ''}`
                      : 'Sin pacientes asignados'
                  }
                >
                  <span>{dia.numero}</span>
                  {tienePacientes && !estaSeleccionado && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-[#0A5BA9] rounded-full transform translate-x-1 -translate-y-1">
                      {cantidadPacientes > 9 ? '9+' : cantidadPacientes}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer: Botones de acción */}
          <div className="flex gap-2 justify-end border-t border-gray-200 pt-3">
            <button
              onClick={() => {
                onFechaChange(null);
                setCalendarioAbierto(false);
              }}
              className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={() => {
                const hoy = new Date().toISOString().split('T')[0];
                onFechaChange(hoy);
                setCalendarioAbierto(false);
              }}
              className="px-3 py-2 text-xs font-medium text-white bg-[#0A5BA9] hover:bg-[#083d78] rounded-lg transition-colors"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarioAsignacion;
