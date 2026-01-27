/**
 * GestionBolsas.jsx - Historial de cargas de bolsas
 *
 * Características:
 * - Tabla de historial de cargas (nombre, usuario, estado, fecha, cantidad)
 * - Acciones: Ver detalles, Exportar a Excel, Eliminar carga
 * - Filtros por estado de carga
 * - Modal para ver detalles de items y errores
 */

import React, { useState, useEffect } from 'react';
import bolsasService from '../../services/bolsasService';
import './GestionBolsas.css';

export default function GestionBolsas() {
  const [cargas, setCargas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Modal para ver detalles
  const [modalDetalles, setModalDetalles] = useState(false);
  const [cargaSeleccionada, setCargaSeleccionada] = useState(null);
  const [datosDetalle, setDatosDetalle] = useState(null);
  const [isLoadingDetalle, setIsLoadingDetalle] = useState(false);

  // Modal de confirmación para eliminar
  const [modalEliminar, setModalEliminar] = useState(false);
  const [cargaAEliminar, setCargaAEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Effect: Cargar cargas al iniciar
  useEffect(() => {
    cargarCargas();
  }, []);

  /**
   * Carga el listado de cargas desde el backend
   */
  const cargarCargas = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await bolsasService.obtenerListaCargas();
      setCargas(data);
    } catch (error) {
      console.error('Error cargando cargas:', error);
      setErrorMessage('Error al cargar el historial de cargas. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtiene los detalles de una carga (items y errores)
   */
  const cargarDetalles = async (idCarga) => {
    setIsLoadingDetalle(true);
    try {
      const data = await bolsasService.obtenerDatosCarga(idCarga);
      setDatosDetalle(data);
    } catch (error) {
      console.error('Error cargando detalles:', error);
      setErrorMessage('Error al cargar los detalles de la carga.');
    } finally {
      setIsLoadingDetalle(false);
    }
  };

  /**
   * Abre el modal de detalles
   */
  const abrirDetalles = async (carga) => {
    setCargaSeleccionada(carga);
    setModalDetalles(true);
    await cargarDetalles(carga.id_carga);
  };

  /**
   * Cierra el modal de detalles
   */
  const cerrarDetalles = () => {
    setModalDetalles(false);
    setCargaSeleccionada(null);
    setDatosDetalle(null);
  };

  /**
   * Abre el modal de confirmación para eliminar
   */
  const confirmarEliminar = (carga) => {
    setCargaAEliminar(carga);
    setModalEliminar(true);
  };

  /**
   * Elimina una solicitud de bolsa (soft delete)
   */
  const eliminarCarga = async () => {
    if (!cargaAEliminar) return;

    setIsDeleting(true);
    try {
      await bolsasService.eliminarCarga(cargaAEliminar.idSolicitud);
      alert('Solicitud eliminada correctamente');
      setModalEliminar(false);
      setCargaAEliminar(null);
      cargarCargas(); // Recargar listado
    } catch (error) {
      console.error('Error eliminando solicitud:', error);
      alert('Error al eliminar la solicitud. Intenta nuevamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Exporta una carga a Excel
   */
  const exportarCarga = async (idCarga) => {
    try {
      await bolsasService.exportarCargaExcel(idCarga);
      alert('Descarga iniciada');
    } catch (error) {
      console.error('Error exportando carga:', error);
      alert('Error al exportar la carga. Intenta nuevamente.');
    }
  };

  /**
   * Filtra las bolsas según el estado seleccionado
   */
  const cargasFiltradas = filtroEstado === 'todos'
    ? cargas
    : cargas.filter(c => c.estado === filtroEstado);

  /**
   * Obtiene el color del badge según el estado de la solicitud
   */
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'PENDIENTE_CITA':
        return 'bg-yellow-100 text-yellow-700';
      case 'CITADO':
        return 'bg-blue-100 text-blue-700';
      case 'ATENDIDO':
        return 'bg-green-100 text-green-700';
      case 'NO_CONTACTADO':
        return 'bg-orange-100 text-orange-700';
      case 'REPROGRAMACIONFALLIDA':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Encabezado */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📂 Historial de Bolsas</h2>

        {/* Filtro por estado */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-semibold text-gray-700">Filtrar por Estado:</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="PENDIENTE_CITA">Pendiente</option>
            <option value="CITADO">Citado</option>
            <option value="ATENDIDO">Atendido</option>
          </select>

          <button
            onClick={cargarCargas}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : errorMessage ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">{errorMessage}</p>
          <button
            onClick={cargarCargas}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : cargasFiltradas.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-blue-700 text-white sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold"># Solicitud</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Paciente (DNI)</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Especialidad</th>
                <th className="px-4 py-3 text-left text-sm font-bold">IPRESS</th>
                <th className="px-4 py-3 text-center text-sm font-bold">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Fecha Solicitud</th>
                <th className="px-4 py-3 text-center text-sm font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargasFiltradas.map((carga) => (
                <tr key={carga.idSolicitud} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{carga.numeroSolicitud}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{carga.pacienteNombre} ({carga.pacienteDni})</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{carga.descTipoBolsa || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{carga.descIpress || 'N/A'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getEstadoBadge(carga.estado)}`}>
                      {carga.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {carga.fechaSolicitud ? new Date(carga.fechaSolicitud).toLocaleDateString('es-PE') : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => abrirDetalles(carga)}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-semibold transition-colors"
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => confirmarEliminar(carga)}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-semibold transition-colors"
                        title="Eliminar solicitud"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay bolsas registradas</p>
        </div>
      )}

      {/* Modal de Detalles */}
      {modalDetalles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-blue-700 text-white p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">📋 Detalles de la Carga</h3>
              <button
                onClick={cerrarDetalles}
                className="text-xl font-bold hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              {cargaSeleccionada && (
                <div className="mb-4 p-3 bg-gray-100 rounded">
                  <p><strong>Archivo:</strong> {cargaSeleccionada.nombre_archivo}</p>
                  <p><strong>Usuario:</strong> {cargaSeleccionada.usuario_carga}</p>
                  <p><strong>Fecha:</strong> {new Date(cargaSeleccionada.fecha_reporte).toLocaleDateString('es-PE')}</p>
                  <p><strong>Estado:</strong> <span className={`px-2 py-1 rounded text-xs font-semibold ${getEstadoBadge(cargaSeleccionada.estado_carga)}`}>
                    {cargaSeleccionada.estado_carga}
                  </span></p>
                </div>
              )}

              {isLoadingDetalle ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : datosDetalle ? (
                <div>
                  {/* Items */}
                  {datosDetalle.items && datosDetalle.items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-bold text-green-700 mb-2">✅ Items Procesados ({datosDetalle.total_items})</h4>
                      <div className="bg-green-50 border border-green-200 rounded p-2 max-h-40 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-green-200">
                            <tr>
                              <th className="text-left px-2 py-1">Registro</th>
                              <th className="text-left px-2 py-1">DNI</th>
                              <th className="text-left px-2 py-1">Paciente</th>
                            </tr>
                          </thead>
                          <tbody>
                            {datosDetalle.items.slice(0, 5).map((item, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="px-2 py-1">{item.registro}</td>
                                <td className="px-2 py-1">{item.numero_documento}</td>
                                <td className="px-2 py-1">{item.paciente}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {datosDetalle.items.length > 5 && (
                          <p className="text-xs text-gray-600 mt-2">+ {datosDetalle.items.length - 5} más...</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Errores */}
                  {datosDetalle.errores && datosDetalle.errores.length > 0 && (
                    <div>
                      <h4 className="font-bold text-red-700 mb-2">❌ Errores Encontrados ({datosDetalle.total_errores})</h4>
                      <div className="bg-red-50 border border-red-200 rounded p-2 max-h-40 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-red-200">
                            <tr>
                              <th className="text-left px-2 py-1">Fila</th>
                              <th className="text-left px-2 py-1">Mensaje</th>
                            </tr>
                          </thead>
                          <tbody>
                            {datosDetalle.errores.slice(0, 5).map((error, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="px-2 py-1">{error.numero_fila || error.fila}</td>
                                <td className="px-2 py-1 text-red-600">{error.mensaje_error || error.error}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {datosDetalle.errores.length > 5 && (
                          <p className="text-xs text-gray-600 mt-2">+ {datosDetalle.errores.length - 5} más...</p>
                        )}
                      </div>
                    </div>
                  )}

                  {(!datosDetalle.items || datosDetalle.items.length === 0) &&
                   (!datosDetalle.errores || datosDetalle.errores.length === 0) && (
                    <p className="text-gray-500 text-sm">No hay datos para mostrar</p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="sticky bottom-0 bg-gray-100 p-4 flex justify-end gap-2">
              <button
                onClick={cerrarDetalles}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Eliminar */}
      {modalEliminar && cargaAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-red-700 text-white p-4">
              <h3 className="text-lg font-bold">⚠️ Confirmar Eliminación</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas eliminar la carga <strong>"{cargaAEliminar.nombre_archivo}"</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Se eliminarán {cargaAEliminar.total_filas || 0} registros. Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="bg-gray-100 p-4 flex justify-end gap-2">
              <button
                onClick={() => setModalEliminar(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={eliminarCarga}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
