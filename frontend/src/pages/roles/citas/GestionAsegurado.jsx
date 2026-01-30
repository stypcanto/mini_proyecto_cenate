// ========================================================================
// 👤 GestionAsegurado.jsx – Gestión de Citas y Asegurados
// ========================================================================
// Rediseño v1.40.0: Tabla de médicos con citas + Bolsa Asignada
// Simplificado: Solo "Citar Paciente" y "Bolsa Asignada"
// ========================================================================

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  UserPlus,
  ChevronDown,
  RefreshCw,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

export default function GestionAsegurado() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("citar");
  const [loading, setLoading] = useState(true);
  const [medicos, setMedicos] = useState([]);
  const [citasRealizadas, setCitasRealizadas] = useState([]);
  const [bolsaAsignada, setBolsaAsignada] = useState([]);
  const [metrics, setMetrics] = useState([
    { label: "Total Médicos", value: "0", icon: Users, color: "bg-blue-100" },
    { label: "Médicos Disponibles", value: "0", icon: CheckCircle2, color: "bg-green-100" },
    { label: "Citas Hoy", value: "0", icon: Calendar, color: "bg-purple-100" },
    { label: "Solicitudes Pendientes", value: "0", icon: AlertCircle, color: "bg-yellow-100" },
  ]);
  const [error, setError] = useState(null);

  // Fetch doctors availability from API
  const fetchDoctorsAvailability = async () => {
    try {
      const response = await fetch("/api/disponibilidad?size=50", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching doctors availability");
      }

      const data = await response.json();
      const doctorsList = data?.data?.content || data?.content || [];

      // Transform to match table structure
      const transformedDoctors = doctorsList.map((doc) => ({
        id: doc.idDisponibilidad,
        nombre: doc.nombreMedico || "Sin nombre",
        especialidad: doc.nombreServicio || "No especificada",
        pacientesAsignados: Math.floor(Math.random() * 20) + 5, // Placeholder
        citasHoy: Math.floor(Math.random() * 15) + 1,
        cita: new Date().toISOString().split('T')[0],
        hora: Math.random() > 0.5 ? "Mañana" : "Tarde",
        estado: doc.estado === "ENVIADO" ? "Disponible" : "Ocupado",
        estadoColor: doc.estado === "ENVIADO"
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800",
      }));

      setMedicos(transformedDoctors);
      return transformedDoctors.length;
    } catch (err) {
      console.error("Error fetching doctors:", err);
      toast.error("Error cargando médicos disponibles");
      return 0;
    }
  };

  // Fetch today's appointments
  const fetchTodaysAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `/api/v1/chatbot/reportes/citas/buscar?fi=${today}&ff=${today}&size=100`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn("Could not fetch today's appointments");
        return 0;
      }

      const data = await response.json();
      const citasList = data?.data?.content || data?.content || [];
      return citasList.length;
    } catch (err) {
      console.error("Error fetching appointments:", err);
      return 0;
    }
  };

  // Fetch assigned bags/modules
  const fetchAssignedBags = async () => {
    try {
      const response = await fetch("/api/bolsas/solicitudes/mi-bandeja", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Fallback to mock data if endpoint not available
        const mockBags = [
          { modulo: "Bolsa 107", pacientes: 42, estado: "Activa" },
          { modulo: "Dengue", pacientes: 18, estado: "Activa" },
          { modulo: "Reprogramaciones", pacientes: 7, estado: "Activa" },
          { modulo: "IVR", pacientes: 12, estado: "Activa" },
        ];
        setBolsaAsignada(mockBags);
        return;
      }

      const data = await response.json();
      const solicitudes = data?.data?.content || data?.content || [];

      // Group by bag/module type
      const bagGroups = {};
      solicitudes.forEach((sol) => {
        const bagName = sol.descTipoBolsa || "Otros";
        if (!bagGroups[bagName]) {
          bagGroups[bagName] = { pacientes: 0, pendientes: 0 };
        }
        bagGroups[bagName].pacientes++;
        if (sol.estado === "PENDIENTE") {
          bagGroups[bagName].pendientes++;
        }
      });

      const bags = Object.entries(bagGroups).map(([modulo, data]) => ({
        modulo,
        pacientes: data.pacientes,
        estado: "Activa",
      }));

      setBolsaAsignada(bags.length > 0 ? bags : [
        { modulo: "Bolsa 107", pacientes: 42, estado: "Activa" },
        { modulo: "Dengue", pacientes: 18, estado: "Activa" },
        { modulo: "Reprogramaciones", pacientes: 7, estado: "Activa" },
        { modulo: "IVR", pacientes: 12, estado: "Activa" },
      ]);
    } catch (err) {
      console.error("Error fetching bags:", err);
      // Use mock data as fallback
      setBolsaAsignada([
        { modulo: "Bolsa 107", pacientes: 42, estado: "Activa" },
        { modulo: "Dengue", pacientes: 18, estado: "Activa" },
        { modulo: "Reprogramaciones", pacientes: 7, estado: "Activa" },
        { modulo: "IVR", pacientes: 12, estado: "Activa" },
      ]);
    }
  };

  // Calculate pending requests
  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(
        "/api/bolsas/solicitudes/mi-bandeja",
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) return 0;

      const data = await response.json();
      const solicitudes = data?.data?.content || data?.content || [];
      return solicitudes.filter(sol => sol.estado === "PENDIENTE").length;
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      return 0;
    }
  };

  // Fetch completed/realized appointments
  const fetchCitasRealizadas = async () => {
    try {
      // Get current month period
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const periodo = `${year}${month}`;

      const response = await fetch(
        `/api/v1/chatbot/reportes/citas/buscar?periodo=${periodo}&size=50`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn("Could not fetch realized appointments");
        setCitasRealizadas([]);
        return;
      }

      const data = await response.json();
      const citas = data?.data?.content || data?.content || [];

      // Transform to match table structure
      const transformedCitas = citas.map((cita) => ({
        id: cita.idSolicitud || cita.id,
        turno: cita.fechaCita || new Date().toISOString().split('T')[0],
        modalidad: cita.tipoCita || "M",
        profesional: cita.nombreProfesional || "No asignado",
        dniProfesional: cita.idPersonal || "-",
        especialidad: cita.nombreEspecialidad || "-",
        ipress: cita.nombreIpress || "-",
        estado: cita.estadoPaciente || "PENDIENTE",
        hora: cita.horaCita || "-",
        dni: cita.docPaciente || "-",
        nombrePaciente: cita.nombrePaciente || "-",
        edad: cita.edad || "-",
        genero: cita.sexo || "-",
        telefono1: cita.telefono || "-",
        telefonoWSP: cita.telefonoAlterno || "-",
      }));

      setCitasRealizadas(transformedCitas);
    } catch (err) {
      console.error("Error fetching realized appointments:", err);
      setCitasRealizadas([]);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setError(null);
        const [totalMedicos, citasHoy, pendingReqs] = await Promise.all([
          fetchDoctorsAvailability(),
          fetchTodaysAppointments(),
          fetchPendingRequests(),
        ]);

        const availableDoctors = medicos.filter(m => m.estado === "Disponible").length;

        setMetrics([
          { label: "Total Médicos", value: String(totalMedicos), icon: Users, color: "bg-blue-100" },
          { label: "Médicos Disponibles", value: String(availableDoctors), icon: CheckCircle2, color: "bg-green-100" },
          { label: "Citas Hoy", value: String(citasHoy), icon: Calendar, color: "bg-purple-100" },
          { label: "Solicitudes Pendientes", value: String(pendingReqs), icon: AlertCircle, color: "bg-yellow-100" },
        ]);

        // Fetch completed appointments
        await fetchCitasRealizadas();
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos. Por favor, intente de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {user?.nombreCompleto?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Bienvenid(a), {user?.nombreCompleto?.split(" ")[0] || "Usuario"}
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Estás en el Sistema Médico CENATE, un espacio donde podrás acceder a la información, revisar tus accesos y manejarlos actualizados durante todo el tiempo.
                </p>
                <div className="flex gap-3 mt-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                    Rol: GESTOR DE CITAS
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                    📅 {new Date().toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Citar Pacientes */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Citar Pacientes
          </h2>
          <p className="text-slate-600">
            Gestione las asignaciones médicas y programe citas para pacientes
          </p>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metrics.map((metric, idx) => {
              const IconComponent = metric.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-start gap-4"
                >
                  <div className={`${metric.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">{metric.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("citar")}
                className={`flex-1 px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === "citar"
                    ? "bg-gray-100 text-slate-900 border-b-2 border-blue-600"
                    : "text-slate-600 hover:bg-gray-50"
                }`}
              >
                Citar Paciente
              </button>
              <button
                disabled
                title="Bolsa Asignada bloqueada - Próximamente"
                className="flex-1 px-6 py-4 font-medium text-sm transition-colors text-gray-400 bg-gray-50 cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Bolsa Asignada
              </button>
            </div>

            <div className="p-6">
              {/* Tab: Citar Paciente */}
              {activeTab === "citar" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Médicos y Disponibilidad
                    </h3>
                    <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Citar Paciente
                    </button>
                  </div>

                  {/* Tabla de Médicos */}
                  {medicos.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No hay médicos disponibles en este momento</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">
                              Médico
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">
                              Especialidad
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">
                              Pacientes Asignados
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">
                              Citas Hoy
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">
                              Cita
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">
                              Estado
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicos.map((medico) => (
                            <tr key={medico.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                                    {medico.nombre.charAt(0)}
                                  </div>
                                  <span className="font-medium text-slate-900">{medico.nombre}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-600">{medico.especialidad}</td>
                              <td className="px-6 py-4 text-slate-600">{medico.pacientesAsignados}</td>
                              <td className="px-6 py-4 text-slate-600">{medico.citasHoy}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-600">
                                    📅 {medico.cita}
                                  </span>
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                    {medico.hora}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${medico.estadoColor}`}>
                                  {medico.estado}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Citas Realizadas Section */}
                  <div className="mt-10 pt-10 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      Citas Realizadas
                    </h3>

                    {citasRealizadas.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No hay citas realizadas en este período</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-blue-700 text-white sticky top-0">
                              <th className="px-4 py-3 text-left font-semibold">Turno</th>
                              <th className="px-4 py-3 text-left font-semibold">Modalidad</th>
                              <th className="px-4 py-3 text-left font-semibold">Profesional</th>
                              <th className="px-4 py-3 text-left font-semibold">DNI Prof.</th>
                              <th className="px-4 py-3 text-left font-semibold">Especialidad</th>
                              <th className="px-4 py-3 text-left font-semibold">IPRESS</th>
                              <th className="px-4 py-3 text-left font-semibold">Estado</th>
                              <th className="px-4 py-3 text-left font-semibold">Hora</th>
                              <th className="px-4 py-3 text-left font-semibold">DNI Paciente</th>
                              <th className="px-4 py-3 text-left font-semibold">Nombre Paciente</th>
                              <th className="px-4 py-3 text-left font-semibold">Edad</th>
                              <th className="px-4 py-3 text-left font-semibold">Género</th>
                              <th className="px-4 py-3 text-left font-semibold">Telf. 1</th>
                              <th className="px-4 py-3 text-left font-semibold">Telf. WSP</th>
                            </tr>
                          </thead>
                          <tbody>
                            {citasRealizadas.map((cita, idx) => (
                              <tr
                                key={cita.id || idx}
                                className={`border-b ${
                                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } hover:bg-blue-50 transition-colors`}
                              >
                                <td className="px-4 py-3 font-medium text-slate-900">
                                  {cita.turno}
                                </td>
                                <td className="px-4 py-3 text-slate-600 text-center">
                                  {cita.modalidad}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {cita.profesional}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {cita.dniProfesional}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {cita.especialidad}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {cita.ipress}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    cita.estado === "ATENDIDA"
                                      ? "bg-green-100 text-green-800"
                                      : cita.estado === "PENDIENTE"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}>
                                    {cita.estado}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {cita.hora}
                                </td>
                                <td className="px-4 py-3 text-slate-600 font-medium">
                                  {cita.dni}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {cita.nombrePaciente}
                                </td>
                                <td className="px-4 py-3 text-center text-slate-600">
                                  {cita.edad}
                                </td>
                                <td className="px-4 py-3 text-center text-slate-600">
                                  {cita.genero}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {cita.telefono1}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {cita.telefonoWSP}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Bolsa Asignada - BLOQUEADO */}
              {false && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Módulos y Bolsas Asignadas
                  </h3>

                  {bolsaAsignada.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No hay bolsas asignadas en este momento</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bolsaAsignada.map((bolsa, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-2">
                                {bolsa.modulo}
                              </h4>
                              <p className="text-slate-600 text-sm mb-3">
                                {bolsa.pacientes} pacientes
                              </p>
                              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                {bolsa.estado}
                              </span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
