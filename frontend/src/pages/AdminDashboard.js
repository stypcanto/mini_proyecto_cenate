// ========================================================================
// 🎯 AdminDashboard.jsx – Panel de Administración CENATE (Estilo Apple Pro)
// ------------------------------------------------------------------------
// • Rediseño visual con armonía institucional (CENATE EsSalud).
// • Colores refinados: azul #0A5BA9, verde #1C5B36, morado #5B21B6.
// • Tipografía ligera, sombras suaves, balance visual Apple-like.
// ========================================================================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../lib/apiClient";
import auditoriaService from "../services/auditoriaService";
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
  const [ipressCount, setIpressCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // ============================================================
  // 📦 Cargar estadísticas (OPTIMIZADO - Usa endpoint de conteos)
  // ============================================================
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        // 🚀 OPTIMIZACIÓN: Usar endpoint optimizado que solo devuelve conteos
        // En lugar de cargar todos los datos, solo obtenemos los números
        const statsResponse = await apiClient.get("/admin/dashboard/stats", true);
        
        console.log("📊 Estadísticas cargadas:", statsResponse);

        setStats({
          usuarios: statsResponse?.totalUsuarios || 0,
          roles: statsResponse?.totalRoles || 0,
          permisos: statsResponse?.totalPermisos || 0,
          auditorias: statsResponse?.logsRecientes24h || 0,
        });
        setIpressCount(statsResponse?.totalIpress || 0);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
        
        // Establecer valores por defecto en caso de error
        setStats({
          usuarios: 0,
          roles: 0,
          permisos: 0,
          auditorias: 0,
        });
        setIpressCount(0);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // ============================================================
  // 📋 Cargar logs recientes
  // ============================================================
  useEffect(() => {
    const loadRecentLogs = async () => {
      setLoadingLogs(true);
      try {
        const logs = await auditoriaService.getLogsRecientes();
        setRecentLogs(logs.slice(0, 3)); // Solo mostrar los 3 más recientes
      } catch (error) {
        console.error("Error cargando logs recientes:", error);
        setRecentLogs([]);
      } finally {
        setLoadingLogs(false);
      }
    };
    loadRecentLogs();
  }, []);

  // ============================================================
  // 🕐 Formatear tiempo relativo
  // ============================================================
  const formatTimeAgo = (fechaHora) => {
    if (!fechaHora) return "Hace un momento";
    
    const now = new Date();
    const fecha = new Date(fechaHora);
    const diffMs = now - fecha;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  };

  // ============================================================
  // 🎨 Obtener icono y color según acción
  // ============================================================
  const getLogStyle = (log) => {
    const accion = log.accion?.toLowerCase() || '';
    const nivel = log.nivel?.toLowerCase() || '';
    const estado = log.estado?.toLowerCase() || '';

    // Acciones de creación/éxito
    if (accion.includes('crear') || accion.includes('creado') || accion.includes('creación') || 
        accion.includes('registrar') || accion.includes('registrado') || estado === 'exitoso' || estado === 'success') {
      return {
        icon: CheckCircle2,
        color: "text-green-600",
        bg: "bg-green-100",
      };
    }

    // Acciones de actualización/modificación
    if (accion.includes('actualizar') || accion.includes('actualizado') || accion.includes('modificar') || 
        accion.includes('modificado') || accion.includes('editar') || accion.includes('editado')) {
      return {
        icon: Lock,
        color: "text-blue-600",
        bg: "bg-blue-100",
      };
    }

    // Acciones de eliminación
    if (accion.includes('eliminar') || accion.includes('eliminado') || accion.includes('borrar') || 
        accion.includes('borrado')) {
      return {
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-100",
      };
    }

    // Acciones de acceso/autenticación
    if (accion.includes('login') || accion.includes('acceso') || accion.includes('autenticación') || 
        accion.includes('autenticado')) {
      return {
        icon: Shield,
        color: "text-blue-600",
        bg: "bg-blue-100",
      };
    }

    // Errores/alertas
    if (nivel === 'error' || nivel === 'warning' || estado === 'error' || estado === 'fallido' || 
        accion.includes('error') || accion.includes('fallo') || accion.includes('no autorizado')) {
      return {
        icon: AlertCircle,
        color: "text-amber-600",
        bg: "bg-amber-100",
      };
    }

    // Por defecto
    return {
      icon: Activity,
      color: "text-gray-600",
      bg: "bg-gray-100",
    };
  };

  // ============================================================
  // 📝 Formatear mensaje del log
  // ============================================================
  const formatLogMessage = (log) => {
    const usuario = log.usuario || 'Usuario desconocido';
    const accion = log.accion || 'Acción';
    const modulo = log.modulo || '';
    const detalles = log.detalles || '';

    // Si hay detalles, usarlos
    if (detalles) {
      return detalles;
    }

    // Construir mensaje basado en acción y módulo
    let mensaje = '';
    if (modulo) {
      mensaje = `${accion} en ${modulo}`;
    } else {
      mensaje = `${accion} por ${usuario}`;
    }

    return mensaje;
  };

  // ============================================================
  // 🎨 Tarjetas principales
  // ============================================================
  const statCards = [
    {
      icon: Users,
      label: "Usuarios Totales",
      value: stats.usuarios,
      color: "from-[#0A5BA9] to-[#2563EB]",
      text: "vs mes anterior",
      path: "/admin/users",
      clickable: true,
    },
    {
      icon: Shield,
      label: "Roles Configurados",
      value: stats.roles,
      color: "from-[#5B21B6] to-[#9333EA]",
      text: "nuevos este mes",
      path: "/admin/permisos",
      clickable: true,
    },
    {
      icon: Activity,
      label: "Permisos MBAC",
      value: stats.permisos,
      color: "from-[#1C5B36] to-[#16A34A]",
      text: "permisos activos",
      path: "/admin/mbac",
      clickable: true,
    },
    {
      icon: FileText,
      label: "Registros Auditoría",
      value: stats.auditorias,
      color: "from-[#F59E0B] to-[#F97316]",
      text: "últimas 24h",
      path: "/admin/logs",
       clickable: true,
    },
  ];

  // ============================================================
  // ⚡ Módulos principales
  // ============================================================
  const modules = [
    {
      label: "Gestión de Usuarios",
      description: "Crear, editar y administrar usuarios",
      path: "/admin/users",
      color: "from-[#0A5BA9] to-[#2563EB]",
      count: stats.usuarios,
    },
    {
      label: "Control de Roles",
      description: "Configurar roles y jerarquías",
      path: "/admin/permisos",
      color: "from-[#5B21B6] to-[#9333EA]",
      count: stats.roles,
    },
    {
      label: "Sistema MBAC",
      description: "Permisos por módulo, página y acción",
      path: "/admin/mbac",
      color: "from-[#1C5B36] to-[#16A34A]",
      count: stats.permisos,
    },
    {
      label: "Auditoría Completa",
      description: "Logs y trazabilidad del sistema",
      path: "/admin/logs",
      color: "from-[#F59E0B] to-[#F97316]",
      count: stats.auditorias,
    },
  ];


  // ============================================================
  // 🧠 Render
  // ============================================================
  return (
    <div className="min-h-screen p-8 bg-[var(--bg-secondary)] animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#0B0B0B] via-[#1E3A8A] to-[#0A5BA9] rounded-3xl p-8 shadow-xl text-white mb-8">
        <h1 className="text-3xl font-semibold mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-white" />
          Dashboard Administrativo
        </h1>
        <p className="text-blue-100 text-lg">
          Bienvenido,{" "}
          <span className="font-semibold">
            {user?.nombreCompleto || user?.username}
          </span>{" "}
          — Intranet CENATE
        </p>
      </div>

      {/* Tarjetas estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => stat.clickable && stat.path && navigate(stat.path)}
            className={`bg-white dark:bg-[var(--bg-primary)] rounded-3xl p-6 border border-gray-100 shadow-md transition-all duration-300 ${
              stat.clickable
                ? 'cursor-pointer hover:shadow-2xl hover:scale-105 hover:border-blue-300 hover:-translate-y-2'
                : 'hover:shadow-lg'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <div
                className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-md`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <Zap className="text-blue-400 w-5 h-5 opacity-80" />
            </div>
            <h3 className="text-4xl font-semibold text-gray-900 dark:text-white">
              {loading ? "…" : stat.value.toLocaleString()}
            </h3>
            <p className="text-gray-600 mt-1 font-medium">{stat.label}</p>
            <p className="text-sm text-gray-400">{stat.text}</p>
          </div>
        ))}
      </div>

      {/* Indicadores secundarios */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {[
          { icon: <Database className="w-5 h-5 text-blue-600" />, value: ipressCount, label: "IPRESS", bg: "bg-blue-50", path: "/ipress/listado", clickable: true },
          { icon: <Settings className="w-5 h-5 text-purple-600" />, value: 24, label: "Áreas", bg: "bg-purple-50" },
          { icon: <Activity className="w-5 h-5 text-green-600" />, value: 18, label: "Profesiones", bg: "bg-green-50" },
          { icon: <FileText className="w-5 h-5 text-amber-600" />, value: 6, label: "Regímenes", bg: "bg-amber-50" },
          { icon: <BarChart3 className="w-5 h-5 text-pink-600" />, value: 89, label: "Mensajes", bg: "bg-pink-50" },
          { icon: <AlertCircle className="w-5 h-5 text-red-600" />, value: 12, label: "Tickets", bg: "bg-red-50" },
        ].map((item, i) => (
          <div
            key={i}
            onClick={() => item.clickable && item.path && navigate(item.path)}
            className={`flex flex-col items-center justify-center bg-white dark:bg-[var(--bg-primary)] border border-gray-100 rounded-2xl p-4 shadow-sm transition-all duration-300 text-center ${
              item.clickable 
                ? 'cursor-pointer hover:shadow-xl hover:scale-105 hover:border-blue-400 hover:-translate-y-1' 
                : 'hover:shadow-md'
            }`}
          >
            <div className={`p-2 mb-2 rounded-xl ${item.bg} ${item.clickable ? 'transition-transform duration-300' : ''}`}>
              {item.icon}
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.value}</p>
            <p className="text-sm text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Módulos principales */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Activity className="w-6 h-6 text-[#0A5BA9]" /> Módulos Principales
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {modules.map((mod, index) => (
          <div
            key={index}
            onClick={() => navigate(mod.path)}
            className={`cursor-pointer bg-gradient-to-br ${mod.color} text-white rounded-3xl p-6 shadow-lg hover:scale-[1.02] hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{mod.label}</h3>
              <div className="bg-white/25 rounded-full px-3 py-1 text-sm">
                {mod.count}
              </div>
            </div>
            <p className="text-sm opacity-90">{mod.description}</p>
          </div>
        ))}
      </div>

      {/* Actividad reciente y estado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad */}
        <div className="bg-white dark:bg-[var(--bg-primary)] rounded-3xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0A5BA9]" /> Actividad Reciente
          </h2>
          <div className="space-y-4">
            {loadingLogs ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-500 text-sm">Cargando logs...</p>
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay actividad reciente
              </div>
            ) : (
              recentLogs.map((log, i) => {
                const style = getLogStyle(log);
                const IconComponent = style.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-2xl p-3 transition-colors"
                  >
                    <div className={`p-2 ${style.bg} rounded-lg flex-shrink-0`}>
                      <IconComponent className={`w-5 h-5 ${style.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                        {formatLogMessage(log)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatTimeAgo(log.fechaHora)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="bg-white dark:bg-[var(--bg-primary)] rounded-3xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-[#1C5B36]" /> Estado del Sistema
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
                className="flex justify-between items-center bg-green-50 px-4 py-3 rounded-2xl border border-green-100"
              >
                <span className="text-gray-800 font-medium">{sys.name}</span>
                <span className="text-sm text-[#1C5B36] font-semibold">
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