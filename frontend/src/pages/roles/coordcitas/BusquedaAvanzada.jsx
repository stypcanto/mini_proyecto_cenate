import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Loader } from 'lucide-react';
import { buscarPacientesModulo107 } from '../../../services/formulario107Service';
import toast from 'react-hot-toast';

/**
 * 🔍 BusquedaAvanzada - Tab de Búsqueda Avanzada del Módulo 107 (v3.0)
 *
 * Componente para buscar pacientes con múltiples filtros
 * Soporta: DNI, Nombre, IPRESS, Estado y rango de fechas
 */
export default function BusquedaAvanzada() {
  const [filtros, setFiltros] = useState({
    dni: '',
    nombre: '',
    codigoIpress: '',
    estadoId: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(30);

  const estadosDisponibles = [
    { id: 1, nombre: 'Pendiente' },
    { id: 5, nombre: 'Atendido' },
    { id: 6, nombre: 'Cancelado' },
    { id: 7, nombre: 'Derivado' },
  ];

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBuscar = async (page = 0) => {
    setLoading(true);
    try {
      // Validar que al menos un filtro esté completo
      const tieneAlgunFiltro = Object.values(filtros).some((v) => v.trim() !== '');

      if (!tieneAlgunFiltro) {
        toast.error('Ingresa al menos un criterio de búsqueda');
        setLoading(false);
        return;
      }

      const response = await buscarPacientesModulo107({
        ...filtros,
        page,
        size: pageSize,
      });

      setResultados(response.pacientes || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.total || 0);
      setCurrentPage(page);
      setHasSearched(true);

      if (response.pacientes.length === 0) {
        toast.info('No se encontraron pacientes con los criterios especificados');
      } else {
        toast.success(`Se encontraron ${response.total} paciente(s)`);
      }
    } catch (error) {
      console.error('Error al buscar:', error);
      toast.error('Error al realizar la búsqueda');
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFiltros({
      dni: '',
      nombre: '',
      codigoIpress: '',
      estadoId: '',
      fechaDesde: '',
      fechaHasta: '',
    });
    setResultados([]);
    setHasSearched(false);
    setCurrentPage(0);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      handleBuscar(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      handleBuscar(currentPage + 1);
    }
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Búsqueda Avanzada</h2>
        <p className="text-gray-600">Busca pacientes usando uno o más criterios</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* DNI */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">DNI</label>
            <input
              type="text"
              name="dni"
              placeholder="Ej: 12345678"
              value={filtros.dni}
              onChange={handleFiltroChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del paciente"
              value={filtros.nombre}
              onChange={handleFiltroChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* IPRESS */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">IPRESS</label>
            <input
              type="text"
              name="codigoIpress"
              placeholder="Código IPRESS"
              value={filtros.codigoIpress}
              onChange={handleFiltroChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
            <select
              name="estadoId"
              value={filtros.estadoId}
              onChange={handleFiltroChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">-- Selecciona un estado --</option>
              {estadosDisponibles.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              name="fechaDesde"
              value={filtros.fechaDesde}
              onChange={handleFiltroChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              name="fechaHasta"
              value={filtros.fechaHasta}
              onChange={handleFiltroChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleLimpiar}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
          <button
            onClick={() => handleBuscar(0)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Buscar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {hasSearched && (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
                <p className="text-gray-600">Buscando pacientes...</p>
              </div>
            </div>
          ) : resultados.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-gray-500 text-lg">No se encontraron pacientes</p>
                <p className="text-gray-400 text-sm mt-2">
                  Intenta con criterios de búsqueda diferentes
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Tabla de Resultados */}
              <div className="flex-1 overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-6">
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
                    {resultados.map((paciente, index) => (
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

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600">
                    Página <span className="font-semibold">{currentPage + 1}</span> de{' '}
                    <span className="font-semibold">{totalPages}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 0}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>

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
                    Mostrando <span className="font-semibold">{resultados.length}</span> de{' '}
                    <span className="font-semibold">{totalElements}</span> pacientes
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
