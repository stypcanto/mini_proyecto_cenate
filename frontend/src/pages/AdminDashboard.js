// ========================================================================
// 🎯 AdminDashboard.jsx – Panel de Administración CENATE 2025
// ------------------------------------------------------------------------
// Dashboard profesional con UX/UI espectacular para SUPERADMIN
// Incluye estadísticas, acciones rápidas y navegación intuitiva
// ========================================================================

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import {
  Users,
  Shield,
  Activity,
  FileText,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Lock,
  Unlock,
  ChevronRight,
  Calendar,
  Database,
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

  // Cargar estadísticas del sistema
  useEffect(() => {
    const loadStats = async () => {
      try {
        const usuarios = await apiClient.get("/usuarios", true);
        const roles = await apiClient.get("/roles", true);
        
        setStats({
          usuarios: usuarios?.length || 0,
          roles: roles?.length || 0,
          permisos: 42, // TODO: endpoint de permisos
          auditorias: 1234, // TODO: endpoint de auditoría
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // 📊 Tarjetas de estadísticas principales
  const statsCards = [
    {
      icon: Users,
      label: "Usuarios Activos",
      value: stats.usuarios,
      trend: "+12%",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      icon: Shield,
      label: "Roles del Sistema",
      value: stats.roles,
      trend: "+2",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      icon: Activity,
      label: "Permisos MBAC",
      value: stats.permisos,
      trend: "+5",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      icon: FileText,
      label: "Registros de Auditoría",
      value: stats.auditorias,
      trend: "+234",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
  ];

  // ⚡ Acciones rápidas
  const quickActions = [
    {
      icon: Users,
      label: "Gestionar Usuarios",
      description: "Crear, editar y administrar usuarios del sistema",
      path: "/admin/users",
      color: "blue",
      bgGradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Shield,
      label: "Gestión de Roles",
      description: "Configurar roles y asignar permisos",
      path: "/admin/roles",
      color: "purple",
      bgGradient: "from-purple-500 to-purple-600",
    },
    {
      icon: Lock,
      label: "Control MBAC",
      description: "Sistema de permisos granulares",
      path: "/admin/mbac",
      color: "green",
      bgGradient: "from-green-500 to-green-600",
    },
    {
      icon: Activity,
      label: "Ver Permisos",
      description: "Explorar permisos del sistema",
      path: "/admin/permisos",
      color: "emerald",
      bgGradient: "from-emerald-500 to-emerald-600",
    },
    {
      icon: FileText,
      label: "Auditoría",
      description: "Revisar logs y actividad del sistema",
      path: "/admin/auditoria",
      color: "orange",
      bgGradient: "from-orange-500 to-orange-600",
    },
    {
      icon: Settings,
      label: "Configuración",
      description: "Ajustes generales del sistema",
      path: "/admin/settings",
      color: "gray",
      bgGradient: "from-gray-500 to-gray-600",
    },
  ];

  // 🔔 Actividad reciente (mock data)
  const recentActivity = [
    {
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
      text: "Usuario 'jperez' creado exitosamente",
      time: "Hace 5 minutos",
    },
    {
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      text: "Intento de acceso no autorizado detectado",
      time: "Hace 12 minutos",
    },
    {
      icon: Lock,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      text: "Permisos MBAC actualizados para rol MEDICO",
      time: "Hace 1 hora",
    },
    {
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      text: "10 nuevos usuarios registrados hoy",
      time: "Hace 2 horas",
    },
  ];

  return (
    <div className="space-y-6 p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, <span className="font-semibold">{user?.nombreCompleto || user?.username}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">Hoy</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">Ver Reportes</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {stat.trend}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <span className="inline-block w-16 h-8 bg-gray-200 animate-pulse rounded"></span>
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>

            {/* Barra de progreso decorativa */}
            <div className="h-1.5 w-full bg-gray-100">
              <div className={`h-full bg-gradient-to-r ${stat.color} w-3/4 animate-slideInFromLeft`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Acciones Rápidas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 text-left"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 bg-gradient-to-br ${action.bgGradient} rounded-xl`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-1">{action.label}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>

              <div className={`h-1 bg-gradient-to-r ${action.bgGradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Actividad Reciente
          </h2>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 ${activity.bgColor} rounded-lg flex-shrink-0`}>
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
            Ver todas las actividades →
          </button>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-green-600" />
            Estado del Sistema
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-900">API Backend</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Operativo</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-900">Base de Datos</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Conectado</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-900">Sistema MBAC</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Activo</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Última Sincronización</span>
              </div>
              <span className="text-sm text-blue-600 font-medium">Hace 2 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
