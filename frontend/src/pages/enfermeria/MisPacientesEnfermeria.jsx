// ========================================================================
// 👩‍⚕️ MisPacientesEnfermeria.jsx – Interfaz de Atención No Médica
// ✅ Versión 3.0.0 (2026-01-06) - Interfaz Consulta Externa + Programación
// ========================================================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Users, Search, Calendar, Activity, Heart,
  RefreshCw, Clock, CheckCircle2, Stethoscope, Share2, ClipboardList,
  FileText, ChevronLeft, ChevronRight, ArrowRight, Copy
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/apiClient";
import NursingAttendModal from "./components/NursingAttendModal";

export default function MisPacientesEnfermeria() {
  const { user: usuario } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(50);

  // Modal
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Estado de selección de pacientes
  const [selectedPatients, setSelectedPatients] = useState(new Set());

  // Estado del calendario
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);

  // Manejo de clicks fuera del calendario
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCalendar]);

  const cargarWorklist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/enfermeria/queue", {
        params: { estado: "PENDIENTE" }
      });

      const data = Array.isArray(response) ? response : (response.data || []);
      console.log("✅ Pacientes cargados:", data.length);
      setPacientes(data);
    } catch (error) {
      console.error("Error al cargar worklist:", error);
      toast.error("Error al actualizar la lista de pacientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarWorklist();
  }, [cargarWorklist]);

  // Filtro por búsqueda y estado (solo PENDIENTES)
  const filteredPatients = useMemo(() => {
    return pacientes.filter(p =>
      (p.estadoEnfermeria === "PENDIENTE") &&
      (p.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.pacienteDni?.includes(searchTerm))
    );
  }, [pacientes, searchTerm]);

  // Paginación
  const paginatedPatients = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredPatients.slice(startIndex, endIndex);
  }, [filteredPatients, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize);

  const handleAttend = (paciente) => {
    setSelectedPatient(paciente);
  };

  const handleSuccess = () => {
    cargarWorklist();
  };

  const handleSelectPatient = (idOrigen) => {
    const newSelected = new Set(selectedPatients);
    if (newSelected.has(idOrigen)) {
      newSelected.delete(idOrigen);
    } else {
      newSelected.add(idOrigen);
    }
    setSelectedPatients(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPatients.size === paginatedPatients.length) {
      setSelectedPatients(new Set());
    } else {
      const allIds = new Set(paginatedPatients.map(p => p.idOrigen));
      setSelectedPatients(allIds);
    }
  };

  // Funciones del calendario
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleSelectDate = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setShowCalendar(false);
  };

  const formattedDate = selectedDate.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const monthYear = currentMonth.toLocaleDateString('es-PE', {
    month: 'long',
    year: 'numeric'
  }).replace(/^\w/, (c) => c.toUpperCase());

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Obtener fecha de hoy
  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() &&
           currentMonth.getMonth() === today.getMonth() &&
           currentMonth.getFullYear() === today.getFullYear();
  };

  return (
    <div className="min-h-screen p-6 font-sans bg-gray-50">

      {/* ========== HEADER: ATENCIÓN NO MÉDICA ========== */}
      <div className="mb-6 bg-gradient-to-r from-[#001f3f] via-[#001a33] to-[#000000] text-white rounded-lg shadow-lg">
        <div className="px-6 py-6">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold tracking-wider">ATENCIÓN NO MÉDICA</h1>
          </div>

          {/* Fecha + Área Hospitalaria */}
          <div className="flex items-center justify-between border-b border-blue-300/30 pb-4 mb-4">
            <div className="flex items-center gap-3 relative">
              <Calendar className="w-5 h-5" />
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="font-semibold text-lg flex items-center gap-2 hover:opacity-80 transition"
                >
                  Fecha: {formattedDate}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                {/* Calendario Popup */}
                {showCalendar && (
                  <div
                    ref={calendarRef}
                    className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl p-4 z-50 border border-gray-300 min-w-80"
                  >
                    {/* Header con mes/año */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <h3 className="text-gray-900 font-bold text-center flex-1 capitalize">
                        {monthYear}
                      </h3>
                      <button
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-2 mb-3">
                      {daysOfWeek.map((day, idx) => (
                        <div key={idx} className="text-center text-xs font-bold text-gray-600">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Días del mes */}
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: firstDay }).map((_, idx) => (
                        <div key={`empty-${idx}`}></div>
                      ))}
                      {calendarDays.map((day) => (
                        <button
                          key={day}
                          onClick={() => handleSelectDate(day)}
                          className={`p-2 rounded text-sm font-semibold transition relative ${
                            selectedDate.getDate() === day &&
                            selectedDate.getMonth() === currentMonth.getMonth() &&
                            selectedDate.getFullYear() === currentMonth.getFullYear()
                              ? 'bg-blue-600 text-white'
                              : isToday(day)
                              ? 'text-orange-600 border-b-2 border-orange-600 font-bold hover:bg-orange-50'
                              : 'text-gray-700 hover:bg-blue-100'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>

                    {/* Botón Seleccionar */}
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="w-full mt-4 py-2 bg-gray-200 text-gray-900 font-semibold rounded hover:bg-gray-300 transition text-sm"
                    >
                      Seleccionar fecha
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Área Hospitalaria</div>
              <div className="text-xl font-bold">CONSULTA EXTERNA</div>
            </div>
          </div>

          {/* Profesional */}
          <div className="bg-blue-400/20 rounded px-4 py-3 mb-4">
            <div className="text-sm font-semibold tracking-wide uppercase opacity-90 mb-2">Profesional</div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span className="font-mono font-semibold">Documento D.N.I. {usuario?.username || "N/A"}</span>
              <Copy className="w-4 h-4 cursor-pointer hover:opacity-70 transition" />
              <span className="font-bold text-lg">
                {usuario?.nombreCompleto || "Profesional"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== PROGRAMACIÓN ASIGNADA ========== */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#003d66] to-[#001f3f] text-white px-6 py-3 font-bold tracking-wide uppercase text-sm">
          Programación Asignada
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Servicio</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Actividad</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Actividad Específica</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Fec Turno</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700">HorInicio</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700">HorFin</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Estado</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Tipo Programación</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white hover:bg-blue-50/50 transition border-b border-gray-100">
                <td className="px-4 py-3 font-semibold text-gray-900">ENFERMERÍA</td>
                <td className="px-4 py-3 text-gray-700">ATENCIÓN NO MÉDICA</td>
                <td className="px-4 py-3 text-gray-700">TELEMONITOREO</td>
                <td className="px-4 py-3 font-mono text-gray-700">{formattedDate}</td>
                <td className="px-4 py-3 text-center font-mono text-gray-700">08:00</td>
                <td className="px-4 py-3 text-center font-mono text-gray-700">14:00</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-bold rounded text-xs">
                    APROBADA POR CUPOS
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">PROGR. DIARIA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== RELACIÓN DE PACIENTES CITADOS ========== */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">

        {/* Header con Búsqueda y Controles */}
        <div className="bg-gradient-to-r from-[#003d66] to-[#001f3f] text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="font-bold tracking-wide uppercase text-sm flex items-center gap-3">
              <span>Relación de Pacientes Citados</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {filteredPatients.length} pacientes
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute w-4 h-4 left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="pl-10 pr-4 py-2 rounded bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition w-48 text-sm"
                />
              </div>
              <select className="px-3 py-2 bg-white/20 text-white rounded focus:outline-none text-sm hover:bg-white/30 transition focus:ring-2 focus:ring-white/50">
                <option className="text-gray-900">Marcar todos</option>
                <option className="text-gray-900">No marcar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Pacientes */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Activity className="w-8 h-8 text-cyan-500 animate-spin mr-3" />
              <span>Cargando pacientes...</span>
            </div>
          ) : paginatedPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Users className="w-8 h-8 mb-2 opacity-40" />
              <span>No se encontraron pacientes</span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPatients.size === paginatedPatients.length && paginatedPatients.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 border-r border-gray-200">Orden</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 border-r border-gray-200">Apellidos y Nombres</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 border-r border-gray-200">DNI</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 border-r border-gray-200">Género</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-200">Edad</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 border-r border-gray-200">Estrategia</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 border-r border-gray-200">IPRESS de Adscripción</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.map((paciente, idx) => (
                  <tr
                    key={`${paciente.idOrigen}_${idx}`}
                    className={`border-b border-gray-200 transition hover:bg-blue-50/80 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedPatients.has(paciente.idOrigen)}
                        onChange={() => handleSelectPatient(paciente.idOrigen)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 border-r border-gray-200">{idx + 1}</td>
                    <td className="px-4 py-3 border-r border-gray-200">
                      <div className="font-semibold text-gray-900 truncate" title={paciente.pacienteNombre}>
                        {paciente.pacienteNombre}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {paciente.esCronico && (
                          <span className="inline-block px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">
                            CRÓNICO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900 border-r border-gray-200">
                      {paciente.pacienteDni}
                    </td>
                    <td className="px-4 py-3 text-left font-semibold text-gray-900 border-r border-gray-200">
                      {paciente.pacienteSexo || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-900 border-r border-gray-200">
                      {paciente.pacienteEdad}
                    </td>
                    <td className="px-4 py-3 text-left border-r border-gray-200">
                      {paciente.esCronico ? (
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                          CENACRON
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-left text-sm text-gray-700 border-r border-gray-200">
                      {paciente.nombreIpress || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {paciente.estadoEnfermeria === "ATENDIDO" ? (
                        <span className="inline-block px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap bg-blue-100 text-blue-800">
                          ATENDIDO
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAttend(paciente)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                            paciente.diasTranscurridos > 0
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : paciente.diasTranscurridos === 0
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          PENDIENTE
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {filteredPatients.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700 font-semibold">
              Mostrando {currentPage * pageSize + 1} a{" "}
              {Math.min((currentPage + 1) * pageSize, filteredPatients.length)} de{" "}
              {filteredPatients.length} entradas
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-3 py-1.5 rounded font-semibold transition ${
                    currentPage === i
                      ? "bg-[#003d66] text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Atención */}
      {selectedPatient && (
        <NursingAttendModal
          paciente={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
