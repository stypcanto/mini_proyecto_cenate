// ========================================================================
// 📊 DashboardEnfermeria.jsx – Dashboard de Estadísticas para SUPERADMIN
// ✅ Versión 1.0.0 (2026-01-03)
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  Users, Activity, Heart, TrendingUp, Building2, Calendar,
  ArrowLeft, Loader, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { getApiBaseUrl } from "../../utils/apiUrlHelper";

const API_URL = getApiBaseUrl();

export default function DashboardEnfermeria() {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth.token");

      const response = await axios.get(
        `${API_URL}/enfermeria/estadisticas`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.status === 200) {
        setEstadisticas(response.data.data);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      toast.error("Error al cargar las estadísticas de enfermería");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <div className="flex justify-center items-center py-20">
          <Loader className="w-8 h-8 text-green-600 animate-spin" />
          <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se pudieron cargar las estadísticas
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta recargar la página o contacta con soporte
            </p>
            <button
              onClick={cargarEstadisticas}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver al Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Estadísticas de Enfermería</h1>
              <p className="text-gray-600 mt-1">
                Vista general del módulo de enfermería - Datos agregados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Enfermeras */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {estadisticas.totalEnfermeras}
          </div>
          <div className="text-sm text-gray-600">
            {estadisticas.totalEnfermeras === 1 ? "Enfermera activa" : "Enfermeras activas"}
          </div>
        </div>

        {/* Total Pacientes */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {estadisticas.totalPacientesAtendidos}
          </div>
          <div className="text-sm text-gray-600">
            {estadisticas.totalPacientesAtendidos === 1 ? "Paciente atendido" : "Pacientes atendidos"}
          </div>
        </div>

        {/* Total Atenciones */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {estadisticas.totalAtenciones}
          </div>
          <div className="text-sm text-gray-600">
            {estadisticas.totalAtenciones === 1 ? "Atención registrada" : "Atenciones registradas"}
          </div>
        </div>

        {/* Pacientes con Telemonitoreo */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {estadisticas.pacientesConTelemonitoreo}
          </div>
          <div className="text-sm text-gray-600">
            Con telemonitoreo
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por IPRESS */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Distribución por IPRESS
            </h3>
          </div>

          {estadisticas.distribucionPorIpress && estadisticas.distribucionPorIpress.length > 0 ? (
            <div className="space-y-4">
              {estadisticas.distribucionPorIpress.map((ipress, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {ipress.nombreIpress}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {ipress.totalAtenciones} {ipress.totalAtenciones === 1 ? "atención" : "atenciones"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>Código: {ipress.codigoIpress}</span>
                    <span>•</span>
                    <span>{ipress.pacientesUnicos} {ipress.pacientesUnicos === 1 ? "paciente" : "pacientes"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay datos de distribución por IPRESS
            </div>
          )}
        </div>

        {/* Atenciones por Mes */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Últimos 6 Meses
            </h3>
          </div>

          {estadisticas.atencionesUltimos6Meses && estadisticas.atencionesUltimos6Meses.length > 0 ? (
            <div className="space-y-4">
              {estadisticas.atencionesUltimos6Meses.map((mes, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {formatearMes(mes.mes)}
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      {mes.totalAtenciones} {mes.totalAtenciones === 1 ? "atención" : "atenciones"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {mes.pacientesUnicos} {mes.pacientesUnicos === 1 ? "paciente único" : "pacientes únicos"}
                  </div>
                  {/* Barra de progreso visual */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (mes.totalAtenciones / Math.max(...estadisticas.atencionesUltimos6Meses.map(m => m.totalAtenciones))) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay datos de atenciones mensuales
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Formatear mes de YYYY-MM a texto legible
 */
function formatearMes(mesStr) {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const [year, month] = mesStr.split("-");
  const mesIndex = parseInt(month) - 1;

  return `${meses[mesIndex]} ${year}`;
}
