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
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import toast from "react-hot-toast";
import teleecgService from "../../services/teleecgService";
import ImageCanvas from "./ImageCanvas";
import useImageFilters from "./useImageFilters";
import FilterControlsPanel from "./FilterControlsPanel";
import FullscreenImageViewer from "./FullscreenImageViewer";

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
  // RENDER: Single View Layout (v8.0.0)
  // ════════════════════════════════════════
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-800 to-blue-950 text-white">
          <div>
            <h2 className="text-xl font-bold">🏥 Triaje Clínico - EKG</h2>
            <p className="text-xs text-blue-100">{ecg?.nombres_paciente || ecg?.nombrePaciente} {ecg?.apellidos_paciente} • DNI: {ecg?.num_doc_paciente}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2"><X size={20} /></button>
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
              </div>

              {/* Panel de Filtros Avanzados (Expandible v8.0.0) */}
              {showFilterControls && (
                <div className="mt-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 shadow-md overflow-hidden max-h-96 overflow-y-auto">
                  <FilterControlsPanel
                    filters={filters}
                    onFilterChange={updateFilter}
                    onReset={resetFilters}
                    onPresetSelect={applyPreset}
                  />
                </div>
              )}
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

              {/* INFO PACIENTE */}
              <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                <p className="font-bold text-blue-900">{imagenesActuales.length} EKGs</p>
                <p className="text-xs text-blue-700">Imagen actual {indiceImagen + 1} de {imagenesActuales.length}</p>
              </div>

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
                  {/* EVALUACIÓN */}
                  <div className="bg-green-50 p-2.5 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-900 mb-2 text-xs">Evaluación Médica</p>
                    <div className="space-y-1">
                      {["NORMAL", "ANORMAL", "NO_DIAGNOSTICO"].map(tipo => (
                        <label key={tipo} className="flex items-center gap-2 cursor-pointer text-xs">
                          <input type="radio" checked={tipoEvaluacion === tipo} onChange={() => setTipoEvaluacion(tipo)} />
                          {tipo === "NORMAL" ? "Normal" : tipo === "ANORMAL" ? "Anormal" : "No Diagnóstico"}
                        </label>
                      ))}
                    </div>
                    {tipoEvaluacion && (
                      <textarea
                        value={observacionesEval}
                        onChange={(e) => setObservacionesEval(e.target.value)}
                        placeholder="Observaciones clínicas..."
                        className="w-full mt-2 p-1.5 text-xs border rounded resize-none h-16 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    )}
                  </div>

                  {/* PLAN DE SEGUIMIENTO */}
                  <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                    <p className="font-semibold text-purple-900 mb-2 text-xs">Plan de Seguimiento</p>
                    <label className="flex items-center gap-2 cursor-pointer text-xs mb-2">
                      <input type="checkbox" checked={planSeguimiento.recitarEnTresMeses} onChange={(e) => setPlanSeguimiento({...planSeguimiento, recitarEnTresMeses: e.target.checked})} />
                      Recitar en 3 meses
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Especialidad (opcional)"
                        value={planSeguimiento.interconsultaEspecialidad}
                        onChange={(e) => handleEspecialidadChange(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {showEspecialidadesDropdown && filteredEspecialidades.length > 0 && (
                        <div className="absolute top-full mt-1 w-full bg-white border rounded shadow-lg z-10 max-h-32 overflow-y-auto">
                          {filteredEspecialidades.map(esp => (
                            <div key={esp.idEspecialidad} onClick={() => handleSelectEspecialidad(esp.descripcion)} className="px-2 py-1 hover:bg-purple-100 cursor-pointer text-xs">
                              {esp.descripcion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* BOTONES ABAJO */}
            <div className="p-4 border-t flex gap-2 bg-gray-50">
              <button onClick={onClose} className="flex-1 px-3 py-2 text-sm bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancelar</button>
              {imagenValida === false && motivoRechazo && (
                <button onClick={handleRechazar} className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2">
                  <AlertCircle size={16} /> Rechazar
                </button>
              )}
              {imagenValida === true && tipoEvaluacion && (
                <button onClick={handleGuardar} className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Save size={16} /> Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
