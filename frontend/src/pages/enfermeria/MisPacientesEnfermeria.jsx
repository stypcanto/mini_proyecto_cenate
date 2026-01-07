// ========================================================================
// 👩‍⚕️ MisPacientesEnfermeria.jsx – Interfaz de Atención No Médica
// ✅ Versión 3.0.0 (2026-01-06) - Interfaz Consulta Externa + Programación
// ========================================================================

import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import {
  Users, Search, Calendar, Activity, Heart,
  RefreshCw, Clock, CheckCircle2, Stethoscope, Share2, ClipboardList,
  FileText, ChevronLeft, ChevronRight, ArrowRight, Copy
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../services/apiClient";
import NursingAttendModal from "./components/NursingAttendModal";

export default function MisPacientesEnfermeria() {
  const { usuario } = useContext(AuthContext);
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

  // Filtro por búsqueda
  const filteredPatients = useMemo(() => {
    return pacientes.filter(p =>
      p.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pacienteDni?.includes(searchTerm)
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

  const today = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen p-6 font-sans bg-white">

      {/* ========== HEADER: ATENCIÓN NO MÉDICA ========== */}
      <div className="mb-6 bg-cyan-500 text-white rounded-lg shadow-lg">
        <div className="px-6 py-6">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold tracking-wider">ATENCIÓN NO MÉDICA</h1>
          </div>

          {/* Fecha + Área Hospitalaria */}
          <div className="flex items-center justify-between border-b border-cyan-400 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold text-lg">Fecha: {today}</span>
              <button className="ml-2 p-1 bg-cyan-400 rounded hover:bg-cyan-300 transition">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Área Hospitalaria</div>
              <div className="text-xl font-bold">CONSULTA EXTERNA</div>
            </div>
          </div>

          {/* Profesional */}
          <div className="bg-cyan-400/30 rounded px-4 py-3 mb-4">
            <div className="text-sm font-semibold tracking-wide uppercase opacity-80 mb-2">Profesional</div>
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
      <div className="mb-6 bg-white border-2 border-gray-300 rounded-lg shadow-md overflow-hidden">
        <div className="bg-cyan-500 text-white px-6 py-3 font-bold tracking-wide uppercase text-sm">
          Programación Asignada
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Servicio</th>
                <th className="px-4 py-3 text-left font-bold">Actividad</th>
                <th className="px-4 py-3 text-left font-bold">Actividad Específica</th>
                <th className="px-4 py-3 text-left font-bold">Fec Turno</th>
                <th className="px-4 py-3 text-center font-bold">HorInicio</th>
                <th className="px-4 py-3 text-center font-bold">HorFin</th>
                <th className="px-4 py-3 text-left font-bold">Estado</th>
                <th className="px-4 py-3 text-left font-bold">Tipo Programación</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white hover:bg-blue-50 transition">
                <td className="px-4 py-3 font-semibold">ENFERMERÍA</td>
                <td className="px-4 py-3">ATENCIÓN NO MÉDICA</td>
                <td className="px-4 py-3">TELEMONITOREO</td>
                <td className="px-4 py-3 font-mono">{today}</td>
                <td className="px-4 py-3 text-center font-mono">08:00</td>
                <td className="px-4 py-3 text-center font-mono">14:00</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-800 font-bold rounded text-xs">
                    APROBADA POR CUPOS
                  </span>
                </td>
                <td className="px-4 py-3">PROGR. DIARIA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== RELACIÓN DE PACIENTES CITADOS ========== */}
      <div className="bg-white border-2 border-gray-300 rounded-lg shadow-md overflow-hidden">

        {/* Header con Búsqueda y Controles */}
        <div className="bg-cyan-500 text-white px-6 py-3">
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
                  className="pl-10 pr-4 py-2 rounded bg-white/20 text-white placeholder-white/60 focus:outline-none focus:bg-white/30 transition w-48 text-sm"
                />
              </div>
              <select className="px-3 py-2 bg-white/20 text-white rounded focus:outline-none text-sm hover:bg-white/30 transition">
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
              <thead className="bg-gray-200 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPatients.size === paginatedPatients.length && paginatedPatients.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 border-r border-gray-300">Orden</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 border-r border-gray-300">Acto Asist</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 border-r border-gray-300">Historia C.</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 border-r border-gray-300">Apellidos y Nombres</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-900 border-r border-gray-300">Edad</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 border-r border-gray-300">Estado</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-900 border-r border-gray-300">Estado Firma</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-900">Atender</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.map((paciente, idx) => (
                  <tr
                    key={`${paciente.idOrigen}_${idx}`}
                    className={`border-b transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                    } hover:bg-yellow-50`}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedPatients.has(paciente.idOrigen)}
                        onChange={() => handleSelectPatient(paciente.idOrigen)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-bold border-r border-gray-300">{idx + 1}</td>
                    <td className="px-4 py-3 border-r border-gray-300">
                      <span className="text-xs bg-purple-100 text-purple-900 px-2 py-1 rounded font-mono">
                        {paciente.numeroSolicitud || paciente.idOrigen}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs border-r border-gray-300">
                      {paciente.pacienteDni}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300">
                      <div className="font-semibold text-gray-900 truncate" title={paciente.pacienteNombre}>
                        {paciente.pacienteNombre}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {paciente.esCronico && (
                          <span className="inline-block px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold mr-1">
                            CRÓNICO
                          </span>
                        )}
                        {paciente.requiereTelemonitoreo && (
                          <span className="inline-block px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">
                            TELEMONITOREO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold border-r border-gray-300">
                      {paciente.pacienteEdad}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300">
                      <span className={`inline-block px-3 py-1 rounded text-xs font-bold whitespace-nowrap ${
                        paciente.diasTranscurridos > 0
                          ? "bg-red-100 text-red-800"
                          : paciente.diasTranscurridos === 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        ATENDIDA
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center border-r border-gray-300">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                        NINGUNO
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleAttend(paciente)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition active:scale-95"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        Atender
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {filteredPatients.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-300 flex items-center justify-between">
            <div className="text-sm text-gray-600 font-semibold">
              Mostrando {currentPage * pageSize + 1} a{" "}
              {Math.min((currentPage + 1) * pageSize, filteredPatients.length)} de{" "}
              {filteredPatients.length} entradas
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-3 py-1.5 rounded font-semibold transition ${
                    currentPage === i
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
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
