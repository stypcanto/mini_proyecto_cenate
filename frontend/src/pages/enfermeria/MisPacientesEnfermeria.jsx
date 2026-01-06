// ========================================================================
// 👩‍⚕️ MisPacientesEnfermeria.jsx – Dashboard de Trabajo para Enfermería
// ✅ Versión 2.0.0 (2026-01-04) - Implementación Worklist Unificada y Tarjetas
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  Users, Search, Calendar, Activity, Heart, AlertCircle,
  ArrowLeft, RefreshCw, Clock, CheckCircle2, Stethoscope, Share2, ClipboardList, FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient"; // Usamos apiClient configurado
import NursingAttendModal from "./components/NursingAttendModal";

// Colores para Semáforos SLA
const SLA_COLORS = {
  VERDE: "bg-green-100 text-green-700 border-green-200",
  AMARILLO: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ROJO: "bg-red-100 text-red-700 border-red-200",
  NEGRO: "bg-gray-900 text-white border-gray-700",
  AZUL: "bg-blue-100 text-blue-700 border-blue-200" // Completado
};

export default function MisPacientesEnfermeria() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDIENTE"); // PENDIENTE | ATENDIDO
  const [searchTerm, setSearchTerm] = useState("");

  // Modal de Atención
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    cargarWorklist();
  }, [activeTab]);

  const cargarWorklist = async () => {
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
  };

  const handleAttend = (paciente) => {
    setSelectedPatient(paciente);
  };

  const handleSuccess = () => {
    cargarWorklist(); // Recargar lista al terminar atención
  };

  // Filtro local por buscador
  const filteredPatients = pacientes.filter(p =>
    p.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pacienteDni?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">

      {/* 1. Header & Stats */ }
      <header className="max-w-7xl mx-auto mb-8">
        <button
          onClick={ () => navigate("/dashboard") }
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-green-600 rounded-lg shadow-lg shadow-green-200">
                <Activity className="w-8 h-8 text-white relative z-10" />
              </span>
              Gestión de Enfermería
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 uppercase tracking-wide">
                CENACRON
              </span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Seguimiento y control de pacientes crónicos derivados.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={ cargarWorklist }
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 shadow-sm"
              title="Actualizar lista"
            >
              <RefreshCw className={ `w-5 h-5 ${loading ? "animate-spin text-green-600" : ""}` } />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Tabs & Filters */ }
      <section className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 inline-flex">
          <button
            onClick={ () => setActiveTab("PENDIENTE") }
            className={ `px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === "PENDIENTE"
              ? "bg-green-50 text-green-700 shadow-sm ring-1 ring-green-200"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }` }
          >
            <ClipboardList className="w-4 h-4" />
            Por Atender
            <span className={ `ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "PENDIENTE" ? "bg-green-200 text-green-800" : "bg-gray-100 block"}` }>
              { activeTab === "PENDIENTE" ? filteredPatients.length : "" }
            </span>
          </button>
          <button
            onClick={ () => setActiveTab("ATENDIDO") }
            className={ `px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === "ATENDIDO"
              ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }` }
          >
            <CheckCircle2 className="w-4 h-4" />
            Atendidos (Histórico)
          </button>
        </div>

        {/* Search Bar */ }
        <div className="mt-6 relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar paciente por nombre o DNI..."
            value={ searchTerm }
            onChange={ (e) => setSearchTerm(e.target.value) }
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all shadow-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </section>

      {/* 3. Cards/Grid Layout */ }
      <section className="max-w-7xl mx-auto pb-20">

        { loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Activity className="w-12 h-12 mx-auto mb-3 text-green-500 animate-pulse" />
            <p className="text-gray-600 font-medium">Cargando pacientes...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-700 mb-2 text-lg">No hay registros en esta vista</p>
            <p className="text-sm text-gray-500">
              { activeTab === "PENDIENTE"
                ? "No tienes pacientes pendientes asignados en este momento."
                : "Aún no has atendido pacientes en este periodo." }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            { filteredPatients.map((paciente, idx) => (
              <PatientCard
                key={ paciente.idOrigen + "_" + idx }
                paciente={ paciente }
                onAttend={ () => handleAttend(paciente) }
                isPendiente={ activeTab === "PENDIENTE" }
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
    <div className="bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all duration-200">
      <div className="p-5">

        {/* Header: Paciente + Semáforo */ }
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Semáforo Circular */ }
            <div className={ `w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
              paciente.colorSemaforo === "VERDE" ? "bg-green-500 animate-pulse ring-4 ring-green-100" :
              paciente.colorSemaforo === "AMARILLO" ? "bg-yellow-400 ring-4 ring-yellow-100" :
              paciente.colorSemaforo === "ROJO" ? "bg-red-500 ring-4 ring-red-100" : "bg-blue-500 ring-4 ring-blue-100"
            }` } title={ `Prioridad: ${paciente.colorSemaforo}` } />

            {/* Info del Paciente */ }
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
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
          <div className="ml-4 flex-shrink-0">
            <span className={ `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-sm ${slaColorClass}` }>
              { isPendiente ? (
                <>
                  <Clock className="w-4 h-4" />
                  { paciente.diasTranscurridos } días
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
        <div className="border-t border-gray-100 my-4"></div>

        {/* Body: Información Clínica */ }
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* Diagnóstico */ }
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">Diagnóstico</span>
            </div>
            <p className="text-sm font-medium text-blue-800 line-clamp-2" title={ paciente.diagnostico }>
              { paciente.diagnostico }
            </p>
          </div>

          {/* Origen + Fecha */ }
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Activity className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                { isPendiente ? "Derivación" : "Atención" }
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Origen: <span className="font-bold text-gray-900">{ paciente.tipoOrigen.replace("_", " ") }</span>
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                { paciente.fechaBase ? new Date(paciente.fechaBase).toLocaleDateString('es-PE', {
                  day: '2-digit', month: 'long', year: 'numeric'
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
