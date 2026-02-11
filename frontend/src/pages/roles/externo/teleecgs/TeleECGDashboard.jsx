import React, { useState, useEffect } from "react";
import { Activity, Eye, Edit, RefreshCw } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import teleeckgService from "../../../../services/teleecgService";

/**
 * 🏥 TeleEKGDashboard - Dashboard Médico de Electrocardiogramas
 * Muestra SOLO datos reales del backend
 * v1.71.0 - CENATE 2026
 */
export default function TeleEKGDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ecgs, setEcgs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    observadas: 0,
    atendidas: 0,
  });

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await teleeckgService.listarImagenes();
      const ecgData = response?.content || response?.data || response || [];
      setEcgs(Array.isArray(ecgData) ? ecgData : []);

      // Calcular estadísticas REALES del backend
      const total = ecgData.length;
      const pendientes = ecgData.filter((e) => e.estado === "ENVIADA").length;
      const observadas = ecgData.filter((e) => e.estado === "OBSERVADA").length;
      const atendidas = ecgData.filter((e) => e.estado === "ATENDIDA").length;

      setStats({
        total,
        pendientes,
        observadas,
        atendidas,
      });

      console.log("✅ Dashboard cargado:", { total, pendientes, observadas, atendidas });
    } catch (error) {
      console.error("❌ Error al cargar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Resumen de Hoy
            </h1>
          </div>
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-6 h-6 text-blue-600 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* 📊 KPIs Reales del Backend */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Imágenes a analizar */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Imágenes EKG a analizar</p>
                <p className="text-4xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="text-green-200 opacity-50">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm0 8a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pacientes pendientes */}
          <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium">Pacientes pendientes</p>
                <p className="text-4xl font-bold mt-2">{stats.pendientes}</p>
              </div>
              <div className="text-slate-400 opacity-50">
                <Eye className="w-12 h-12" />
              </div>
            </div>
          </div>

          {/* Observadas */}
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Observadas</p>
                <p className="text-4xl font-bold mt-2">{stats.observadas}</p>
              </div>
              <div className="text-orange-200 opacity-50">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Atendidas */}
          <div className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Atendidas</p>
                <p className="text-4xl font-bold mt-2">{stats.atendidas}</p>
              </div>
              <div className="text-teal-200 opacity-50">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 📋 Tabla de Cargas Recientes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Cargas Recientes</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando datos...</p>
            </div>
          ) : ecgs.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No hay EKGs registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hora</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">DNI</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Paciente</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha toma EKG</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Perfil</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prioridad</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cant. Imágenes</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ecgs.map((ecg, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{ecg.fechaEnvio || "-"}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{ecg.numDocPaciente}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{ecg.nombresPaciente}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{ecg.fechaCarga || ecg.fechaEnvio || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {ecg.edadPaciente && ecg.generoPaciente ? `${ecg.edadPaciente} / ${ecg.generoPaciente}` : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`w-3 h-3 rounded-full inline-block ${ecg.esUrgente ? "bg-red-600" : "bg-green-600"}`}></span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ecg.estado === "ENVIADA" ? "bg-blue-100 text-blue-800" :
                          ecg.estado === "OBSERVADA" ? "bg-yellow-100 text-yellow-800" :
                          ecg.estado === "ATENDIDA" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {ecg.estado || "Sin estado"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold text-xs">
                          {ecg.cantidadImagenes || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors" title="Ver">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-orange-100 rounded-lg transition-colors" title="Editar">
                          <Edit className="w-4 h-4 text-orange-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
