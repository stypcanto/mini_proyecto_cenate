import React, { useState, useEffect } from "react";
import { Upload, List, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import UploadImagenECG from "../../../../components/teleecgs/UploadImagenECG";
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
 * Tablet & Mobile (<1200px):
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);

  // =======================================
  // 🔄 LIFECYCLE - Load data & handle resize
  // =======================================
  useEffect(() => {
    // Cargar imágenes al montar
    cargarEKGs();

    // Detectar cambios de tamaño de pantalla
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1200);
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
   * - Auto-switch a "Mis EKGs" en mobile/tablet
   */
  const handleUploadSuccess = (nuevasImagenes) => {
    // Recargar lista completa para asegurar sincronización
    cargarEKGs();

    // En mobile/tablet, cambiar automáticamente a la pestaña de listado
    if (isMobile) {
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
  if (!isMobile) {
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
            {/* Panel Izquierdo - Upload Form */}
            <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                📤 Cargar EKGs
              </h2>
              <UploadImagenECG
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
  // 🎨 RENDER - Mobile/Tablet Tabs View
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
          {/* Tab Headers */}
          <div className="flex border-b bg-slate-100">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "upload"
                  ? "border-b-2 border-blue-600 bg-white text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Upload className="w-4 h-4" />
              Cargar EKGs
            </button>
            <button
              onClick={() => setActiveTab("lista")}
              className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "lista"
                  ? "border-b-2 border-blue-600 bg-white text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-4 h-4" />
              Mis EKGs ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "stats"
                  ? "border-b-2 border-blue-600 bg-white text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Estadísticas
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
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
