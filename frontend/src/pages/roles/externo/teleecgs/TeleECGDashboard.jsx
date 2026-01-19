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
import UploadECGForm from "../../../../components/teleecgs/UploadECGForm";
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
    pendientes: 0,
    procesadas: 0,
    rechazadas: 0,
  });

  // Cargar ECGs al montarse el componente
  useEffect(() => {
    cargarECGs();
    cargarEstadisticas();
  }, []);

  const cargarECGs = async () => {
    try {
      setLoading(true);
      const response = await teleeckgService.listarImagenes();
      setEcgs(response.data?.content || []);
    } catch (error) {
      console.error("❌ Error al cargar ECGs:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await teleeckgService.obtenerEstadisticas();
      setStats(response.data || stats);
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
    if (!confirm("¿Estás seguro de que deseas eliminar esta imagen?")) return;

    try {
      await teleeckgService.rechazarImagen(idImagen, "Eliminado por usuario");
      setEcgs(ecgs.filter((e) => e.idImagen !== idImagen));
      cargarEstadisticas();
    } catch (error) {
      console.error("❌ Error al eliminar ECG:", error);
    }
  };

  const manejarDescargar = async (idImagen, nombreArchivo) => {
    try {
      await teleeckgService.descargarImagen(idImagen, nombreArchivo);
    } catch (error) {
      console.error("❌ Error al descargar ECG:", error);
    }
  };

  const abrirVisor = (ecg) => {
    setSelectedECG(ecg);
    setShowVisor(true);
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
                <p className="text-gray-600 text-sm font-medium">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendientes || ecgs.filter((e) => e.estado === "PENDIENTE").length}
                </p>
              </div>
              <Upload className="w-10 h-10 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Procesadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.procesadas || ecgs.filter((e) => e.estado === "PROCESADA").length}
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
                  {stats.rechazadas || ecgs.filter((e) => e.estado === "RECHAZADA").length}
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
            />
          )}
        </div>
      </div>

      {/* 📤 Modal Upload */}
      {showUploadModal && (
        <UploadECGForm
          onUpload={manejarUpload}
          onClose={() => setShowUploadModal(false)}
        />
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
