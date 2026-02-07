import React, { useState, useEffect } from "react";
import { Upload, List, BarChart3, Wifi, WifiOff, CloudUpload, X } from "lucide-react";
import toast from "react-hot-toast";
import { useOnlineStatus } from "../../../../hooks/useOnlineStatus";
import UploadImagenECG from "../../../../components/teleecgs/UploadImagenECG";
import UploadFormWrapper from "../../../../components/teleecgs/UploadFormWrapper";
import MisECGsRecientes from "../../../../components/teleecgs/MisECGsRecientes";
import VisorEKGModal from "../../../../components/teleecgs/VisorECGModal";
import RegistroPacientes from "./RegistroPacientes";
import TeleECGEstadisticas from "./TeleECGEstadisticas";
import teleecgService from "../../../../services/teleecgService";
import gestionPacientesService from "../../../../services/gestionPacientesService";
import { getEstadoClasses } from "../../../../config/designSystem";

/**
 * Helper: Format ECGs for MisECGsRecientes component
 * Agrupa por paciente y cuenta imágenes
 * Enriquece nombres con formato "APELLIDOS, NOMBRES"
 */
function formatECGsForRecientes(ecgs, pacientesCache = {}) {
  // Agrupar por DNI para contar imágenes
  const porDni = {};
  ecgs.forEach(img => {
    const dni = img.numDocPaciente || img.dni;
    if (dni) {
      if (!porDni[dni]) {
        porDni[dni] = [];
      }
      porDni[dni].push(img);
    }
  });

  // Deduplicar por DNI para mostrar datos del primer paciente
  const deduplicados = {};
  ecgs.forEach(img => {
    const dni = img.numDocPaciente || img.dni;
    if (dni && !deduplicados[dni]) {
      deduplicados[dni] = img;
    }
  });

  return Object.entries(deduplicados).slice(0, 3).map(([dni, img]) => {
    // ✅ Obtener nombre completo del cache o del ECG
    let nombreFormateado = img.nombresPaciente || img.nombrePaciente || img.nombres || "Sin datos";

    // Si existe en cache, usar el nombre formateado completo
    if (pacientesCache[dni]) {
      const cached = pacientesCache[dni];
      if (cached.apellidos && cached.nombres) {
        nombreFormateado = `${cached.apellidos.toUpperCase()}, ${cached.nombres.toUpperCase()}`;
      }
    }

    return {
      idImagen: img.idImagen || img.id,  // ✅ NECESARIO para cargar imagen
      nombrePaciente: nombreFormateado,
      dni: dni || "N/A",
      cantidadImagenes: porDni[dni]?.length || 0,  // ✅ Contar imágenes del paciente
      tiempoTranscurrido: img.fechaEnvio || img.fechaCarga
        ? (() => {
            const ahora = new Date();
            const fecha = new Date(img.fechaEnvio || img.fechaCarga);
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
      estado: img.estadoTransformado || img.estado || "DESCONOCIDA",
      observacion: img.observacion || null,
      contenidoImagen: img.contenidoImagen || null,  // ✅ Para imágenes precargadas
      nombreArchivo: img.nombreArchivo || null,
      mimeType: img.mimeType || "image/jpeg",
    };
  });
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
  const [pacientesCache, setPacientesCache] = useState({});  // ✅ Cache de nombres de pacientes
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

  // ✅ Modal de visualización de imagen
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ Modal de carga de imágenes
  const [showUploadModal, setShowUploadModal] = useState(false);

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

      // Calcular estadísticas basadas en pacientes únicos, no en total de imágenes
      const pacientesUnicos = new Set(imagenes.map((img) => img.dni));
      const pacientesPendientes = new Set(
        imagenes
          .filter((img) => img.estado === "ENVIADA")
          .map((img) => img.dni)
      );
      const pacientesObservadas = new Set(
        imagenes
          .filter((img) => img.estado === "OBSERVADA")
          .map((img) => img.dni)
      );
      const pacientesAtendidas = new Set(
        imagenes
          .filter((img) => img.estado === "ATENDIDA")
          .map((img) => img.dni)
      );

      const newStats = {
        // Para MisECGsRecientes - Pacientes únicos por estado
        total: pacientesPendientes.size + pacientesObservadas.size + pacientesAtendidas.size,  // Total = Pendiente + Observada + Atendida
        cargadas: pacientesUnicos.size,        // Pacientes con imágenes cargadas
        enEvaluacion: pacientesPendientes.size,  // Pacientes PENDIENTES
        observadas: pacientesObservadas.size,  // Pacientes con observaciones
        atendidas: pacientesAtendidas.size,    // Pacientes atendidas
        // Para tablet/mobile stats - Por compatibilidad
        enviadas: pacientesPendientes.size,  // Pacientes con imágenes en ENVIADA
      };

      // 🔍 Debug logging
      console.log("📊 DEBUG STATS:", {
        totalImagenes: imagenes.length,
        pacientesUnicos: Array.from(pacientesUnicos),
        pacientesUnicosCount: pacientesUnicos.size,
        pacientesPendientes: Array.from(pacientesPendientes),
        pacientesPendientesCount: pacientesPendientes.size,
        pacientesObservadas: Array.from(pacientesObservadas),
        pacientesObservadasCount: pacientesObservadas.size,
        pacientesAtendidas: Array.from(pacientesAtendidas),
        pacientesAtendidasCount: pacientesAtendidas.size,
        newStats
      });

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
   * ✅ Abre modal con TODAS las imágenes del paciente
   * Detecta si es un DNI (click en card) o una imagen individual
   */
  const handleVerImagen = async (param) => {
    try {
      // Detectar si es un DNI (del click en card) o una imagen individual
      const isDni = param.dni && !param.idImagen;

      if (isDni) {
        // 🎯 NUEVO: Click en card del paciente - Cargar TODAS sus imágenes
        const imagenesPaciente = ecgs.filter(
          (img) => (img.numDocPaciente || img.dni) === param.dni
        );

        if (imagenesPaciente.length === 0) {
          toast.error("No se encontraron imágenes para este paciente");
          return;
        }

        // Cargar todas las imágenes en base64
        const imagenesConBase64 = await Promise.all(
          imagenesPaciente.map(async (img) => {
            if (img.contenidoImagen) {
              return img;
            }
            try {
              const respuesta = await teleecgService.descargarImagenBase64(
                img.idImagen || img.id
              );
              return {
                ...img,
                contenidoImagen: respuesta.contenidoImagen,
                tipoContenido: respuesta.tipoContenido,
              };
            } catch {
              return img; // Si falla, devolver sin base64
            }
          })
        );

        // Abrir modal con TODAS las imágenes del paciente
        setSelectedImage({
          ...param,
          imagenes: imagenesConBase64,
          esCarousel: true,
        });
        setShowImageModal(true);
      } else {
        // 📌 ANTIGUO: Carga individual de imagen (backward compatibility)
        if (!param.contenidoImagen && param.idImagen) {
          const respuesta = await teleecgService.descargarImagenBase64(param.idImagen);
          setSelectedImage({
            ...param,
            contenidoImagen: respuesta.contenidoImagen,
            tipoContenido: respuesta.tipoContenido,
            esCarousel: false,
          });
        } else {
          setSelectedImage({ ...param, esCarousel: false });
        }
        setShowImageModal(true);
      }
    } catch (error) {
      console.error("❌ Error al obtener imágenes:", error);
      toast.error("Error al cargar las imágenes");
    }
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

            {/* Acciones Derecha - Botón Cargar + Indicador de Conexión */}
            <div className="flex items-center gap-3">
              {/* Botón Cargar Imágenes */}
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
              >
                <CloudUpload className="w-5 h-5" />
                Cargar
              </button>

              {/* Indicador de Conexión - Punto Pulsante */}
              <div
                className={`w-3 h-3 rounded-full animate-pulse transition-all duration-200 ${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={isOnline ? "Conectado" : "Sin conexión - Se guardará localmente"}
              />
            </div>
          </div>

          {/* Dashboard Full-Width */}
          <div className="w-full">
            <MisECGsRecientes
              ultimas3={formatECGsForRecientes(ecgs)}
              estadisticas={{
                total: stats.cargadas + stats.enEvaluacion + stats.observadas + (stats.atendidas || 0),
                cargadas: stats.cargadas,
                enEvaluacion: stats.enEvaluacion,
                observadas: stats.observadas,
                atendidas: stats.atendidas || 0,
              }}
              onRefrescar={handleRefresh}
              onVerImagen={handleVerImagen}
              loading={loading}
            />

          </div>
        </div>

        {/* Modal de visualización de imagen */}
        {showImageModal && selectedImage && (
          <VisorEKGModal
            onClose={() => {
              setShowImageModal(false);
              setSelectedImage(null);
            }}
            ecg={selectedImage}
          />
        )}

        {/* Modal de carga de imágenes */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col">
              {/* Botón cerrar - Círculo celeste */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg z-10 hover:scale-110"
                title="Cerrar modal"
              >
                <X className="w-5 h-5 text-blue-600" />
              </button>

              {/* Contenido del modal - sin padding superior para header ajustado */}
              <UploadFormWrapper
                onUploadSuccess={(nuevasImagenes) => {
                  handleUploadSuccess(nuevasImagenes);
                  setShowUploadModal(false);
                }}
                isWorkspace={true}
              />
            </div>
          </div>
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

            {/* Indicador de Conexión - Punto Pulsante */}
            <div
              className={`w-2.5 h-2.5 rounded-full animate-pulse transition-all duration-200 flex-shrink-0 ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isOnline ? "Conectado" : "Sin conexión - Se guardará localmente"}
            />
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

          {/* Indicador de Conexión - Punto Pulsante */}
          <div
            className={`w-3 h-3 rounded-full animate-pulse transition-all duration-200 flex-shrink-0 ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={isOnline ? "Conectado" : "Sin conexión - Se guardará localmente"}
          />
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
