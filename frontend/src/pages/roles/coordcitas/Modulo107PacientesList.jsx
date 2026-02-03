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
  Eye,
  Activity,
  BarChart3,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { atencionesClinicasService } from "../../../services/atencionesClinicasService";
import { filtrosUbicacionService } from "../../../services/filtrosUbicacionService";

const REGISTROS_POR_PAGINA = 25;

export default function Modulo107PacientesList() {
  // ==================== ESTADO GENERAL ====================
  const [pacientes, setPacientes] = useState([]);
  const [totalElementos, setTotalElementos] = useState(0);
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
      // Preparar filtros para el backend
      const filtros = {};
      
      // Filtro Estado
      if (filtroEstado !== "todos" && filtroEstado) {
        filtros.estadoGestionCitasId = filtroEstado;
      }
      
      // Filtro de IPRESS
      if (filtroIpress && filtroIpress !== "todas") {
        const ipressSeleccionada = ipressUnicas.find(i => i.descripcion === filtroIpress);
        if (ipressSeleccionada) {
          filtros.idIpress = ipressSeleccionada.id;
        }
      }
      
      // Otros filtros
      if (filtroTipoDoc !== "todos") filtros.tipoDocumento = filtroTipoDoc;
      if (filtroDocumento) filtros.pacienteDni = filtroDocumento;
      if (filtroRangoFechas.inicio) filtros.fechaDesde = filtroRangoFechas.inicio;
      if (filtroRangoFechas.fin) filtros.fechaHasta = filtroRangoFechas.fin;
      if (filtroDerivacion !== "todas") filtros.derivacionInterna = filtroDerivacion;
      if (searchTerm) filtros.searchTerm = searchTerm;
      
      // Llamar al servicio
      const response = await atencionesClinicasService.listarConFiltros(
        filtros, 
        currentPage - 1,
        REGISTROS_POR_PAGINA
      );
      
      // Mapear respuesta al formato esperado
      const data = response.content || response || [];
      
      // Ordenar por fecha de registro descendente (más nuevos primero)
      data.sort((a, b) => {
        const fechaA = new Date(a.fechaSolicitud || 0).getTime();
        const fechaB = new Date(b.fechaSolicitud || 0).getTime();
        return fechaB - fechaA; // Descendente
      });
      
      // Guardar total de elementos
      setTotalElementos(response.totalElements || data.length);
      
      // Extraer tipos de documento únicos
      const tipos = [...new Set(data.map(p => p.tipoDocumento).filter(Boolean))];
      setTiposDocumentoUnicos(tipos);
      
      // Estadísticas
      setStats({
        total: response.totalElements || data.length,
        atendidos: data.filter(p => p.estadoDescripcion?.includes("ATENDIDO")).length,
        pendientes: data.filter(p => p.estadoDescripcion?.includes("PENDIENTE")).length,
        en_proceso: data.filter(p => p.estadoDescripcion?.includes("PROCESO")).length,
        cancelados: data.filter(p => p.estadoDescripcion?.includes("CANCELADO")).length,
      });
      
      // Los datos ya vienen filtrados del backend
      setPacientes(data);
      
    } catch (error) {
      console.error("Error al cargar atenciones:", error);
      toast.error("Error al cargar los datos");
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  }, [
    filtroEstado, filtroTipoDoc, filtroDocumento, 
    filtroRangoFechas, filtroDerivacion, searchTerm,
    filtroIpress, currentPage, ipressUnicas
  ]);

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
  
  // Nota: La paginación ahora es manejada por el backend
  // Los datos ya vienen paginados en la respuesta
  const pacientesPaginados = pacientes;

  // ==================== SELECCIÓN ====================

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const idsEnPaginaActual = pacientesPaginados.map((p) => p.idSolicitud);
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
      const pacientesExportar = pacientes.filter((p) => selectedIds.includes(p.idSolicitud));
      const datosExcel = pacientesExportar.map((p) => ({
        "Fecha Registro": p.fechaSolicitud ? formatFecha(p.fechaSolicitud) : "",
        DNI: p.pacienteDni || "",
        Paciente: p.pacienteNombre || "",
        Sexo: p.pacienteSexo === "M" ? "Masculino" : "Femenino" || "",
        Edad: p.pacienteEdad || "",
        "IPRESS Nombre": p.ipressNombre || "",
        "Derivación": p.derivacionInterna || "",
        "Estado Atención": p.estadoDescripcion || "",
        "Fecha Atención": p.fechaAtencion ? formatFecha(p.fechaAtencion) : "",
        "Hora Atención": p.horaAtencion || "",
        "Personal ID": p.idPersonal || "",
      }));

      const ws = XLSX.utils.json_to_sheet(datosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pacientes Módulo 107");

      const colWidths = [
        { wch: 15 }, { wch: 12 }, { wch: 35 }, { wch: 6 }, { wch: 6 },
        { wch: 50 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
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

  const getDerivacionBadge = (derivacion) => {
    const estilos = {
      "MEDICINA CENATE": "bg-blue-100 text-blue-800 border-blue-300 border",
      "NUTRICION CENATE": "bg-green-100 text-green-800 border-green-300 border",
      "PSICOLOGIA CENATE": "bg-purple-100 text-purple-800 border-purple-300 border",
    };

    const estilo = estilos[derivacion] || "bg-gray-100 text-gray-800 border-gray-300 border";

    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${estilo}`}>
        {derivacion || "—"}
      </span>
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
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Pacientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-fade-in">
            {/* Total */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-100">Total Pacientes</span>
                <span className="text-3xl">👥</span>
              </div>
              <div className="text-4xl font-bold">{stats.total}</div>
            </div>

            {/* Atendidos */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-100">Atendidos</span>
                <span className="text-3xl">✓</span>
              </div>
              <div className="text-4xl font-bold">{stats.atendidos}</div>
            </div>

            {/* Pendientes */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-orange-100">Pendientes</span>
                <span className="text-3xl">⏳</span>
              </div>
              <div className="text-4xl font-bold">{stats.pendientes}</div>
            </div>

            {/* En Proceso */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-100">En Proceso</span>
                <span className="text-3xl">🔄</span>
              </div>
              <div className="text-4xl font-bold">{stats.en_proceso}</div>
            </div>

            {/* Cancelados */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-red-100">Cancelados</span>
                <span className="text-3xl">✕</span>
              </div>
              <div className="text-4xl font-bold">{stats.cancelados}</div>
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
                      <option key={estado.id} value={estado.id}>
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

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFiltroEstado("todos");
                    setFiltroTipoDoc("todos");
                    setFiltroDocumento("");
                    setFiltroRangoFechas({ inicio: "", fin: "" });
                    setMostrarSelectorFechas(false);
                    setFiltroMacrorregion("todas");
                    setFiltroRed("todas");
                    setFiltroIpress("todas");
                    setFiltroDerivacion("todas");
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>

              {/* Resumen de Filtros Activos */}
              {(filtroEstado !== "todos" || filtroTipoDoc !== "todos" || filtroDocumento || 
                filtroRangoFechas.inicio || filtroRangoFechas.fin || filtroMacrorregion !== "todas" || 
                filtroRed !== "todas" || filtroIpress !== "todas" || filtroDerivacion !== "todas" || searchTerm) && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-3">📋 Filtros Activos:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                        Búsqueda: {searchTerm}
                      </span>
                    )}
                    {filtroEstado !== "todos" && (
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                        Estado: {filtroEstado}
                      </span>
                    )}
                    {filtroTipoDoc !== "todos" && (
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                        Tipo Doc: {filtroTipoDoc}
                      </span>
                    )}
                    {filtroDocumento && (
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                        Documento: {filtroDocumento}
                      </span>
                    )}
                    {filtroRangoFechas.inicio && (
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                        Desde: {new Date(filtroRangoFechas.inicio).toLocaleDateString('es-ES')}
                      </span>
                    )}
                    {filtroRangoFechas.fin && (
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                        Hasta: {new Date(filtroRangoFechas.fin).toLocaleDateString('es-ES')}
                      </span>
                    )}
                    {filtroMacrorregion !== "todas" && (
                      <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                        Macro: {filtroMacrorregion}
                      </span>
                    )}
                    {filtroRed !== "todas" && (
                      <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                        Red: {filtroRed}
                      </span>
                    )}
                    {filtroIpress !== "todas" && (
                      <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                        IPRESS: {filtroIpress}
                      </span>
                    )}
                    {filtroDerivacion !== "todas" && (
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                        Derivación: {filtroDerivacion}
                      </span>
                    )}
                  </div>
                </div>
              )}
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
              <thead className="bg-[#0D5BA9] text-white sticky top-0">
                <tr className="border-b-2 border-blue-800">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={
                        pacientesPaginados.length > 0 &&
                        pacientesPaginados.every((p) => selectedIds.includes(p.idSolicitud))
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Fecha Registro</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">DNI</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Paciente</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Sexo</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Edad</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">IPRESS</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Derivación</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Estado Atención</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Fecha Atención</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Hora Atención</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Personal ID</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="12" className="py-12 text-center">
                      <RefreshCw className="w-12 h-12 text-slate-300 animate-spin mx-auto mb-2" />
                      <p className="font-medium text-lg text-slate-500">Cargando pacientes...</p>
                    </td>
                  </tr>
                ) : pacientesPaginados.length > 0 ? (
                  pacientesPaginados.map((paciente) => (
                    <tr key={paciente.idSolicitud} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(paciente.idSolicitud)}
                          onChange={() => handleSelectOne(paciente.idSolicitud)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatFecha(paciente.fechaSolicitud)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">{paciente.pacienteDni}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{paciente.pacienteNombre}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          paciente.pacienteSexo === "M"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}>
                          {paciente.pacienteSexo === "M" ? "M" : "F"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700">
                        {paciente.pacienteEdad}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {paciente.ipressNombre ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{paciente.ipressNombre}</span>
                            <span className="text-xs text-gray-500">{paciente.ipressCodigo}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Sin IPRESS</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {getDerivacionBadge(paciente.derivacionInterna)}
                      </td>
                      <td className="px-4 py-3 text-sm">{getEstadoBadge(paciente.estadoDescripcion || "PENDIENTE")}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatFecha(paciente.fechaAtencion) || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {paciente.horaAtencion || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {paciente.idPersonal || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="py-12 text-center">
                      <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No se encontraron pacientes con los filtros aplicados</p>
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
                <div className="text-sm text-gray-600">
                  Mostrando <strong>{(currentPage - 1) * REGISTROS_POR_PAGINA + 1}</strong> a{" "}
                  <strong>{Math.min(currentPage * REGISTROS_POR_PAGINA, totalElementos)}</strong> de{" "}
                  <strong>{totalElementos}</strong> registros
                </div>

                {totalElementos > REGISTROS_POR_PAGINA && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(totalElementos / REGISTROS_POR_PAGINA) }, (_, i) => i + 1)
                        .filter((page) => {
                          const totalPages = Math.ceil(totalElementos / REGISTROS_POR_PAGINA);
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
                      onClick={() => {
                        const totalPages = Math.ceil(totalElementos / REGISTROS_POR_PAGINA);
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                      }}
                      disabled={currentPage === Math.ceil(totalElementos / REGISTROS_POR_PAGINA)}
                      className="px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 rounded-lg"
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

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
