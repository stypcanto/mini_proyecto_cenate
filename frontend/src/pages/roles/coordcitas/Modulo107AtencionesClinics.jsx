// ========================================================================
// 🏥 Modulo107AtencionesClinics.jsx – Atenciones Clínicas Módulo 107
// ========================================================================
/**
 * v2.0.0 - Rediseño completo con tabla de atenciones y filtros avanzados
 * Características:
 * - Dashboard de estadísticas por estado (Total, Pendientes, Atendidos)
 * - Tabla con columnas de identificación, datos del paciente, contexto asistencial y trazabilidad
 * - Filtros: Estado, Tipo Documento, Documento, Fecha Solicitud, Macrorregión, Red, IPRESS, Derivación Interna
 * - Búsqueda de pacientes por nombre, DNI o número de solicitud
 * - Paginación de resultados
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Activity, Search, ChevronDown, Filter, AlertCircle, Eye, Download,
  Calendar, FileText, BarChart3, Users
} from "lucide-react";
import PageHeader from '../../../components/PageHeader';
import ListHeader from '../../../components/ListHeader';
import { atencionesClinicasService } from '../../../services/atencionesClinicasService';
import DetalleAtencionModal from '../../../components/modals/DetalleAtencionModal';

const REGISTROS_POR_PAGINA = 25;

export default function Modulo107AtencionesClinics() {
  // ==================== ESTADO GENERAL ====================
  const [atenciones, setAtenciones] = useState([]);
  const [totalElementos, setTotalElementos] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandFiltros, setExpandFiltros] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  // ==================== ESTADO MODAL ====================
  const [modalAbierto, setModalAbierto] = useState(false);
  const [atencionSeleccionada, setAtencionSeleccionada] = useState(null);

  // ==================== FILTROS ====================
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
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    atendidos: 0
  });

  // ==================== CATÁLOGOS ====================
  const [macrorregionesUnicas, setMacrorregionesUnicas] = useState([]);
  const [redesUnicas, setRedesUnicas] = useState([]);
  const [ipressUnicas, setIpressUnicas] = useState([]);
  const [tiposDocumentoUnicos, setTiposDocumentoUnicos] = useState([]);
  const [estadosUnicos, setEstadosUnicos] = useState(["PENDIENTE", "ATENDIDO"]);

  // Derivaciones internas disponibles
  const derivacionesInternas = [
    "MEDICINA CENATE",
    "NUTRICION CENATE",
    "PSICOLOGIA CENATE"
  ];

  // ==================== FUNCIONES AUXILIARES ====================

  /**
   * Carga datos desde API real
   */
  const cargarAtenciones = async () => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      // Preparar filtros para el backend
      const filtros = {};
      
      // Filtros directos (sin mapeo de IDs)
      if (filtroEstado !== "todos") {
        filtros.estado = filtroEstado; // Enviar directamente "PENDIENTE" o "ATENDIDO"
      }
      
      // Otros filtros
      if (filtroTipoDoc !== "todos") filtros.tipoDocumento = filtroTipoDoc;
      if (filtroDocumento) filtros.pacienteDni = filtroDocumento;
      if (filtroRangoFechas.inicio) filtros.fechaDesde = filtroRangoFechas.inicio;
      if (filtroRangoFechas.fin) filtros.fechaHasta = filtroRangoFechas.fin;
      if (filtroDerivacion !== "todas") filtros.derivacion = filtroDerivacion;
      if (searchTerm) filtros.searchTerm = searchTerm;
      
      // Llamar al servicio
      console.log('🔍 Filtros enviados al backend:', filtros); // Debug
      console.log('📋 Estado seleccionado:', filtroEstado); // Debug adicional
      const response = await atencionesClinicasService.listarConFiltros(
        filtros, 
        currentPage - 1, // Backend usa páginas base 0
        REGISTROS_POR_PAGINA
      );
      
      // Actualizar estado con respuesta
      setAtenciones(response.content || []);
      setTotalElementos(response.totalElements || 0);
      
      // Extraer catálogos únicos de la respuesta
      const content = response.content || [];
      if (content.length > 0) {
        const tipos = [...new Set(content.map(a => a.tipoDocumento))];
        setTiposDocumentoUnicos(tipos);
      }
      
    } catch (error) {
      console.error("Error al cargar atenciones:", error);
      setErrorMessage("Error al cargar los datos de atenciones clínicas");
      setAtenciones([]);
      setTotalElementos(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Cargar estadísticas desde API
   */
  const cargarEstadisticas = async () => {
    try {
      const stats = await atencionesClinicasService.obtenerEstadisticas();
      setEstadisticas({
        total: stats.total || 0,
        pendientes: stats.pendientes || 0,
        atendidos: stats.atendidos || 0
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  /**
   * Los filtros ya no se aplican en frontend, 
   * se envían al backend en cargarAtenciones()
   */
  const atencionesFiltradas = atenciones; // Datos ya vienen filtrados del backend
  // Paginación
  // Los datos ya vienen paginados del backend
  const atencionesPaginadas = atencionesFiltradas;

  // ==================== FUNCIONES MODAL ====================
  
  /**
   * Abrir modal con detalle de atención
   */
  const abrirModal = (atencion) => {
    setAtencionSeleccionada(atencion);
    setModalAbierto(true);
  };

  /**
   * Cerrar modal de detalle
   */
  const cerrarModal = () => {
    setModalAbierto(false);
    setAtencionSeleccionada(null);
  };

  // Calcular páginas basado en totalElementos del backend
  const totalPaginas = Math.ceil(totalElementos / REGISTROS_POR_PAGINA);

  // Cargar datos iniciales
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  // Recargar atenciones cuando cambien los filtros
  useEffect(() => {
    cargarAtenciones();
  }, [
    currentPage, filtroEstado, filtroTipoDoc, filtroDocumento,
    filtroRangoFechas.inicio, filtroRangoFechas.fin, 
    filtroDerivacion, searchTerm
  ]);

  // Cerrar selector de fechas al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mostrarSelectorFechas && !event.target.closest('.date-picker-container')) {
        setMostrarSelectorFechas(false);
      }
    };

    if (mostrarSelectorFechas) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarSelectorFechas]);

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="w-full">
        {/* Header */}
        <PageHeader
          badge={{
            label: "Módulo 107",
            bgColor: "bg-purple-100 text-purple-700",
            icon: Activity
          }}
          title="Atenciones Clínicas"
          primaryAction={{
            label: "Descargar Reporte",
            onClick: () => alert("Funcionalidad a implementar"),
            icon: Download
          }}
        />

        {/* Estadísticas */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Atenciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            {/* Total */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-100">Total de Atenciones</span>
                <span className="text-3xl">👥</span>
              </div>
              <div className="text-4xl font-bold">{estadisticas.total}</div>
            </div>

            {/* Pendientes */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-orange-100">Pendientes</span>
                <span className="text-3xl">⏳</span>
              </div>
              <div className="text-4xl font-bold">{estadisticas.pendientes}</div>
            </div>

            {/* Atendidos */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-100">Atendidos</span>
                <span className="text-3xl">✓</span>
              </div>
              <div className="text-4xl font-bold">{estadisticas.atendidos}</div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header con toggle de filtros */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Lista de Atenciones Clínicas</h2>
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
                    placeholder="Buscar por nombre, DNI o número de solicitud..."
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
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="ATENDIDO">Atendido</option>
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

              {/* Fila 2: Rango de Fechas */}
              <div className="grid grid-cols-1 gap-4">
                <div className="relative date-picker-container">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rango de Fechas de Solicitud
                  </label>
                  <div 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white flex items-center justify-between"
                    onClick={() => setMostrarSelectorFechas(!mostrarSelectorFechas)}
                  >
                    <span className="text-gray-700">
                      {filtroRangoFechas.inicio && filtroRangoFechas.fin
                        ? `${new Date(filtroRangoFechas.inicio).toLocaleDateString('es-ES')} - ${new Date(filtroRangoFechas.fin).toLocaleDateString('es-ES')}`
                        : filtroRangoFechas.inicio
                        ? `Desde: ${new Date(filtroRangoFechas.inicio).toLocaleDateString('es-ES')}`
                        : filtroRangoFechas.fin
                        ? `Hasta: ${new Date(filtroRangoFechas.fin).toLocaleDateString('es-ES')}`
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

              {/* Fila 3: Macrorregión, Red, IPRESS */}
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
                      <option key={macro} value={macro}>{macro}</option>
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
                  >
                    <option value="todas">Todas</option>
                    {redesUnicas.map(red => (
                      <option key={red} value={red}>{red}</option>
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
                  >
                    <option value="todas">Todas</option>
                    {ipressUnicas.map(ipress => (
                      <option key={ipress} value={ipress}>{ipress}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila 4: Derivación Interna */}
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
                    {derivacionesInternas.map(deriv => (
                      <option key={deriv} value={deriv}>{deriv}</option>
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
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 font-medium">Cargando atenciones clínicas...</p>
              </div>
            ) : errorMessage ? (
              <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-semibold">{errorMessage}</p>
                  <button
                    onClick={() => cargarAtenciones()}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : atencionesFiltradas.length === 0 ? (
              <div className="p-12 text-center">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No se encontraron atenciones con los filtros aplicados</p>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-[#0D5BA9] text-white sticky top-0">
                    <tr className="border-b-2 border-blue-800">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">ID Solicitud</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Nro Solicitud</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Nombre Paciente</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">DNI</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Edad</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Sexo</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Teléfono</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">IPRESS</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Derivación</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Fecha Solicitud</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atencionesPaginadas.map((atencion) => (
                      <tr key={atencion.idSolicitud} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{atencion.idSolicitud}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.numeroSolicitud}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{atencion.pacienteNombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.pacienteDni}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.pacienteEdad}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.pacienteSexo === "M" ? "Masculino" : "Femenino"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.pacienteTelefono}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.ipressNombre}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            {atencion.derivacionInterna}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {(() => {
                            // Usar estadoDescripcion si está disponible, sino usar estado y mapearlo
                            const estadoTexto = atencion.estadoDescripcion || atencion.estado || "SIN ESTADO";
                            const estadoNormalizado = estadoTexto.toUpperCase();
                            
                            return (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                estadoNormalizado.includes("PENDIENTE") 
                                  ? "bg-orange-100 text-orange-700"
                                  : estadoNormalizado.includes("ATENDIDO") || estadoNormalizado.includes("COMPLETADO")
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                                {estadoTexto}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.fechaSolicitud}</td>
                        <td className="px-4 py-3 text-sm">
                          <button 
                            onClick={() => abrirModal(atencion)}
                            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                          >
                            <Eye size={16} /> Ver Detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Paginación */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Mostrando {(currentPage - 1) * REGISTROS_POR_PAGINA + 1} a {Math.min(
                      currentPage * REGISTROS_POR_PAGINA,
                      totalElementos
                    )} de {totalElementos} resultados
                      atencionesFiltradas.length
                    )} de {atencionesFiltradas.length} registros
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                      .filter(p => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPaginas)
                      .map((p, idx, arr) => (
                        <React.Fragment key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2 text-gray-500">...</span>}
                          <button
                            onClick={() => setCurrentPage(p)}
                            className={`px-3 py-1 rounded font-semibold transition-colors ${
                              p === currentPage
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      disabled={currentPage === totalPaginas}
                      onClick={() => setCurrentPage(Math.min(totalPaginas, currentPage + 1))}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
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

      {/* Modal de detalle de atención */}
      <DetalleAtencionModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        atencion={atencionSeleccionada}
      />
    </div>
  );
}
