// ========================================================================
// 📊 LogsDelSistema.jsx – Auditoría MBAC CENATE (Apple-inspired 2025)
// ------------------------------------------------------------------------
// Panel completo de logs con filtros, búsqueda y visualización detallada
// Diseño profesional con gradientes y transiciones suaves
// ========================================================================

import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Search,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Database,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import auditoriaService from "../../services/auditoriaService";

export default function LogsDelSistema() {
  const navigate = useNavigate();

  // Estados principales
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroModulo, setFiltroModulo] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [usuariosUnicos, setUsuariosUnicos] = useState([]);
  const [usuariosMap, setUsuariosMap] = useState({}); // Mapeo usuario -> nombre completo

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(20);

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    hoy: 0,
    semana: 0,
    usuarios: 0,
  });

  // ================================================================
  // 📡 CARGAR LOGS
  // ================================================================
  useEffect(() => {
    cargarLogs();
  }, []);

  const cargarLogs = async () => {
    try {
      setLoading(true);
      // Cargar más logs para asegurar que obtenemos los más recientes
      const data = await auditoriaService.getUltimos(1000);
      const logsArray = Array.isArray(data) ? data : [];
      
      // Debug: Ver la estructura del primer log
      if (logsArray.length > 0) {
        console.log('Estructura del log:', logsArray[0]);
        console.log('Total de logs cargados:', logsArray.length);
        console.log('Fecha del log más reciente:', logsArray[0].fechaHora);
        console.log('Fecha actual:', new Date().toISOString());
      }
      
      // Ordenar por fecha descendente (más reciente primero)
      logsArray.sort((a, b) => {
        const fechaA = new Date(obtenerFecha(a));
        const fechaB = new Date(obtenerFecha(b));
        return fechaB - fechaA;
      });
      
      setLogs(logsArray);

      // Extraer usuarios únicos para el filtro y crear mapeo usuario -> nombre completo
      const usuariosMap = {};
      logsArray.forEach((log) => {
        const usuario = obtenerUsuario(log);
        const nombreCompleto = log.nombreCompleto || log.nombre_completo;
        if (usuario && usuario !== 'N/A' && usuario !== 'SYSTEM') {
          // Si tiene nombre completo, lo usamos; si no, usamos el usuario
          usuariosMap[usuario] = nombreCompleto && nombreCompleto.trim() ? nombreCompleto : usuario;
        }
      });

      // Ordenar usuarios por nombre completo
      const usuarios = Object.keys(usuariosMap).sort((a, b) =>
        usuariosMap[a].localeCompare(usuariosMap[b])
      );

      setUsuariosUnicos(usuarios);
      setUsuariosMap(usuariosMap);

      // Calcular estadísticas
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const semana = new Date();
      semana.setDate(semana.getDate() - 7);

      const logsHoy = logsArray.filter((log) => {
        const fechaLog = new Date(obtenerFecha(log));
        return fechaLog >= hoy;
      });
      
      const logsSemana = logsArray.filter((log) => {
        const fechaLog = new Date(obtenerFecha(log));
        return fechaLog >= semana;
      });
      
      const usuariosUnicos = new Set(
        logsArray.map((log) => obtenerUsuario(log))
          .filter(u => u !== 'N/A')
      ).size;

      setStats({
        total: logsArray.length,
        hoy: logsHoy.length,
        semana: logsSemana.length,
        usuarios: usuariosUnicos,
      });

      toast.success(`${logsArray.length} logs cargados correctamente`);
    } catch (error) {
      console.error("Error al cargar logs:", error);
      toast.error("Error al cargar los logs del sistema");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // 🎭 FUNCIONES HELPER
  // ================================================================
  const obtenerUsuario = (log) => {
    // Priorizar usuario_sesion (viene de audit_logs.usuario), luego username (de dim_usuarios)
    const usuario = log.usuarioSesion || log.usuario_sesion || log.usuario || log.username || log.user;
    // Si no hay usuario o es vacío/null, mostrar SYSTEM
    if (!usuario || usuario === 'N/A' || usuario.trim() === '') {
      return "SYSTEM";
    }
    return usuario;
  };

  const obtenerNombreCompleto = (log) => {
    const nombreCompleto = log.nombreCompleto || log.nombre_completo;
    const usuario = obtenerUsuario(log);

    // Si es SYSTEM, devolver SYSTEM
    if (usuario === 'SYSTEM') {
      return 'SYSTEM';
    }

    // Si tiene nombre completo y no es vacío, usarlo
    if (nombreCompleto && nombreCompleto.trim() && nombreCompleto !== 'N/A') {
      return nombreCompleto;
    }

    // Si no, devolver el usuario (DNI)
    return usuario;
  };

  const obtenerFecha = (log) => {
    return log.fechaHora || log.fecha || log.timestamp || log.createdAt || null;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return "N/A";
      return new Intl.DateTimeFormat("es-PE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(date);
    } catch (error) {
      return "N/A";
    }
  };

  // ================================================================
  // 🔍 FILTRADO Y BÚSQUEDA
  // ================================================================
  const logsFiltrados = useMemo(() => {
    let resultado = [...logs];

    // Filtrar por búsqueda general
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(
        (log) =>
          log.accion?.toLowerCase().includes(termino) ||
          obtenerUsuario(log).toLowerCase().includes(termino) ||
          obtenerNombreCompleto(log).toLowerCase().includes(termino) ||
          log.modulo?.toLowerCase().includes(termino) ||
          log.detalle?.toLowerCase().includes(termino)
      );
    }

    // Filtrar por usuario
    if (filtroUsuario) {
      resultado = resultado.filter((log) =>
        obtenerUsuario(log) === filtroUsuario
      );
    }

    // Filtrar por módulo
    if (filtroModulo) {
      resultado = resultado.filter((log) =>
        log.modulo?.toLowerCase().includes(filtroModulo.toLowerCase())
      );
    }

    // Filtrar por acción
    if (filtroAccion) {
      resultado = resultado.filter((log) =>
        log.accion?.toLowerCase().includes(filtroAccion.toLowerCase())
      );
    }

    // Filtrar por rango de fechas
    if (fechaInicio) {
      resultado = resultado.filter(
        (log) => new Date(obtenerFecha(log)) >= new Date(fechaInicio)
      );
    }
    if (fechaFin) {
      resultado = resultado.filter(
        (log) => new Date(obtenerFecha(log)) <= new Date(fechaFin)
      );
    }

    // Ordenar por fecha (más reciente primero)
    resultado.sort((a, b) => new Date(obtenerFecha(b)) - new Date(obtenerFecha(a)));

    return resultado;
  }, [logs, busqueda, filtroUsuario, filtroModulo, filtroAccion, fechaInicio, fechaFin]);

  // ================================================================
  // 📄 PAGINACIÓN
  // ================================================================
  const totalPaginas = Math.ceil(logsFiltrados.length / itemsPorPagina);
  const logsPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return logsFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [logsFiltrados, paginaActual, itemsPorPagina]);

  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

  // ================================================================
  // 🎨 HELPERS
  // ================================================================
  const getIconoAccion = (accion) => {
    const accionLower = accion?.toLowerCase() || "";
    if (accionLower.includes("crear") || accionLower.includes("registr"))
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (accionLower.includes("editar") || accionLower.includes("actualiz"))
      return <Info className="w-4 h-4 text-blue-600" />;
    if (accionLower.includes("eliminar") || accionLower.includes("borrar"))
      return <XCircle className="w-4 h-4 text-red-600" />;
    if (accionLower.includes("login") || accionLower.includes("acceso"))
      return <User className="w-4 h-4 text-purple-600" />;
    return <Activity className="w-4 h-4 text-slate-600" />;
  };

  const getColorAccion = (accion) => {
    const accionLower = accion?.toLowerCase() || "";
    if (accionLower.includes("crear") || accionLower.includes("registr"))
      return "bg-green-100 text-green-800";
    if (accionLower.includes("editar") || accionLower.includes("actualiz"))
      return "bg-blue-100 text-blue-800";
    if (accionLower.includes("eliminar") || accionLower.includes("borrar"))
      return "bg-red-100 text-red-800";
    if (accionLower.includes("login") || accionLower.includes("acceso"))
      return "bg-purple-100 text-purple-800";
    return "bg-slate-100 text-slate-800";
  };

  // ================================================================
  // 🎨 HELPERS ADICIONALES
  // ================================================================

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroUsuario("");
    setFiltroModulo("");
    setFiltroAccion("");
    setFechaInicio("");
    setFechaFin("");
    setPaginaActual(1);
    toast.success("Filtros limpiados");
  };

  const exportarCSV = () => {
    const headers = ["Fecha/Hora", "Usuario", "Módulo", "Acción", "Detalle"];
    const rows = logsFiltrados.map((log) => [
      formatearFecha(obtenerFecha(log)),
      obtenerNombreCompleto(log),
      log.modulo || "N/A",
      log.accion || "N/A",
      log.detalle || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `logs_sistema_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado correctamente");
  };

  // ================================================================
  // 🎨 RENDER
  // ================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando logs del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg
                         hover:bg-blue-600 hover:text-white transition-all"
              title="Volver"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Logs del Sistema</h1>
              <p className="text-sm text-slate-600">
                Auditoría completa de actividades MBAC CENATE
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={cargarLogs}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                         rounded-lg hover:bg-blue-700 transition-all shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-900">
                  {logsFiltrados.length}
                </span>
                <span className="text-slate-600">registros</span>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* CARDS DE ESTADÍSTICAS */}
        {/* ============================================================ */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm font-medium opacity-90 mb-1">Total de Logs</p>
            <p className="text-4xl font-bold">{stats.total}</p>
            <p className="text-xs opacity-75 mt-2">Registros totales</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm font-medium opacity-90 mb-1">Hoy</p>
            <p className="text-4xl font-bold">{stats.hoy}</p>
            <p className="text-xs opacity-75 mt-2">Actividad del día</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm font-medium opacity-90 mb-1">Esta Semana</p>
            <p className="text-4xl font-bold">{stats.semana}</p>
            <p className="text-xs opacity-75 mt-2">Últimos 7 días</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <User className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm font-medium opacity-90 mb-1">Usuarios Activos</p>
            <p className="text-4xl font-bold">{stats.usuarios}</p>
            <p className="text-xs opacity-75 mt-2">Usuarios únicos</p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* FILTROS */}
        {/* ============================================================ */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filtros de Búsqueda</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Búsqueda general */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Búsqueda general
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  placeholder="Buscar en logs..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtro por usuario */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={filtroUsuario}
                  onChange={(e) => {
                    setFiltroUsuario(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             appearance-none bg-white cursor-pointer"
                >
                  <option value="">Todos los usuarios</option>
                  {usuariosUnicos.map((usuario, index) => (
                    <option key={index} value={usuario}>
                      {usuariosMap[usuario] || usuario}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-90" />
              </div>
            </div>

            {/* Filtro por módulo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Módulo
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={filtroModulo}
                  onChange={(e) => {
                    setFiltroModulo(e.target.value);
                    setPaginaActual(1);
                  }}
                  placeholder="Filtrar por módulo..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtro por acción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Acción
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={filtroAccion}
                  onChange={(e) => {
                    setFiltroAccion(e.target.value);
                    setPaginaActual(1);
                  }}
                  placeholder="Filtrar por acción..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Fecha inicio */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha inicio
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Fecha fin */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => {
                    setFechaFin(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3">
            <button
              onClick={exportarCSV}
              disabled={logsFiltrados.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white
                         rounded-lg hover:bg-emerald-700 transition-all shadow-md
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>

            {(busqueda || filtroUsuario || filtroModulo || filtroAccion || fechaInicio || fechaFin) && (
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white
                           border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Limpiar filtros
              </button>
            )}

            <div className="ml-auto text-sm text-slate-600">
              Mostrando {logsPaginados.length} de {logsFiltrados.length} registros
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* TABLA DE LOGS */}
        {/* ============================================================ */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Módulo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Acción
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Detalle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logsPaginados.length > 0 ? (
                  logsPaginados.map((log, index) => (
                    <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {formatearFecha(obtenerFecha(log))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          {obtenerNombreCompleto(log)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium">
                          {log.modulo || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          {getIconoAccion(log.accion)}
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getColorAccion(log.accion)}`}>
                            {log.accion || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">
                        {log.detalle || "Sin detalles"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium">No se encontraron logs</p>
                      <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {logsFiltrados.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Mostrando{" "}
                <span className="font-semibold text-slate-900">
                  {(paginaActual - 1) * itemsPorPagina + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(paginaActual * itemsPorPagina, logsFiltrados.length)}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-slate-900">
                  {logsFiltrados.length}
                </span>{" "}
                entradas
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-white
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPaginas))].map((_, i) => {
                    const pagina = i + 1;
                    return (
                      <button
                        key={pagina}
                        onClick={() => setPaginaActual(pagina)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          paginaActual === pagina
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {pagina}
                      </button>
                    );
                  })}
                  {totalPaginas > 5 && (
                    <>
                      <span className="px-2 text-slate-400">...</span>
                      <button
                        onClick={() => setPaginaActual(totalPaginas)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          paginaActual === totalPaginas
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {totalPaginas}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-white
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
