import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, FileText, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bolsasService from '../../services/bolsasService';

/**
 * 📁 CargarDesdeExcel - Importación de Bolsas desde archivos Excel
 * v1.0.0 - Permitir carga masiva de bolsas desde archivos Excel/CSV
 *
 * Características:
 * - Carga de archivos Excel (.xlsx, .xls, .csv)
 * - Validación de formato y estructura
 * - Preview de datos antes de importar
 * - Historial de importaciones
 */
export default function CargarDesdeExcel() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [preview, setPreview] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [tipoBolesaId, setTipoBolesaId] = useState(null);
  const [tiposBolsas, setTiposBolsas] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  // Obtener token y usuario del localStorage
  const token = localStorage.getItem('token');

  // Obtener datos del usuario y tipos de bolsas en el montaje
  useEffect(() => {
    // Obtener usuario
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsuario(user);
      } catch (e) {
        console.error('Error al parsear usuario:', e);
        setUsuario({ username: 'admin', id: 1 });
      }
    }

    // Obtener bolsas disponibles
    const obtenerBolsasDisponibles = async () => {
      try {
        const datos = await bolsasService.obtenerBolsas();
        // Filtrar solo bolsas activas
        const bolsasActivas = datos.filter(bolsa => bolsa.estado === 'ACTIVA' && bolsa.activo === true);
        console.log('📋 Bolsas disponibles:', bolsasActivas);
        setTiposBolsas(bolsasActivas || []);
      } catch (error) {
        console.error('❌ Error obteniendo bolsas disponibles:', error);
        setTiposBolsas([]);
      } finally {
        setLoadingTipos(false);
      }
    };

    obtenerBolsasDisponibles();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar que sea archivo válido
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                         'application/vnd.ms-excel',
                         'text/csv'];

      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
        setImportStatus({
          type: 'error',
          message: 'Formato de archivo no válido. Use .xlsx, .xls o .csv'
        });
        return;
      }

      setFile(selectedFile);
      setImportStatus(null);
    }
  };

  const handleImport = async () => {
    if (!file || !usuario || !tipoBolesaId) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('usuarioId', usuario.id || 1);
      formData.append('usuarioNombre', usuario.username || 'admin');
      formData.append('tipoBolesaId', tipoBolesaId);

      // Log para debugging
      console.log('📤 Enviando importación:', {
        archivo: file.name,
        usuarioId: usuario.id,
        usuarioNombre: usuario.username,
        tipoBolesaId: tipoBolesaId,
        tamaño: file.size
      });

      // Usar el servicio de bolsas para importar
      const resultado = await bolsasService.importarDesdeExcel(formData);

      setImportStatus({
        type: 'success',
        message: resultado.mensaje || 'Archivo importado correctamente',
        rowsProcessed: resultado.registrosExitosos,
        totalRows: resultado.totalRegistros,
        failedRows: resultado.registrosFallidos
      });

      console.log('✅ Importación exitosa:', resultado);

      // Limpiar archivo después de 2 segundos y redirigir
      setTimeout(() => {
        setFile(null);
        setTipoBolesaId(null);
        navigate('/bolsas/solicitudes');
      }, 2000);

    } catch (error) {
      console.error('❌ Error en importación:', error);
      setImportStatus({
        type: 'error',
        message: error.message || 'Error al importar archivo'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📁 Cargar desde Excel</h1>
          <p className="text-gray-600">Importa bolsas de pacientes desde archivos Excel o CSV</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Zona de carga */}
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 mb-8 cursor-pointer hover:bg-blue-100 transition-colors">
            <Upload size={48} className="mx-auto text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Arrastra tu archivo aquí
            </h3>
            <p className="text-gray-600 mb-4">O haz clic para seleccionar</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold cursor-pointer"
            >
              Seleccionar Archivo
            </label>
          </div>

          {/* Información del archivo */}
          {file && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-4">
              <FileText className="text-green-600" size={32} />
              <div>
                <p className="font-semibold text-green-800">{file.name}</p>
                <p className="text-sm text-green-700">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          )}

          {/* Estado de la importación */}
          {importStatus && (
            <div className={`rounded-lg p-4 mb-6 flex items-center gap-4 ${
              importStatus.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {importStatus.type === 'success' ? (
                <CheckCircle className="text-green-600" size={32} />
              ) : (
                <AlertCircle className="text-red-600" size={32} />
              )}
              <div>
                <p className={`font-semibold ${
                  importStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importStatus.message}
                </p>
                {importStatus.rowsProcessed && (
                  <div className="text-sm text-green-700 space-y-1 mt-2">
                    <p>✅ Exitosos: {importStatus.rowsProcessed}</p>
                    <p>📊 Total procesados: {importStatus.totalRows}</p>
                    {importStatus.failedRows > 0 && (
                      <p>❌ Fallidos: {importStatus.failedRows}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selección de Bolsa */}
          {file && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📋 Selecciona la Bolsa de Pacientes:
              </label>
              {loadingTipos ? (
                <div className="text-gray-600">Cargando bolsas disponibles...</div>
              ) : tiposBolsas.length > 0 ? (
                <select
                  value={tipoBolesaId || ''}
                  onChange={(e) => setTipoBolesaId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Selecciona una bolsa --</option>
                  {tiposBolsas.map((bolsa) => (
                    <option key={bolsa.idBolsa} value={bolsa.idBolsa}>
                      {bolsa.nombreBolsa} {bolsa.especialidadNombre ? `(${bolsa.especialidadNombre})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-red-600">No hay bolsas disponibles</div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-4">
            <button
              onClick={handleImport}
              disabled={!file || !tipoBolesaId || isLoading}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                file && tipoBolesaId && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Importar
                </>
              )}
            </button>
            <button
              onClick={() => {
                setFile(null);
                setTipoBolesaId(null);
                setImportStatus(null);
              }}
              className="py-3 px-6 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>

          {/* Información de ayuda */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Formato esperado:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Primera fila: encabezados (DNI, Nombres, Apellidos, Fecha Nacimiento...)</li>
              <li>• Soporta formatos: .xlsx, .xls, .csv</li>
              <li>• Máximo 10,000 registros por archivo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
