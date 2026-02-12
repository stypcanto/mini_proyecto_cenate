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
import apiClient from '../../../../../lib/apiClient';
import NursingAttendModal from "./components/NursingAttendModal";

export default function MisPacientesEnfermeria() {
  const { user: usuarioAuth } = useAuth();
  const [usuario, setUsuario] = useState(usuarioAuth);
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
      console.log("🔄 Cargando pacientes...");
      const response = await apiClient.get("/enfermeria/mis-pacientes", {
        params: { page: 0, size: 50 }
      });

      console.log("📦 Respuesta del API:", response);

      // Asegurar que siempre sea un array
      let data = [];
      if (Array.isArray(response)) {
        data = response;
        console.log("✅ Respuesta es un array directo");
      } else if (response && Array.isArray(response.data)) {
        data = response.data;
        console.log("✅ Datos encontrados en response.data");
      } else if (response && response.data && typeof response.data === 'object') {
        // Si viene como objeto, intentar extraer el array
        data = response.data.content || response.data.pacientes || response.data.items || [];
        console.log("✅ Datos extraídos de objeto:", data.length);
      }
      
      // Asegurar que sea un array válido
      if (!Array.isArray(data)) {
        console.warn("⚠️ La respuesta no es un array, usando array vacío");
        data = [];
      }
      
      console.log("✅ Pacientes cargados:", data.length);
      console.log("📋 Primer paciente (ejemplo):", data[0]);
      setPacientes(data);
    } catch (error) {
      console.error("❌ Error al cargar worklist:", error);
      console.error("❌ Detalles del error:", error.response?.data || error.message);
      toast.error("Error al actualizar la lista de pacientes");
      setPacientes([]); // Asegurar que siempre sea un array
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos del usuario desde el API
  const cargarDatosUsuario = useCallback(async () => {
    try {
      const response = await apiClient.get("/personal/me");
      if (response && response.data) {
        setUsuario(prev => ({
          ...prev,
          ...response.data,
          nombreCompleto: response.data.nombreProfesional || 
                         `${response.data.nombres || ''} ${response.data.apellidos || ''}`.trim() ||
                         prev?.nombreCompleto
        }));
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      // Mantener datos del auth si falla
      setUsuario(usuarioAuth);
    }
  }, [usuarioAuth]);

  useEffect(() => {
    cargarDatosUsuario();
    cargarWorklist();
  }, [cargarDatosUsuario, cargarWorklist]);

  // Filtro por búsqueda y estado (solo PENDIENTES)
  const filteredPatients = useMemo(() => {
    // Asegurar que pacientes sea un array
    if (!Array.isArray(pacientes)) {
      console.warn("⚠️ pacientes no es un array, retornando array vacío");
      return [];
    }
    
    console.log("🔍 Filtrando pacientes. Total:", pacientes.length, "Búsqueda:", searchTerm);
    
    const filtered = pacientes.filter(p => {
      const matchesEstado = !p.estadoEnfermeria || p.estadoEnfermeria === "PENDIENTE";
      const matchesSearch = !searchTerm ||
        p.apellidosNombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numDoc?.includes(searchTerm);
      return matchesEstado && matchesSearch;
    });
    
    console.log("✅ Pacientes filtrados:", filtered.length);
    return filtered;
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

  const handleSelectPatient = (pkAsegurado) => {
    const newSelected = new Set(selectedPatients);
    if (newSelected.has(pkAsegurado)) {
      newSelected.delete(pkAsegurado);
    } else {
      newSelected.add(pkAsegurado);
    }
    setSelectedPatients(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPatients.size === paginatedPatients.length) {
      setSelectedPatients(new Set());
    } else {
      const allIds = new Set(paginatedPatients.map(p => p.pkAsegurado));
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
    <div className="min-h-screen p-4 font-sans bg-gray-50">

      {/* ========== HEADER: ATENCIÓN NO MÉDICA ========== */}
      <div className="mb-4 bg-[#084a8a] text-white rounded-lg shadow-lg">
        <div className="px-4 py-3">
          <div className="mb-3 text-center">
            <h1 className="text-xl font-bold">ATENCIÓN NO MÉDICA</h1>
          </div>

          {/* Fecha + Área Hospitalaria */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-300/30">
            <div className="relative flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-1.5 text-sm font-semibold transition hover:opacity-80"
                >
                  Fecha: {formattedDate}
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>

                {/* Calendario Popup */}
                {showCalendar && (
                  <div
                    ref={calendarRef}
                    className="absolute left-0 z-50 p-4 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl top-full min-w-80"
                  >
                    {/* Header con mes/año */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={handlePrevMonth}
                        className="p-1 transition rounded hover:bg-gray-100"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <h3 className="flex-1 font-bold text-center text-gray-900 capitalize">
                        {monthYear}
                      </h3>
                      <button
                        onClick={handleNextMonth}
                        className="p-1 transition rounded hover:bg-gray-100"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-2 mb-3">
                      {daysOfWeek.map((day, idx) => (
                        <div key={idx} className="text-xs font-bold text-center text-gray-600">
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
                      className="w-full py-2 mt-4 text-sm font-semibold text-gray-900 transition bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Seleccionar fecha
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Área Hospitalaria</div>
              <div className="text-sm font-bold">CONSULTA EXTERNA</div>
            </div>
          </div>

          {/* Profesional */}
          <div className="px-3 py-2.5 mb-0 border rounded-lg shadow-sm bg-cyan-50/95 backdrop-blur-sm border-cyan-200/40">
            <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700">Profesional</div>
            <div className="flex items-center gap-2.5">
              <Users className="flex-shrink-0 w-4 h-4 text-cyan-700" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-cyan-800">Documento D.N.I.</span>
                <span className="text-xs font-semibold text-cyan-900">{usuario?.username || "N/A"}</span>
                <Copy className="w-3.5 h-3.5 text-cyan-600 transition cursor-pointer hover:text-cyan-800 hover:scale-110" />
              </div>
              <span className="text-sm font-bold text-cyan-900">
                {usuario?.nombreCompleto || "Profesional"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== PROGRAMACIÓN ASIGNADA ========== */}
      <div className="mb-4 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="bg-[#084a8a] text-white px-4 py-2 font-bold uppercase text-sm shadow-md">
          Programación Asignada
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#084a8a] border-b border-[#084a8a]/50">
              <tr>
                <th className="px-3 py-2 font-bold text-left text-white border-r border-[#084a8a]/50">Servicio</th>
                <th className="px-3 py-2 font-bold text-left text-white border-r border-[#084a8a]/50">Actividad</th>
                <th className="px-3 py-2 font-bold text-left text-white border-r border-[#084a8a]/50">Actividad Específica</th>
                <th className="px-3 py-2 font-bold text-left text-white border-r border-[#084a8a]/50">Fec Turno</th>
                <th className="px-3 py-2 font-bold text-center text-white border-r border-[#084a8a]/50">HorInicio</th>
                <th className="px-3 py-2 font-bold text-center text-white border-r border-[#084a8a]/50">HorFin</th>
                <th className="px-3 py-2 font-bold text-left text-white border-r border-[#084a8a]/50">Estado</th>
                <th className="px-3 py-2 font-bold text-left text-white">Tipo Programación</th>
              </tr>
            </thead>
            <tbody>
              <tr className="transition bg-white border-b border-blue-100 hover:bg-blue-50/50">
                <td className="px-3 py-2 font-semibold text-gray-900 border-r border-blue-100">ENFERMERÍA</td>
                <td className="px-3 py-2 text-gray-700 border-r border-blue-100">ATENCIÓN NO MÉDICA</td>
                <td className="px-3 py-2 text-gray-700 border-r border-blue-100">TELEMONITOREO</td>
                <td className="px-3 py-2 text-gray-700 border-r border-blue-100">{formattedDate}</td>
                <td className="px-3 py-2 text-center text-gray-700 border-r border-blue-100">08:00</td>
                <td className="px-3 py-2 text-center text-gray-700 border-r border-blue-100">14:00</td>
                <td className="px-3 py-2 border-r border-blue-100">
                  <span className="inline-block px-2 py-0.5 text-xs font-bold text-green-800 bg-green-100 rounded">
                    APROBADA POR CUPOS
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-700">PROGR. DIARIA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== RELACIÓN DE PACIENTES CITADOS ========== */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">

        {/* Header con Búsqueda y Controles */}
        <div className="bg-[#084a8a] text-white px-4 py-2 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold uppercase">
              <span>Relación de Pacientes Citados</span>
              <span className="px-1.5 py-0.5 text-xs rounded bg-white/20">
                {filteredPatients.length} pacientes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute w-3.5 h-3.5 transform -translate-y-1/2 left-2 top-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="w-40 py-1.5 pl-8 pr-3 text-sm text-white transition rounded bg-white/20 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <select className="px-2 py-1.5 text-sm text-white transition rounded bg-white/20 focus:outline-none hover:bg-white/30 focus:ring-2 focus:ring-white/50">
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
              <Activity className="w-8 h-8 mr-3 text-cyan-500 animate-spin" />
              <span>Cargando pacientes...</span>
            </div>
          ) : paginatedPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Users className="w-8 h-8 mb-2 opacity-40" />
              <span>No se encontraron pacientes</span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#084a8a] border-b border-[#084a8a]/50">
                <tr>
                  <th className="px-2 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPatients.size === paginatedPatients.length && paginatedPatients.length > 0}
                      onChange={handleSelectAll}
                      className="w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                  <th className="px-2 py-2 text-left text-white border-r border-[#084a8a]/50">Orden</th>
                  <th className="px-2 py-2 text-left text-white border-r border-[#084a8a]/50">Apellidos y Nombres</th>
                  <th className="px-2 py-2 text-left text-white border-r border-[#084a8a]/50">DNI</th>
                  <th className="px-2 py-2 text-left text-white border-r border-[#084a8a]/50">Género</th>
                  <th className="px-2 py-2 text-center text-white border-r border-[#084a8a]/50">Edad</th>
                  <th className="px-2 py-2 text-left text-white border-r border-[#084a8a]/50">Teléfono</th>
                  <th className="px-2 py-2 text-left text-white border-r border-[#084a8a]/50">Estrategia</th>
                  <th className="px-2 py-2 text-left text-white border-r border-[#084a8a]/50">IPRESS de Adscripción</th>
                  <th className="px-2 py-2 text-center text-white">Estado</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.map((paciente, idx) => (
                  <tr
                    key={`${paciente.pkAsegurado}_${idx}`}
                    className={`border-b border-blue-100 transition hover:bg-blue-50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedPatients.has(paciente.pkAsegurado)}
                        onChange={() => handleSelectPatient(paciente.pkAsegurado)}
                        className="w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="px-2 py-2 text-gray-900 border-r border-blue-100">{idx + 1}</td>
                    <td className="px-2 py-2 border-r border-blue-100">
                      <div className="text-sm text-gray-900 truncate" title={paciente.apellidosNombres}>
                        {paciente.apellidosNombres}
                      </div>
                      <div className="mt-0.5">
                        {paciente.requiereTelemonitoreo && (
                          <span className="inline-block px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                            TELEMONITOREO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-900 border-r border-blue-100">
                      {paciente.numDoc}
                    </td>
                    <td className="px-2 py-2 text-sm text-left text-gray-900 border-r border-blue-100">
                      {paciente.sexo || "N/A"}
                    </td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-blue-100">
                      {paciente.edad}
                    </td>
                    <td className="px-2 py-2 text-sm text-left text-gray-900 border-r border-blue-100">
                      {paciente.telefono || "N/A"}
                    </td>
                    <td className="px-2 py-2 text-left border-r border-blue-100">
                      {paciente.requiereTelemonitoreo ? (
                        <span className="inline-block px-1.5 py-0.5 text-xs font-bold text-purple-700 bg-purple-100 rounded">
                          CENACRON
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-sm text-left text-gray-700 border-r border-blue-100">
                      {paciente.ipress || "N/A"}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {paciente.estadoEnfermeria === "ATENDIDO" ? (
                        <span className="inline-block px-2 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded whitespace-nowrap">
                          ATENDIDO
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAttend(paciente)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition cursor-pointer whitespace-nowrap ${
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
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
            <div className="text-sm font-semibold text-gray-700">
              Mostrando {currentPage * pageSize + 1} a{" "}
              {Math.min((currentPage + 1) * pageSize, filteredPatients.length)} de{" "}
              {filteredPatients.length} entradas
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-1 transition border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-2 py-1 text-sm rounded font-semibold transition ${
                    currentPage === i
                      ? "bg-[#084a8a] text-white shadow-md"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-1 transition border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
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
