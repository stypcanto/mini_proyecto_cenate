/**
 * 📊 Mis EKGs Recientes - Panel Derecho Mejorado
 * Muestra: Estadísticas del día + Últimas 3 cargas + Tooltips de observaciones
 *
 * v1.55.0 - Diseño médico profesional
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  Eye,
  MessageSquare,
  CheckCheck,
  Check,
  Search,
  X,
  Calendar,
  BarChart3,
  Download,
  Eye as EyeIcon,
  Edit2,
  Plus,
  Trash2,
} from 'lucide-react';
import { COLORS, MEDICAL_PALETTE } from '../../config/designSystem';
import toast from 'react-hot-toast';
import teleecgService from '../../services/teleecgService';
import * as XLSX from 'xlsx';
import apiClient from '../../lib/apiClient';
import { logRespuestaConsola } from '../../utils/consoleResponseLogger';

// ✅ v1.76.5: Función auxiliar para parsear fechas sin offset de timezone
const parsearFechaSegura = (fechaStr) => {
  if (!fechaStr) return null;
  // Extraer solo la parte de la fecha (YYYY-MM-DD)
  const partes = fechaStr.split('T')[0].split('-');
  if (partes.length !== 3) return null;
  return {
    año: parseInt(partes[0], 10),
    mes: parseInt(partes[1], 10),
    día: parseInt(partes[2], 10),
  };
};

export default function MisECGsRecientes({
  ultimas3 = [],
  estadisticas = {
    cargadas: 0,
    enEvaluacion: 0,
    observadas: 0,
    atendidas: 0,
  },
  onRefrescar = () => {},
  onVerImagen = () => {},
  onBuscarPorDNI = () => {},  // ✅ v1.80.4: Callback para búsqueda en backend
  // ✅ v1.103.0: NUEVOS PROPS PARA FILTROS REACTIVOS
  filtrosActuales = { dni: '', estado: 'TODOS', fechaDesde: '', fechaHasta: '' },
  onFiltrosChange = () => {},
  onLimpiarFiltros = () => {},
  // ✅ v1.103.0: NUEVOS PROPS PARA PAGINACIÓN INCREMENTAL
  totalElementos = 0,
  hayMasPaginas = false,
  cargandoMas = false,
  onCargarMas = () => {},
  loading = false,
  imagenesPorDni = {}, // ✅ NEW: Pasar imágenes reales por DNI
}) {
  const [expandidoTooltip, setExpandidoTooltip] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState(null); // null = todos, 'ENVIADA', 'OBSERVADA', 'ATENDIDA'

  // ✅ v1.103.0: FILTROS LOCALES SINCRONIZADOS CON PROPS - CON VALORES POR DEFECTO SEGUROS
  const safeFilterosActuales = filtrosActuales || { dni: '', estado: 'TODOS', fechaDesde: '', fechaHasta: '' };
  const [filtroDNI, setFiltroDNI] = useState(safeFilterosActuales.dni || '');
  const [filtroEstadoReactivo, setFiltroEstadoReactivo] = useState(safeFilterosActuales.estado || 'TODOS');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState(safeFilterosActuales.fechaDesde || '');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState(safeFilterosActuales.fechaHasta || '');
  const [filtroEvaluacion, setFiltroEvaluacion] = useState(safeFilterosActuales.evaluacion || 'TODOS');

  // ✅ NEW: Filter State (legacy - mantener para compatibilidad)
  const [filtroFecha, setFiltroFecha] = useState('');
  const [datosOriginales, setDatosOriginales] = useState([]);
  const [buscandoPorDNI, setBuscandoPorDNI] = useState(false);  // ✅ v1.84.1: Loader durante búsqueda

  // Modal detalle de observación
  const [showObsModal, setShowObsModal] = useState(false);
  const [cargaObsSeleccionada, setCargaObsSeleccionada] = useState(null);

  // ✅ NEW: Modal de edición de imágenes
  const [showEditModal, setShowEditModal] = useState(false);
  const [cargaEdicion, setCargaEdicion] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'add', 'replace', 'delete', 'preview'
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(null);
  const [imagenPreviewData, setImagenPreviewData] = useState(null);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [dragActivo, setDragActivo] = useState(false);  // ✅ Para drag-and-drop
  const [esUrgente, setEsUrgente] = useState(false);  // ✅ Checkbox para marcar como urgente
  const [fechaToma, setFechaToma] = useState("");  // ✅ v1.76.0: Fecha de toma del EKG editable
  const fileInputRef = useRef(null);  // ✅ Referencia segura al input file

  // ✅ Modal de resultados de evaluación ECG
  const [showResultadosModal, setShowResultadosModal] = useState(false);
  const [resultadosModal, setResultadosModal] = useState(null);

  // ✅ Descargas Inteligentes
  const [showDescargas, setShowDescargas] = useState(false);
  const [descargaEvaluacion, setDescargaEvaluacion] = useState('NORMAL');
  const [descargandoAtendidos, setDescargandoAtendidos] = useState(false);
  const [descargandoEvaluacion, setDescargandoEvaluacion] = useState(false);

  // ✅ Parsear descripción completa para extraer hallazgos y observaciones
  const parsearEvaluacionCompleta = (descripcion) => {
    if (!descripcion) return { hallazgos: '', observacionesClinicas: '' };
    let hallazgos = '';
    if (descripcion.includes('HALLAZGOS NORMALES:')) {
      hallazgos = descripcion.split('HALLAZGOS NORMALES:')[1]?.split('OBSERVACIONES CLÍNICAS:')[0]?.trim() || '';
    } else if (descripcion.includes('HALLAZGOS ANORMALES:')) {
      hallazgos = descripcion.split('HALLAZGOS ANORMALES:')[1]?.split('OBSERVACIONES CLÍNICAS:')[0]?.trim() || '';
    }
    const observacionesClinicas = descripcion.split('OBSERVACIONES CLÍNICAS:')[1]?.trim() || '';
    return {
      hallazgos: hallazgos ? hallazgos.split('\n').filter(h => h.trim().startsWith('-')).map(h => h.replace(/^-\s*/, '').trim()).join('\n') : '',
      observacionesClinicas
    };
  };

  // ✅ Helper: dar formato a fecha para Excel
  const formatearFechaExcel = (fechaStr) => {
    if (!fechaStr) return '-';
    try {
      const fecha = new Date(fechaStr);
      return `${String(fecha.getUTCDate()).padStart(2,'0')}/${String(fecha.getUTCMonth()+1).padStart(2,'0')}/${fecha.getUTCFullYear()} ${String(fecha.getUTCHours()).padStart(2,'0')}:${String(fecha.getUTCMinutes()).padStart(2,'0')}`;
    } catch { return '-'; }
  };

  // ✅ Descarga 1: Todos los Atendidos — consulta el total desde el backend
  const descargarAtendidosExcel = async () => {
    setDescargandoAtendidos(true);
    try {
      toast.loading('Obteniendo todos los atendidos...');
      const resultado = await teleecgService.listarAgrupoPorAsegurado('', 'ATENDIDA');
      
      // ✅ Log CRUDO: Todo lo que devuelve el backend
      console.log("\n\n");
      console.log("═══════════════════════════════════════════════════════════");
      console.log("📦 [BACKEND - DATOS PROCESADOS EN FRONTEND] Array de asegurados:");
      console.log(JSON.stringify(resultado, null, 2));
      console.log("═══════════════════════════════════════════════════════════\n\n");
      
      logRespuestaConsola({
        titulo: 'Descarga Atendidos Excel',
        endpoint: '/api/teleekgs/agrupar-por-asegurado?estado=ATENDIDA',
        method: 'GET',
        enviado: { estado: 'ATENDIDA' },
        status: 200,
        devuelto: { totalAsegurados: resultado?.length || 0 },
        fuente: '/teleecgs/ipress-workspace',
        etiquetaIdentificador: 'Total'
      });
      
      toast.dismiss();

      if (!resultado || resultado.length === 0) {
        toast.error('No hay pacientes atendidos para exportar');
        setDescargandoAtendidos(false);
        return;
      }

      const filas = resultado.map((asegurado, i) => {
        const imagenes = asegurado.imagenes || [];
        const ultima = imagenes[imagenes.length - 1] || {};
        return {
          '#': i + 1,
          'DNI': asegurado.numDocPaciente || ultima.numDocPaciente || '-',
          'Paciente': asegurado.pacienteNombreCompleto || asegurado.nombresPaciente || ultima.pacienteNombreCompleto || '-',
          'Edad': asegurado.edadPaciente || ultima.edadPaciente || '-',
          'Género': (asegurado.generoPaciente || ultima.generoPaciente) === 'M' ? 'Masculino' : (asegurado.generoPaciente || ultima.generoPaciente) === 'F' ? 'Femenino' : '-',
          'Estado': 'Atendida',
          'Cant. Imágenes': imagenes.length || 0,
          'Evaluación': ultima.evaluacion || ultima.evaluacionPrincipal || '-',
          'Fecha EKG': ultima.fechaToma ? formatearFechaExcel(ultima.fechaToma) : '-',
          'Fecha Envío': ultima.fechaEnvio ? formatearFechaExcel(ultima.fechaEnvio) : '-',
        };
      });

      const ws = XLSX.utils.json_to_sheet(filas);
      ws['!cols'] = [
        {wch:4},{wch:12},{wch:35},{wch:7},{wch:10},
        {wch:12},{wch:14},{wch:14},{wch:18},{wch:18}
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Atendidos');
      XLSX.writeFile(wb, `Pacientes_Atendidos_ECG_${new Date().toISOString().slice(0,10)}.xlsx`);
      toast.success(`✅ ${resultado.length} pacientes exportados`);
    } catch (e) {
      toast.dismiss();
      logRespuestaConsola({
        titulo: 'Descarga Atendidos Excel - ERROR',
        endpoint: '/api/teleekgs/agrupar-por-asegurado?estado=ATENDIDA',
        method: 'GET',
        status: 500,
        devuelto: { error: e.message },
        fuente: '/teleecgs/ipress-workspace',
      });
      toast.error('Error al obtener datos del servidor');
    } finally {
      setDescargandoAtendidos(false);
    }
  };

  // ✅ Descarga 2: Por Evaluación (NORMAL o ANORMAL) — llama al backend
  const descargarPorEvaluacionExcel = async () => {
    setDescargandoEvaluacion(true);
    try {
      toast.loading('Obteniendo datos de evaluaciones...');
      // Obtener todos los pacientes atendidos agrupados con sus evaluaciones
      const resultado = await teleecgService.listarAgrupoPorAsegurado('', 'ATENDIDA');
      
      // ✅ Log CRUDO: Todo lo que devuelve el backend
      console.log("\n\n");
      console.log("═══════════════════════════════════════════════════════════");
      console.log("📦 [BACKEND - DATOS PROCESADOS EN FRONTEND - EVALUACIÓN] Array de asegurados:");
      console.log(JSON.stringify(resultado, null, 2));
      console.log("═══════════════════════════════════════════════════════════\n\n");
      
      logRespuestaConsola({
        titulo: 'Descarga Por Evaluación Excel',
        endpoint: '/api/teleekgs/agrupar-por-asegurado?estado=ATENDIDA',
        method: 'GET',
        enviado: { estado: 'ATENDIDA', evaluacion: descargaEvaluacion },
        status: 200,
        devuelto: { totalAsegurados: resultado?.length || 0 },
        fuente: '/teleecgs/ipress-workspace',
        identificador: descargaEvaluacion,
        etiquetaIdentificador: 'Evaluación'
      });
      
      toast.dismiss();

      if (!resultado || resultado.length === 0) {
        toast.error('No se encontraron datos');
        setDescargandoEvaluacion(false);
        return;
      }

      // Filtrar por tipo de evaluación seleccionado
      const filtrados = resultado.filter(asegurado => {
        const imagenes = asegurado.imagenes || [];
        return imagenes.some(img => img.evaluacion === descargaEvaluacion);
      });

      if (filtrados.length === 0) {
        toast.error(`No hay pacientes con evaluación ${descargaEvaluacion}`);
        setDescargandoEvaluacion(false);
        return;
      }

      const filas = filtrados.map((asegurado, i) => {
        const imagenes = asegurado.imagenes || [];
        const ultimaEval = [...imagenes].reverse().find(img => img.evaluacion === descargaEvaluacion);
        return {
          '#': i + 1,
          'DNI': asegurado.numDocPaciente || '-',
          'Paciente': asegurado.pacienteNombreCompleto || asegurado.nombresPaciente || '-',
          'Edad': asegurado.edadPaciente || '-',
          'Género': asegurado.generoPaciente === 'M' ? 'Masculino' : asegurado.generoPaciente === 'F' ? 'Femenino' : '-',
          'Estado': 'Atendida',
          'Evaluación': descargaEvaluacion,
          'Cant. Imágenes': imagenes.length,
          'Fecha Evaluación': ultimaEval?.fechaEnvio ? formatearFechaExcel(ultimaEval.fechaEnvio) : '-',
          'Hallazgos': ultimaEval?.notaClinicaHallazgos || '-',
          'Observaciones': ultimaEval?.notaClinicaObservaciones || '-',
        };
      });

      const ws = XLSX.utils.json_to_sheet(filas);
      ws['!cols'] = [
        {wch:4},{wch:12},{wch:35},{wch:7},{wch:10},
        {wch:12},{wch:12},{wch:14},{wch:18},{wch:40},{wch:50}
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Eval_${descargaEvaluacion}`);
      XLSX.writeFile(wb, `Pacientes_Eval_${descargaEvaluacion}_${new Date().toISOString().slice(0,10)}.xlsx`);
      toast.success(`✅ ${filtrados.length} pacientes con evaluación ${descargaEvaluacion} exportados`);
    } catch (e) {
      toast.dismiss();
      logRespuestaConsola({
        titulo: 'Descarga Por Evaluación Excel - ERROR',
        endpoint: '/api/teleekgs/agrupar-por-asegurado?estado=ATENDIDA',
        method: 'GET',
        status: 500,
        devuelto: { error: e.message },
        fuente: '/teleecgs/ipress-workspace',
        identificador: descargaEvaluacion,
        etiquetaIdentificador: 'Evaluación'
      });
      toast.error('Error al generar el Excel: ' + e.message);
    } finally {
      setDescargandoEvaluacion(false);
    }
  };

  const descargarComoWord = () => {
    if (!resultadosModal) return;

    const fecha = resultadosModal.fecha
      ? new Date(resultadosModal.fecha).toLocaleDateString('es-ES', {
          day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      : 'Sin fecha';

    const colorEval = resultadosModal.evaluacion === 'NORMAL' ? '#059669' : '#DC2626';

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Calibri, Arial, sans-serif; margin: 40px; color: #1e293b; }
    .header { background: #1e293b; color: white; padding: 20px 24px; margin-bottom: 24px; }
    .header .label { font-size: 10px; letter-spacing: 2px; color: #94a3b8; margin-bottom: 6px; }
    .header .name { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
    .header .dni { font-size: 12px; color: #94a3b8; }
    .badge { display: inline-flex; align-items: center; gap: 10px; background: ${resultadosModal.evaluacion === 'NORMAL' ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${resultadosModal.evaluacion === 'NORMAL' ? '#bbf7d0' : '#fecaca'}; border-radius: 10px; padding: 14px 20px; margin-bottom: 24px; width: 100%; box-sizing: border-box; }
    .badge .circle { background: ${colorEval}; color: white; border-radius: 50%; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; flex-shrink: 0; }
    .badge .eval-text { font-size: 22px; font-weight: 900; color: ${colorEval}; }
    .badge .eval-fecha { font-size: 11px; color: #64748b; margin-top: 2px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #475569; text-transform: uppercase; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; margin-bottom: 12px; }
    .section-bar { display: inline-block; width: 4px; height: 18px; background: #1e293b; border-radius: 2px; margin-right: 8px; vertical-align: middle; }
    .content-box { background: #f8fafc; border-radius: 8px; padding: 14px 16px; font-size: 13px; line-height: 1.7; color: #475569; white-space: pre-wrap; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <div class="label">INFORME DE EVALUACIÓN EKG — CENATE</div>
    <div class="name">${resultadosModal.nombrePaciente}</div>
    <div class="dni">DNI: ${resultadosModal.dni}</div>
  </div>

  <div class="badge">
    <div class="circle">${resultadosModal.evaluacion === 'NORMAL' ? '✓' : '!'}</div>
    <div>
      <div class="eval-text">${resultadosModal.evaluacion}</div>
      <div class="eval-fecha">Evaluado el ${fecha}</div>
    </div>
  </div>

  ${resultadosModal.hallazgos ? `
  <div class="section">
    <div class="section-title"><span class="section-bar"></span>Hallazgos</div>
    <div class="content-box">${resultadosModal.hallazgos}</div>
  </div>` : ''}

  ${resultadosModal.observacionesClinicas ? `
  <div class="section">
    <div class="section-title"><span class="section-bar"></span>Observaciones Clínicas</div>
    <div class="content-box">${resultadosModal.observacionesClinicas}</div>
  </div>` : ''}

  ${resultadosModal.descripcion ? `
  <div class="section">
    <div class="section-title"><span class="section-bar"></span>Informe Completo</div>
    <div class="content-box">${resultadosModal.descripcion}</div>
  </div>` : ''}

  <div class="footer">
    Generado por CENATE — Sistema de Telemedicina EsSalud &nbsp;|&nbsp; ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-word;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_ECG_${resultadosModal.dni}_${new Date().toISOString().slice(0,10)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('✅ Informe descargado correctamente');
  };

  const abrirResultadosModal = async (carga) => {
    try {
      // Obtener todas las imágenes del paciente con sus evaluaciones reales
      const resultado = await teleecgService.listarAgrupoPorAsegurado(carga.dni, '');

      if (!resultado || resultado.length === 0) {
        toast.error('No se encontraron datos de evaluación');
        return;
      }

      const imagenes = resultado[0]?.imagenes || [];

      // Filtrar imágenes que tienen evaluación real (igual que MisPacientes)
      const evaluadas = imagenes.filter(
        img => img && img.evaluacion && img.evaluacion !== 'SIN_EVALUAR'
      );

      if (evaluadas.length === 0) {
        toast.info('Este paciente aún no tiene evaluación registrada');
        return;
      }

      // Tomar la última evaluación
      const ultima = evaluadas[evaluadas.length - 1];
      const descripcion = ultima.descripcion_evaluacion || ultima.descripcionEvaluacion || '';
      const { hallazgos, observacionesClinicas } = parsearEvaluacionCompleta(descripcion);

      setResultadosModal({
        nombrePaciente: carga.nombrePaciente,
        dni: carga.dni,
        evaluacion: ultima.evaluacion || '',
        descripcion,
        hallazgos: hallazgos || ultima.hallazgos || '',
        observacionesClinicas: observacionesClinicas || ultima.observacionesClinicas || '',
        fecha: ultima.fechaEvaluacion || ultima.fecha_evaluacion || '',
      });
      setShowResultadosModal(true);
    } catch (error) {
      console.error('❌ Error cargando evaluación:', error);
      toast.error('Error al cargar los resultados de evaluación');
    }
  };

  // ✅ v1.103.0: Sincronizar filtros locales cuando los props cambian
  useEffect(() => {
    const safe = filtrosActuales || { dni: '', estado: 'TODOS', fechaDesde: '', fechaHasta: '' };
    setFiltroDNI(safe.dni || '');
    setFiltroEstadoReactivo(safe.estado || 'TODOS');
    setFiltroEstado(safe.estado && safe.estado !== 'TODOS' ? safe.estado : null);
    setFiltroFechaDesde(safe.fechaDesde || '');
    setFiltroFechaHasta(safe.fechaHasta || '');
    setFiltroEvaluacion(safe.evaluacion || 'TODOS');
  }, [filtrosActuales]);

  // ✅ v1.97.4: Log estadísticas cuando cambien para debugging
  useEffect(() => {
    console.log(`📊 [MisECGsRecientes v1.97.4] estadisticas actualizado:`, {
      total: estadisticas?.total,
      cargadas: estadisticas?.cargadas,
      enEvaluacion: estadisticas?.enEvaluacion,
      observadas: estadisticas?.observadas,
      atendidas: estadisticas?.atendidas,
    });
  }, [estadisticas]);

  // ✅ Sync ultimas3 to datosOriginales on mount and when ultimas3 changes
  useEffect(() => {
    console.log(`📊 [MisECGsRecientes] ultimas3 actualizado, length=${ultimas3.length}`);
    if (ultimas3.length > 0) {
      console.log(`📊 [MisECGsRecientes] Primer item:`, ultimas3[0]);
      console.log(`📊 [MisECGsRecientes] Primer item.dni="${ultimas3[0].dni}", numDocPaciente="${ultimas3[0].numDocPaciente}"`);
    }
    setDatosOriginales(ultimas3);
  }, [ultimas3]);

  // ✅ v1.76.0: Cuando el usuario busca por DNI, limpiar automáticamente el filtro de fecha
  // Esto evita que se combinen filtros (DNI + Fecha) y muestren 0 resultados confusos
  useEffect(() => {
    if (filtroDNI && filtroDNI.trim() !== '' && filtroFecha !== '') {
      console.log('🔍 DNI ingresado, limpiando filtro de fecha para mejorar UX');
      setFiltroFecha('');
    }
  }, [filtroDNI]);

  // ✅ v1.84.0: Autocompletado con debounce (busca mientras escribes)
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    // ✅ v1.85.1: Si el usuario borró todo el DNI, resetear INMEDIATAMENTE sin debounce
    if (!filtroDNI || filtroDNI.trim() === '') {
      // Limpiar timer si existe
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      console.log('🔄 DNI vacío, reseteando búsqueda INMEDIATAMENTE');
      setBuscandoPorDNI(false);
      onBuscarPorDNI('');  // Resetear completamente
      return; // Salir del effect
    }

    // Si el usuario escribió algo, usar debounce (800ms)
    // Limpiar timer anterior si existe
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Mostrar loader mientras espera el debounce
    setBuscandoPorDNI(true);
    console.log(`⏳ Debounce iniciado para DNI: "${filtroDNI}"`);

    debounceTimerRef.current = setTimeout(() => {
      console.log(`🔍 Autocompletado: buscando DNI "${filtroDNI}" después de 800ms`);
      onBuscarPorDNI(filtroDNI);
      setBuscandoPorDNI(false);  // Loader desaparece cuando termina búsqueda
    }, 800);  // 800ms debounce

    // Cleanup: limpiar timer cuando component se desmonta o filtroDNI cambia
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  // ✅ v1.87.2: SOLO filtroDNI en dependencias
  // onBuscarPorDNI se captura en el closure del setTimeout, eso está bien
  // Reaccionar SOLO a cambios en filtroDNI para evitar infinite loops
  }, [filtroDNI]);

  // ✅ v1.81.3: Búsqueda manual (sin useEffect infinito)
  // El usuario presiona Enter o hace clic en botón para buscar

  // ✅ Cargar imagen cuando se abre preview
  useEffect(() => {
    if (modalMode === 'preview' && previewImageIndex !== null && imagenesPorDni[cargaEdicion?.dni]) {
      const imagen = imagenesPorDni[cargaEdicion.dni][previewImageIndex];
      if (imagen?.idImagen && !imagenPreviewData) {
        setCargandoImagen(true);

        // Llamar al endpoint para obtener la imagen con base64
        teleecgService.verPreview(imagen.idImagen)
          .then((respuesta) => {
            // Combinar datos de la imagen con el contenido base64
            setImagenPreviewData({
              ...imagen,
              ...respuesta, // Incluye contenidoImagen y tipoContenido
            });
            setCargandoImagen(false);
          })
          .catch((error) => {
            console.error('❌ Error cargando imagen:', error);
            // En caso de error, mostrar fallback con los datos disponibles
            setImagenPreviewData(imagen);
            setCargandoImagen(false);
            toast.error('⚠️ No se pudo cargar la vista previa de la imagen');
          });
      }
    }
  }, [modalMode, previewImageIndex, cargaEdicion, imagenesPorDni, imagenPreviewData]);

  // ✅ Filter Functions
  const filtrarPorDNI = (datos, dniBusqueda) => {
    if (!dniBusqueda || dniBusqueda.trim() === '') return datos;

    // 🔍 v1.87.3: DEBUG - Log para ver qué está pasando en el filtro
    console.log(`🔍 [filtrarPorDNI] dniBusqueda="${dniBusqueda}", datos.length=${datos.length}`);
    if (datos.length > 0) {
      console.log(`🔍 [filtrarPorDNI] Primer item:`, datos[0]);
      console.log(`🔍 [filtrarPorDNI] Primer item.dni="${datos[0].dni}", tipo=${typeof datos[0].dni}`);
    }

    const resultado = datos.filter(
      item => {
        const matches = item.dni && item.dni.toString().includes(dniBusqueda);
        if (!matches && item.dni) {
          console.log(`❌ [filtrarPorDNI] Item DNI="${item.dni}" NO coincide con "${dniBusqueda}"`);
        }
        return matches;
      }
    );
    console.log(`✅ [filtrarPorDNI] Resultado: ${resultado.length} items encontrados`);
    return resultado;
  };

  // ✅ MEJORADO: Usar fechaEnvio directamente con parseo seguro de timezone
  const obtenerFechaUpload = (item) => {
    if (item.fechaEnvio) {
      const fechaParts = parsearFechaSegura(item.fechaEnvio);
      if (fechaParts) {
        const año = fechaParts.año;
        const mes = String(fechaParts.mes).padStart(2, '0');
        const día = String(fechaParts.día).padStart(2, '0');
        return `${año}-${mes}-${día}`;
      }
    }
    // Fallback: usar hoy si no hay fechaEnvio
    return new Date().toISOString().split('T')[0];
  };

  const filtrarPorFecha = (datos, fechaBusqueda) => {
    if (!fechaBusqueda) return datos;
    return datos.filter(item => {
      const uploadDate = obtenerFechaUpload(item);
      return uploadDate === fechaBusqueda;
    });
  };

  const filtrarPorEstado = (datos, estado) => {
    if (!estado) return datos;
    return datos.filter(item => item.estado === estado);
  };

  const filtrarPorEvaluacion = (datos, evaluacion) => {
    if (!evaluacion || evaluacion === 'TODOS') return datos;
    return datos.filter(item => item.evaluacion === evaluacion);
  };

  const aplicarFiltrosCombinados = (datos, dniBusqueda, fechaBusqueda, estado, evaluacion) => {
    let resultado = datos;
    resultado = filtrarPorDNI(resultado, dniBusqueda);
    resultado = filtrarPorFecha(resultado, fechaBusqueda);
    resultado = filtrarPorEstado(resultado, estado);
    resultado = filtrarPorEvaluacion(resultado, evaluacion);
    return resultado;
  };

  // ✅ Computed filtered data
  const datosFiltrados = useMemo(() => {
    const evalFiltro = filtroEstadoReactivo === 'ATENDIDA' ? filtroEvaluacion : 'TODOS';
    return aplicarFiltrosCombinados(datosOriginales, filtroDNI, filtroFecha, filtroEstado, evalFiltro);
  }, [datosOriginales, filtroDNI, filtroFecha, filtroEstado, filtroEvaluacion, filtroEstadoReactivo]);

  // ✅ Check if any filters are active
  const hayFiltrosActivos = filtroDNI !== '' || filtroFecha !== '';

  // ✅ Clear individual filters
  const limpiarFiltroDNI = () => {
    setFiltroDNI('');
    onBuscarPorDNI('');  // ✅ v1.80.4: Recargar sin filtro
  };
  const limpiarFiltroFecha = () => setFiltroFecha('');

  // ✅ Clear all filters
  const limpiarTodosFiltros = () => {
    setFiltroDNI('');
    setFiltroFecha('');
    onBuscarPorDNI('');  // ✅ v1.80.4: Recargar sin filtros
  };

  // ✅ Mostrar loader SOLO si NO hay datos (cambio real de cargas)
  // NO mostrar durante enriquecimiento si ya hay datos
  if (loading && datosOriginales.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 border border-gray-100 h-fit flex flex-col items-center justify-center">
        <RefreshCw className="w-14 h-14 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-700 font-semibold text-lg">Cargando cargas recientes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 h-fit">
      {/* ==================== ESTADÍSTICAS PROFESIONALES - FULL WIDTH ==================== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900">📊 Resumen de Hoy</h3>

          {/* Botón Refrescar */}
          <button
            onClick={onRefrescar}
            disabled={loading}
            className="p-2.5 hover:bg-slate-100 rounded-lg transition-all duration-200 disabled:opacity-50"
            title="Refrescar estadísticas"
            aria-label="Refrescar datos"
          >
            <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Grid responsive - Professional Stats Cards Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 md:gap-4">
          {/* Total Pacientes - Azul Índigo */}
          <button
            onClick={() => {
              setFiltroEstado(null);
              setFiltroEstadoReactivo('TODOS');
              onFiltrosChange({ ...safeFilterosActuales, estado: 'TODOS' });
            }}
            className="relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 border border-indigo-700 p-2 sm:p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 text-left cursor-pointer"
            title="Total de pacientes"
          >
            <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-white/10 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8" />
            <div className="relative z-10">
              <div className="mb-1.5 sm:mb-2">
                <div className="inline-flex p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="mb-0.5 sm:mb-1">
                <span className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
                  {(estadisticas.cargadas || 0) + (estadisticas.observadas || 0) + (estadisticas.atendidas || 0)}
                </span>
              </div>
              <span className="text-xs md:text-sm font-semibold text-white/90 line-clamp-2">
                Total Pacientes
              </span>
            </div>
          </button>

          {/* Total Pacientes - Verde SATURADO (Par - Luz) */}
          <button
            onClick={() => {
              setFiltroEstado(null);
              setFiltroEstadoReactivo('TODOS');
              setFiltroEvaluacion('TODOS');
              onFiltrosChange({ ...safeFilterosActuales, estado: 'TODOS', evaluacion: 'TODOS' });
            }}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 border p-2 sm:p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 text-left cursor-pointer ${
              filtroEstado === null ? 'border-white ring-2 ring-white' : 'border-emerald-600'
            }`}
            title="Total de pacientes con ECGs"
          >
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-white/10 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-1.5 sm:mb-2">
                <div className="inline-flex p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Número */}
              <div className="mb-0.5 sm:mb-1">
                <span className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
                  {estadisticas.cargadas}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs md:text-sm font-semibold text-white/90 line-clamp-2">
                Pendientes
              </span>
            </div>
          </button>

          {/* Pendiente - Gris Oscuro/Negro SATURADO - HIDDEN */}
          <button hidden style={{display:"none"}}
            onClick={() => {
              setFiltroEstado('ENVIADA');
              setFiltroEstadoReactivo('ENVIADA');
              setFiltroEvaluacion('TODOS');
              onFiltrosChange({ ...safeFilterosActuales, estado: 'ENVIADA', evaluacion: 'TODOS' });
            }}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border p-2 sm:p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 text-left cursor-pointer ${
              filtroEstado === 'ENVIADA' ? 'border-white ring-2 ring-white' : 'border-slate-800'
            }`}
            title="Filtrar por Pendiente"
          >
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-white/10 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-1.5 sm:mb-2.5">
                <div className="inline-flex p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Número */}
              <div className="mb-0.5 sm:mb-1.5">
                <span className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
                  {estadisticas.cargadas}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs md:text-sm font-semibold text-white/90 line-clamp-2">
                Pacientes pendientes
              </span>
            </div>
          </button>

          {/* Observadas - Ámbar SATURADO (Impar - Oscuro) */}
          <button
            onClick={() => {
              setFiltroEstado('OBSERVADA');
              setFiltroEstadoReactivo('OBSERVADA');
              setFiltroEvaluacion('TODOS');
              onFiltrosChange({ ...safeFilterosActuales, estado: 'OBSERVADA', evaluacion: 'TODOS' });
            }}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 border p-2 sm:p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 text-left cursor-pointer ${
              filtroEstado === 'OBSERVADA' ? 'border-white ring-2 ring-white' : 'border-orange-600'
            }`}
            title="Filtrar por Observadas"
          >
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-white/10 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-1.5 sm:mb-2.5">
                <div className="inline-flex p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Número */}
              <div className="mb-0.5 sm:mb-1.5">
                <span className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
                  {estadisticas.observadas}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs md:text-sm font-semibold text-white/90 line-clamp-2">
                Observadas
              </span>
            </div>
          </button>

          {/* Atendidas - Teal CLARO (Par - Luz) */}
          <button
            onClick={() => {
              setFiltroEstado('ATENDIDA');
              setFiltroEstadoReactivo('ATENDIDA');
              onFiltrosChange({ ...safeFilterosActuales, estado: 'ATENDIDA' });
            }}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 border p-2 sm:p-3 md:p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 text-left cursor-pointer ${
              filtroEstado === 'ATENDIDA' ? 'border-teal-700 ring-2 ring-teal-700' : 'border-teal-200'
            }`}
            title="Filtrar por Atendidas"
          >
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-teal-200/30 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-1.5 sm:mb-2.5">
                <div className="inline-flex p-1.5 sm:p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                  <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Número */}
              <div className="mb-0.5 sm:mb-1.5">
                <span className="text-lg sm:text-2xl md:text-3xl font-bold text-teal-900">
                  {estadisticas.atendidas}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs md:text-sm font-semibold text-teal-700 line-clamp-2">
                Atendidas
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ✅ v1.103.0: PANEL DE FILTROS REACTIVOS - SIEMPRE VISIBLE ==================== */}
      <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-4 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-blue-900">🔍 Filtros de Búsqueda Reactivos</h3>
        </div>

        {/* Grid responsive: 1 col móvil, 3 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* DNI */}
          <div>
            <label className="block text-xs font-semibold text-blue-900 mb-1.5">
              🆔 DNI Paciente
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar DNI..."
                value={filtroDNI}
                onChange={(e) => {
                  setFiltroDNI(e.target.value);
                  onFiltrosChange({ ...safeFilterosActuales, dni: e.target.value });
                }}
                maxLength="8"
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
              {filtroDNI && (
                <button
                  onClick={() => {
                    setFiltroDNI('');
                    onFiltrosChange({ ...safeFilterosActuales, dni: '' });
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:bg-blue-100 p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold text-blue-900 mb-1.5">
              📊 Estado
            </label>
            <select
              value={filtroEstadoReactivo}
              onChange={(e) => {
                const val = e.target.value;
                setFiltroEstadoReactivo(val);
                setFiltroEstado(val === 'TODOS' ? null : val);
                const evalReset = val !== 'ATENDIDA' ? 'TODOS' : filtroEvaluacion;
                if (val !== 'ATENDIDA') setFiltroEvaluacion('TODOS');
                onFiltrosChange({ ...safeFilterosActuales, estado: val, evaluacion: evalReset });
              }}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ENVIADA">Pendientes</option>
              <option value="OBSERVADA">Observadas</option>
              <option value="ATENDIDA">Atendidas</option>
            </select>
          </div>

          {/* Evaluación - solo habilitado cuando Estado = ATENDIDA */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${filtroEstadoReactivo === 'ATENDIDA' ? 'text-blue-900' : 'text-gray-400'}`}>
              🩺 Evaluación
            </label>
            <select
              value={filtroEstadoReactivo === 'ATENDIDA' ? filtroEvaluacion : 'TODOS'}
              disabled={filtroEstadoReactivo !== 'ATENDIDA'}
              onChange={(e) => {
                const val = e.target.value;
                setFiltroEvaluacion(val);
                onFiltrosChange({ ...safeFilterosActuales, evaluacion: val });
              }}
              className={`w-full px-3 py-2 border rounded-lg text-xs transition-colors ${
                filtroEstadoReactivo === 'ATENDIDA'
                  ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 cursor-pointer'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <option value="TODOS">Todas</option>
              <option value="NORMAL">Normal</option>
              <option value="ANORMAL">Anormal</option>
            </select>
            {filtroEstadoReactivo !== 'ATENDIDA' && (
              <p className="text-xs text-gray-400 mt-1 italic">Solo para Atendidas</p>
            )}
          </div>
        </div>

        {/* Botón Limpiar + Indicador de registros */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-blue-800 font-semibold">
            📊 Mostrando <span className="font-bold text-blue-900">{ultimas3.length}</span> pacientes de{' '}
            <span className="font-bold text-blue-900">{totalElementos}</span> imágenes EKG
          </p>
          <button
            onClick={() => {
              setFiltroDNI('');
              setFiltroEstadoReactivo('TODOS');
              setFiltroFechaDesde('');
              setFiltroFechaHasta('');
              setFiltroEvaluacion('TODOS');
              onLimpiarFiltros();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors text-xs font-semibold"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* ==================== FILTROS CLÍNICOS LEGACY - MANTENER POR COMPATIBILIDAD ==================== */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 hidden">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-blue-900">🔍 Filtrar Cargas Recientes</h4>
        </div>

        {/* Grid responsive: 1 col móvil, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* DNI Filter */}
          <div className="relative">
            <label htmlFor="filtro-dni" className="block text-xs font-semibold text-blue-900 mb-1.5">
              🆔 DNI Paciente
            </label>
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-blue-600">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="filtro-dni"
                type="text"
                placeholder="12345678"
                value={filtroDNI}
                onChange={(e) => setFiltroDNI(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && filtroDNI.trim() !== '') {
                    onBuscarPorDNI(filtroDNI);  // ✅ v1.81.3: Buscar al presionar Enter
                  }
                }}
                maxLength="8"
                className="w-full pl-8 pr-8 py-2 border border-blue-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {filtroDNI && (
                <button
                  onClick={limpiarFiltroDNI}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:bg-blue-100 p-1 rounded transition-colors"
                  title="Limpiar DNI"
                  aria-label="Limpiar filtro DNI"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <label htmlFor="filtro-fecha" className="block text-xs font-semibold text-blue-900 mb-1.5">
              📅 Fecha Carga
            </label>
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-blue-600">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="filtro-fecha"
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full pl-8 pr-2 py-2 border border-blue-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Clear All Filters Button */}
          {hayFiltrosActivos && (
            <div className="flex items-end">
              <button
                onClick={limpiarTodosFiltros}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-all duration-200 active:scale-95"
                title="Limpiar todos los filtros"
              >
                🗑️ Limpiar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Filter Status Info */}
        {hayFiltrosActivos && (
          <div className="mt-3 text-xs text-blue-700 bg-blue-100/50 border border-blue-200 rounded px-2.5 py-1.5 flex items-center gap-2">
            {buscandoPorDNI && (
              <>
                <div className="animate-spin">⏳</div>
                <span>🔍 Buscando DNI <strong>{filtroDNI}</strong>...</span>
              </>
            )}
            {!buscandoPorDNI && filtroDNI && filtroFecha && (
              <span>📊 Mostrando resultados para DNI <strong>{filtroDNI}</strong> en <strong>{filtroFecha}</strong> ({datosFiltrados.length} encontrada{datosFiltrados.length !== 1 ? 's' : ''})</span>
            )}
            {!buscandoPorDNI && filtroDNI && !filtroFecha && (
              <span>📊 Mostrando resultados para DNI <strong>{filtroDNI}</strong> ({datosFiltrados.length} encontrada{datosFiltrados.length !== 1 ? 's' : ''})</span>
            )}
            {!buscandoPorDNI && !filtroDNI && filtroFecha && (
              <span>📊 Mostrando cargas de <strong>{filtroFecha}</strong> ({datosFiltrados.length} encontrada{datosFiltrados.length !== 1 ? 's' : ''})</span>
            )}
          </div>
        )}
      </div>

      {/* ==================== DESCARGAS INTELIGENTES ==================== */}
      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowDescargas(prev => !prev)}
          className="w-full flex items-center gap-2 px-5 py-3.5 hover:bg-slate-100 transition-colors text-left"
        >
          <Download className="w-5 h-5 text-slate-700 flex-shrink-0" />
          <h3 className="text-sm font-bold text-slate-800">Descargas Inteligentes</h3>
          <span className="text-xs text-slate-500 font-normal">— Exporta la lista de pacientes a Excel</span>
          <div className="ml-auto flex-shrink-0">
            {showDescargas
              ? <ChevronUp className="w-4 h-4 text-slate-500" />
              : <ChevronDown className="w-4 h-4 text-slate-500" />
            }
          </div>
        </button>

        {showDescargas && (
        <div className="px-5 pb-5 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Opción 1: Todos los Atendidos */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                <CheckCheck className="w-5 h-5 text-teal-700" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Todos los Atendidos</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exporta <span className="font-semibold text-teal-700">todos</span> los pacientes atendidos desde el servidor
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                Total en servidor: <span className="font-bold text-slate-700">{estadisticas.atendidas || 0}</span>
              </span>
              <button
                onClick={descargarAtendidosExcel}
                disabled={descargandoAtendidos}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors"
              >
                {descargandoAtendidos ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {descargandoAtendidos ? 'Generando...' : 'Descargar Excel'}
              </button>
            </div>
          </div>

          {/* Opción 2: Por Evaluación */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-indigo-700" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Por Evaluación Médica</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filtra pacientes según el diagnóstico del médico evaluador
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <select
                value={descargaEvaluacion}
                onChange={(e) => setDescargaEvaluacion(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-400"
              >
                <option value="NORMAL">✅ Normal</option>
                <option value="ANORMAL">⚠️ Anormal</option>
                <option value="NO_DIAGNOSTICO">❓ No Diagnóstico</option>
              </select>
              <button
                onClick={descargarPorEvaluacionExcel}
                disabled={descargandoEvaluacion}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
              >
                {descargandoEvaluacion ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {descargandoEvaluacion ? 'Buscando...' : 'Descargar Excel'}
              </button>
            </div>
          </div>

        </div>
        </div>
        )}
      </div>

      {/* ==================== TABLA PROFESIONAL DE CARGAS ==================== */}
      <div className="mb-6">
        <h3 className="text-sm md:text-base font-bold text-gray-900 mb-4">
          📋 Cargas Recientes {datosFiltrados.length !== ultimas3.length && ultimas3.length > 0 && (
            <span className="text-xs font-normal text-blue-600">({datosFiltrados.length}/{ultimas3.length})</span>
          )}
        </h3>

        {ultimas3.length > 0 ? (
          buscandoPorDNI ? (
            // ✅ v1.85.0: Loader circular elegante mientras busca
            <div className="flex items-center justify-center py-12 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-center">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-blue-700 font-semibold text-sm">Buscando DNI {filtroDNI}...</p>
              </div>
            </div>
          ) : datosFiltrados.length > 0 ? (
            <div className="overflow-x-auto overflow-y-auto max-h-[800px] rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-sm md:text-base">
                {/* Header */}
                <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                  <tr>
                    {/* Hora - Oculto en tablet, visible en desktop */}
                    <th className="hidden lg:table-cell px-3 md:px-4 py-2 md:py-3 text-left font-bold whitespace-nowrap text-xs md:text-sm">Hora</th>

                    {/* DNI */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left font-bold whitespace-nowrap text-xs md:text-sm">DNI</th>

                    {/* Paciente */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left font-bold whitespace-nowrap text-xs md:text-sm">Paciente</th>

                    {/* Fecha de Toma - Oculto en tablet, visible en desktop */}
                    <th className="hidden lg:table-cell px-3 md:px-4 py-2 md:py-3 text-left font-bold whitespace-nowrap text-xs md:text-sm">📅 Fecha toma EKG</th>

                    {/* Perfil - Oculto en tablet, visible en desktop */}
                    <th className="hidden lg:table-cell px-3 md:px-4 py-2 md:py-3 text-left font-bold whitespace-nowrap text-xs md:text-sm">Perfil</th>

                    {/* Prioridad */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-center font-bold whitespace-nowrap text-xs md:text-sm">Prioridad</th>

                    {/* Estado */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left font-bold whitespace-nowrap text-xs md:text-sm">Estado</th>

                    {/* Cant. Imágenes Cargadas */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-center font-bold whitespace-nowrap text-xs md:text-sm">Cant. Imágenes</th>

                    {/* Resultados de Evaluación */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left font-bold whitespace-nowrap text-xs md:text-sm">Resultados</th>

                    {/* Acciones */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-center font-bold whitespace-nowrap text-xs md:text-sm">Acciones</th>
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {datosFiltrados.map((carga, idx) => {
                    // Formato de fecha compacto: "06/02 - 19:37" (SIN offset de timezone)
                    const fechaCompacta = carga.fechaEnvio
                      ? (() => {
                          const fecha = new Date(carga.fechaEnvio);
                          const dia = String(fecha.getUTCDate()).padStart(2, '0');
                          const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
                          const hora = String(fecha.getUTCHours()).padStart(2, '0');
                          const min = String(fecha.getUTCMinutes()).padStart(2, '0');
                          return `${dia}/${mes} - ${hora}:${min}`;
                        })()
                      : '-';

                    // Género corto para Perfil
                    const generoCortoun = carga.genero === 'M' ? 'M' : carga.genero === 'F' ? 'F' : '-';
                    const perfil = carga.edad && carga.edad !== '-' ? `${carga.edad} años / ${generoCortoun}` : `-`;

                    return (
                      <tr
                        key={idx}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150 cursor-pointer ${
                          carga.esUrgente ? 'bg-red-50' : ''
                        }`}
                        onClick={() => onVerImagen({ dni: carga.dni, nombrePaciente: carga.nombrePaciente })}
                      >
                        {/* Hora - Oculto en tablet, visible en desktop */}
                        <td className="hidden lg:table-cell px-3 md:px-4 py-2 md:py-3 text-gray-700 text-xs md:text-sm font-mono">
                          {fechaCompacta}
                        </td>

                        {/* DNI */}
                        <td className="px-3 md:px-4 py-2 md:py-3 text-gray-700 text-xs md:text-sm font-mono">
                          {carga.dni}
                        </td>

                        {/* Paciente - BOLD y destacado */}
                        <td className="px-3 md:px-4 py-2 md:py-3 min-w-max" title={carga.nombrePaciente}>
                          <div className="font-bold text-gray-900 text-xs md:text-sm line-clamp-2">{carga.nombrePaciente}</div>
                        </td>

                        {/* Fecha de Toma - Oculto en tablet, visible en desktop (✅ v1.76.5: Sin timezone offset) */}
                        <td className="hidden lg:table-cell px-3 md:px-4 py-2 md:py-3 text-gray-700 text-xs md:text-sm font-mono">
                          {carga.fechaToma ? (
                            (() => {
                              const fechaParts = parsearFechaSegura(carga.fechaToma);
                              if (fechaParts) {
                                const { año, mes, día } = fechaParts;
                                return `${String(día).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${año}`;
                              }
                              return '-';
                            })()
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* Perfil: Edad / Género - Oculto en tablet, visible en desktop */}
                        <td className="hidden lg:table-cell px-3 md:px-4 py-2 md:py-3 text-gray-700 text-xs md:text-sm">
                          {perfil}
                        </td>

                        {/* Prioridad - Círculo Pulsante */}
                        <td className="px-3 md:px-4 py-2 md:py-3 text-center flex items-center justify-center">
                          <div
                            className={`w-4 h-4 md:w-5 md:h-5 rounded-full animate-pulse ${
                              carga.esUrgente ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            title={carga.esUrgente ? 'Urgente' : 'Normal'}
                          />
                        </td>

                        {/* Estado - Distinto */}
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <span
                            className={`inline-flex px-2.5 md:px-3 py-1 md:py-1.5 rounded text-xs md:text-sm font-semibold whitespace-nowrap ${
                              carga.estado === 'ENVIADA'
                                ? 'bg-blue-100 text-blue-800'
                                : carga.estado === 'OBSERVADA'
                                ? 'bg-orange-100 text-orange-800'
                                : carga.estado === 'ATENDIDA'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {carga.estado === 'ENVIADA' ? 'Pendiente' : carga.estado === 'OBSERVADA' ? 'Observada' : carga.estado === 'ATENDIDA' ? 'Atendida' : carga.estado}
                          </span>
                        </td>

                        {/* Cant. Imágenes Cargadas */}
                        <td className="px-3 md:px-4 py-2 md:py-3 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 md:px-3 py-1 md:py-1.5 bg-indigo-100 text-indigo-800 rounded text-xs md:text-sm font-bold">
                            {carga.cantidadImagenes || 0}
                          </span>
                        </td>

                        {/* Resultados de Evaluación */}
                        <td className="px-3 md:px-4 py-2 md:py-3 text-center">
                          {carga.estado === 'ATENDIDA' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirResultadosModal(carga);
                              }}
                              className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-700 transition-all"
                              title="Ver resultados de evaluación"
                            >
                              <CheckCheck className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                            </button>
                          ) : carga.estado === 'OBSERVADA' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCargaObsSeleccionada(carga);
                                setShowObsModal(true);
                              }}
                              className="inline-flex items-center justify-center p-2 rounded-lg bg-orange-100 text-orange-600 border border-orange-300 hover:bg-orange-200 transition-all"
                              title="Ver motivo de observación"
                            >
                              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                            </button>
                          ) : (
                            <span
                              className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-100 text-slate-500 border border-slate-300"
                              title="Pendiente de evaluación"
                            >
                              <Clock className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-3 md:px-4 py-2 md:py-3 text-center">
                          <div className="flex items-center justify-center gap-1 md:gap-2">
                            {/* Preview Eye */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onVerImagen({ dni: carga.dni, nombrePaciente: carga.nombrePaciente });
                              }}
                              className="p-1.5 md:p-2 rounded hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors"
                              title="Ver imágenes"
                            >
                              <Eye className="w-4 h-4 md:w-5 md:h-5" />
                            </button>

                            {/* Edit - Gestionar imágenes */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCargaEdicion(carga);
                                setFechaToma(carga.fechaToma || "");  // ✅ v1.76.0: Cargar fecha existente
                                setShowEditModal(true);
                              }}
                              className="p-1.5 md:p-2 rounded hover:bg-orange-100 text-orange-600 hover:text-orange-800 transition-colors"
                              title="Editar imágenes"
                            >
                              <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>

                            {/* Download - Solo si ATENDIDA */}
                            {carga.estado === 'ATENDIDA' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success('Descarga disponible');
                                }}
                                className="p-1.5 md:p-2 rounded hover:bg-green-100 text-green-600 hover:text-green-800 transition-colors"
                                title="Descargar informe"
                              >
                                <Download className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            // No results for current filters
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-xs text-amber-900 font-medium mb-2">
                No se encontraron cargas
              </p>
              <p className="text-xs text-amber-700 mb-3">
                {filtroDNI && filtroFecha && (
                  `DNI "${filtroDNI}" no tiene cargas en ${filtroFecha}`
                )}
                {filtroDNI && !filtroFecha && (
                  `DNI "${filtroDNI}" no tiene cargas recientes`
                )}
                {!filtroDNI && filtroFecha && (
                  `No hay cargas para la fecha ${filtroFecha}`
                )}
              </p>
              <button
                onClick={limpiarTodosFiltros}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar filtros
              </button>
            </div>
          )
        ) : (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-center">
            <Clock className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
            <p className="text-xs text-gray-600">
              No hay cargas recientes. ¡Sube tu primer EKG!
            </p>
          </div>
        )}
      </div>

      {/* ✅ v1.103.0: BOTÓN CARGAR MÁS - PAGINACIÓN INCREMENTAL ==================== */}
      {hayMasPaginas && ultimas3.length > 0 && (
        <div className="mt-6 mb-6 flex flex-col items-center justify-center gap-3">
          <button
            onClick={onCargarMas}
            disabled={cargandoMas || loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {cargandoMas ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                Cargar más 50 pacientes
              </>
            )}
          </button>
          <p className="text-xs text-gray-600 text-center">
            Hay más registros disponibles. Total: <span className="font-bold">{totalElementos}</span> pacientes
          </p>
        </div>
      )}

      {/* Modal Detalle Observación */}
      {showObsModal && cargaObsSeleccionada && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Motivo de Observación</h3>
                  <p className="text-xs text-gray-500">{cargaObsSeleccionada.nombrePaciente}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowObsModal(false); setCargaObsSeleccionada(null); }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Info paciente */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-orange-700 font-semibold">DNI:</span>
                  <span className="ml-1 text-orange-900 font-mono">{cargaObsSeleccionada.dni}</span>
                </div>
                <div>
                  <span className="text-orange-700 font-semibold">Estado:</span>
                  <span className="ml-1 inline-flex px-2 py-0.5 bg-orange-200 text-orange-800 rounded text-xs font-semibold">Observada</span>
                </div>
                {cargaObsSeleccionada.fechaEnvio && (
                  <div className="col-span-2">
                    <span className="text-orange-700 font-semibold">Fecha envío:</span>
                    <span className="ml-1 text-orange-900">{cargaObsSeleccionada.fechaEnvioFormato || cargaObsSeleccionada.fechaEnvio}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Motivo / Observaciones */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">Detalle de observación:</p>
              {(cargaObsSeleccionada.observaciones || cargaObsSeleccionada.motivo_rechazo || cargaObsSeleccionada.observacion || cargaObsSeleccionada.notaClinicaObservaciones) ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap">
                  {cargaObsSeleccionada.observaciones || cargaObsSeleccionada.motivo_rechazo || cargaObsSeleccionada.observacion || cargaObsSeleccionada.notaClinicaObservaciones}
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <AlertCircle className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 italic">Sin detalle registrado</p>
                </div>
              )}
            </div>

            <button
              onClick={() => { setShowObsModal(false); setCargaObsSeleccionada(null); }}
              className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal Rediseñado - Simpler UX */}
      {showEditModal && cargaEdicion && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            {/* Encabezado */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">🖼️ Gestor de Imágenes EKG</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {cargaEdicion.nombrePaciente} • DNI: {cargaEdicion.dni}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setModalMode('view');
                  setSelectedImageIndex(null);
                  setEsUrgente(false);  // Reset urgency checkbox
                  setArchivoSeleccionado(null);  // Reset selected file
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Vista Principal Simplificada */}
            {modalMode === 'view' && (
              <div className="space-y-6">
                {/* ✅ v1.76.0: Sección de Fecha de Toma del EKG */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    📅 Fecha de Toma del EKG
                  </label>
                  <input
                    type="date"
                    value={fechaToma}
                    onChange={(e) => setFechaToma(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-semibold"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Especifica la fecha en que se tomó el electrocardiograma
                  </p>
                </div>

                {/* Sección de Imágenes Cargadas */}
                {(() => {
                  const imagenes = imagenesPorDni[cargaEdicion?.dni] || [];
                  return imagenes.length > 0 ? (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <CloudUpload className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Imágenes Cargadas ({imagenes.length})
                        </h3>
                      </div>

                      {/* Grid de Imágenes - COMPACTO */}
                      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                        {imagenes.map((_, idx) => (
                        <div
                          key={idx}
                          className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center border border-gray-300 hover:border-blue-500 transition-all hover:shadow-md"
                        >
                          {/* Placeholder de imagen */}
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="text-center">
                              <CloudUpload className="w-5 h-5 text-gray-400 mx-auto mb-0.5" />
                              <p className="text-xs text-gray-600 font-semibold">{idx + 1}</p>
                            </div>
                          </div>

                          {/* Botones de acción - COMPACTOS */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                            {/* Ver Imagen */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImageIndex(idx);
                                setSelectedImageIndex(idx);
                                setModalMode('preview');
                              }}
                              className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors shadow-lg"
                              title="Ver imagen"
                            >
                              <Eye className="w-3 h-3" />
                            </button>

                            {/* Eliminar Imagen */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex(idx);
                                setModalMode('delete');
                              }}
                              className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors shadow-lg"
                              title="Eliminar imagen"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                    ) : (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                        <CloudUpload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-blue-900 font-semibold">No hay imágenes cargadas</p>
                        <p className="text-xs text-blue-700 mt-1">Agrega tu primera imagen usando el botón de abajo</p>
                      </div>
                    )
                  })()}

                {/* Zona de Agregar Imagen - COMPACTO */}
                <div className="border-2 border-dashed border-green-400 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-all">
                  <Plus className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <h4 className="font-bold text-green-900 mb-0.5 text-base">Agregar Nueva Imagen</h4>
                  <p className="text-xs text-green-700 mb-2">Arrastra o haz clic para seleccionar</p>
                  <button
                    onClick={() => setModalMode('add')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-sm transition-all hover:shadow-md active:scale-95"
                  >
                    + Seleccionar Imagen
                  </button>
                </div>

                {/* ✅ v1.76.0: Botón de guardar fecha */}
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <button
                    onClick={async () => {
                      if (cargaEdicion && fechaToma) {
                        try {
                          const idImagen = cargaEdicion.idImagen || cargaEdicion.id;
                          toast.loading("Guardando fecha...");

                          // ✅ Usar apiClient POST con JSON body (endpoint v1.77.0)
                          const response = await apiClient.post(
                            `/teleekgs/${idImagen}/fecha-toma`,
                            { fechaToma },
                            true
                          );

                          if (response) {
                            toast.dismiss();
                            toast.success("✅ Fecha actualizada: " + fechaToma);
                            // Refrescar datos
                            setTimeout(() => window.location.reload(), 1500);
                          } else {
                            toast.dismiss();
                            toast.error("❌ Error al actualizar fecha");
                          }
                        } catch (error) {
                          console.error("❌ Error guardando fecha:", error);
                          toast.dismiss();
                          toast.error("❌ Error: " + (error.response?.data?.message || error.message));
                        }
                      } else if (!fechaToma) {
                        toast.error("Por favor selecciona una fecha");
                      }
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    💾 Guardar Fecha
                  </button>
                </div>
              </div>
            )}

            {/* Modo Agregar - Mejorado con Drag & Drop */}
            {modalMode === 'add' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Agregar Nueva Imagen
                </h3>


                {/* Zona de Drag & Drop Mejorada - Usando Label HTML */}
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActivo(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActivo(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActivo(false);

                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      const archivo = files[0];

                      // Validar tipo de archivo
                      const tiposValidos = ['image/jpeg', 'image/png', 'application/pdf'];
                      if (!tiposValidos.includes(archivo.type)) {
                        toast.error('❌ Tipo de archivo no válido. Usa JPG, PNG o PDF');
                        return;
                      }

                      // Validar tamaño (máximo 10MB)
                      if (archivo.size > 10 * 1024 * 1024) {
                        toast.error('❌ Archivo muy grande. Máximo 10 MB');
                        return;
                      }

                      setArchivoSeleccionado(archivo);
                      toast.success('✅ Archivo listo para subir');
                    }
                  }}
                  className={`block border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                    dragActivo
                      ? 'border-green-500 bg-green-100 scale-105'
                      : archivoSeleccionado
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  {archivoSeleccionado ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-green-900 text-lg">Archivo Listo</p>
                        <p className="text-xs text-green-700 mt-1">{archivoSeleccionado.name}</p>
                        <p className="text-xs text-green-600 mt-1">
                          {(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setArchivoSeleccionado(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="text-xs text-green-700 hover:text-green-900 font-semibold underline cursor-pointer"
                      >
                        Cambiar archivo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <CloudUpload className="w-12 h-12 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {dragActivo ? '📥 Suelta el archivo aquí' : 'Arrastra un archivo aquí'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">o haz clic para seleccionar</p>
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG o PDF (máximo 10 MB)</p>
                      </div>

                    </div>
                  )}
                </label>

                {/* Input File - Hidden pero accesible para file picker */}
                <input
                  ref={fileInputRef}
                  id={`fileInput-${cargaEdicion?.dni || 'default'}`}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const archivo = e.target.files?.[0];
                    if (archivo) {
                      // Validar tipo de archivo
                      const tiposValidos = ['image/jpeg', 'image/png', 'application/pdf'];
                      if (!tiposValidos.includes(archivo.type)) {
                        toast.error('❌ Tipo de archivo no válido. Usa JPG, PNG o PDF');
                        fileInputRef.current.value = '';
                        return;
                      }

                      // Validar tamaño (máximo 10MB)
                      if (archivo.size > 10 * 1024 * 1024) {
                        toast.error('❌ Archivo muy grande. Máximo 10 MB');
                        fileInputRef.current.value = '';
                        return;
                      }

                      setArchivoSeleccionado(archivo);
                      toast.success('✅ Archivo listo para subir');
                    }
                  }}
                />

                {/* Botón Seleccionar - Label asociado al input file */}
                {modalMode === 'add' && !archivoSeleccionado && (
                  <label
                    htmlFor={`fileInput-${cargaEdicion?.dni || 'default'}`}
                    className="block w-full px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all cursor-pointer text-center"
                  >
                    👆 Seleccionar Archivo
                  </label>
                )}

                {/* Checkbox Urgente */}
                {modalMode === 'add' && archivoSeleccionado && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="urgentCheckbox"
                      checked={esUrgente}
                      onChange={(e) => setEsUrgente(e.target.checked)}
                      className="w-5 h-5 text-red-600 cursor-pointer"
                    />
                    <label htmlFor="urgentCheckbox" className="flex-1 cursor-pointer">
                      <p className="font-semibold text-red-900">🚨 Marcar como URGENTE</p>
                      <p className="text-xs text-red-700 mt-0.5">Se destacará esta imagen con prioridad alta en la lista</p>
                    </label>
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={async () => {
                      if (!archivoSeleccionado) {
                        toast.error('❌ Por favor selecciona un archivo primero');
                        return;
                      }
                      if (!cargaEdicion?.dni) {
                        toast.error('❌ Error: Falta información del paciente');
                        return;
                      }

                      setCargandoArchivo(true);
                      try {
                        // Extraer nombres y apellidos de forma segura
                        const nombreCompleto = cargaEdicion.nombrePaciente || 'Sin nombre';
                        const partes = nombreCompleto.trim().split(/\s+/);
                        const nombres = partes[0] || '';
                        const apellidos = partes.slice(1).join(' ') || '';

                        const respuesta = await teleecgService.subirImagenECG(
                          archivoSeleccionado,
                          cargaEdicion.dni,
                          nombres,
                          apellidos,
                          esUrgente
                        );

                        toast.success('✅ ¡Imagen agregada correctamente!');
                        setModalMode('view');
                        setArchivoSeleccionado(null);
                        setEsUrgente(false);  // Reset urgency checkbox
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }

                        // Esperar un poco antes de refrescar
                        setTimeout(() => {
                          onRefrescar?.();
                        }, 500);
                      } catch (error) {
                        console.error('❌ Error completo al subir imagen:', error);
                        console.error('Mensaje:', error.message);
                        console.error('Detalles:', error.response?.data || error.response || error);

                        // Mensajes de error más amigables
                        let mensajeError = 'Error al subir la imagen';
                        if (error.message?.includes('401')) {
                          mensajeError = 'No tienes permiso para subir imágenes';
                        } else if (error.message?.includes('413')) {
                          mensajeError = 'Archivo muy grande';
                        } else if (error.message?.includes('Network')) {
                          mensajeError = 'Error de conexión. Verifica tu internet';
                        }

                        toast.error('❌ ' + mensajeError);
                      } finally {
                        setCargandoArchivo(false);
                      }
                    }}
                    disabled={cargandoArchivo || !archivoSeleccionado}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all text-base"
                  >
                    {cargandoArchivo ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Subiendo...
                      </span>
                    ) : (
                      '📤 Subir Imagen'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setModalMode('view');
                      setArchivoSeleccionado(null);
                      setEsUrgente(false);  // Reset urgency checkbox
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={cargandoArchivo}
                    className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 rounded-lg font-bold transition-all"
                  >
                    ✕ Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Modo Reemplazar */}
            {modalMode === 'replace' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-orange-600" />
                  Reemplazar Imagen {selectedImageIndex !== null ? selectedImageIndex + 1 : ''}
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  ℹ️ Selecciona el nuevo archivo EKG que reemplazará a la imagen actual
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setArchivoSeleccionado(e.target.files?.[0])}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                />
                {archivoSeleccionado && (
                  <p className="text-xs text-orange-700 font-semibold">
                    ✅ Archivo seleccionado: {archivoSeleccionado.name}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (!archivoSeleccionado) {
                        toast.error('Por favor selecciona un archivo');
                        return;
                      }
                      if (selectedImageIndex === null) {
                        toast.error('Error: Selecciona una imagen para reemplazar');
                        return;
                      }

                      setCargandoArchivo(true);
                      try {
                        // Obtener la imagen actual para eliminar
                        const imagenActual = imagenesPorDni[cargaEdicion.dni]?.[selectedImageIndex];

                        if (imagenActual?.idImagen) {
                          await teleecgService.eliminarImagen(imagenActual.idImagen);
                          toast.info('✅ Imagen antigua eliminada');
                        }

                        // Extraer nombres y apellidos de forma segura
                        const nombreCompleto = cargaEdicion.nombrePaciente || 'Sin nombre';
                        const partes = nombreCompleto.trim().split(/\s+/);
                        const nombres = partes[0] || '';
                        const apellidos = partes.slice(1).join(' ') || '';

                        // Subir la nueva imagen
                        const respuesta = await teleecgService.subirImagenECG(
                          archivoSeleccionado,
                          cargaEdicion.dni,
                          nombres,
                          apellidos
                        );

                        toast.success('🔄 Imagen reemplazada correctamente');
                        setModalMode('view');
                        setSelectedImageIndex(null);
                        setArchivoSeleccionado(null);

                        // Esperar un poco antes de refrescar
                        setTimeout(() => {
                          onRefrescar?.();
                        }, 500);
                      } catch (error) {
                        console.error('❌ Error completo al reemplazar imagen:', error);
                        console.error('Mensaje:', error.message);
                        console.error('Detalles:', error.response?.data || error.response || error);
                        toast.error('❌ Error al reemplazar: ' + (error.message || error));
                      } finally {
                        setCargandoArchivo(false);
                      }
                    }}
                    disabled={cargandoArchivo || !archivoSeleccionado}
                    className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                  >
                    {cargandoArchivo ? '🔄 Reemplazando...' : 'Reemplazar'}
                  </button>
                  <button
                    onClick={() => {
                      setModalMode('view');
                      setSelectedImageIndex(null);
                      setArchivoSeleccionado(null);
                    }}
                    disabled={cargandoArchivo}
                    className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Modo Eliminar */}
            {modalMode === 'delete' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Eliminar Imagen {selectedImageIndex !== null ? selectedImageIndex + 1 : ''}
                </h3>
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-sm text-red-800">
                  ⚠️ <strong>Advertencia:</strong> Esta acción no se puede deshacer. Se eliminará solo la imagen, el registro del paciente se mantendrá.
                </div>
                <p className="text-gray-700 text-sm">
                  ¿Estás seguro de que deseas eliminar la Imagen {selectedImageIndex !== null ? selectedImageIndex + 1 : ''}?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      setCargandoArchivo(true);
                      try {
                        const imagenActual = imagenesPorDni[cargaEdicion.dni]?.[selectedImageIndex];
                        if (imagenActual?.idImagen) {
                          await teleecgService.eliminarImagen(imagenActual.idImagen);
                          toast.success('🗑️ Imagen eliminada correctamente');

                          // ✅ Cerrar modal y resetear estado
                          setModalMode('view');
                          setSelectedImageIndex(null);
                          setPreviewImageIndex(null);

                          // ✅ Esperar a que se actualicen los datos
                          await new Promise(resolve => setTimeout(resolve, 800));
                          onRefrescar?.(); // Refrescar datos si existe la función
                        } else {
                          toast.error('No se encontró el ID de la imagen');
                        }
                      } catch (error) {
                        console.error('Error al eliminar imagen:', error);
                        toast.error('❌ Error al eliminar la imagen: ' + error.message);
                      } finally {
                        setCargandoArchivo(false);
                      }
                    }}
                    disabled={cargandoArchivo}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                  >
                    {cargandoArchivo ? '⏳ Eliminando...' : 'Sí, Eliminar'}
                  </button>
                  <button
                    onClick={() => {
                      setModalMode('view');
                      setSelectedImageIndex(null);
                    }}
                    disabled={cargandoArchivo}
                    className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Modo Preview - Ver imagen en grande */}
            {modalMode === 'preview' && previewImageIndex !== null && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => {
                      setModalMode('view');
                      setPreviewImageIndex(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Volver"
                  >
                    <ChevronUp className="w-5 h-5 rotate-180" />
                  </button>
                  <h3 className="text-lg font-bold text-gray-900">
                    Imagen {previewImageIndex !== null ? previewImageIndex + 1 : '?'}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                    Vista Previa (idx={previewImageIndex})
                  </span>
                </div>

                {/* Imagen en grande - Usar imágenes reales del paciente */}
                <div className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
                  {(() => {
                    if (!imagenPreviewData) {
                      return (
                        <div className="w-full h-96 flex items-center justify-center bg-gray-200">
                          <p className="text-gray-600">Selecciona una imagen</p>
                        </div>
                      );
                    }

                    if (imagenPreviewData?.thumbnail_base64) {
                      // Usar thumbnail si está disponible
                      const url = `data:${imagenPreviewData.mimeType || imagenPreviewData.mime_type || 'image/jpeg'};base64,${imagenPreviewData.thumbnail_base64}`;
                      return (
                        <img
                          src={url}
                          alt={`Imagen ${previewImageIndex + 1}`}
                          className="w-full h-auto max-h-96 object-contain"
                          title={`${imagenPreviewData.nombreArchivo || imagenPreviewData.nombre_archivo || 'Imagen'}`}
                        />
                      );
                    }

                    if (imagenPreviewData?.contenidoImagen) {
                      // Imagen real con base64 completo
                      const url = `data:${imagenPreviewData.tipoContenido || 'image/jpeg'};base64,${imagenPreviewData.contenidoImagen}`;
                      return (
                        <img
                          src={url}
                          alt={`Imagen ${previewImageIndex + 1}`}
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      );
                    }

                    // Fallback: Sin vista previa disponible
                    return (
                      <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                        <div className="text-center">
                          <CloudUpload className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                          <p className="text-amber-700 font-semibold">Sin vista previa</p>
                          <p className="text-xs text-amber-600 mt-2">ID: {imagenPreviewData?.idImagen || imagenPreviewData?.id_imagen}</p>
                          <p className="text-xs text-amber-500 mt-1">{imagenPreviewData?.nombreArchivo || imagenPreviewData?.nombre_archivo || `Imagen ${previewImageIndex + 1}`}</p>
                          <p className="text-xs text-amber-500 mt-3">Haz click en "Ver" en la tabla para ver la imagen completa</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Información de la imagen */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="text-blue-900 font-semibold mb-2">📄 Detalles</p>
                  <div className="space-y-1 text-xs text-blue-800">
                    <p>👤 Paciente: {cargaEdicion.nombrePaciente}</p>
                    <p>🔢 DNI: {cargaEdicion.dni}</p>
                    <p>📅 Imagen: {previewImageIndex + 1} de {cargaEdicion.cantidadImagenes}</p>
                    <p>📝 Fecha carga: 2026-02-09 14:30</p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSelectedImageIndex(previewImageIndex);
                      setModalMode('replace');
                    }}
                    className="py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Reemplazar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedImageIndex(previewImageIndex);
                      setModalMode('delete');
                    }}
                    className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>

                <button
                  onClick={() => {
                    setModalMode('view');
                    setPreviewImageIndex(null);
                  }}
                  className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  Volver a listado
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ Modal de Resultados de Evaluación EKG - Diseño médico profesional */}
      {showResultadosModal && resultadosModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">

            {/* Header compacto */}
            <div className="px-6 py-4 bg-slate-800 rounded-t-2xl flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Informe de Evaluación EKG</p>
                <p className="text-white font-bold text-sm leading-tight">{resultadosModal.nombrePaciente}</p>
                <p className="text-slate-400 text-xs mt-0.5">DNI: {resultadosModal.dni}</p>
              </div>
              <button
                onClick={() => setShowResultadosModal(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-700 p-1.5 rounded-lg transition-colors mt-0.5"
                title="Cerrar"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Resultado principal - Badge grande */}
            <div className={`mx-6 mt-6 rounded-xl px-5 py-4 flex items-center gap-4 ${
              resultadosModal.evaluacion === 'NORMAL'
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                resultadosModal.evaluacion === 'NORMAL' ? 'bg-emerald-500' : 'bg-red-500'
              }`}>
                {resultadosModal.evaluacion === 'NORMAL'
                  ? <Check className="w-7 h-7 text-white" strokeWidth={3} />
                  : <AlertCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
                }
              </div>
              <div>
                <p className={`text-xl font-extrabold tracking-wide ${
                  resultadosModal.evaluacion === 'NORMAL' ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {resultadosModal.evaluacion}
                </p>
                {resultadosModal.fecha && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    Evaluado el {new Date(resultadosModal.fecha).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Secciones de detalle - datos exactos de BD sin modificar */}
            <div className="px-6 py-5 space-y-5">

              {/* Hallazgos - campo directo de BD */}
              {resultadosModal.hallazgos && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-slate-700 rounded-full" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Hallazgos</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">
                    {resultadosModal.hallazgos}
                  </p>
                </div>
              )}

              {/* Separador */}
              {resultadosModal.hallazgos && resultadosModal.observacionesClinicas && (
                <hr className="border-gray-100" />
              )}

              {/* Observaciones Clínicas - campo directo de BD */}
              {resultadosModal.observacionesClinicas && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-slate-700 rounded-full" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Observaciones Clínicas</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">
                    {resultadosModal.observacionesClinicas}
                  </p>
                </div>
              )}

              {/* Separador */}
              {resultadosModal.descripcion && (
                <hr className="border-gray-100" />
              )}

              {/* Informe completo - descripcion_evaluacion exacta de BD */}
              {resultadosModal.descripcion && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-slate-700 rounded-full" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Informe Completo</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">
                    {resultadosModal.descripcion}
                  </p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex items-center justify-between">
              <button
                onClick={descargarComoWord}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors"
                title="Descargar informe en Word"
              >
                <Download className="w-4 h-4" />
                Descargar Word
              </button>
              <button
                onClick={() => setShowResultadosModal(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
