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
  Eye,
  ClipboardList,
  FileText,
  Filter,
  RefreshCw,
  Maximize2,
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import toast from "react-hot-toast";
import teleecgService from "../../services/teleecgService";
import ImageCanvas from "./ImageCanvas";
import useImageFilters from "./useImageFilters";
import FilterControlsPanel from "./FilterControlsPanel";
import FullscreenImageViewer from "./FullscreenImageViewer";

/**
 * 🏥 MODAL CONSOLIDADO - TRIAJE CLÍNICO EKG (v7.0.0)
 *
 * Flujo médico profesional con 3 TABS:
 * 1. 👁️ VER IMÁGENES - Carrusel de 6-12 EKGs con zoom 500%/rotación de calidad/filtros avanzados
 * 2. ✓ EVALUACIÓN - Seleccionar Normal/Anormal + Observaciones
 * 3. 📋 PLAN DE SEGUIMIENTO - Recomendaciones y Seguimiento
 *
 * Versión 7.0.0 (2026-01-21): Visualizador EKG profesional con:
 * - Zoom 50-500% sin pixelación (Canvas + react-zoom-pan-pinch)
 * - Rotación de alta calidad (imageSmoothingQuality = 'high')
 * - Filtros de imagen: invertir, contraste, brillo
 * - Pan/drag para navegación en zoom
 * - Presets médicos predefinidos
 *
 * Una sola carga de datos, múltiples acciones registradas en auditoría
 */
export default function ModalEvaluacionECG({
  isOpen,
  ecg,
  onClose,
  onConfirm,
  loading = false,
}) {
  // ════════════════════════════════════════
  // ESTADO GENERAL
  // ════════════════════════════════════════
  const [activeTab, setActiveTab] = useState("ver"); // "ver", "evaluar", "nota"
  const [imagenesActuales, setImagenesActuales] = useState([]);
  const [indiceImagen, setIndiceImagen] = useState(0);
  const [imagenData, setImagenData] = useState(null);
  const [rotacion, setRotacion] = useState(0);

  // 🎨 Estado para filtros y zoom avanzado (v7.0.0)
  const transformRef = useRef(null);
  const { filters, updateFilter, resetFilters, applyPreset } = useImageFilters();
  const [showFilterControls, setShowFilterControls] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // ════════════════════════════════════════
  // TAB 1.5: VALIDACIÓN DE CALIDAD (v3.1.0)
  // ════════════════════════════════════════
  const [imagenValida, setImagenValida] = useState(null); // true = válida, false = rechazada, null = sin decidir
  const [motivoRechazo, setMotivoRechazo] = useState(""); // MALA_CALIDAD, INCOMPLETA, etc
  const [descripcionRechazo, setDescripcionRechazo] = useState("");

  const MOTIVOS_RECHAZO = [
    { valor: "MALA_CALIDAD", etiqueta: "Mala calidad / Pixelada" },
    { valor: "INCOMPLETA", etiqueta: "Imagen cortada / Incompleta" },
    { valor: "ARTEFACTO", etiqueta: "Artefacto de movimiento" },
    { valor: "CALIBRACION", etiqueta: "Calibración incorrecta" },
    { valor: "NO_PACIENTE", etiqueta: "No corresponde al paciente" },
    { valor: "FORMATO_INVALIDO", etiqueta: "Formato de archivo inválido" },
    { valor: "OTRO", etiqueta: "Otro motivo" },
  ];

  // ════════════════════════════════════════
  // TAB 2: EVALUACIÓN
  // ════════════════════════════════════════
  const [observacionesEval, setObservacionesEval] = useState("");
  const [tipoEvaluacion, setTipoEvaluacion] = useState(""); // NORMAL, ANORMAL, NO_DIAGNOSTICO

  // Razones preseleccionadas según tipo de evaluación
  const [razonesNormal, setRazonesNormal] = useState({
    ritmoNormal: false,
    frecuenciaAdecuada: false,
    sinCambiosAgudos: false,
    segmentoSTNormal: false,
    ondaTNormal: false,
  });

  const [razonesAnormal, setRazonesAnormal] = useState({
    ritmoAnormal: false,
    frecuenciaAnormal: false,
    cambiosEn_ST: false,
    ondaTInvertida: false,
    bloqueoCardiaco: false,
    hiperkalemia: false,
    isquemiaActiva: false,
  });

  // ════════════════════════════════════════
  // TAB 3: PLAN DE SEGUIMIENTO (SIMPLIFICADO)
  // ════════════════════════════════════════
  const [planSeguimiento, setPlanSeguimiento] = useState({
    recitarEnTresMeses: false,
    interconsultaEspecialidad: "", // nombre de especialidad (Cardiología, etc.)
  });

  // 🏥 Estado para autocomplete de especialidades (v1.27.0)
  const [especialidades, setEspecialidades] = useState([]);
  const [filteredEspecialidades, setFilteredEspecialidades] = useState([]);
  const [showEspecialidadesDropdown, setShowEspecialidadesDropdown] = useState(false);

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
    }
  };

  const handleZoomMenos = () => {
    if (transformRef.current?.zoomOut) {
      transformRef.current.zoomOut(0.2);
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

      // Atajos globales (funcionan en cualquier TAB)
      if (e.key === "Tab") {
        e.preventDefault();
        const tabs = ["ver", "evaluar", "plan"];
        const indiceActual = tabs.indexOf(activeTab);
        const siguiente = tabs[(indiceActual + 1) % tabs.length];
        setActiveTab(siguiente);
      } else if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleGuardar();
      } else if (e.key === "e" || e.key === "E") {
        // Fullscreen
        if (!isTypingInField) {
          e.preventDefault();
          setShowFullscreen(true);
        }
      }

      // Atajos específicos para TAB "ver" (solo imagen)
      if (activeTab === "ver") {
        if (e.key === "ArrowLeft") {
          if (!isTypingInField) irImagenAnterior();
        } else if (e.key === "ArrowRight") {
          if (!isTypingInField) irImagenSiguiente();
        } else if (e.key === "+" || e.key === "=") {
          // Zoom in - SOLO SI NO ESTÁ ESCRIBIENDO
          if (!isTypingInField) {
            e.preventDefault();
            handleZoomMas();
          }
        } else if (e.key === "-") {
          // Zoom out - SOLO SI NO ESTÁ ESCRIBIENDO
          if (!isTypingInField) {
            e.preventDefault();
            handleZoomMenos();
          }
        } else if (e.key === "i" || e.key === "I") {
          // Toggle invert - SOLO SI NO ESTÁ ESCRIBIENDO
          if (!isTypingInField) {
            e.preventDefault();
            updateFilter("invert", !filters.invert);
          }
        } else if (e.key === "f" || e.key === "F") {
          // Toggle filter panel - SOLO SI NO ESTÁ ESCRIBIENDO
          if (!isTypingInField) {
            e.preventDefault();
            setShowFilterControls(!showFilterControls);
          }
        } else if (e.key === "0") {
          // Reset all - SOLO SI NO ESTÁ ESCRIBIENDO
          if (!isTypingInField) {
            e.preventDefault();
            handleResetAll();
          }
        } else if (e.key === "r" || e.key === "R") {
          // Rotate - SOLO SI NO ESTÁ ESCRIBIENDO
          if (!isTypingInField) {
            e.preventDefault();
            rotarImagen();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, activeTab, indiceImagen, filters, updateFilter, resetFilters]);

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
  // AUTOCOMPLETE DE ESPECIALIDADES (v1.27.0)
  // ════════════════════════════════════════
  const handleEspecialidadChange = (value) => {
    setPlanSeguimiento({
      ...planSeguimiento,
      interconsultaEspecialidad: value,
    });

    // Mostrar dropdown siempre que hay especialidades
    if (especialidades.length > 0) {
      let filtered;
      if (value.trim().length > 0) {
        // Si escribe algo, filtrar
        filtered = especialidades.filter((e) =>
          e.descripcion.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        // Si no escribe nada, mostrar TODAS las especialidades
        filtered = especialidades;
      }
      setFilteredEspecialidades(filtered);
      setShowEspecialidadesDropdown(true);
    } else {
      setFilteredEspecialidades([]);
      setShowEspecialidadesDropdown(false);
    }
  };

  const handleSelectEspecialidad = (descripcion) => {
    setPlanSeguimiento({
      ...planSeguimiento,
      interconsultaEspecialidad: descripcion,
    });
    setShowEspecialidadesDropdown(false);
    setFilteredEspecialidades([]);
  };

  const handleGuardar = async () => {
    // Validar que haya evaluación
    if (!tipoEvaluacion) {
      toast.error("❌ Debes seleccionar Normal, Anormal o No Diagnóstico");
      return;
    }

    try {
      const imagenActual = imagenesActuales[indiceImagen];
      const idImagen =
        imagenActual?.id_imagen || imagenActual?.idImagen;

      if (!idImagen) {
        toast.error("❌ No se pudo obtener el ID de la imagen");
        return;
      }

      // 1️⃣ Guardar evaluación con tipo (NORMAL/ANORMAL/NO_DIAGNOSTICO) y observaciones
      await onConfirm(tipoEvaluacion, observacionesEval.trim() || "", idImagen);
      toast.success(`✅ Evaluación guardada: ${tipoEvaluacion}`);

      // 2️⃣ Guardar Plan de Seguimiento (si hay datos)
      if (planSeguimiento.recitarEnTresMeses || planSeguimiento.interconsultaEspecialidad) {
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

      limpiarFormulario();
      onClose();
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      toast.error("Error al guardar evaluación");
    }
  };

  const limpiarFormulario = () => {
    setObservacionesEval("");
    setTipoEvaluacion("");
    setRazonesNormal({
      ritmoNormal: false,
      frecuenciaAdecuada: false,
      sinCambiosAgudos: false,
      segmentoSTNormal: false,
      ondaTNormal: false,
    });
    setRazonesAnormal({
      ritmoAnormal: false,
      frecuenciaAnormal: false,
      cambiosEn_ST: false,
      ondaTInvertida: false,
      bloqueoCardiaco: false,
      hiperkalemia: false,
      isquemiaActiva: false,
    });
    setImagenValida(null); // Resetear validación
    setMotivoRechazo("");
    setDescripcionRechazo("");
    setPlanSeguimiento({
      recitarEnTresMeses: false,
      interconsultaEspecialidad: "",
    });
  };

  if (!isOpen) return null;

  // ════════════════════════════════════════
  // RENDER: TABS
  // ════════════════════════════════════════
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* ════ HEADER - Azul Marino con Efecto Radial ════ */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 text-white border-b border-blue-950 shadow-md">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🏥 Triaje Clínico - EKG
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              {ecg?.nombres_paciente || ecg?.nombrePaciente || "Paciente"} {ecg?.apellidos_paciente} • DNI: {ecg?.num_doc_paciente || ecg?.numDocPaciente}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all hover:scale-110 active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        {/* ════ TABS NAVEGACIÓN (Púrpura - Mejorado) ════ */}
        <div className="flex border-b bg-white shadow-sm">
          <button
            onClick={() => setActiveTab("ver")}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all text-sm ${
              activeTab === "ver"
                ? "text-blue-700 border-b-3 border-blue-700 bg-blue-50"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
            }`}
          >
            <Eye size={18} /> VER IMÁGENES
          </button>
          <button
            onClick={() => imagenValida === true && setActiveTab("evaluar")}
            disabled={imagenValida !== true}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all text-sm ${
              activeTab === "evaluar"
                ? "text-blue-700 border-b-3 border-blue-700 bg-blue-50"
                : imagenValida !== true
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
            }`}
            title={imagenValida !== true ? "Valida la imagen primero" : ""}
          >
            <CheckCircle size={18} /> EVALUACIÓN
          </button>
          <button
            onClick={() => imagenValida === true && setActiveTab("plan")}
            disabled={imagenValida !== true}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all text-sm ${
              activeTab === "plan"
                ? "text-blue-700 border-b-3 border-blue-700 bg-blue-50"
                : imagenValida !== true
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
            }`}
            title={imagenValida !== true ? "Valida la imagen primero" : ""}
          >
            <FileText size={18} /> PLAN DE SEGUIMIENTO
          </button>
        </div>

        {/* ════ CONTENIDO DE TABS ════ */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: VER IMÁGENES */}
          {activeTab === "ver" && (
            <div className="grid grid-cols-3 gap-6">
              {/* Imagen Principal - v7.0.0 */}
              <div className="col-span-2">
                <div className="bg-gray-100 rounded-lg p-4 h-96 flex flex-col">
                  {imagenData ? (
                    <TransformWrapper
                      ref={transformRef}
                      initialScale={1}
                      minScale={0.5}
                      maxScale={5}
                      centerOnInit
                      wheel={{ step: 0.1 }}
                      doubleClick={{ mode: "reset" }}
                    >
                      {({ zoomIn, zoomOut, resetTransform }) => (
                        <TransformComponent
                          wrapperClass="flex-1 flex items-center justify-center w-full overflow-hidden"
                          contentClass="cursor-move"
                        >
                          <ImageCanvas
                            imageSrc={imagenData}
                            rotation={rotacion}
                            filters={filters}
                            onImageLoad={() => console.log("✅ EKG cargada en canvas")}
                          />
                        </TransformComponent>
                      )}
                    </TransformWrapper>
                  ) : imagenesActuales.length > 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-500">Cargando imagen...</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <AlertCircle className="text-gray-400" size={48} />
                      <p className="text-gray-500 ml-2">
                        No hay imágenes disponibles
                      </p>
                    </div>
                  )}

                  {/* Controles - v7.0.0 */}
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t flex-wrap">
                    {/* Zoom controls */}
                    <button
                      onClick={handleZoomMenos}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Zoom menos (+/-)"
                    >
                      <ZoomOut size={20} />
                    </button>
                    <span className="text-sm font-semibold min-w-12 text-center">
                      {getCurrentZoomPercentage()}%
                    </span>
                    <button
                      onClick={handleZoomMas}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Zoom más (++)"
                    >
                      <ZoomIn size={20} />
                    </button>

                    <div className="w-px h-6 bg-gray-300" />

                    {/* Rotate */}
                    <button
                      onClick={rotarImagen}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Rotar 90° (R)"
                    >
                      <RotateCw size={20} />
                    </button>

                    <div className="w-px h-6 bg-gray-300" />

                    {/* Filter toggle - Estado Active en Oro cuando hay filtros activos */}
                    <button
                      onClick={() => setShowFilterControls(!showFilterControls)}
                      className={`p-2 rounded transition-all relative ${
                        showFilterControls
                          ? "bg-amber-100 text-amber-700 shadow-md border border-amber-300"
                          : filters.invert || filters.contrast !== 100 || filters.brightness !== 100
                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200"
                            : "hover:bg-gray-200"
                      }`}
                      title="Alternar filtros (F)"
                    >
                      <Filter size={20} />
                      {(filters.invert || filters.contrast !== 100 || filters.brightness !== 100) && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-amber-600 rounded-full"></span>
                      )}
                    </button>

                    {/* Reset all */}
                    <button
                      onClick={handleResetAll}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Reset todo (0)"
                    >
                      <RefreshCw size={20} />
                    </button>

                    <div className="w-px h-6 bg-gray-300" />

                    {/* Fullscreen */}
                    <button
                      onClick={() => setShowFullscreen(true)}
                      className="p-2 hover:bg-gray-200 rounded transition-colors text-blue-600 hover:bg-blue-100"
                      title="Ampliar pantalla completa (E)"
                    >
                      <Maximize2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Navegación de imágenes */}
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={irImagenAnterior}
                    disabled={indiceImagen === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                  >
                    <ChevronLeft size={18} /> Anterior
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    Imagen {indiceImagen + 1} de {imagenesActuales.length}
                  </span>
                  <button
                    onClick={irImagenSiguiente}
                    disabled={indiceImagen === imagenesActuales.length - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                  >
                    Siguiente <ChevronRight size={18} />
                  </button>
                </div>

                {/* Atajos */}
                <p className="text-xs text-gray-500 mt-2 mb-3">
                  ⌨️ Atajos: ←→=Imágenes • +/-=Zoom • R=Rotar • I=Invertir • F=Filtros • 0=Reset • E=Fullscreen • Tab=Siguiente
                </p>

                {/* Panel de filtros colapsable - Posicionado aquí para mejor layout */}
                {showFilterControls && (
                  <FilterControlsPanel
                    filters={filters}
                    onFilterChange={updateFilter}
                    onReset={resetFilters}
                    onPresetSelect={applyPreset}
                  />
                )}
              </div>

              {/* Panel derecho: Info paciente (Limpio y Moderno) */}
              <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                  📋 Información
                </h3>
                <div className="space-y-3">
                  {/* ✅ v1.27.8: Extraer info del paciente desde asegurado agrupado o primera imagen */}
                  {(() => {
                    // Prioridad:
                    // 1. Usar campos del asegurado agrupado (ecg.edadPaciente)
                    // 2. Caer a primera imagen (imagenesActuales[0].edadPaciente)
                    // 3. Si es solo un ECG (sin agrupar), usar ecg directamente
                    const pacienteInfo = {
                      nombres: ecg?.nombres_paciente || ecg?.nombresPaciente || (imagenesActuales?.[0]?.nombres_paciente) || (imagenesActuales?.[0]?.nombresPaciente) || "N/A",
                      apellidos: ecg?.apellidos_paciente || ecg?.apellidosPaciente || (imagenesActuales?.[0]?.apellidos_paciente) || (imagenesActuales?.[0]?.apellidosPaciente) || "",
                      dni: ecg?.num_doc_paciente || ecg?.numDocPaciente || (imagenesActuales?.[0]?.num_doc_paciente) || (imagenesActuales?.[0]?.numDocPaciente) || "N/A",
                      edad: ecg?.edad_paciente || ecg?.edadPaciente || (imagenesActuales?.[0]?.edad_paciente) || (imagenesActuales?.[0]?.edadPaciente),
                      genero: ecg?.genero_paciente || ecg?.generoPaciente || (imagenesActuales?.[0]?.genero_paciente) || (imagenesActuales?.[0]?.generoPaciente),
                      ipress: ecg?.nombre_ipress || ecg?.nombreIpress || (imagenesActuales?.[0]?.nombre_ipress) || (imagenesActuales?.[0]?.nombreIpress) || "N/A"
                    };

                    return (
                      <>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Paciente</span>
                          <p className="font-bold text-gray-900 text-base mt-1">
                            {pacienteInfo.nombres} {pacienteInfo.apellidos}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">DNI</span>
                          <p className="font-bold text-gray-900 text-base mt-1">{pacienteInfo.dni}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Edad</span>
                          <p className="font-bold text-gray-900 text-base mt-1">
                            {pacienteInfo.edad ? `${pacienteInfo.edad} años` : "No disponible"}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Género</span>
                          <p className="font-bold text-gray-900 text-base mt-1">
                            {pacienteInfo.genero === "M" || pacienteInfo.genero === "MASCULINO" ? "Masculino" :
                             pacienteInfo.genero === "F" || pacienteInfo.genero === "FEMENINO" ? "Femenino" :
                             pacienteInfo.genero ? pacienteInfo.genero : "No disponible"}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">IPRESS</span>
                          <p className="font-bold text-gray-800 text-sm mt-1">{pacienteInfo.ipress}</p>
                        </div>
                      </>
                    );
                  })()}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center shadow-sm border border-blue-200">
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-widest">Total EKGs</span>
                      <p className="text-3xl font-bold text-blue-900 mt-2">{imagenesActuales.length}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-300 text-center">
                      <p className="text-xs font-semibold text-amber-800">
                        ℹ️ Requisitos PADOMI
                      </p>
                      <ul className="text-xs text-amber-700 mt-2 space-y-1">
                        <li>✓ Mínimo: <strong>6 EKGs</strong></li>
                        <li>✓ Máximo: <strong>12 EKGs</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* ════════════════════════════════════════════════════════ */}
              {/* SECCIÓN VALIDACIÓN DE CALIDAD (v3.1.0) */}
              {/* ════════════════════════════════════════════════════════ */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  ⚠️ Validación de Imagen
                </h3>

                {imagenValida === null && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4 font-medium">
                      Verifica la calidad antes de continuar:
                    </p>

                    {/* Opción 1: SÍ, imagen válida (Esmeralda→Verde) */}
                    <button
                      onClick={() => setImagenValida(true)}
                      className="w-full p-4 border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 hover:border-emerald-600 transition-all text-left shadow-sm hover:shadow-lg bg-emerald-50/40 hover:scale-102"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">✅</div>
                        <div>
                          <p className="font-bold text-emerald-700">Válida y de buena calidad</p>
                          <p className="text-xs text-gray-600 mt-1">Proceder a evaluación médica</p>
                        </div>
                      </div>
                    </button>

                    {/* Opción 2: NO, rechazar (Rosado) */}
                    <button
                      onClick={() => setImagenValida(false)}
                      className="w-full p-4 border-2 border-rose-400 rounded-xl hover:bg-rose-50 hover:border-rose-500 transition-all text-left shadow-sm hover:shadow-lg bg-rose-50/40 hover:scale-102"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">❌</div>
                        <div>
                          <p className="font-bold text-rose-700">Rechazar por mala calidad</p>
                          <p className="text-xs text-gray-600 mt-1">Solicitar recaptura a IPRESS</p>
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {/* Mostrar formulario de rechazo (Gradiente Rojo→Rosado) */}
                {imagenValida === false && (
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-xl space-y-4 border-2 border-rose-400 shadow-md">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        📌 Motivo del Rechazo
                      </label>
                      <select
                        value={motivoRechazo}
                        onChange={(e) => setMotivoRechazo(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-rose-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white font-medium"
                      >
                        <option value="">-- Selecciona un motivo --</option>
                        {MOTIVOS_RECHAZO.map((m) => (
                          <option key={m.valor} value={m.valor}>
                            {m.etiqueta}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        📝 Descripción Adicional
                      </label>
                      <textarea
                        value={descripcionRechazo}
                        onChange={(e) => setDescripcionRechazo(e.target.value)}
                        maxLength="500"
                        placeholder="Ej: La mitad inferior del EKG está cortada, necesita recaptura..."
                        className="w-full px-4 py-2 border-2 border-rose-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                        rows="3"
                      />
                      <p className="text-xs text-gray-600 mt-2 font-medium">
                        {descripcionRechazo.length}/500 caracteres
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setImagenValida(null);
                          setMotivoRechazo("");
                          setDescripcionRechazo("");
                        }}
                        className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg"
                      >
                        Cambiar
                      </button>
                      <button
                        onClick={handleRechazar}
                        disabled={!motivoRechazo}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all font-bold disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        ❌ Rechazar Imagen
                      </button>
                    </div>
                  </div>
                )}

                {/* Mostrar mensaje si SÍ es válida (Esmeralda→Verde) */}
                {imagenValida === true && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-xl border-2 border-emerald-400 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">✅</span>
                      <div>
                        <p className="font-bold text-emerald-700">Imagen validada correctamente</p>
                        <p className="text-xs text-gray-600 mt-1">Lista para evaluación médica</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4 bg-white px-3 py-2 rounded-lg border border-emerald-300">
                      ℹ️ Procede al siguiente tab para evaluación médica
                    </p>
                    <button
                      onClick={() => {
                        setImagenValida(null);
                      }}
                      className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg"
                    >
                      Revalidar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EVALUACIÓN */}
          {activeTab === "evaluar" && (
            <div className="max-w-3xl">
              <div className="space-y-6">
                {/* Selección de Tipo de Evaluación */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-4">
                    Resultado del EKG * <span className="text-xs text-gray-600">(Normal / Anormal / No Diagnóstico)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      onClick={() => setTipoEvaluacion("NORMAL")}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        tipoEvaluacion === "NORMAL"
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg scale-105"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      ✓ NORMAL
                    </button>
                    <button
                      onClick={() => setTipoEvaluacion("ANORMAL")}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        tipoEvaluacion === "ANORMAL"
                          ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg scale-105"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      ⚠️ ANORMAL
                    </button>
                    <button
                      onClick={() => setTipoEvaluacion("NO_DIAGNOSTICO")}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        tipoEvaluacion === "NO_DIAGNOSTICO"
                          ? "bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-lg scale-105"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      ❓ NO DIAGNÓSTICO
                    </button>
                  </div>
                </div>

                {/* Razones Preseleccionadas - NORMAL */}
                {tipoEvaluacion === "NORMAL" && (
                  <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-lg">
                    <label className="block text-sm font-bold text-gray-800 mb-3">¿Por qué NORMAL? (Selecciona razones)</label>
                    <div className="space-y-2">
                      {Object.entries({
                        ritmoNormal: "Ritmo normal",
                        frecuenciaAdecuada: "Frecuencia adecuada",
                        sinCambiosAgudos: "Sin cambios agudos",
                        segmentoSTNormal: "Segmento ST normal",
                        ondaTNormal: "Onda T normal"
                      }).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={razonesNormal[key]}
                            onChange={(e) => setRazonesNormal({...razonesNormal, [key]: e.target.checked})}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Razones Preseleccionadas - ANORMAL */}
                {tipoEvaluacion === "ANORMAL" && (
                  <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-lg">
                    <label className="block text-sm font-bold text-gray-800 mb-3">¿Por qué ANORMAL? (Selecciona razones)</label>
                    <div className="space-y-2">
                      {Object.entries({
                        ritmoAnormal: "Ritmo anormal",
                        frecuenciaAnormal: "Frecuencia anormal",
                        cambiosEn_ST: "Cambios en ST",
                        ondaTInvertida: "Onda T invertida",
                        bloqueoCardiaco: "Bloqueo cardíaco",
                        hiperkalemia: "Hiperkalemia",
                        isquemiaActiva: "Isquemia activa"
                      }).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={razonesAnormal[key]}
                            onChange={(e) => setRazonesAnormal({...razonesAnormal, [key]: e.target.checked})}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observaciones Detalladas */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Observaciones Médicas (Opcional)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Detalles adicionales sobre el análisis del EKG
                  </p>
                  <textarea
                    ref={textareaEvalRef}
                    value={observacionesEval}
                    onChange={(e) => setObservacionesEval(e.target.value)}
                    placeholder="Ej: Ritmo sinusal regular, 72 bpm. Sin cambios agudos. Recomendación: Seguimiento clínico rutinario..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="5"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {observacionesEval.length} caracteres
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLAN DE SEGUIMIENTO (SIMPLIFICADO) */}
          {activeTab === "plan" && (
            <div className="max-w-2xl">
              <div className="space-y-6">
                {/* Recitar en 3 meses */}
                <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-300">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planSeguimiento.recitarEnTresMeses}
                      onChange={(e) =>
                        setPlanSeguimiento({
                          ...planSeguimiento,
                          recitarEnTresMeses: e.target.checked,
                        })
                      }
                      className="w-5 h-5 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <label className="text-sm font-bold text-gray-800">
                        📅 Recitar en 3 meses
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Paciente debe retornar para reconsulta en 3 meses
                      </p>
                    </div>
                  </label>
                </div>

                {/* Interconsulta con especialidad - AUTOCOMPLETE (v1.27.0) */}
                <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-300 relative">
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    🏥 Interconsulta con Especialidad (Opcional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={planSeguimiento.interconsultaEspecialidad}
                      onChange={(e) => handleEspecialidadChange(e.target.value)}
                      onFocus={() => {
                        // Al hacer focus, mostrar TODAS las especialidades
                        if (especialidades.length > 0) {
                          setFilteredEspecialidades(especialidades);
                          setShowEspecialidadesDropdown(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay para permitir click en dropdown
                        setTimeout(() => setShowEspecialidadesDropdown(false), 200);
                      }}
                      placeholder="Haz click para ver todas las especialidades..."
                      className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />

                    {/* Dropdown de especialidades */}
                    {showEspecialidadesDropdown && filteredEspecialidades.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-purple-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        {filteredEspecialidades.map((esp, index) => (
                          <button
                            key={`${esp.idServicio}-${index}`}
                            type="button"
                            onClick={() => handleSelectEspecialidad(esp.descripcion)}
                            className="w-full text-left px-4 py-2 hover:bg-purple-100 transition-colors border-b border-purple-100 last:border-b-0"
                          >
                            <span className="text-sm font-semibold text-purple-700">{esp.descripcion}</span>
                            {esp.codServicio && (
                              <span className="text-xs text-gray-500 ml-2">({esp.codServicio})</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Mensaje si no hay resultados */}
                    {showEspecialidadesDropdown && planSeguimiento.interconsultaEspecialidad.trim().length > 0 && filteredEspecialidades.length === 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-purple-300 rounded-lg shadow-lg z-50 p-3">
                        <p className="text-xs text-gray-500">
                          📭 No se encontraron especialidades con "{planSeguimiento.interconsultaEspecialidad}"
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Puedes escribir libre o seleccionar de la lista
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Especifica la especialidad médica para la interconsulta (cargada desde base de datos)
                  </p>
                </div>

                {/* Resumen */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-300">
                  <p className="text-sm font-semibold text-green-900">
                    ✓ Plan de seguimiento configurado
                  </p>
                  <ul className="text-xs text-gray-700 mt-2 space-y-1">
                    {planSeguimiento.recitarEnTresMeses && (
                      <li>✓ Reconsulta en 3 meses</li>
                    )}
                    {planSeguimiento.interconsultaEspecialidad && (
                      <li>✓ Interconsulta: {planSeguimiento.interconsultaEspecialidad}</li>
                    )}
                    {!planSeguimiento.recitarEnTresMeses && !planSeguimiento.interconsultaEspecialidad && (
                      <li className="text-gray-500">Sin plan de seguimiento (opcional)</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ════ FOOTER / ACCIONES (Colores Semánticos Mejorados) ════ */}
        <div className="flex items-center justify-between p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100 shadow-inner">
          <div className="text-sm font-semibold text-gray-700">
            {activeTab === "ver" && "📸 Paso 1: Ver imágenes"}
            {activeTab === "evaluar" && "✓ Paso 2: Evaluación"}
            {activeTab === "plan" && "📅 Paso 3: Plan de Seguimiento"}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              Cancelar
            </button>

            {activeTab !== "ver" && (
              <button
                onClick={() => setActiveTab("ver")}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                ◀ Anterior
              </button>
            )}

            {activeTab !== "plan" && (
              <button
                onClick={() => {
                  if (activeTab === "ver") setActiveTab("evaluar");
                  if (activeTab === "evaluar") setActiveTab("plan");
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                Siguiente ▶
              </button>
            )}

            {activeTab === "plan" && (
              <button
                onClick={handleGuardar}
                disabled={loading || !tipoEvaluacion}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                ✓ Guardar Evaluación
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      <FullscreenImageViewer
        isOpen={showFullscreen}
        imagenData={imagenData}
        indiceImagen={indiceImagen}
        totalImagenes={imagenesActuales.length}
        rotacion={rotacion}
        filters={filters}
        onClose={() => setShowFullscreen(false)}
        onRotate={(nuevoAngulo) => setRotacion(nuevoAngulo)}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        onImageNavigation={(direccion) => {
          if (direccion === "anterior") {
            irImagenAnterior();
          } else if (direccion === "siguiente") {
            irImagenSiguiente();
          }
        }}
      />
    </div>
  );
}
