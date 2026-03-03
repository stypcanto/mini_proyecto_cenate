// ============================================================================
// 🕐 ModalNuevaSolicitud - Calendario de Turnos Médicos
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Loader, AlertCircle, ChevronLeft, ChevronRight, Calendar, User, Building2, Briefcase, FileText, Clock, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ModalNuevaSolicitud = ({ periodo, horario, onClose, onSuccess }) => {
  const { user } = useAuth();
  const isEditMode = !!horario;
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayTurnos, setDayTurnos] = useState({}); // Mapea fecha (YYYY-MM-DD) a código de turno
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [medicos, setMedicos] = useState([]);
  const [turnos, setTurnos] = useState([]); // Cargados desde API dim_horario

  // Mapa de colores construido dinámicamente desde los turnos cargados
  const TURNO_COLORES = {};
  turnos.forEach(t => {
    TURNO_COLORES[t.codigo] = {
      color: t.color || 'bg-blue-600',
      label: t.descHorario || t.descripcion,
      horas: t.horas
    };
  });
  
  const [showTurnosDropdown, setShowTurnosDropdown] = useState(false);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showTurnosDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowTurnosDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTurnosDropdown]);

  const [formData, setFormData] = useState({
    idPers: '',
    turnoCode: '',
    observaciones: isEditMode ? (horario?.observaciones || '') : '',
  });

  // Cargar datos iniciales al abrir
  useEffect(() => {
    if (periodo) {
      cargarDatos();
      setCurrentMonth(
        new Date(
          periodo?.periodo.substring(0, 4),
          parseInt(periodo?.periodo.substring(4, 6)) - 1,
          1
        )
      );
    }
  }, [periodo]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token') || localStorage.getItem('auth.token');
      const idArea = periodo?.idArea || user?.idArea;
      const idGrupoProg = user?.idGrupoProg || 1;

      // Cargar códigos de horario desde dim_horario (filtrados por área y grupo)
      const responseHorarios = await axios.get('/api/control-horarios/horarios/codigos', {
        params: { idArea, idGrupoProg },
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });

      const horariosData = (responseHorarios.data || [])
        .sort((a, b) => (a.ordenVisualizacion || 99) - (b.ordenVisualizacion || 99))
        .map(h => ({
          ...h,
          codigo: h.codHorarioVisual || h.codHorario,
          descripcion: h.descHorario,
        }));
      setTurnos(horariosData);

      console.log(`📋 Códigos de horario cargados: ${horariosData.length} (idArea=${idArea}, idGrupoProg=${idGrupoProg})`);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar códigos de horario');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day) => {
    if (day) {
      const fecha = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      setSelectedDate(fecha);
      setShowTurnosDropdown(true); // Abre el dropdown de turnos
    }
  };

  // Obtener clave de fecha en formato YYYY-MM-DD
  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleTurnoSelect = (codigo) => {
    if (selectedDate) {
      const dateKey = getDateKey(selectedDate);
      setDayTurnos(prev => ({
        ...prev,
        [dateKey]: codigo
      }));
      setFormData(prev => ({
        ...prev,
        turnoCode: codigo
      }));
      setShowTurnosDropdown(false); // Cierra el dropdown después de seleccionar
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate) {
      setError('Por favor selecciona una fecha en el calendario');
      return;
    }

    if (!dayTurnos[getDateKey(selectedDate)]) {
      setError('Por favor selecciona un código de turno');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth.token');
      const turnoSeleccionado = dayTurnos[getDateKey(selectedDate)];

      if (isEditMode) {
        // Modo edición: PUT
        const updateRequest = {
          turnosTotales: 1,
          horasTotales: 0,
          observaciones: `Turno: ${turnoSeleccionado} | Fecha: ${selectedDate.toLocaleDateString('es-PE')} ${formData.observaciones ? '| ' + formData.observaciones : ''}`,
        };

        const response = await axios.put(
          `/api/control-horarios/horarios/${horario.idCtrHorario}`,
          updateRequest,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          onSuccess();
          onClose();
        } else {
          setError(response.data.error || 'Error al actualizar solicitud');
        }
      } else {
        // Modo creación: POST
        const request = {
          periodo: periodo.periodo,
          idArea: periodo.idArea,
          idPers: user?.idPers,
          idGrupoProg: user?.idGrupoProg || 1,
          idServicio: user?.idServicio || null,
          idRegLab: user?.idRegLab || 1,
          turnosTotales: 1,
          horasTotales: 0,
          observaciones: `Turno: ${turnoSeleccionado} | Fecha: ${selectedDate.toLocaleDateString('es-PE')} ${formData.observaciones ? '| ' + formData.observaciones : ''}`,
        };

        const response = await axios.post('/api/control-horarios/horarios', request, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          onSuccess();
          onClose();
        } else {
          setError(response.data.error || 'Error al crear solicitud');
        }
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'actualizando' : 'creando'} solicitud:`, err);
      setError(err.response?.data?.error || `Error al ${isEditMode ? 'actualizar' : 'crear'} solicitud`);
    } finally {
      setLoading(false);
    }
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Calcular totales dinámicos desde los turnos asignados en el calendario
  const turnosTotales = Object.keys(dayTurnos).length;
  const horasTotales = Object.values(dayTurnos).reduce((sum, codigo) => {
    const horas = TURNO_COLORES[codigo]?.horas || 0;
    return sum + Number(horas);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 flex items-center justify-between border-b z-30 shadow-md">
          <h2 className="text-xl font-bold">{isEditMode ? 'Editar Horario del Mes' : 'Mi Horario del Mes'}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ========== LAYOUT 2 COLUMNAS ========== */}
            <div className="flex gap-6">

              {/* ===== COLUMNA IZQUIERDA: Información General ===== */}
              <div className="w-80 flex-shrink-0 space-y-4">

                {/* Card: Datos de la Solicitud */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Datos de la Solicitud
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Hash className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Nº Solicitud</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {isEditMode ? horario?.idCtrHorario : '(Nueva)'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Periodo</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {monthNames[parseInt(periodo?.periodo?.substring(4, 6)) - 1]} {periodo?.periodo?.substring(0, 4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Área</p>
                        <p className="text-sm text-gray-800">
                          {periodo?.descArea || `ID: ${periodo?.idArea}`}
                          <span className="text-xs text-gray-400 ml-1">({periodo?.idArea})</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges: Turnos y Horas */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-blue-200">
                    <div className="flex-1 bg-blue-600 text-white rounded-lg px-3 py-2 text-center">
                      <p className="text-2xl font-bold leading-tight">{turnosTotales}</p>
                      <p className="text-[10px] uppercase tracking-wider opacity-90">Turnos</p>
                    </div>
                    <div className="flex-1 bg-indigo-600 text-white rounded-lg px-3 py-2 text-center">
                      <p className="text-2xl font-bold leading-tight">{horasTotales}</p>
                      <p className="text-[10px] uppercase tracking-wider opacity-90">Horas</p>
                    </div>
                  </div>
                </div>

                {/* Card: Datos del Personal */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Médico</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {user?.nombreCompleto || user?.nombre || `ID: ${user?.idPers}`}
                          <span className="text-xs text-gray-400 font-normal ml-1">({user?.idPers})</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Régimen Laboral</p>
                        <p className="text-sm text-gray-800">
                          {user?.descRegLab || `ID: ${user?.idRegLab}`}
                          <span className="text-xs text-gray-400 ml-1">({user?.idRegLab})</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Servicio</p>
                        <p className="text-sm text-gray-800">
                          {user?.descServicio || `ID: ${user?.idServicio}`}
                          <span className="text-xs text-gray-400 ml-1">({user?.idServicio})</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card: Fechas */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Fechas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Fecha de Registro</p>
                        <p className="text-sm text-gray-800">
                          {isEditMode && horario?.createdAt
                            ? new Date(horario.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Fecha de Actualización</p>
                        <p className="text-sm text-gray-800">
                          {isEditMode && horario?.updatedAt
                            ? new Date(horario.updatedAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Observaciones
                  </h3>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                    placeholder="Notas adicionales..."
                    disabled={loading}
                  />
                </div>
              </div>

              {/* ===== COLUMNA DERECHA: Calendario ===== */}
              <div className="flex-1 min-w-0">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  {/* Navegación */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      disabled
                      className="p-2 rounded-lg transition opacity-30 cursor-not-allowed text-gray-400"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h3 className="text-3xl font-bold text-blue-600 text-center flex-1">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      disabled
                      className="p-2 rounded-lg transition opacity-30 cursor-not-allowed text-gray-400"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {dayNames.map(day => (
                      <div
                        key={day}
                        className="text-center font-bold text-gray-600 py-2 text-sm"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Días del mes */}
                  <div className="grid grid-cols-7 gap-2 relative">
                    {calendarDays.map((day, index) => (
                      <div key={index} className="relative">
                        {!day ? (
                          <div className="aspect-square" />
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDateClick(day)}
                              className={`
                                w-full aspect-square rounded-lg font-bold text-lg transition-all
                                flex flex-col items-center justify-center gap-1
                                ${
                                  selectedDate &&
                                  selectedDate.getDate() === day &&
                                  selectedDate.getMonth() === currentMonth.getMonth()
                                    ? 'bg-blue-50 text-blue-900 border-2 border-blue-500 shadow-md ring-2 ring-blue-200'
                                    : dayTurnos[getDateKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))]
                                      ? 'bg-gray-50 text-gray-900 border border-gray-300 hover:bg-gray-100'
                                      : 'bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100 hover:border-blue-300'
                                }
                              `}
                            >
                              <span className="text-base">{day}</span>
                              {dayTurnos[getDateKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))] && (
                                <span className={`${
                                  TURNO_COLORES[dayTurnos[getDateKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))]]?.color
                                } text-white px-2 py-0.5 rounded text-[10px] font-bold leading-tight`}>
                                  {dayTurnos[getDateKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))]}
                                </span>
                              )}
                            </button>

                            {/* Dropdown flotante de Turnos */}
                            {selectedDate &&
                              selectedDate.getDate() === day &&
                              selectedDate.getMonth() === currentMonth.getMonth() &&
                              showTurnosDropdown && (
                                <div ref={dropdownRef} className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border-2 border-blue-500 rounded-lg shadow-2xl z-50 w-72 max-h-80 overflow-y-auto">
                                  <div className="p-3 border-b border-gray-200 bg-blue-50 sticky top-0">
                                    <p className="text-sm font-semibold text-gray-800">Seleccionar turno:</p>
                                  </div>
                                  {turnos.filter(t => t.visibleMedico !== false).map((t) => (
                                    <button
                                      key={t.codigo}
                                      type="button"
                                      onClick={() => handleTurnoSelect(t.codigo)}
                                      className={`
                                        w-full px-4 py-2.5 text-left hover:bg-blue-50 transition
                                        flex items-center gap-3 border-b border-gray-100 last:border-b-0
                                        ${dayTurnos[getDateKey(selectedDate)] === t.codigo ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''}
                                      `}
                                    >
                                      <span
                                        className={`${
                                          TURNO_COLORES[t.codigo]?.color
                                        } text-white px-2 py-0.5 rounded text-xs font-bold min-w-fit`}
                                      >
                                        {t.codigo}
                                      </span>
                                      <span className="text-sm text-gray-700 flex-1">
                                        {t.descripcion}
                                      </span>
                                      {dayTurnos[getDateKey(selectedDate)] === t.codigo && (
                                        <span className="text-blue-600 text-lg font-bold">✓</span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* ========== FIN LAYOUT 2 COLUMNAS ========== */}

            {/* Leyenda de Códigos (ancho completo) */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Códigos de Horario
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(TURNO_COLORES).map(([codigo, info]) => (
                  <div key={codigo} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <span className={`${info.color} text-white px-2 py-0.5 rounded text-xs font-bold min-w-fit`}>
                      {codigo}
                    </span>
                    <span className="text-xs text-gray-700 flex-1">{info.label}</span>
                    {info.horas > 0 && (
                      <span className="text-[10px] text-gray-400 font-semibold bg-gray-100 px-1.5 py-0.5 rounded">{info.horas}h</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Horas por Código asignado */}
            {(() => {
              // Agrupar horas por código asignado en el calendario
              const codigoCount = {};
              Object.values(dayTurnos).forEach(codigo => {
                if (!codigo) return;
                if (!codigoCount[codigo]) codigoCount[codigo] = 0;
                codigoCount[codigo]++;
              });
              const codigos = Object.keys(codigoCount);
              if (codigos.length === 0) return null;
              return (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horas por Código:
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {codigos.map(codigo => {
                      const info = TURNO_COLORES[codigo];
                      const horasPorTurno = info?.horas || 0;
                      const totalHoras = Number(horasPorTurno) * codigoCount[codigo];
                      return (
                        <div key={codigo} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-blue-100">
                          <span className={`${info?.color || 'bg-gray-500'} text-white px-2 py-0.5 rounded text-xs font-bold min-w-fit`}>
                            {codigo}
                          </span>
                          <span className="text-sm text-gray-700 font-semibold">
                            = {totalHoras}h
                          </span>
                          {codigoCount[codigo] > 1 && (
                            <span className="text-[10px] text-gray-400">({codigoCount[codigo]}×{horasPorTurno}h)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Botones (ancho completo) */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={
                  loading || !selectedDate || !dayTurnos[getDateKey(selectedDate)] || !user?.idPers
                }
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold text-base flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                {isEditMode ? 'Actualizar Horario' : 'Guardar Horario'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-semibold text-base transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalNuevaSolicitud;
