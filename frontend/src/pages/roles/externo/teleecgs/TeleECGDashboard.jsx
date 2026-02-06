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
import UploadImagenECG from "../../../../components/teleecgs/UploadImagenECG";
import ListaECGsPacientes from "../../../../components/teleecgs/ListaECGsPacientes";
import VisorECGModal from "../../../../components/teleecgs/VisorECGModal";
import TeleEKGBreadcrumb from "../../../../components/teleecgs/TeleEKGBreadcrumb";

/**
 * 🫀 TeleEKGDashboard - Página principal de envío de electrocardiogramas
 * IPRESS externas pueden subir y gestionar imágenes de EKG
 */
export default function TeleEKGDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ecgs, setEcgs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedEKG, setSelectedEKG] = useState(null);
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

  // Cargar EKGs al montarse el componente
  useEffect(() => {
    cargarEKGs();
    cargarEstadisticas();
  }, []);

  const cargarEKGs = async () => {
    try {
      setLoading(true);
      const response = await teleeckgService.listarImagenes();
      // El servicio retorna directamente los datos (puede ser Page o array)
      const ecgData = response?.content || response?.data || response || [];
      setEcgs(Array.isArray(ecgData) ? ecgData : []);
      console.log("✅ EKGs cargados:", ecgData);
    } catch (error) {
      console.error("❌ Error al cargar EKGs:", error);
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

  const manejarUpload = async (nuevoEKG) => {
    setEcgs([nuevoEKG, ...ecgs]);
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
      console.error("❌ Error al eliminar EKG:", error);
      alert("Error al eliminar la imagen. Intenta nuevamente.");
    }
  };

  const manejarDescargar = async (idImagen, nombreArchivo) => {
    try {
      await teleeckgService.descargarImagen(idImagen, nombreArchivo);
    } catch (error) {
      console.error("❌ Error al descargar EKG:", error);
    }
  };

  // Procesar/Aceptar EKG
  const manejarProcesar = async (idImagen) => {
    const observaciones = prompt("Ingresa observaciones (opcional):");
    if (observaciones === null) return;

    try {
      setAccionando(true);
      setImagenEnAccion(idImagen);
      await teleeckgService.procesarImagen(idImagen, observaciones);
      console.log("✅ EKG procesada correctamente");
      await cargarEKGs();
      await cargarEstadisticas();
    } catch (error) {
      console.error("❌ Error al procesar EKG:", error);
      alert("Error al procesar la imagen. Intenta nuevamente.");
    } finally {
      setAccionando(false);
      setImagenEnAccion(null);
    }
  };

  // Rechazar EKG
  const manejarRechazar = async (idImagen) => {
    const motivo = prompt("Ingresa el motivo del rechazo:");
    if (motivo === null || !motivo.trim()) return;

    try {
      setAccionando(true);
      setImagenEnAccion(idImagen);
      await teleeckgService.rechazarImagen(idImagen, motivo);
      console.log("✅ EKG rechazada correctamente");
      await cargarEKGs();
      await cargarEstadisticas();
    } catch (error) {
      console.error("❌ Error al rechazar EKG:", error);
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
      // Combinar datos del EKG con la imagen cargada
      const ecgConImagen = {
        ...ecg,
        contenidoImagen: imagenData.contenidoImagen,
        tipoContenido: imagenData.tipoContenido,
      };
      setSelectedEKG(ecgConImagen);
      setShowVisor(true);
    } catch (error) {
      console.error("❌ Error al cargar imagen:", error);
      alert("No se pudo cargar la imagen. Intenta nuevamente.");
    }
  };

  // Agrupar imágenes por paciente (numDocPaciente)
  const agruparImagenesPorPaciente = (imagenesLista) => {
    const agrupadas = {};

    imagenesLista.forEach(imagen => {
      const key = imagen.numDocPaciente;
      if (!agrupadas[key]) {
        agrupadas[key] = {
          numDocPaciente: imagen.numDocPaciente,
          nombresPaciente: imagen.nombresPaciente,
          apellidosPaciente: imagen.apellidosPaciente,
          telefonoPrincipalPaciente: imagen.telefonoPrincipalPaciente,
          edadPaciente: imagen.edadPaciente,
          generoPaciente: imagen.generoPaciente,
          imagenes: [],
          estado: imagen.estadoTransformado || imagen.estado,
          fechaPrimera: imagen.fechaEnvio,
        };
      }
      agrupadas[key].imagenes.push(imagen);
    });

    return Object.values(agrupadas);
  };

  // Obtener pacientes agrupados
  const pacientesAgrupados = agruparImagenesPorPaciente(ecgs);

  // Filtrar pacientes agrupados por búsqueda
  const pacientesFiltrados = pacientesAgrupados.filter((paciente) =>
    paciente.numDocPaciente?.includes(searchTerm) ||
    paciente.nombresPaciente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar EKGs por búsqueda (para compatibilidad con componente ListaEKGsPacientes)
  const ecgsFiltrados = ecgs.filter((ecg) =>
    ecg.numDocPaciente?.includes(searchTerm) ||
    ecg.nombresPaciente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="w-full">
        {/* 🎯 Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Envío de Electrocardiogramas (EKG)
            </h1>
          </div>
          <p className="text-gray-600 ml-11">
            Carga y gestiona imágenes de electrocardiogramas de tus pacientes
          </p>
        </div>

        {/* ✅ Breadcrumb de navegación */}
        <TeleEKGBreadcrumb />

        {/* 📊 Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total || pacientesAgrupados.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">{ecgs.length} EKGs</p>
              </div>
              <ImageIcon className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Enviadas</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.enviadas || pacientesAgrupados.filter((p) => p.estado === "ENVIADA").length}
                </p>
                <p className="text-xs text-gray-500 mt-1">{ecgs.filter((e) => e.estadoTransformado === "ENVIADA" || e.estado === "ENVIADA").length} EKGs</p>
              </div>
              <Upload className="w-10 h-10 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Atendidas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.atendidas || pacientesAgrupados.filter((p) => p.estado === "ATENDIDA").length}
                </p>
                <p className="text-xs text-gray-500 mt-1">{ecgs.filter((e) => e.estadoTransformado === "ATENDIDA" || e.estado === "ATENDIDA").length} EKGs</p>
              </div>
              <Eye className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rechazadas || pacientesAgrupados.filter((p) => p.estado === "RECHAZADA").length}
                </p>
                <p className="text-xs text-gray-500 mt-1">{ecgs.filter((e) => e.estadoTransformado === "RECHAZADA" || e.estado === "RECHAZADA").length} EKGs</p>
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
              <span>Subir EKG</span>
            </button>
          </div>
        </div>

        {/* 📋 Lista de EKGs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando EKGs...</p>
            </div>
          ) : ecgsFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {searchTerm ? "No se encontraron EKGs" : "No hay EKGs aún. ¡Sube uno ahora!"}
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
              onRefresh={cargarEKGs}
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
                cargarEKGs();
              }} />
            </div>
          </div>
        </div>
      )}

      {/* 👁️ Modal Visor */}
      {showVisor && (
        <VisorECGModal
          ecg={selectedEKG}
          onClose={() => {
            setShowVisor(false);
            setSelectedEKG(null);
          }}
          onDescargar={() => manejarDescargar(selectedEKG.idImagen, selectedEKG.nombreArchivo)}
        />
      )}
    </div>
  );
}
