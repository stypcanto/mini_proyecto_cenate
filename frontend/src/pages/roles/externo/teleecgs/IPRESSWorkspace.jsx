import React, { useState, useEffect } from "react";
import { Upload, List, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import UploadImagenECG from "../../../../components/teleecgs/UploadImagenECG";
import UploadFormWrapper from "../../../../components/teleecgs/UploadFormWrapper";
import RegistroPacientes from "./RegistroPacientes";
import TeleECGEstadisticas from "./TeleECGEstadisticas";
import TeleEKGBreadcrumb from "../../../../components/teleecgs/TeleEKGBreadcrumb";
import teleecgService from "../../../../services/teleecgService";

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

  // =======================================
  // 🎨 RENDER - Desktop Split View
  // =======================================
  if (deviceSize === "desktop") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              📋 Gestión de Electrocardiogramas
            </h1>
            <p className="text-slate-600">
              Sube y gestiona tus imágenes ECG desde aquí
            </p>
          </div>

          {/* Breadcrumb */}
          <TeleEKGBreadcrumb />

          {/* Split View Container */}
          <div className="grid grid-cols-[40%_60%] gap-6">
            {/* Panel Izquierdo - Upload Form (mejorado con UploadFormWrapper) */}
            <div className="h-fit sticky top-6">
              <UploadFormWrapper
                onUploadSuccess={handleUploadSuccess}
                isWorkspace={true}
              />
            </div>

            {/* Panel Derecho - Tabla de Imágenes */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  📋 Mis EKGs Subidos
                </h2>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  🔄 Refrescar
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                  <p className="text-xs text-yellow-600 font-semibold">
                    Enviadas
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats.enviadas}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                  <p className="text-xs text-orange-600 font-semibold">
                    Observadas
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {stats.observadas}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-600 font-semibold">
                    Atendidas
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.atendidas}
                  </p>
                </div>
              </div>

              {/* Registro de Pacientes Component */}
              <RegistroPacientes
                ecgs={ecgs}
                loading={loading}
                onRefresh={handleRefresh}
                isWorkspace={true}
              />
            </div>
          </div>
        </div>
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
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              📋 Gestión de EKGs
            </h1>
            <p className="text-slate-600 text-sm">
              Sube y gestiona tus imágenes ECG
            </p>
          </div>

          {/* Breadcrumb */}
          <TeleEKGBreadcrumb />

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

              {/* Stats Cards - 2 columns en tablet */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                  <p className="text-xs text-yellow-600 font-semibold">
                    Enviadas
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats.enviadas}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                  <p className="text-xs text-orange-600 font-semibold">
                    Observadas
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {stats.observadas}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-600 font-semibold">
                    Atendidas
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.atendidas}
                  </p>
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            📋 Gestión de EKGs
          </h1>
          <p className="text-slate-600 text-sm">
            Sube y gestiona tus imágenes ECG
          </p>
        </div>

        {/* Breadcrumb */}
        <TeleEKGBreadcrumb />

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

                {/* Stats Cards - Mini */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold">Total</p>
                    <p className="text-lg font-bold text-blue-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                    <p className="text-xs text-yellow-600 font-semibold">
                      Enviadas
                    </p>
                    <p className="text-lg font-bold text-yellow-900">
                      {stats.enviadas}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                    <p className="text-xs text-orange-600 font-semibold">
                      Observadas
                    </p>
                    <p className="text-lg font-bold text-orange-900">
                      {stats.observadas}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                    <p className="text-xs text-green-600 font-semibold">
                      Atendidas
                    </p>
                    <p className="text-lg font-bold text-green-900">
                      {stats.atendidas}
                    </p>
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
