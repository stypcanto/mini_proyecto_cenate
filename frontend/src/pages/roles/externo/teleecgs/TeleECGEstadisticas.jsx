import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  FileText,
  Download,
} from "lucide-react";
import teleeckgService from "../../../../services/teleecgService";

/**
 * 📊 Página de Estadísticas de TeleEKG
 */
export default function TeleEKGEstadisticas() {
  const [stats, setStats] = useState({
    total: 0,
    enviadas: 0,        // v3.0.0: Para externos
    atendidas: 0,
    rechazadas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await teleeckgService.obtenerEstadisticas();
      const statsData = response.data || response || {};
      // v3.0.0: Para usuarios externos (IPRESS/PADOMI)
      setStats({
        total: statsData.totalImagenesCargadas || statsData.total || 0,
        enviadas: statsData.totalEnviadas || statsData.totalImagenesPendientes || 0,
        atendidas: statsData.totalAtendidas || statsData.totalImagenesProcesadas || 0,
        rechazadas: statsData.totalRechazadas || statsData.totalImagenesRechazadas || 0,
      });
    } catch (error) {
      console.error("❌ Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    try {
      await teleeckgService.exportarExcel();
    } catch (error) {
      console.error("❌ Error al exportar:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                Estadísticas de EKG
              </h1>
            </div>
            <button
              onClick={handleExportar}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Resumen de electrocardiogramas registrados
          </p>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.total || 0}
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          {/* Enviadas (v3.0.0) */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Enviadas</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.enviadas || 0}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          {/* Atendidas (v3.0.0) */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Atendidas
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.atendidas || 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          {/* Rechazadas */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rechazadas</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.rechazadas || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Gráfico de Porcentajes */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Distribución de Estados
          </h2>
          <div className="space-y-6">
            {/* Enviadas (v3.0.0) */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">Enviadas</span>
                <span className="text-gray-600">
                  {stats.total > 0
                    ? ((stats.enviadas / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      stats.total > 0
                        ? (stats.enviadas / stats.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Atendidas (v3.0.0) */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">Atendidas</span>
                <span className="text-gray-600">
                  {stats.total > 0
                    ? ((stats.atendidas / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      stats.total > 0
                        ? (stats.atendidas / stats.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Rechazadas */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">Rechazadas</span>
                <span className="text-gray-600">
                  {stats.total > 0
                    ? ((stats.rechazadas / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      stats.total > 0
                        ? (stats.rechazadas / stats.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
