import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Filter,
  Maximize2,
  Save,
  Ruler, // ✅ v9.2.0: Icono para Calipers
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import toast from "react-hot-toast";
import teleecgService from "../../services/teleecgService";
import ImageCanvas from "./ImageCanvas";
import useImageFilters from "./useImageFilters";
import FilterControlsPanel from "./FilterControlsPanel";
import FullscreenImageViewer from "./FullscreenImageViewer";
import CalipersPanel from "./CalipersPanel"; // ✅ v9.2.0: Herramienta de medición de intervalos
import ReferenciaEscalaPanel from "./ReferenciaEscalaPanel"; // ✅ v9.2.0: 4️⃣ Escala de referencia
import GridPanel from "./GridPanel"; // ✅ v9.2.0: 5️⃣ Cuadrícula proporcional con zoom

/**
 * 🏥 MODAL TRIAJE CLÍNICO - EKG (v8.0.0 - Single View)
 *
 * Diseño simplificado y optimizado:
 * - Imagen compacta a la izquierda
 * - Formularios a la derecha (validación + evaluación + plan)
 * - TODO en una sola vista, sin pestañas
 * - Espacio optimizado e intuitivo
 *
 * Versión 8.0.0 (2026-01-21): Refactorización para UX mejorada
 */
export default function ModalEvaluacionECG({
  isOpen,
  ecg,
  onClose,
  onConfirm,
  loading = false,
}) {
  // ════════════════════════════════════════
  // ESTADO GENERAL (v8.0.0 - Single View - Tabs REMOVED)
  // ════════════════════════════════════════
  // ✅ v8.0.0: Refactorización completa - Eliminado sistema de pestañas
  // Ahora: Imagen a la izquierda + Formularios a la derecha (TODO VISIBLE)
  const [imagenesActuales, setImagenesActuales] = useState([]);
  const [indiceImagen, setIndiceImagen] = useState(0);
  const [imagenData, setImagenData] = useState(null);
  const [rotacion, setRotacion] = useState(0);

  // 🎨 Estado para filtros y zoom avanzado (v7.0.0)
  const transformRef = useRef(null);
  const { filters, updateFilter, resetFilters, applyPreset } = useImageFilters();
  const [showFilterControls, setShowFilterControls] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // ✅ v9.2.0: 3️⃣ CALIPERS - Herramienta de medición de intervalos
  const [showCalipers, setShowCalipers] = useState(false);
  const imageRef = useRef(null);

  // ✅ v9.2.0: 4️⃣ ESCALA DE REFERENCIA - Control de calidad ECG
  const [showReferencia, setShowReferencia] = useState(false);

  // ✅ v9.2.0: 5️⃣ CUADRÍCULA PROPORCIONAL - Zoom con grid preservado
  const [showGrid, setShowGrid] = useState(true);
  const [gridZoomLevel, setGridZoomLevel] = useState(100);

  // ════════════════════════════════════════
  // TAB 1.5: VALIDACIÓN DE CALIDAD (v3.1.0)
  // ════════════════════════════════════════
  const [imagenValida, setImagenValida] = useState(null); // true = válida, false = rechazada, null = sin decidir
  const [motivoRechazo, setMotivoRechazo] = useState(""); // MALA_CALIDAD, INCOMPLETA, etc
  const [descripcionRechazo, setDescripcionRechazo] = useState("");

  // ✅ v9.0.0: Constantes de razones clínicas
  const RAZONES_NORMAL = [
    { key: 'ritmoNormal', label: 'Ritmo sinusal normal' },
    { key: 'frecuenciaAdecuada', label: 'Frecuencia cardíaca adecuada (60-100 bpm)' },
    { key: 'sinCambiosAgudos', label: 'Sin cambios agudos de isquemia' },
    { key: 'segmentoSTNormal', label: 'Segmento ST sin elevación/depresión' },
    { key: 'ondaTNormal', label: 'Onda T normal en todas las derivaciones' },
    { key: 'intervalosPR_QTNormales', label: 'Intervalos PR y QT normales' },
  ];

  const RAZONES_ANORMAL = [
    { key: 'ritmoAnormal', label: 'Arritmia (fibrilación auricular, flutter, etc.)' },
    { key: 'frecuenciaAnormal', label: 'Bradicardia (<60 bpm) o Taquicardia (>100 bpm)' },
    { key: 'cambiosEn_ST', label: 'Elevación o depresión del segmento ST' },
    { key: 'ondaTInvertida', label: 'Inversión de onda T patológica' },
    { key: 'bloqueoCardiaco', label: 'Bloqueo AV o de rama (BRDHH, BRIHH)' },
    { key: 'hipertrofia', label: 'Signos de hipertrofia ventricular' },
    { key: 'isquemiaActiva', label: 'Signos de isquemia miocárdica activa' },
    { key: 'intervaloQTprolongado', label: 'Intervalo QT prolongado (>450ms)' },
  ];

  const MOTIVOS_RECHAZO = [
    { valor: "MALA_CALIDAD", etiqueta: "Mala calidad / Pixelada" },
    { valor: "INCOMPLETA", etiqueta: "Imagen cortada / Incompleta" },
    { valor: "ARTEFACTO", etiqueta: "Artefacto de movimiento" },
    { valor: "CALIBRACION", etiqueta: "Calibración incorrecta" },
    { valor: "NO_PACIENTE", etiqueta: "No corresponde al paciente" },
    { valor: "FORMATO_INVALIDO", etiqueta: "Formato de archivo inválido" },
    { valor: "OTRO", etiqueta: "Otro motivo" },
  ];

  // ✅ v9.1.0: 1️⃣ CLASIFICACIÓN DE URGENCIA MÉDICA (CRÍTICO PARA TRIAGE)
  const URGENCIAS = [
    { key: 'NORMAL', label: '✅ Normal', color: 'green', desc: 'Seguimiento en próxima cita' },
    { key: 'CAMBIOS_INESPECIFICOS', label: '⏳ Cambios inespecíficos', color: 'yellow', desc: 'Seguimiento en 3 meses' },
    { key: 'PATOLOGICO', label: '⚠️ Patológico', color: 'orange', desc: 'Interconsulta cardio en 1-2 semanas' },
    { key: 'EMERGENCIA', label: '🚨 EMERGENCIA', color: 'red', desc: 'Derivar a ER AHORA' },
  ];

  // ✅ v9.1.0: 2️⃣ CONTEXTO CLÍNICO
  const PRESENTACION_CLINICA = [
    { key: 'asintomatico', label: 'Asintomático' },
    { key: 'doloPecho', label: 'Dolor de pecho opresivo' },
    { key: 'disnea', label: 'Disnea / Falta de aire' },
    { key: 'sincope', label: 'Síncope' },
    { key: 'presincope', label: 'Presíncope / Mareo' },
    { key: 'palpitaciones', label: 'Palpitaciones' },
  ];

  // ✅ v9.1.0: 3️⃣ DERIVACIONES ESPECÍFICAS POR PARED/ARTERIA
  const DERIVACIONES = [
    { key: 'anterior', label: 'Anterior (V1-V3)', arteria: 'LAD' },
    { key: 'anterolateral', label: 'Anterolateral (V3-V5)', arteria: 'LAD/Diagonal' },
    { key: 'lateral', label: 'Lateral (I, aVL, V5-V6)', arteria: 'Circunfleja' },
    { key: 'inferior', label: 'Inferior (II, III, aVF)', arteria: 'RCA' },
    { key: 'ventriculo_derecho', label: 'Ventrículo Derecho (V4R)', arteria: 'RCA' },
  ];

  // ════════════════════════════════════════
  // TAB 2: EVALUACIÓN
  // ════════════════════════════════════════
  const [observacionesEval, setObservacionesEval] = useState("");
  const [tipoEvaluacion, setTipoEvaluacion] = useState(""); // NORMAL, ANORMAL, NO_DIAGNOSTICO
  const [guardando, setGuardando] = useState(false); // ✅ v9.0.0: Estado para loading
  const [motivoNoDiagnostico, setMotivoNoDiagnostico] = useState(""); // ✅ v9.2.0: 8️⃣ Motivo obligatorio para NO_DIAGNOSTICO

  // ✅ v9.0.0: Razones preseleccionadas según tipo de evaluación (actualizado con nuevas keys)
  const [razonesNormal, setRazonesNormal] = useState({
    ritmoNormal: false,
    frecuenciaAdecuada: false,
    sinCambiosAgudos: false,
    segmentoSTNormal: false,
    ondaTNormal: false,
    intervalosPR_QTNormales: false,
  });

  const [razonesAnormal, setRazonesAnormal] = useState({
    ritmoAnormal: false,
    frecuenciaAnormal: false,
    cambiosEn_ST: false,
    ondaTInvertida: false,
    bloqueoCardiaco: false,
    hipertrofia: false,
    isquemiaActiva: false,
    intervaloQTprolongado: false,
  });

  // ✅ v11.4.0: DIAGNÓSTICOS ESTRUCTURADOS (Ritmo, Intervalo PR, QRS)
  const [diagnosticoRitmo, setDiagnosticoRitmo] = useState("");
  const [diagnosticoPR, setDiagnosticoPR] = useState("");
  const [diagnosticoQRS, setDiagnosticoQRS] = useState("");

  // ✅ v9.1.0: URGENCIA MÉDICA
  const [urgencia, setUrgencia] = useState("");

  // ✅ v9.1.0: CONTEXTO CLÍNICO DEL PACIENTE
  const [contextoClinico, setContextoClinico] = useState({
    presentacionClinica: [], // Array de síntomas: asintomatico, doloPecho, disnea, etc.
    troponinaNegativa: null, // true=negativa, false=positiva, null=sin dato
    antecedentesRelevantes: "", // Texto: HTA, DM, Cardiopatía previa, etc.
    medicacionesActuales: "", // Para correlacionar drogas que alteran ECG
  });

  // ✅ v9.1.0: DERIVACIONES ESPECÍFICAS AFECTADAS
  const [derivacionesSeleccionadas, setDerivacionesSeleccionadas] = useState([]);

  // ════════════════════════════════════════
  // TAB 3: PLAN DE SEGUIMIENTO (v11.0.0 - Recitación e Interconsulta Separadas)
  // ══════════════════════════════════════════════════════════════════════════════
  const [planSeguimiento, setPlanSeguimiento] = useState({
    // RECITACIÓN (Control en 3 meses)
    recitarEnTresMeses: false,
    recitarEspecialidad: "", // especialidad para recitación (ej: Cardiología)
    // INTERCONSULTA (Derivación a otro especialista)
    interconsulta: false,
    interconsultaEspecialidades: [], // array de especialidades para interconsulta
  });

  // 🏥 Estado para interconsulta - input de búsqueda
  const [interconsultaBusqueda, setInterconsultaBusqueda] = useState("");
  const [especialidades, setEspecialidades] = useState([]);  // Para future autocomplete

  const textareaEvalRef = useRef(null);
  const textareaNotaRef = useRef(null);

  // ════════════════════════════════════════
  // CARGAR IMÁGENES AL ABRIR MODAL
  // ════════════════════════════════════════
  useEffect(() => {
    if (isOpen && ecg) {
      console.log("📋 Objeto EKG recibido en Modal:", ecg);
      cargarImagenes();
      cargarEspecialidades();
    }
  }, [isOpen, ecg]);

  // ════════════════════════════════════════
  // CARGAR ESPECIALIDADES (v1.27.0)
  // ════════════════════════════════════════
  const cargarEspecialidades = async () => {
    try {
      console.log("📚 Cargando especialidades médicas...");
      const data = await teleecgService.obtenerEspecialidades();
      setEspecialidades(data || []);
      console.log("✅ Especialidades cargadas:", data?.length || 0);
    } catch (error) {
      console.error("❌ Error cargando especialidades:", error);
      setEspecialidades([]);
    }
  };

  const cargarImagenes = async () => {
    try {
      // Soporta array (agrupadas) o imagen única
      const tieneImagenes = ecg.imagenes && Array.isArray(ecg.imagenes);
      const imagenes = tieneImagenes ? ecg.imagenes : [ecg];

      setImagenesActuales(imagenes);
      setIndiceImagen(0);
      console.log("✅ Imágenes cargadas:", imagenes.length);

      // Cargar primera imagen
      if (imagenes.length > 0) {
        await cargarImagenIndice(0, imagenes);
      }
    } catch (error) {
      console.error("❌ Error cargando imágenes:", error);
    }
  };

  const cargarImagenIndice = async (index, imagenes) => {
    try {
      const imagen = imagenes[index];
      const idImagen = imagen?.id_imagen || imagen?.idImagen;

      console.log(`📸 Cargando imagen ${index + 1} (ID: ${idImagen})`);

      // Restablecer zoom, rotación y filtros al cambiar imagen
      try {
        if (transformRef.current?.resetTransform) {
          transformRef.current.resetTransform();
        }
        setRotacion(0);
        if (typeof resetFilters === 'function') {
          resetFilters();
        }
        setShowFilterControls(false);
      } catch (e) {
        console.warn("⚠️ Aviso al resetear filtros:", e.message);
      }
      setImagenData(null); // Mostrar loading

      // Intentar preview, si falla descargar directamente
      try {
        const data = await teleecgService.verPreview(idImagen);
        // Convertir a data URL si es objeto con contenidoImagen
        if (data && data.contenidoImagen) {
          const tipoContenido = data.tipoContenido || 'image/jpeg';
          const dataUrl = `data:${tipoContenido};base64,${data.contenidoImagen}`;
          setImagenData(dataUrl);
        } else if (typeof data === 'string' && data.startsWith('data:')) {
          // Ya es un data URL
          setImagenData(data);
        } else {
          console.warn("⚠️ Formato de respuesta no reconocido:", data);
          setImagenData(null);
        }
      } catch (previewError) {
        console.warn("⚠️ Preview no disponible, descargando directamente...");
        try {
          const data = await teleecgService.descargarImagenBase64(idImagen);
          if (data && data.contenidoImagen) {
            const tipoContenido = data.tipoContenido || 'image/jpeg';
            const dataUrl = `data:${tipoContenido};base64,${data.contenidoImagen}`;
            setImagenData(dataUrl);
          } else if (typeof data === 'string' && data.startsWith('data:')) {
            setImagenData(data);
          } else {
            setImagenData(null);
          }
        } catch (downloadError) {
          console.error("❌ Error descargando imagen:", downloadError);
          setImagenData(null);
        }
      }
    } catch (error) {
      console.error("❌ Error cargando imagen:", error);
      setImagenData(null);
    }
  };

  // ════════════════════════════════════════
  // NAVEGACIÓN DE IMÁGENES
  // ════════════════════════════════════════
  const irImagenAnterior = () => {
    if (indiceImagen > 0) {
      setIndiceImagen(indiceImagen - 1);
      cargarImagenIndice(indiceImagen - 1, imagenesActuales);
    }
  };

  const irImagenSiguiente = () => {
    if (indiceImagen < imagenesActuales.length - 1) {
      setIndiceImagen(indiceImagen + 1);
      cargarImagenIndice(indiceImagen + 1, imagenesActuales);
    }
  };

  // ════════════════════════════════════════
  // CONTROLES DE IMAGEN (v7.0.0)
  // ════════════════════════════════════════
  const handleZoomMas = () => {
    if (transformRef.current?.zoomIn) {
      transformRef.current.zoomIn(0.2);
      // ✅ v9.2.0: 5️⃣ Actualizar zoom nivel de cuadrícula
      setTimeout(() => {
        setGridZoomLevel(getCurrentZoomPercentage());
      }, 50);
    }
  };

  const handleZoomMenos = () => {
    if (transformRef.current?.zoomOut) {
      transformRef.current.zoomOut(0.2);
      // ✅ v9.2.0: 5️⃣ Actualizar zoom nivel de cuadrícula
      setTimeout(() => {
        setGridZoomLevel(getCurrentZoomPercentage());
      }, 50);
    }
  };

  const rotarImagen = () => setRotacion((rotacion + 90) % 360);

  const handleResetAll = () => {
    // Reset zoom
    if (transformRef.current?.resetTransform) {
      transformRef.current.resetTransform();
    }
    // Reset rotación y filtros
    setRotacion(0);
    resetFilters();
    setShowFilterControls(false);
    // ✅ v9.2.0: 5️⃣ Reset zoom nivel de cuadrícula
    setGridZoomLevel(100);
  };

  const getCurrentZoomPercentage = () => {
    if (transformRef.current?.state?.scale) {
      return Math.round(transformRef.current.state.scale * 100);
    }
    return 100;
  };

  // ════════════════════════════════════════
  // ATAJOS DE TECLADO
  // ════════════════════════════════════════
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e) => {
      // No activar atajos si estamos escribiendo en textarea o input
      const activeElement = document.activeElement;
      const isTypingInField = activeElement?.tagName === "TEXTAREA" || activeElement?.tagName === "INPUT";

      // Atajos globales (v8.0.0: Ya no hay pestañas, todos los atajos siempre están disponibles)
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleGuardar();
      } else if (e.key === "e" || e.key === "E") {
        // Fullscreen
        if (!isTypingInField) {
          e.preventDefault();
          setShowFullscreen(true);
        }
      }

      // Atajos de navegación de imagen (v8.0.0: Siempre disponibles en la columna izquierda)
      if (e.key === "ArrowLeft") {
        if (!isTypingInField) irImagenAnterior();
      } else if (e.key === "ArrowRight") {
        if (!isTypingInField) irImagenSiguiente();
      } else if (e.key === "+" || e.key === "=") {
        // Zoom in
        if (!isTypingInField) {
          e.preventDefault();
          handleZoomMas();
        }
      } else if (e.key === "-") {
        // Zoom out
        if (!isTypingInField) {
          e.preventDefault();
          handleZoomMenos();
        }
      } else if (e.key === "i" || e.key === "I") {
        // Toggle invert
        if (!isTypingInField) {
          e.preventDefault();
          updateFilter("invert", !filters.invert);
        }
      } else if (e.key === "f" || e.key === "F") {
        // Toggle filter panel
        if (!isTypingInField) {
          e.preventDefault();
          setShowFilterControls(!showFilterControls);
        }
      } else if (e.key === "0") {
        // Reset all
        if (!isTypingInField) {
          e.preventDefault();
          handleResetAll();
        }
      } else if (e.key === "r" || e.key === "R") {
        // Rotate
        if (!isTypingInField) {
          e.preventDefault();
          rotarImagen();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, indiceImagen, filters, updateFilter, resetFilters]);

  // ════════════════════════════════════════
  // ✅ v9.0.0: FUNCIONES HELPER PARA VALIDACIÓN
  // ════════════════════════════════════════

  // Construir texto de evaluación completo con hallazgos
  const construirTextoEvaluacion = () => {
    let texto = `EVALUACIÓN: ${tipoEvaluacion}\n\n`;

    if (tipoEvaluacion === "NORMAL") {
      const seleccionados = RAZONES_NORMAL.filter(r => razonesNormal[r.key]);
      if (seleccionados.length > 0) {
        texto += "HALLAZGOS NORMALES:\n";
        seleccionados.forEach(r => texto += `- ${r.label}\n`);
        texto += "\n";
      }
    }

    if (tipoEvaluacion === "ANORMAL") {
      const seleccionados = RAZONES_ANORMAL.filter(r => razonesAnormal[r.key]);
      if (seleccionados.length > 0) {
        texto += "HALLAZGOS ANORMALES:\n";
        seleccionados.forEach(r => texto += `- ${r.label}\n`);
        texto += "\n";
      }
    }

    texto += "OBSERVACIONES CLÍNICAS:\n";
    texto += observacionesEval.trim();

    return texto;
  };

  // Validar si puede guardar
  const puedeGuardar = () => {
    if (!tipoEvaluacion) return false;
    if (!observacionesEval.trim() || observacionesEval.trim().length < 10) return false;

    if (tipoEvaluacion === "NORMAL") {
      return Object.values(razonesNormal).some(v => v === true);
    }
    if (tipoEvaluacion === "ANORMAL") {
      return Object.values(razonesAnormal).some(v => v === true);
    }

    return true; // NO_DIAGNOSTICO no requiere razones
  };

  // ════════════════════════════════════════
  // GUARDAR - CONSOLIDAR TODOS LOS DATOS
  // ════════════════════════════════════════
  // ════════════════════════════════════════════════════════════════
  // v3.1.0: RECHAZAR IMAGEN POR VALIDACIÓN DE CALIDAD
  // ════════════════════════════════════════════════════════════════
  const handleRechazar = async () => {
    // Validar que haya motivo
    if (!motivoRechazo) {
      toast.error("❌ Debes seleccionar un motivo de rechazo");
      return;
    }

    try {
      const imagenActual = imagenesActuales[indiceImagen];
      const idImagen = imagenActual?.id_imagen || imagenActual?.idImagen;

      if (!idImagen) {
        toast.error("❌ No se pudo obtener el ID de la imagen");
        return;
      }

      console.log("❌ Rechazando imagen:", { idImagen, motivoRechazo, descripcionRechazo });

      // Llamar al servicio para rechazar
      await teleecgService.rechazarImagen(idImagen, motivoRechazo, descripcionRechazo.trim());
      toast.success(`✅ Imagen rechazada: ${motivoRechazo}`);
      toast.info("ℹ️ IPRESS ha sido notificado para cargar nuevamente");

      limpiarFormulario();
      onClose();
    } catch (error) {
      console.error("❌ Error al rechazar:", error);
      toast.error("Error al rechazar la imagen");
    }
  };

    // ════════════════════════════════════════
  // HANDLER PARA REMOVER ESPECIALIDAD (v11.0.0)
  // ════════════════════════════════════════
  const handleRemoveInterconsultaEspecialidad = (descripcion) => {
    setPlanSeguimiento({
      ...planSeguimiento,
      interconsultaEspecialidades: planSeguimiento.interconsultaEspecialidades.filter(
        (e) => e !== descripcion
      ),
    });
  };


  const handleGuardar = async () => {
    // ✅ v9.0.0: VALIDACIONES ESTRICTAS EN TRES NIVELES

    // 1️⃣ Validar que tipo de evaluación esté seleccionado
    if (!tipoEvaluacion) {
      toast.error("❌ Debes seleccionar Normal, Anormal o No Diagnóstico");
      return;
    }

    // 2️⃣ Validar razones (al menos 1 checkbox marcado para NORMAL/ANORMAL)
    if (tipoEvaluacion === "NORMAL") {
      const algunaRazonNormal = Object.values(razonesNormal).some(v => v === true);
      if (!algunaRazonNormal) {
        toast.error("❌ Debes seleccionar al menos 1 hallazgo que justifique evaluación NORMAL");
        return;
      }
    }

    if (tipoEvaluacion === "ANORMAL") {
      const algunaRazonAnormal = Object.values(razonesAnormal).some(v => v === true);
      if (!algunaRazonAnormal) {
        toast.error("❌ Debes seleccionar al menos 1 hallazgo que justifique evaluación ANORMAL");
        return;
      }
    }

    // 3️⃣ Validar observaciones clínicas (mínimo 10 caracteres)
    if (!observacionesEval.trim() || observacionesEval.trim().length < 10) {
      toast.error("❌ Las observaciones clínicas deben tener al menos 10 caracteres");
      return;
    }

    // ✅ v9.1.0: 4️⃣ VALIDACIÓN CARDIOLÓGICA - Si es ANORMAL, DEBE tener urgencia + contexto
    if (tipoEvaluacion === "ANORMAL" && !urgencia) {
      toast.error("🚨 CRÍTICO: Si es ANORMAL debes clasificar la URGENCIA (normal/cambios_inespecíficos/patológico/emergencia)");
      return;
    }

    // ✅ v9.1.0: 5️⃣ Si tiene dolor de pecho, avisar si urgencia no es EMERGENCIA
    if (contextoClinico.presentacionClinica.includes('doloPecho') && urgencia !== 'EMERGENCIA') {
      toast.error("⚠️ ADVERTENCIA: Dolor de pecho + evaluación ANORMAL probable requiere EMERGENCIA");
      return;
    }

    // ✅ v9.2.0: 6️⃣ 8️⃣ VALIDACIÓN FLUJO - Si es NO_DIAGNOSTICO, DEBE tener motivo técnico
    if (tipoEvaluacion === "NO_DIAGNOSTICO") {
      if (!motivoNoDiagnostico.trim() || motivoNoDiagnostico.trim().length < 10) {
        toast.error("❌ REQUERIDO: Debes explicar el motivo de 'No Diagnóstico' (mínimo 10 caracteres)");
        return;
      }
    }

    try {
      setGuardando(true);

      const imagenActual = imagenesActuales[indiceImagen];
      const idImagen = imagenActual?.id_imagen || imagenActual?.idImagen;

      if (!idImagen) {
        toast.error("❌ No se pudo obtener el ID de la imagen");
        setGuardando(false);
        return;
      }

      // Construir evaluación completa con hallazgos
      const evaluacionCompleta = construirTextoEvaluacion();
      console.log("📝 Evaluación generada:", evaluacionCompleta);

      // ✅ v9.1.0: Logging de contexto cardiológico
      console.log("🩺 v9.1.0 - Contexto Cardiológico:", {
        urgencia,
        presentacionClinica: contextoClinico.presentacionClinica,
        troponinaNegativa: contextoClinico.troponinaNegativa,
        antecedentes: contextoClinico.antecedentesRelevantes,
        derivaciones: derivacionesSeleccionadas,
      });

      // 1️⃣ Guardar evaluación con texto completo (hallazgos + observaciones + urgencia + contexto)
      await onConfirm(tipoEvaluacion, evaluacionCompleta, idImagen, {
        urgencia,
        contextoClinico,
        derivacionesSeleccionadas,
        motivoNoDiagnostico: tipoEvaluacion === "NO_DIAGNOSTICO" ? motivoNoDiagnostico : null, // ✅ v9.2.0: 8️⃣ Enviar motivo
        diagnosticoRitmo,  // ✅ v1.29.0: Diagnósticos estructurados
        diagnosticoPR,     // ✅ v1.29.0: Diagnósticos estructurados
        diagnosticoQRS,    // ✅ v1.29.0: Diagnósticos estructurados
      });
      toast.success(`✅ Evaluación guardada correctamente como ${tipoEvaluacion}`, {
        duration: 3000,
        icon: '🩺',
      });

      // 2️⃣ Guardar Plan de Seguimiento (v11.0.0 - Recitación + Interconsulta)
      const hayRecitacion = planSeguimiento.recitarEnTresMeses && planSeguimiento.recitarEspecialidad;
      const hayInterconsulta = planSeguimiento.interconsulta && planSeguimiento.interconsultaEspecialidades.length > 0;
      if (hayRecitacion || hayInterconsulta) {
        try {
          await teleecgService.guardarNotaClinica(idImagen, {
            hallazgos: {}, // Ya no se usa, pero se envía vacío para compatibilidad
            observacionesClinicas: "",
            planSeguimiento,
          });
          toast.success(`✅ Plan de seguimiento guardado`);
        } catch (notaError) {
          console.error("⚠️ Advertencia: Plan no se guardó:", notaError);
          toast.error("⚠️ Evaluación guardada, pero hubo error en plan de seguimiento");
        }
      }

      // Esperar a que se muestre el toast antes de cerrar
      await new Promise(resolve => setTimeout(resolve, 800));

      limpiarFormulario();
      onClose();
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      toast.error("❌ Error al guardar evaluación. Por favor, intenta nuevamente.", {
        duration: 4000,
      });
    } finally {
      setGuardando(false);
    }
  };

  // ✅ v9.0.0: Actualizado con nuevas keys de RAZONES
  const limpiarFormulario = () => {
    setObservacionesEval("");
    setTipoEvaluacion("");
    setRazonesNormal({
      ritmoNormal: false,
      frecuenciaAdecuada: false,
      sinCambiosAgudos: false,
      segmentoSTNormal: false,
      ondaTNormal: false,
      intervalosPR_QTNormales: false,
    });
    setRazonesAnormal({
      ritmoAnormal: false,
      frecuenciaAnormal: false,
      cambiosEn_ST: false,
      ondaTInvertida: false,
      bloqueoCardiaco: false,
      hipertrofia: false,
      isquemiaActiva: false,
      intervaloQTprolongado: false,
    });
    setImagenValida(null); // Resetear validación
    setMotivoRechazo("");
    setDescripcionRechazo("");
    // ✅ v9.1.0: Resetear nuevos estados cardiológicos
    setUrgencia("");
    setContextoClinico({
      presentacionClinica: [],
      troponinaNegativa: null,
      antecedentesRelevantes: "",
      medicacionesActuales: "",
    });
    setDerivacionesSeleccionadas([]);
    // ✅ v9.2.0: 8️⃣ Resetear motivo de No Diagnóstico
    setMotivoNoDiagnostico("");
    // ✅ v11.4.0: Resetear diagnósticos estructurados
    setDiagnosticoRitmo("");
    setDiagnosticoPR("");
    setDiagnosticoQRS("");
    // ✅ v11.0.0: Resetear plan de seguimiento
    setPlanSeguimiento({
      recitarEnTresMeses: false,
      recitarEspecialidad: "",
      interconsulta: false,
      interconsultaEspecialidades: [],
    });
    setInterconsultaBusqueda("");
  };

  if (!isOpen) return null;


  // ════════════════════════════════════════
  // RENDER: Single View Layout (v8.0.0)
  // ════════════════════════════════════════
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* ✅ v9.2.0: HEADER CON CONTEXTO CLÍNICO PERMANENTE - Paciente + IPRESS Origen */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-800 to-blue-950 text-white">
          <div className="flex-1">
            <h2 className="text-xl font-bold">🏥 Triaje Clínico - EKG</h2>
            {/* 1️⃣ v9.2.0: Datos Paciente SIEMPRE VISIBLES */}
            <div className="flex flex-wrap gap-3 text-xs text-blue-100 mt-2 pt-2 border-t border-blue-700">
              {/* Paciente */}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-blue-300">👤 Paciente:</span>
                <span className="font-mono bg-blue-900/40 px-2 py-1 rounded">{ecg?.nombres_paciente || ecg?.nombrePaciente} {ecg?.apellidos_paciente}</span>
              </div>
              {/* DNI */}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-blue-300">🆔 DNI:</span>
                <span className="font-mono bg-blue-900/40 px-2 py-1 rounded font-bold text-blue-100">{ecg?.num_doc_paciente}</span>
              </div>
              {/* 1️⃣ v9.2.0: IPRESS ORIGEN PERMANENTE */}
              {(ecg?.nombre_ipress || ecg?.nombreIpress) && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-blue-300">🏢 IPRESS:</span>
                  <span className="font-mono bg-green-900/40 px-2 py-1 rounded text-green-100">{ecg?.nombre_ipress || ecg?.nombreIpress}</span>
                </div>
              )}
              {ecg?.codigo_ipress && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-blue-300">Código:</span>
                  <span className="font-mono bg-blue-900/40 px-2 py-1 rounded text-xs">{ecg?.codigo_ipress}</span>
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 ml-4 flex-shrink-0"><X size={20} /></button>
        </div>

        {/* DOS COLUMNAS: Imagen (60%) + Formularios (40%) */}
        <div className="flex-1 flex overflow-hidden">
          {/* COLUMNA IZQUIERDA: IMAGEN + CARRUSEL */}
          <div className="flex-1 flex flex-col bg-gray-50 p-4 overflow-y-auto border-r">
            {/* Imagen */}
            <div className="flex-1 bg-white rounded-lg p-3 flex flex-col min-h-0">
              {imagenData ? (
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <TransformWrapper ref={transformRef} initialScale={1} minScale={0.5} maxScale={5} centerOnInit wheel={{ step: 0.1 }}>
                    {({ zoomIn, zoomOut, resetTransform }) => (
                      <TransformComponent wrapperClass="flex-1 flex items-center justify-center" contentClass="cursor-move">
                        <ImageCanvas imageSrc={imagenData} rotation={rotacion} filters={filters} />
                      </TransformComponent>
                    )}
                  </TransformWrapper>
                </div>
              ) : (
                <div className="flex items-center justify-center text-gray-400">
                  <AlertCircle size={40} />
                  <p className="ml-2">Cargando imagen...</p>
                </div>
              )}

              {/* Controles Compactos */}
              <div className="flex gap-1 mt-2 justify-center flex-wrap">
                <button onClick={handleZoomMenos} className="p-1.5 hover:bg-gray-200 rounded" title="Zoom -"><ZoomOut size={16} /></button>
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded">{getCurrentZoomPercentage()}%</span>
                <button onClick={handleZoomMas} className="p-1.5 hover:bg-gray-200 rounded" title="Zoom +"><ZoomIn size={16} /></button>
                <div className="w-px bg-gray-300" />
                <button onClick={rotarImagen} className="p-1.5 hover:bg-gray-200 rounded" title="Rotar"><RotateCw size={16} /></button>
                <button onClick={() => setShowFilterControls(!showFilterControls)} className={`p-1.5 rounded transition-colors ${showFilterControls ? 'bg-indigo-200 text-indigo-600' : 'hover:bg-gray-200'}`} title="Filtros avanzados"><Filter size={16} /></button>
                {/* ✅ v9.2.0: 3️⃣ Botón CALIPERS para medir intervalos */}
                <button onClick={() => setShowCalipers(!showCalipers)} className={`p-1.5 rounded transition-colors ${showCalipers ? 'bg-cyan-200 text-cyan-600' : 'hover:bg-gray-200'}`} title="Calipers - Medir intervalos"><Ruler size={16} /></button>
                {/* ✅ v9.2.0: 4️⃣ Botón ESCALA DE REFERENCIA para validar calidad */}
                <button onClick={() => setShowReferencia(!showReferencia)} className={`p-1.5 rounded transition-colors ${showReferencia ? 'bg-indigo-200 text-indigo-600' : 'hover:bg-gray-200'}`} title="Escala de referencia - Control de calidad"><span className="text-sm font-bold">📐</span></button>
                {/* ✅ v9.2.0: 5️⃣ Botón GRID para mostrar cuadrícula proporcional */}
                <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded transition-colors ${showGrid ? 'bg-pink-200 text-pink-600' : 'hover:bg-gray-200'}`} title="Cuadrícula ECG proporcional"><span className="text-sm font-bold">🔲</span></button>
                <div className="w-px bg-gray-300" />
                <button onClick={() => setShowFullscreen(true)} className="p-1.5 hover:bg-purple-200 rounded transition-colors text-purple-600 hover:text-purple-700" title="Expandir a pantalla completa (E)"><Maximize2 size={16} /></button>
              </div>

            </div>

            {/* Navegación Imágenes */}
            <div className="flex items-center justify-between mt-2 text-sm">
              <button onClick={irImagenAnterior} disabled={indiceImagen === 0} className="px-2 py-1 rounded disabled:opacity-50">← Anterior</button>
              <span>Imagen {indiceImagen + 1} de {imagenesActuales.length}</span>
              <button onClick={irImagenSiguiente} disabled={indiceImagen === imagenesActuales.length - 1} className="px-2 py-1 rounded disabled:opacity-50">Siguiente →</button>
            </div>
          </div>

          {/* COLUMNA DERECHA: FORMULARIOS */}
          <div className="w-96 flex flex-col bg-white overflow-y-auto border-l">
            <div className="p-4 space-y-3 text-sm">

              {/* INFO PACIENTE - ✅ v9.0.0: Accesibilidad WCAG AAA */}
              <div className="bg-blue-100 p-3 rounded-lg border-2 border-blue-400 shadow-sm">
                <p className="font-bold text-blue-950 text-sm">{imagenesActuales.length} EKGs</p>
                <p className="text-sm text-blue-900 font-medium">Imagen actual {indiceImagen + 1} de {imagenesActuales.length}</p>
              </div>

              {/* ✅ v9.2.0: 3️⃣ PANEL DE CALIPERS - Herramienta de Medición de Intervalos */}
              {showCalipers && (
                <CalipersPanel
                  imagenRef={imageRef}
                  onMeasurement={(medicion) => {
                    console.log("📏 v9.2.0 - Medición registrada:", medicion);
                  }}
                />
              )}

              {/* ✅ v9.2.0: 4️⃣ PANEL DE ESCALA - Control de Calidad ECG */}
              {showReferencia && <ReferenciaEscalaPanel />}

              {/* ✅ v9.2.0: 5️⃣ PANEL DE CUADRÍCULA - Zoom Proporcional ECG */}
              {showGrid && <GridPanel zoomLevel={gridZoomLevel} onGridToggle={() => setShowGrid(!showGrid)} />}

              {/* VALIDACIÓN CALIDAD */}
              {imagenValida === null && (
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <p className="font-semibold text-amber-900 mb-2 text-xs">¿Imagen válida?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setImagenValida(true)} className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">✓ Válida</button>
                    <button onClick={() => { setImagenValida(false); }} className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">✗ Rechazar</button>
                  </div>
                </div>
              )}

              {/* FORMULARIO DE RECHAZO */}
              {imagenValida === false && (
                <div className="bg-red-50 p-2.5 rounded-lg border border-red-200">
                  <p className="font-semibold text-red-900 mb-2 text-xs">Motivo del Rechazo</p>
                  <select
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                  >
                    <option value="">Seleccionar motivo...</option>
                    {MOTIVOS_RECHAZO.map(m => (
                      <option key={m.valor} value={m.valor}>{m.etiqueta}</option>
                    ))}
                  </select>
                  <textarea
                    value={descripcionRechazo}
                    onChange={(e) => setDescripcionRechazo(e.target.value)}
                    placeholder="Descripción adicional (opcional)..."
                    className="w-full p-1.5 text-xs border rounded resize-none h-12 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {imagenValida === true && (
                <>
                  {/* ✅ v9.0.0: EVALUACIÓN CON HALLAZGOS ESTRUCTURADOS Y COLORES SEMÁNTICOS */}
                  <div className={`p-3 rounded-lg border-2 transition-all ${
                    tipoEvaluacion === "NORMAL" ? "bg-green-50 border-green-400" :
                    tipoEvaluacion === "ANORMAL" ? "bg-orange-50 border-orange-400" :
                    tipoEvaluacion === "NO_DIAGNOSTICO" ? "bg-gray-50 border-gray-400" :
                    "bg-green-50 border-green-200"
                  }`}>
                    <p className={`font-semibold mb-2 text-xs ${
                      tipoEvaluacion === "NORMAL" ? "text-green-900" :
                      tipoEvaluacion === "ANORMAL" ? "text-orange-900" :
                      tipoEvaluacion === "NO_DIAGNOSTICO" ? "text-gray-900" :
                      "text-green-900"
                    }`}>Evaluación Médica</p>

                    {/* ✅ v9.2.0: 7️⃣ Radio Buttons - Colores VIBRANTES con diferenciación visual */}
                    <div className="space-y-2 mb-2">
                      {/* NORMAL - Verde */}
                      <label className={`flex items-center gap-2 cursor-pointer text-xs p-2 rounded-lg transition-all shadow-sm ${
                        tipoEvaluacion === "NORMAL"
                          ? "bg-green-100 border-2 border-green-600 ring-2 ring-green-300"
                          : "bg-gray-50 border border-gray-200 hover:bg-green-50"
                      }`}>
                        <input type="radio" checked={tipoEvaluacion === "NORMAL"} onChange={() => setTipoEvaluacion("NORMAL")} className="w-4 h-4 accent-green-600" />
                        <span className={`font-bold ${tipoEvaluacion === "NORMAL" ? "text-green-900" : "text-gray-600"}`}>✓ Normal</span>
                      </label>

                      {/* ANORMAL - NARANJA VIBRANTE (v9.2.0) */}
                      <label className={`flex items-center gap-2 cursor-pointer text-xs p-3 rounded-lg transition-all shadow-md hover:shadow-lg ${
                        tipoEvaluacion === "ANORMAL"
                          ? "bg-orange-200 border-3 border-orange-600 ring-2 ring-orange-400 shadow-lg"
                          : "bg-gray-50 border border-gray-200 hover:bg-orange-50"
                      }`}>
                        <input type="radio" checked={tipoEvaluacion === "ANORMAL"} onChange={() => setTipoEvaluacion("ANORMAL")} className="w-4 h-4 accent-orange-600" />
                        <span className={`font-bold text-lg ${tipoEvaluacion === "ANORMAL" ? "text-orange-950" : "text-gray-600"}`}>⚠️ ANORMAL</span>
                        {tipoEvaluacion === "ANORMAL" && <span className="ml-auto text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">ALERTA</span>}
                      </label>

                      {/* NO_DIAGNOSTICO - Gris */}
                      <label className={`flex items-center gap-2 cursor-pointer text-xs p-2 rounded-lg transition-all shadow-sm ${
                        tipoEvaluacion === "NO_DIAGNOSTICO"
                          ? "bg-gray-200 border-2 border-gray-600 ring-2 ring-gray-300"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      }`}>
                        <input type="radio" checked={tipoEvaluacion === "NO_DIAGNOSTICO"} onChange={() => setTipoEvaluacion("NO_DIAGNOSTICO")} className="w-4 h-4 accent-gray-600" />
                        <span className={`font-bold ${tipoEvaluacion === "NO_DIAGNOSTICO" ? "text-gray-900" : "text-gray-600"}`}>❔ No Diagnóstico</span>
                      </label>
                    </div>

                    {/* ✅ v9.0.0: CHECKBOXES DE HALLAZGOS PARA NORMAL */}
                    {tipoEvaluacion === "NORMAL" && (
                      <div className="mt-2 space-y-1 bg-green-100 p-2 rounded border border-green-300">
                        <p className="text-xs font-bold text-green-900 mb-1">Hallazgos que justifican evaluación NORMAL:</p>
                        {RAZONES_NORMAL.map(razon => (
                          <label key={razon.key} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-green-200 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={razonesNormal[razon.key] || false}
                              onChange={(e) => setRazonesNormal({...razonesNormal, [razon.key]: e.target.checked})}
                              className="w-3 h-3"
                            />
                            <span className="text-green-800">{razon.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* ✅ v9.0.0: CHECKBOXES DE HALLAZGOS PARA ANORMAL */}
                    {tipoEvaluacion === "ANORMAL" && (
                      <div className="mt-2 space-y-1 bg-orange-100 p-2 rounded border border-orange-300">
                        <p className="text-xs font-bold text-orange-900 mb-1">Hallazgos que justifican evaluación ANORMAL:</p>
                        {RAZONES_ANORMAL.map(razon => (
                          <label key={razon.key} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-orange-200 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={razonesAnormal[razon.key] || false}
                              onChange={(e) => setRazonesAnormal({...razonesAnormal, [razon.key]: e.target.checked})}
                              className="w-3 h-3"
                            />
                            <span className="text-orange-800">{razon.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Textarea de Observaciones - Más grande */}
                    {tipoEvaluacion && (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={observacionesEval}
                          onChange={(e) => setObservacionesEval(e.target.value)}
                          placeholder="Observaciones clínicas detalladas (mínimo 10 caracteres)..."
                          className={`w-full p-2 text-xs border rounded resize-none h-20 focus:outline-none focus:ring-2 ${
                            tipoEvaluacion === "NORMAL" ? "focus:ring-green-500 border-green-300" :
                            tipoEvaluacion === "ANORMAL" ? "focus:ring-orange-500 border-orange-300" :
                            "focus:ring-gray-500 border-gray-300"
                          }`}
                        />
                        <p className={`text-xs mt-1 ${
                          observacionesEval.trim().length >= 10 ? "text-green-600 font-semibold" : "text-gray-500"
                        }`}>
                          {observacionesEval.trim().length}/10 caracteres mínimos
                        </p>

                        {/* ✅ v9.2.0: 8️⃣ CAMPO OBLIGATORIO PARA NO_DIAGNOSTICO */}
                        {tipoEvaluacion === "NO_DIAGNOSTICO" && (
                          <div className="bg-gray-100 p-2 rounded border-2 border-gray-400">
                            <label className="block text-xs font-bold text-gray-900 mb-1">
                              🔴 REQUERIDO: Motivo de 'No Diagnóstico'
                            </label>
                            <textarea
                              value={motivoNoDiagnostico}
                              onChange={(e) => setMotivoNoDiagnostico(e.target.value)}
                              placeholder="Explica por qué no se puede hacer diagnóstico (ej: Imagen muy pixelada, movimiento del paciente, etc.)..."
                              className={`w-full p-2 text-xs border rounded resize-none h-16 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                                motivoNoDiagnostico.trim().length >= 10 ? "border-green-400 bg-green-50" : "border-red-300 bg-red-50"
                              }`}
                            />
                            <p className={`text-xs mt-1 font-semibold ${
                              motivoNoDiagnostico.trim().length >= 10 ? "text-green-700" : "text-red-700"
                            }`}>
                              {motivoNoDiagnostico.trim().length}/10 caracteres mínimos
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* PLAN DE SEGUIMIENTO (v11.0.0 - Recitación + Interconsulta) */}
                  <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200 space-y-3">
                    <p className="font-semibold text-purple-900 text-xs">📋 Plan de Seguimiento</p>

                    {/* SECCIÓN 1: RECITACIÓN */}
                    <div className="bg-white p-2 rounded border border-purple-200">
                      <label className="flex items-center gap-2 cursor-pointer text-xs mb-2">
                        <input
                          type="checkbox"
                          checked={planSeguimiento.recitarEnTresMeses}
                          onChange={(e) => setPlanSeguimiento({...planSeguimiento, recitarEnTresMeses: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <span className="font-medium text-purple-900">🔄 Recitar en 3 meses</span>
                      </label>

                      {planSeguimiento.recitarEnTresMeses && (
                        <div className="ml-4">
                          <input
                            type="text"
                            placeholder="Especialidad para recitación (ej: Cardiología)"
                            value={planSeguimiento.recitarEspecialidad}
                            onChange={(e) => setPlanSeguimiento({...planSeguimiento, recitarEspecialidad: e.target.value})}
                            className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* SECCIÓN 2: INTERCONSULTA */}
                    <div className="bg-white p-2 rounded border border-purple-200">
                      <label className="flex items-center gap-2 cursor-pointer text-xs mb-2">
                        <input
                          type="checkbox"
                          checked={planSeguimiento.interconsulta}
                          onChange={(e) => setPlanSeguimiento({...planSeguimiento, interconsulta: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <span className="font-medium text-purple-900">🏥 Interconsulta a especialista</span>
                      </label>

                      {planSeguimiento.interconsulta && (
                        <div className="ml-4 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Especialidad (ej: Cardiología)"
                              value={interconsultaBusqueda}
                              onChange={(e) => setInterconsultaBusqueda(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && interconsultaBusqueda.trim()) {
                                  if (!planSeguimiento.interconsultaEspecialidades.includes(interconsultaBusqueda.trim())) {
                                    setPlanSeguimiento({
                                      ...planSeguimiento,
                                      interconsultaEspecialidades: [...planSeguimiento.interconsultaEspecialidades, interconsultaBusqueda.trim()],
                                    });
                                  }
                                  setInterconsultaBusqueda("");
                                }
                              }}
                              className="flex-1 px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                              onClick={() => {
                                if (interconsultaBusqueda.trim() && !planSeguimiento.interconsultaEspecialidades.includes(interconsultaBusqueda.trim())) {
                                  setPlanSeguimiento({
                                    ...planSeguimiento,
                                    interconsultaEspecialidades: [...planSeguimiento.interconsultaEspecialidades, interconsultaBusqueda.trim()],
                                  });
                                  setInterconsultaBusqueda("");
                                }
                              }}
                              className="px-2 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold"
                            >
                              Agregar
                            </button>
                          </div>

                          {planSeguimiento.interconsultaEspecialidades.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {planSeguimiento.interconsultaEspecialidades.map((esp) => (
                                <div
                                  key={esp}
                                  className="inline-flex items-center gap-1 bg-purple-200 text-purple-900 px-2 py-1 rounded text-xs font-medium"
                                >
                                  {esp}
                                  <button
                                    onClick={() => handleRemoveInterconsultaEspecialidad(esp)}
                                    className="ml-1 hover:text-purple-700 font-bold"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {planSeguimiento.interconsultaEspecialidades.length === 0 && (
                            <p className="text-xs text-gray-500 italic">Sin especialidades seleccionadas</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ✅ v9.0.0: BOTONES CON LOADING STATE */}
            <div className="p-4 border-t flex gap-2 bg-gray-50">
              <button
                onClick={onClose}
                disabled={guardando}
                className="flex-1 px-3 py-2 text-sm bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              {imagenValida === false && motivoRechazo && (
                <button
                  onClick={handleRechazar}
                  disabled={guardando}
                  className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <AlertCircle size={16} /> Rechazar
                </button>
              )}
              {imagenValida === true && (
                <button
                  onClick={handleGuardar}
                  disabled={!puedeGuardar() || guardando}
                  className={`flex-1 px-3 py-2 text-sm rounded flex items-center justify-center gap-2 transition-colors font-semibold ${
                    puedeGuardar() && !guardando
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {guardando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Guardar Evaluación
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🎛️ FILTROS AVANZADOS - DRAWER OVERLAY (v10.1.0) */}
      {showFilterControls && (
        <>
          {/* Backdrop oscuro con desenfoque */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setShowFilterControls(false)}
          />

          {/* Drawer deslizable desde la derecha */}
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out rounded-l-xl">
            {/* Header del Drawer */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between border-b border-indigo-700 shadow-md">
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <h3 className="text-sm font-bold">Filtros Avanzados</h3>
              </div>
              <button
                onClick={() => setShowFilterControls(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
                title="Cerrar filtros"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido del Drawer */}
            <div className="p-4">
              <FilterControlsPanel
                filters={filters}
                onFilterChange={updateFilter}
                onReset={resetFilters}
                onPresetSelect={applyPreset}
              />
            </div>
          </div>
        </>
      )}

      {/* FULLSCREEN VIEWER */}
      {showFullscreen && (
        <FullscreenImageViewer
          isOpen={showFullscreen}
          imagenData={imagenData}
          indiceImagen={indiceImagen}
          totalImagenes={imagenesActuales.length}
          rotacion={rotacion}
          filters={filters}
          onClose={() => setShowFullscreen(false)}
          onRotate={setRotacion}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          onImageNavigation={(direction) => {
            if (direction === "siguiente" && indiceImagen < imagenesActuales.length - 1) {
              irImagenSiguiente();
            } else if (direction === "anterior" && indiceImagen > 0) {
              irImagenAnterior();
            }
          }}
          onValida={() => {
            setImagenValida(true);
            setShowFullscreen(false);
          }}
          onRechaza={() => {
            setImagenValida(false);
            setShowFullscreen(false);
          }}
        />
      )}
    </div>
  );
}
