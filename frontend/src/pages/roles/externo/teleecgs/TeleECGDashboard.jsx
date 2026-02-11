import React, { useState, useEffect } from "react";
import { Activity, RefreshCw, Users, Calendar, AlertCircle, BarChart3 } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import teleeckgService from "../../../../services/teleecgService";

/**
 * 🏥 TeleEKGDashboard - Dashboard Analítico Médico
 * Resumen de casos por género, edad, estado, urgencia
 * v1.71.0 - CENATE 2026
 */
export default function TeleEKGDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ecgs, setEcgs] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    urgentes: 0,
    noUrgentes: 0,
    porGenero: { M: 0, F: 0, otro: 0 },
    porEstado: { ENVIADA: 0, OBSERVADA: 0, ATENDIDA: 0, otro: 0 },
    porEdad: { "0-30": 0, "31-50": 0, "51-70": 0, "71+": 0 },
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await teleeckgService.listarImagenes();
      const ecgData = response?.content || response?.data || response || [];
      setEcgs(Array.isArray(ecgData) ? ecgData : []);

      // Calcular analytics
      const stats = {
        total: ecgData.length,
        urgentes: ecgData.filter((e) => e.esUrgente === true).length,
        noUrgentes: ecgData.filter((e) => e.esUrgente !== true).length,
        porGenero: { M: 0, F: 0, otro: 0 },
        porEstado: { ENVIADA: 0, OBSERVADA: 0, ATENDIDA: 0, otro: 0 },
        porEdad: { "0-30": 0, "31-50": 0, "51-70": 0, "71+": 0 },
      };

      ecgData.forEach((ecg) => {
        // Por género
        if (ecg.generoPaciente === "M") stats.porGenero.M++;
        else if (ecg.generoPaciente === "F") stats.porGenero.F++;
        else stats.porGenero.otro++;

        // Por estado
        if (ecg.estado === "ENVIADA") stats.porEstado.ENVIADA++;
        else if (ecg.estado === "OBSERVADA") stats.porEstado.OBSERVADA++;
        else if (ecg.estado === "ATENDIDA") stats.porEstado.ATENDIDA++;
        else stats.porEstado.otro++;

        // Por edad
        let edad = parseInt(ecg.edadPaciente);
        if (!isNaN(edad)) {
          if (edad <= 30) stats.porEdad["0-30"]++;
          else if (edad <= 50) stats.porEdad["31-50"]++;
          else if (edad <= 70) stats.porEdad["51-70"]++;
          else stats.porEdad["71+"]++;
        }
      });

      setAnalytics(stats);
      console.log("✅ Dashboard analítico cargado:", stats);
    } catch (error) {
      console.error("❌ Error al cargar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const Card = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="opacity-90 text-sm font-medium">{title}</p>
          <p className="text-4xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
        </div>
        <Icon className="w-12 h-12 opacity-20" />
      </div>
    </div>
  );

  const StatRow = ({ label, value, percentage }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
      <span className="text-gray-700 font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-gray-900 font-bold w-12 text-right">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Dashboard Médico de EKGs
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

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando dashboard...</p>
          </div>
        ) : (
          <>
            {/* 📊 KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card
                title="Total de EKGs"
                value={analytics.total}
                icon={BarChart3}
                color="from-blue-400 to-blue-600"
              />
              <Card
                title="Casos Urgentes"
                value={analytics.urgentes}
                subtitle={`${analytics.total > 0 ? Math.round((analytics.urgentes / analytics.total) * 100) : 0}% del total`}
                icon={AlertCircle}
                color="from-red-400 to-red-600"
              />
              <Card
                title="Casos No Urgentes"
                value={analytics.noUrgentes}
                subtitle={`${analytics.total > 0 ? Math.round((analytics.noUrgentes / analytics.total) * 100) : 0}% del total`}
                icon={Activity}
                color="from-green-400 to-green-600"
              />
            </div>

            {/* 📈 Análisis por Género */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Distribución por Género</h2>
              </div>
              <div className="space-y-2">
                <StatRow
                  label="👨 Masculino"
                  value={analytics.porGenero.M}
                  percentage={analytics.total > 0 ? (analytics.porGenero.M / analytics.total) * 100 : 0}
                />
                <StatRow
                  label="👩 Femenino"
                  value={analytics.porGenero.F}
                  percentage={analytics.total > 0 ? (analytics.porGenero.F / analytics.total) * 100 : 0}
                />
                {analytics.porGenero.otro > 0 && (
                  <StatRow
                    label="❓ Otro"
                    value={analytics.porGenero.otro}
                    percentage={analytics.total > 0 ? (analytics.porGenero.otro / analytics.total) * 100 : 0}
                  />
                )}
              </div>
            </div>

            {/* 📅 Análisis por Edad */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Distribución por Grupos de Edad</h2>
              </div>
              <div className="space-y-2">
                <StatRow
                  label="👶 0-30 años"
                  value={analytics.porEdad["0-30"]}
                  percentage={analytics.total > 0 ? (analytics.porEdad["0-30"] / analytics.total) * 100 : 0}
                />
                <StatRow
                  label="👤 31-50 años"
                  value={analytics.porEdad["31-50"]}
                  percentage={analytics.total > 0 ? (analytics.porEdad["31-50"] / analytics.total) * 100 : 0}
                />
                <StatRow
                  label="👨‍🦱 51-70 años"
                  value={analytics.porEdad["51-70"]}
                  percentage={analytics.total > 0 ? (analytics.porEdad["51-70"] / analytics.total) * 100 : 0}
                />
                <StatRow
                  label="👴 71+ años"
                  value={analytics.porEdad["71+"]}
                  percentage={analytics.total > 0 ? (analytics.porEdad["71+"] / analytics.total) * 100 : 0}
                />
              </div>
            </div>

            {/* 📋 Análisis por Estado */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Distribución por Estado</h2>
              </div>
              <div className="space-y-2">
                <StatRow
                  label="📥 Pendientes (Enviadas)"
                  value={analytics.porEstado.ENVIADA}
                  percentage={analytics.total > 0 ? (analytics.porEstado.ENVIADA / analytics.total) * 100 : 0}
                />
                <StatRow
                  label="👀 Observadas"
                  value={analytics.porEstado.OBSERVADA}
                  percentage={analytics.total > 0 ? (analytics.porEstado.OBSERVADA / analytics.total) * 100 : 0}
                />
                <StatRow
                  label="✅ Atendidas"
                  value={analytics.porEstado.ATENDIDA}
                  percentage={analytics.total > 0 ? (analytics.porEstado.ATENDIDA / analytics.total) * 100 : 0}
                />
                {analytics.porEstado.otro > 0 && (
                  <StatRow
                    label="❓ Otro"
                    value={analytics.porEstado.otro}
                    percentage={analytics.total > 0 ? (analytics.porEstado.otro / analytics.total) * 100 : 0}
                  />
                )}
              </div>
            </div>

            {/* 📊 Resumen Rápido */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-4">📊 Resumen Ejecutivo</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total EKGs</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.total}</p>
                </div>
                <div>
                  <p className="text-gray-600">Urgentes</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.urgentes}</p>
                </div>
                <div>
                  <p className="text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{analytics.porEstado.ENVIADA}</p>
                </div>
                <div>
                  <p className="text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.porEstado.ATENDIDA}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
