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

  // Estadísticas consolidadas
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    procesadas: 0,
    rechazadas: 0,
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
   * Cargar todas las ECGs
   */
  const cargarECGs = async () => {
    try {
      setLoading(true);
      const response = await teleecgService.listarImagenes("", 0);
      const ecgData = response?.content || response?.data || response || [];
      setEcgs(Array.isArray(ecgData) ? ecgData : []);
      console.log("✅ ECGs consolidadas cargadas:", ecgData.length);
    } catch (error) {
      console.error("❌ Error al cargar ECGs:", error);
      setEcgs([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estadísticas consolidadas
   */
  const cargarEstadisticas = async () => {
    try {
      const response = await teleecgService.obtenerEstadisticas();
      const statsData = response || {};
      setStats({
        total: statsData.totalImagenesCargadas || 0,
        pendientes: statsData.totalImagenesPendientes || 0,
        procesadas: statsData.totalImagenesProcesadas || 0,
        rechazadas: statsData.totalImagenesRechazadas || 0,
      });
      console.log("✅ Estadísticas consolidadas:", statsData);
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
   * Procesar ECG (aceptar)
   */
  const handleProcesar = async (idImagen) => {
    const observaciones = prompt("Ingresa observaciones (opcional):");
    if (observaciones === null) return;

    try {
      await teleecgService.procesarImagen(idImagen, observaciones);
      alert("✅ ECG procesada exitosamente");
      await cargarECGs();
      await cargarEstadisticas();
    } catch (error) {
      console.error("❌ Error al procesar ECG:", error);
      alert("Error al procesar la ECG");
    }
  };

  /**
   * Rechazar ECG
   */
  const handleRechazar = async (idImagen) => {
    const motivo = prompt("Ingresa el motivo del rechazo:");
    if (motivo === null) return;

    try {
      await teleecgService.rechazarImagen(idImagen, motivo);
      alert("✅ ECG rechazada");
      await cargarECGs();
      await cargarEstadisticas();
    } catch (error) {
      console.error("❌ Error al rechazar ECG:", error);
      alert("Error al rechazar la ECG");
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
      const imagenData = await teleecgService.verPreview(ecg.idImagen);
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
   * Aplicar filtros
   */
  const ecgsFiltrados = ecgs.filter((ecg) => {
    // Búsqueda por DNI o nombre
    const matchSearch =
      !filtros.searchTerm ||
      ecg.numDocPaciente?.includes(filtros.searchTerm) ||
      ecg.nombresPaciente?.toLowerCase().includes(filtros.searchTerm.toLowerCase()) ||
      ecg.apellidosPaciente?.toLowerCase().includes(filtros.searchTerm.toLowerCase());

    // Filtro de estado
    const matchEstado =
      filtros.estado === "TODOS" || ecg.estado === filtros.estado;

    // Filtro de IPRESS
    const matchIpress =
      filtros.ipress === "TODOS" || ecg.nombreIpress === filtros.ipress;

    // Filtro de fecha
    const fechaEnvio = new Date(ecg.fechaEnvio);
    const matchFecha =
      (!filtros.fechaDesde ||
        fechaEnvio >= new Date(filtros.fechaDesde)) &&
      (!filtros.fechaHasta ||
        fechaEnvio <= new Date(filtros.fechaHasta));

    return matchSearch && matchEstado && matchIpress && matchFecha;
  });

  /**
   * Badge de estado
   */
  const getEstadoBadge = (estado) => {
    const badges = {
      PENDIENTE: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" /> Pendiente
        </span>
      ),
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

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Procesadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.procesadas}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rechazadas}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-600 opacity-20" />
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

            {/* Estado */}
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
                <option value="PENDIENTE">Pendientes</option>
                <option value="PROCESADA">Procesadas</option>
                <option value="RECHAZADA">Rechazadas</option>
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
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ecgsFiltrados.map((ecg) => (
                    <tr
                      key={ecg.idImagen}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {ecg.numDocPaciente}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {ecg.nombresPaciente} {ecg.apellidosPaciente}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {ecg.nombreIpress || ecg.codigoIpress}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(ecg.fechaEnvio)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatSize(ecg.sizeBytes)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getEstadoBadge(ecg.estado)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          {/* Ver */}
                          <button
                            onClick={() => handleVer(ecg)}
                            title="Ver imagen"
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Descargar */}
                          <button
                            onClick={() =>
                              handleDescargar(ecg.idImagen, ecg.nombreArchivo)
                            }
                            title="Descargar imagen"
                            className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Procesar (si está pendiente) */}
                          {ecg.estado === "PENDIENTE" && (
                            <button
                              onClick={() => handleProcesar(ecg.idImagen)}
                              title="Procesar/Aceptar"
                              className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {/* Rechazar (si está pendiente) */}
                          {ecg.estado === "PENDIENTE" && (
                            <button
                              onClick={() => handleRechazar(ecg.idImagen)}
                              title="Rechazar"
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

      {/* 👁️ Modal Visor */}
      {showVisor && selectedECG && (
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
      )}
    </div>
  );
}
