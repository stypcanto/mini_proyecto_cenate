// ========================================================================
// 🎯 AdminDashboard.jsx – Panel de Administración MBAC CENATE (Estilo Apple)
// ------------------------------------------------------------------------
// • Diseño restaurado con estética Apple: degradados, bordes suaves,
//   glassmorphism y tipografía clara.
// • Mantiene toda la lógica de estadísticas, autenticación y navegación.
// • Compatible con dark mode y variables CSS globales.
// ========================================================================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../lib/apiClient";
import {
  Users,
  Shield,
  Activity,
  FileText,
  Settings,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Lock,
  Database,
  Clock,
  Zap,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    usuarios: 0,
    roles: 0,
    permisos: 0,
    auditorias: 0,
  });
  const [loading, setLoading] = useState(true);

  // ============================================================
  // 📦 Cargar estadísticas del sistema
  // ============================================================
  useEffect(() => {
    const loadStats = async () => {
      try {
        const usuarios = await apiClient.get("/usuarios", true);
        const roles = await apiClient.get("/roles", true);
        setStats({
          usuarios: usuarios?.length || 0,
          roles: roles?.length || 0,
          permisos: 42, // TODO: endpoint de permisos
          auditorias: 1200, // TODO: endpoint real de auditoría
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // ============================================================
  // 🎨 Tarjetas principales de estadísticas
  // ============================================================
  const statCards = [
    {
      icon: Users,
      label: "Usuarios Totales",
      value: stats.usuarios,
      color: "from-blue-500 to-indigo-500",
      text: "vs mes anterior",
    },
    {
      icon: Shield,
      label: "Roles Configurados",
      value: stats.roles,
      color: "from-purple-500 to-fuchsia-500",
      text: "nuevos este mes",
    },
    {
      icon: Activity,
      label: "Permisos MBAC",
      value: stats.permisos,
      color: "from-green-500 to-emerald-500",
      text: "permisos activos",
    },
    {
      icon: FileText,
      label: "Registros Auditoría",
      value: stats.auditorias,
      color: "from-amber-500 to-orange-500",
      text: "últimas 24h",
    },
  ];

  // ============================================================
  // ⚡ Módulos principales (Acciones rápidas)
  // ============================================================
  const modules = [
    {
      label: "Gestión de Usuarios",
      description: "Crear, editar y administrar usuarios",
      path: "/admin/users",
      color: "from-blue-500 to-indigo-500",
      count: stats.usuarios,
    },
    {
      label: "Control de Roles",
      description: "Configurar roles y jerarquías",
      path: "/admin/roles",
      color: "from-purple-500 to-fuchsia-500",
      count: stats.roles,
    },
    {
      label: "Sistema MBAC",
      description: "Permisos por módulo, página y acción",
      path: "/admin/mbac",
      color: "from-green-500 to-emerald-500",
      count: stats.permisos,
    },
    {
      label: "Auditoría Completa",
      description: "Logs y trazabilidad del sistema",
      path: "/admin/auditoria",
      color: "from-amber-500 to-orange-500",
      count: stats.auditorias,
    },
  ];

  // ============================================================
  // 🔔 Actividad reciente (mock)
  // ============================================================
  const recentActivity = [
    {
      text: "Usuario 'jperez' creado exitosamente",
      time: "Hace 5 minutos",
      color: "text-green-600",
      bg: "bg-green-100",
      icon: CheckCircle2,
    },
    {
      text: "Intento de acceso no autorizado detectado",
      time: "Hace 12 minutos",
      color: "text-amber-600",
      bg: "bg-amber-100",
      icon: AlertCircle,
    },
    {
      text: "Permisos MBAC actualizados para rol MÉDICO",
      time: "Hace 1 hora",
      color: "text-purple-600",
      bg: "bg-purple-100",
      icon: Lock,
    },
  ];

  // ============================================================
  // 🧠 Render
  // ============================================================
  return (
    <div className="min-h-screen p-8 bg-[var(--bg-secondary)] animate-fadeIn">
      {/* Encabezado principal */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-lg text-white mb-8">
        <h1 className="text-3xl font-semibold mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-white" />
          Dashboard Administrativo
        </h1>
        <p className="text-blue-100 text-lg">
          Bienvenido, <span className="font-semibold">{user?.nombreCompleto || user?.username}</span> — Sistema MBAC CENATE
        </p>
      </div>

      {/* Sección de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-[var(--bg-primary)] border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 card-hover"
          >
            <div className="flex justify-between items-center mb-4">
              <div
                className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-md`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <Zap className="text-blue-500 w-5 h-5" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
              {loading ? "…" : stat.value.toLocaleString()}
            </h3>
            <p className="text-gray-500 mt-1">{stat.label}</p>
            <p className="text-sm text-gray-400">{stat.text}</p>
          </div>
        ))}
      </div>

      {/* Indicadores secundarios */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {[
          { icon: <Database className="w-5 h-5 text-blue-500" />, value: 156, label: "IPRESS", bg: "bg-blue-50" },
          { icon: <Settings className="w-5 h-5 text-purple-500" />, value: 24, label: "Áreas", bg: "bg-purple-50" },
          { icon: <Activity className="w-5 h-5 text-green-500" />, value: 18, label: "Profesiones", bg: "bg-green-50" },
          { icon: <FileText className="w-5 h-5 text-amber-500" />, value: 6, label: "Regímenes", bg: "bg-amber-50" },
          { icon: <BarChart3 className="w-5 h-5 text-pink-500" />, value: 89, label: "Mensajes", bg: "bg-pink-50" },
          { icon: <AlertCircle className="w-5 h-5 text-red-500" />, value: 12, label: "Tickets", bg: "bg-red-50" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white dark:bg-[var(--bg-primary)] border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className={`p-2 rounded-xl ${item.bg}`}>{item.icon}</div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.value}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de módulos principales */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Activity className="w-6 h-6 text-blue-600" /> Módulos Principales
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {modules.map((mod, index) => (
          <div
            key={index}
            onClick={() => navigate(mod.path)}
            className={`cursor-pointer bg-gradient-to-br ${mod.color} text-white rounded-3xl p-6 shadow-lg hover:scale-[1.02] transition-all duration-300`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{mod.label}</h3>
              <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                {mod.count}
              </div>
            </div>
            <p className="text-sm opacity-90">{mod.description}</p>
          </div>
        ))}
      </div>



      {/* Actividad reciente y estado del sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad reciente */}
        <div className="bg-white dark:bg-[var(--bg-primary)] rounded-3xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> Actividad Reciente
          </h2>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 hover:bg-gray-50 rounded-2xl p-3 transition-colors"
              >
                <div className={`p-2 ${a.bg} rounded-lg`}>
                  <a.icon className={`w-5 h-5 ${a.color}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{a.text}</p>
                  <p className="text-xs text-gray-500">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="bg-white dark:bg-[var(--bg-primary)] rounded-3xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" /> Estado del Sistema
          </h2>
          <div className="space-y-3">
            {[
              { name: "Autenticación JWT", status: "Operativo" },
              { name: "Base de Datos", status: "100% Conectado" },
              { name: "API Rest", status: "99.8% Uptime" },
              { name: "Sistema MBAC", status: "Activo" },
              { name: "Auditoría", status: "Sin incidencias" },
            ].map((sys, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-green-50 px-4 py-3 rounded-2xl"
              >
                <span className="text-gray-800 font-medium">{sys.name}</span>
                <span className="text-sm text-green-600 font-semibold">
                  {sys.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}