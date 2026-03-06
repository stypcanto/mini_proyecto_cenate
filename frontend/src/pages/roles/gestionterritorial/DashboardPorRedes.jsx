// ========================================================================
// DashboardPorRedes.jsx - Dashboard de IPRESS por Red Asistencial
// ------------------------------------------------------------------------
// Muestra estadísticas agregadas de formularios diagnósticos agrupados
// por Red Asistencial con resumen general.
// ========================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Network, Building2, CheckCircle2, AlertCircle,
  Shield, XCircle, ChevronDown, ChevronUp, Loader,
  RefreshCw, BarChart3, TrendingUp, Activity, Download
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import api from '../../../lib/apiClient';

export default function DashboardPorRedes() {
  // Estados
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [redExpandida, setRedExpandida] = useState(null);
  const [detalleIpress, setDetalleIpress] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [exportando, setExportando] = useState(false);

  // Estados de filtros
  const [macroregiones, setMacroregiones] = useState([]);
  const [redes, setRedes] = useState([]);
  const [filtroMacroregion, setFiltroMacroregion] = useState("");
  const [filtroRed, setFiltroRed] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(""); // 🆕 Nuevo filtro

  // 🆕 Estados disponibles para los formularios
  const ESTADOS_DISPONIBLES = [
    { value: "EN_PROCESO", label: "En Proceso" },
    { value: "ENVIADO", label: "Enviado" },
    { value: "APROBADO", label: "Aprobado" },
    { value: "RECHAZADO", label: "Rechazado" },
  ];

  // ================================================================
  // FUNCIONES DE CARGA
  // ================================================================

  const cargarMacroregiones = useCallback(async () => {
    try {
      const response = await api.get("/diagnostico/estadisticas/macroregiones");
      console.log("📍 Macroregiones cargadas:", response);
      setMacroregiones(response || []);
    } catch (error) {
      console.error("Error al cargar macroregiones:", error);
    }
  }, []);

  const cargarRedes = useCallback(async (idMacroregion = null) => {
    try {
      const url = idMacroregion
        ? `/diagnostico/estadisticas/redes?idMacroregion=${idMacroregion}`
        : "/diagnostico/estadisticas/redes";
      console.log("🌐 Cargando redes con URL:", url);
      const response = await api.get(url);
      console.log("🌐 Redes recibidas:", response?.length || 0, "redes");
      setRedes(response || []);
    } catch (error) {
      console.error("Error al cargar redes:", error);
      setRedes([]);
    }
  }, []);

  const cargarEstadisticas = useCallback(async () => {
    try {
      setLoading(true);

      let url = "/diagnostico/estadisticas/por-red";
      const params = [];

      if (filtroMacroregion) {
        params.push(`idMacroregion=${filtroMacroregion}`);
      }

      if (filtroRed) {
        params.push(`idRed=${filtroRed}`);
      }

      if (filtroEstado) {
        params.push(`estado=${filtroEstado}`);
      }

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      console.log("🔍 Cargando estadísticas con URL:", url);
      console.log("🔍 Filtros actuales:", { filtroMacroregion, filtroRed, filtroEstado });

      const response = await api.get(url);
      console.log("📊 Respuesta recibida:", response);
      console.log("📊 Cantidad de redes en respuesta:", response.estadisticas_por_red?.length || 0);

      setEstadisticas(response.estadisticas_por_red || []);
      setResumen(response.resumen_general || null);

      if (!filtroMacroregion && !filtroRed && !filtroEstado) {
        toast.success("Estadísticas cargadas correctamente");
      } else {
        toast.success(`Filtrado: ${response.estadisticas_por_red?.length || 0} redes encontradas`);
      }
    } catch (error) {
      console.error("❌ Error al cargar estadísticas:", error);
      toast.error("Error al cargar estadísticas");
      setEstadisticas([]);
      setResumen(null);
    } finally {
      setLoading(false);
    }
  }, [filtroMacroregion, filtroRed, filtroEstado]);

  const limpiarFiltros = () => {
    console.log("🧹 Limpiando filtros");
    setFiltroMacroregion("");
    setFiltroRed("");
    setFiltroEstado("");
  };

  const cargarDetalleRed = async (idRed) => {
    try {
      setCargandoDetalle(true);
      const response = await api.get(`/diagnostico/estadisticas/detalle-red?idRed=${idRed}`);
      setDetalleIpress(response || []);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      toast.error("Error al cargar detalle de la red");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const toggleRed = async (idRed) => {
    if (redExpandida === idRed) {
      setRedExpandida(null);
      setDetalleIpress([]);
    } else {
      setRedExpandida(idRed);
      await cargarDetalleRed(idRed);
    }
  };

  // ================================================================
  // EXPORTAR EXCEL
  // ================================================================
  const exportarExcel = async () => {
    if (estadisticas.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }
    try {
      setExportando(true);
      toast.loading("Preparando datos para exportar...", { id: "export" });

      // Cargar detalle de todas las redes en paralelo
      const detallesPromises = estadisticas.map((red) =>
        api.get(`/diagnostico/estadisticas/detalle-red?idRed=${red.id_red}`)
          .then((data) => ({ red, ipress: data || [] }))
          .catch(() => ({ red, ipress: [] }))
      );
      const detalles = await Promise.all(detallesPromises);

      // Construir filas del Excel
      const filas = [];
      detalles.forEach(({ red, ipress }) => {
        if (ipress.length === 0) {
          filas.push({
            "Macroregión": red.desc_macro,
            "Red Asistencial": red.desc_red,
            "Total IPRESS": red.total_ipress,
            "Red - Enviados": red.enviados,
            "Red - En Proceso": red.en_proceso,
            "Red - Falta Enviar": red.falta_enviar,
            "IPRESS": "—",
            "Código IPRESS": "—",
            "Estado Formulario": "—",
            "Fecha Creación": "—",
            "Fecha Envío": "—",
            "Firmante": "—",
          });
        } else {
          ipress.forEach((ip) => {
            filas.push({
              "Macroregión": red.desc_macro,
              "Red Asistencial": red.desc_red,
              "Total IPRESS": red.total_ipress,
              "Red - Enviados": red.enviados,
              "Red - En Proceso": red.en_proceso,
              "Red - Falta Enviar": red.falta_enviar,
              "IPRESS": ip.desc_ipress || "—",
              "Código IPRESS": ip.cod_ipress || "—",
              "Estado Formulario": getLabelEstado(ip.estado_formulario),
              "Fecha Creación": ip.fecha_creacion
                ? new Date(ip.fecha_creacion).toLocaleDateString("es-PE")
                : "—",
              "Fecha Envío": ip.fecha_envio
                ? new Date(ip.fecha_envio).toLocaleDateString("es-PE")
                : "—",
              "Firmante": ip.nombre_firmante || "—",
            });
          });
        }
      });

      const ws = XLSX.utils.json_to_sheet(filas);

      // Ancho de columnas
      ws["!cols"] = [
        { wch: 20 }, { wch: 30 }, { wch: 14 }, { wch: 16 },
        { wch: 16 }, { wch: 18 }, { wch: 40 }, { wch: 14 },
        { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 30 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Estadísticas por Red");

      const fecha = new Date().toLocaleDateString("es-PE").replace(/\//g, "-");
      XLSX.writeFile(wb, `Dashboard_Redes_IPRESS_${fecha}.xlsx`);

      toast.success("Excel descargado correctamente", { id: "export" });
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al generar el Excel", { id: "export" });
    } finally {
      setExportando(false);
    }
  };

  // ================================================================
  // EFFECTS
  // ================================================================

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    console.log("🚀 Componente montado - Cargando datos iniciales");
    cargarMacroregiones();
    cargarRedes();
  }, [cargarMacroregiones, cargarRedes]);

  // Recargar redes cuando cambia macroregión
  useEffect(() => {
    console.log("🎯 Cambió filtroMacroregion a:", filtroMacroregion);
    if (filtroMacroregion) {
      cargarRedes(filtroMacroregion);
      setFiltroRed(""); // Limpiar filtro de red
    } else {
      cargarRedes();
    }
  }, [filtroMacroregion, cargarRedes]);

  // Recargar estadísticas cuando cambian filtros
  useEffect(() => {
    console.log("🔄 Detectado cambio en filtros - Recargando estadísticas");
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  // ================================================================
  // HELPERS
  // ================================================================
  const getColorEstado = (estado) => {
    switch (estado) {
      case "FIRMADO":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "ENVIADO":
        return "bg-green-100 text-green-700 border-green-200";
      case "EN_PROCESO":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "APROBADO":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "RECHAZADO":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getIconoEstado = (estado) => {
    switch (estado) {
      case "FIRMADO":
        return <Shield className="w-4 h-4" />;
      case "ENVIADO":
        return <CheckCircle2 className="w-4 h-4" />;
      case "EN_PROCESO":
        return <AlertCircle className="w-4 h-4" />;
      case "APROBADO":
        return <CheckCircle2 className="w-4 h-4" />;
      case "RECHAZADO":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getLabelEstado = (estado) => {
    switch (estado) {
      case "FIRMADO":
        return "Firmado";
      case "ENVIADO":
        return "Enviado";
      case "EN_PROCESO":
        return "En Proceso";
      case "APROBADO":
        return "Aprobado";
      case "RECHAZADO":
        return "Rechazado";
      default:
        return estado;
    }
  };

  // ================================================================
  // RENDERIZADO - LOADING
  // ================================================================
  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  // ================================================================
  // RENDERIZADO PRINCIPAL
  // ================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Avance del llenado de la encuesta de diagnóstico de IPRESS
                </h1>
                <p className="text-gray-600 mt-1">
                  Estadísticas de formularios diagnósticos por Red
                </p>
              </div>
            </div>
            <button
              onClick={cargarEstadisticas}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Filtro Macroregión */}
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Macroregión
                </label>
                <select
                  value={filtroMacroregion}
                  onChange={(e) => {
                    const valor = e.target.value;
                    console.log("🎯 Usuario seleccionó macroregión:", valor);
                    setFiltroMacroregion(valor);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Todas las Macroregiones</option>
                  {macroregiones.map((macro) => (
                    <option key={macro.id_macro} value={macro.id_macro}>
                      {macro.desc_macro}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Red */}
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Red Asistencial
                </label>
                <select
                  value={filtroRed}
                  onChange={(e) => {
                    const valor = e.target.value;
                    console.log("🌐 Usuario seleccionó red:", valor);
                    setFiltroRed(valor);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={redes.length === 0}
                >
                  <option value="">Todas las Redes</option>
                  {redes.map((red) => (
                    <option key={red.id_red} value={red.id_red}>
                      {red.desc_red}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Estado */}
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => {
                    const valor = e.target.value;
                    console.log("📊 Usuario seleccionó estado:", valor);
                    setFiltroEstado(valor);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Todos los Estados</option>
                  {ESTADOS_DISPONIBLES.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón limpiar filtros */}
              {(filtroMacroregion || filtroRed || filtroEstado) && (
                <div className="flex-shrink-0 pt-7">
                  <button
                    onClick={limpiarFiltros}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Limpiar Filtros</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumen General */}
        {resumen && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Resumen General
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Enviados */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Enviados</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{resumen.enviados || 0}</p>
                    <p className="text-gray-500 text-xs mt-1">{resumen.porcentaje_enviados || 0}% del total</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-green-500 opacity-70" />
                </div>
              </div>

              {/* En Proceso */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">En Proceso</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-1">{resumen.en_proceso || 0}</p>
                    <p className="text-gray-500 text-xs mt-1">{resumen.porcentaje_en_proceso || 0}% del total</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-yellow-500 opacity-70" />
                </div>
              </div>

              {/* Falta Enviar */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Falta Enviar</p>
                    <p className="text-3xl font-bold text-gray-600 mt-1">{resumen.falta_enviar || 0}</p>
                    <p className="text-gray-500 text-xs mt-1">{resumen.porcentaje_falta_enviar || 0}% del total</p>
                  </div>
                  <XCircle className="w-10 h-10 text-gray-400 opacity-70" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas por Red */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-600" />
              Estadísticas por Red Asistencial
            </h2>
            <div className="relative group">
              <button
                onClick={exportarExcel}
                disabled={exportando || estadisticas.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {exportando ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{exportando ? "Exportando..." : "Exportar Excel"}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <p className="font-semibold mb-1">Exportar a Excel</p>
                <p className="text-gray-300 leading-relaxed">
                  Descarga todas las redes asistenciales con el desglose completo de IPRESS: código, estado del formulario, fechas de creación y envío, y firmante.
                </p>
                <p className="text-gray-400 mt-1.5">Se aplican los filtros activos.</p>
                <div className="absolute right-3 -top-1.5 w-3 h-3 bg-gray-800 rotate-45" />
              </div>
            </div>
          </div>

          {/* Agrupar por macroregión */}
          {(() => {
            const grupos = estadisticas.reduce((acc, red) => {
              const key = red.desc_macro || 'Sin Macroregión';
              if (!acc[key]) acc[key] = [];
              acc[key].push(red);
              return acc;
            }, {});
            return Object.entries(grupos).map(([macro, redes]) => (
              <div key={macro} className="mb-6">
                {/* Encabezado de macroregión */}
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div className="p-1.5 bg-blue-600 rounded-lg">
                    <Network className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-blue-800 uppercase tracking-wide">{macro}</h3>
                  <div className="flex-1 h-px bg-blue-200" />
                  <span className="text-xs font-semibold text-blue-500 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                    {redes.length} red{redes.length !== 1 ? 'es' : ''}
                  </span>
                </div>
                <div className="space-y-2 pl-2">
            {redes.map((red) => (
              <div
                key={red.id_red}
                className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
              >
                {/* Cabecera de Red */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleRed(red.id_red)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Network className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{red.desc_red}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Total: {red.total_ipress} IPRESS
                        </p>
                      </div>
                    </div>

                    {/* Contadores */}
                    <div className="flex items-center gap-4 mr-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{red.enviados}</p>
                        <p className="text-xs text-gray-500">Enviados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{red.en_proceso}</p>
                        <p className="text-xs text-gray-500">En Proceso</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">{red.falta_enviar}</p>
                        <p className="text-xs text-gray-500">Falta Enviar</p>
                      </div>
                    </div>

                    {/* Icono expandir/colapsar */}
                    {redExpandida === red.id_red ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Detalle de IPRESS (Expandible) */}
                {redExpandida === red.id_red && (
                  <div className="border-t border-gray-200 bg-gray-50 p-5">
                    {cargandoDetalle ? (
                      <div className="text-center py-8">
                        <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Cargando detalle...</p>
                      </div>
                    ) : detalleIpress.length === 0 ? (
                      <div className="text-center py-8">
                        <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No hay IPRESS registradas en esta red</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                IPRESS
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Código
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Estado Formulario
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Fecha Creación
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Fecha Envío
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Firmante
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {detalleIpress.map((ipress, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {ipress.desc_ipress}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {ipress.cod_ipress || "—"}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getColorEstado(ipress.estado_formulario)}`}>
                                    {getIconoEstado(ipress.estado_formulario)}
                                    {getLabelEstado(ipress.estado_formulario)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {ipress.fecha_creacion
                                    ? new Date(ipress.fecha_creacion).toLocaleDateString("es-PE")
                                    : "—"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {ipress.fecha_envio
                                    ? new Date(ipress.fecha_envio).toLocaleDateString("es-PE")
                                    : "—"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {ipress.nombre_firmante || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
                </div>
              </div>
            ));
          })()}

          {/* Sin datos */}
          {estadisticas.length === 0 && (
            <div className="bg-white rounded-xl shadow border border-gray-200 p-16 text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No hay estadísticas disponibles</p>
              <p className="text-sm text-gray-500 mt-1">
                {filtroMacroregion || filtroRed
                  ? "No se encontraron redes con los filtros seleccionados"
                  : "Aún no se han registrado formularios diagnósticos"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
