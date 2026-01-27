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
      console.log('📊 Datos crudos del backend:', data);
      console.log('📊 Primer registro:', data[0] || 'Sin datos');
      if (data && data.length > 0) {
        console.log('🔍 Propiedades del primer registro:', Object.keys(data[0]));
        console.log('📋 Valores:', data[0]);
      }
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
    await cargarDetalles(carga.idImportacion);
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
   * Elimina un historial de importación (soft delete)
   */
  const eliminarCarga = async () => {
    if (!cargaAEliminar) return;

    setIsDeleting(true);
    try {
      await bolsasService.eliminarCarga(cargaAEliminar.idImportacion);
      alert('Carga eliminada correctamente');
      setModalEliminar(false);
      setCargaAEliminar(null);
      cargarCargas(); // Recargar listado
    } catch (error) {
      console.error('Error eliminando carga:', error);
      alert('Error al eliminar la carga. Intenta nuevamente.');
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
   * Filtra las importaciones según el estado seleccionado
   */
  const cargasFiltradas = filtroEstado === 'todos'
    ? cargas
    : cargas.filter(c => c.estado === filtroEstado);

  /**
   * Obtiene el color del badge según el estado de la importación
   */
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'COMPLETADA':
        return 'bg-green-100 text-green-700';
      case 'EN_PROCESO':
        return 'bg-blue-100 text-blue-700';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-700';
      case 'ERROR':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 bg-white">
      {/* Encabezado limpio */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">📂 Historial de Bolsas</h2>
        <p className="text-gray-600 text-sm mb-4">Gestiona tus cargas y su seguimiento</p>

        {/* Filtro por estado - Limpio */}
        <div className="flex items-center gap-3 bg-white border border-gray-300 p-4 rounded-md">
          <label className="text-sm font-semibold text-gray-700">Filtrar por Estado:</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="todos">Todos los estados</option>
            <option value="COMPLETADA">Completada</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ERROR">Error</option>
          </select>

          <button
            onClick={cargarCargas}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600 font-semibold">Cargando datos...</p>
          </div>
        </div>
      ) : errorMessage ? (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-700 font-semibold mb-3">{errorMessage}</p>
          <button
            onClick={cargarCargas}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : cargasFiltradas.length > 0 ? (
        // 📊 TABLA LIMPIA Y EJECUTIVA
        <div className="overflow-x-auto border border-gray-300 rounded">
          <table className="w-full border-collapse">
            {/* HEADER - Azul limpio */}
            <thead className="bg-blue-600 text-white sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold">Archivo</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Usuario</th>
                <th className="px-4 py-3 text-center text-sm font-bold">Registros</th>
                <th className="px-4 py-3 text-center text-sm font-bold">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Fecha Carga</th>
                <th className="px-4 py-3 text-center text-sm font-bold">Acciones</th>
              </tr>
            </thead>

            {/* BODY - Filas compactas con rayado alternado azul suave */}
            <tbody>
              {cargasFiltradas.map((carga, idx) => {
                console.log(`📍 Fila ${idx}:`, carga);
                // Rayado: filas pares blanco, impares azul claro suave
                const bgClass = idx % 2 === 0 ? 'bg-white' : 'bg-blue-50';

                return (
                  <tr
                    key={carga.idImportacion}
                    className={`${bgClass} border-b border-gray-200 hover:bg-blue-100 transition-colors`}
                  >
                    {/* Archivo */}
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                      {carga.nombreArchivo || 'N/A'}
                    </td>

                    {/* Usuario */}
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {carga.usuarioNombre || 'N/A'}
                    </td>

                    {/* Registros - Centro con fondo azul claro */}
                    <td className="px-4 py-3 text-center text-sm font-bold text-blue-700 bg-blue-100 rounded">
                      {carga.totalRegistros || 'N/A'}
                    </td>

                    {/* Estado - Badge simple */}
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getEstadoBadge(carga.estado)}`}>
                        {carga.estado || 'DESCONOCIDO'}
                      </span>
                    </td>

                    {/* Fecha Carga */}
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {carga.fechaImportacion ? new Date(carga.fechaImportacion).toLocaleDateString('es-PE') : 'N/A'}
                    </td>

                    {/* Acciones - Botones pequeños */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {/* Ver Detalles */}
                        <button
                          onClick={() => abrirDetalles(carga)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-semibold transition-colors"
                          title="Ver detalles"
                        >
                          👁️
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => confirmarEliminar(carga)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-semibold transition-colors"
                          title="Eliminar carga"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 border border-gray-300 rounded">
          <p className="text-gray-600 text-lg font-semibold mb-3">No hay bolsas registradas</p>
          <p className="text-gray-500 text-sm mb-4">Comienza cargando un archivo desde "Cargar desde Excel"</p>
          <a href="/bolsas/cargar" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold">
            ➕ Cargar Archivo
          </a>
        </div>
      )}

      {/* Modal de Detalles - Limpio */}
      {modalDetalles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded max-w-2xl w-full max-h-96 overflow-y-auto border border-gray-300">
            <div className="sticky top-0 bg-blue-600 text-white p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">📋 Detalles de la Carga</h3>
              <button
                onClick={cerrarDetalles}
                className="text-xl font-bold hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              {cargaSeleccionada && (
                <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600 font-bold mb-1">Archivo</p>
                      <p className="text-gray-900 font-semibold">{cargaSeleccionada.nombreArchivo}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-bold mb-1">Usuario</p>
                      <p className="text-gray-900 font-semibold">{cargaSeleccionada.usuarioNombre || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-bold mb-1">Fecha Carga</p>
                      <p className="text-gray-900 font-semibold">{new Date(cargaSeleccionada.fechaImportacion).toLocaleDateString('es-PE')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-bold mb-1">Estado</p>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getEstadoBadge(cargaSeleccionada.estado)}`}>
                        {cargaSeleccionada.estado}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-300 grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-gray-600 font-bold text-xs mb-1">Total</p>
                      <p className="text-lg font-bold text-blue-700">{cargaSeleccionada.totalRegistros}</p>
                    </div>
                    <div className="text-center bg-green-100 rounded p-2">
                      <p className="text-gray-600 font-bold text-xs mb-1">Exitosos</p>
                      <p className="text-lg font-bold text-green-600">{cargaSeleccionada.registrosExitosos}</p>
                    </div>
                    <div className="text-center bg-red-100 rounded p-2">
                      <p className="text-gray-600 font-bold text-xs mb-1">Fallidos</p>
                      <p className="text-lg font-bold text-red-600">{cargaSeleccionada.registrosFallidos}</p>
                    </div>
                  </div>
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

            <div className="sticky bottom-0 bg-gray-50 p-4 flex justify-end gap-2 border-t border-gray-300">
              <button
                onClick={cerrarDetalles}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Eliminar - Limpio */}
      {modalEliminar && cargaAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded max-w-md w-full border border-gray-300">
            <div className="bg-red-600 text-white p-4">
              <h3 className="text-lg font-bold">⚠️ Confirmar Eliminación</h3>
            </div>

            <div className="p-4">
              <p className="text-gray-800 mb-3 text-sm font-semibold">
                ¿Estás seguro de que deseas eliminar?
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                <p className="text-red-800 font-bold text-sm">
                  {cargaAEliminar.nombreArchivo}
                </p>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Se eliminarán {cargaAEliminar.totalRegistros || 0} registros. No se puede deshacer.
              </p>
            </div>

            <div className="bg-gray-50 p-4 flex justify-end gap-2 border-t border-gray-300">
              <button
                onClick={() => setModalEliminar(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-sm disabled:opacity-50"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={eliminarCarga}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-colors disabled:opacity-50"
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
