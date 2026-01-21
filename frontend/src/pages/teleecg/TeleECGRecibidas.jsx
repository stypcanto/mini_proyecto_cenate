import React, { useState, useEffect } from "react";
import {
  Activity,
  Filter,
  Download,
  Eye,
  Check,
  X,
  Search,
  RefreshCw,
  FileDown,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import teleecgService from "../../services/teleecgService";
import VisorECGModal from "../../components/teleecgs/VisorECGModal";
import CarrouselECGModal from "../../components/teleecgs/CarrouselECGModal";
import ProcesarECGModal from "../../components/teleecgs/ProcesarECGModal";
import ModalEvaluacionECG from "../../components/teleecgs/ModalEvaluacionECG";
import toast from "react-hot-toast";

/**
 * 🫀 TeleECGRecibidas - Panel administrativo de ECGs consolidado
 * Muestra TODAS las ECGs recibidas de TODAS las IPRESS
 * Acceso: ADMIN, SUPERADMIN, COORDINADOR_RED, ENFERMERIA
 */
export default function TeleECGRecibidas() {
  const { user } = useAuth();

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [ecgs, setEcgs] = useState([]);
  const [selectedECG, setSelectedECG] = useState(null);
  const [showVisor, setShowVisor] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ FIX T-ECG-003: Modal para procesar con observaciones
  const [showProcesarModal, setShowProcesarModal] = useState(false);
  const [ecgParaProcesar, setEcgParaProcesar] = useState(null);

  // ✅ v3.0.0: Modal para evaluar como NORMAL/ANORMAL + descripción
  const [showEvaluacionModal, setShowEvaluacionModal] = useState(false);
  const [ecgParaEvaluar, setEcgParaEvaluar] = useState(null);
  const [evaluandoImagen, setEvaluandoImagen] = useState(false);

  // Estadísticas consolidadas (v3.0.0: CENATE view con nuevos estados)
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,      // PENDIENTE = ENVIADA en BD
    observadas: 0,       // OBSERVADA = con observaciones
    atendidas: 0,        // ATENDIDA = completadas
  });

  // Filtros
  const [filtros, setFiltros] = useState({
    searchTerm: "",
    estado: "TODOS",
    ipress: "TODOS",
    fechaDesde: "",
    fechaHasta: "",
  });

  // IPRESS disponibles (para el filtro)
  const [ipressOptions, setIpressOptions] = useState([]);

  // Cargar ECGs al montarse
  useEffect(() => {
    cargarECGs();
    cargarEstadisticas();
    extraerIpressOptions();
  }, []);

  /**
   * ✅ v1.21.5: Cargar todas las ECGs agrupadas por asegurado
   */
  const cargarECGs = async () => {
    try {
      setLoading(true);
      // Usar nuevo endpoint que agrupa por asegurado
      const response = await teleecgService.listarAgrupoPorAsegurado("", filtros.estado);
      const ecgData = Array.isArray(response) ? response : [];
      setEcgs(ecgData);
      console.log("✅ ECGs agrupadas cargadas:", ecgData.length, "asegurados");
    } catch (error) {
      console.error("❌ Error al cargar ECGs:", error);
      setEcgs([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estadísticas consolidadas (v3.0.0)
   */
  const cargarEstadisticas = async () => {
    try {
      const response = await teleecgService.obtenerEstadisticas();
      const statsData = response || {};
      // v3.0.0: Para CENATE, usar nuevos nombres de estados
      // Fallback a conteo local si API no retorna los nuevos campos
      setStats({
        total: statsData.totalImagenesCargadas || statsData.total || 0,
        pendientes: statsData.totalPendientes || statsData.totalImagenesPendientes || 0,
        observadas: statsData.totalObservadas || statsData.totalImagenesRechazadas || 0,
        atendidas: statsData.totalAtendidas || statsData.totalImagenesProcesadas || 0,
      });
      console.log("✅ Estadísticas consolidadas (v3.0.0):", statsData);
    } catch (error) {
      console.error("❌ Error al cargar estadísticas:", error);
    }
  };

  /**
   * Extraer opciones IPRESS únicas de los ECGs
   */
  const extraerIpressOptions = () => {
    setTimeout(() => {
      const ipressUniques = [...new Set(ecgs.map((e) => e.nombreIpress))].filter(
        Boolean
      );
      setIpressOptions(ipressUniques);
    }, 100);
  };

  /**
   * Refrescar todos los datos
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarECGs();
    await cargarEstadisticas();
    extraerIpressOptions();
    setRefreshing(false);
  };

  /**
   * ✅ FIX T-ECG-003: Procesar ECG - Abrir modal para observaciones
   */
  const handleProcesar = (ecg) => {
    setEcgParaProcesar(ecg);
    setShowProcesarModal(true);
  };

  /**
   * Confirmar procesamiento con observaciones
   */
  const handleConfirmarProcesamiento = async (observaciones) => {
    try {
      await teleecgService.procesarImagen(ecgParaProcesar.id_imagen || ecgParaProcesar.idImagen, observaciones);
      toast.success("✅ ECG procesada exitosamente");
      setShowProcesarModal(false);
      setEcgParaProcesar(null);
      await cargarECGs();
      await cargarEstadisticas();
    } catch (error) {
      console.error("❌ Error al procesar ECG:", error);
      toast.error("Error al procesar la ECG");
    }
  };

  /**
   * ✅ FIX T-ECG-004: Rechazar ECG - Con confirmación
   */
  const handleRechazar = async (idImagen) => {
    // Primero pedir confirmación
    if (!window.confirm("¿Estás seguro de que deseas rechazar esta ECG? Esta acción no se puede deshacer.")) {
      return;
    }

    // Luego pedir motivo
    const motivo = prompt("Ingresa el motivo del rechazo:");
    if (!motivo || motivo.trim() === "") {
      toast("El motivo del rechazo es requerido", { icon: "⚠️" });
      return;
    }

    try {
      await teleecgService.rechazarImagen(idImagen, motivo);
      toast.success("✅ ECG rechazada exitosamente");
      await cargarECGs();
      await cargarEstadisticas();
    } catch (error) {
      console.error("❌ Error al rechazar ECG:", error);
      toast.error("Error al rechazar la ECG");
    }
  };

  /**
   * Descargar ECG
   */
  const handleDescargar = async (idImagen, nombreArchivo) => {
    try {
      await teleecgService.descargarImagen(idImagen, nombreArchivo);
    } catch (error) {
      console.error("❌ Error al descargar ECG:", error);
      alert("Error al descargar la imagen");
    }
  };

  /**
   * Ver visor de ECG
   */
  const handleVer = async (ecg) => {
    try {
      const imagenData = await teleecgService.verPreview(ecg.id_imagen || ecg.idImagen);
      const ecgConImagen = {
        ...ecg,
        contenidoImagen: imagenData.contenidoImagen,
        tipoContenido: imagenData.tipoContenido,
      };
      setSelectedECG(ecgConImagen);
      setShowVisor(true);
    } catch (error) {
      console.error("❌ Error al cargar imagen:", error);
      alert("No se pudo cargar la imagen");
    }
  };

  /**
   * ✅ v3.0.0: Abrir modal de evaluación (NORMAL/ANORMAL + descripción)
   */
  const handleEvaluar = (ecg) => {
    setEcgParaEvaluar(ecg);
    setShowEvaluacionModal(true);
  };

  /**
   * ✅ v3.0.0: Confirmar evaluación y guardar
   */
  const handleConfirmarEvaluacion = async (evaluacion, descripcion) => {
    try {
      setEvaluandoImagen(true);
      await teleecgService.evaluarImagen(
        ecgParaEvaluar.id_imagen || ecgParaEvaluar.idImagen,
        evaluacion,
        descripcion
      );
      toast.success(`✅ ECG evaluada como ${evaluacion}`);
      setShowEvaluacionModal(false);
      setEcgParaEvaluar(null);
      await cargarECGs();
      await cargarEstadisticas();
    } catch (error) {
      console.error("❌ Error al evaluar ECG:", error);
      toast.error(error.message || "Error al guardar evaluación");
    } finally {
      setEvaluandoImagen(false);
    }
  };

  /**
   * Exportar a Excel
   */
  const handleExportar = async () => {
    try {
      await teleecgService.exportarExcel();
      alert("✅ Datos exportados a Excel");
    } catch (error) {
      console.error("❌ Error al exportar:", error);
      alert("Error al exportar los datos");
    }
  };

  /**
   * ✅ v1.21.5: Aplicar filtros (para datos agrupados por asegurado)
   */
  const ecgsFiltrados = ecgs.filter((asegurado) => {
    // Búsqueda por DNI o nombre
    const matchSearch =
      !filtros.searchTerm ||
      asegurado.num_doc_paciente?.includes(filtros.searchTerm) ||
      asegurado.nombres_paciente?.toLowerCase().includes(filtros.searchTerm.toLowerCase()) ||
      asegurado.apellidos_paciente?.toLowerCase().includes(filtros.searchTerm.toLowerCase());

    // Filtro de estado (usando estado_transformado o estado_principal)
    const estado = asegurado.estado_transformado || asegurado.estado_principal;
    const matchEstado =
      filtros.estado === "TODOS" || estado === filtros.estado;

    // Filtro de IPRESS
    const matchIpress =
      filtros.ipress === "TODOS" || asegurado.nombre_ipress === filtros.ipress;

    // Filtro de fecha (usando fecha_ultimo_ecg)
    const fechaEnvio = new Date(asegurado.fecha_ultimo_ecg);
    const matchFecha =
      (!filtros.fechaDesde ||
        fechaEnvio >= new Date(filtros.fechaDesde)) &&
      (!filtros.fechaHasta ||
        fechaEnvio <= new Date(filtros.fechaHasta));

    return matchSearch && matchEstado && matchIpress && matchFecha;
  });

  /**
   * Badge de estado (v3.0.0: Nuevos estados para CENATE)
   * Usa estadoTransformado si está disponible (para CENATE es PENDIENTE, OBSERVADA, ATENDIDA)
   */
  const getEstadoBadge = (ecg) => {
    // Preferir estadoTransformado si está disponible
    const estado = ecg.estadoTransformado || ecg.estado;

    const badges = {
      PENDIENTE: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" /> Pendiente
        </span>
      ),
      OBSERVADA: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <AlertCircle className="w-3 h-3" /> Observada
        </span>
      ),
      ATENDIDA: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" /> Atendida
        </span>
      ),
      // Legacy states for backward compatibility
      PROCESADA: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" /> Procesada
        </span>
      ),
      RECHAZADA: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" /> Rechazada
        </span>
      ),
    };
    return badges[estado] || estado;
  };

  /**
   * ✅ v3.0.0: Badge para evaluación médica (NORMAL/ANORMAL)
   */
  const getEvaluacionBadge = (evaluacion) => {
    const badges = {
      NORMAL: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" /> NORMAL
        </span>
      ),
      ANORMAL: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3" /> ANORMAL
        </span>
      ),
      SIN_EVALUAR: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <Clock className="w-3 h-3" /> Sin evaluar
        </span>
      ),
    };
    return badges[evaluacion] || (evaluacion ? evaluacion : badges.SIN_EVALUAR);
  };

  /**
   * Formatear tamaño en bytes
   */
  const formatSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Formatear fecha
   */
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 🎯 Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              TeleECG Recibidas
            </h1>
          </div>
          <p className="text-gray-600 ml-11">
            Vista consolidada de todos los electrocardiogramas recibidos de las IPRESS
          </p>
        </div>

        {/* 📊 Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total ECGs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </p>
              </div>
              <Activity className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendientes}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Observadas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.observadas}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Atendidas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.atendidas}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* 🎨 Sección de Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar (DNI o Nombre)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="DNI o nombre del paciente..."
                  value={filtros.searchTerm}
                  onChange={(e) =>
                    setFiltros({ ...filtros, searchTerm: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Estado (v3.0.0: Nuevos nombres para CENATE) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) =>
                  setFiltros({ ...filtros, estado: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="TODOS">Todos</option>
                <option value="PENDIENTE">Pendientes (Enviadas)</option>
                <option value="OBSERVADA">Observadas (Con problemas)</option>
                <option value="ATENDIDA">Atendidas (Completadas)</option>
              </select>
            </div>

            {/* IPRESS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IPRESS
              </label>
              <select
                value={filtros.ipress}
                onChange={(e) =>
                  setFiltros({ ...filtros, ipress: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="TODOS">Todas</option>
                {ipressOptions.map((ipress) => (
                  <option key={ipress} value={ipress}>
                    {ipress}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtro de fechas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) =>
                  setFiltros({ ...filtros, fechaDesde: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) =>
                  setFiltros({ ...filtros, fechaHasta: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refrescar</span>
              </button>
              <button
                onClick={handleExportar}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* 📋 Tabla de ECGs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando ECGs...</p>
            </div>
          ) : ecgsFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                No se encontraron ECGs con los filtros especificados
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      DNI
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Paciente
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      IPRESS
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Fecha Envío
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Tamaño
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Evaluación
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ecgsFiltrados.map((asegurado) => (
                    <tr
                      key={asegurado.num_doc_paciente}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {asegurado.num_doc_paciente}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <div>
                            <p>{asegurado.nombres_paciente} {asegurado.apellidos_paciente}</p>
                            <p className="text-xs text-gray-500">📌 {asegurado.total_ecgs} ECGs</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {asegurado.nombre_ipress || asegurado.codigo_ipress}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(asegurado.fecha_ultimo_ecg)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded w-fit">
                            📤 {asegurado.ecgs_pendientes || 0} Enviadas
                          </span>
                          {asegurado.ecgs_observadas > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded w-fit">
                              ⚠️ {asegurado.ecgs_observadas} Observadas
                            </span>
                          )}
                          {asegurado.ecgs_atendidas > 0 && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded w-fit">
                              ✅ {asegurado.ecgs_atendidas} Atendidas
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getEstadoBadge(asegurado)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getEvaluacionBadge(asegurado.evaluacion_principal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          {/* Ver todas las ECGs en un carrusel/modal */}
                          <button
                            onClick={() => {
                              setSelectedECG(asegurado);
                              setShowVisor(true);
                            }}
                            title="Ver todas las ECGs"
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Descargar todas las ECGs (ZIP) - TODO: Implementar en backend */}
                          <button
                            onClick={() => {
                              toast.error("Función aún no implementada");
                            }}
                            title="Descargar todas (ZIP)"
                            className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors opacity-50 cursor-not-allowed"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Evaluar si alguna no está evaluada */}
                          {(asegurado.evaluacion_principal === "SIN_EVALUAR" || !asegurado.evaluacion_principal) && (
                            <button
                              onClick={() => {
                                if (asegurado.imagenes && asegurado.imagenes.length > 0) {
                                  setEcgParaEvaluar(asegurado.imagenes[0]);
                                  setShowEvaluacionModal(true);
                                }
                              }}
                              title="Evaluar grupo"
                              className="p-2 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Procesar si alguna está pendiente */}
                          {asegurado.ecgs_pendientes > 0 && (
                            <button
                              onClick={() => {
                                if (asegurado.imagenes && asegurado.imagenes.length > 0) {
                                  setEcgParaProcesar(asegurado.imagenes[0]);
                                  setShowProcesarModal(true);
                                }
                              }}
                              title="Procesar grupo"
                              className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {/* Rechazar si alguna está pendiente */}
                          {asegurado.ecgs_pendientes > 0 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Rechazar todas las ${asegurado.total_ecgs} ECGs de este asegurado?`)) {
                                  const motivo = prompt("Ingresa el motivo del rechazo:");
                                  if (motivo && motivo.trim() !== "") {
                                    // Rechazar la primera imagen (como representativa del grupo)
                                    handleRechazar(asegurado.imagenes[0].id_imagen);
                                  }
                                }
                              }}
                              title="Rechazar grupo"
                              className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Información de paginación */}
        {ecgsFiltrados.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Mostrando {ecgsFiltrados.length} de {ecgs.length} ECGs
          </div>
        )}
      </div>

      {/* 👁️ ✅ v1.21.5: Modal Carrusel de Múltiples ECGs por Asegurado */}
      {showVisor && selectedECG && selectedECG.imagenes && selectedECG.imagenes.length > 0 ? (
        <CarrouselECGModal
          imagenes={selectedECG.imagenes}
          paciente={{
            numDoc: selectedECG.num_doc_paciente,
            nombres: selectedECG.nombres_paciente,
            apellidos: selectedECG.apellidos_paciente,
          }}
          onClose={() => {
            setShowVisor(false);
            setSelectedECG(null);
          }}
          onDescargar={() => {
            toast.error("Función de descarga múltiple aún no implementada");
          }}
        />
      ) : showVisor && selectedECG ? (
        // Fallback a visor individual si no tiene múltiples imágenes
        <VisorECGModal
          ecg={selectedECG}
          onClose={() => {
            setShowVisor(false);
            setSelectedECG(null);
          }}
          onDescargar={() =>
            handleDescargar(selectedECG.idImagen, selectedECG.nombreArchivo)
          }
        />
      ) : null}

      {/* ✅ FIX T-ECG-003: Modal para procesar ECG con observaciones */}
      {showProcesarModal && ecgParaProcesar && (
        <ProcesarECGModal
          ecg={ecgParaProcesar}
          onConfirm={handleConfirmarProcesamiento}
          onCancel={() => {
            setShowProcesarModal(false);
            setEcgParaProcesar(null);
          }}
        />
      )}

      {/* ✅ v3.0.0: Modal para evaluar ECG como NORMAL/ANORMAL + descripción */}
      {showEvaluacionModal && ecgParaEvaluar && (
        <ModalEvaluacionECG
          isOpen={showEvaluacionModal}
          ecg={ecgParaEvaluar}
          onClose={() => {
            setShowEvaluacionModal(false);
            setEcgParaEvaluar(null);
          }}
          onConfirm={handleConfirmarEvaluacion}
          loading={evaluandoImagen}
        />
      )}
    </div>
  );
}
