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
  const [expandFiltros, setExpandFiltros] = useState(false);
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
  const [filtroCondicionMedica, setFiltroCondicionMedica] = useState("todos"); // 🆕 Pendiente, Atendido, Deserción

  // ==================== ESTADÍSTICAS ====================
  const [stats, setStats] = useState({
    total: 0,
    pendiente: 0,           // Condición médica: Pendiente o NULL
    atendido: 0,           // Condición médica: Atendido  
    desercion: 0           // Condición médica: Deserción
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

  const cargarPacientes = useCallback(async (pageNum = 0) => {
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
      
      // 🆕 Filtros de ubicación geográfica
      if (filtroMacrorregion !== "todas") filtros.macrorregion = filtroMacrorregion;
      if (filtroRed !== "todas") filtros.red = filtroRed;
      if (filtroIpress !== "todas") {
        const ipressSeleccionada = ipressUnicas.find(i => i.descripcion === filtroIpress);
        if (ipressSeleccionada) filtros.idIpress = ipressSeleccionada.id;
      }
      
      if (filtroDerivacion !== "todas") filtros.derivacionInterna = filtroDerivacion;
      if (filtroCondicionMedica !== "todos") filtros.condicionMedica = filtroCondicionMedica; // 🆕
      if (searchTerm) filtros.searchTerm = searchTerm;
      
      // Llamar al servicio
      const response = await atencionesClinicasService.listarConFiltros(
        filtros, 
        pageNum,
        REGISTROS_POR_PAGINA
      );
      
      // Mapear respuesta al formato esperado
      const data = response.content || response || [];
      
      // 🔍 DEBUG: Ver campos del primer registro para verificar motivoLlamadoBolsa
      if (data.length > 0) {
        console.log("📋 [DEBUG] Primer paciente recibido:", data[0]);
        console.log("📋 [DEBUG] Campos disponibles:", Object.keys(data[0]));
        console.log("📋 [DEBUG] motivoLlamadoBolsa:", data[0].motivoLlamadoBolsa);
      }
      
      // Ya no necesitamos ordenar en frontend - se ordena en backend
      
      // Guardar total de elementos
      setTotalElementos(response.totalElements || data.length);
      
      // Extraer tipos de documento únicos
      const tipos = [...new Set(data.map(p => p.tipoDocumento).filter(Boolean))];
      setTiposDocumentoUnicos(tipos);
      
      // Cargar estadísticas basadas en condición médica
      try {
        const estatsApi = await atencionesClinicasService.obtenerEstadisticasCondicionMedica();
        setStats({
          total: estatsApi.total || 0,
          pendiente: estatsApi.pendiente || 0,
          atendido: estatsApi.atendido || 0,
          desercion: estatsApi.desercion || 0
        });
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      }
      
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
    filtroRangoFechas, filtroDerivacion, filtroCondicionMedica, searchTerm,
    filtroIpress, ipressUnicas
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

  // Cuando cambien los filtros, resetear a página 1 y cargar
  useEffect(() => {
    setCurrentPage(1);
    cargarPacientes(0);
  }, [cargarPacientes]);

  // Cuando cambie currentPage, cargar esa página específica
  useEffect(() => {
    if (currentPage > 1) {
      cargarPacientes(currentPage - 1);
    }
  }, [currentPage, cargarPacientes]);

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
        "Fecha de Solicitud": p.fechaSolicitud ? formatFecha(p.fechaSolicitud) : "",
        DNI: p.pacienteDni || "",
        Paciente: p.pacienteNombre || "",
        Sexo: p.pacienteSexo === "M" ? "Masculino" : "Femenino" || "",
        Edad: p.pacienteEdad || "",
        "IPRESS Nombre": p.ipressNombre || "",
        "Derivación": p.derivacionInterna || "",
        "Tiempo Inicio Síntomas": p.tiempoInicioSintomas || "",
        "Consentimiento Informado": p.consentimientoInformado === true ? "Sí" : p.consentimientoInformado === false ? "No" : "",
        "Fecha de Cita": p.fechaAtencion && p.horaAtencion 
          ? `${formatFecha(p.fechaAtencion)} ${formatHora(p.horaAtencion)}`
          : p.fechaAtencion
          ? formatFecha(p.fechaAtencion)
          : "",
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

  // 🆕 Función específica para fechas de input (YYYY-MM-DD) sin problemas de zona horaria
  const formatFechaInput = (fechaString) => {
    if (!fechaString) return "";
    // Solo dividir y reorganizar, sin crear objeto Date para evitar problemas de zona horaria
    const [anio, mes, dia] = fechaString.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  const formatHora = (hora) => {
    if (!hora) return "";
    // Si viene en formato "HH:mm:ss", extraer solo "HH:mm"
    if (hora.includes(":")) {
      return hora.split(":").slice(0, 2).join(":");
    }
    return hora;
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
      ATENDIDO: <CheckCircle2 className="w-3 h-3" />,
      PENDIENTE: <Clock className="w-3 h-3" />,
      EN_PROCESO: <RefreshCw className="w-3 h-3 animate-spin" />,
      CANCELADO: <AlertCircle className="w-3 h-3" />,
    };

    return (
      <div className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${estilos[estado]}`}>
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
      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${estilo}`}>
        {derivacion || "—"}
      </span>
    );
  };

  // 🆕 Nueva función para estados de condición médica
  const getCondicionMedicaBadge = (condicion) => {
    // Tratar NULL, undefined, empty string como "Pendiente"
    if (!condicion || condicion.trim() === '' || condicion === '[NULL]' || condicion === 'null') {
      condicion = "Pendiente";
    }

    const estilos = {
      "Pendiente": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Atendido": "bg-green-100 text-green-800 border-green-300", 
      "Deserción": "bg-red-100 text-red-800 border-red-300",
    };

    const iconos = {
      "Pendiente": <Clock className="w-3 h-3" />,
      "Atendido": <CheckCircle2 className="w-3 h-3" />,
      "Deserción": <AlertCircle className="w-3 h-3" />,
    };

    const estilo = estilos[condicion] || "bg-gray-100 text-gray-800 border-gray-300";
    const icono = iconos[condicion] || <Clock className="w-3 h-3" />;

    return (
      <div className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${estilo}`}>
        {icono}
        {condicion}
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
              onClick={() => cargarPacientes(currentPage - 1)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
            {/* Total */}
            <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-100 text-xs font-semibold">Total de Pacientes</span>
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>

            {/* Pendiente - Badge amarillo con ícono de reloj */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-100 text-xs font-semibold">Pendiente</span>
                <span className="text-2xl">🕐</span>
              </div>
              <div className="text-3xl font-bold">{stats.pendiente}</div>
              <p className="text-yellow-200 text-xs mt-1">Por atender</p>
            </div>

            {/* Atendido - Badge verde con ícono de check */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100 text-xs font-semibold">Atendido</span>
                <span className="text-2xl">✓</span>
              </div>
              <div className="text-3xl font-bold">{stats.atendido}</div>
              <p className="text-green-200 text-xs mt-1">Completados</p>
            </div>

            {/* Deserción - Badge rojo con ícono de alerta */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-100 text-xs font-semibold">Deserción</span>
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="text-3xl font-bold">{stats.desercion}</div>
              <p className="text-red-200 text-xs mt-1">No asistieron</p>
            </div>
          </div>
        </div>

        {/* Tabla con Filtros */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header con toggle de filtros */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Lista de Pacientes</h2>
            <button
              onClick={() => setExpandFiltros(!expandFiltros)}
              className="px-3 py-1.5 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <span className="text-xs font-semibold text-gray-700">
                {expandFiltros ? "Ocultar" : "Mostrar"} filtros
              </span>
              <ChevronDown
                size={16}
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
            <div className="p-2 border-b border-gray-200 bg-gray-50 space-y-1.5">
              {/* Búsqueda General y Rango de Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Búsqueda General */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Búsqueda General</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o DNI..."
                      className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>

                {/* Rango de Fechas */}
                <div className="relative date-picker-container">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fechas de Registro
                  </label>
                  <div 
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white flex items-center justify-between text-sm"
                    onClick={() => setMostrarSelectorFechas(!mostrarSelectorFechas)}
                  >
                    <span className="text-gray-700">
                      {filtroRangoFechas.inicio && filtroRangoFechas.fin
                        ? `${formatFechaInput(filtroRangoFechas.inicio)} - ${formatFechaInput(filtroRangoFechas.fin)}`
                        : filtroRangoFechas.inicio
                        ? `Desde: ${formatFechaInput(filtroRangoFechas.inicio)}`
                        : filtroRangoFechas.fin
                        ? `Hasta: ${formatFechaInput(filtroRangoFechas.fin)}`
                        : "Seleccionar rango de fechas"
                      }
                    </span>
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  {/* Panel desplegable para seleccionar fechas */}
                  {mostrarSelectorFechas && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                          <input
                            type="date"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                            value={filtroRangoFechas.inicio}
                            onChange={(e) => {
                              setFiltroRangoFechas(prev => ({ ...prev, inicio: e.target.value }));
                              setCurrentPage(1);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de Fin</label>
                          <input
                            type="date"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                            value={filtroRangoFechas.fin}
                            min={filtroRangoFechas.inicio}
                            onChange={(e) => {
                              setFiltroRangoFechas(prev => ({ ...prev, fin: e.target.value }));
                              setCurrentPage(1);
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between gap-2">
                        <button
                          onClick={() => {
                            setFiltroRangoFechas({ inicio: "", fin: "" });
                            setCurrentPage(1);
                          }}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Limpiar
                        </button>
                        <button
                          onClick={() => setMostrarSelectorFechas(false)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fila 1: Tipo Doc, Documento, Estado de Atención */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Estado - OCULTO pero funcional */}
                <div className="hidden">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => {
                      setFiltroEstado(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Documento</label>
                  <select
                    value={filtroTipoDoc}
                    onChange={(e) => {
                      setFiltroTipoDoc(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="todos">Todos</option>
                    {tiposDocumentoUnicos.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Documento</label>
                  <input
                    type="text"
                    placeholder="Ingrese número de documento"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                    value={filtroDocumento}
                    onChange={(e) => {
                      setFiltroDocumento(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {/* 🆕 Estado de Atención (Condición Médica) */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estado de Atención</label>
                  <select
                    value={filtroCondicionMedica}
                    onChange={(e) => {
                      setFiltroCondicionMedica(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="todos">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Atendido">Atendido</option>
                    <option value="Deserción">Deserción</option>
                  </select>
                </div>
              </div>

              {/* Macrorregión, Red, IPRESS, Derivación */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Macrorregión</label>
                  <select
                    value={filtroMacrorregion}
                    onChange={(e) => {
                      setFiltroMacrorregion(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="todas">Todas</option>
                    {macrorregionesUnicas.map(macro => (
                      <option key={macro.id} value={macro.descripcion}>{macro.descripcion}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Red</label>
                  <select
                    value={filtroRed}
                    onChange={(e) => {
                      setFiltroRed(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={redesUnicas.length === 0}
                  >
                    <option value="todas">Todas</option>
                    {redesUnicas.map(red => (
                      <option key={red.id} value={red.descripcion}>{red.descripcion} ({red.codigo})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">IPRESS</label>
                  <select
                    value={filtroIpress}
                    onChange={(e) => {
                      setFiltroIpress(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={ipressUnicas.length === 0}
                  >
                    <option value="todas">Todas</option>
                    {ipressUnicas.map(ipress => (
                      <option key={ipress.id} value={ipress.descripcion}>{ipress.descripcion} ({ipress.codigo})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Derivación Interna</label>
                  <select
                    value={filtroDerivacion}
                    onChange={(e) => {
                      setFiltroDerivacion(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="todas">Todas</option>
                    {derivacionesInternas.map(derivacion => (
                      <option key={derivacion} value={derivacion}>{derivacion}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-1">
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
                    setFiltroCondicionMedica("todos"); // 🆕
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-sm"
                >
                  Limpiar Filtros
                </button>
              </div>

              {/* Resumen de Filtros Activos */}
              {(filtroEstado !== "todos" || filtroTipoDoc !== "todos" || filtroDocumento || 
                filtroRangoFechas.inicio || filtroRangoFechas.fin || filtroMacrorregion !== "todas" || 
                filtroRed !== "todas" || filtroIpress !== "todas" || filtroDerivacion !== "todas" || 
                filtroCondicionMedica !== "todos" || searchTerm) && (
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
                        Desde: {formatFechaInput(filtroRangoFechas.inicio)}
                      </span>
                    )}
                    {filtroRangoFechas.fin && (
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                        Hasta: {formatFechaInput(filtroRangoFechas.fin)}
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
                <tr className="border-b border-blue-700">
                  <th className="text-left py-1.5 px-2">
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
                  <th className="px-2 py-1.5 text-left text-xs font-bold uppercase">Fecha de Solicitud</th>
                  <th className="px-2 py-1.5 text-left text-xs font-bold uppercase">DNI</th>
                  <th className="px-2 py-1.5 text-left text-xs font-bold uppercase">Paciente</th>
                  <th className="px-2 py-1.5 text-center text-xs font-bold uppercase">Sexo</th>
                  <th className="px-2 py-1.5 text-center text-xs font-bold uppercase">Edad</th>
                  <th className="px-2 py-1.5 text-left text-xs font-bold uppercase">IPRESS</th>
                  <th className="px-2 py-1.5 text-left text-xs font-bold uppercase">Derivación</th>
                  <th className="px-2 py-1.5 text-left text-xs font-bold uppercase">Tiempo Inicio Síntomas</th>
                  <th className="px-2 py-1.5 text-center text-xs font-bold uppercase">Consentimiento Informado</th>
                  <th className="px-2 py-1.5 text-left text-xs font-bold uppercase">Fecha de Cita</th>
                  <th className="px-2 py-1.5 text-left text-xs font-bold uppercase">Personal ID</th>
                  <th className="px-2 py-1.5 text-left text-xs font-bold uppercase">Estado Atención</th>
                  <th className="px-2 py-1.5 text-left text-xs font-bold uppercase">Motivo de Llamada</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="14" className="py-8 text-center">
                      <RefreshCw className="w-10 h-10 text-slate-300 animate-spin mx-auto mb-1" />
                      <p className="font-medium text-sm text-slate-500">Cargando pacientes...</p>
                    </td>
                  </tr>
                ) : pacientesPaginados.length > 0 ? (
                  pacientesPaginados.map((paciente) => (
                    <tr key={paciente.idSolicitud} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                      <td className="px-2 py-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(paciente.idSolicitud)}
                          onChange={() => handleSelectOne(paciente.idSolicitud)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-700">{formatFecha(paciente.fechaSolicitud)}</td>
                      <td className="px-2 py-1 text-xs text-gray-700 font-mono">{paciente.pacienteDni}</td>
                      <td className="px-2 py-1 text-xs text-gray-900 font-medium">{paciente.pacienteNombre}</td>
                      <td className="px-2 py-1 text-xs text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          paciente.pacienteSexo === "M"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}>
                          {paciente.pacienteSexo === "M" ? "M" : "F"}
                        </span>
                      </td>
                      <td className="px-2 py-1 text-xs text-center text-gray-700">
                        {paciente.pacienteEdad}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-700">
                        {paciente.ipressNombre ? (
                          <div className="flex flex-col gap-0">
                            <span className="font-medium text-xs">{paciente.ipressNombre}</span>
                            <span className="text-xs text-gray-500">{paciente.ipressCodigo}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Sin IPRESS</span>
                        )}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-700">
                        {getDerivacionBadge(paciente.derivacionInterna)}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-700">
                        {(() => {
                          const tiempo = paciente.tiempoInicioSintomas;
                          if (!tiempo || tiempo.trim() === '') {
                            return <span className="text-gray-400 italic text-xs">Sin datos</span>;
                          }
                          
                          const tiempoUpper = tiempo.toUpperCase();
                          let bgColor, textColor;
                          
                          if (tiempoUpper.includes('< 24') || tiempoUpper.includes('<24')) {
                            bgColor = 'bg-red-100';
                            textColor = 'text-red-700';
                          } else if (tiempoUpper.includes('24') && tiempoUpper.includes('72')) {
                            bgColor = 'bg-yellow-100';
                            textColor = 'text-yellow-700';
                          } else if (tiempoUpper.includes('> 72') || tiempoUpper.includes('>72')) {
                            bgColor = 'bg-green-100';
                            textColor = 'text-green-700';
                          } else {
                            bgColor = 'bg-green-100';
                            textColor = 'text-green-700';
                          }
                          
                          return (
                            <span className={`inline-block ${bgColor} ${textColor} px-1.5 py-0.5 rounded text-xs font-semibold`}>
                              {tiempo}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-2 py-1 text-xs text-center">
                        {(() => {
                          const consentimiento = paciente.consentimientoInformado;
                          if (consentimiento === true || consentimiento === 'true' || consentimiento === 'v') {
                            return <span className="inline-block bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-semibold">✓ Sí</span>;
                          } else if (consentimiento === false || consentimiento === 'false') {
                            return <span className="inline-block bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-semibold">✗ No</span>;
                          } else {
                            return <span className="inline-block bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs font-semibold">—</span>;
                          }
                        })()}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-700">
                        {paciente.fechaAtencion && paciente.horaAtencion
                          ? `${formatFecha(paciente.fechaAtencion)} ${formatHora(paciente.horaAtencion)}`
                          : paciente.fechaAtencion
                          ? formatFecha(paciente.fechaAtencion)
                          : "—"}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-700">
                        {paciente.idPersonal || "—"}
                      </td>
                      <td className="px-2 py-1 text-xs">{getCondicionMedicaBadge(paciente.condicionMedica)}</td>
                      <td className="px-2 py-1 text-xs text-gray-700">
                        {paciente.motivoLlamadoBolsa || <span className="text-gray-400 italic">—</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="py-8 text-center">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-medium">No se encontraron pacientes con los filtros aplicados</p>
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
