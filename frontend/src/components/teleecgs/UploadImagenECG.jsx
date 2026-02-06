import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, X, CheckCircle, AlertCircle, FileImage,
  Loader, Heart, User, Trash2, Plus, Camera, WifiOff, Wifi
} from "lucide-react";
import toast from "react-hot-toast";
import teleekgService from "../../services/teleekgService";
import gestionPacientesService from "../../services/gestionPacientesService";
import CrearAseguradoForm from "./CrearAseguradoForm";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_COMPRESSED_SIZE = 1 * 1024 * 1024; // 1MB target for compression
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MIN_IMAGENES = 4;  // Mínimo de imágenes (PADOMI requirement)
const MAX_IMAGENES = 10; // Máximo de imágenes (PADOMI requirement)
const STORAGE_KEY = "ekgUploadDraft"; // localStorage key

// Función para comprimir imagen a JPEG máximo 1MB
const comprimirImagen = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Redimensionar si es muy grande
        const maxDimension = 2048;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Comprimir iterativamente hasta 1MB
        let quality = 0.9;
        const compresionRecursiva = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              if (blob.size <= MAX_COMPRESSED_SIZE || quality <= 0.1) {
                // Crear File comprimido
                const compressedFile = new File(
                  [blob],
                  `ekg_${Date.now()}.jpg`,
                  { type: "image/jpeg" }
                );
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                compresionRecursiva();
              }
            },
            "image/jpeg",
            quality
          );
        };
        compresionRecursiva();
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
};

export default function UploadImagenEKG({ onSuccess }) {
  // Router navigation
  const navigate = useNavigate();

  // Archivos
  const [archivos, setArchivos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);

  // Paciente
  const [numDocPaciente, setNumDocPaciente] = useState("");
  const [pkAsegurado, setPkAsegurado] = useState(""); // ✅ Guardar PK del asegurado encontrado
  const [datosCompletos, setDatosCompletos] = useState({
    apellidos: "",
    nombres: "",
    sexo: "",
    codigo: "",
  });
  const [searchingPaciente, setSearchingPaciente] = useState(false);
  const [pacienteEncontrado, setPacienteEncontrado] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [respuestaServidor, setRespuestaServidor] = useState(null);
  const [mostrarCrearAsegurado, setMostrarCrearAsegurado] = useState(false);
  const [aseguradoNoExiste, setAseguradoNoExiste] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Refs
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Online/Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("📡 Conexión restaurada - Sincronizando...");
      // Sincronizar automáticamente cuando se reconecta
      sincronizarOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("📵 Sin conexión - Los datos se guardarán localmente");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Cargar datos guardados del localStorage al montar
  useEffect(() => {
    const cargarDraft = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.previews && draft.previews.length > 0) {
            setPreviews(draft.previews);
            // Nota: Los archivos no se pueden recuperar del localStorage
            // pero las previews pueden usarse para mostrar qué se capturó
            setArchivos(new Array(draft.previews.length).fill(null).map(() => ({ name: "compressed" })));
            setNumDocPaciente(draft.numDocPaciente || "");
            setDatosCompletos(draft.datosCompletos || { apellidos: "", nombres: "", sexo: "", codigo: "" });
          }
        }
      } catch (error) {
        console.error("Error cargando draft del localStorage:", error);
      }
    };
    cargarDraft();
  }, []);

  // Guardar en localStorage cada vez que cambian archivos o paciente
  useEffect(() => {
    const guardarDraft = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          previews,
          numDocPaciente,
          datosCompletos,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error("Error guardando draft en localStorage:", error);
      }
    };
    guardarDraft();
  }, [previews, numDocPaciente, datosCompletos]);

  // Buscar paciente por DNI cuando cambia (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (numDocPaciente.length === 8) {
        buscarPacientePorDni();
      } else {
        if (numDocPaciente.length === 0) {
          setDatosCompletos({ apellidos: "", nombres: "", sexo: "", codigo: "" });
          setPacienteEncontrado(false);
        }
      }
    }, 200); // 200ms debounce
    return () => clearTimeout(timer);
  }, [numDocPaciente]);

  const buscarPacientePorDni = async () => {
    try {
      setSearchingPaciente(true);
      const response = await gestionPacientesService.buscarAseguradoPorDni(numDocPaciente);

      if (response && response.numDoc) {
        const paciente = response;
        let nombres = "";
        let apellidos = "";

        if (paciente.apellidosNombres) {
          const partes = paciente.apellidosNombres.trim().split(" ");
          if (partes.length > 2) {
            apellidos = partes.slice(0, 2).join(" ");
            nombres = partes.slice(2).join(" ");
          } else if (partes.length === 2) {
            apellidos = partes[0];
            nombres = partes[1];
          } else {
            apellidos = partes[0];
            nombres = "";
          }
        }

        setDatosCompletos({
          apellidos,
          nombres,
          sexo: paciente.sexo === "M" ? "M" : paciente.sexo === "F" ? "F" : paciente.sexo || "-",
          codigo: paciente.pkAsegurado || paciente.numDoc || numDocPaciente,
        });
        // ✅ Guardar el PK del asegurado para usarlo en la validación del upload
        setPkAsegurado(paciente.pkAsegurado || "");
        setPacienteEncontrado(true);
        toast.success("✅ Paciente encontrado");
      } else {
        setPacienteEncontrado(false);
        toast.error("❌ Paciente no encontrado");
      }
    } catch (error) {
      setPacienteEncontrado(false);
      console.error("Error buscando paciente:", error);
    } finally {
      setSearchingPaciente(false);
    }
  };

  const validarArchivo = (file) => {
    if (!file) {
      toast.error("Por favor selecciona un archivo");
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Solo se permiten archivos JPEG o PNG");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`El archivo no debe superar 5MB`);
      return false;
    }

    return true;
  };

  const agregarArchivos = async (nuevosArchivos) => {
    const archivosValidos = [];
    const nuevosPreviews = [];
    let contador = 0;

    for (let file of nuevosArchivos) {
      if (archivos.length + archivosValidos.length >= MAX_IMAGENES) {
        toast.error(`Máximo ${MAX_IMAGENES} imágenes permitidas`);
        break;
      }

      if (archivos.some(a => a.name === file.name && a.size === file.size)) {
        continue;
      }

      if (validarArchivo(file)) {
        try {
          // Comprimir imagen a JPEG max 1MB
          const comprimido = await comprimirImagen(file);
          archivosValidos.push(comprimido);
          contador++;

          const reader = new FileReader();
          reader.onload = (event) => {
            nuevosPreviews.push(event.target?.result);
            if (nuevosPreviews.length === archivosValidos.length) {
              setArchivos([...archivos, ...archivosValidos]);
              setPreviews([...previews, ...nuevosPreviews]);
              toast.success(`✅ ${contador} imagen(es) comprimida(s) y agregada(s)`);
            }
          };
          reader.readAsDataURL(comprimido);
        } catch (error) {
          toast.error(`Error comprimiendo imagen: ${error.message}`);
        }
      }
    }
  };

  const sincronizarOfflineQueue = async () => {
    if (uploadQueue.length === 0 || !isOnline) return;

    try {
      // Aquí irían las operaciones de sincronización
      // Por ahora es un placeholder para detectar reconexión
      console.log(`Sincronizando ${uploadQueue.length} colas de upload`);
    } catch (error) {
      console.error("Error sincronizando:", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    agregarArchivos(files);
  };

  const handleArchivoSeleccionado = (e) => {
    const files = Array.from(e.target.files || []);
    agregarArchivos(files);
  };

  const removerArchivo = (index) => {
    const nuevosArchivos = archivos.filter((_, i) => i !== index);
    const nuevosPreviews = previews.filter((_, i) => i !== index);
    setArchivos(nuevosArchivos);
    setPreviews(nuevosPreviews);
    toast.success("Imagen removida");
  };

  const validarFormulario = () => {
    if (!numDocPaciente.trim()) {
      toast.error("El DNI es requerido");
      return false;
    }

    if (!pacienteEncontrado) {
      toast.error("El paciente no fue encontrado. Verifica el DNI.");
      return false;
    }

    if (archivos.length < MIN_IMAGENES) {
      toast.error(`Debe seleccionar al menos ${MIN_IMAGENES} imágenes`);
      return false;
    }

    if (archivos.length > MAX_IMAGENES) {
      toast.error(`No puede exceder ${MAX_IMAGENES} imágenes`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      setLoading(true);
      setAseguradoNoExiste(false);

      const formData = new FormData();
      formData.append("numDocPaciente", numDocPaciente);
      formData.append("nombresPaciente", datosCompletos.nombres || "");
      formData.append("apellidosPaciente", datosCompletos.apellidos || "");
      // ✅ Enviar también el PK del asegurado para mejor validación en backend
      if (pkAsegurado) {
        formData.append("pkAsegurado", pkAsegurado);
      }

      archivos.forEach((archivo) => {
        formData.append(`archivos`, archivo);
      });

      const respuesta = await teleekgService.subirMultiplesImagenes(formData);

      setRespuestaServidor(respuesta);
      setEnviado(true);
      toast.success(`✅ ${archivos.length} EKGs cargados exitosamente`);

      setTimeout(() => {
        resetFormulario();
        if (onSuccess) onSuccess();

        // ✅ Redirigir a la vista de listado con información del paciente
        navigate("/teleekgs/listar", {
          state: {
            mensaje: `✅ ${archivos.length} EKGs subidos correctamente`,
            numDoc: numDocPaciente,
          },
        });
      }, 2000);

    } catch (error) {
      console.error("Error al cargar EKGs:", error);

      // 🔍 CRÍTICO: Solo mostrar modal de "Crear Asegurado" si el error es ESPECÍFICO
      // No si contiene "asegurado" en cualquier contexto (ej: fallo técnico)
      const errMsg = error.response?.data?.message || error.message || "";
      const isAseguradoNoExisteError =
        errMsg.toLowerCase().includes("no existe") ||
        errMsg.toLowerCase().includes("no encontrado") ||
        (error.response?.status === 404 && errMsg.toLowerCase().includes("asegurado"));

      if (isAseguradoNoExisteError) {
        setAseguradoNoExiste(true);
        toast.error("El asegurado no existe. Por favor créalo primero.");
        setMostrarCrearAsegurado(true);
      } else {
        toast.error(error.response?.data?.message || "Error al cargar los EKGs");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetFormulario = () => {
    setArchivos([]);
    setPreviews([]);
    setNumDocPaciente("");
    setPkAsegurado(""); // ✅ Limpiar PK también
    setDatosCompletos({ apellidos: "", nombres: "", sexo: "", codigo: "" });
    setEnviado(false);
    setRespuestaServidor(null);
    setPacienteEncontrado(false);
    setCarouselIndex(0);
    localStorage.removeItem(STORAGE_KEY);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const getContadorMensaje = () => {
    const faltantes = MIN_IMAGENES - archivos.length;
    if (faltantes <= 0) return `✅ ¡Perfecto! Tienes ${archivos.length} fotos`;
    if (faltantes === 1) return `¡Casi! Solo falta 1 foto más`;
    return `¡Vas bien! Toma ${faltantes} fotos más`;
  };

  const getProgressPercentage = () => {
    return Math.min((archivos.length / MIN_IMAGENES) * 100, 100);
  };

  if (mostrarCrearAsegurado && aseguradoNoExiste) {
    return (
      <CrearAseguradoForm
        numDocPaciente={numDocPaciente}
        nombresPaciente={datosCompletos.nombres}
        apellidosPaciente={datosCompletos.apellidos}
        onCancel={() => setMostrarCrearAsegurado(false)}
        onSuccess={() => {
          setMostrarCrearAsegurado(false);
          setAseguradoNoExiste(false);
          toast.success("Asegurado creado. Intenta cargar el EKG nuevamente.");
        }}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col h-screen">
      {/* Header Profesional con Indicator Online/Offline - v1.51.0: OPCION A (Emerald gradient para diferenciación) */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">📤 Nuevo Upload de EKGs</h2>
            <p className="text-emerald-100 text-xs mt-0.5">CENATE - EsSalud Perú</p>
          </div>
        </div>
        {/* Online/Offline Indicator */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              Conectado
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              Sin conexión
            </>
          )}
        </div>
      </div>

      {/* Contenido - RESPONSIVE LAYOUT */}
      {/* Nota: md:flex xl:hidden = Solo tablets (768px-1279px) */}
      <form onSubmit={handleSubmit} className="flex flex-1 overflow-hidden gap-6 p-6 md:flex xl:hidden">
        {/* LEFT PANEL - Paciente (50% ancho) - SOLO TABLET */}
        <div className="hidden md:flex md:flex-col md:w-1/2 gap-5 border-r-3 border-gray-300 pr-8 overflow-y-auto xl:hidden">
          {/* Sección de Búsqueda de Paciente */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <h3 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Datos del Paciente
            </h3>

            {/* DNI Input con type="tel" para teclado numérico */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">DNI (8 dígitos) *</label>
              <div className="relative">
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  value={numDocPaciente}
                  onChange={(e) => setNumDocPaciente(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                  placeholder="Ej: 12345678"
                  maxLength="8"
                  disabled={searchingPaciente}
                  className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xl font-bold h-14"
                />
                <div className="absolute right-3 top-3">
                  {searchingPaciente && (
                    <Loader className="w-5 h-5 animate-spin text-blue-600" />
                  )}
                  {pacienteEncontrado && !searchingPaciente && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Datos Auto-cargados - Confirmación Persistente */}
            {pacienteEncontrado ? (
              <div className="mt-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-5 border-3 border-green-600 shadow-lg">
                <p className="text-sm font-bold text-green-900 mb-3">✅ PACIENTE CONFIRMADO</p>
                <div className="text-lg font-bold text-white mb-2">
                  {datosCompletos.apellidos} {datosCompletos.nombres}
                </div>
                <div className="text-sm text-green-100">
                  {datosCompletos.sexo === "M" ? "👨" : datosCompletos.sexo === "F" ? "👩" : "👤"} • Código: {datosCompletos.codigo}
                </div>
              </div>
            ) : (
              <div className="mt-4 bg-gray-200 rounded-xl p-5 text-sm text-gray-700 text-center font-medium">
                👆 Ingresa DNI para buscar paciente
              </div>
            )}
          </div>

          {/* Contador y Progreso */}
          {archivos.length > 0 && (
            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-5">
              <p className="text-base font-bold text-indigo-900 mb-3">
                {getContadorMensaje()}
              </p>
              {/* Progress Bar */}
              <div className="w-full bg-gray-400 rounded-full h-4 overflow-hidden shadow-md">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <p className="text-sm font-semibold text-indigo-800 mt-3">
                📸 {archivos.length}/{MIN_IMAGENES} imágenes capturadas
              </p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - Cámara (50% ancho) - SOLO TABLET */}
        <div className="flex-1 md:w-1/2 flex flex-col gap-4 overflow-y-auto pl-2 xl:hidden">

          {/* GIANT CAMERA BUTTON - Primary CTA */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={!pacienteEncontrado || loading}
            className={`w-full py-12 md:py-16 rounded-3xl font-black text-3xl md:text-4xl flex flex-col items-center justify-center gap-4 transition transform active:scale-95 shadow-2xl ${
              pacienteEncontrado && !loading
                ? "bg-gradient-to-br from-cyan-500 via-teal-500 to-teal-600 hover:from-cyan-600 hover:via-teal-600 hover:to-teal-700 text-white hover:shadow-3xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
            }`}
            aria-label="Tomar foto del EKG"
          >
            <Camera className={`${pacienteEncontrado ? 'w-16 h-16' : 'w-12 h-12'} md:w-20 md:h-20`} strokeWidth={1.5} />
            <span>TOMAR FOTO</span>
            <span className={`${pacienteEncontrado ? 'text-xl' : 'text-lg'} font-bold text-white/95 md:text-2xl`}>
              {archivos.length}/{MAX_IMAGENES}
            </span>
          </button>

          {/* Carrete/Carousel de Thumbnails */}
          {archivos.length > 0 && (
            <div className="bg-white border-3 border-gray-300 rounded-2xl p-4 shadow-lg">
              <p className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                📸 Fotos Capturadas ({archivos.length})
              </p>

              {/* Carousel Horizontal */}
              <div className="relative">
                <div className="flex gap-3 overflow-x-auto pb-3 scroll-smooth">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative flex-shrink-0">
                      <img
                        src={preview}
                        alt={`Captura ${index + 1}`}
                        onClick={() => setCarouselIndex(index)}
                        className={`w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover cursor-pointer transition-all border-3 ${
                          carouselIndex === index
                            ? "border-blue-600 ring-4 ring-blue-400 shadow-lg scale-105"
                            : "border-gray-400 hover:border-blue-400 hover:shadow-md"
                        }`}
                      />
                      {/* Delete Button (X) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removerArchivo(index);
                        }}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg transition"
                        disabled={loading}
                        aria-label={`Eliminar foto ${index + 1}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {/* Index Badge */}
                      <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen Comprimido */}
              <div className="mt-3 text-xs text-gray-600 space-y-1">
                <p>
                  <strong>Capturadas:</strong> {archivos.length}/{MAX_IMAGENES}
                </p>
                <p>
                  <strong>Tamaño:</strong> {(archivos.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)}MB
                </p>
              </div>
            </div>
          )}

          {/* Botón Alternativo - Buscar en Galería */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!pacienteEncontrado || loading || archivos.length >= MAX_IMAGENES}
            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition ${
              pacienteEncontrado && !loading && archivos.length < MAX_IMAGENES
                ? "bg-gray-300 hover:bg-gray-400 text-gray-800 shadow-md"
                : "bg-gray-200 text-gray-500 cursor-not-allowed opacity-50"
            }`}
            aria-label="Buscar imágenes en galería"
          >
            <FileImage className="w-5 h-5" />
            Buscar en Galería
          </button>

          {/* Hidden File Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleArchivoSeleccionado}
            className="hidden"
            disabled={loading || archivos.length >= MAX_IMAGENES}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleArchivoSeleccionado}
            className="hidden"
            disabled={loading || archivos.length >= MAX_IMAGENES}
          />

          {/* Respuesta del Servidor */}
          {enviado && respuestaServidor && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-green-800">✅ ¡{archivos.length} EKGs Cargados!</p>
                  <p className="text-xs text-green-700 mt-1">
                    Paciente: {datosCompletos.apellidos} {datosCompletos.nombres}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción - Optimizados para Tablet */}
          <div className="flex flex-col gap-3 pt-4 mt-auto">
            <button
              type="submit"
              disabled={archivos.length < MIN_IMAGENES || loading || enviado || !pacienteEncontrado}
              className={`py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl flex items-center justify-center gap-3 transition duration-200 shadow-xl ${
                archivos.length < MIN_IMAGENES || loading || enviado || !pacienteEncontrado
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 hover:from-emerald-700 hover:via-teal-700 hover:to-teal-800 text-white shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
              }`}
              title={archivos.length < MIN_IMAGENES ? `Se requieren al menos ${MIN_IMAGENES} imágenes` : ""}
            >
              {loading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  <span>Subiendo {archivos.length} EKGs...</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  <span>{archivos.length >= MIN_IMAGENES ? `✅ Subir ${archivos.length} EKGs` : `⏳ Faltan ${MIN_IMAGENES - archivos.length} fotos`}</span>
                </>
              )}
            </button>

            {(archivos.length > 0 || enviado) && (
              <button
                type="button"
                onClick={resetFormulario}
                disabled={loading}
                className="py-4 border-3 border-red-300 rounded-xl font-bold text-red-700 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                🗑️ Limpiar Todo
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Información de Ayuda - Footer Compacto */}
      <div className="bg-blue-50 border-t-2 border-blue-200 px-6 py-4 text-xs text-blue-800 space-y-1">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
          <div className="space-y-1">
            <p><strong>Min {MIN_IMAGENES}</strong> fotos • <strong>Máx {MAX_IMAGENES}</strong> fotos</p>
            <p>Comprimidas a JPEG (máx 1MB cada una)</p>
            <p>Todas asociadas al mismo paciente DNI {numDocPaciente}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
