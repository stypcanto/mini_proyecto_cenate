// ========================================================================
// 📊 TeleEKGDashboard.jsx – Dashboard Módulo TeleEKG
// ✅ VERSIÓN 1.0.0 - CENATE 2026
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  Upload, List, BarChart3, AlertTriangle, CheckCircle,
  Clock, XCircle, Link2, Eye, Download, MoreVertical,
  Plus, Filter, ChevronDown, Loader, Heart, RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import teleekgService from "../../../services/teleekgService";
import UploadImagenECG from "../../../components/teleecgs/UploadImagenECG";
import ListarImagenesECG from "../../../components/teleecgs/ListarImagenesECG";
import EstadisticasTeleEKG from "../../../components/teleecgs/EstadisticasTeleEKG";

export default function TeleEKGDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inicio"); // inicio, upload, listado, estadisticas
  const [estadisticas, setEstadisticas] = useState(null);
  const [imagenesProximasVencer, setImagenesProximasVencer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarUploadModal, setMostrarUploadModal] = useState(false);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [stats, proximas] = await Promise.all([
        teleekgService.obtenerEstadisticas(),
        teleekgService.obtenerProximasVencer()
      ]);
      setEstadisticas(stats);
      setImagenesProximasVencer(proximas || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  // Tarjetas de estado
  const TarjetaEstado = ({ icon: Icon, titulo, valor, color, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{titulo}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{valor || 0}</p>
        </div>
        <Icon className={`w-12 h-12 ${color} opacity-20`} />
      </div>
    </div>
  );

  // Renderizar contenido según tab
  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return <UploadImagenECG onSuccess={cargarDatos} />;
      case "listado":
        return <ListarImagenesECG onSuccess={cargarDatos} />;
      case "estadisticas":
        return <EstadisticasTeleEKG />;
      default:
        return (
          <div className="space-y-6">
            {/* Tarjetas de Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TarjetaEstado
                icon={Upload}
                titulo="Total Cargadas"
                valor={estadisticas?.totalImagenesCargadas}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <TarjetaEstado
                icon={CheckCircle}
                titulo="Procesadas"
                valor={estadisticas?.totalImagenesProcesadas}
                color="text-green-600"
                bgColor="bg-green-50"
              />
              <TarjetaEstado
                icon={XCircle}
                titulo="Rechazadas"
                valor={estadisticas?.totalImagenesRechazadas}
                color="text-red-600"
                bgColor="bg-red-50"
              />
              <TarjetaEstado
                icon={Link2}
                titulo="Vinculadas"
                valor={estadisticas?.totalImagenesVinculadas}
                color="text-purple-600"
                bgColor="bg-purple-50"
              />
            </div>

            {/* Gráfico de Volumen */}
            {estadisticas?.datosGrafico && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Estadísticas por IPRESS</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={estadisticas.datosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name="Total Imágenes" />
                    <Bar dataKey="procesadas" fill="#10b981" name="Procesadas" />
                    <Bar dataKey="rechazadas" fill="#ef4444" name="Rechazadas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Próximas a Vencer */}
            {imagenesProximasVencer.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-yellow-800">
                      ⚠️ ECGs Próximas a Vencer ({imagenesProximasVencer.length})
                    </h4>
                    <div className="mt-3 space-y-2">
                      {imagenesProximasVencer.slice(0, 5).map((img) => (
                        <div key={img.idImagen} className="flex justify-between items-center bg-white p-3 rounded">
                          <span className="text-sm">
                            <strong>{img.numDocPaciente}</strong> - {img.diasRestantes} días restantes
                          </span>
                          <button
                            onClick={() => {
                              setActiveTab("listado");
                              window.scrollTo(0, 0);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Ver →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Acciones Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab("upload")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg p-4 flex items-center justify-center gap-3 transition"
              >
                <Upload className="w-5 h-5" />
                <span className="font-semibold">Cargar Nuevo ECG</span>
              </button>
              <button
                onClick={() => setActiveTab("listado")}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg p-4 flex items-center justify-center gap-3 transition"
              >
                <List className="w-5 h-5" />
                <span className="font-semibold">Ver Todos los ECGs</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-600" />
              Módulo TeleEKG
            </h1>
            <p className="text-gray-600 mt-1">Gestión de Electrocardiogramas para IPRESS Externas</p>
          </div>
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("inicio")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "inicio"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Inicio
            </span>
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "upload"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Cargar ECG
            </span>
          </button>
          <button
            onClick={() => setActiveTab("listado")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "listado"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Ver Listado
            </span>
          </button>
          <button
            onClick={() => setActiveTab("estadisticas")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "estadisticas"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Estadísticas
            </span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      {loading && activeTab === "inicio" ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
}
