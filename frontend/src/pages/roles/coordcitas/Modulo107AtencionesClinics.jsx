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

  // ==================== FILTROS ====================
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipoDoc, setFiltroTipoDoc] = useState("todos");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroFechaSolicitudInicio, setFiltroFechaSolicitudInicio] = useState("");
  const [filtroFechaSolicitudFin, setFiltroFechaSolicitudFin] = useState("");
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
   * Simula carga de datos desde backend
   * TODO: Conectar con API real
   */
  const cargarAtenciones = async () => {
    setIsLoading(true);
    try {
      // Simulación de datos
      const datosSimulados = [
        {
          id_solicitud: "SOL-001",
          numero_solicitud: "001",
          id_bolsa: 1,
          activo: true,
          paciente_id: "P001",
          paciente_nombre: "Juan Pérez García",
          paciente_dni: "12345678",
          tipo_documento: "DNI",
          paciente_sexo: "M",
          fecha_nacimiento: "1980-05-15",
          paciente_edad: 44,
          paciente_telefono: "987654321",
          codigo_adscripcion: "008",
          id_ipress: 15,
          derivacion_interna: "MEDICINA CENATE",
          estado: "PENDIENTE",
          fecha_solicitud: "2026-01-25",
          fecha_actualizacion: "2026-01-30",
          responsable_gestora_id: null,
          fecha_asignacion: null,
          macrorregion: "LIMA",
          red: "RED METROPOLITANA",
          ipress_nombre: "Hospital Principal"
        },
        {
          id_solicitud: "SOL-002",
          numero_solicitud: "002",
          id_bolsa: 2,
          activo: true,
          paciente_id: "P002",
          paciente_nombre: "María López Rodríguez",
          paciente_dni: "87654321",
          tipo_documento: "DNI",
          paciente_sexo: "F",
          fecha_nacimiento: "1992-10-22",
          paciente_edad: 32,
          paciente_telefono: "987123456",
          codigo_adscripcion: "008",
          id_ipress: 20,
          derivacion_interna: "NUTRICION CENATE",
          estado: "ATENDIDO",
          fecha_solicitud: "2026-01-20",
          fecha_actualizacion: "2026-01-28",
          responsable_gestora_id: 5,
          fecha_asignacion: "2026-01-21",
          macrorregion: "CALLAO",
          red: "RED CALLAO",
          ipress_nombre: "Centro Médico Bellavista"
        }
      ];

      setAtenciones(datosSimulados);
      setTotalElementos(datosSimulados.length);
      setEstadisticas({
        total: datosSimulados.length,
        pendientes: datosSimulados.filter(a => a.estado === "PENDIENTE").length,
        atendidos: datosSimulados.filter(a => a.estado === "ATENDIDO").length
      });

      // Extraer catálogos únicos
      const macros = [...new Set(datosSimulados.map(a => a.macrorregion))];
      const redes = [...new Set(datosSimulados.map(a => a.red))];
      const ipress = [...new Set(datosSimulados.map(a => a.ipress_nombre))];
      const tipos = [...new Set(datosSimulados.map(a => a.tipo_documento))];

      setMacrorregionesUnicas(macros);
      setRedesUnicas(redes);
      setIpressUnicas(ipress);
      setTiposDocumentoUnicos(tipos);

      setErrorMessage("");
    } catch (error) {
      console.error("Error al cargar atenciones:", error);
      setErrorMessage("Error al cargar los datos de atenciones clínicas");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filtra atenciones según criterios activos
   */
  const atencionesFiltradas = useMemo(() => {
    return atenciones.filter(atencion => {
      // Filtro por estado
      if (filtroEstado !== "todos" && atencion.estado !== filtroEstado) return false;

      // Filtro por tipo de documento
      if (filtroTipoDoc !== "todos" && atencion.tipo_documento !== filtroTipoDoc) return false;

      // Filtro por documento exacto
      if (filtroDocumento && !atencion.paciente_dni.includes(filtroDocumento)) return false;

      // Filtro por fecha de solicitud (rango)
      if (filtroFechaSolicitudInicio && atencion.fecha_solicitud < filtroFechaSolicitudInicio) return false;
      if (filtroFechaSolicitudFin && atencion.fecha_solicitud > filtroFechaSolicitudFin) return false;

      // Filtro por macrorregión
      if (filtroMacrorregion !== "todas" && atencion.macrorregion !== filtroMacrorregion) return false;

      // Filtro por red
      if (filtroRed !== "todas" && atencion.red !== filtroRed) return false;

      // Filtro por IPRESS
      if (filtroIpress !== "todas" && atencion.ipress_nombre !== filtroIpress) return false;

      // Filtro por derivación interna
      if (filtroDerivacion !== "todas" && atencion.derivacion_interna !== filtroDerivacion) return false;

      // Búsqueda general (nombre, DNI, solicitud)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesNombre = atencion.paciente_nombre.toLowerCase().includes(searchLower);
        const matchesDni = atencion.paciente_dni.includes(searchTerm);
        const matchesSolicitud = atencion.numero_solicitud.includes(searchTerm);
        if (!matchesNombre && !matchesDni && !matchesSolicitud) return false;
      }

      return true;
    });
  }, [
    atenciones, searchTerm, filtroEstado, filtroTipoDoc, filtroDocumento,
    filtroFechaSolicitudInicio, filtroFechaSolicitudFin, filtroMacrorregion,
    filtroRed, filtroIpress, filtroDerivacion
  ]);

  // Paginación
  const atencionesPaginadas = useMemo(() => {
    const inicio = (currentPage - 1) * REGISTROS_POR_PAGINA;
    const fin = inicio + REGISTROS_POR_PAGINA;
    return atencionesFiltradas.slice(inicio, fin);
  }, [atencionesFiltradas, currentPage]);

  const totalPaginas = Math.ceil(atencionesFiltradas.length / REGISTROS_POR_PAGINA);

  // Cargar datos al montar
  useEffect(() => {
    cargarAtenciones();
  }, []);

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

              {/* Fila 2: Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Solicitud - Desde</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filtroFechaSolicitudInicio}
                    onChange={(e) => {
                      setFiltroFechaSolicitudInicio(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Solicitud - Hasta</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filtroFechaSolicitudFin}
                    onChange={(e) => {
                      setFiltroFechaSolicitudFin(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
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
                    setFiltroFechaSolicitudInicio("");
                    setFiltroFechaSolicitudFin("");
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
                      <tr key={atencion.id_solicitud} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{atencion.id_solicitud}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.numero_solicitud}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{atencion.paciente_nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.paciente_dni}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.paciente_edad}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.paciente_sexo === "M" ? "Masculino" : "Femenino"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.paciente_telefono}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.ipress_nombre}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            {atencion.derivacion_interna}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            atencion.estado === "PENDIENTE"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {atencion.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{atencion.fecha_solicitud}</td>
                        <td className="px-4 py-3 text-sm">
                          <button className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                            <Eye size={16} /> Ver
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
    </div>
  );
}
