import React, { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';

/**
 * ✅ NUEVO v1.19.0: Modal para mostrar resultados detallados de importación
 * Separa: ✅ Exitosas, ⚠️ Duplicadas, ❌ Otros Errores
 */
const ModalResultadosImportacion = ({
  isOpen,
  onClose,
  resultados
}) => {
  const [expandedSection, setExpandedSection] = useState('resumen'); // 'resumen', 'duplicados', 'otros'

  if (!isOpen || !resultados) return null;

  const {
    filas_ok = 0,
    filas_duplicadas = 0,
    filas_otros_errores = 0,
    duplicados = [],
    otros_errores = [],
    mensaje = ''
  } = resultados;

  const totalFilas = filas_ok + filas_duplicadas + filas_otros_errores;
  const porcentajeExito = totalFilas > 0 ? ((filas_ok / totalFilas) * 100).toFixed(1) : 0;

  // Función para descargar reporte como CSV
  const descargarReporte = () => {
    let contenido = `REPORTE DE IMPORTACIÓN\n`;
    contenido += `Fecha: ${new Date().toLocaleString()}\n\n`;
    contenido += `RESUMEN:\n`;
    contenido += `Total de registros: ${totalFilas}\n`;
    contenido += `Exitosos: ${filas_ok}\n`;
    contenido += `Duplicados: ${filas_duplicadas}\n`;
    contenido += `Otros errores: ${filas_otros_errores}\n`;
    contenido += `Tasa de éxito: ${porcentajeExito}%\n\n`;

    if (duplicados.length > 0) {
      contenido += `REGISTROS DUPLICADOS:\n`;
      contenido += `Fila,DNI,Paciente,Especialidad,IPRESS,Razón\n`;
      duplicados.forEach(dup => {
        contenido += `${dup.fila},"${dup.dni}","${dup.paciente}","${dup.especialidad}","${dup.ipress}","${dup.razon}"\n`;
      });
      contenido += '\n';
    }

    if (otros_errores.length > 0) {
      contenido += `OTROS ERRORES:\n`;
      contenido += `Fila,DNI,Error\n`;
      otros_errores.forEach(err => {
        contenido += `${err.fila},"${err.dni}","${err.error}"\n`;
      });
    }

    const blob = new Blob([contenido], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_importacion_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Resultados de Importación</h2>
          <p className="text-blue-100">{mensaje}</p>
        </div>

        <div className="p-6">
          {/* Resumen con Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Card Exitosos */}
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{filas_ok}</span>
              </div>
              <p className="text-gray-700 text-sm font-semibold">Cargados Exitosamente</p>
              <p className="text-gray-500 text-xs mt-1">{porcentajeExito}% de éxito</p>
            </div>

            {/* Card Duplicados */}
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-600">{filas_duplicadas}</span>
              </div>
              <p className="text-gray-700 text-sm font-semibold">Registros Duplicados</p>
              <p className="text-gray-500 text-xs mt-1">Ya existen en el sistema</p>
            </div>

            {/* Card Otros Errores */}
            <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-6 h-6 text-red-600" />
                <span className="text-2xl font-bold text-red-600">{filas_otros_errores}</span>
              </div>
              <p className="text-gray-700 text-sm font-semibold">Otros Errores</p>
              <p className="text-gray-500 text-xs mt-1">Validación o datos inválidos</p>
            </div>
          </div>

          {/* Secciones Expandibles */}
          <div className="space-y-3">
            {/* Sección Duplicados */}
            {filas_duplicadas > 0 && (
              <div className="border border-yellow-200 rounded-lg bg-yellow-50">
                <button
                  onClick={() => toggleSection('duplicados')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-yellow-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-gray-800">
                      Registros Duplicados ({filas_duplicadas})
                    </span>
                  </div>
                  {expandedSection === 'duplicados' ?
                    <ChevronUp className="w-5 h-5 text-gray-600" /> :
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  }
                </button>

                {expandedSection === 'duplicados' && (
                  <div className="px-4 py-4 border-t border-yellow-200 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-yellow-200 bg-yellow-100">
                          <th className="text-left px-2 py-2 text-yellow-900">Fila</th>
                          <th className="text-left px-2 py-2 text-yellow-900">DNI</th>
                          <th className="text-left px-2 py-2 text-yellow-900">Paciente</th>
                          <th className="text-left px-2 py-2 text-yellow-900">Especialidad</th>
                          <th className="text-left px-2 py-2 text-yellow-900">IPRESS</th>
                          <th className="text-left px-2 py-2 text-yellow-900">Razón</th>
                        </tr>
                      </thead>
                      <tbody>
                        {duplicados.map((dup, idx) => (
                          <tr key={idx} className="border-b border-yellow-100 hover:bg-yellow-100">
                            <td className="px-2 py-2 text-gray-600">{dup.fila}</td>
                            <td className="px-2 py-2 font-mono text-gray-700">{dup.dni}</td>
                            <td className="px-2 py-2 text-gray-700">{dup.paciente}</td>
                            <td className="px-2 py-2 text-gray-700">{dup.especialidad}</td>
                            <td className="px-2 py-2 text-gray-600">{dup.ipress}</td>
                            <td className="px-2 py-2 text-yellow-700 text-xs">{dup.razon}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Sección Otros Errores */}
            {filas_otros_errores > 0 && (
              <div className="border border-red-200 rounded-lg bg-red-50">
                <button
                  onClick={() => toggleSection('otros')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-gray-800">
                      Otros Errores ({filas_otros_errores})
                    </span>
                  </div>
                  {expandedSection === 'otros' ?
                    <ChevronUp className="w-5 h-5 text-gray-600" /> :
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  }
                </button>

                {expandedSection === 'otros' && (
                  <div className="px-4 py-4 border-t border-red-200 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-red-200 bg-red-100">
                          <th className="text-left px-2 py-2 text-red-900">Fila</th>
                          <th className="text-left px-2 py-2 text-red-900">DNI</th>
                          <th className="text-left px-2 py-2 text-red-900">Descripción del Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {otros_errores.map((err, idx) => (
                          <tr key={idx} className="border-b border-red-100 hover:bg-red-100">
                            <td className="px-2 py-2 text-gray-600">{err.fila}</td>
                            <td className="px-2 py-2 font-mono text-gray-700">{err.dni}</td>
                            <td className="px-2 py-2 text-red-700 text-xs">{err.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 mt-8 justify-end">
            <button
              onClick={descargarReporte}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-semibold"
            >
              <Download className="w-4 h-4" />
              Descargar Reporte CSV
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalResultadosImportacion;
