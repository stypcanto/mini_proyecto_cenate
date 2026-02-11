import React, { useState, useEffect } from "react";
import { Activity, RefreshCw, Users, Calendar, AlertCircle, BarChart3 } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import teleecgService from "../../../../services/teleecgService";
import toast from "react-hot-toast";

// Importar componentes de analytics (v1.72.0)
import DiagnosticDistributionChart from "../../../../components/teleecgs/DiagnosticDistributionChart";
import ResponseTimeMetrics from "../../../../components/teleecgs/ResponseTimeMetrics";
import FilterPanelAnalytics from "../../../../components/teleecgs/FilterPanelAnalytics";
import QualityAlertCard from "../../../../components/teleecgs/QualityAlertCard";
import ComparativeExecutiveSummary from "../../../../components/teleecgs/ComparativeExecutiveSummary";

/**
 * 🏥 TeleEKGDashboard - Dashboard Analítico Médico (v1.72.0)
 *
 * Características:
 * - Resumen ejecutivo comparativo (período actual vs anterior)
 * - Distribución por hallazgos clínicos (NORMAL/ANORMAL/SIN_EVALUAR)
 * - Métricas de tiempo de respuesta (TAT, SLA)
 * - Indicadores de calidad (tasa de rechazo)
 * - Filtros dinámicos (fecha, IPRESS, evaluación, urgencia)
 * - Analytics demográficos (género, edad, estado) - compatibilidad v1.71.0
 *
 * @version 1.72.0 - CENATE 2026
 */
// Helper: Get default date range (last 30 days)
const getDefaultDateRange = () => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - 30);
  const fechaDesde = fecha.toISOString().split("T")[0];
  const fechaHasta = new Date().toISOString().split("T")[0];
  return { fechaDesde, fechaHasta };
};

export default function TeleEKGDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Estado para analytics (v1.71.0 - compatibilidad)
  const [analytics, setAnalytics] = useState({
    total: 0,
    urgentes: 0,
    noUrgentes: 0,
    porGenero: { M: 0, F: 0, otro: 0 },
    porEstado: { ENVIADA: 0, OBSERVADA: 0, ATENDIDA: 0, otro: 0 },
    porEdad: { "0-30": 0, "31-50": 0, "51-70": 0, "71+": 0 },
  });

  // Estado para advanced analytics (v1.72.0)
  const [advancedAnalytics, setAdvancedAnalytics] = useState(null);

  // Estado para filtros
  const defaultDateRange = getDefaultDateRange();
  const [filtros, setFiltros] = useState({
    fechaDesde: defaultDateRange.fechaDesde,
    fechaHasta: defaultDateRange.fechaHasta,
    idIpress: null,
    evaluacion: null,
    esUrgente: null,
  });

  const [ipressesList, setIpressesList] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    const inicializar = async () => {
      await cargarDatos();
      await cargarAnalyticsAvanzado();
    };
    inicializar();
  }, []);

  // Cargar analytics avanzado cuando cambian filtros
  useEffect(() => {
    cargarAnalyticsAvanzado();
  }, [filtros]);

  /**
   * Cargar datos demográficos (v1.71.0)
   */
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await teleecgService.listarImagenes();
      const ecgData = response?.content || response?.data || response || [];

      // Extraer lista de IPRESS única
      const ipresses = new Map();
      ecgData.forEach((ecg) => {
        if (ecg.ipressOrigen && !ipresses.has(ecg.ipressOrigen.idIpress)) {
          ipresses.set(ecg.ipressOrigen.idIpress, {
            id: ecg.ipressOrigen.idIpress,
            nombre: ecg.nombreIpress || ecg.ipressOrigen.nombre || "IPRESS Desconocida",
          });
        }
      });
      setIpressesList(Array.from(ipresses.values()));

      // Calcular analytics demográficos
      const stats = {
        total: ecgData.length,
        urgentes: ecgData.filter((e) => e.esUrgente === true).length,
        noUrgentes: ecgData.filter((e) => e.esUrgente !== true).length,
        porGenero: { M: 0, F: 0, otro: 0 },
        porEstado: { ENVIADA: 0, OBSERVADA: 0, ATENDIDA: 0, otro: 0 },
        porEdad: { "0-30": 0, "31-50": 0, "51-70": 0, "71+": 0 },
      };

      ecgData.forEach((ecg) => {
        if (ecg.generoPaciente === "M") stats.porGenero.M++;
        else if (ecg.generoPaciente === "F") stats.porGenero.F++;
        else stats.porGenero.otro++;

        if (ecg.estado === "ENVIADA") stats.porEstado.ENVIADA++;
        else if (ecg.estado === "OBSERVADA") stats.porEstado.OBSERVADA++;
        else if (ecg.estado === "ATENDIDA") stats.porEstado.ATENDIDA++;
        else stats.porEstado.otro++;

        let edad = parseInt(ecg.edadPaciente);
        if (!isNaN(edad)) {
          if (edad <= 30) stats.porEdad["0-30"]++;
          else if (edad <= 50) stats.porEdad["31-50"]++;
          else if (edad <= 70) stats.porEdad["51-70"]++;
          else stats.porEdad["71+"]++;
        }
      });

      setAnalytics(stats);
      console.log("✅ Analytics demográficos cargados:", stats);
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      toast.error("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar analytics avanzado (v1.72.0)
   * ⚠️ v1.73.0: Si el endpoint falla (no implementado), continuar con analytics básicos
   */
  const cargarAnalyticsAvanzado = async () => {
    try {
      setAnalyticsLoading(true);
      console.log("📊 Cargando analytics avanzado con filtros:", filtros);

      const data = await teleecgService.getAnalytics(filtros);
      setAdvancedAnalytics(data);
      console.log("✅ Analytics avanzado cargado:", data);
    } catch (error) {
      // ⚠️ Endpoint no implementado - usar analytics básicos en su lugar
      if (error.message && error.message.includes("No endpoint")) {
        console.warn("⚠️ Endpoint /api/teleecg/analytics no disponible - usando analytics básicos");
        setAdvancedAnalytics(null); // Desactivar componentes que dependen de este
      } else {
        console.error("❌ Error al cargar analytics avanzado:", error);
      }
    } finally {
      setAnalyticsLoading(false);
    }
  };

  /**
   * Manejar cambios en filtros
   */
  const handleFilterChange = (nuevosFiltros) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }));
  };

  /**
   * Limpiar todos los filtros
   */
  const handleClearFilters = () => {
    const dateRange = getDefaultDateRange();
    setFiltros({
      fechaDesde: dateRange.fechaDesde,
      fechaHasta: dateRange.fechaHasta,
      idIpress: null,
      evaluacion: null,
      esUrgente: null,
    });
  };

  /**
   * Filtrar por clasificación (desde gráfica de hallazgos)
   */
  const handleSegmentClick = (clasificacion) => {
    setFiltros((prev) => ({
      ...prev,
      evaluacion: clasificacion,
    }));
  };

  // Componentes reutilizables
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
              Dashboard Médico de EKGs (v1.72.0)
            </h1>
          </div>
          <button
            onClick={cargarDatos}
            disabled={loading || analyticsLoading}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refrescar datos"
          >
            <RefreshCw
              className={`w-6 h-6 text-blue-600 ${
                loading || analyticsLoading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando dashboard...</p>
          </div>
        ) : (
          <>
            {/* Panel de Filtros (v1.72.0) */}
            <FilterPanelAnalytics
              filtros={filtros}
              ipressesList={ipressesList}
              onFilterChange={handleFilterChange}
              onClear={handleClearFilters}
              loading={analyticsLoading}
            />

            {/* Resumen Ejecutivo Comparativo (v1.72.0) */}
            <ComparativeExecutiveSummary
              data={advancedAnalytics}
              loading={analyticsLoading}
            />

            {/* PRIORIDAD 1: Distribución por Hallazgos Clínicos */}
            {advancedAnalytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <DiagnosticDistributionChart
                  data={advancedAnalytics}
                  onSegmentClick={handleSegmentClick}
                  loading={analyticsLoading}
                />

                {/* PRIORIDAD 2: Métricas de Tiempo */}
                <ResponseTimeMetrics data={advancedAnalytics} loading={analyticsLoading} />
              </div>
            )}

            {/* PRIORIDAD 3: Métricas de Calidad */}
            {advancedAnalytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <QualityAlertCard data={advancedAnalytics} loading={analyticsLoading} />
                {/* Espacio reservado para componente adicional */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    📌 Próximamente
                  </h3>
                  <p className="text-gray-600">
                    Análisis adicional de tendencias históricas
                  </p>
                </div>
              </div>
            )}

            {/* KPIs Principales (v1.71.0 - Compatibilidad) */}
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
                subtitle={`${
                  analytics.total > 0
                    ? Math.round((analytics.urgentes / analytics.total) * 100)
                    : 0
                }% del total`}
                icon={AlertCircle}
                color="from-red-400 to-red-600"
              />
              <Card
                title="Casos No Urgentes"
                value={analytics.noUrgentes}
                subtitle={`${
                  analytics.total > 0
                    ? Math.round((analytics.noUrgentes / analytics.total) * 100)
                    : 0
                }% del total`}
                icon={Activity}
                color="from-green-400 to-green-600"
              />
            </div>

            {/* Análisis por Género */}
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
                    percentage={
                      analytics.total > 0 ? (analytics.porGenero.otro / analytics.total) * 100 : 0
                    }
                  />
                )}
              </div>
            </div>

            {/* Análisis por Edad */}
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

            {/* Análisis por Estado */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Distribución por Estado</h2>
              </div>
              <div className="space-y-2">
                <StatRow
                  label="📥 Pendientes (Enviadas)"
                  value={analytics.porEstado.ENVIADA}
                  percentage={
                    analytics.total > 0 ? (analytics.porEstado.ENVIADA / analytics.total) * 100 : 0
                  }
                />
                <StatRow
                  label="👀 Observadas"
                  value={analytics.porEstado.OBSERVADA}
                  percentage={
                    analytics.total > 0 ? (analytics.porEstado.OBSERVADA / analytics.total) * 100 : 0
                  }
                />
                <StatRow
                  label="✅ Atendidas"
                  value={analytics.porEstado.ATENDIDA}
                  percentage={
                    analytics.total > 0 ? (analytics.porEstado.ATENDIDA / analytics.total) * 100 : 0
                  }
                />
                {analytics.porEstado.otro > 0 && (
                  <StatRow
                    label="❓ Otro"
                    value={analytics.porEstado.otro}
                    percentage={
                      analytics.total > 0 ? (analytics.porEstado.otro / analytics.total) * 100 : 0
                    }
                  />
                )}
              </div>
            </div>

            {/* Resumen Rápido */}
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
