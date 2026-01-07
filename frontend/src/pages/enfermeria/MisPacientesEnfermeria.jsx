// ========================================================================
// 👩‍⚕️ MisPacientesEnfermeria.jsx – Dashboard de Trabajo para Enfermería
// ✅ Versión 2.0.0 (2026-01-04) - Implementación Worklist Unificada y Tarjetas
// ========================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users, Search, Calendar, Activity, Heart,
  RefreshCw, Clock, CheckCircle2, Stethoscope, Share2, ClipboardList, FileText
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient"; // Usamos apiClient configurado
import NursingAttendModal from "./components/NursingAttendModal";
import PaginationControls from "../user/components/PaginationControls";

// Colores para Semáforos SLA
const SLA_COLORS = {
  VERDE: "bg-green-100 text-green-700 border-green-200",
  AMARILLO: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ROJO: "bg-red-100 text-red-700 border-red-200",
  NEGRO: "bg-gray-900 text-white border-gray-700",
  AZUL: "bg-blue-100 text-blue-700 border-blue-200" // Completado
};

export default function MisPacientesEnfermeria() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDIENTE"); // PENDIENTE | ATENDIDO
  const [searchTerm, setSearchTerm] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20); // 20 registros por página

  // Modal de Atención
  const [selectedPatient, setSelectedPatient] = useState(null);

  const cargarWorklist = useCallback(async () => {
    try {
      setLoading(true);
      // Convertir el estado a mayúsculas para que coincida con el backend
      const estadoParam = activeTab.toUpperCase();
      console.log("🔍 Cargando worklist con estado:", estadoParam, "activeTab:", activeTab);
      const response = await apiClient.get("/enfermeria/queue", {
        params: { estado: estadoParam }
      });

      // ✅ FIX: Compatibilidad con ambas versiones de apiClient
      // Si response es un array directamente, usarlo. Si tiene .data, usar .data
      const data = Array.isArray(response) ? response : (response.data || []);

      console.log("✅ Respuesta recibida:", data.length, "registros");
      console.log("📦 Datos completos:", data);
      setPacientes(data);
    } catch (error) {
      console.error("Error al cargar worklist:", error);
      toast.error("Error al actualizar la lista de pacientes");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    cargarWorklist();
  }, [cargarWorklist]);

  const handleAttend = (paciente) => {
    setSelectedPatient(paciente);
  };

  const handleSuccess = () => {
    cargarWorklist(); // Recargar lista al terminar atención
  };

  // Filtro local por buscador
  const filteredPatients = useMemo(() => {
    return pacientes.filter(p =>
      p.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pacienteDni?.includes(searchTerm)
    );
  }, [pacientes, searchTerm]);

  // Paginación de datos filtrados
  const paginatedPatients = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredPatients.slice(startIndex, endIndex);
  }, [filteredPatients, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize);

  // Resetear página cuando cambia el filtro o la pestaña
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, activeTab]);

  return (
    <div className="min-h-screen p-4 font-sans bg-gray-50">

      {/* 1. Header Profesional Optimizado */ }
      <header className="max-w-full mx-auto mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-lg shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900">
                Gestión de Enfermería
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 mt-0.5 text-[10px] font-bold tracking-wider text-[#0A5BA9] uppercase bg-blue-50 border border-blue-200 rounded-md">
                CENACRON
              </span>
            </div>
          </div>
          <button
            onClick={ cargarWorklist }
            className="p-2 text-gray-600 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95"
            title="Actualizar lista"
          >
            <RefreshCw className={ `w-4 h-4 transition-transform ${loading ? "animate-spin text-[#0A5BA9]" : ""}` } />
          </button>
        </div>
      </header>

      {/* 2. Tabs & Filters Profesionales */ }
      <section className="max-w-full mx-auto mb-5">
        <div className="flex items-center gap-4">
          {/* Tabs con Mejor Tipografía */}
          <div className="inline-flex p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
            <button
              onClick={ () => setActiveTab("PENDIENTE") }
              className={ `px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 flex items-center gap-2 tracking-tight ${activeTab === "PENDIENTE"
                ? "bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white shadow-md"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }` }
            >
              <ClipboardList className="w-4 h-4" />
              <span>Por Atender</span>
              { activeTab === "PENDIENTE" && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] bg-white/25 text-white font-bold backdrop-blur-sm">
                  { filteredPatients.length }
                </span>
              ) }
            </button>
            <button
              onClick={ () => setActiveTab("ATENDIDO") }
              className={ `px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 flex items-center gap-2 tracking-tight ${activeTab === "ATENDIDO"
                ? "bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white shadow-md"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }` }
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Atendidos</span>
            </button>
          </div>

          {/* Search Bar Profesional */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none left-3 top-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={ searchTerm }
              onChange={ (e) => setSearchTerm(e.target.value) }
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9]/20 focus:border-[#0A5BA9] transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-sm hover:border-gray-400"
            />
          </div>
        </div>
      </section>

      {/* 3. Cards/Grid Layout */ }
      <section className="max-w-full pb-4 mx-auto">

        { loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Activity className="w-12 h-12 mx-auto mb-3 text-green-500 animate-pulse" />
            <p className="font-medium text-gray-600">Cargando pacientes...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center border-2 border-gray-200 bg-gray-50 rounded-2xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full">
              <ClipboardList className="w-10 h-10 text-gray-300" />
            </div>
            <p className="mb-2 text-lg font-semibold text-gray-700">No hay registros en esta vista</p>
            <p className="text-sm text-gray-500">
              { activeTab === "PENDIENTE"
                ? "No tienes pacientes pendientes asignados en este momento."
                : "Aún no has atendido pacientes en este periodo." }
            </p>
          </div>
        ) : activeTab === "PENDIENTE" ? (
          // Tarjetas para pacientes pendientes
          <>
            <div className="grid grid-cols-1 gap-4">
              { paginatedPatients.map((paciente, idx) => (
                <PatientCard
                  key={ `${paciente.idOrigen}_${paciente.fechaAtencionEnfermeria || paciente.fechaBase}_${idx}` }
                  paciente={ paciente }
                  onAttend={ () => handleAttend(paciente) }
                  isPendiente={ true }
                />
              )) }
            </div>

            {/* Paginación */}
            { filteredPatients.length > 0 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={filteredPatients.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                loading={loading}
                className="px-4 py-3 border-t border-gray-200 bg-gray-50 mt-4 rounded-lg"
              />
            ) }
          </>
        ) : (
          // Tarjetas para atendidos (histórico)
          <div className="grid grid-cols-1 gap-4">
            { filteredPatients.map((paciente, idx) => (
              <PatientCard
                key={ `${paciente.idOrigen}_${paciente.fechaAtencionEnfermeria || paciente.fechaBase}_${idx}` }
                paciente={ paciente }
                onAttend={ () => handleAttend(paciente) }
                isPendiente={ false }
              />
            )) }
          </div>
        ) }

      </section>

      {/* Modal */ }
      { selectedPatient && (
        <NursingAttendModal
          paciente={ selectedPatient }
          onClose={ () => setSelectedPatient(null) }
          onSuccess={ handleSuccess }
        />
      ) }

    </div>
  );
}

// Sub-componente Card de Paciente (Diseño Simétrico)
function PatientCard({ paciente, onAttend, isPendiente }) {
  const slaColorClass = SLA_COLORS[paciente.colorSemaforo] || SLA_COLORS.NEGRO;

  return (
    <div className="transition-all duration-200 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg">
      <div className="p-5">

        {/* Header: Paciente + Semáforo */ }
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start flex-1 gap-3">
            {/* Semáforo Circular */ }
            <div className={ `w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
              paciente.colorSemaforo === "VERDE" ? "bg-green-500 animate-pulse ring-4 ring-green-100" :
              paciente.colorSemaforo === "AMARILLO" ? "bg-yellow-400 ring-4 ring-yellow-100" :
              paciente.colorSemaforo === "ROJO" ? "bg-red-500 ring-4 ring-red-100" : "bg-blue-500 ring-4 ring-blue-100"
            }` } title={ `Prioridad: ${paciente.colorSemaforo}` } />

            {/* Info del Paciente */ }
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-bold text-gray-900">
                { paciente.pacienteNombre }
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg font-mono font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  { paciente.pacienteDni }
                </span>
                { paciente.pacienteEdad && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    { paciente.pacienteEdad } años
                  </span>
                ) }
              </div>

              {/* Etiquetas Especiales */ }
              <div className="flex flex-wrap gap-2 mt-2">
                { paciente.esCronico && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-100 rounded-lg border border-purple-200">
                    <Heart className="w-3.5 h-3.5" />
                    PACIENTE CRÓNICO
                  </span>
                ) }
                { paciente.requiereTelemonitoreo && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-orange-700 bg-orange-100 rounded-lg border border-orange-200">
                    <Share2 className="w-3.5 h-3.5" />
                    TELEMONITOREO
                  </span>
                ) }
              </div>
            </div>
          </div>

          {/* Badge SLA/Estado */ }
          <div className="flex-shrink-0 ml-4">
            <span className={ `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-sm ${
              isPendiente && paciente.diasTranscurridos > 0 
                ? "bg-red-100 text-red-700 border-red-200" 
                : slaColorClass
            }` }>
              { isPendiente ? (
                <>
                  <Clock className="w-4 h-4" />
                  { paciente.diasTranscurridos > 0 ? (
                    <span className="font-bold text-red-700">Retraso: {paciente.diasTranscurridos} días</span>
                  ) : paciente.diasTranscurridos === 0 ? (
                    <span className="font-semibold text-yellow-700">Vence hoy</span>
                  ) : (
                    <span className="text-green-700">Vence en: {Math.abs(paciente.diasTranscurridos)} días</span>
                  ) }
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Atendido
                </>
              ) }
            </span>
          </div>
        </div>

        {/* Divider */ }
        <div className="my-4 border-t border-gray-100"></div>

        {/* Body: Información Clínica */ }
        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">

          {/* Diagnóstico */ }
          <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2 mb-1.5">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold tracking-wide text-blue-900 uppercase">Diagnóstico</span>
            </div>
            <p className="text-sm font-medium text-blue-800 line-clamp-2" title={ paciente.diagnostico }>
              { paciente.diagnostico }
            </p>
          </div>

          {/* Origen + Fecha */ }
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-1.5">
              <Activity className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-bold tracking-wide text-gray-900 uppercase">
                { isPendiente ? "Derivación" : "Atención" }
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Origen: <span className="font-bold text-gray-900">{ paciente.tipoOrigen.replace("_", " ") }</span>
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                { paciente.fechaBase ? new Date(paciente.fechaBase).toLocaleString('es-PE', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                }) : "N/A" }
              </p>
            </div>
          </div>
        </div>

        {/* Footer: Acción */ }
        <div className="flex justify-end">
          <button
            onClick={ onAttend }
            className={ `inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md ${
              isPendiente
                ? "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-green-200"
                : "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-700 shadow-gray-100"
            }` }
          >
            { isPendiente ? (
              <>
                <Stethoscope className="w-4 h-4" />
                Atender Paciente
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Ver Historial
              </>
            ) }
          </button>
        </div>

      </div>
    </div>
  );
}
