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
  Server,
  HardDrive,
  RefreshCw,
  Wifi,
  WifiOff,
  Cpu,
  MemoryStick,
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
  const [systemHealth, setSystemHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState(null);

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
  // 📋 Cargar logs recientes (usando endpoint de auditoría completo)
  // ============================================================
  useEffect(() => {
    const loadRecentLogs = async () => {
      setLoadingLogs(true);
      try {
        // Usar el endpoint de auditoría que devuelve información más completa
        const logs = await auditoriaService.getUltimos(20);
        console.log("📋 Logs de auditoría cargados:", logs);
        setRecentLogs(Array.isArray(logs) ? logs.slice(0, 8) : []); // Mostrar los 8 más recientes
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
  // 🖥️ Cargar estado del sistema (System Health)
  // ============================================================
  const loadSystemHealth = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const healthData = await apiClient.get("/admin/dashboard/system-health", true);
      console.log("🖥️ System Health:", healthData);
      setSystemHealth(healthData);
    } catch (error) {
      console.error("Error cargando estado del sistema:", error);
      setHealthError(error.message || "Error al cargar estado del sistema");
      setSystemHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    loadSystemHealth();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadSystemHealth, 30000);
    return () => clearInterval(interval);
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
  // 🎨 Obtener icono y color según acción (mejorado)
  // ============================================================
  const getLogStyle = (log) => {
    const accion = (log.accion || log.action || '').toUpperCase();
    const nivel = (log.nivel || '').toLowerCase();
    const estado = (log.estado || '').toLowerCase();

    // Acciones de creación/aprobación/éxito
    if (accion.includes('CREATE') || accion.includes('APPROVE') || accion.includes('ACTIVATE') ||
        accion.includes('UNLOCK') || estado === 'success') {
      return {
        icon: CheckCircle2,
        color: "text-green-600",
        bg: "bg-green-100",
      };
    }

    // Login exitoso
    if (accion === 'LOGIN' && estado !== 'failure') {
      return {
        icon: Shield,
        color: "text-blue-600",
        bg: "bg-blue-100",
      };
    }

    // Acciones de actualización/cambio de contraseña
    if (accion.includes('UPDATE') || accion.includes('PASSWORD') || accion.includes('CHANGE')) {
      return {
        icon: Lock,
        color: "text-purple-600",
        bg: "bg-purple-100",
      };
    }

    // Acciones de eliminación/rechazo/desactivación
    if (accion.includes('DELETE') || accion.includes('REJECT') || accion.includes('DEACTIVATE') ||
        accion.includes('CLEANUP')) {
      return {
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-100",
      };
    }

    // Login fallido / Errores
    if (accion.includes('FAILED') || nivel === 'error' || estado === 'failure') {
      return {
        icon: AlertCircle,
        color: "text-amber-600",
        bg: "bg-amber-100",
      };
    }

    // Logout
    if (accion === 'LOGOUT') {
      return {
        icon: Activity,
        color: "text-gray-600",
        bg: "bg-gray-100",
      };
    }

    // Por defecto
    return {
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-100",
    };
  };

  // ============================================================
  // 📝 Formatear acción del log (versión ejecutiva)
  // ============================================================
  const formatAccionEjecutiva = (log) => {
    const accion = (log.accion || log.action || '').toUpperCase();

    // Mapeo de acciones a descripciones ejecutivas cortas
    const acciones = {
      'LOGIN': 'Inicio de sesión',
      'LOGIN_FAILED': 'Acceso denegado',
      'LOGOUT': 'Cierre de sesión',
      'CREATE_USER': 'Nuevo usuario creado',
      'DELETE_USER': 'Usuario eliminado',
      'ACTIVATE_USER': 'Usuario activado',
      'DEACTIVATE_USER': 'Usuario desactivado',
      'UNLOCK_USER': 'Usuario desbloqueado',
      'APPROVE_REQUEST': 'Solicitud aprobada',
      'REJECT_REQUEST': 'Solicitud rechazada',
      'DELETE_PENDING_USER': 'Pendiente eliminado',
      'CLEANUP_ORPHAN_DATA': 'Limpieza de datos',
      'PASSWORD_CHANGE': 'Cambio de contraseña',
      'PASSWORD_RESET': 'Reseteo de contraseña',
      'INSERT': 'Registro creado',
      'UPDATE': 'Registro actualizado',
      'DELETE': 'Registro eliminado',
    };

    return acciones[accion] || accion || 'Acción del sistema';
  };

  // ============================================================
  // 📋 Obtener resumen del detalle (corto y ejecutivo)
  // ============================================================
  const getDetalleCorto = (log) => {
    const detalle = log.detalle || log.detalles || '';
    if (!detalle) return null;

    // Extraer información clave del detalle
    // Ejemplo: "Nuevo valor → id_permiso_mod = "16"" → "Permiso #16"
    if (detalle.includes('id_permiso_mod')) {
      const match = detalle.match(/id_permiso_mod\s*=\s*"?(\d+)"?/);
      return match ? `Permiso módulo #${match[1]}` : null;
    }
    if (detalle.includes('id_permiso_pagina')) {
      const match = detalle.match(/id_permiso_pagina\s*=\s*"?(\d+)"?/);
      return match ? `Permiso página #${match[1]}` : null;
    }
    if (detalle.includes('Usuario')) {
      const match = detalle.match(/Usuario[:\s]+(\w+)/i);
      return match ? `Usuario: ${match[1]}` : null;
    }

    // Si el detalle es corto, mostrarlo
    if (detalle.length <= 40) return detalle;

    return null;
  };

  // ============================================================
  // 👤 Obtener usuario del log
  // ============================================================
  const getLogUsuario = (log) => {
    const usuario = log.usuarioSesion || log.usuario_sesion || log.usuario || log.username;
    if (!usuario || usuario === 'N/A' || usuario.trim() === '') {
      return "SYSTEM";
    }
    return usuario;
  };

  // ============================================================
  // 👤 Obtener nombre completo del usuario
  // ============================================================
  const getNombreCompleto = (log) => {
    return log.nombreCompleto || log.nombre_completo || null;
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
        {/* Actividad Reciente - Auditoría (Diseño Ejecutivo) */}
        <div className="bg-white dark:bg-[var(--bg-primary)] rounded-3xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0A5BA9]" /> Actividad Reciente
            </h2>
            <button
              onClick={() => navigate('/admin/logs')}
              className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full font-medium transition-colors"
            >
              Ver auditoría →
            </button>
          </div>

          {loadingLogs ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-500 text-sm">Cargando...</p>
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No hay actividad reciente
            </div>
          ) : (
            <div className="space-y-1">
              {recentLogs.map((log, i) => {
                const style = getLogStyle(log);
                const IconComponent = style.icon;
                const usuario = getLogUsuario(log);
                const nombreCompleto = getNombreCompleto(log);
                const modulo = log.modulo || '';
                const detalleCorto = getDetalleCorto(log);

                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl px-3 py-2.5 transition-all cursor-default group"
                  >
                    {/* Icono */}
                    <div className={`p-1.5 ${style.bg} rounded-lg flex-shrink-0 transition-transform group-hover:scale-110`}>
                      <IconComponent className={`w-4 h-4 ${style.color}`} />
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      {/* Fila 1: Acción y módulo */}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                          {formatAccionEjecutiva(log)}
                        </span>
                        {modulo && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                            {modulo.replace('dim_', '').replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      {/* Fila 2: Usuario y detalle */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(log.fechaHora)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs font-medium text-blue-600">
                          {usuario}
                        </span>
                        {nombreCompleto && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500 truncate max-w-[120px]">
                              {nombreCompleto}
                            </span>
                          </>
                        )}
                        {detalleCorto && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500 truncate max-w-[100px]">
                              {detalleCorto}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Estado */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      log.estado?.toLowerCase() === 'success' ? 'bg-green-500' :
                      log.estado?.toLowerCase() === 'failure' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} title={log.estado || 'OK'} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer con total */}
          {recentLogs.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-400">
                Mostrando últimas {recentLogs.length} actividades
              </span>
              <span className="text-xs text-gray-400">
                Actualización automática
              </span>
            </div>
          )}
        </div>

        {/* Estado del sistema - DATOS EN TIEMPO REAL */}
        <div className="bg-white dark:bg-[var(--bg-primary)] rounded-3xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Server className="w-5 h-5 text-[#1C5B36]" /> Estado del Sistema
            </h2>
            <button
              onClick={loadSystemHealth}
              disabled={loadingHealth}
              className={`p-2 rounded-full transition-all ${
                loadingHealth
                  ? "bg-gray-100 cursor-not-allowed"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-600"
              }`}
              title="Actualizar estado"
            >
              <RefreshCw className={`w-4 h-4 ${loadingHealth ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loadingHealth && !systemHealth ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <p className="ml-3 text-gray-500 text-sm">Verificando sistemas...</p>
            </div>
          ) : healthError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <WifiOff className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-600 text-sm font-medium">Error de conexión</p>
              <p className="text-red-500 text-xs mt-1">{healthError}</p>
              <button
                onClick={loadSystemHealth}
                className="mt-3 text-xs text-red-600 hover:text-red-800 underline"
              >
                Reintentar
              </button>
            </div>
          ) : systemHealth ? (
            <div className="space-y-3">
              {/* Servidor de Aplicación */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-800 text-sm">Servidor API</span>
                  <span className="ml-auto text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {systemHealth.servidor?.ip}:{systemHealth.servidor?.puerto}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-600">Memoria:</span>
                    <span className={`font-semibold ${
                      systemHealth.servidor?.memoriaUsadaPorcentaje < 70 ? "text-green-600" :
                      systemHealth.servidor?.memoriaUsadaPorcentaje < 90 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {systemHealth.servidor?.memoriaUsadaPorcentaje?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-600">CPUs:</span>
                    <span className="font-semibold text-gray-800">{systemHealth.servidor?.cpuCores}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-semibold text-gray-800">{systemHealth.servidor?.uptime}</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Uso de memoria</span>
                      <span>{systemHealth.servidor?.memoriaUsada} / {systemHealth.servidor?.memoriaTotal}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          systemHealth.servidor?.memoriaUsadaPorcentaje < 70 ? "bg-green-500" :
                          systemHealth.servidor?.memoriaUsadaPorcentaje < 90 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${systemHealth.servidor?.memoriaUsadaPorcentaje || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Base de Datos */}
              <div className={`rounded-2xl p-4 border ${
                systemHealth.baseDatos?.conectado
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
                  : "bg-gradient-to-r from-red-50 to-rose-50 border-red-100"
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-gray-800 text-sm">Base de Datos PostgreSQL</span>
                  <span className="ml-auto text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {systemHealth.baseDatos?.host}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Estado y Latencia */}
                  <div className="flex items-center gap-2">
                    {systemHealth.baseDatos?.conectado ? (
                      <Wifi className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <WifiOff className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-semibold ${
                      systemHealth.baseDatos?.conectado ? "text-green-600" : "text-red-600"
                    }`}>
                      {systemHealth.baseDatos?.estado}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-600">Latencia:</span>
                    <span className={`font-semibold ${
                      systemHealth.baseDatos?.tiempoRespuestaMs < 50 ? "text-green-600" :
                      systemHealth.baseDatos?.tiempoRespuestaMs < 200 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {systemHealth.baseDatos?.tiempoRespuesta}
                    </span>
                  </div>

                  {/* Estadísticas de PostgreSQL */}
                  {systemHealth.baseDatos?.estadisticas && (
                    <>
                      {/* Memoria configurada */}
                      <div className="col-span-2 mt-2 pt-2 border-t border-green-200">
                        <p className="text-gray-500 font-medium mb-1">Memoria PostgreSQL:</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <MemoryStick className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-gray-600">Shared Buffers:</span>
                        <span className="font-semibold text-blue-600">
                          {systemHealth.baseDatos.estadisticas.sharedBuffers}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-gray-600">Cache Size:</span>
                        <span className="font-semibold text-purple-600">
                          {systemHealth.baseDatos.estadisticas.effectiveCacheSize}
                        </span>
                      </div>

                      {/* Tamaño BD y Cache Hit */}
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-gray-600">Tamaño BD:</span>
                        <span className="font-semibold text-indigo-600">
                          {systemHealth.baseDatos.estadisticas.tamanoBD}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-gray-600">Cache Hit:</span>
                        <span className={`font-semibold ${
                          systemHealth.baseDatos.estadisticas.cacheHitRatio > 95 ? "text-green-600" :
                          systemHealth.baseDatos.estadisticas.cacheHitRatio > 85 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {systemHealth.baseDatos.estadisticas.cacheHitRatioTexto}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          systemHealth.baseDatos.estadisticas.cacheEstado === "EXCELENTE" ? "bg-green-100 text-green-700" :
                          systemHealth.baseDatos.estadisticas.cacheEstado === "BUENO" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {systemHealth.baseDatos.estadisticas.cacheEstado}
                        </span>
                      </div>

                      {/* Conexiones del servidor PostgreSQL */}
                      <div className="col-span-2 mt-2 pt-2 border-t border-green-200">
                        <p className="text-gray-500 font-medium mb-1">Conexiones Servidor PG:</p>
                      </div>
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="text-gray-600">Activas:</span>
                          <span className="font-semibold">{systemHealth.baseDatos.estadisticas.conexionesActivasServidor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          <span className="text-gray-600">Idle:</span>
                          <span className="font-semibold">{systemHealth.baseDatos.estadisticas.conexionesInactivasServidor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Max:</span>
                          <span className="font-semibold">{systemHealth.baseDatos.estadisticas.maxConexionesPermitidas}</span>
                        </div>
                      </div>

                      {/* Uptime PostgreSQL */}
                      <div className="col-span-2 flex items-center gap-2 mt-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-gray-600">Uptime PG:</span>
                        <span className="font-semibold text-gray-700 truncate">
                          {systemHealth.baseDatos.estadisticas.uptimeServidor?.split('.')[0] || 'N/A'}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Pool HikariCP */}
                  {systemHealth.baseDatos?.pool && (
                    <div className="col-span-2 flex items-center gap-2 mt-2 pt-2 border-t border-green-200">
                      <HardDrive className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-600">Pool App (Hikari):</span>
                      <span className="font-semibold text-gray-800">
                        {systemHealth.baseDatos.pool.conexionesActivas}/{systemHealth.baseDatos.pool.maxPoolSize}
                      </span>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded ${
                        systemHealth.baseDatos.pool.estadoPool === "SALUDABLE"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {systemHealth.baseDatos.pool.estadoPool}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Servicios */}
              <div className="grid grid-cols-3 gap-2">
                {/* JWT */}
                <div className={`rounded-xl p-3 text-center border ${
                  systemHealth.servicios?.jwt?.estado === "OPERATIVO"
                    ? "bg-green-50 border-green-100"
                    : "bg-red-50 border-red-100"
                }`}>
                  <Lock className={`w-4 h-4 mx-auto mb-1 ${
                    systemHealth.servicios?.jwt?.estado === "OPERATIVO" ? "text-green-600" : "text-red-600"
                  }`} />
                  <p className="text-xs font-medium text-gray-700">JWT</p>
                  <p className={`text-xs ${
                    systemHealth.servicios?.jwt?.estado === "OPERATIVO" ? "text-green-600" : "text-red-600"
                  }`}>
                    {systemHealth.servicios?.jwt?.estado === "OPERATIVO" ? "Operativo" : "Error"}
                  </p>
                </div>

                {/* MBAC */}
                <div className={`rounded-xl p-3 text-center border ${
                  systemHealth.servicios?.mbac?.estado === "ACTIVO"
                    ? "bg-green-50 border-green-100"
                    : "bg-yellow-50 border-yellow-100"
                }`}>
                  <Shield className={`w-4 h-4 mx-auto mb-1 ${
                    systemHealth.servicios?.mbac?.estado === "ACTIVO" ? "text-green-600" : "text-yellow-600"
                  }`} />
                  <p className="text-xs font-medium text-gray-700">MBAC</p>
                  <p className={`text-xs ${
                    systemHealth.servicios?.mbac?.estado === "ACTIVO" ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {systemHealth.servicios?.mbac?.permisosConfigurados} permisos
                  </p>
                </div>

                {/* Auditoría */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                  <Activity className="w-4 h-4 mx-auto mb-1 text-green-600" />
                  <p className="text-xs font-medium text-gray-700">Auditoría</p>
                  <p className="text-xs text-green-600">
                    {systemHealth.servicios?.auditoria?.ultimaHora} logs/h
                  </p>
                </div>
              </div>

              {/* Resumen */}
              <div className={`mt-2 p-3 rounded-xl text-center ${
                systemHealth.resumen?.estadoGeneralColor === "green"
                  ? "bg-green-100 border border-green-200"
                  : "bg-yellow-100 border border-yellow-200"
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {systemHealth.resumen?.estadoGeneralColor === "green" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className={`text-sm font-semibold ${
                    systemHealth.resumen?.estadoGeneralColor === "green" ? "text-green-700" : "text-yellow-700"
                  }`}>
                    {systemHealth.resumen?.estadoGeneral}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Última verificación: {systemHealth.resumen?.timestamp}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}