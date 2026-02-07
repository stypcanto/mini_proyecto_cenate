import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Users,
  Search,
  Eye,
  Download,
  Filter,
  Calendar,
  ExternalLink,
  RefreshCw,
  X,
  List,
} from "lucide-react";
import toast from "react-hot-toast";
import teleeckgService from "../../../../services/teleecgService";
import VisorECGModal from "../../../../components/teleecgs/VisorECGModal";
import TeleEKGBreadcrumb from "../../../../components/teleecgs/TeleEKGBreadcrumb";
import { getEstadoClasses } from "../../../../config/designSystem";

/**
 * 👥 Registro de Pacientes con EKGs
 *
 * Puede usarse de dos formas:
 * 1. Standalone (/teleekgs/listar) - Carga datos del servidor
 * 2. En IPRESSWorkspace - Recibe datos como props desde parent
 */
export default function RegistroPacientes({
  ecgs: propsEcgs,
  loading: propsLoading,
  onRefresh,
  isWorkspace
} = {}) {
  const location = useLocation();

  // State - Solo se usa si NOT en workspace mode
  const [ecgs, setEcgs] = useState(propsEcgs || []);
  const [filteredEcgs, setFilteredEcgs] = useState([]);
  const [loading, setLoading] = useState(propsLoading !== undefined ? propsLoading : true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("TODOS");
  const [selectedEKG, setSelectedEKG] = useState(null);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [showVisor, setShowVisor] = useState(false);

  // Si es workspace, usar props; si no, usar state local
  const currentEcgs = isWorkspace ? propsEcgs : ecgs;
  const currentLoading = isWorkspace ? propsLoading : loading;

  // ✅ Detectar redirección desde upload (solo en modo standalone)
  useEffect(() => {
    if (!isWorkspace && location.state?.mensaje) {
      toast.success(location.state.mensaje);

      // Filtrar por DNI si viene del upload
      if (location.state.numDoc) {
        setSearchTerm(location.state.numDoc);
      }

      // Limpiar state para no mostrar mensaje en refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isWorkspace]);

  // ✅ Solo cargar datos si NO estamos en workspace mode
  useEffect(() => {
    if (!isWorkspace) {
      cargarEKGs();
    }
  }, [isWorkspace]);

  useEffect(() => {
    filtrar();
  }, [searchTerm, filterEstado, currentEcgs]);

  // ✅ Actualizar estado local cuando props cambian (en caso standalone)
  useEffect(() => {
    if (!isWorkspace && propsEcgs) {
      setEcgs(propsEcgs);
    }
  }, [propsEcgs, isWorkspace]);

  const cargarEKGs = async () => {
    try {
      setLoading(true);
      const response = await teleeckgService.listarImagenes();
      setEcgs(response?.content || []);
    } catch (error) {
      console.error("❌ Error al cargar EKGs:", error);
      toast.error("Error al cargar las imágenes");
    } finally {
      setLoading(false);
    }
  };

  const filtrar = () => {
    // Primero agrupar por paciente
    let pacientesAgrupados = agruparImagenesPorPaciente(currentEcgs);
    let resultado = [...pacientesAgrupados];

    // Filtrar por búsqueda
    if (searchTerm) {
      resultado = resultado.filter(
        (paciente) =>
          paciente.numDocPaciente?.includes(searchTerm) ||
          paciente.nombresPaciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          paciente.apellidosPaciente?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterEstado !== "TODOS") {
      resultado = resultado.filter((paciente) => paciente.estado === filterEstado);
    }

    setFilteredEcgs(resultado);
  };

  /**
   * ✅ v1.52.1: Semáforo de estados mejorado con iconos
   * Visualización clara del estado de cada EKG
   */
  const getEstadoBadge = (estado) => {
    const estados = {
      ENVIADA: {
        badge: "bg-yellow-100 text-yellow-800 border border-yellow-300",
        emoji: "📤",
        label: "Enviada",
        description: "En espera de evaluación"
      },
      PENDIENTE: {
        badge: "bg-blue-100 text-blue-800 border border-blue-300",
        emoji: "⏳",
        label: "Pendiente",
        description: "No evaluada aún"
      },
      OBSERVADA: {
        badge: "bg-orange-100 text-orange-800 border border-orange-300",
        emoji: "👁️",
        label: "Observada",
        description: "Con observaciones"
      },
      ATENDIDA: {
        badge: "bg-green-100 text-green-800 border border-green-300",
        emoji: "✅",
        label: "Atendida",
        description: "Evaluación completada"
      },
      RECHAZADA: {
        badge: "bg-red-100 text-red-800 border border-red-300",
        emoji: "❌",
        label: "Rechazada",
        description: "No válida"
      },
    };
    return estados[estado] || estados.PENDIENTE;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-PE");
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
          imagenes: [],
          estado: imagen.estadoTransformado || imagen.estado,
          evaluacion: imagen.evaluacion,
          fechaPrimera: imagen.fechaEnvio,
        };
      }
      agrupadas[key].imagenes.push(imagen);
    });

    return Object.values(agrupadas);
  };

  const abrirVisor = async (pacienteAgrupado) => {
    try {
      // ✅ Obtener TODAS las imágenes en base64
      const imagenesConContenido = await Promise.all(
        pacienteAgrupado.imagenes.map(async (img) => {
          const respuesta = await teleeckgService.descargarImagenBase64(img.idImagen);
          return {
            ...img,
            contenidoImagen: respuesta.contenidoImagen, // ✅ Extraer la propiedad correcta
            tipoContenido: respuesta.tipoContenido,
          };
        })
      );

      const pacienteConImagenes = {
        ...pacienteAgrupado,
        imagenes: imagenesConContenido,
      };

      setSelectedEKG(imagenesConContenido[0]); // Primera imagen como referencia
      setSelectedPaciente(pacienteConImagenes); // Guardar paciente completo
      setShowVisor(true);
    } catch (error) {
      console.error("❌ Error al cargar imágenes:", error);
      toast.error("No se pudo cargar las imágenes");
    }
  };

  const manejarDescargar = async (idImagen, nombreArchivo) => {
    try {
      await teleeckgService.descargarImagen(idImagen, nombreArchivo);
    } catch (error) {
      console.error("❌ Error al descargar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Registro de Pacientes
            </h1>
          </div>
          <p className="text-gray-600 ml-11">
            Listado de pacientes con electrocardiogramas registrados
          </p>
        </div>

        {/* ✅ Breadcrumb de navegación - Solo en modo standalone */}
        {!isWorkspace && <TeleEKGBreadcrumb />}

        {/* Filtros - Improved Layout */}
        <div className="bg-gradient-to-r from-white to-slate-50 rounded-lg shadow-md border border-gray-200 mb-8">
          {/* Fila 1: Búsqueda */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar DNI, nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Fila 2: Controles */}
          <div className="px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Filtro de Estado */}
            <div className="flex-1 min-w-[200px]">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="TODOS">📊 Todos los estados</option>
                <option value="ENVIADA">✈️ Enviadas</option>
                <option value="ATENDIDA">✅ Atendidas</option>
                <option value="RECHAZADA">❌ Rechazadas</option>
              </select>
            </div>

            {/* Botón Refrescar */}
            <button
              onClick={() => isWorkspace && onRefresh ? onRefresh() : cargarEKGs()}
              disabled={currentLoading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium text-sm whitespace-nowrap"
              title="Refrescar lista de imágenes"
            >
              <RefreshCw className={`w-4 h-4 ${currentLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refrescar</span>
              <span className="sm:hidden">🔄</span>
            </button>

            {/* Estadísticas rápidas */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-2.5 flex items-center justify-between sm:justify-center gap-3 text-right sm:text-center">
              <div>
                <p className="text-xs text-gray-600 font-medium">Total pacientes</p>
                <p className="text-lg font-bold text-blue-600">{agruparImagenesPorPaciente(currentEcgs).length}</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-blue-200"></div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Total EKGs</p>
                <p className="text-lg font-bold text-indigo-600">{currentEcgs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ v1.49.0: Tabla Responsive - Desktop Table + Mobile Cards */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {currentLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando registro...</p>
            </div>
          ) : filteredEcgs.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron registros</p>
            </div>
          ) : (
            <>
              {/* DESKTOP: Tabla (≥768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold w-[120px]">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold w-[100px]">DNI</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold w-auto">Paciente</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold w-[150px]">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold w-[180px]">Evaluación</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold w-[100px]">Archivo</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold w-[120px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEcgs.map((paciente) => (
                      <tr key={paciente.numDocPaciente} className="hover:bg-blue-50 transition-colors border-l-4" style={{borderColor: getEstadoBadge(paciente.estado).badge.includes('yellow') ? '#fbbf24' : getEstadoBadge(paciente.estado).badge.includes('green') ? '#34d399' : getEstadoBadge(paciente.estado).badge.includes('red') ? '#f87171' : '#60a5fa'}}>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatearFecha(paciente.fechaPrimera)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-900 font-mono truncate">
                          {paciente.numDocPaciente}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 truncate">
                              {paciente.nombresPaciente}
                            </p>
                            <p className="text-xs text-blue-600 font-semibold mt-0.5">
                              📸 {paciente.imagenes.length} EKG
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {(() => {
                            const estadoInfo = getEstadoBadge(paciente.estado);
                            return (
                              <div>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${estadoInfo.badge}`} title={estadoInfo.description}>
                                  <span className="mr-1">{estadoInfo.emoji}</span>
                                  {estadoInfo.label}
                                </span>
                                <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">{estadoInfo.description}</p>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {paciente.imagenes[0]?.evaluacion ? (
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              paciente.imagenes[0].evaluacion === 'NORMAL'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : paciente.imagenes[0].evaluacion === 'ANORMAL'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-gray-100 text-gray-800 border border-gray-300'
                            }`}>
                              {paciente.imagenes[0].evaluacion}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 truncate">
                          {paciente.imagenes[0]?.nombreArchivo}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* ✅ 40×40px touch targets + ARIA labels */}
                            <button
                              onClick={() => abrirVisor(paciente)}
                              className="flex items-center justify-center h-10 w-10 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 active:bg-blue-200"
                              title={`Ver ${paciente.imagenes.length} imagen(es)`}
                              aria-label={`Ver electrocardiograma de paciente ${paciente.numDocPaciente}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                manejarDescargar(
                                  paciente.imagenes[0].idImagen,
                                  paciente.imagenes[0].nombreArchivo
                                )
                              }
                              className="flex items-center justify-center h-10 w-10 hover:bg-green-100 rounded-lg transition-colors text-green-600 active:bg-green-200"
                              title="Descargar primera imagen"
                              aria-label={`Descargar electrocardiograma de paciente ${paciente.numDocPaciente}`}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                window.open(
                                  `/teleecg/recibidas?dni=${paciente.numDocPaciente}`,
                                  "_blank"
                                );
                              }}
                              className="flex items-center justify-center h-10 w-10 hover:bg-purple-100 rounded-lg transition-colors text-purple-600 active:bg-purple-200"
                              title="Ver en vista CENATE"
                              aria-label={`Ver electrocardiograma en vista CENATE de paciente ${paciente.numDocPaciente}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE: Cards (<768px) */}
              <div className="md:hidden space-y-4 p-4">
                {filteredEcgs.map((paciente) => (
                  <div
                    key={paciente.numDocPaciente}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3"
                  >
                    {/* Header Row: DNI + Estado */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">DNI</p>
                        <p className="text-lg font-bold text-gray-900">{paciente.numDocPaciente}</p>
                      </div>
                      {(() => {
                        const estadoInfo = getEstadoBadge(paciente.estado);
                        return (
                          <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${estadoInfo.badge}`} title={estadoInfo.description}>
                            <span className="mr-1">{estadoInfo.emoji}</span>
                            {estadoInfo.label}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Paciente Info */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Paciente</p>
                      <p className="text-base font-semibold text-gray-900">
                        {paciente.nombresPaciente}
                      </p>
                      <p className="text-sm text-blue-600 font-semibold">
                        📸 {paciente.imagenes.length} EKG{paciente.imagenes.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Fecha */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Fecha Registro</p>
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatearFecha(paciente.fechaPrimera)}
                      </p>
                    </div>

                    {/* Evaluación */}
                    {paciente.imagenes[0]?.evaluacion && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Evaluación CENATE</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          paciente.imagenes[0].evaluacion === 'NORMAL'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : paciente.imagenes[0].evaluacion === 'ANORMAL'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-300'
                        }`}>
                          {paciente.imagenes[0].evaluacion}
                        </span>
                      </div>
                    )}

                    {/* Archivo */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Archivo</p>
                      <p className="text-sm text-gray-700 truncate">{paciente.imagenes[0]?.nombreArchivo}</p>
                    </div>

                    {/* ✅ Action Buttons (44×44px touch targets) */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => abrirVisor(paciente)}
                        className="flex-1 flex items-center justify-center gap-2 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors active:bg-blue-800"
                        aria-label={`Ver electrocardiograma de paciente ${paciente.numDocPaciente}`}
                      >
                        <Eye className="w-5 h-5" />
                        <span>Ver EKG</span>
                      </button>
                      <button
                        onClick={() =>
                          manejarDescargar(
                            paciente.imagenes[0].idImagen,
                            paciente.imagenes[0].nombreArchivo
                          )
                        }
                        className="h-12 w-12 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors active:bg-green-800"
                        title="Descargar"
                        aria-label={`Descargar electrocardiograma de paciente ${paciente.numDocPaciente}`}
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          window.open(
                            `/teleecg/recibidas?dni=${paciente.numDocPaciente}`,
                            "_blank"
                          );
                        }}
                        className="h-12 w-12 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors active:bg-purple-800"
                        title="Ver en CENATE"
                        aria-label={`Ver en vista CENATE de paciente ${paciente.numDocPaciente}`}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Visor */}
      {showVisor && selectedEKG && selectedPaciente && (
        <VisorECGModal
          ecg={selectedEKG}
          imagenes={selectedPaciente.imagenes}
          onClose={() => {
            setShowVisor(false);
            setSelectedEKG(null);
            setSelectedPaciente(null);
          }}
          onDescargar={() =>
            manejarDescargar(selectedEKG.idImagen, selectedEKG.nombreArchivo)
          }
        />
      )}
    </div>
  );
}
