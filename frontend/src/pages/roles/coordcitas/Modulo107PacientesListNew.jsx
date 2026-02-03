// ========================================================================
// 👥 Modulo107PacientesList.jsx – Listado de Pacientes Módulo 107 v2.0
// ========================================================================
// Versión mejorada con filtros avanzados + tabla de atención médica

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import apiClient from "../../../lib/apiClient";
import { filtrosUbicacionService } from "../../../services/filtrosUbicacionService";

const REGISTROS_POR_PAGINA = 25;

export default function Modulo107PacientesList() {
  // ==================== ESTADO GENERAL ====================
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandFiltros, setExpandFiltros] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  // ==================== BÚSQUEDA Y FILTROS ====================
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipoDoc, setFiltroTipoDoc] = useState("todos");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroRangoFechas, setFiltroRangoFechas] = useState({ inicio: "", fin: "" });
  const [mostrarSelectorFechas, setMostrarSelectorFechas] = useState(false);
  const [filtroMacrorregion, setFiltroMacrorregion] = useState("todas");
  const [filtroRed, setFiltroRed] = useState("todas");
  const [filtroIpress, setFiltroIpress] = useState("todas");
  const [filtroDerivacion, setFiltroDerivacion] = useState("todas");

  // ==================== ESTADÍSTICAS ====================
  const [stats, setStats] = useState({
    total: 0,
    atendidos: 0,
    pendientes: 0,
    en_proceso: 0,
    cancelados: 0,
  });

  // ==================== CATÁLOGOS ====================
  const [macrorregionesUnicas, setMacrorregionesUnicas] = useState([]);
  const [redesUnicas, setRedesUnicas] = useState([]);
  const [ipressUnicas, setIpressUnicas] = useState([]);
  const [tiposDocumentoUnicos, setTiposDocumentoUnicos] = useState([]);
  const [estadosUnicos, setEstadosUnicos] = useState([]);

  // Derivaciones internas disponibles
  const derivacionesInternas = [
    "MEDICINA CENATE",
    "NUTRICION CENATE",
    "PSICOLOGIA CENATE"
  ];

  // ==================== CARGAR CATÁLOGOS ====================

  const cargarEstadosGestion = async () => {
    try {
      const response = await fetch("/api/admin/estados-gestion-citas/todos", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error al cargar estados");
      const data = await response.json();
      const estadosMapeados = data.map(estado => ({
        id: estado.idEstadoCita,
        codigo: estado.codEstadoCita,
        descripcion: estado.descEstadoCita
      }));
      setEstadosUnicos(estadosMapeados);
    } catch (error) {
      console.error("Error al cargar estados:", error);
    }
  };

  const cargarMacrorregiones = async () => {
    try {
      const data = await filtrosUbicacionService.obtenerMacroregiones();
      setMacrorregionesUnicas(data);
    } catch (error) {
      console.error("Error al cargar macrorregiones:", error);
    }
  };

  const cargarRedes = async (macroId) => {
    if (!macroId || macroId === "todas") {
      setRedesUnicas([]);
      setFiltroRed("todas");
      return;
    }
    try {
      const data = await filtrosUbicacionService.obtenerRedesPorMacro(macroId);
      setRedesUnicas(data);
      setFiltroRed("todas");
    } catch (error) {
      console.error("Error al cargar redes:", error);
    }
  };

  const cargarIpress = async (redId) => {
    if (!redId || redId === "todas") {
      setIpressUnicas([]);
      setFiltroIpress("todas");
      return;
    }
    try {
      const data = await filtrosUbicacionService.obtenerIpressPorRed(redId);
      setIpressUnicas(data);
      setFiltroIpress("todas");
    } catch (error) {
      console.error("Error al cargar IPRESS:", error);
    }
  };

  // ==================== CARGAR PACIENTES ====================

  const cargarPacientes = useCallback(async () => {
    setLoading(true);
    try {
      // Llamar al backend con filtros
      const response = await apiClient.get("/api/bolsa107/pacientes", true);
      const data = response || [];

      // Extraer tipos de documento únicos
      const tipos = [...new Set(data.map(p => p.tipo_documento).filter(Boolean))];
      setTiposDocumentoUnicos(tipos);

      // Aplicar filtros en cliente (como respaldo)
      const pacientesFiltrados = data.filter(p => {
        const matchSearch = !searchTerm ||
          p.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.paciente?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchEstado = filtroEstado === "todos" || p.estado_atencion === filtroEstado;
        const matchTipoDoc = filtroTipoDoc === "todos" || p.tipo_documento === filtroTipoDoc;
        const matchDocumento = !filtroDocumento || p.numero_documento?.includes(filtroDocumento);
        const matchMacro = filtroMacrorregion === "todas" || p.macrorregion === filtroMacrorregion;
        const matchRed = filtroRed === "todas" || p.red === filtroRed;
        const matchIpress = filtroIpress === "todas" || p.desc_ipress === filtroIpress;
        const matchDerivacion = filtroDerivacion === "todas" || p.derivacion_interna === filtroDerivacion;

        let matchFechas = true;
        if (filtroRangoFechas.inicio && filtroRangoFechas.fin) {
          const fechaRegistro = new Date(p.created_at);
          const inicio = new Date(filtroRangoFechas.inicio);
          const fin = new Date(filtroRangoFechas.fin);
          matchFechas = fechaRegistro >= inicio && fechaRegistro <= fin;
        }

        return matchSearch && matchEstado && matchTipoDoc && matchDocumento && 
               matchMacro && matchRed && matchIpress && matchDerivacion && matchFechas;
      });

      setPacientes(pacientesFiltrados);

      // Calcular estadísticas
      const atendidos = pacientesFiltrados.filter(p => p.estado_atencion === "ATENDIDO").length;
      const pendientes = pacientesFiltrados.filter(p => p.estado_atencion === "PENDIENTE").length;
      const en_proceso = pacientesFiltrados.filter(p => p.estado_atencion === "EN_PROCESO").length;
      const cancelados = pacientesFiltrados.filter(p => p.estado_atencion === "CANCELADO").length;

      setStats({
        total: pacientesFiltrados.length,
        atendidos,
        pendientes,
        en_proceso,
        cancelados,
      });
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
      toast.error("Error al cargar los pacientes del Módulo 107");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filtroEstado, filtroTipoDoc, filtroDocumento, filtroRangoFechas, 
      filtroMacrorregion, filtroRed, filtroIpress, filtroDerivacion]);

  // ==================== EFECTOS ====================

  useEffect(() => {
    cargarEstadosGestion();
    cargarMacrorregiones();
  }, []);

  useEffect(() => {
    const macroId = macrorregionesUnicas.find(m => m.descripcion === filtroMacrorregion)?.id;
    cargarRedes(macroId);
  }, [filtroMacrorregion, macrorregionesUnicas]);

  useEffect(() => {
    const redId = redesUnicas.find(r => r.descripcion === filtroRed)?.id;
    cargarIpress(redId);
  }, [filtroRed, redesUnicas]);

  useEffect(() => {
    setCurrentPage(1);
    cargarPacientes();
  }, [cargarPacientes]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mostrarSelectorFechas && !event.target.closest('.date-picker-container')) {
        setMostrarSelectorFechas(false);
      }
    };
    if (mostrarSelectorFechas) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mostrarSelectorFechas]);

  // ==================== PAGINACIÓN ====================

  const totalPages = Math.ceil(pacientes.length / REGISTROS_POR_PAGINA);
  const startIndex = (currentPage - 1) * REGISTROS_POR_PAGINA;
  const endIndex = startIndex + REGISTROS_POR_PAGINA;
  const pacientesPaginados = pacientes.slice(startIndex, endIndex);

  // ==================== SELECCIÓN ====================

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const idsEnPaginaActual = pacientesPaginados.map((p) => p.id_item);
    const todosSeleccionados = idsEnPaginaActual.every((id) => selectedIds.includes(id));
    if (todosSeleccionados) {
      setSelectedIds((prev) => prev.filter((id) => !idsEnPaginaActual.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...idsEnPaginaActual])]);
    }
  };

  // ==================== EXPORTACIÓN ====================

  const handleExportar = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos un paciente para exportar");
      return;
    }

    try {
      const pacientesExportar = pacientes.filter((p) => selectedIds.includes(p.id_item));
      const datosExcel = pacientesExportar.map((p) => ({
        "Fecha Registro": p.created_at ? formatFecha(p.created_at) : "",
        DNI: p.numero_documento || "",
        Paciente: p.paciente || "",
        Sexo: p.sexo || "",
        Edad: calcularEdad(p.fecha_nacimiento) || "",
        "IPRESS Nombre": p.desc_ipress || "",
        "Estado Atención": p.estado_atencion || "",
        "Fecha Atención": p.fecha_atencion ? formatFecha(p.fecha_atencion) : "",
        "Hora Atención": p.hora_atencion || "",
        "Personal ID": p.id_personal || "",
      }));

      const ws = XLSX.utils.json_to_sheet(datosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pacientes Módulo 107");

      const colWidths = [
        { wch: 15 }, { wch: 12 }, { wch: 35 }, { wch: 6 }, { wch: 6 },
        { wch: 50 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      ];
      ws["!cols"] = colWidths;

      const fecha = new Date();
      const nombreArchivo = `Pacientes_Modulo107_${fecha.getFullYear()}${String(
        fecha.getMonth() + 1
      ).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}_${String(
        fecha.getHours()
      ).padStart(2, "0")}${String(fecha.getMinutes()).padStart(2, "0")}.xlsx`;

      XLSX.writeFile(wb, nombreArchivo);
      toast.success(`✅ Se exportaron ${selectedIds.length} pacientes correctamente`);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("❌ Error al exportar los pacientes a Excel");
    }
  };

  // ==================== FUNCIONES AUXILIARES ====================

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "—";
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      ATENDIDO: "bg-green-100 text-green-800 border-green-300",
      PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-300",
      EN_PROCESO: "bg-blue-100 text-blue-800 border-blue-300",
      CANCELADO: "bg-red-100 text-red-800 border-red-300",
    };

    const iconos = {
      ATENDIDO: <CheckCircle2 className="w-4 h-4" />,
      PENDIENTE: <Clock className="w-4 h-4" />,
      EN_PROCESO: <RefreshCw className="w-4 h-4 animate-spin" />,
      CANCELADO: <AlertCircle className="w-4 h-4" />,
    };

    return (
      <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-2 w-fit ${estilos[estado]}`}>
        {iconos[estado]}
        {estado}
      </div>
    );
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                Pacientes del Módulo 107
              </h1>
              <p className="text-slate-600">Visualización de pacientes con estado de atención médica</p>
            </div>
            <button
              onClick={cargarPacientes}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 inline ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Pacientes</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Atendidos</p>
                <p className="text-3xl font-bold text-green-600">{stats.atendidos}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">En Proceso</p>
                <p className="text-3xl font-bold text-blue-600">{stats.en_proceso}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Cancelados</p>
                <p className="text-3xl font-bold text-red-600">{stats.cancelados}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla con Filtros */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header con toggle de filtros */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Lista de Pacientes</h2>
            <button
              onClick={() => setExpandFiltros(!expandFiltros)}
              className="px-4 py-2 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-sm font-semibold text-gray-700">
                {expandFiltros ? "Ocultar" : "Mostrar"} filtros
              </span>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform duration-300 ${
                  expandFiltros ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Filtros - Expandible */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            expandFiltros ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}>
            <div className="p-6 border-b border-gray-200 bg-gray-50 space-y-6">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Búsqueda General</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o DNI..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Fila 1: Estado, Tipo Doc, Documento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => {
                      setFiltroEstado(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos los estados</option>
                    {estadosUnicos.map((estado) => (
                      <option key={estado.id} value={estado.descripcion}>
                        {estado.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Documento</label>
                  <select
                    value={filtroTipoDoc}
                    onChange={(e) => {
                      setFiltroTipoDoc(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos</option>
                    {tiposDocumentoUnicos.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Documento</label>
                  <input
                    type="text"
                    placeholder="Ingrese número de documento"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filtroDocumento}
                    onChange={(e) => {
                      setFiltroDocumento(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Rango de Fechas */}
              <div className="grid grid-cols-1 gap-4">
                <div className="relative date-picker-container">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rango de Fechas de Registro
                  </label>
                  <div 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white flex items-center justify-between"
                    onClick={() => setMostrarSelectorFechas(!mostrarSelectorFechas)}
                  >
                    <span className="text-gray-700">
                      {filtroRangoFechas.inicio && filtroRangoFechas.fin
                        ? `${formatFecha(filtroRangoFechas.inicio)} - ${formatFecha(filtroRangoFechas.fin)}`
                        : filtroRangoFechas.inicio
                        ? `Desde: ${formatFecha(filtroRangoFechas.inicio)}`
                        : filtroRangoFechas.fin
                        ? `Hasta: ${formatFecha(filtroRangoFechas.fin)}`
                        : "Seleccionar rango de fechas"
                      }
                    </span>
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  {/* Panel desplegable para seleccionar fechas */}
                  {mostrarSelectorFechas && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={filtroRangoFechas.inicio}
                            onChange={(e) => {
                              setFiltroRangoFechas(prev => ({ ...prev, inicio: e.target.value }));
                              setCurrentPage(1);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin</label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={filtroRangoFechas.fin}
                            min={filtroRangoFechas.inicio}
                            onChange={(e) => {
                              setFiltroRangoFechas(prev => ({ ...prev, fin: e.target.value }));
                              setCurrentPage(1);
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={() => {
                            setFiltroRangoFechas({ inicio: "", fin: "" });
                            setCurrentPage(1);
                          }}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Limpiar
                        </button>
                        <button
                          onClick={() => setMostrarSelectorFechas(false)}
                          className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Macrorregión, Red, IPRESS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Macrorregión</label>
                  <select
                    value={filtroMacrorregion}
                    onChange={(e) => {
                      setFiltroMacrorregion(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todas">Todas</option>
                    {macrorregionesUnicas.map(macro => (
                      <option key={macro.id} value={macro.descripcion}>{macro.descripcion}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Red</label>
                  <select
                    value={filtroRed}
                    onChange={(e) => {
                      setFiltroRed(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={redesUnicas.length === 0}
                  >
                    <option value="todas">Todas</option>
                    {redesUnicas.map(red => (
                      <option key={red.id} value={red.descripcion}>{red.descripcion} ({red.codigo})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">IPRESS</label>
                  <select
                    value={filtroIpress}
                    onChange={(e) => {
                      setFiltroIpress(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={ipressUnicas.length === 0}
                  >
                    <option value="todas">Todas</option>
                    {ipressUnicas.map(ipress => (
                      <option key={ipress.id} value={ipress.descripcion}>{ipress.descripcion} ({ipress.codigo})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Derivación Interna */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Derivación Interna</label>
                  <select
                    value={filtroDerivacion}
                    onChange={(e) => {
                      setFiltroDerivacion(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todas">Todas</option>
                    {derivacionesInternas.map(derivacion => (
                      <option key={derivacion} value={derivacion}>{derivacion}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Masivas */}
          {selectedIds.length > 0 && (
            <div className="px-6 py-4 bg-blue-50 border-b-2 border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  {selectedIds.length} paciente{selectedIds.length !== 1 ? "s" : ""} seleccionado
                  {selectedIds.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportar}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Limpiar selección
                </button>
              </div>
            </div>
          )}

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={
                        pacientesPaginados.length > 0 &&
                        pacientesPaginados.every((p) => selectedIds.includes(p.id_item))
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha Registro</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">DNI</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Paciente</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Sexo</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Edad</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">IPRESS</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Estado Atención</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha Atención</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Hora Atención</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Personal ID</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="11" className="py-12 text-center">
                      <RefreshCw className="w-12 h-12 text-slate-300 animate-spin mx-auto mb-2" />
                      <p className="font-medium text-lg text-slate-500">Cargando pacientes...</p>
                    </td>
                  </tr>
                ) : pacientesPaginados.length > 0 ? (
                  pacientesPaginados.map((paciente) => (
                    <tr key={paciente.id_item} className="border-b border-slate-100 hover:bg-blue-50/30">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(paciente.id_item)}
                          onChange={() => handleSelectOne(paciente.id_item)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700">{formatFecha(paciente.created_at)}</td>
                      <td className="py-3 px-4 font-mono text-slate-800">{paciente.numero_documento}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{paciente.paciente}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          paciente.sexo === "M"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}>
                          {paciente.sexo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-700">
                        {calcularEdad(paciente.fecha_nacimiento)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          {paciente.desc_ipress ? (
                            <>
                              <span className="text-sm font-medium text-slate-800">{paciente.desc_ipress}</span>
                              <span className="text-xs text-slate-500">Código: {paciente.cod_ipress}</span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400 italic">Sin IPRESS</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getEstadoBadge(paciente.estado_atencion || "PENDIENTE")}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">
                        {formatFecha(paciente.fecha_atencion)}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700">
                        {paciente.hora_atencion || "—"}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700">
                        {paciente.id_personal || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="py-12 text-center">
                      <Users className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                      <p className="font-medium text-lg text-slate-500">No hay pacientes registrados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {!loading && pacientes.length > 0 && (
            <div className="border-t pt-4 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  Mostrando <strong>{startIndex + 1}</strong> a{" "}
                  <strong>{Math.min(endIndex, pacientes.length)}</strong> de{" "}
                  <strong>{pacientes.length}</strong> pacientes
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - currentPage) <= 2) return true;
                          return false;
                        })
                        .map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && <span className="px-2 text-slate-400">...</span>}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
