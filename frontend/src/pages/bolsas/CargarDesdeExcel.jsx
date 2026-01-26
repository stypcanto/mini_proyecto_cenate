import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, FileText, Loader, Download, Info, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bolsasService from '../../services/bolsasService';
import * as XLSX from 'xlsx';

/**
 * 📁 CargarDesdeExcel - Importación de Bolsas desde archivos Excel v1.8.0 (PLANTILLA COMPLETA)
 * Permitir carga masiva de bolsas desde archivos Excel/CSV con estructura completa
 *
 * Características:
 * - Plantilla COMPLETA: 10 campos requeridos (DNI, Tipo Documento, Asegurado, Sexo, Tipo Cita, etc.)
 * - Auto-cálculo: EDAD se calcula automáticamente desde FECHA DE NACIMIENTO
 * - Tipo Cita: Recita, Interconsulta, Voluntaria
 * - Carga de archivos Excel (.xlsx, .xls, .csv)
 * - Validación de formato y estructura
 * - Descarga de plantilla Excel de ejemplo
 * - Información clara de campos requeridos
 * - Validaciones en tiempo real
 * - Integración con dim_estados_gestion_citas (PENDIENTE_CITA inicial)
 */
export default function CargarDesdeExcel() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [preview, setPreview] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [tipoBolesaId, setTipoBolesaId] = useState(null);
  const [idServicio, setIdServicio] = useState(null);
  const [tiposBolsas, setTiposBolsas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [loadingServicios, setLoadingServicios] = useState(true);

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
    } else {
      // Si no hay usuario en localStorage, usar usuario por defecto
      setUsuario({ username: 'admin', id: 1 });
    }

    // Obtener tipos de bolsas disponibles
    const obtenerTiposBolsasDisponibles = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/admin/tipos-bolsas/todos');
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const datos = await response.json();
        console.log('📋 Tipos de bolsas:', datos);
        setTiposBolsas(datos || []);
      } catch (error) {
        console.error('Error tipos bolsas:', error);
        setTiposBolsas([]);
      } finally {
        setLoadingTipos(false);
      }
    };

    // Obtener servicios/especialidades disponibles
    const obtenerServicios = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/dim/servicios-essi');
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const datos = await response.json();
        console.log('📋 Servicios disponibles:', datos);
        setServicios(datos || []);
        // Seleccionar el primer servicio por defecto
        if (datos && datos.length > 0) {
          setIdServicio(datos[0].idServicio);
        }
      } catch (error) {
        console.error('Error servicios:', error);
        setServicios([]);
      } finally {
        setLoadingServicios(false);
      }
    };

    obtenerTiposBolsasDisponibles();
    obtenerServicios();
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
    if (!file || !usuario || !tipoBolesaId || !idServicio) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('idTipoBolsa', tipoBolesaId);
      formData.append('idServicio', idServicio); // Usar el servicio seleccionado
      formData.append('usuarioCarga', usuario.username || 'admin');

      // Log para debugging
      console.log('📤 Enviando importación:', {
        archivo: file.name,
        idTipoBolsa: tipoBolesaId,
        idServicio: 1,
        usuarioCarga: usuario.username,
        tamaño: file.size
      });

      // Usar el servicio correcto para importar solicitudes desde Excel
      const resultado = await bolsasService.importarSolicitudesDesdeExcel(formData);

      console.log('✅ Respuesta del servidor:', resultado);

      setImportStatus({
        type: 'success',
        message: resultado.mensaje || 'Archivo importado correctamente',
        rowsProcessed: resultado.filasOk,
        totalRows: resultado.filasOk + resultado.filasError,
        failedRows: resultado.filasError
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

  // Función para descargar plantilla Excel (COMPLETA)
  const descargarPlantilla = () => {
    const datosPlantilla = [
      {
        'FECHA PREFERIDA QUE NO FUE ATENDIDA': '2025-12-15',
        'TIPO DOCUMENTO': 'DNI',
        'DNI': '12345678',
        'ASEGURADO': 'Juan Pérez García',
        'SEXO': 'M',
        'FECHA DE NACIMIENTO': '1980-05-20',
        'TELÉFONO': '987654321',
        'CORREO': 'juan.perez@email.com',
        'COD. IPRESS ADSCRIPCIÓN': '349',
        'TIPO CITA': 'Recita'
      },
      {
        'FECHA PREFERIDA QUE NO FUE ATENDIDA': '2025-12-10',
        'TIPO DOCUMENTO': 'DNI',
        'DNI': '87654321',
        'ASEGURADO': 'María López Rodríguez',
        'SEXO': 'F',
        'FECHA DE NACIMIENTO': '1985-08-15',
        'TELÉFONO': '987654322',
        'CORREO': 'maria.lopez@email.com',
        'COD. IPRESS ADSCRIPCIÓN': '350',
        'TIPO CITA': 'Interconsulta'
      },
      {
        'FECHA PREFERIDA QUE NO FUE ATENDIDA': '2025-12-12',
        'TIPO DOCUMENTO': 'DNI',
        'DNI': '11223344',
        'ASEGURADO': 'Carlos Gómez Ruiz',
        'SEXO': 'M',
        'FECHA DE NACIMIENTO': '1990-03-10',
        'TELÉFONO': '987654323',
        'CORREO': 'carlos.gomez@email.com',
        'COD. IPRESS ADSCRIPCIÓN': '351',
        'TIPO CITA': 'Voluntaria'
      },
      {
        'FECHA PREFERIDA QUE NO FUE ATENDIDA': '2025-12-08',
        'TIPO DOCUMENTO': 'DNI',
        'DNI': '44556677',
        'ASEGURADO': 'Patricia Sánchez Ruiz',
        'SEXO': 'F',
        'FECHA DE NACIMIENTO': '1975-11-30',
        'TELÉFONO': '987654324',
        'CORREO': 'patricia.sanchez@email.com',
        'COD. IPRESS ADSCRIPCIÓN': '349',
        'TIPO CITA': 'Recita'
      },
      {
        'FECHA PREFERIDA QUE NO FUE ATENDIDA': '2025-12-20',
        'TIPO DOCUMENTO': 'DNI',
        'DNI': '88990011',
        'ASEGURADO': 'Roberto Morales Torres',
        'SEXO': 'M',
        'FECHA DE NACIMIENTO': '1995-07-05',
        'TELÉFONO': '987654325',
        'CORREO': 'roberto.morales@email.com',
        'COD. IPRESS ADSCRIPCIÓN': '350',
        'TIPO CITA': 'Interconsulta'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(datosPlantilla);
    ws['!cols'] = [
      { wch: 28 },   // FECHA PREFERIDA QUE NO FUE ATENDIDA
      { wch: 15 },   // TIPO DOCUMENTO
      { wch: 12 },   // DNI
      { wch: 30 },   // ASEGURADO
      { wch: 8 },    // SEXO
      { wch: 20 },   // FECHA DE NACIMIENTO
      { wch: 15 },   // TELÉFONO
      { wch: 25 },   // CORREO
      { wch: 20 },   // COD. IPRESS ADSCRIPCIÓN
      { wch: 18 }    // TIPO CITA
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'PLANTILLA_SOLICITUD_BOLSA_COMPLETA_v1.8.0.xlsx');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="w-full">
        {/* Header Mejorado */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 text-white p-3 rounded-lg">
              <Upload size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Cargar Solicitudes desde Excel</h1>
              <p className="text-gray-600 mt-1">Importa masivamente pacientes a bolsas de atención</p>
            </div>
          </div>
        </div>

        {/* Grid: Información + Carga */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Columna Izquierda: Información */}
          <div className="lg:col-span-2">
            {/* Card: Campos Obligatorios */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-600">
              <div className="flex items-center gap-2 mb-4">
                <Info size={24} className="text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Campos Obligatorios (10 campos)</h2>
              </div>
              <div className="space-y-3">
                <div className="flex gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">📅</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">1. FECHA PREFERIDA QUE NO FUE ATENDIDA</p>
                    <p className="text-sm text-gray-600">Fecha en que debería haber sido atendido</p>
                    <p className="text-xs text-blue-600 mt-1">Formato: YYYY-MM-DD | Ej: 2025-12-15</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">📄</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">2. TIPO DOCUMENTO</p>
                    <p className="text-sm text-gray-600">Tipo de documento de identidad</p>
                    <p className="text-xs text-blue-600 mt-1">Ej: DNI, RUC, PASAPORTE</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">🆔</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">3. DNI</p>
                    <p className="text-sm text-gray-600">Número único del paciente</p>
                    <p className="text-xs text-blue-600 mt-1">Ej: 12345678 (8 dígitos exactos)</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">👤</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">4. ASEGURADO</p>
                    <p className="text-sm text-gray-600">Nombres completos del paciente</p>
                    <p className="text-xs text-blue-600 mt-1">Ej: Juan Pérez García</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">⚧</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">5. SEXO</p>
                    <p className="text-sm text-gray-600">Género del paciente</p>
                    <p className="text-xs text-blue-600 mt-1">Ej: M (Masculino) | F (Femenino)</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">🎂</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">6. FECHA DE NACIMIENTO</p>
                    <p className="text-sm text-gray-600">Fecha de nacimiento (la edad se calcula automáticamente)</p>
                    <p className="text-xs text-blue-600 mt-1">Formato: YYYY-MM-DD | Ej: 1980-05-20</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">📱</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">7. TELÉFONO</p>
                    <p className="text-sm text-gray-600">Número de teléfono de contacto</p>
                    <p className="text-xs text-blue-600 mt-1">Ej: 987654321</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">📧</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">8. CORREO</p>
                    <p className="text-sm text-gray-600">Dirección de correo electrónico</p>
                    <p className="text-xs text-blue-600 mt-1">Ej: juan.perez@email.com</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">🏥</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">9. COD. IPRESS ADSCRIPCIÓN</p>
                    <p className="text-sm text-gray-600">Código de la IPRESS donde está adscrito el paciente</p>
                    <p className="text-xs text-blue-600 mt-1">Ej: 349 (H.II PUCALLPA), 350, 351...</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl">🔖</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">10. TIPO CITA</p>
                    <p className="text-sm text-gray-600">Clasificación del tipo de atención solicitada</p>
                    <p className="text-xs text-green-600 mt-1">Valores válidos: Recita | Interconsulta | Voluntaria</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Auto-Cálculos */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
              <div className="flex items-center gap-2 mb-4">
                <Eye size={24} className="text-amber-600" />
                <h2 className="text-xl font-bold text-gray-800">Campos Auto-Calculados</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">El sistema calcula automáticamente los siguientes campos:</p>
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="font-semibold text-gray-800">EDAD</p>
                  <p className="text-xs text-gray-600 mt-1">Se calcula automáticamente a partir de FECHA DE NACIMIENTO</p>
                  <p className="text-xs text-amber-600 mt-1">Ej: Si nació el 1980-05-20, la edad será 44 años (en 2025)</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">✅ Ventaja:</span> No necesitas incluir la columna EDAD en tu Excel. El sistema la calcula automáticamente desde la fecha de nacimiento.
                </p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Acciones */}
          <div>
            {/* Card: Descarga Plantilla */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border-2 border-green-400 mb-6">
              <div className="text-center">
                <Download size={40} className="text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Obtén la Plantilla</h3>
                <p className="text-sm text-gray-700 mb-4">Descarga un archivo Excel de ejemplo con la estructura correcta</p>
                <button
                  onClick={descargarPlantilla}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Descargar Plantilla
                </button>
              </div>
            </div>

            {/* Card: Requisitos */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">📋 Requisitos</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-gray-700">Formato: .xlsx, .xls o .csv</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-gray-700">Máximo 10,000 registros</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-gray-700">Primera fila = encabezados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-gray-700">10 campos obligatorios completados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-gray-700">DNI: 8 dígitos exactos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-gray-700">TIPO CITA: Recita, Interconsulta o Voluntaria</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Zona de Carga Principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Zona de drop */}
          <div className="border-3 border-dashed border-blue-300 rounded-2xl p-12 text-center bg-gradient-to-br from-blue-50 to-indigo-50 mb-8 cursor-pointer hover:bg-blue-100 hover:border-blue-400 transition-all">
            <Upload size={56} className="mx-auto text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Arrastra tu archivo aquí
            </h3>
            <p className="text-gray-600 mb-6">O haz clic para seleccionar un archivo</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold cursor-pointer shadow-lg transition-all"
            >
              Seleccionar Archivo
            </label>
          </div>

          {/* Información del archivo seleccionado */}
          {file && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 mb-6 flex items-center gap-4">
              <CheckCircle className="text-green-600 flex-shrink-0" size={40} />
              <div className="flex-1">
                <p className="font-semibold text-green-800 text-lg">{file.name}</p>
                <p className="text-sm text-green-700">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setTipoBolesaId(null);
                  setImportStatus(null);
                }}
                className="text-green-600 hover:text-green-800 font-semibold"
              >
                Cambiar
              </button>
            </div>
          )}

          {/* Estado de la importación */}
          {importStatus && (
            <div className={`rounded-xl p-6 mb-6 border-2 ${
              importStatus.type === 'success'
                ? 'bg-green-50 border-green-400'
                : 'bg-red-50 border-red-400'
            }`}>
              <div className="flex items-start gap-4">
                {importStatus.type === 'success' ? (
                  <CheckCircle className="text-green-600 flex-shrink-0" size={40} />
                ) : (
                  <AlertCircle className="text-red-600 flex-shrink-0" size={40} />
                )}
                <div className="flex-1">
                  <p className={`text-lg font-bold ${
                    importStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {importStatus.message}
                  </p>
                  {importStatus.rowsProcessed && (
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-green-700 font-semibold">✅ Registros Exitosos: {importStatus.rowsProcessed}</p>
                      <p className="text-gray-700">📊 Total Procesados: {importStatus.totalRows}</p>
                      {importStatus.failedRows > 0 && (
                        <p className="text-red-700">❌ Registros Fallidos: {importStatus.failedRows}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Selección de Tipo de Bolsa */}
          {file && (!importStatus || importStatus.type !== 'success') && (
            <div className="mb-6 p-6 bg-yellow-50 rounded-xl border-2 border-yellow-300">
              <label className="block text-sm font-bold text-gray-800 mb-4">
                📦 PASO 1: Selecciona el Tipo de Bolsa
              </label>
              {loadingTipos ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader className="animate-spin" size={20} />
                  Cargando tipos de bolsas...
                </div>
              ) : tiposBolsas.length > 0 ? (
                <select
                  value={tipoBolesaId || ''}
                  onChange={(e) => setTipoBolesaId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-800 font-semibold"
                >
                  <option value="">-- Selecciona un tipo de bolsa --</option>
                  {tiposBolsas.map((tipo) => (
                    <option key={tipo.idTipoBolsa} value={tipo.idTipoBolsa}>
                      {tipo.codTipoBolsa} - {tipo.descTipoBolsa}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-red-600 font-semibold">No hay tipos de bolsas disponibles</div>
              )}
            </div>
          )}

          {/* Selección de Especialidad/Servicio */}
          {file && (!importStatus || importStatus.type !== 'success') && (
            <div className="mb-6 p-6 bg-blue-50 rounded-xl border-2 border-blue-300">
              <label className="block text-sm font-bold text-gray-800 mb-4">
                🏥 PASO 2: Selecciona la Especialidad/Servicio
              </label>
              {loadingServicios ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader className="animate-spin" size={20} />
                  Cargando especialidades...
                </div>
              ) : servicios.length > 0 ? (
                <select
                  value={idServicio || ''}
                  onChange={(e) => setIdServicio(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 font-semibold"
                >
                  <option value="">-- Selecciona una especialidad --</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.idServicio} value={servicio.idServicio}>
                      {servicio.codServicio || servicio.idServicio} - {servicio.descServicio}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-red-600 font-semibold">No hay especialidades disponibles</div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          {file && (
            <div className="flex gap-4">
              <button
                onClick={handleImport}
                disabled={!file || !tipoBolesaId || !idServicio || isLoading}
                className={`flex-1 py-4 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-lg ${
                  file && tipoBolesaId && idServicio && !isLoading
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader size={24} className="animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload size={24} />
                    IMPORTAR SOLICITUDES
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setTipoBolesaId(null);
                  setIdServicio(null);
                  setImportStatus(null);
                }}
                className="py-4 px-8 rounded-lg font-bold bg-gray-300 text-gray-800 hover:bg-gray-400 transition-all"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Información de Estado Inicial */}
        <div className="bg-indigo-50 rounded-xl shadow-lg p-6 border-l-4 border-indigo-600 mb-6">
          <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
            <Info size={20} />
            Estado Inicial de la Solicitud
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg border border-indigo-200">
              <p className="font-semibold text-gray-800">Estado de Cita:</p>
              <p className="text-indigo-700 font-bold text-lg">PENDIENTE_CITA</p>
              <p className="text-xs text-gray-600 mt-1">Solicitud pendiente de asignación a gestor</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-indigo-200">
              <p className="font-semibold text-gray-800">Próximo Paso:</p>
              <p className="text-indigo-700">Asignar a Gestor de Citas</p>
              <p className="text-xs text-gray-600 mt-1">Desde módulo Coordinador → Gestión Citas</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">❓ Preguntas Frecuentes</h3>
          <div className="space-y-4 text-sm">
            <div className="border-b pb-4">
              <p className="font-semibold text-gray-800">¿Necesito incluir la columna EDAD?</p>
              <p className="text-gray-600 mt-1">No. La EDAD se calcula automáticamente a partir de FECHA DE NACIMIENTO. No incluyas esta columna en tu Excel.</p>
            </div>
            <div className="border-b pb-4">
              <p className="font-semibold text-gray-800">¿Cuál es el formato correcto para las fechas?</p>
              <p className="text-gray-600 mt-1">Usa formato ISO: YYYY-MM-DD (Ej: 2025-12-15 para 15 de diciembre de 2025). Excel convertirá automáticamente fechas a este formato.</p>
            </div>
            <div className="border-b pb-4">
              <p className="font-semibold text-gray-800">¿Qué valores son válidos para SEXO?</p>
              <p className="text-gray-600 mt-1">Usa: <strong>M</strong> para Masculino o <strong>F</strong> para Femenino. El sistema es sensible a mayúsculas.</p>
            </div>
            <div className="border-b pb-4">
              <p className="font-semibold text-gray-800">¿Qué valores son válidos para TIPO CITA?</p>
              <p className="text-gray-600 mt-1">Usa uno de estos tres valores: <strong>Recita</strong>, <strong>Interconsulta</strong> o <strong>Voluntaria</strong>. El sistema es sensible a mayúsculas.</p>
            </div>
            <div className="border-b pb-4">
              <p className="font-semibold text-gray-800">¿Qué pasa si el DNI o Código Adscripción no existen?</p>
              <p className="text-gray-600 mt-1">El registro será rechazado con un mensaje de error indicando el problema específico para que puedas corregirlo.</p>
            </div>
            <div className="border-b pb-4">
              <p className="font-semibold text-gray-800">¿Se pueden importar registros duplicados?</p>
              <p className="text-gray-600 mt-1">No. El sistema valida y rechaza duplicados por la combinación única: (DNI + Tipo de Bolsa).</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">¿Debo llenar todos los 10 campos?</p>
              <p className="text-gray-600 mt-1">Sí. Todos los 10 campos son obligatorios. Descarga la plantilla para ver la estructura exacta que espera el sistema.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
