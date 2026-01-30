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
} from "lucide-react";
import toast from "react-hot-toast";

export default function GestionAsegurado() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("citar");
  const [loading, setLoading] = useState(true);

  // Datos mockeados para demostración
  const metrics = [
    { label: "Total Médicos", value: "3", icon: Users, color: "bg-blue-100" },
    { label: "Médicos Disponibles", value: "2", icon: CheckCircle2, color: "bg-green-100" },
    { label: "Citas Hoy", value: "23", icon: Calendar, color: "bg-purple-100" },
    { label: "Solicitudes Pendientes", value: "1", icon: AlertCircle, color: "bg-yellow-100" },
  ];

  const medicos = [
    {
      id: 1,
      nombre: "Dr. Juan Martínez",
      especialidad: "Medicina General",
      pacientesAsignados: 12,
      citasHoy: 8,
      cita: "2026-01-28",
      hora: "Mañana",
      estado: "Disponible",
      estadoColor: "bg-green-100 text-green-800",
    },
    {
      id: 2,
      nombre: "Dra. Patricia Morales",
      especialidad: "Medicina General",
      pacientesAsignados: 15,
      citasHoy: 10,
      cita: "2026-01-29",
      hora: "Mañana",
      estado: "Ocupado",
      estadoColor: "bg-yellow-100 text-yellow-800",
    },
    {
      id: 3,
      nombre: "Dr. Carlos Méndez",
      especialidad: "Cardiología",
      pacientesAsignados: 8,
      citasHoy: 5,
      cita: "2026-01-28",
      hora: "Tarde",
      estado: "Disponible",
      estadoColor: "bg-green-100 text-green-800",
    },
  ];

  const bolsaAsignada = [
    { modulo: "Bolsa 107", pacientes: 42, estado: "Activa" },
    { modulo: "Dengue", pacientes: 18, estado: "Activa" },
    { modulo: "Reprogramaciones", pacientes: 7, estado: "Activa" },
    { modulo: "IVR", pacientes: 12, estado: "Activa" },
  ];

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
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
                onClick={() => setActiveTab("bolsa")}
                className={`flex-1 px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === "bolsa"
                    ? "bg-gray-100 text-slate-900 border-b-2 border-blue-600"
                    : "text-slate-600 hover:bg-gray-50"
                }`}
              >
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
                </div>
              )}

              {/* Tab: Bolsa Asignada */}
              {activeTab === "bolsa" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Módulos y Bolsas Asignadas
                  </h3>

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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
