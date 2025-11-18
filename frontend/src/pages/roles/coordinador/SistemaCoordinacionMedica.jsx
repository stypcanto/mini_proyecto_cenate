// ========================================================================
// 🩺 Sistema de Coordinación Médica - CENATE 2025
// ------------------------------------------------------------------------
// Módulo para coordinadores médicos.
// Permite:
//  - Seleccionar un médico
//  - Programar turnos con duración configurable
//  - Visualizar calendario mensual
//  - Ver y eliminar turnos
//  - Controlar límite mensual (150 horas)
// Diseño profesional con Tailwind + Lucide Icons
// ========================================================================

import React, { useState } from 'react';
import {
  Calendar, Clock, User, Save, Plus, X, AlertTriangle,
  Eye, UserCheck
} from 'lucide-react';

// ========================================================================
// 📚 Datos iniciales de médicos (simulación, conectar con backend)
// ========================================================================
const DOCTORES = [
  { id: 1, nombre: 'VILLARREAL GIRALDO ANGEL EDUARDO', especialidad: 'CARDIOLOGÍA', dni: '46451440' },
  { id: 2, nombre: 'NIZAMA RAYMUNDO LUIS GEANFRANCO', especialidad: 'CARDIOLOGÍA', dni: '71101955' },
  { id: 3, nombre: 'ZAVALETA CAMACHO GABRIELA', especialidad: 'CARDIOLOGÍA', dni: '73613444' },
  { id: 4, nombre: 'REVOLLAR RAMIREZ YOYCE ROSARIO', especialidad: 'DERMATOLOGÍA', dni: '10122974' },
  { id: 5, nombre: 'AYALA NUNURA DEYVI RONALD', especialidad: 'ENDOCRINOLOGÍA', dni: '46924731' },
  { id: 6, nombre: 'GÁLVEZ GASTELÚ ANDREA LUCÍA', especialidad: 'ENDOCRINOLOGÍA', dni: '46205941' },
  { id: 7, nombre: 'PÉREZ DOMÍNGUEZ ROSAURA ELENA', especialidad: 'ENDOCRINOLOGÍA', dni: '43888440' },
  { id: 8, nombre: 'FLORES ASENJO WALTER ALBERTO', especialidad: 'GASTROENTEROLOGÍA', dni: '12345678' },
  { id: 9, nombre: 'MARTÍNEZ LÓPEZ CARMEN SOFÍA', especialidad: 'PEDIATRÍA', dni: '87654321' },
  { id: 10, nombre: 'RODRÍGUEZ VARGAS MIGUEL ÁNGEL', especialidad: 'PEDIATRÍA', dni: '11223344' },
];

// ========================================================================
// 🧩 Componente principal
// ========================================================================
const SistemaCoordinacionMedica = () => {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedYear] = useState(2025);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [scheduledShifts, setScheduledShifts] = useState({});
  const [viewDate, setViewDate] = useState(null);

  // =============================================================
  // 🕓 Utilidades de tiempo
  // =============================================================
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const generateAppointmentSlots = (startTime, endTime, duration) => {
    const slots = [];
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    for (let t = start; t < end; t += duration) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
    return slots;
  };

  const calculateHours = (start, end) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh + em / 60) - (sh + sm / 60);
  };

  const getShiftsForDate = (doctorId, date) => scheduledShifts[`${doctorId}_${date}`] || [];
  const hasScheduledShifts = (doctorId, day) => {
    const date = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return getShiftsForDate(doctorId, date).length > 0;
  };

  // =============================================================
  // 💾 Acciones principales
  // =============================================================
  const handleScheduleShifts = () => {
    if (!selectedDoctor || !selectedDate || !selectedStartTime || !selectedEndTime) {
      alert("Por favor complete todos los campos requeridos.");
      return;
    }

    if (selectedStartTime >= selectedEndTime) {
      alert("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }

    const slots = generateAppointmentSlots(selectedStartTime, selectedEndTime, appointmentDuration);
    const key = `${selectedDoctor}_${selectedDate}`;
    setScheduledShifts(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), {
        id: Date.now(),
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        duration: appointmentDuration,
        slots,
        createdAt: new Date().toISOString()
      }]
    }));

    setShowModal(false);
    setSelectedStartTime('');
    setSelectedEndTime('');
    setSelectedDate(null);
  };

  const removeShift = (doctorId, date, shiftId) => {
    const key = `${doctorId}_${date}`;
    setScheduledShifts(prev => ({
      ...prev,
      [key]: prev[key].filter(shift => shift.id !== shiftId)
    }));
  };

  // =============================================================
  // 📊 Cálculos mensuales
  // =============================================================
  const calculateMonthlyHours = () => {
    if (!selectedDoctor) return 0;
    const shifts = Object.entries(scheduledShifts)
      .filter(([key]) => key.startsWith(`${selectedDoctor}_${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`))
      .flatMap(([, s]) => s);

    return shifts.reduce((t, s) => t + calculateHours(s.startTime, s.endTime), 0);
  };

  const monthlyHours = calculateMonthlyHours();
  const hoursExceeded = monthlyHours > 150;
  const timeSlots = generateTimeSlots();

  // =============================================================
  // 📅 Renderizado del calendario
  // =============================================================
  const renderCalendar = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const calendar = [];
    for (let i = 0; i < adjustedFirstDay; i++) calendar.push(<div key={`empty-${i}`} />);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const hasShifts = selectedDoctor && hasScheduledShifts(parseInt(selectedDoctor), d);
      const shifts = selectedDoctor ? getShiftsForDate(parseInt(selectedDoctor), dateStr) : [];
      const totalSlots = shifts.reduce((acc, s) => acc + s.slots.length, 0);
      const isSunday = new Date(selectedYear, selectedMonth - 1, d).getDay() === 0;

      calendar.push(
        <div
          key={d}
          onClick={() => selectedDoctor && setShowModal(true) && setSelectedDate(dateStr)}
          className={`p-2 text-center rounded-lg border cursor-pointer min-h-[80px] flex flex-col justify-between
            ${isSunday
              ? 'bg-blue-50 border-blue-200'
              : hasShifts
                ? 'bg-blue-100 border-blue-300 text-blue-900'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'}`}
        >
          <div className="text-sm font-semibold">{d}</div>
          {hasShifts && (
            <div className="space-y-1">
              <div className="text-xs bg-blue-200 rounded px-1">{shifts.length} turno{shifts.length > 1 ? 's' : ''}</div>
              <div className="text-xs text-blue-700">{totalSlots} cupos</div>
              <button
                onClick={(e) => { e.stopPropagation(); setViewDate(dateStr); setShowViewModal(true); }}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 mx-auto"
              >
                Ver
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Calendario de Turnos</h2>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {[8, 9, 10, 11, 12].map((m) => (
              <option key={m} value={m}>
                {new Date(2025, m - 1).toLocaleDateString('es-ES', { month: 'long' }).toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">{calendar}</div>
      </div>
    );
  };

  // =============================================================
  // 🧭 Render principal
  // =============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado */}
        <div className="p-8 bg-white rounded-xl shadow-lg flex items-center gap-4">
          <Calendar className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sistema de Coordinación Médica</h1>
            <p className="text-sm text-gray-500">
              Asigne y gestione los turnos médicos entre agosto y diciembre de 2025.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel lateral */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <UserCheck className="w-5 h-5 text-blue-600" /> Selección de Médico
              </h2>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar médico...</option>
                {DOCTORES.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr(a). {d.nombre} – {d.especialidad}
                  </option>
                ))}
              </select>

              {selectedDoctor && (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                  {(() => {
                    const d = DOCTORES.find(doc => doc.id === parseInt(selectedDoctor));
                    return (
                      <>
                        <p className="font-semibold text-blue-900">Dr(a). {d.nombre}</p>
                        <p className="text-sm text-blue-800">{d.especialidad}</p>
                        <p className="text-xs text-blue-700">DNI: {d.dni}</p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Estadísticas */}
            {selectedDoctor && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas</h3>
                <p className="text-sm text-gray-600">Horas programadas: <span className={`font-semibold ${hoursExceeded ? 'text-red-600' : 'text-blue-700'}`}>{monthlyHours.toFixed(1)}</span> / 150</p>
                {hoursExceeded && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Límite mensual superado
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Calendario */}
          <div className="lg:col-span-3">{renderCalendar()}</div>
        </div>
      </div>
    </div>
  );
};

export default SistemaCoordinacionMedica;