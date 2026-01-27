import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, FileText, Loader, Download, Info, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bolsasService from '../../services/bolsasService';
import * as XLSX from 'xlsx';

/**
 * 📁 CargarDesdeExcel - Importación de Bolsas desde archivos Excel v1.13.8 (AUTO-DETECCIÓN INTELIGENTE + AUTO-CREACIÓN ASEGURADOS)
 * Permitir carga masiva de bolsas desde archivos Excel/CSV con estructura completa y validación inteligente
 *
 * 🧠 INTELIGENCIA COMPLETA:
 *
 * 1️⃣ VALIDACIÓN SIN HEADERS
 *    - Detecta si el Excel tiene headers o no
 *    - Analiza la estructura por POSICIÓN de columnas (orden fijo)
 *    - Valida incluso si faltan los títulos (solo analiza los datos)
 *    - Si hay headers genéricos/vacíos, los ignora y valida por posición
 *
 * 2️⃣ ANÁLISIS DE VIABILIDAD
 *    - Verifica cada columna por su tipo de dato esperado:
 *      • Fechas (YYYY-MM-DD)
 *      • Documentos (DNI, RUC, etc.)
 *      • Números de identificación (8+ dígitos)
 *      • Correos (formato válido)
 *      • IPRESS (código numérico)
 *      • Tipos cita (Recita, Interconsulta, Voluntaria)
 *    - Calcula porcentaje de viabilidad (≥70% = viable)
 *    - Muestra feedback detallado al usuario
 *
 * 3️⃣ AUTO-SELECCIÓN INTELIGENTE (v1.11.0)
 *    - Auto-selecciona tipo de bolsa por nombre de archivo
 *    - Auto-selecciona especialidad/servicio matching con bolsa
 *    - Ej: "BOLSA OTORRINO 26012026.xlsx" → auto-selecciona:
 *         • Tipo de bolsa: "BOLSAS_OTORRINO" (coincidencia exacta)
 *         • Especialidad: "Otorrinolaringología" (coincidencia fuzzy)
 *    - Usa similitud fuzzy para encontrar mejores coincidencias
 *    - Umbral de similitud: 40% para aceptar coincidencia
 *
 * 4️⃣ ESTRUCTURA
 *    - 10 campos en ORDEN FIJO (posiciones no cambian)
 *    - Columna 0: FECHA PREFERIDA (YYYY-MM-DD) [OBLIGATORIO]
 *    - Columna 1: TIPO DOCUMENTO (DNI, RUC, etc.) [OBLIGATORIO]
 *    - Columna 2: DNI (8 dígitos) [OBLIGATORIO]
 *    - Columna 3: ASEGURADO (nombre) [OBLIGATORIO]
 *    - Columna 4: SEXO (M/F) [OPCIONAL - se llena desde BD si falta]
 *    - Columna 5: FECHA NACIMIENTO (YYYY-MM-DD) [OPCIONAL - se llena desde BD si falta]
 *    - Columna 6: TELÉFONO (números) [OPCIONAL - se llena desde BD si falta]
 *    - Columna 7: CORREO (email) [OPCIONAL - se llena desde BD si falta]
 *    - Columna 8: COD. IPRESS (números) [OBLIGATORIO]
 *    - Columna 9: TIPO CITA (Recita, Interconsulta, Voluntaria) [OBLIGATORIO]
 *
 *    💡 IMPORTANTE: Si el Asegurado (DNI) no existe en el sistema, será creado automáticamente (v1.13.8)
 *
 * Características adicionales:
 * - Descarga de plantilla Excel de ejemplo
 * - Auto-cálculo: EDAD desde FECHA DE NACIMIENTO
 * - Validaciones en tiempo real (antes de enviar al servidor)
 * - Integración con dim_estados_gestion_citas (PENDIENTE_CITA inicial)
 * - Inteligencia fuzzy matching para auto-detección mejorada
 * - AUTO-CREACIÓN de Asegurados (v1.13.8) si no existen en el sistema
 * - Enriquecimiento automático desde dim_asegurados (teléfono, correo, sexo)
 * - Datos opcionales se completan desde BD si faltan en Excel
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
  const [isDragging, setIsDragging] = useState(false);
  const [expandedObligatorios, setExpandedObligatorios] = useState(false);
  const [expandedAutoCalculados, setExpandedAutoCalculados] = useState(false);
  const [expandedRequisitos, setExpandedRequisitos] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(false);
  const [archivoAutomatico, setArchivoAutomatico] = useState(null);
  const [buscandoArchivo, setBuscandoArchivo] = useState(false);

  // Obtener token y usuario del localStorage
  const token = localStorage.getItem('token');

  // ============================================================================
  // 🧠 FUNCIÓN: Validar estructura del Excel (incluso sin headers)
  // ============================================================================
  const validarEstructuraExcel = (listaData) => {
    /**
     * Valida si un archivo Excel tiene la estructura correcta para bolsas.
     * Analiza el contenido de las columnas para detectar tipos de datos.
     *
     * Estructura esperada v1.13.8: 10 columnas en este orden:
     * 0: FECHA PREFERIDA (YYYY-MM-DD) [OBLIGATORIO]
     * 1: TIPO DOCUMENTO (DNI, RUC, etc.) [OBLIGATORIO]
     * 2: DNI (8 dígitos) [OBLIGATORIO]
     * 3: ASEGURADO (texto) [OBLIGATORIO]
     * 4: SEXO (M/F) [OPCIONAL]
     * 5: FECHA NACIMIENTO (YYYY-MM-DD) [OPCIONAL]
     * 6: TELÉFONO (números) [OPCIONAL]
     * 7: CORREO (email) [OPCIONAL]
     * 8: COD. IPRESS (números) [OBLIGATORIO]
     * 9: TIPO CITA (Recita, Interconsulta, Voluntaria) [OBLIGATORIO]
     */

    if (!listaData || listaData.length === 0) {
      return { valido: false, error: 'El archivo está vacío' };
    }

    const primeraFila = listaData[0];
    if (!primeraFila) {
      return { valido: false, error: 'No hay datos en el archivo' };
    }

    const valores = Object.values(primeraFila);
    console.log('📊 Primera fila del Excel:', primeraFila);
    console.log('📊 Valores:', valores);

    // Análisis de estructura (buscar patrones en los datos)
    let analisis = {
      tieneEnlaces: false,      // Detecta si parece ser header (palabras como FECHA, DNI)
      tieneDatos: false,        // Detecta si tiene valores reales
      columnasConDatos: 0,
      columnasDetectadas: []
    };

    // Revisar cada columna para detectar patrones
    valores.forEach((valor, idx) => {
      if (!valor || valor === '') return;

      const strValor = valor.toString().toUpperCase().trim();

      // Detectar si es un header (contiene palabras clave)
      if (strValor.includes('FECHA') || strValor.includes('TIPO') || strValor.includes('DNI') ||
          strValor.includes('ASEGURADO') || strValor.includes('SEXO') || strValor.includes('IPRESS') ||
          strValor.includes('CORREO') || strValor.includes('CITA')) {
        analisis.tieneEnlaces = true;
      }

      // Detectar datos reales
      if (strValor.length > 0 && !strValor.includes('PREFERIDA')) {
        analisis.tieneDatos = true;
        analisis.columnasConDatos++;
      }
    });

    // Si la primera fila parece ser un header, analizar la segunda fila
    let filaAnalisis = primeraFila;
    if (analisis.tieneEnlaces && listaData.length > 1) {
      console.log('ℹ️ Detectada fila de headers, analizando segunda fila para validar datos...');
      filaAnalisis = listaData[1];
    }

    const valoresAnalisis = Object.values(filaAnalisis);

    // Validar estructura esperada (10 columnas mínimo)
    if (valoresAnalisis.length < 10) {
      return {
        valido: false,
        error: `Se detectaron solo ${valoresAnalisis.length} columnas, se esperan al menos 10`
      };
    }

    // Validaciones por columna esperada
    const validaciones = {
      col0_fecha: /^\d{4}-\d{2}-\d{2}|^\d{1,2}\/\d{1,2}\/\d{4}/.test(valoresAnalisis[0]?.toString() || ''),
      col1_tipoDoc: /^[A-Za-z]+/.test(valoresAnalisis[1]?.toString() || ''),
      col2_dni: /^\d{6,10}/.test(valoresAnalisis[2]?.toString() || ''),
      col3_nombre: valoresAnalisis[3]?.toString().length > 3,
      col4_sexo: /^[MF]$/i.test(valoresAnalisis[4]?.toString() || ''),
      col5_fechaNac: /^\d{4}-\d{2}-\d{2}|^\d{1,2}\/\d{1,2}\/\d{4}/.test(valoresAnalisis[5]?.toString() || ''),
      col6_telefono: /^\d{6,15}/.test(valoresAnalisis[6]?.toString() || ''),
      col7_correo: /^[^\s@]+@[^\s@]+\.[^\s@]+/.test(valoresAnalisis[7]?.toString() || '') || valoresAnalisis[7]?.toString() === '',
      col8_ipress: /^\d{2,4}/.test(valoresAnalisis[8]?.toString() || ''),
      col9_tipoCita: /^(Recita|Interconsulta|Voluntaria)/i.test(valoresAnalisis[9]?.toString() || '')
    };

    console.log('✅ Validaciones por columna:', validaciones);

    // Contar validaciones exitosas
    const validacionesExitosas = Object.values(validaciones).filter(v => v).length;
    const porcentajeValido = (validacionesExitosas / 10) * 100;

    // Decisión: viable si al menos 7 de 10 columnas son válidas
    const esViable = porcentajeValido >= 70;

    return {
      valido: esViable,
      porcentaje: Math.round(porcentajeValido),
      validaciones,
      analisis,
      detalles: {
        columnasValidas: validacionesExitosas,
        columnasEsperadas: 10,
        tieneHeaders: analisis.tieneEnlaces,
        tieneData: analisis.tieneDatos
      },
      recomendacion: esViable
        ? `✅ Estructura válida (${Math.round(porcentajeValido)}% de coincidencia)`
        : `❌ Estructura inválida (${Math.round(porcentajeValido)}% de coincidencia). Se esperan 10 columnas en el orden: Fecha, Tipo Doc, DNI, Asegurado, Sexo, Fecha Nac, Teléfono, Correo, Código IPRESS, Tipo Cita`
    };
  };

  // ============================================================================
  // 🧠 FUNCIÓN: Inteligencia - Detectar columnas automáticamente
  // ============================================================================
  const detectarColumnasInteligentemente = (headers) => {
    /**
     * Detecta índices de columnas incluso si los headers varían.
     * Estrategia: Buscar patterns en el texto del header (case-insensitive)
     */
    const headerMap = headers.map(h => h.toString().toUpperCase().trim());

    const columnIndices = {
      fechaPreferida: headerMap.findIndex(h => h.includes('FECHA') && h.includes('PREFERIDA')),
      tipoDocumento: headerMap.findIndex(h => h.includes('TIPO') && h.includes('DOCUMENTO')),
      dni: headerMap.findIndex(h => h === 'DNI' || h === 'DOCUMENTO'),
      asegurado: headerMap.findIndex(h => h.includes('ASEGURADO') || h.includes('PACIENTE') || h.includes('NOMBRE')),
      sexo: headerMap.findIndex(h => h.includes('SEXO') || h === 'GÉNERO'),
      fechaNacimiento: headerMap.findIndex(h => h.includes('NACIMIENTO') || h.includes('FECHA')),
      telefono: headerMap.findIndex(h => h.includes('TELÉFONO') || h.includes('TELEFONO') || h.includes('CELULAR')),
      correo: headerMap.findIndex(h => h.includes('CORREO') || h.includes('EMAIL') || h.includes('MAIL')),
      codigoIpress: headerMap.findIndex(h => h.includes('IPRESS') || h.includes('CÓDIGO') || h.includes('COD.')),
      tipoCita: headerMap.findIndex(h => h.includes('TIPO') && h.includes('CITA'))
    };

    console.log('🧠 Índices detectados:', columnIndices);
    return columnIndices;
  };

  // ============================================================================
  // 🧠 FUNCIÓN: Extraer palabras clave del nombre de archivo
  // ============================================================================
  const extraerTipoBolsaDelNombre = (nombreArchivo) => {
    /**
     * Extrae palabras clave del nombre del archivo.
     * Ej: "BOLSA OTORRINO EXPLOTADOS 26012026.xlsx" → retorna {primera: "OTORRINO", palabras: ["OTORRINO", "EXPLOTADOS"]}
     * Cada palabra se puede usar para matchear bolsas y servicios diferentes
     */
    let texto = nombreArchivo
      .toUpperCase()
      .replace(/BOLSA\s+/i, '')  // Quitar "BOLSA"
      .replace(/[0-9]{8}\./g, '') // Quitar fecha (ej: 26012026.)
      .replace(/\.xlsx?$/i, '')    // Quitar extensión
      .trim();

    // Dividir en palabras individuales
    const palabras = texto.split(/[\s\-_]+/).filter(p => p.length > 2);

    console.log('🧠 Palabras clave extraídas:', palabras);

    // Retornar la primera palabra para bolsa, y todas las palabras disponibles
    return {
      primera: palabras[0] || '',
      palabras: palabras,
      todas: texto
    };
  };

  // ============================================================================
  // 🧠 FUNCIÓN: Auto-seleccionar bolsa por nombre
  // ============================================================================
  const autoSeleccionarBolsa = (bolsas, nombreArchivo) => {
    const keywordData = extraerTipoBolsaDelNombre(nombreArchivo);
    const palabraClave = keywordData.primera;

    // Buscar por palabra clave principal (usualmente la primera palabra)
    const bolsaCoincidencia = bolsas.find(b => {
      const descUpper = b.descTipoBolsa.toUpperCase();
      const codUpper = b.codTipoBolsa?.toUpperCase() || '';

      // Buscar coincidencia exacta en descripción o código
      return descUpper.includes(palabraClave) || codUpper.includes(palabraClave);
    });

    console.log('🧠 Bolsa seleccionada:', bolsaCoincidencia?.descTipoBolsa);
    return bolsaCoincidencia?.idTipoBolsa || null;
  };

  // ============================================================================
  // 🧠 FUNCIÓN: Calcula similitud entre dos strings (distancia de Levenshtein simplificada)
  // ============================================================================
  const calcularSimilitud = (str1, str2) => {
    /**
     * Calcula porcentaje de similitud entre dos strings
     * Retorna número entre 0 y 1 (0 = no similar, 1 = idéntico)
     */
    const s1 = str1.toUpperCase();
    const s2 = str2.toUpperCase();

    if (s1 === s2) return 1;
    if (!s1 || !s2) return 0;

    // Contar palabras en común
    const palabras1 = s1.split(/[\s\-_]+/).filter(p => p.length > 2);
    const palabras2 = s2.split(/[\s\-_]+/).filter(p => p.length > 2);

    if (palabras1.length === 0 || palabras2.length === 0) return 0;

    const palabrasComunes = palabras1.filter(p1 =>
      palabras2.some(p2 => p2.includes(p1) || p1.includes(p2))
    ).length;

    return palabrasComunes / Math.max(palabras1.length, palabras2.length);
  };

  // ============================================================================
  // 🧠 FUNCIÓN: Auto-seleccionar servicio/especialidad por nombre
  // ============================================================================
  const autoSeleccionarServicio = (servicios, nombreArchivo) => {
    /**
     * Busca el servicio que mejor coincida con palabras clave del nombre del archivo
     * Ej: archivo "BOLSA OTORRINO EXPLOTADOS" → busca palabras como "EXPLOTADOS"
     * Intenta cada palabra extraída hasta encontrar una coincidencia
     */
    if (!servicios || servicios.length === 0 || !nombreArchivo) {
      return null;
    }

    const keywordData = extraerTipoBolsaDelNombre(nombreArchivo);
    const palabras = keywordData.palabras;

    // Intentar buscar cada palabra extraída
    for (let palabraClave of palabras) {
      // Primero intenta coincidencia exacta
      const coincidenciaExacta = servicios.find(s => {
        const descUpper = s.descServicio?.toUpperCase() || '';
        const codUpper = s.codServicio?.toUpperCase() || '';

        return descUpper.includes(palabraClave) || codUpper.includes(palabraClave);
      });

      if (coincidenciaExacta) {
        console.log(`✅ Servicio encontrado por palabra clave "${palabraClave}": ${coincidenciaExacta.descServicio}`);
        return coincidenciaExacta.idServicio;
      }

      // Si no hay coincidencia exacta, usa similitud fuzzy
      let mejorCoincidencia = null;
      let mejorSimilitud = 0;

      servicios.forEach(servicio => {
        const similitud = calcularSimilitud(palabraClave, servicio.descServicio);
        if (similitud > mejorSimilitud) {
          mejorSimilitud = similitud;
          mejorCoincidencia = servicio;
        }
      });

      // Si la similitud es al menos 0.4 (40%), usar este servicio
      if (mejorSimilitud >= 0.4) {
        console.log(`✅ Servicio encontrado por similitud (${(mejorSimilitud * 100).toFixed(0)}%) con palabra "${palabraClave}": ${mejorCoincidencia?.descServicio}`);
        return mejorCoincidencia?.idServicio;
      }
    }

    console.log('⚠️ No se encontró servicio que coincida con:', palabras);
    return null;
  };

  // Obtener datos del usuario y tipos de bolsas en el montaje
  useEffect(() => {
    // Obtener usuario desde localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('👤 Usuario de localStorage:', user);
        setUsuario(user);
      } catch (e) {
        console.error('Error al parsear usuario:', e);
        setUsuario({ username: 'admin', id: 1 });
      }
    } else {
      console.warn('⚠️ No se encontró usuario autenticado');
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
        const response = await fetch('http://localhost:8080/api/servicio-essi/activos-cenate');
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const datos = await response.json();
        console.log('📋 Servicios disponibles:', datos);
        setServicios(datos || []);
        // NO seleccionar default aquí - dejar que el usuario elija o que se auto-detecte
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

  const validateFile = (selectedFile) => {
    // Validar que sea archivo válido
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                       'application/vnd.ms-excel',
                       'text/csv'];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setImportStatus({
        type: 'error',
        message: 'Formato de archivo no válido. Use .xlsx, .xls o .csv'
      });
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setImportStatus(null);

      // 🧠 INTELIGENCIA TOTAL: Analizar Excel de forma completa
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target.result);
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

          // Leer todos los datos SIN interpretar como JSON (para soportar excel sin headers)
          const dataRaw = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }); // Devuelve arrays

          // Convertir a formato de objeto con claves numéricas
          const dataJson = dataRaw.map(row => {
            const obj = {};
            row.forEach((val, idx) => {
              obj[idx] = val;
            });
            return obj;
          });

          console.log('📊 Datos crudos del Excel:', dataJson);

          // 🧠 VALIDACIÓN INTELIGENTE: Analizar estructura
          const validacion = validarEstructuraExcel(dataJson);
          console.log('🧠 Resultado validación:', validacion);

          // Mostrar resultado al usuario
          if (validacion.valido) {
            setImportStatus({
              type: 'success',
              message: `✅ ${validacion.recomendacion}. El archivo es viable para cargar.`,
              detalles: validacion.detalles
            });
          } else {
            setImportStatus({
              type: 'warning',
              message: validacion.recomendacion,
              detalles: validacion.detalles
            });
          }

          // 🧠 INTELIGENCIA: Auto-seleccionar tipo de bolsa y especialidad por nombre de archivo
          console.log(`🧠 Intentando auto-selección... tiposBolsas: ${tiposBolsas.length}, servicios: ${servicios.length}`);

          if (tiposBolsas && tiposBolsas.length > 0) {
            console.log('📋 Tipos de bolsas disponibles:', tiposBolsas.map(b => b.descTipoBolsa));
            const bolsaId = autoSeleccionarBolsa(tiposBolsas, selectedFile.name);
            if (bolsaId) {
              setTipoBolesaId(bolsaId);
              console.log('✅ Bolsa auto-seleccionada ID:', bolsaId);
            } else {
              console.log('⚠️ No se encontró bolsa que coincida con el nombre del archivo');
            }
          } else {
            console.warn('⚠️ Catálogo de tipos de bolsas no cargado aún');
          }

          // 🧠 INTELIGENCIA EXTENDIDA: Auto-seleccionar servicio basado en el nombre del archivo
          if (servicios && servicios.length > 0) {
            console.log('📋 Servicios disponibles:', servicios.map(s => s.descServicio));
            const servicioId = autoSeleccionarServicio(servicios, selectedFile.name);
            if (servicioId) {
              setIdServicio(servicioId);
              console.log('✅ Servicio/Especialidad auto-seleccionado ID:', servicioId);
            } else {
              console.log('⚠️ No se encontró servicio que coincida con palabras clave del archivo');
            }
          } else {
            console.warn('⚠️ Catálogo de servicios no cargado aún');
          }
        } catch (error) {
          console.error('❌ Error analizando archivo:', error);
          setImportStatus({
            type: 'error',
            message: '❌ Error al analizar el archivo. Verifica que sea un Excel válido.'
          });
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  // Manejadores de Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      setImportStatus(null);
    }
  };

  const handleImport = async () => {
    if (!file || !usuario || !tipoBolesaId || !idServicio) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('idBolsa', tipoBolesaId);
      formData.append('idServicio', idServicio);

      // Obtener el nombre del usuario - intentar múltiples propiedades
      let nombreUsuario = usuario.username ||
                         usuario.nombre ||
                         usuario.nombreCompleto ||
                         usuario.nombreUsuario ||
                         usuario.name ||
                         usuario.displayName;

      // Si aún no tenemos nombre, intentar desde el JWT token
      if (!nombreUsuario || nombreUsuario === 'admin') {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const decoded = JSON.parse(atob(parts[1]));
              nombreUsuario = decoded.nombre ||
                            decoded.nombreCompleto ||
                            decoded.full_name ||
                            decoded.sub ||
                            nombreUsuario;
              console.log('🔐 Nombre extraído del JWT:', nombreUsuario);
            }
          } catch (e) {
            console.warn('No se pudo decodificar token:', e);
          }
        }
      }

      // Último recurso: usar 'admin'
      if (!nombreUsuario) {
        nombreUsuario = 'admin';
      }

      formData.append('usuarioCarga', nombreUsuario);

      console.log('📤 Enviando importación:', {
        archivo: file.name,
        idBolsa: tipoBolesaId,
        idServicio: idServicio,
        usuarioCarga: nombreUsuario,
        usuarioObj: usuario,
        tamaño: file.size
      });

      const resultado = await bolsasService.importarSolicitudesDesdeExcel(formData);

      console.log('✅ Respuesta del servidor:', resultado);

      setImportStatus({
        type: 'success',
        message: resultado.mensaje || 'Archivo importado correctamente',
        rowsProcessed: resultado.filasOk,
        totalRows: resultado.filasOk + resultado.filasError,
        failedRows: resultado.filasError,
        showModal: true  // Mostrar modal
      });

      console.log('✅ Importación exitosa:', resultado);

      // Esperar 5 segundos antes de redirigir (dar tiempo al usuario para ver el resultado)
      setTimeout(() => {
        setFile(null);
        setTipoBolesaId(null);
        navigate('/bolsas/solicitudes');
      }, 5000);

    } catch (error) {
      console.error('❌ Error en importación:', error);

      // Mapear errores técnicos a mensajes amigables
      let mensajeAmigable = error.message || 'Error al importar archivo';

      if (error.message?.includes('mismo hash') || error.message?.includes('Ya se cargó')) {
        mensajeAmigable = '⚠️ Esta bolsa ya fue cargada anteriormente. Si deseas cargar una nueva versión, modifica el archivo o cambia su nombre.';
      } else if (error.message?.includes('400') || error.message?.includes('validación')) {
        mensajeAmigable = '❌ El archivo no cumple con la estructura requerida. Verifica que tenga los 10 campos obligatorios.';
      } else if (error.message?.includes('500')) {
        mensajeAmigable = '❌ Error interno del servidor. Por favor, intenta nuevamente.';
      } else if (error.message?.includes('token') || error.message?.includes('401')) {
        mensajeAmigable = '❌ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      }

      setImportStatus({
        type: 'error',
        message: mensajeAmigable,
        showModal: true  // Mostrar modal de error
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

  // Modal de resultado
  const ResultModal = () => {
    if (!importStatus || !importStatus.showModal) return null;

    const isSuccess = importStatus.type === 'success';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all ${
          isSuccess ? 'border-4 border-green-500' : 'border-4 border-red-500'
        }`}>
          {/* Icono animado */}
          <div className={`text-6xl mb-4 text-center ${
            isSuccess ? 'animate-bounce' : 'animate-pulse'
          }`}>
            {isSuccess ? '✅' : '❌'}
          </div>

          {/* Título */}
          <h2 className={`text-2xl font-bold text-center mb-4 ${
            isSuccess ? 'text-green-700' : 'text-red-700'
          }`}>
            {isSuccess ? '¡Importación Exitosa!' : 'Error en Importación'}
          </h2>

          {/* Mensaje */}
          <p className="text-center text-gray-700 mb-4 text-lg">
            {importStatus.message}
          </p>

          {/* Estadísticas (si es éxito) */}
          {isSuccess && importStatus.rowsProcessed && (
            <div className="bg-green-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">✅ Éxitosos:</span>
                <span className="text-green-700 text-xl font-bold">{importStatus.rowsProcessed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">📊 Total:</span>
                <span className="text-gray-700 text-xl font-bold">{importStatus.totalRows}</span>
              </div>
              {importStatus.failedRows > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">⚠️ Fallidos:</span>
                  <span className="text-red-600 text-xl font-bold">{importStatus.failedRows}</span>
                </div>
              )}
            </div>
          )}

          {/* Información adicional */}
          <p className={`text-sm text-center mb-6 ${
            isSuccess ? 'text-green-600' : 'text-red-600'
          }`}>
            {isSuccess
              ? '⏱️ Redirigiendo en 5 segundos...'
              : 'Por favor, revisa los datos y vuelve a intentar'
            }
          </p>

          {/* Barra de progreso (solo en éxito) */}
          {isSuccess && (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-green-500 h-full animate-progress" style={{
                animation: 'progress 5s ease-in-out forwards'
              }}></div>
            </div>
          )}

          {/* Botón de cierre */}
          {!isSuccess && (
            <button
              onClick={() => setImportStatus(null)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>

        {/* Estilos para la animación de barra */}
        <style>{`
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      {/* Modal de resultado */}
      <ResultModal />

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
            <div className="bg-white rounded-xl shadow-lg mb-6 border-l-4 border-blue-500">
              <button
                onClick={() => setExpandedObligatorios(!expandedObligatorios)}
                className="w-full p-6 flex items-center justify-between hover:bg-blue-50 transition-colors rounded-t-xl"
              >
                <div className="flex items-center gap-2">
                  <Info size={24} className="text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Campos Obligatorios (10 campos)</h2>
                </div>
                {expandedObligatorios ? (
                  <ChevronUp size={24} className="text-blue-600" />
                ) : (
                  <ChevronDown size={24} className="text-blue-600" />
                )}
              </button>

              {expandedObligatorios && (
              <div className="px-6 pb-6">
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
                <div className="flex gap-4 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-300">
                  <div className="text-2xl">⚧</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">5. SEXO <span className="text-amber-600 text-xs">(OPCIONAL)</span></p>
                    <p className="text-sm text-gray-600">Género del paciente</p>
                    <p className="text-xs text-amber-600 mt-1">Ej: M (Masculino) | F (Femenino) - Si está vacío, se completará desde BD usando DNI</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-300">
                  <div className="text-2xl">🎂</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">6. FECHA DE NACIMIENTO <span className="text-amber-600 text-xs">(OPCIONAL)</span></p>
                    <p className="text-sm text-gray-600">Fecha de nacimiento (la edad se calcula automáticamente)</p>
                    <p className="text-xs text-amber-600 mt-1">Formato: YYYY-MM-DD | Ej: 1980-05-20 - Si está vacío, se completará desde BD usando DNI</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-300">
                  <div className="text-2xl">📱</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">7. TELÉFONO <span className="text-amber-600 text-xs">(OPCIONAL)</span></p>
                    <p className="text-sm text-gray-600">Número de teléfono de contacto</p>
                    <p className="text-xs text-amber-600 mt-1">Ej: 987654321 - Si está vacío, se completará desde BD usando DNI</p>
                  </div>
                </div>
                <div className="flex gap-4 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-300">
                  <div className="text-2xl">📧</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">8. CORREO <span className="text-amber-600 text-xs">(OPCIONAL)</span></p>
                    <p className="text-sm text-gray-600">Dirección de correo electrónico</p>
                    <p className="text-xs text-amber-600 mt-1">Ej: juan.perez@email.com - Si está vacío, se completará desde BD usando DNI</p>
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
              )}
            </div>

            {/* Card: Auto-Cálculos */}
            <div className="bg-white rounded-xl shadow-lg mb-6 border-l-4 border-blue-500">
              <button
                onClick={() => setExpandedAutoCalculados(!expandedAutoCalculados)}
                className="w-full p-6 flex items-center justify-between hover:bg-blue-50 transition-colors rounded-t-xl"
              >
                <div className="flex items-center gap-2">
                  <Eye size={24} className="text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Campos Auto-Calculados</h2>
                </div>
                {expandedAutoCalculados ? (
                  <ChevronUp size={24} className="text-blue-600" />
                ) : (
                  <ChevronDown size={24} className="text-blue-600" />
                )}
              </button>

              {expandedAutoCalculados && (
              <div className="px-6 pb-6 pt-0">
              <div className="space-y-4">
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
              )}
            </div>

            {/* Card: Requisitos */}
            <div className="bg-white rounded-xl shadow-lg mb-6 border-l-4 border-blue-500">
              <button
                onClick={() => setExpandedRequisitos(!expandedRequisitos)}
                className="w-full p-6 flex items-center justify-between hover:bg-blue-50 transition-colors rounded-t-xl"
              >
                <div className="flex items-center gap-2">
                  <FileText size={24} className="text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Requisitos</h2>
                </div>
                {expandedRequisitos ? (
                  <ChevronUp size={24} className="text-blue-600" />
                ) : (
                  <ChevronDown size={24} className="text-blue-600" />
                )}
              </button>

              {expandedRequisitos && (
              <div className="px-6 pb-6">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-gray-700">Formato: .xlsx, .xls o .csv</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-gray-700">Máximo 10,000 registros por archivo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-gray-700">10 columnas en el ORDEN correcto (headers opcionales)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-gray-700">Campos OBLIGATORIOS: Tipo Doc, DNI, Nombre, IPRESS, Tipo Cita</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-gray-700">Campos OPCIONALES: Sexo, Fecha Nac, Teléfono, Correo (se rellenan desde BD)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-gray-700">Asegurados no existentes: se crean automáticamente ✨</span>
                </li>
              </ul>
              </div>
              )}
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
          </div>
        </div>

        {/* Zona de Carga Principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Zona de drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-2xl p-12 text-center mb-8 cursor-pointer transition-all ${
              isDragging
                ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                : 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 hover:bg-blue-100 hover:border-blue-400'
            }`}
          >
            <Upload size={56} className={`mx-auto mb-4 ${isDragging ? 'text-green-500' : 'text-blue-500'}`} />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {isDragging ? '✅ Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
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

          {/* Estado de la importación y validación */}
          {importStatus && (
            <div className={`rounded-xl p-6 mb-6 border-2 ${
              importStatus.type === 'success'
                ? 'bg-green-50 border-green-400'
                : importStatus.type === 'warning'
                ? 'bg-amber-50 border-amber-400'
                : 'bg-red-50 border-red-400'
            }`}>
              <div className="flex items-start gap-4">
                {importStatus.type === 'success' ? (
                  <CheckCircle className="text-green-600 flex-shrink-0" size={40} />
                ) : importStatus.type === 'warning' ? (
                  <AlertCircle className="text-amber-600 flex-shrink-0" size={40} />
                ) : (
                  <AlertCircle className="text-red-600 flex-shrink-0" size={40} />
                )}
                <div className="flex-1">
                  <p className={`text-lg font-bold ${
                    importStatus.type === 'success' ? 'text-green-800' : importStatus.type === 'warning' ? 'text-amber-800' : 'text-red-800'
                  }`}>
                    {importStatus.message}
                  </p>

                  {/* Detalles de validación de estructura */}
                  {importStatus.detalles && (
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="text-gray-700">📊 <strong>Análisis de estructura:</strong></p>
                      <ul className="ml-4 space-y-1 text-gray-700">
                        <li>✓ Columnas válidas: {importStatus.detalles.columnasValidas}/{importStatus.detalles.columnasEsperadas}</li>
                        <li>✓ Tiene headers: {importStatus.detalles.tieneHeaders ? '✅ Sí' : '❌ No (detectando por posición)'}</li>
                        <li>✓ Tiene datos: {importStatus.detalles.tieneData ? '✅ Sí' : '❌ No'}</li>
                      </ul>
                    </div>
                  )}

                  {/* Resultado de importación */}
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

        {/* 🧠 INFORMACIÓN: Sistema Inteligente */}
        <div className="bg-purple-50 rounded-xl shadow-lg p-6 border-l-4 border-purple-600 mb-6">
          <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            Carga Inteligente - Sin Necesidad de Headers
          </h3>
          <div className="bg-white p-4 rounded-lg border border-purple-200 mb-4">
            <p className="text-gray-700 mb-3">
              <strong>El sistema es inteligente y puede cargar tu Excel incluso si:</strong>
            </p>
            <ul className="space-y-2 text-sm text-gray-700 ml-4">
              <li>✅ Faltan los títulos (headers) en la primera fila</li>
              <li>✅ Los headers están vacíos o con nombres genéricos</li>
              <li>✅ Los nombres de las columnas varían</li>
              <li>✅ Solo tienes datos sin headers</li>
            </ul>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg border border-purple-300">
            <p className="font-semibold text-purple-900 mb-2">📌 Lo importante:</p>
            <p className="text-sm text-purple-800">
              El orden de las columnas debe ser SIEMPRE el mismo:
              <br />
              <code className="text-xs bg-white px-2 py-1 rounded mt-2 block">
                Fecha | Tipo Doc | DNI | Nombre | Sexo | Fecha Nac | Teléfono | Correo | IPRESS | Tipo Cita
              </code>
            </p>
            <p className="text-xs text-purple-700 mt-2">
              Cuando cargues un archivo, el sistema analizará automáticamente si es viable y te indicará si puede procesar los datos.
            </p>
          </div>
        </div>

        {/* Información de Estado Inicial */}
        <div className="bg-indigo-50 rounded-xl shadow-lg p-6 border-l-4 border-indigo-600 mb-6">
          <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
            <Info size={20} />
            Estado Inicial de Solicitud y Asegurados Creados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg border border-indigo-200">
              <p className="font-semibold text-gray-800">Estado de Cita:</p>
              <p className="text-indigo-700 font-bold text-lg">PENDIENTE_CITA</p>
              <p className="text-xs text-gray-600 mt-1">Solicitud pendiente de asignación a gestor</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-indigo-200">
              <p className="font-semibold text-gray-800">Asegurados Creados:</p>
              <p className="text-indigo-700 font-bold text-lg">EXTERNO</p>
              <p className="text-xs text-gray-600 mt-1">Tipo de paciente = EXTERNO (origen: Excel)</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-indigo-200">
              <p className="font-semibold text-gray-800">Próximo Paso:</p>
              <p className="text-indigo-700">Asignar a Gestor de Citas</p>
              <p className="text-xs text-gray-600 mt-1">Desde módulo Coordinador → Gestión Citas</p>
            </div>
          </div>
        </div>

        {/* Card: FAQ */}
        <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500">
          <button
            onClick={() => setExpandedFAQ(!expandedFAQ)}
            className="w-full p-6 flex items-center justify-between hover:bg-blue-50 transition-colors rounded-t-xl"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">❓</span>
              <h3 className="font-bold text-gray-800 text-lg">Preguntas Frecuentes</h3>
            </div>
            {expandedFAQ ? (
              <ChevronUp size={24} className="text-blue-600" />
            ) : (
              <ChevronDown size={24} className="text-blue-600" />
            )}
          </button>

          {expandedFAQ && (
          <div className="px-6 pb-6">
            <div className="space-y-4 text-sm">
              <div className="border-b pb-4">
                <p className="font-semibold text-gray-800">¿Puedo dejar campos vacíos (SEXO, FECHA NACIMIENTO, CORREO)?</p>
                <p className="text-gray-600 mt-1">Sí. Si estos campos están vacíos en el Excel, el sistema completará automáticamente la información usando el DNI del paciente con los datos de la tabla de asegurados. Solo son OBLIGATORIOS: DNI, TIPO DOCUMENTO, ASEGURADO, COD. IPRESS y TIPO CITA.</p>
              </div>
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
                <p className="font-semibold text-gray-800">¿Qué pasa si el Asegurado (DNI) no existe en el sistema?</p>
                <p className="text-gray-600 mt-1">✅ <strong>Buena noticia:</strong> El asegurado será creado automáticamente con los datos del Excel (DNI, nombre, sexo, fecha nacimiento, teléfono, correo). No necesitas crear la persona manualmente en el sistema.</p>
              </div>
              <div className="border-b pb-4">
                <p className="font-semibold text-gray-800">¿Se pueden importar registros duplicados?</p>
                <p className="text-gray-600 mt-1">No. El sistema valida y rechaza duplicados por la combinación única: (DNI + Tipo de Bolsa).</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">¿Debo llenar todos los 10 campos?</p>
                <p className="text-gray-600 mt-1">NO. Solo los campos OBLIGATORIOS: Tipo Documento, DNI, Nombre, Código IPRESS, Tipo Cita. Los demás (Sexo, Fecha Nac, Teléfono, Correo) son OPCIONALES. Si faltan datos opcionales, el sistema los completa automáticamente usando los datos del DNI en la base de datos.</p>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
