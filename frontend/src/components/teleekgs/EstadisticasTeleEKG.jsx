// ========================================================================
// 📊 EstadisticasTeleEKG.jsx – Dashboard de Estadísticas
// ✅ VERSIÓN 1.0.0 - CENATE 2026
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Calendar, Download, Loader, AlertTriangle, TrendingUp, Users
} from "lucide-react";
import toast from "react-hot-toast";
import teleekgService from "../../services/teleekgService";

const COLORS = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"];

export default function EstadisticasTeleEKG() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("mes"); // dia, semana, mes
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, [periodoSeleccionado]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const data = await teleekgService.obtenerEstadisticas();
      setEstadisticas(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      toast.error("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    try {
      toast.loading("Generando reporte...");
      const blob = await teleekgService.exportarEstadisticas(periodoSeleccionado);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `estadisticas-teleekgs-${periodoSeleccionado}.xlsx`;
      a.click();
      toast.dismiss();
      toast.success("Reporte descargado");
    } catch (error) {
      toast.error("Error al exportar reporte");
    }
  };

  const TarjetaMetrica = ({ titulo, valor, icono: Icono, color, bg }) => (
    <div className={`${bg} rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{titulo}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{valor || 0}</p>
        </div>
        <Icono className={`${color} opacity-10 w-10 h-10`} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Estadísticas del Módulo TeleEKG
          </h2>
        </div>
        <div className="flex gap-2">
          <select
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="dia">Hoy</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mes</option>
          </select>
          <button
            onClick={handleExportar}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <TarjetaMetrica
          titulo="Total Cargadas"
          valor={estadisticas?.totalImagenesCargadas}
          icono={Users}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <TarjetaMetrica
          titulo="Procesadas"
          valor={estadisticas?.totalImagenesProcesadas}
          icono={TrendingUp}
          color="text-green-600"
          bg="bg-green-50"
        />
        <TarjetaMetrica
          titulo="Rechazadas"
          valor={estadisticas?.totalImagenesRechazadas}
          icono={AlertTriangle}
          color="text-red-600"
          bg="bg-red-50"
        />
        <TarjetaMetrica
          titulo="Vinculadas"
          valor={estadisticas?.totalImagenesVinculadas}
          icono={Download}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <TarjetaMetrica
          titulo="Tasa Procesamiento"
          valor={`${Math.round((estadisticas?.totalImagenesProcesadas / Math.max(estadisticas?.totalImagenesCargadas, 1)) * 100)}%`}
          icono={TrendingUp}
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Estados */}
        {estadisticas?.datosEstados && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Distribución por Estado</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticas.datosEstados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="estado" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Pie - Proporciones */}
        {estadisticas?.datosProporcion && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Proporción de Estados</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estadisticas.datosProporcion}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {estadisticas.datosProporcion.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Línea - Tendencia Temporal */}
        {estadisticas?.datosTendencia && (
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Tendencia Temporal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={estadisticas.datosTendencia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cargadas" stroke="#3b82f6" />
                <Line type="monotone" dataKey="procesadas" stroke="#10b981" />
                <Line type="monotone" dataKey="rechazadas" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tabla de Detalles por IPRESS */}
      {estadisticas?.detallesPorIpress && estadisticas.detallesPorIpress.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Detalles por IPRESS</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">IPRESS</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Total</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Procesadas</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Rechazadas</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Tasa Aceptación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {estadisticas.detallesPorIpress.map((ipress, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{ipress.nombre}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{ipress.total}</td>
                    <td className="px-6 py-4 text-right text-green-600 font-medium">{ipress.procesadas}</td>
                    <td className="px-6 py-4 text-right text-red-600 font-medium">{ipress.rechazadas}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        ipress.tasaAceptacion >= 80
                          ? "bg-green-100 text-green-800"
                          : ipress.tasaAceptacion >= 60
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {ipress.tasaAceptacion}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Información de Volumen */}
      {estadisticas && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Volumen Total:</strong> {((estadisticas?.volumenTotalGB) || 0).toFixed(2)} GB |
            <strong className="ml-4">Promedio por Imagen:</strong> {((estadisticas?.tamanioPromedioMB) || 0).toFixed(2)} MB |
            <strong className="ml-4">Máximo:</strong> {((estadisticas?.tamanioMaximoMB) || 0).toFixed(2)} MB
          </p>
        </div>
      )}
    </div>
  );
}
