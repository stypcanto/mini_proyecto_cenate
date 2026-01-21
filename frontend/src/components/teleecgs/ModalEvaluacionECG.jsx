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
 * 🏥 MODAL CONSOLIDADO - TRIAJE CLÍNICO ECG (v7.0.0)
 *
 * Flujo médico profesional con 3 TABS:
 * 1. 👁️ VER IMÁGENES - Carrusel de 4 ECGs con zoom 500%/rotación de calidad/filtros avanzados
 * 2. ✓ EVALUACIÓN - Seleccionar Normal/Anormal + Observaciones
 * 3. 📋 NOTA CLÍNICA - Hallazgos y Plan de Seguimiento
 *
 * Versión 7.0.0 (2026-01-21): Visualizador ECG profesional con:
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
  const [evaluacion, setEvaluacion] = useState("");
  const [observacionesEval, setObservacionesEval] = useState("");

  // ════════════════════════════════════════
  // TAB 3: NOTA CLÍNICA
  // ════════════════════════════════════════
  const [hallazgos, setHallazgos] = useState({
    ritmo: { presente: false, detalle: "" },
    frecuencia: { presente: false, detalle: "" },
    intervaloPR: { presente: false, detalle: "" },
    duracionQRS: { presente: false, detalle: "" },
    segmentoST: { presente: false, detalle: "" },
    ondaT: { presente: false, detalle: "" },
    eje: { presente: false, detalle: "" },
  });
  const [observacionesNota, setObservacionesNota] = useState("");
  const [planSeguimiento, setPlanSeguimiento] = useState({
    seguimientoMeses: false,
    seguimientoDias: null,
    derivarCardiologo: false,
    prioridadCardiologo: "CONSULTA_EXTERNA", // URGENTE o CONSULTA_EXTERNA
    hospitalizar: false,
    medicamentos: false,
    otrosPlan: "",
  });

  const textareaEvalRef = useRef(null);
  const textareaNotaRef = useRef(null);

  // ════════════════════════════════════════
  // CARGAR IMÁGENES AL ABRIR MODAL
  // ════════════════════════════════════════
  useEffect(() => {
    if (isOpen && ecg) {
      console.log("📋 Objeto ECG recibido en Modal:", ecg);
      cargarImagenes();
    }
  }, [isOpen, ecg]);

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

      if (e.key === "n" || e.key === "N") {
        if (!isTypingInField) {
          setEvaluacion("NORMAL");
          setActiveTab("evaluar");
        }
      } else if (e.key === "a" || e.key === "A") {
        if (!isTypingInField) {
          setEvaluacion("ANORMAL");
          setActiveTab("evaluar");
        }
      } else if (e.key === "d" || e.key === "D") {
        if (!isTypingInField) {
          setEvaluacion("NO_DIAGNOSTICO");
          setActiveTab("evaluar");
        }
      } else if (e.key === "ArrowLeft") {
        if (!isTypingInField) irImagenAnterior();
      } else if (e.key === "ArrowRight") {
        if (!isTypingInField) irImagenSiguiente();
      } else if (e.key === "Tab") {
        e.preventDefault();
        const tabs = ["ver", "evaluar", "nota"];
        const indiceActual = tabs.indexOf(activeTab);
        const siguiente = tabs[(indiceActual + 1) % tabs.length];
        setActiveTab(siguiente);
      } else if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleGuardar();
      } else if (e.key === "+" || e.key === "=") {
        // Zoom in
        e.preventDefault();
        handleZoomMas();
      } else if (e.key === "-") {
        // Zoom out
        e.preventDefault();
        handleZoomMenos();
      } else if (e.key === "i" || e.key === "I") {
        // Toggle invert
        e.preventDefault();
        updateFilter("invert", !filters.invert);
      } else if (e.key === "f" || e.key === "F") {
        // Toggle filter panel
        e.preventDefault();
        setShowFilterControls(!showFilterControls);
      } else if (e.key === "0") {
        // Reset all
        e.preventDefault();
        handleResetAll();
      } else if (e.key === "r" || e.key === "R") {
        // Rotate
        e.preventDefault();
        rotarImagen();
      } else if (e.key === "e" || e.key === "E") {
        // Fullscreen
        if (!isTypingInField) {
          e.preventDefault();
          setShowFullscreen(true);
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

  const handleGuardar = async () => {
    // Validar que haya evaluación
    if (!evaluacion) {
      toast.error("❌ Debes seleccionar Normal o Anormal");
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

      // 1️⃣ Guardar evaluación
      await onConfirm(evaluacion, observacionesEval.trim() || "", idImagen);
      toast.success(`✅ Evaluación guardada como ${evaluacion}`);

      // 2️⃣ Guardar Nota Clínica (si hay datos)
      if (hallazgos && Object.values(hallazgos).some(v => v === true)) {
        try {
          await teleecgService.guardarNotaClinica(idImagen, {
            hallazgos,
            observacionesClinicas: observacionesNota.trim() || null,
            planSeguimiento,
          });
          toast.success(`✅ Nota clínica guardada exitosamente`);
        } catch (notaError) {
          console.error("⚠️ Advertencia: Nota clínica no se guardó:", notaError);
          toast.error("⚠️ Evaluación guardada, pero hubo error en nota clínica");
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
    setEvaluacion("");
    setObservacionesEval("");
    setObservacionesNota("");
    setImagenValida(null); // Resetear validación
    setMotivoRechazo("");
    setDescripcionRechazo("");
    setHallazgos({
      ritmo: { presente: false, detalle: "" },
      frecuencia: { presente: false, detalle: "" },
      intervaloPR: { presente: false, detalle: "" },
      duracionQRS: { presente: false, detalle: "" },
      segmentoST: { presente: false, detalle: "" },
      ondaT: { presente: false, detalle: "" },
      eje: { presente: false, detalle: "" },
    });
    setPlanSeguimiento({
      seguimientoMeses: false,
      seguimientoDias: null,
      derivarCardiologo: false,
      prioridadCardiologo: "CONSULTA_EXTERNA",
      hospitalizar: false,
      medicamentos: false,
      otrosPlan: "",
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
              🏥 Triaje Clínico - ECG
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
            onClick={() => imagenValida === true && setActiveTab("nota")}
            disabled={imagenValida !== true}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all text-sm ${
              activeTab === "nota"
                ? "text-blue-700 border-b-3 border-blue-700 bg-blue-50"
                : imagenValida !== true
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
            }`}
            title={imagenValida !== true ? "Valida la imagen primero" : ""}
          >
            <FileText size={18} /> NOTA CLÍNICA
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
                            onImageLoad={() => console.log("✅ ECG cargada en canvas")}
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
                  ⌨️ Atajos: N=Normal • A=Anormal • D=No Diagnóstico • ←→=Imágenes • +/-=Zoom • R=Rotar • I=Invertir • F=Filtros • 0=Reset • E=Fullscreen • Tab=Siguiente
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
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Paciente</span>
                    <p className="font-bold text-gray-900 text-base mt-1">
                      {ecg?.nombres_paciente || ecg?.nombrePaciente} {ecg?.apellidos_paciente}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">DNI</span>
                    <p className="font-bold text-gray-900 text-base mt-1">{ecg?.num_doc_paciente || ecg?.numDocPaciente}</p>
                  </div>
                  {(ecg?.edad || ecg?.age) && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Edad</span>
                      <p className="font-bold text-gray-900 text-base mt-1">{ecg?.edad || ecg?.age} años</p>
                    </div>
                  )}
                  {(ecg?.genero || ecg?.sexo) && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Género</span>
                      <p className="font-bold text-gray-900 text-base mt-1">
                        {ecg?.genero === "M" || ecg?.genero === "MASCULINO" ? "🧑 Masculino" :
                         ecg?.genero === "F" || ecg?.genero === "FEMENINO" ? "👩 Femenino" :
                         ecg?.sexo === "M" ? "🧑 Masculino" :
                         ecg?.sexo === "F" ? "👩 Femenino" :
                         ecg?.genero || ecg?.sexo || "—"}
                      </p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">IPRESS</span>
                    <p className="font-bold text-gray-800 text-sm mt-1">{ecg?.nombre_ipress || ecg?.nombreIpress}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center shadow-sm border border-blue-200">
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-widest">Total ECGs</span>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{imagenesActuales.length}</p>
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
                        placeholder="Ej: La mitad inferior del ECG está cortada, necesita recaptura..."
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
            <div className="max-w-2xl">
              <div className="space-y-6">
                {/* Selección Resultado */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Resultado del ECG * <span className="text-xs text-gray-600">(N/A/D)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setEvaluacion("NORMAL")}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        evaluacion === "NORMAL"
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg scale-105 hover:from-emerald-600 hover:to-green-700"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
                      }`}
                      title="Tecla: N"
                    >
                      ✓ NORMAL
                    </button>
                    <button
                      onClick={() => setEvaluacion("ANORMAL")}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        evaluacion === "ANORMAL"
                          ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg scale-105 hover:from-rose-700 hover:to-red-700"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
                      }`}
                      title="Tecla: A"
                    >
                      ⚠️ ANORMAL
                    </button>
                    <button
                      onClick={() => setEvaluacion("NO_DIAGNOSTICO")}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        evaluacion === "NO_DIAGNOSTICO"
                          ? "bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-lg scale-105 hover:from-orange-700 hover:to-red-800"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
                      }`}
                      title="Tecla: D"
                    >
                      ⚠️ NO DIAGNÓSTICO
                    </button>
                  </div>
                </div>

                {/* Observaciones de evaluación */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Observaciones (Opcional)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Ritmo, frecuencia, cambios ST, etc.
                  </p>
                  <textarea
                    ref={textareaEvalRef}
                    value={observacionesEval}
                    onChange={(e) =>
                      setObservacionesEval(e.target.value.slice(0, 1000))
                    }
                    placeholder="Ej: Ritmo sinusal regular, 72 bpm, sin cambios agudos..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="5"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {observacionesEval.length}/1000 caracteres
                  </p>
                </div>

                {/* Confirmación */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900">
                    ✓ Evaluación seleccionada: <span className="text-lg">
                      {evaluacion === "NORMAL" && "✓ NORMAL"}
                      {evaluacion === "ANORMAL" && "⚠️ ANORMAL"}
                      {evaluacion === "NO_DIAGNOSTICO" && "❓ NO DIAGNÓSTICO"}
                      {!evaluacion && "—"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTA CLÍNICA */}
          {activeTab === "nota" && (
            <div className="max-w-3xl space-y-6">
              {/* Hallazgos - Con Detalles */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  📋 Hallazgos (Marcar y Detallar)
                </h3>
                <div className="space-y-3">
                  {[
                    { key: "ritmo", label: "Ritmo", placeholder: "Ej: Sinusal, FA, Taquicardia..." },
                    { key: "frecuencia", label: "Frecuencia", placeholder: "Ej: 72 bpm, Normal..." },
                    { key: "intervaloPR", label: "Intervalo PR", placeholder: "Ej: Normal, Acortado..." },
                    { key: "duracionQRS", label: "Duración QRS", placeholder: "Ej: Normal, Ancho..." },
                    { key: "segmentoST", label: "Segmento ST", placeholder: "Ej: Elevado, Deprimido..." },
                    { key: "ondaT", label: "Onda T", placeholder: "Ej: Invertida, Simétrica..." },
                    { key: "eje", label: "Eje", placeholder: "Ej: Normal, Desviado..." },
                  ].map((item) => (
                    <div key={item.key} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={hallazgos[item.key].presente}
                          onChange={(e) =>
                            setHallazgos({
                              ...hallazgos,
                              [item.key]: {
                                ...hallazgos[item.key],
                                presente: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label className="text-sm font-semibold text-gray-800 cursor-pointer flex-1">
                          {item.label}
                        </label>
                      </div>
                      {hallazgos[item.key].presente && (
                        <input
                          type="text"
                          value={hallazgos[item.key].detalle}
                          onChange={(e) =>
                            setHallazgos({
                              ...hallazgos,
                              [item.key]: {
                                ...hallazgos[item.key],
                                detalle: e.target.value.slice(0, 100),
                              },
                            })
                          }
                          placeholder={item.placeholder}
                          className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Observaciones clínicas */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  📝 Observaciones Clínicas
                </label>
                <textarea
                  ref={textareaNotaRef}
                  value={observacionesNota}
                  onChange={(e) =>
                    setObservacionesNota(e.target.value.slice(0, 2000))
                  }
                  placeholder="Detalles adicionales de la evaluación clínica..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {observacionesNota.length}/2000 caracteres
                </p>
              </div>

              {/* Plan de seguimiento */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  🔄 Plan de Seguimiento
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planSeguimiento.seguimientoMeses}
                      onChange={(e) =>
                        setPlanSeguimiento({
                          ...planSeguimiento,
                          seguimientoMeses: e.target.checked,
                        })
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      Seguimiento en
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={planSeguimiento.seguimientoDias || 3}
                      onChange={(e) =>
                        setPlanSeguimiento({
                          ...planSeguimiento,
                          seguimientoDias: parseInt(e.target.value),
                        })
                      }
                      className="w-16 px-2 py-1 border rounded text-sm"
                      disabled={!planSeguimiento.seguimientoMeses}
                    />
                    <span className="text-sm text-gray-700">meses</span>
                  </label>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={planSeguimiento.derivarCardiologo}
                        onChange={(e) =>
                          setPlanSeguimiento({
                            ...planSeguimiento,
                            derivarCardiologo: e.target.checked,
                          })
                        }
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-gray-800">
                        🏥 Derivar a cardiólogo
                      </span>
                    </label>
                    {planSeguimiento.derivarCardiologo && (
                      <div className="pl-6 space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="prioridad"
                            value="URGENTE"
                            checked={planSeguimiento.prioridadCardiologo === "URGENTE"}
                            onChange={(e) =>
                              setPlanSeguimiento({
                                ...planSeguimiento,
                                prioridadCardiologo: e.target.value,
                              })
                            }
                            className="w-4 h-4 cursor-pointer accent-red-600"
                          />
                          <span className="text-sm text-red-700 font-semibold">🚨 URGENTE (24-48h)</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="prioridad"
                            value="CONSULTA_EXTERNA"
                            checked={planSeguimiento.prioridadCardiologo === "CONSULTA_EXTERNA"}
                            onChange={(e) =>
                              setPlanSeguimiento({
                                ...planSeguimiento,
                                prioridadCardiologo: e.target.value,
                              })
                            }
                            className="w-4 h-4 cursor-pointer accent-blue-600"
                          />
                          <span className="text-sm text-blue-700 font-semibold">📋 CONSULTA EXTERNA (14 días)</span>
                        </label>
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planSeguimiento.hospitalizar}
                      onChange={(e) =>
                        setPlanSeguimiento({
                          ...planSeguimiento,
                          hospitalizar: e.target.checked,
                        })
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      Hospitalizar
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planSeguimiento.medicamentos}
                      onChange={(e) =>
                        setPlanSeguimiento({
                          ...planSeguimiento,
                          medicamentos: e.target.checked,
                        })
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      Prescribir medicamentos
                    </span>
                  </label>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Otros
                    </label>
                    <textarea
                      value={planSeguimiento.otrosPlan}
                      onChange={(e) =>
                        setPlanSeguimiento({
                          ...planSeguimiento,
                          otrosPlan: e.target.value.slice(0, 500),
                        })
                      }
                      placeholder="Otras recomendaciones..."
                      className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                      rows="2"
                    />
                  </div>
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
            {activeTab === "nota" && "📋 Paso 3: Nota clínica"}
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

            {activeTab !== "nota" && (
              <button
                onClick={() => {
                  if (activeTab === "ver") setActiveTab("evaluar");
                  if (activeTab === "evaluar") setActiveTab("nota");
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                Siguiente ▶
              </button>
            )}

            {activeTab === "nota" && (
              <button
                onClick={handleGuardar}
                disabled={loading || !evaluacion}
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
