import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { listarPacientesModulo107 } from '../../../services/formulario107Service';
import toast from 'react-hot-toast';

/**
 * 📋 ListadoPacientes - Tab de Listado de Pacientes del Módulo 107 (v3.0)
 *
 * Componente para visualizar todos los pacientes importados del Módulo 107
 * con paginación y ordenamiento.
 *
 * Novedad v3.0: Utiliza dim_solicitud_bolsa en lugar de bolsa_107_item
 */
export default function ListadoPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(30);
  const [sortBy] = useState('fechaSolicitud');
  const [sortDirection] = useState('DESC');

  // Cargar pacientes al montar el componente o cambiar de página
  useEffect(() => {
    cargarPacientes();
  }, [currentPage]);

  const cargarPacientes = async () => {
    setLoading(true);
    try {
      const response = await listarPacientesModulo107(
        currentPage,
        pageSize,
        sortBy,
        sortDirection
      );

      setPacientes(response.pacientes || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.total || 0);

      if (response.pacientes.length === 0 && currentPage === 0) {
        toast.success('No hay pacientes importados aún');
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      toast.error('Error al cargar pacientes');
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleGoToPage = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getEstadoBadgeColor = (estado) => {
    switch (estado) {
      case 'ATENDIDO':
        return 'bg-green-100 text-green-800';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      case 'DERIVADO':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Listado de Pacientes</h2>
        <p className="text-gray-600">
          Total: <span className="font-semibold text-indigo-600">{totalElements} pacientes</span>
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-gray-600">Cargando pacientes...</p>
          </div>
        </div>
      ) : pacientes.length === 0 ? (
        /* Empty State */
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No hay pacientes para mostrar</p>
            <p className="text-gray-400 text-sm mt-2">
              Carga un archivo Excel en la pestaña "Cargar Excel"
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="flex-1 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-indigo-600 text-white sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">DNI</th>
                  <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold">Sexo</th>
                  <th className="px-4 py-3 text-left font-semibold">Fecha Solicitud</th>
                  <th className="px-4 py-3 text-left font-semibold">IPRESS</th>
                  <th className="px-4 py-3 text-left font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pacientes.map((paciente, index) => (
                  <tr
                    key={paciente.id_solicitud || index}
                    className="hover:bg-indigo-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-gray-800">
                      {paciente.paciente_dni || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {paciente.paciente_nombre || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {paciente.paciente_sexo || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(paciente.fecha_solicitud)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {paciente.codigo_ipress || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadgeColor(
                          paciente.estado
                        )}`}
                      >
                        {paciente.estado || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">
              Página <span className="font-semibold">{currentPage + 1}</span> de{' '}
              <span className="font-semibold">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleGoToPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                        pageNum === currentPage
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm text-gray-600">
              Mostrando <span className="font-semibold">{pacientes.length}</span> de{' '}
              <span className="font-semibold">{totalElements}</span> pacientes
            </div>
          </div>
        </>
      )}
    </div>
  );
}
