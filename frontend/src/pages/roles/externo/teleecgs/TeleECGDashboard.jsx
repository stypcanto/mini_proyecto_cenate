import React, { useState, useEffect } from "react";
import {
  Activity,
  Upload,
  Image as ImageIcon,
  Trash2,
  Download,
  Eye,
  Search,
  Plus,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import teleeckgService from "../../../../services/teleecgService";
import UploadImagenECG from "../../../../components/teleekgs/UploadImagenECG";
import ListaECGsPacientes from "../../../../components/teleecgs/ListaECGsPacientes";
import VisorECGModal from "../../../../components/teleecgs/VisorECGModal";

/**
 * 🫀 TeleECGDashboard - Página principal de envío de electrocardiogramas
 * IPRESS externas pueden subir y gestionar imágenes de ECG
 */
export default function TeleECGDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ecgs, setEcgs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedECG, setSelectedECG] = useState(null);
  const [showVisor, setShowVisor] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    enviadas: 0,
    atendidas: 0,
    rechazadas: 0,
  });

  // Estados para acciones CRUD (Procesar, Rechazar)
  const [accionando, setAccionando] = useState(false);
  const [imagenEnAccion, setImagenEnAccion] = useState(null);

  // Cargar ECGs al montarse el componente
  useEffect(() => {
    cargarECGs();
    cargarEstadisticas();
  }, []);

  const cargarECGs = async () => {
    try {
      setLoading(true);
      const response = await teleeckgService.listarImagenes();
      // El servicio retorna directamente los datos (puede ser Page o array)
      const ecgData = response?.content || response?.data || response || [];
      setEcgs(Array.isArray(ecgData) ? ecgData : []);
      console.log("✅ ECGs cargados:", ecgData);
    } catch (error) {
      console.error("❌ Error al cargar ECGs:", error);
      setEcgs([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await teleeckgService.obtenerEstadisticas();
      // El servicio retorna directamente los datos
      const statsData = response || {};
      // v3.0.0: Para usuarios externos (IPRESS/PADOMI), contar estados transformados
      // API debería retornar: totalEnviadas, totalAtendidas, totalRechazadas
      // Fallback: contar localmente si API no retorna los datos
      setStats({
        total: statsData.totalImagenesCargadas || statsData.total || 0,
        enviadas: statsData.totalEnviadas || statsData.totalImagenesPendientes || 0,
        atendidas: statsData.totalAtendidas || statsData.totalImagenesProcesadas || 0,
        rechazadas: statsData.totalRechazadas || statsData.totalImagenesRechazadas || 0,
      });
      console.log("✅ Estadísticas cargadas (v3.0.0):", statsData);
    } catch (error) {
      console.error("❌ Error al cargar estadísticas:", error);
    }
  };

  const manejarUpload = async (nuevoECG) => {
    setEcgs([nuevoECG, ...ecgs]);
    setShowUploadModal(false);
    cargarEstadisticas();
  };

  const manejarEliminar = async (idImagen) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.")) return;

    try {
      await teleeckgService.eliminarImagen(idImagen);
      setEcgs(ecgs.filter((e) => e.idImagen !== idImagen));
      await cargarEstadisticas();
      console.log("✅ Imagen eliminada y estadísticas actualizadas");
    } catch (error) {
      console.error("❌ Error al eliminar ECG:", error);
      alert("Error al eliminar la imagen. Intenta nuevamente.");
    }
  };

  const manejarDescargar = async (idImagen, nombreArchivo) => {
    try {
      await teleeckgService.descargarImagen(idImagen, nombreArchivo);
    } catch (error) {
      console.error("❌ Error al descargar ECG:", error);
    }
  };

  // Procesar/Aceptar ECG
  const manejarProcesar = async (idImagen) => {
    const observaciones = prompt("Ingresa observaciones (opcional):");
    if (observaciones === null) return;

    try {
      setAccionando(true);
      setImagenEnAccion(idImagen);
      await teleeckgService.procesarImagen(idImagen, observaciones);
      console.log("✅ ECG procesada correctamente");
      await cargarECGs();
      await cargarEstadisticas();
    } catch (error) {
      console.error("❌ Error al procesar ECG:", error);
      alert("Error al procesar la imagen. Intenta nuevamente.");
    } finally {
      setAccionando(false);
      setImagenEnAccion(null);
    }
  };

  // Rechazar ECG
  const manejarRechazar = async (idImagen) => {
    const motivo = prompt("Ingresa el motivo del rechazo:");
    if (motivo === null || !motivo.trim()) return;

    try {
      setAccionando(true);
      setImagenEnAccion(idImagen);
      await teleeckgService.rechazarImagen(idImagen, motivo);
      console.log("✅ ECG rechazada correctamente");
      await cargarECGs();
      await cargarEstadisticas();
    } catch (error) {
      console.error("❌ Error al rechazar ECG:", error);
      alert("Error al rechazar la imagen. Intenta nuevamente.");
    } finally {
      setAccionando(false);
      setImagenEnAccion(null);
    }
  };

  const abrirVisor = async (ecg) => {
    try {
      // Cargar la imagen en base64
      const imagenData = await teleeckgService.verPreview(ecg.idImagen);
      // Combinar datos del ECG con la imagen cargada
      const ecgConImagen = {
        ...ecg,
        contenidoImagen: imagenData.contenidoImagen,
        tipoContenido: imagenData.tipoContenido,
      };
      setSelectedECG(ecgConImagen);
      setShowVisor(true);
    } catch (error) {
      console.error("❌ Error al cargar imagen:", error);
      alert("No se pudo cargar la imagen. Intenta nuevamente.");
    }
  };

  // Filtrar ECGs por búsqueda
  const ecgsFiltrados = ecgs.filter((ecg) =>
    ecg.numDocPaciente?.includes(searchTerm) ||
    ecg.nombresPaciente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 🎯 Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Envío de Electrocardiogramas (ECG)
            </h1>
          </div>
          <p className="text-gray-600 ml-11">
            Carga y gestiona imágenes de electrocardiogramas de tus pacientes
          </p>
        </div>

        {/* 📊 Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total || ecgs.length}
                </p>
              </div>
              <ImageIcon className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Enviadas</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.enviadas || ecgs.filter((e) => e.estadoTransformado === "ENVIADA" || e.estado === "ENVIADA").length}
                </p>
              </div>
              <Upload className="w-10 h-10 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Atendidas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.atendidas || ecgs.filter((e) => e.estadoTransformado === "ATENDIDA" || e.estado === "ATENDIDA").length}
                </p>
              </div>
              <Eye className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rechazadas || ecgs.filter((e) => e.estadoTransformado === "RECHAZADA" || e.estado === "RECHAZADA").length}
                </p>
              </div>
              <Trash2 className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* 🎨 Sección de Acciones */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Buscador */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por DNI o nombre del paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Botón Subir */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Subir ECG</span>
            </button>
          </div>
        </div>

        {/* 📋 Lista de ECGs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando ECGs...</p>
            </div>
          ) : ecgsFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {searchTerm ? "No se encontraron ECGs" : "No hay ECGs aún. ¡Sube uno ahora!"}
              </p>
            </div>
          ) : (
            <ListaECGsPacientes
              ecgs={ecgsFiltrados}
              onVer={abrirVisor}
              onDescargar={manejarDescargar}
              onEliminar={manejarEliminar}
              onProcesar={manejarProcesar}
              onRechazar={manejarRechazar}
              accionando={accionando}
              imagenEnAccion={imagenEnAccion}
              onRefresh={cargarECGs}
            />
          )}
        </div>
      </div>

      {/* 📤 Modal Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-lg"
            >
              <Plus className="w-5 h-5 rotate-45 text-gray-600" />
            </button>

            {/* Componente de upload */}
            <div className="overflow-y-auto flex-1">
              <UploadImagenECG onSuccess={() => {
                setShowUploadModal(false);
                cargarECGs();
              }} />
            </div>
          </div>
        </div>
      )}

      {/* 👁️ Modal Visor */}
      {showVisor && (
        <VisorECGModal
          ecg={selectedECG}
          onClose={() => {
            setShowVisor(false);
            setSelectedECG(null);
          }}
          onDescargar={() => manejarDescargar(selectedECG.idImagen, selectedECG.nombreArchivo)}
        />
      )}
    </div>
  );
}
