import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Eye,
  Download,
  Filter,
  Calendar,
} from "lucide-react";
import teleeckgService from "../../../../services/teleecgService";
import VisorECGModal from "../../../../components/teleecgs/VisorECGModal";

/**
 * 👥 Página de Registro de Pacientes con ECGs
 */
export default function RegistroPacientes() {
  const [ecgs, setEcgs] = useState([]);
  const [filteredEcgs, setFilteredEcgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("TODOS");
  const [selectedECG, setSelectedECG] = useState(null);
  const [showVisor, setShowVisor] = useState(false);

  useEffect(() => {
    cargarECGs();
  }, []);

  useEffect(() => {
    filtrar();
  }, [searchTerm, filterEstado, ecgs]);

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

  const filtrar = () => {
    let resultado = [...ecgs];

    // Filtrar por búsqueda
    if (searchTerm) {
      resultado = resultado.filter(
        (ecg) =>
          ecg.numDocPaciente?.includes(searchTerm) ||
          ecg.nombresPaciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ecg.apellidosPaciente?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterEstado !== "TODOS") {
      resultado = resultado.filter((ecg) => ecg.estado === filterEstado);
    }

    setFilteredEcgs(resultado);
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      PENDIENTE: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      PROCESADA: "bg-green-100 text-green-800 border border-green-300",
      RECHAZADA: "bg-red-100 text-red-800 border border-red-300",
    };
    return estilos[estado] || estilos.PENDIENTE;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-PE");
  };

  const abrirVisor = (ecg) => {
    setSelectedECG(ecg);
    setShowVisor(true);
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
      <div className="max-w-7xl mx-auto">
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

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por DNI, nombre o apellido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Filtro de Estado */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="PROCESADA">Procesadas</option>
                <option value="RECHAZADA">Rechazadas</option>
              </select>
            </div>

            {/* Estadísticas rápidas */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total de ECGs</p>
              <p className="text-2xl font-bold text-blue-600">{ecgs.length}</p>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      DNI
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Archivo
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEcgs.map((ecg) => (
                    <tr key={ecg.idImagen} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatearFecha(ecg.fechaEnvio)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {ecg.numDocPaciente}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>
                          <p className="font-medium">
                            {ecg.nombresPaciente}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ecg.apellidosPaciente}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(
                            ecg.estado
                          )}`}
                        >
                          {ecg.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {ecg.nombreArchivo}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirVisor(ecg)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="Ver imagen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              manejarDescargar(
                                ecg.idImagen,
                                ecg.nombreArchivo
                              )
                            }
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                            title="Descargar"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Visor */}
      {showVisor && selectedECG && (
        <VisorECGModal
          ecg={selectedECG}
          onClose={() => {
            setShowVisor(false);
            setSelectedECG(null);
          }}
          onDescargar={() =>
            manejarDescargar(selectedECG.idImagen, selectedECG.nombreArchivo)
          }
        />
      )}
    </div>
  );
}
