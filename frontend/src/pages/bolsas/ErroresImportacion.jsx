import React, { useState, useEffect } from 'react';
import { AlertCircle, Download, Filter, Eye, ChevronDown, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ListHeader from '../../components/ListHeader';
import { getApiBaseUrl } from '../../utils/apiUrlHelper';

/**
 * 📋 Errores de Importación - Visualización de Errores de Carga
 * v1.0.0 - Página para revisar y gestionar errores de importación
 *
 * Características:
 * - Tabla de errores por importación
 * - Filtros por tipo de error, fecha, IPRESS
 * - Detalle de fila con datos completos
 * - Exportación de reporte de errores
 * - Estados visuales por tipo de error
 */

export default function ErroresImportacion() {
  const [errores, setErrores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipoError, setFiltroTipoError] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('todas');
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);

  // Cargar errores de importación
  useEffect(() => {
    cargarErrores();
  }, []);

  const cargarErrores = async () => {
    try {
      setIsLoading(true);
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/bolsas/errores-importacion`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth.token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error cargando errores');

      const data = await response.json();
      setErrores(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los errores de importación');
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros
  const erroresFiltrados = errores.filter(error => {
    const matchSearch =
      error.pacienteDni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.nombrePaciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.especialidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.ipress?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTipo = filtroTipoError === 'todos' || error.tipoError === filtroTipoError;
    const matchFecha = filtroFecha === 'todas' || true; // TODO: Implementar filtro fecha

    return matchSearch && matchTipo && matchFecha;
  });

  // Obtener color y emoji por tipo de error
  const getErrorStyle = (tipoError) => {
    const styles = {
      'DUPLICADO': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: '⚠️' },
      'VALIDACION': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '❌' },
      'CONSTRAINT': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: '🔴' },
      'OTRO': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', icon: '❓' }
    };
    return styles[tipoError] || styles['OTRO'];
  };

  // Descargar reporte
  const descargarReporte = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/bolsas/errores-importacion/exportar`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth.token')}`
        }
      });

      if (!response.ok) throw new Error('Error descargando reporte');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `errores-importacion-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al descargar el reporte');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Errores de Importación"
        subtitle="Revisión y gestión de errores durante la carga de Excel"
        icon={<AlertCircle size={28} className="text-red-600" />}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-4xl font-bold">{errores.length}</div>
            <div className="text-red-700 font-semibold mt-2">Total Errores</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6">
            <div className="text-yellow-600 text-4xl font-bold">
              {errores.filter(e => e.tipoError === 'DUPLICADO').length}
            </div>
            <div className="text-yellow-700 font-semibold mt-2">⚠️ Duplicados</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6">
            <div className="text-orange-600 text-4xl font-bold">
              {errores.filter(e => e.tipoError === 'CONSTRAINT').length}
            </div>
            <div className="text-orange-700 font-semibold mt-2">🔴 Constraint</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-4xl font-bold">
              {errores.filter(e => e.tipoError === 'VALIDACION').length}
            </div>
            <div className="text-red-700 font-semibold mt-2">❌ Validación</div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Buscar</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="DNI, Paciente, IPRESS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>
            </div>

            {/* Filtro Tipo Error */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo de Error</label>
              <div className="relative">
                <select
                  value={filtroTipoError}
                  onChange={(e) => setFiltroTipoError(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer bg-white font-medium"
                >
                  <option value="todos">Todos los errores</option>
                  <option value="DUPLICADO">⚠️ Duplicado</option>
                  <option value="VALIDACION">❌ Validación</option>
                  <option value="CONSTRAINT">🔴 Constraint</option>
                  <option value="OTRO">❓ Otro</option>
                </select>
                <ChevronDown size={18} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Botón descargar */}
            <div className="flex items-end">
              <button
                onClick={descargarReporte}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
              >
                <Download size={18} />
                Descargar Reporte
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de errores */}
        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-red-50 to-orange-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">Fila</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">Tipo de Error</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">Paciente (DNI)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">Especialidad</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">IPRESS</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">Descripción del Error</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {erroresFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <AlertCircle size={32} className="mx-auto mb-3 text-gray-300" />
                      <p className="font-semibold">No hay errores registrados</p>
                      <p className="text-sm mt-1">¡Excelente! Todas las importaciones se completaron correctamente.</p>
                    </td>
                  </tr>
                ) : (
                  erroresFiltrados.map((error, index) => {
                    const style = getErrorStyle(error.tipoError);
                    return (
                      <tr key={error.idError} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                            {error.numeroFila}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border-2 ${style.bg} ${style.border} ${style.text}`}>
                            {style.icon} {error.tipoError}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-800">{error.nombrePaciente}</div>
                          <div className="text-xs text-gray-500">{error.pacienteDni}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{error.especialidad || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{error.ipress || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="truncate max-w-xs" title={error.descripcionError}>
                            {error.descripcionError}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedRow(error);
                              setModalDetalle(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium text-sm transition-colors"
                          >
                            <Eye size={16} />
                            Ver Detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      {modalDetalle && selectedRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-red-50 to-orange-50 border-b-2 border-red-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Detalle del Error</h3>
              <button
                onClick={() => setModalDetalle(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Error Info */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getErrorStyle(selectedRow.tipoError).icon}</span>
                  <div>
                    <div className="font-bold text-gray-800">Tipo de Error</div>
                    <div className="text-red-700 font-semibold">{selectedRow.tipoError}</div>
                  </div>
                </div>
              </div>

              {/* Paciente */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Paciente</label>
                <div className="text-gray-800 font-semibold">{selectedRow.nombrePaciente}</div>
                <div className="text-sm text-gray-500">DNI: {selectedRow.pacienteDni}</div>
              </div>

              {/* Datos Excel */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Especialidad</label>
                  <div className="text-gray-800">{selectedRow.especialidad || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">IPRESS</label>
                  <div className="text-gray-800">{selectedRow.ipress || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Fila Excel</label>
                  <div className="text-gray-800 font-semibold">#{selectedRow.numeroFila}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Fecha Error</label>
                  <div className="text-gray-800">{new Date(selectedRow.fechaCreacion).toLocaleDateString('es-ES')}</div>
                </div>
              </div>

              {/* Descripción del Error */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Descripción del Error</label>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-1 text-sm text-gray-700 font-mono whitespace-pre-wrap break-words">
                  {selectedRow.descripcionError}
                </div>
              </div>

              {/* Datos JSON */}
              {selectedRow.datosExcelJson && (
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Datos del Excel (JSON)</label>
                  <div className="bg-gray-900 text-green-400 rounded p-3 mt-1 text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto">
                    <pre>{JSON.stringify(JSON.parse(selectedRow.datosExcelJson), null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setModalDetalle(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
