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
} from "lucide-react";
import toast from "react-hot-toast";
import teleecgService from "../../services/teleecgService";

/**
 * 🏥 MODAL CONSOLIDADO - TRIAJE CLÍNICO ECG (v6.0.0)
 *
 * Flujo médico profesional con 3 TABS:
 * 1. 👁️ VER IMÁGENES - Carrusel de 4 ECGs con zoom/rotación
 * 2. ✓ EVALUACIÓN - Seleccionar Normal/Anormal + Observaciones
 * 3. 📋 NOTA CLÍNICA - Hallazgos y Plan de Seguimiento
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
  const [zoom, setZoom] = useState(100);
  const [rotacion, setRotacion] = useState(0);

  // ════════════════════════════════════════
  // TAB 2: EVALUACIÓN
  // ════════════════════════════════════════
  const [evaluacion, setEvaluacion] = useState("");
  const [observacionesEval, setObservacionesEval] = useState("");

  // ════════════════════════════════════════
  // TAB 3: NOTA CLÍNICA
  // ════════════════════════════════════════
  const [hallazgos, setHallazgos] = useState({
    ritmo: false,
    frecuencia: false,
    intervaloPR: false,
    duracionQRS: false,
    segmentoST: false,
    ondaT: false,
    eje: false,
  });
  const [observacionesNota, setObservacionesNota] = useState("");
  const [planSeguimiento, setPlanSeguimiento] = useState({
    seguimientoMeses: false,
    seguimientoDias: null,
    derivarCardiologo: false,
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

      // Restablecer zoom y rotación al cambiar imagen
      setZoom(100);
      setRotacion(0);
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
  // CONTROLES DE IMAGEN
  // ════════════════════════════════════════
  const handleZoomMas = () => setZoom(Math.min(200, zoom + 20));
  const handleZoomMenos = () => setZoom(Math.max(20, zoom - 20));
  const rotarImagen = () => setRotacion((rotacion + 90) % 360);

  // ════════════════════════════════════════
  // ATAJOS DE TECLADO
  // ════════════════════════════════════════
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e) => {
      if (e.key === "n" || e.key === "N") {
        setEvaluacion("NORMAL");
        setActiveTab("evaluar");
      } else if (e.key === "a" || e.key === "A") {
        setEvaluacion("ANORMAL");
        setActiveTab("evaluar");
      } else if (e.key === "ArrowLeft") {
        irImagenAnterior();
      } else if (e.key === "ArrowRight") {
        irImagenSiguiente();
      } else if (e.key === "Tab") {
        e.preventDefault();
        const tabs = ["ver", "evaluar", "nota"];
        const indiceActual = tabs.indexOf(activeTab);
        const siguiente = tabs[(indiceActual + 1) % tabs.length];
        setActiveTab(siguiente);
      } else if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleGuardar();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, activeTab, indiceImagen]);

  // ════════════════════════════════════════
  // GUARDAR - CONSOLIDAR TODOS LOS DATOS
  // ════════════════════════════════════════
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
    setHallazgos({
      ritmo: false,
      frecuencia: false,
      intervaloPR: false,
      duracionQRS: false,
      segmentoST: false,
      ondaT: false,
      eje: false,
    });
    setPlanSeguimiento({
      seguimientoMeses: false,
      seguimientoDias: null,
      derivarCardiologo: false,
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* ════ HEADER ════ */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              🏥 Triaje Clínico - ECG
            </h2>
            <p className="text-sm text-gray-600">
              {ecg?.nombrePaciente || "Paciente"} • DNI: {ecg?.numDocPaciente}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* ════ TABS NAVEGACIÓN ════ */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab("ver")}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === "ver"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Eye size={18} /> VER IMÁGENES
          </button>
          <button
            onClick={() => setActiveTab("evaluar")}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === "evaluar"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <CheckCircle size={18} /> EVALUACIÓN
          </button>
          <button
            onClick={() => setActiveTab("nota")}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === "nota"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FileText size={18} /> NOTA CLÍNICA
          </button>
        </div>

        {/* ════ CONTENIDO DE TABS ════ */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: VER IMÁGENES */}
          {activeTab === "ver" && (
            <div className="grid grid-cols-3 gap-6">
              {/* Imagen Principal */}
              <div className="col-span-2">
                <div className="bg-gray-100 rounded-lg p-4 h-96 flex flex-col">
                  {imagenData ? (
                    <div className="flex-1 flex items-center justify-center overflow-hidden">
                      <img
                        src={imagenData}
                        alt={`ECG ${indiceImagen + 1}`}
                        style={{
                          transform: `scale(${zoom / 100}) rotate(${rotacion}deg)`,
                          transition: "transform 0.2s ease-out",
                        }}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
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

                  {/* Controles */}
                  <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
                    <button
                      onClick={handleZoomMenos}
                      className="p-2 hover:bg-gray-200 rounded"
                      title="Zoom menos (Ctrl+-)"
                    >
                      <ZoomOut size={20} />
                    </button>
                    <span className="text-sm font-semibold">{zoom}%</span>
                    <button
                      onClick={handleZoomMas}
                      className="p-2 hover:bg-gray-200 rounded"
                      title="Zoom más (Ctrl++)"
                    >
                      <ZoomIn size={20} />
                    </button>
                    <div className="w-px h-6 bg-gray-300" />
                    <button
                      onClick={rotarImagen}
                      className="p-2 hover:bg-gray-200 rounded"
                      title="Rotar 90°"
                    >
                      <RotateCw size={20} />
                    </button>
                  </div>
                </div>

                {/* Navegación de imágenes */}
                <div className="flex items-center justify-between mt-4">
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
                <p className="text-xs text-gray-500 mt-2">
                  ⌨️ Atajos: N=Normal • A=Anormal • ←→=Imágenes • Tab=Siguiente
                  tab
                </p>
              </div>

              {/* Panel derecho: Info paciente */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3">Información</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Paciente:</span>
                    <p className="font-semibold">{ecg?.nombrePaciente}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">DNI:</span>
                    <p className="font-semibold">{ecg?.numDocPaciente}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">IPRESS:</span>
                    <p className="font-semibold text-xs">
                      {ecg?.nombreIpress}
                    </p>
                  </div>
                  <div className="pt-3 border-t">
                    <span className="text-gray-600">Total ECGs:</span>
                    <p className="text-2xl font-bold text-blue-600">
                      {imagenesActuales.length}
                    </p>
                  </div>
                </div>
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
                    Resultado del ECG *
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setEvaluacion("NORMAL")}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                        evaluacion === "NORMAL"
                          ? "bg-green-500 text-white shadow-lg scale-105"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      ✓ NORMAL
                    </button>
                    <button
                      onClick={() => setEvaluacion("ANORMAL")}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                        evaluacion === "ANORMAL"
                          ? "bg-red-500 text-white shadow-lg scale-105"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      ⚠️ ANORMAL
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
                    ✓ Evaluación seleccionada: <span className="text-lg">{evaluacion || "—"}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTA CLÍNICA */}
          {activeTab === "nota" && (
            <div className="max-w-3xl space-y-6">
              {/* Hallazgos */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  📋 Hallazgos
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "ritmo", label: "Ritmo" },
                    { key: "frecuencia", label: "Frecuencia" },
                    { key: "intervaloPR", label: "Intervalo PR" },
                    { key: "duracionQRS", label: "Duración QRS" },
                    { key: "segmentoST", label: "Segmento ST" },
                    { key: "ondaT", label: "Onda T" },
                    { key: "eje", label: "Eje" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hallazgos[item.key]}
                        onChange={(e) =>
                          setHallazgos({
                            ...hallazgos,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">
                        ☑ {item.label}
                      </span>
                    </label>
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

                  <label className="flex items-center gap-2">
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
                    <span className="text-sm text-gray-700">
                      Derivar a cardiólogo
                    </span>
                  </label>

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

        {/* ════ FOOTER / ACCIONES ════ */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {activeTab === "ver" && "Paso 1 de 3: Ver imágenes"}
            {activeTab === "evaluar" && "Paso 2 de 3: Evaluación"}
            {activeTab === "nota" && "Paso 3 de 3: Nota clínica"}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium"
            >
              Cancelar
            </button>

            {activeTab !== "ver" && (
              <button
                onClick={() => setActiveTab("ver")}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
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
                className="px-6 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg font-medium"
              >
                Siguiente ▶
              </button>
            )}

            {activeTab === "nota" && (
              <button
                onClick={handleGuardar}
                disabled={loading || !evaluacion}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2"
              >
                ✓ Guardar Evaluación
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
