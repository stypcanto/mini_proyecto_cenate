import React, { useState, useEffect } from "react";
import { Upload, List, BarChart3, Wifi, WifiOff } from "lucide-react";
import toast from "react-hot-toast";
import { useOnlineStatus } from "../../../../hooks/useOnlineStatus";
import UploadImagenECG from "../../../../components/teleecgs/UploadImagenECG";
import UploadFormWrapper from "../../../../components/teleecgs/UploadFormWrapper";
import MisECGsRecientes from "../../../../components/teleecgs/MisECGsRecientes";
import VisorECGModal from "../../../../components/teleecgs/VisorECGModal";  // ✅ Nuevo
import RegistroPacientes from "./RegistroPacientes";
import TeleECGEstadisticas from "./TeleECGEstadisticas";
import teleecgService from "../../../../services/teleecgService";
import { getEstadoClasses } from "../../../../config/designSystem";

/**
 * Helper: Format ECGs for MisECGsRecientes component
 */
function formatECGsForRecientes(ecgs) {
  return ecgs.slice(0, 3).map((img) => ({
    nombrePaciente: img.nombrePaciente || "Sin datos",
    dni: img.dni || "N/A",
    tiempoTranscurrido: img.fechaCarga
      ? (() => {
          const ahora = new Date();
          const fecha = new Date(img.fechaCarga);
          const diferencia = ahora - fecha;
          const minutos = Math.floor(diferencia / 60000);
          const horas = Math.floor(minutos / 60);
          const dias = Math.floor(horas / 24);

          if (dias > 0) return `Hace ${dias}d`;
          if (horas > 0) return `Hace ${horas}h`;
          if (minutos > 0) return `Hace ${minutos}m`;
          return "Ahora";
        })()
      : "Desconocido",
    estado: img.estado || "DESCONOCIDA",
    observacion: img.observacion || null,
  }));
}

/**
 * 🏢 IPRESS Workspace - Contenedor principal para Upload + Listar
 *
 * Desktop (≥1200px):
 * ┌─────────────────────────────────────────────────────┐
 * │  Split View: Upload Panel (40%) | Table Panel (60%) │
 * │  - Upload form siempre visible a la izquierda       │
 * │  - Tabla con imágenes a la derecha                   │
 * │  - Sincronización en tiempo real (callbacks)         │
 * └─────────────────────────────────────────────────────┘
 *
 * Tablet (768px-1199px):
 * ┌─────────────────────────────────────────────────────┐
 * │  Stacked: Upload (full) / Tabla (full)              │
 * │  - Upload en sección superior                       │
 * │  - Tabla debajo con espacio completo                │
 * │  - Mejor que mobile, más simple que desktop         │
 * └─────────────────────────────────────────────────────┘
 *
 * Mobile (<768px):
 * ┌─────────────────────────────────────────────────────┐
 * │  Tabs: [Upload] [Mis EKGs] [Estadísticas]           │
 * │  - Auto-switch a "Mis EKGs" después de upload       │
 * │  - Una sección visible a la vez                      │
 * └─────────────────────────────────────────────────────┘
 */
export default function IPRESSWorkspace() {
  // =======================================
  // 📊 STATE MANAGEMENT
  // =======================================
  const isOnline = useOnlineStatus();
  const [ecgs, setEcgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    enviadas: 0,
    observadas: 0,
    atendidas: 0,
  });
  const [activeTab, setActiveTab] = useState("upload");
  const [deviceSize, setDeviceSize] = useState(() => {
    const width = window.innerWidth;
    if (width >= 1200) return "desktop";
    if (width >= 768) return "tablet";
    return "mobile";
  });

  // ✅ Nuevo: Estado para modal de visualización de imagen
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ Nuevo: Estado para expandir/contraer panel derecho
  const [expandedPanel, setExpandedPanel] = useState(false);

  // =======================================
  // 🔄 LIFECYCLE - Load data & handle resize
  // =======================================
  useEffect(() => {
    // Cargar imágenes al montar
    cargarEKGs();

    // Detectar cambios de tamaño de pantalla
    const handleResize = () => {
      const width = window.innerWidth;
      let newSize = "mobile";
      if (width >= 1200) newSize = "desktop";
      else if (width >= 768) newSize = "tablet";
      setDeviceSize(newSize);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      cargarEKGs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // =======================================
  // 📂 FUNCTIONS
  // =======================================

  /**
   * Cargar imágenes desde el servidor
   */
  const cargarEKGs = async () => {
    try {
      setLoading(true);
      const response = await teleecgService.listarImagenes();
      const imagenes = response?.content || [];

      setEcgs(imagenes);

      // Calcular estadísticas
      const newStats = {
        total: imagenes.length,
        enviadas: imagenes.filter((img) => img.estado === "ENVIADA").length,
        observadas: imagenes.filter((img) => img.estado === "OBSERVADA").length,
        atendidas: imagenes.filter((img) => img.estado === "ATENDIDA").length,
      };
      setStats(newStats);
    } catch (error) {
      console.error("❌ Error al cargar EKGs:", error);
      toast.error("Error al cargar las imágenes");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Callback cuando upload es exitoso
   * - Agrega nuevas imágenes a la tabla
   * - Muestra toast de éxito
   * - Auto-switch a "Mis EKGs" en mobile
   */
  const handleUploadSuccess = (nuevasImagenes) => {
    // Recargar lista completa para asegurar sincronización
    cargarEKGs();

    // En mobile, cambiar automáticamente a la pestaña de listado
    if (deviceSize === "mobile") {
      setTimeout(() => {
        setActiveTab("lista");
      }, 500);
    }

    // Toast feedback
    toast.success(`✅ ${nuevasImagenes?.length || 1} EKGs cargados exitosamente`);
  };

  /**
   * Callback para refrescar tabla manualmente
   */
  const handleRefresh = async () => {
    await cargarEKGs();
    toast.success("✅ Datos actualizados");
  };

  /**
   * ✅ Nuevo: Abrir modal con detalles de la imagen
   */
  const handleVerImagen = async (imagen) => {
    try {
      // ✅ Expandir panel derecho
      setExpandedPanel(true);

      // Obtener imagen en base64 si no la tiene
      if (!imagen.contenidoImagen && imagen.idImagen) {
        const respuesta = await teleecgService.descargarImagenBase64(imagen.idImagen);
        setSelectedImage({
          ...imagen,
          contenidoImagen: respuesta.contenidoImagen,
          tipoContenido: respuesta.tipoContenido,
        });
      } else {
        setSelectedImage(imagen);
      }
      setShowImageModal(true);
    } catch (error) {
      console.error("❌ Error al obtener imagen:", error);
      toast.error("Error al cargar la imagen");
    }
  };

  /**
   * Helper: Open full registry in new tab (ruta accesible para rol actual)
   */
  const handleVerRegistroCompleto = () => {
    window.open("/teleekgs/listar", "_blank", "noopener,noreferrer");
    toast.success("Abriendo registro completo de EKGs...");
  };

  // =======================================
  // 🎨 RENDER - Desktop Split View
  // =======================================
  if (deviceSize === "desktop") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header con indicador de conexión */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                📋 Gestión de Electrocardiogramas
              </h1>
              <p className="text-slate-600">
                Sube y gestiona tus imágenes ECG desde aquí
              </p>
            </div>

            {/* Indicador de Conexión */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 ${
              isOnline
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300 animate-pulse'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-900">Conectado</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-red-900">Sin conexión</span>
                    <span className="text-xs text-red-700">Se guardará localmente</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Split View Container - Responsivo a expandedPanel */}
          <div className={`grid gap-6 transition-all duration-300 ${
            expandedPanel ? 'grid-cols-1' : 'grid-cols-[40%_60%]'
          }`}>
            {/* Panel Izquierdo - Upload Form (mejorado con UploadFormWrapper) */}
            {!expandedPanel && (
              <div className="h-fit sticky top-6">
                <UploadFormWrapper
                  onUploadSuccess={handleUploadSuccess}
                  isWorkspace={true}
                />
              </div>
            )}

            {/* Panel Derecho - Mis EKGs Recientes - Expandible */}
            <div className="relative">
              {/* Botón para volver (visible solo cuando expandido) */}
              {expandedPanel && (
                <button
                  onClick={() => setExpandedPanel(false)}
                  className="absolute -top-12 left-0 text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 transition-colors"
                >
                  ← Volver a cargar
                </button>
              )}

              <MisECGsRecientes
                ultimas3={formatECGsForRecientes(ecgs)}
                estadisticas={{
                  exitosas: stats.enviadas,
                  evaluacion: stats.total,
                  observaciones: stats.observadas,
                }}
                onVerRegistro={handleVerRegistroCompleto}
                onRefrescar={handleRefresh}
                onVerImagen={handleVerImagen}  // ✅ Nuevo: Pasar callback
                loading={loading}
              />
            </div>
          </div>
        </div>

        {/* ✅ Modal de visualización de imagen */}
        {showImageModal && selectedImage && (
          <VisorECGModal
            isOpen={showImageModal}
            onClose={() => {
              setShowImageModal(false);
              setSelectedImage(null);
              // ✅ Contraer panel cuando se cierra el modal
              setExpandedPanel(false);
            }}
            imagen={selectedImage}
          />
        )}
      </div>
    );
  }

  // =======================================
  // 🎨 RENDER - Tablet Stacked View
  // =======================================
  if (deviceSize === "tablet") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full px-4 py-6">
          {/* Header con indicador de conexión */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                📋 Gestión de EKGs
              </h1>
              <p className="text-slate-600 text-sm">
                Sube y gestiona tus imágenes ECG
              </p>
            </div>

            {/* Indicador de Conexión - Tablet */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm transition-all duration-200 flex-shrink-0 ${
              isOnline
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300 animate-pulse'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-900 hidden sm:inline">Conectado</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <span className="font-semibold text-red-900 hidden sm:inline">Sin conexión</span>
                </>
              )}
            </div>
          </div>

          {/* Stacked Layout: Upload + Tabla */}
          <div className="space-y-6">
            {/* Section 1: Upload Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                📤 Cargar EKGs
              </h2>
              <UploadImagenECG
                onUploadSuccess={handleUploadSuccess}
                isWorkspace={true}
              />
            </div>

            {/* Section 2: Mis EKGs Subidos */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  📋 Mis EKGs Subidos
                </h2>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  🔄 Refrescar
                </button>
              </div>

              {/* Stats Cards - Compact Pill Format (Tablet) */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {/* Total */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full px-3 py-1.5 border border-blue-200 shadow-sm">
                  <div className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">
                    {stats.total}
                  </div>
                  <span className="text-xs font-semibold text-blue-900">Total</span>
                </div>

                {/* Enviadas */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-full px-3 py-1.5 border border-yellow-200 shadow-sm">
                  <div className="bg-yellow-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">
                    {stats.enviadas}
                  </div>
                  <span className="text-xs font-semibold text-yellow-900">Enviadas</span>
                </div>

                {/* Observadas */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-full px-3 py-1.5 border border-orange-200 shadow-sm">
                  <div className="bg-orange-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">
                    {stats.observadas}
                  </div>
                  <span className="text-xs font-semibold text-orange-900">Observadas</span>
                </div>

                {/* Atendidas */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 rounded-full px-3 py-1.5 border border-green-200 shadow-sm">
                  <div className="bg-green-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">
                    {stats.atendidas}
                  </div>
                  <span className="text-xs font-semibold text-green-900">Atendidas</span>
                </div>
              </div>

              {/* Tabla de imágenes */}
              <RegistroPacientes
                ecgs={ecgs}
                loading={loading}
                onRefresh={handleRefresh}
                isWorkspace={true}
              />
            </div>

            {/* Section 3: Estadísticas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                📊 Estadísticas
              </h2>
              <TeleECGEstadisticas />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =======================================
  // 🎨 RENDER - Mobile Tabs View
  // =======================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header con indicador de conexión */}
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              📋 Gestión de EKGs
            </h1>
            <p className="text-slate-600 text-sm">
              Sube y gestiona tus imágenes ECG
            </p>
          </div>

          {/* Indicador de Conexión - Mobile */}
          <div className={`flex items-center justify-center rounded-full p-2.5 border-2 transition-all duration-200 flex-shrink-0 ${
            isOnline
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300 animate-pulse'
          }`}>
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
          </div>
        </div>

        {/* Manual Tabs Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Headers - Optimizados para mobile */}
          <div className="flex border-b bg-slate-100 text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 px-3 sm:px-4 py-3 font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "upload"
                  ? "border-b-2 border-blue-600 bg-white text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Cargar EKGs</span>
              <span className="sm:hidden">Cargar</span>
            </button>
            <button
              onClick={() => setActiveTab("lista")}
              className={`flex-1 px-3 sm:px-4 py-3 font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "lista"
                  ? "border-b-2 border-blue-600 bg-white text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Mis EKGs</span>
              <span className="sm:hidden">EKGs</span>
              <span className="text-xs">({stats.total})</span>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 px-3 sm:px-4 py-3 font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "stats"
                  ? "border-b-2 border-blue-600 bg-white text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Estadísticas</span>
              <span className="sm:hidden">Stats</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {/* Tab: Upload */}
            {activeTab === "upload" && (
              <UploadImagenECG
                onUploadSuccess={handleUploadSuccess}
                isWorkspace={true}
              />
            )}

            {/* Tab: Mis EKGs */}
            {activeTab === "lista" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Mis EKGs Subidos
                  </h2>
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    🔄 Refrescar
                  </button>
                </div>

                {/* Stats Cards - Compact Pill Format (Mobile) */}
                <div className="flex gap-1.5 mb-4 flex-wrap">
                  {/* Total */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full px-2.5 py-1 border border-blue-200 shadow-sm">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                      {stats.total}
                    </div>
                    <span className="text-xs font-semibold text-blue-900">Total</span>
                  </div>

                  {/* Enviadas */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-full px-2.5 py-1 border border-yellow-200 shadow-sm">
                    <div className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                      {stats.enviadas}
                    </div>
                    <span className="text-xs font-semibold text-yellow-900">Env</span>
                  </div>

                  {/* Observadas */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-full px-2.5 py-1 border border-orange-200 shadow-sm">
                    <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                      {stats.observadas}
                    </div>
                    <span className="text-xs font-semibold text-orange-900">Obs</span>
                  </div>

                  {/* Atendidas */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-green-100 rounded-full px-2.5 py-1 border border-green-200 shadow-sm">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                      {stats.atendidas}
                    </div>
                    <span className="text-xs font-semibold text-green-900">Ate</span>
                  </div>
                </div>

                <RegistroPacientes
                  ecgs={ecgs}
                  loading={loading}
                  onRefresh={handleRefresh}
                  isWorkspace={true}
                />
              </>
            )}

            {/* Tab: Estadísticas */}
            {activeTab === "stats" && (
              <TeleECGEstadisticas />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
