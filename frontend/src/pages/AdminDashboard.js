// ========================================================================
// 🎯 AdminDashboard.jsx – CENATE 2025 PROFESSIONAL EDITION
// ------------------------------------------------------------------------
// Dashboard administrativo completo con todas las capacidades MBAC
// Diseño moderno y profesional inspirado en sistemas enterprise
// ========================================================================

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Activity,
  FileText,
  Bell,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
  Briefcase,
  Building2,
  GraduationCap,
  Settings,
  Database,
  Lock,
  UserCog,
  FileCheck,
  BarChart3,
  Zap,
  Layers,
  Globe,
  HardDrive,
  MessageSquare,
  Ticket,
  Server,
  Eye,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");

  // 📊 Estadísticas principales (4 más grandes)
  const mainStats = [
    { 
      icon: Users, 
      label: "Usuarios Totales", 
      value: "3", 
      trend: "+12%", 
      trendLabel: "vs mes anterior",
      color: "#0A5BA9",
      gradient: "from-blue-500 to-blue-600"
    },
    { 
      icon: Shield, 
      label: "Roles Configurados", 
      value: "8", 
      trend: "+2", 
      trendLabel: "nuevos este mes",
      color: "#8B5CF6",
      gradient: "from-purple-500 to-purple-600"
    },
    { 
      icon: Activity, 
      label: "Permisos MBAC", 
      value: "42", 
      trend: "+5", 
      trendLabel: "permisos activos",
      color: "#10B981",
      gradient: "from-green-500 to-emerald-600"
    },
    { 
      icon: FileText, 
      label: "Registros Auditoría", 
      value: "1.2K", 
      trend: "+234", 
      trendLabel: "últimas 24h",
      color: "#F59E0B",
      gradient: "from-amber-500 to-orange-600"
    },
  ];

  // 📈 Estadísticas secundarias (mini cards)
  const secondaryStats = [
    { icon: Building2, label: "IPRESS", value: "156", color: "#3B82F6" },
    { icon: Briefcase, label: "Áreas", value: "24", color: "#8B5CF6" },
    { icon: GraduationCap, label: "Profesiones", value: "18", color: "#10B981" },
    { icon: Layers, label: "Regímenes", value: "6", color: "#F59E0B" },
    { icon: MessageSquare, label: "Mensajes", value: "89", color: "#EC4899" },
    { icon: Ticket, label: "Tickets", value: "12", color: "#EF4444" },
  ];

  // 🎯 Módulos principales (acciones rápidas mejoradas)
  const mainModules = [
    { 
      icon: Users, 
      label: "Gestión de Usuarios", 
      description: "Crear, editar y administrar usuarios",
      count: 3,
      color: "blue", 
      gradient: "from-blue-500 to-blue-600",
      path: "/admin/usuarios" 
    },
    { 
      icon: Shield, 
      label: "Control de Roles", 
      description: "Configurar roles y jerarquías",
      count: 8,
      color: "purple", 
      gradient: "from-purple-500 to-purple-600",
      path: "/admin/roles" 
    },
    { 
      icon: Activity, 
      label: "Sistema MBAC", 
      description: "Permisos por módulo, página y acción",
      count: 42,
      color: "green", 
      gradient: "from-green-500 to-emerald-600",
      path: "/admin/permisos" 
    },
    { 
      icon: FileText, 
      label: "Auditoría Completa", 
      description: "Logs y trazabilidad del sistema",
      count: 1200,
      color: "orange", 
      gradient: "from-amber-500 to-orange-600",
      path: "/admin/auditoria" 
    },
  ];

  // 🔧 Gestión administrativa avanzada
  const advancedModules = [
    { 
      icon: Building2, 
      label: "Gestión de IPRESS", 
      description: "Instituciones prestadoras de salud",
      path: "/admin/ipress",
      color: "#3B82F6"
    },
    { 
      icon: Briefcase, 
      label: "Áreas y Departamentos", 
      description: "Organización institucional",
      path: "/admin/areas",
      color: "#8B5CF6"
    },
    { 
      icon: GraduationCap, 
      label: "Profesiones Médicas", 
      description: "Catálogo de especialidades",
      path: "/admin/profesiones",
      color: "#10B981"
    },
    { 
      icon: Layers, 
      label: "Regímenes Laborales", 
      description: "Tipos de contratación",
      path: "/admin/regimenes",
      color: "#F59E0B"
    },
    { 
      icon: UserCog, 
      label: "Personal CNT", 
      description: "Gestión de personal CENATE",
      path: "/admin/personal",
      color: "#EC4899"
    },
    { 
      icon: Settings, 
      label: "Parámetros Sistema", 
      description: "Configuración general",
      path: "/admin/parametros",
      color: "#6366F1"
    },
  ];

  // 🛡️ Herramientas de seguridad
  const securityTools = [
    { 
      icon: Lock, 
      label: "Gestión de Seguridad", 
      description: "Políticas y controles",
      path: "/admin/seguridad" 
    },
    { 
      icon: Database, 
      label: "Backups del Sistema", 
      description: "Respaldos automáticos",
      path: "/admin/backups" 
    },
    { 
      icon: Server, 
      label: "Configurar Sistema", 
      description: "Ajustes avanzados",
      path: "/admin/configuracion" 
    },
  ];

  // 🕒 Actividad reciente (expandida)
  const recentActivity = [
    { 
      action: "Usuario 'jperez' creado", 
      time: "Hace 5 min", 
      icon: Users,
      type: "success",
      user: "scantor"
    },
    { 
      action: "Rol 'COORDINADOR' actualizado", 
      time: "Hace 15 min", 
      icon: Shield,
      type: "info",
      user: "admin"
    },
    { 
      action: "42 permisos MBAC sincronizados", 
      time: "Hace 1 hora", 
      icon: Activity,
      type: "success",
      user: "sistema"
    },
    { 
      action: "Backup automático completado", 
      time: "Hace 2 horas", 
      icon: Database,
      type: "success",
      user: "sistema"
    },
    { 
      action: "Nueva IPRESS registrada", 
      time: "Hace 3 horas", 
      icon: Building2,
      type: "info",
      user: "scantor"
    },
  ];

  // 🎨 Estados del sistema
  const systemStatus = [
    { label: "Autenticación JWT", status: "Operativo", uptime: "99.9%", color: "green" },
    { label: "Base de Datos", status: "Operativo", uptime: "100%", color: "green" },
    { label: "API Rest", status: "Operativo", uptime: "99.8%", color: "green" },
    { label: "Sistema MBAC", status: "Operativo", uptime: "100%", color: "green" },
    { label: "Auditoría", status: "Operativo", uptime: "100%", color: "green" },
  ];

  const handleNavigate = (path) => {
    if (path) navigate(path);
  };

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors min-h-screen">
      {/* ========== HEADER ========== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            Dashboard Administrativo
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2 ml-15">
            Bienvenido, <span className="font-semibold">{user?.nombreCompleto || user?.username}</span> · Sistema MBAC CENATE
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative p-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                     transition-all shadow-md border border-gray-200 dark:border-gray-700 group"
          >
            <Bell size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 animate-pulse" />
          </button>
          
          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-md flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span className="text-sm">Sistema Activo</span>
          </div>
        </div>
      </div>

      {/* ========== ESTADÍSTICAS PRINCIPALES ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="group relative rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                         shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}
                  >
                    <Icon size={26} className="text-white" />
                  </div>
                  <div className="text-right">
                    <div
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{
                        color: stat.color,
                        backgroundColor: `${stat.color}15`,
                        border: `1.5px solid ${stat.color}30`,
                      }}
                    >
                      {stat.trend}
                    </div>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.trendLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========== ESTADÍSTICAS SECUNDARIAS ========== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {secondaryStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========== SECCIÓN PRINCIPAL ========== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* MÓDULOS PRINCIPALES - 2/3 width */}
        <div className="xl:col-span-2 space-y-6">
          {/* 🎯 Módulos principales MBAC */}
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Zap className="w-6 h-6 text-amber-500" />
                Módulos Principales
              </h3>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                Sistema MBAC
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mainModules.map((module, idx) => {
                const Icon = module.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleNavigate(module.path)}
                    className={`group relative p-6 rounded-2xl bg-gradient-to-br ${module.gradient} text-white
                               shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left overflow-hidden`}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Counter badge */}
                    <div className="absolute top-4 right-4 bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="text-sm font-bold text-white">{module.count.toLocaleString()}</span>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all">
                        <Icon size={24} className="text-white" />
                      </div>
                      <h4 className="text-lg font-bold mb-2">{module.label}</h4>
                      <p className="text-sm text-white/90 mb-4">{module.description}</p>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span>Acceder</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🔧 Gestión administrativa avanzada */}
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-500" />
                Gestión Administrativa
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advancedModules.map((module, idx) => {
                const Icon = module.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleNavigate(module.path)}
                    className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700
                             border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500
                             transition-all duration-200 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${module.color}15` }}
                      >
                        <Icon size={20} style={{ color: module.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 truncate">
                          {module.label}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {module.description}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🛡️ Herramientas de seguridad */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                Herramientas de Seguridad
              </h3>
              <span className="text-xs font-semibold text-red-700 dark:text-red-300 px-3 py-1 rounded-full bg-red-200 dark:bg-red-900/50">
                Nivel Alto
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {securityTools.map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleNavigate(tool.path)}
                    className="group p-5 rounded-xl bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30
                             border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700
                             shadow-sm hover:shadow-md transition-all duration-200 text-left"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                        <Icon size={20} className="text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                      {tool.label}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
                      <span>Configurar</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIDEBAR - 1/3 width */}
        <div className="space-y-6">
          {/* 💡 Estado del sistema */}
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-green-600" />
              Estado del Sistema
            </h3>
            <div className="space-y-3">
              {systemStatus.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-sm transition-all border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                        {item.label}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Uptime: {item.uptime}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-900/50 px-2 py-1 rounded-full">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 🕒 Actividad reciente */}
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Actividad Reciente
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map((activity, idx) => {
                const Icon = activity.icon;
                const typeColors = {
                  success: "from-green-500 to-emerald-500",
                  info: "from-blue-500 to-cyan-500",
                  warning: "from-amber-500 to-orange-500",
                };
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${typeColors[activity.type]} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          {activity.time}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500">·</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          por {activity.user}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🎯 Acceso rápido */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Vista Completa</h4>
                <p className="text-sm text-white/90">
                  Sistema configurado con {mainStats[2].value} permisos MBAC activos
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/permisos")}
              className="w-full mt-3 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 
                       backdrop-blur-sm font-semibold transition-all flex items-center justify-center gap-2 group"
            >
              <span>Ver Control MBAC</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
