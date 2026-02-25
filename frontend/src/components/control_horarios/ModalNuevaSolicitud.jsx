// ============================================================================
// 🕐 ModalNuevaSolicitud - Calendario de Turnos Médicos
// ============================================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const ModalNuevaSolicitud = ({ periodo, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayTurnos, setDayTurnos] = useState({}); // Mapea fecha (YYYY-MM-DD) a código de turno
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [medicos, setMedicos] = useState([]);

  // Códigos de turno con colores
  const TURNO_COLORES = {
    '200A': { color: 'bg-blue-600', label: '2 TURNOS REGULARES' },
    '131': { color: 'bg-blue-600', label: 'TURNO TARDE (2:00 P.M. - 8:00 P.M.)' },
    '158': { color: 'bg-yellow-500', label: 'TURNO MAÑANA (8:00 A.M. - 2:00 P.M.)' },
    '002': { color: 'bg-green-600', label: 'VACACIONES' },
    '004': { color: 'bg-gray-400', label: 'LIBRE' },
    'L': { color: 'bg-purple-600', label: 'LICENCIA OTROS' },
    'C': { color: 'bg-red-600', label: 'CUMPLEAÑOS' },
    'O': { color: 'bg-pink-600', label: 'ONOMÁSTICO' },
    'DM': { color: 'bg-red-700', label: 'DESCANSO MÉDICO' },
  };

  // Turnos hardcodeados (luego vendrán de API)
  const turnos = Object.keys(TURNO_COLORES).map(codigo => ({
    codigo,
    descripcion: TURNO_COLORES[codigo].label
  }));
  
  const [showTurnosDropdown, setShowTurnosDropdown] = useState(false);

  const [formData, setFormData] = useState({
    idPers: '',
    turnoCode: '',
    observaciones: '',
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

      // Cargar médicos/personal
      const responseMedicos = await axios.get('/api/personal', {
        params: { idArea: periodo.idArea }
      });
      setMedicos(responseMedicos.data || []);

      // Los turnos ya están hardcodeados en la constante arriba
      // Cuando se implemente API, cambiar a: const responseTurnos = await axios.get('/api/turnos');
    } catch (err) {
      console.error('Error cargando datos:', err);
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

    if (!formData.idPers) {
      setError('Por favor selecciona un médico');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth.token');
      const turnoSeleccionado = dayTurnos[getDateKey(selectedDate)];

      const request = {
        periodo: periodo.periodo,
        idArea: periodo.idArea,
        idPers: parseInt(formData.idPers),
        idGrupoProg: 0,
        idServicio: null,
        turnosTotales: 1,
        horasTotales: 0,
        observaciones: `Turno: ${turnoSeleccionado} | Fecha: ${selectedDate.toLocaleDateString('es-PE')} ${formData.observaciones ? '| ' + formData.observaciones : ''}`,
      };

      const personalSeleccionado = medicos.find(m => m.idPers === parseInt(formData.idPers));
      request.idRegLab = personalSeleccionado?.idRegLab || 1;

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
    } catch (err) {
      console.error('Error creando solicitud:', err);
      setError(err.response?.data?.error || 'Error al crear solicitud');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 flex items-center justify-between border-b">
          <h2 className="text-xl font-bold">Mi Horario del Mes</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Calendario Grande */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
              {/* Navegación */}
              <div className="flex items-center justify-between mb-8">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-3 hover:bg-gray-200 rounded-lg transition"
                >
                  <ChevronLeft className="w-8 h-8 text-gray-600" />
                </button>
                <h3 className="text-4xl font-bold text-blue-600 text-center flex-1">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-3 hover:bg-gray-200 rounded-lg transition"
                >
                  <ChevronRight className="w-8 h-8 text-gray-600" />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-3 mb-4">
                {dayNames.map(day => (
                  <div
                    key={day}
                    className="text-center font-bold text-gray-700 py-3 text-lg"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-3 relative">
                {calendarDays.map((day, index) => (
                  <div key={index} className="relative">
                    {!day ? (
                      <div className="aspect-video" />
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDateClick(day)}
                          className={`
                            w-full aspect-video rounded-lg font-bold text-2xl transition-all
                            flex flex-col items-center justify-center gap-2
                            ${
                              selectedDate &&
                              selectedDate.getDate() === day &&
                              selectedDate.getMonth() === currentMonth.getMonth()
                                ? 'bg-white text-gray-900 border-4 border-cyan-500 shadow-lg'
                                : 'bg-gray-50 text-gray-900 border-2 border-gray-200 hover:bg-gray-100'
                            }
                          `}
                        >
                          <span>{day}</span>
                          {/* Mostrar badge del turno para cualquier día que lo tenga asignado */}
                          {dayTurnos[getDateKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))] && (
                            <span className={`${
                              TURNO_COLORES[dayTurnos[getDateKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))]]?.color
                            } text-white px-3 py-1 rounded text-sm font-bold`}>
                              {dayTurnos[getDateKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))]}
                            </span>
                          )}
                        </button>

                        {/* Dropdown flotante de Turnos */}
                        {selectedDate &&
                          selectedDate.getDate() === day &&
                          selectedDate.getMonth() === currentMonth.getMonth() &&
                          showTurnosDropdown && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-white border-2 border-blue-500 rounded-lg shadow-2xl z-50 w-72 max-h-88 overflow-y-auto">
                              <div className="p-3 border-b border-gray-200 bg-blue-50 sticky top-0">
                                <p className="text-sm font-semibold text-gray-800">Seleccionar turno:</p>
                              </div>
                              {turnos.map((t) => (
                                <button
                                  key={t.codigo}
                                  type="button"
                                  onClick={() => handleTurnoSelect(t.codigo)}
                                  className={`
                                    w-full px-4 py-3 text-left hover:bg-blue-50 transition
                                    flex items-center gap-3 border-b border-gray-100 last:border-b-0
                                    ${dayTurnos[getDateKey(selectedDate)] === t.codigo ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''}
                                  `}
                                >
                                  <span
                                    className={`${
                                      TURNO_COLORES[t.codigo]?.color
                                    } text-white px-3 py-1 rounded text-xs font-bold min-w-fit`}
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

            {/* Médico y Observaciones (aparece cuando hay turno seleccionado) */}
            {selectedDate && dayTurnos[getDateKey(selectedDate)] && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <div className="space-y-4">
                  {/* Médico */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Médico <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="idPers"
                      value={formData.idPers}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    >
                      <option value="">Selecciona médico</option>
                      {medicos.map(m => (
                        <option key={m.idPers} value={m.idPers}>
                          {m.nomPers}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Observaciones */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observaciones
                    </label>
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Notas..."
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={
                  loading || !selectedDate || !dayTurnos[getDateKey(selectedDate)] || !formData.idPers
                }
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg flex items-center justify-center gap-2"
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                Guardar Horario
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-semibold text-lg"
              >
                Cancelar
              </button>
            </div>

            {/* Leyenda de Códigos */}
            <div className="mt-8 pt-8 border-t-2 border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4 text-lg">Códigos de Horario:</h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(TURNO_COLORES).map(([codigo, info]) => (
                  <div key={codigo} className="flex items-center gap-3">
                    <span className={`${info.color} text-white px-3 py-1 rounded text-sm font-bold min-w-fit`}>
                      {codigo}
                    </span>
                    <span className="text-sm text-gray-700">{info.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalNuevaSolicitud;
