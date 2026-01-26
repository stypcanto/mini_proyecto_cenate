// ========================================================================
// 🩺 Sistema de Coordinación Médica - CENATE 2025
// ------------------------------------------------------------------------
// Módulo para coordinadores médicos.
// Permite:
//  - Crear y asignar horarios base para médicos
//  - Seleccionar IPRESS, turno y tipo de consultorio
//  - Programar turnos con duración configurable
//  - Visualizar calendario mensual
//  - Ver y eliminar turnos
//  - Controlar límite mensual (150 horas)
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, Save, Plus, X, AlertTriangle,
  Eye, UserCheck, Building2, Settings, Trash2, Edit,
  CheckCircle, Hospital, Stethoscope
} from 'lucide-react';
import api from '../../../services/apiClient';

// ========================================================================
// 📚 Constantes para turnos y tipos de consultorio
// ========================================================================
const TURNOS = [
  { id: 'M', nombre: 'Mañana', horaInicio: '06:00', horaFin: '14:00', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'T', nombre: 'Tarde', horaInicio: '14:00', horaFin: '22:00', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'N', nombre: 'Noche', horaInicio: '22:00', horaFin: '06:00', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
];

const TIPOS_CONSULTORIO = [
  { id: 1, nombre: 'Consultorio Presencial', icono: '🏥' },
  { id: 2, nombre: 'Teleconsulta Sincrónica', icono: '📹' },
  { id: 3, nombre: 'Teleconsulta Asincrónica', icono: '📧' },
  { id: 4, nombre: 'Consultorio Híbrido', icono: '🔄' },
];

const DURACIONES_CITA = [
  { value: 15, label: '15 minutos' },
  { value: 20, label: '20 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '60 minutos' },
];

// ========================================================================
// 🧩 Componente principal
// ========================================================================
const SistemaCoordinacionMedica = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('horarios'); // 'horarios' | 'calendario'
  const [loading, setLoading] = useState(false);

  // Datos del backend
  const [medicos, setMedicos] = useState([]);
  const [ipress, setIpress] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);

  // Selecciones
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedIpress, setSelectedIpress] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('');
  const [selectedTipoConsultorio, setSelectedTipoConsultorio] = useState('');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState(''); // Filtro para médicos

  // Configuración de horario base
  const [horarioBase, setHorarioBase] = useState({
    horaInicio: '08:00',
    horaFin: '14:00',
    duracionCita: 30,
    diasSemana: [1, 2, 3, 4, 5], // Lun-Vie por defecto
  });

  // Horarios guardados
  const [horariosGuardados, setHorariosGuardados] = useState([]);

  // Calendario
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(2025);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [scheduledShifts, setScheduledShifts] = useState({});
  const [viewDate, setViewDate] = useState(null);

  // ========================================================================
  // 📡 Cargar datos del backend
  // ========================================================================
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar médicos (usuarios con rol MEDICO), IPRESS y especialidades
      const [medicosRes, ipressRes, especialidadesRes] = await Promise.all([
        api.get('/usuarios/por-rol?roles=MEDICO').catch((err) => { console.error('Error médicos:', err); return []; }),
        api.get('/ipress/activas').catch((err) => { console.error('Error IPRESS:', err); return []; }),
        api.get('/especialidades/activas').catch((err) => { console.error('Error especialidades:', err); return []; }),
      ]);

      console.log('📋 Médicos cargados:', medicosRes);
      console.log('🏥 IPRESS cargadas:', ipressRes);
      console.log('📋 Especialidades cargadas:', especialidadesRes);

      // Los médicos vienen directamente del endpoint por rol
      const medicosData = Array.isArray(medicosRes) ? medicosRes : [];

      // IPRESS puede venir como array o como objeto con content
      const ipressData = Array.isArray(ipressRes)
        ? ipressRes
        : (ipressRes?.content || ipressRes?.data || []);

      setMedicos(medicosData);
      setIpress(ipressData);
      setEspecialidades(Array.isArray(especialidadesRes) ? especialidadesRes : []);

      // Cargar horarios guardados del localStorage (temporal hasta tener backend)
      const savedHorarios = localStorage.getItem('horariosBase');
      if (savedHorarios) {
        setHorariosGuardados(JSON.parse(savedHorarios));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar médicos por especialidad seleccionada
  // El campo en usuarios es id_especialidad (JSON) que viene del DTO como idEspecialidad
  const medicosFiltrados = filtroEspecialidad
    ? medicos.filter(m => {
        const idEsp = m.id_especialidad || m.idEspecialidad;
        return idEsp === parseInt(filtroEspecialidad);
      })
    : medicos;

  // ========================================================================
  // 💾 Guardar horario base
  // ========================================================================
  const handleGuardarHorarioBase = () => {
    if (!selectedDoctor || !selectedIpress || !selectedTurno || !selectedTipoConsultorio) {
      alert('Por favor complete todos los campos requeridos:\n- Médico\n- IPRESS\n- Turno\n- Tipo de Consultorio');
      return;
    }

    const medico = medicos.find(m => m.idUser === parseInt(selectedDoctor));
    const ipressData = ipress.find(i => i.idIpress === parseInt(selectedIpress));
    const turno = TURNOS.find(t => t.id === selectedTurno);
    const tipoConsultorio = TIPOS_CONSULTORIO.find(tc => tc.id === parseInt(selectedTipoConsultorio));

    const nuevoHorario = {
      id: Date.now(),
      medicoId: parseInt(selectedDoctor),
      medicoNombre: medico ? (medico.nombre_completo || `${medico.apellido_paterno || ''} ${medico.apellido_materno || ''}, ${medico.nombres || ''}`.trim()) : 'Sin nombre',
      medicoEspecialidad: medico?.nombre_especialidad || selectedEspecialidad || 'Sin especialidad',
      ipressId: parseInt(selectedIpress),
      ipressNombre: ipressData?.descIpress || 'Sin IPRESS',
      turnoId: selectedTurno,
      turnoNombre: turno?.nombre,
      tipoConsultorioId: parseInt(selectedTipoConsultorio),
      tipoConsultorioNombre: tipoConsultorio?.nombre,
      tipoConsultorioIcono: tipoConsultorio?.icono,
      horaInicio: horarioBase.horaInicio,
      horaFin: horarioBase.horaFin,
      duracionCita: horarioBase.duracionCita,
      diasSemana: horarioBase.diasSemana,
      createdAt: new Date().toISOString(),
      activo: true,
    };

    const nuevosHorarios = [...horariosGuardados, nuevoHorario];
    setHorariosGuardados(nuevosHorarios);
    localStorage.setItem('horariosBase', JSON.stringify(nuevosHorarios));

    // Limpiar formulario
    setSelectedDoctor('');
    setSelectedIpress('');
    setSelectedTurno('');
    setSelectedTipoConsultorio('');
    setSelectedEspecialidad('');
    setHorarioBase({
      horaInicio: '08:00',
      horaFin: '14:00',
      duracionCita: 30,
      diasSemana: [1, 2, 3, 4, 5],
    });

    alert('✅ Horario base guardado exitosamente');
  };

  // ========================================================================
  // 🗑️ Eliminar horario base
  // ========================================================================
  const handleEliminarHorario = (id) => {
    if (!window.confirm('¿Está seguro de eliminar este horario base?')) return;

    const nuevosHorarios = horariosGuardados.filter(h => h.id !== id);
    setHorariosGuardados(nuevosHorarios);
    localStorage.setItem('horariosBase', JSON.stringify(nuevosHorarios));
  };

  // ========================================================================
  // 📅 Funciones del calendario
  // ========================================================================
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

  const handleScheduleShifts = (startTime, endTime, duration) => {
    if (!selectedDoctor || !selectedDate) {
      alert("Por favor seleccione un médico y una fecha.");
      return;
    }

    const slots = generateAppointmentSlots(startTime, endTime, duration);
    const key = `${selectedDoctor}_${selectedDate}`;

    setScheduledShifts(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), {
        id: Date.now(),
        startTime,
        endTime,
        duration,
        slots,
        ipressId: selectedIpress,
        tipoConsultorioId: selectedTipoConsultorio,
        createdAt: new Date().toISOString()
      }]
    }));

    setShowModal(false);
    setSelectedDate(null);
  };

  const removeShift = (doctorId, date, shiftId) => {
    const key = `${doctorId}_${date}`;
    setScheduledShifts(prev => ({
      ...prev,
      [key]: prev[key].filter(shift => shift.id !== shiftId)
    }));
  };

  const calculateMonthlyHours = () => {
    if (!selectedDoctor) return 0;
    const shifts = Object.entries(scheduledShifts)
      .filter(([key]) => key.startsWith(`${selectedDoctor}_${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`))
      .flatMap(([, s]) => s);

    return shifts.reduce((t, s) => t + calculateHours(s.startTime, s.endTime), 0);
  };

  const monthlyHours = calculateMonthlyHours();
  const hoursExceeded = monthlyHours > 150;

  // ========================================================================
  // 📅 Renderizado del calendario
  // ========================================================================
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
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      calendar.push(
        <div
          key={d}
          onClick={() => {
            if (selectedDoctor) {
              setSelectedDate(dateStr);
              setShowModal(true);
            }
          }}
          className={`p-2 text-center rounded-lg border cursor-pointer min-h-[80px] flex flex-col justify-between transition-all
            ${isToday ? 'ring-2 ring-blue-500' : ''}
            ${isSunday
              ? 'bg-red-50 border-red-200 text-red-700'
              : hasShifts
                ? 'bg-emerald-100 border-emerald-300 text-emerald-900 hover:bg-emerald-200'
                : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-700'}`}
        >
          <div className={`text-sm font-semibold ${isToday ? 'text-blue-600' : ''}`}>{d}</div>
          {hasShifts && (
            <div className="space-y-1">
              <div className="text-xs bg-emerald-200 rounded px-1">{shifts.length} turno{shifts.length > 1 ? 's' : ''}</div>
              <div className="text-xs text-emerald-700 font-medium">{totalSlots} cupos</div>
              <button
                onClick={(e) => { e.stopPropagation(); setViewDate(dateStr); setShowViewModal(true); }}
                className="px-2 py-1 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600 mx-auto flex items-center gap-1"
              >
                <Eye className="w-3 h-3" /> Ver
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Calendario de Turnos
          </h2>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2025, m - 1).toLocaleDateString('es-ES', { month: 'long' }).toUpperCase()} 2025
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, idx) => (
            <div key={day} className={`text-center text-sm font-medium ${idx === 6 ? 'text-red-500' : 'text-gray-500'}`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">{calendar}</div>
      </div>
    );
  };

  // ========================================================================
  // 🎨 Renderizado de días de la semana (checkboxes)
  // ========================================================================
  const DIAS_SEMANA = [
    { id: 1, nombre: 'Lun', nombreCompleto: 'Lunes' },
    { id: 2, nombre: 'Mar', nombreCompleto: 'Martes' },
    { id: 3, nombre: 'Mié', nombreCompleto: 'Miércoles' },
    { id: 4, nombre: 'Jue', nombreCompleto: 'Jueves' },
    { id: 5, nombre: 'Vie', nombreCompleto: 'Viernes' },
    { id: 6, nombre: 'Sáb', nombreCompleto: 'Sábado' },
    { id: 0, nombre: 'Dom', nombreCompleto: 'Domingo' },
  ];

  const toggleDia = (diaId) => {
    setHorarioBase(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(diaId)
        ? prev.diasSemana.filter(d => d !== diaId)
        : [...prev.diasSemana, diaId]
    }));
  };

  // ========================================================================
  // 🧭 Render principal
  // ========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full space-y-6">
        {/* Encabezado */}
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sistema de Coordinación Médica</h1>
                <p className="text-sm text-gray-500">
                  Configure horarios base, asigne turnos y gestione la disponibilidad médica
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('horarios')}
              className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === 'horarios'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Configurar Horarios Base
            </button>
            <button
              onClick={() => setActiveTab('calendario')}
              className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === 'calendario'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendario de Turnos
            </button>
          </div>
        </div>

        {/* Tab: Configurar Horarios Base */}
        {activeTab === 'horarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de configuración */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Crear Horario Base para Médico
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filtrar por Especialidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Stethoscope className="w-4 h-4 inline mr-1" />
                    Filtrar por Especialidad
                  </label>
                  <select
                    value={filtroEspecialidad}
                    onChange={(e) => {
                      setFiltroEspecialidad(e.target.value);
                      setSelectedDoctor(''); // Limpiar médico seleccionado al cambiar filtro
                    }}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas las especialidades</option>
                    {especialidades.map((esp) => (
                      <option key={esp.idServicio} value={esp.idServicio}>
                        {esp.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar Médico */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserCheck className="w-4 h-4 inline mr-1" />
                    Médico <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar médico...</option>
                    {medicosFiltrados.map((m) => (
                      <option key={m.idUser} value={m.idUser}>
                        Dr(a). {m.nombre_completo || `${m.apellido_paterno || ''} ${m.apellido_materno || ''}, ${m.nombres || ''}`} - {m.nombre_especialidad || 'Sin especialidad'}
                      </option>
                    ))}
                  </select>
                  {filtroEspecialidad && medicosFiltrados.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No hay médicos con esta especialidad</p>
                  )}
                </div>

                {/* Seleccionar IPRESS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hospital className="w-4 h-4 inline mr-1" />
                    IPRESS <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedIpress}
                    onChange={(e) => setSelectedIpress(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar IPRESS...</option>
                    {ipress.map((ip) => (
                      <option key={ip.idIpress} value={ip.idIpress}>
                        {ip.codIpress} - {ip.descIpress}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar Turno */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Turno <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedTurno}
                    onChange={(e) => {
                      setSelectedTurno(e.target.value);
                      const turno = TURNOS.find(t => t.id === e.target.value);
                      if (turno) {
                        setHorarioBase(prev => ({
                          ...prev,
                          horaInicio: turno.horaInicio,
                          horaFin: turno.horaFin,
                        }));
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar turno...</option>
                    {TURNOS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} ({t.horaInicio} - {t.horaFin})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Consultorio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Tipo de Consultorio <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedTipoConsultorio}
                    onChange={(e) => setSelectedTipoConsultorio(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar tipo...</option>
                    {TIPOS_CONSULTORIO.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.icono} {tc.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duración de cita */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duración de Cita
                  </label>
                  <select
                    value={horarioBase.duracionCita}
                    onChange={(e) => setHorarioBase(prev => ({ ...prev, duracionCita: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {DURACIONES_CITA.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {/* Hora Inicio y Fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={horarioBase.horaInicio}
                    onChange={(e) => setHorarioBase(prev => ({ ...prev, horaInicio: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={horarioBase.horaFin}
                    onChange={(e) => setHorarioBase(prev => ({ ...prev, horaFin: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Días de la semana */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Días de Atención
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIAS_SEMANA.map((dia) => (
                      <button
                        key={dia.id}
                        type="button"
                        onClick={() => toggleDia(dia.id)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          horarioBase.diasSemana.includes(dia.id)
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {dia.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleGuardarHorarioBase}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  Guardar Horario Base
                </button>
              </div>
            </div>

            {/* Lista de horarios guardados */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Horarios Configurados ({horariosGuardados.length})
              </h3>

              {horariosGuardados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay horarios configurados</p>
                  <p className="text-sm">Configure un horario base para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {horariosGuardados.map((h) => (
                    <div key={h.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{h.tipoConsultorioIcono}</span>
                          <span className="font-semibold text-gray-800 text-sm">{h.medicoNombre}</span>
                        </div>
                        <button
                          onClick={() => handleEliminarHorario(h.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>IPRESS:</strong> {h.ipressNombre}</p>
                        <p><strong>Turno:</strong> {h.turnoNombre} ({h.horaInicio} - {h.horaFin})</p>
                        <p><strong>Tipo:</strong> {h.tipoConsultorioNombre}</p>
                        <p><strong>Duración:</strong> {h.duracionCita} min</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {h.diasSemana.sort().map(d => {
                            const dia = DIAS_SEMANA.find(ds => ds.id === d);
                            return (
                              <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                {dia?.nombre}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Calendario de Turnos */}
        {activeTab === 'calendario' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Panel lateral */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <UserCheck className="w-5 h-5 text-blue-600" /> Selección de Médico
                </h2>

                {/* Filtrar por Especialidad */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Stethoscope className="w-4 h-4 inline mr-1" />
                    Filtrar por Especialidad
                  </label>
                  <select
                    value={filtroEspecialidad}
                    onChange={(e) => {
                      setFiltroEspecialidad(e.target.value);
                      setSelectedDoctor(''); // Limpiar médico al cambiar filtro
                    }}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas las especialidades</option>
                    {especialidades.map((esp) => (
                      <option key={esp.idServicio} value={esp.idServicio}>
                        {esp.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar Médico */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Médico</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar médico...</option>
                    {medicosFiltrados.map((m) => (
                      <option key={m.idUser} value={m.idUser}>
                        Dr(a). {m.nombre_completo || `${m.apellido_paterno || ''} ${m.apellido_materno || ''}`}
                      </option>
                    ))}
                  </select>
                  {filtroEspecialidad && medicosFiltrados.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No hay médicos con esta especialidad</p>
                  )}
                </div>

                {selectedDoctor && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    {(() => {
                      const m = medicos.find(doc => doc.idUser === parseInt(selectedDoctor));
                      return m ? (
                        <>
                          <p className="font-semibold text-blue-900">Dr(a). {m.nombre_completo || `${m.apellido_paterno || ''} ${m.apellido_materno || ''}`}</p>
                          <p className="text-sm text-blue-800">{m.nombre_especialidad || 'Sin especialidad'}</p>
                          <p className="text-xs text-blue-700">DNI: {m.numero_documento}</p>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              {/* Estadísticas */}
              {selectedDoctor && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas del Mes</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Horas programadas:</span>
                      <span className={`font-bold text-lg ${hoursExceeded ? 'text-red-600' : 'text-blue-700'}`}>
                        {monthlyHours.toFixed(1)}h
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${hoursExceeded ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min((monthlyHours / 150) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-right">Límite: 150 horas</p>
                  </div>
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
        )}

        {/* Modal para programar turno */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Programar Turno</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Fecha: <strong>{selectedDate}</strong>
              </p>

              {/* Horarios guardados para este médico */}
              {horariosGuardados.filter(h => h.medicoId === parseInt(selectedDoctor)).length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Seleccione un horario base:</p>
                  {horariosGuardados
                    .filter(h => h.medicoId === parseInt(selectedDoctor))
                    .map((h) => (
                      <button
                        key={h.id}
                        onClick={() => handleScheduleShifts(h.horaInicio, h.horaFin, h.duracionCita)}
                        className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{h.tipoConsultorioIcono}</span>
                          <span className="font-medium text-blue-800">{h.turnoNombre}</span>
                        </div>
                        <p className="text-sm text-blue-600">{h.horaInicio} - {h.horaFin} ({h.duracionCita} min)</p>
                        <p className="text-xs text-gray-500">{h.ipressNombre}</p>
                      </button>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Settings className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No hay horarios base configurados para este médico</p>
                  <button
                    onClick={() => { setShowModal(false); setActiveTab('horarios'); }}
                    className="mt-3 text-blue-600 hover:underline text-sm"
                  >
                    Configurar horario base →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal para ver turnos del día */}
        {showViewModal && viewDate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Turnos del {viewDate}</h3>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {getShiftsForDate(parseInt(selectedDoctor), viewDate).map((shift) => (
                <div key={shift.id} className="mb-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{shift.startTime} - {shift.endTime}</p>
                      <p className="text-sm text-gray-600">Duración por cita: {shift.duration} min</p>
                    </div>
                    <button
                      onClick={() => removeShift(parseInt(selectedDoctor), viewDate, shift.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {shift.slots.map((slot, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SistemaCoordinacionMedica;
