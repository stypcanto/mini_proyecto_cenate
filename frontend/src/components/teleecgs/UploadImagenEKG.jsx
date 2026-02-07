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
  const [imageValidationStates, setImageValidationStates] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [activeSection, setActiveSection] = useState("patient");

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

  const validateImageFile = (file, index) => {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      return {
        isValid: false,
        error: `Imagen ${index + 1}: Solo JPEG o PNG permitido`,
        state: "error"
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Imagen ${index + 1}: Excede 5MB`,
        state: "error"
      };
    }
    return { isValid: true, state: "processing" };
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
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col h-screen xl:h-auto xl:w-[850px] xl:fixed xl:inset-0 xl:m-auto xl:max-h-[90vh] xl:flex-row">
      {/* Header Profesional - Full width for all devices */}
      <div className="xl:col-span-full bg-gradient-to-r from-purple-600 to-indigo-700 xl:from-cyan-600 xl:to-blue-700 md:from-emerald-600 md:to-teal-700 px-6 py-5 xl:py-2 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl xl:text-base font-bold text-white">
              <span className="hidden md:inline xl:hidden">📤 Nuevo Upload de EKGs</span>
              <span className="md:hidden xl:inline">Cargar Electrocardiograma</span>
            </h2>
            <p className="text-blue-100 md:text-emerald-100 xl:text-cyan-100 text-xs xl:text-[11px] mt-0.5 xl:mt-0">Centro Nacional de Telemedicina - EsSalud</p>
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
        {/* Close Button - Desktop Only */}
        <button
          onClick={() => navigate(-1)}
          className="hidden xl:flex p-1.5 hover:bg-white/20 rounded-lg transition-colors absolute top-2 right-2"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Desktop: 3 Bloques Verticales Apilados (xl: 1280px+) */}
      <form onSubmit={handleSubmit} className="hidden xl:flex xl:flex-col flex-1 overflow-hidden bg-white">

        {/* ==================== BLOQUE 1: VALIDACIÓN PACIENTE (20%) ==================== */}
        <div className="flex-shrink-0 p-5 bg-blue-50 border-b-2 border-blue-300">
          <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Información del Paciente
          </h3>

          {/* Input DNI */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-blue-800 mb-1">DNI DEL PACIENTE *</label>
            <div className="relative">
              <input
                type="tel"
                inputMode="numeric"
                value={numDocPaciente}
                onChange={(e) => setNumDocPaciente(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                placeholder="8 dígitos"
                maxLength="8"
                disabled={searchingPaciente}
                className="w-full px-3 py-2 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-semibold transition-all duration-200"
              />
              <div className="absolute right-2 top-2">
                {searchingPaciente && <Loader className="w-4 h-4 animate-spin text-blue-600" />}
                {pacienteEncontrado && !searchingPaciente && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
            </div>
          </div>

          {/* Panel Confirmación (Condicional) */}
          {pacienteEncontrado ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 transition-all duration-200">
              <p className="text-xs font-bold text-green-800 mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                PACIENTE VALIDADO
              </p>
              <div className="text-sm font-bold text-green-900">
                {datosCompletos.apellidos}
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-3 text-xs text-gray-700 text-center font-medium transition-all duration-200">
              👆 Ingresa DNI del paciente
            </div>
          )}
        </div>

        {/* ==================== BLOQUE 2: ÁREA DE CARGA (60%) ==================== */}
        <div className="flex-1 overflow-y-auto p-5 bg-white border-b-2 border-gray-300">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            Selecciona las Imágenes del EKG
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            Sube entre {MIN_IMAGENES} y {MAX_IMAGENES} imágenes en formato JPEG o PNG
          </p>

          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 mb-4 ${
              pacienteEncontrado && !loading && archivos.length < MAX_IMAGENES
                ? dragActive
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-blue-400 bg-blue-50/30 hover:border-blue-600 hover:bg-blue-50"
                : "border-gray-300 bg-gray-50 cursor-not-allowed opacity-50"
            }`}
          >
            <Upload className={`w-10 h-10 mx-auto mb-2 transition-colors duration-200 ${
              pacienteEncontrado && !loading ? "text-blue-600" : "text-gray-400"
            }`} />
            <h4 className={`text-sm font-bold mb-1 transition-colors duration-200 ${
              pacienteEncontrado && !loading ? "text-blue-900" : "text-gray-500"
            }`}>
              Arrastra tus archivos aquí
            </h4>
            <p className={`text-xs transition-colors duration-200 ${
              pacienteEncontrado && !loading ? "text-blue-700" : "text-gray-500"
            }`}>
              o haz clic para buscar en tu computadora
            </p>
          </div>

          {/* Grid de Imágenes */}
          {archivos.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">
                Imágenes Cargadas ({archivos.length}/{MAX_IMAGENES})
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    {/* Contenedor Imagen */}
                    <div className={`border-2 ${
                      imageValidationStates[index] === 'valid' ? 'border-blue-500 shadow-md shadow-blue-200' :
                      imageValidationStates[index] === 'error' ? 'border-red-500 shadow-md shadow-red-200' :
                      imageValidationStates[index] === 'warning' ? 'border-amber-500 shadow-md shadow-amber-200' :
                      imageValidationStates[index] === 'processing' ? 'border-green-500 shadow-md shadow-green-200' :
                      'border-gray-300'
                    } rounded-lg overflow-hidden bg-white transition-transform duration-200 hover:scale-105`}>
                      <img src={preview} alt={`EKG ${index + 1}`} className="w-full h-24 object-cover" />

                      {/* Overlay Hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => removerArchivo(index)}
                          className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full transition-colors duration-200 shadow-lg"
                          title="Eliminar imagen"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Ícono Estado */}
                      <div className="absolute top-1.5 right-1.5 bg-white rounded-full p-1 shadow-md">
                        {imageValidationStates[index] === 'valid' && <CheckCircle className="w-3 h-3 text-blue-600" />}
                        {imageValidationStates[index] === 'error' && <AlertCircle className="w-3 h-3 text-red-600" />}
                        {imageValidationStates[index] === 'warning' && <AlertCircle className="w-3 h-3 text-amber-600" />}
                        {imageValidationStates[index] === 'processing' && <Loader className="w-3 h-3 animate-spin text-green-600" />}
                      </div>
                    </div>

                    {/* Info Below */}
                    <p className="text-[10px] font-semibold text-gray-800 truncate mt-1">
                      {archivos[index]?.name || `EKG ${index + 1}`}
                    </p>

                    {/* Error Message */}
                    {imageErrors[index] && (
                      <p className="text-[10px] text-amber-700 font-medium mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {imageErrors[index]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ==================== BLOQUE 3: RESUMEN Y ENVÍO (20%) ==================== */}
        <div className="flex-shrink-0 p-5 bg-white border-t-2 border-gray-300">
          {/* Alerta Faltan Fotos (Condicional) */}
          {archivos.length > 0 && archivos.length < MIN_IMAGENES && (
            <div className="mb-3 p-3 bg-blue-100 border-2 border-blue-300 rounded-lg transition-all duration-200">
              <p className="text-xs font-semibold text-blue-800">
                📸 Faltan {MIN_IMAGENES - archivos.length} imagen(es) más para cumplir el mínimo requerido
              </p>
            </div>
          )}

          {/* Alerta Máximo Alcanzado (Condicional) */}
          {archivos.length === MAX_IMAGENES && (
            <div className="mb-3 p-3 bg-amber-100 border-2 border-amber-300 rounded-lg transition-all duration-200">
              <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                ¡Máximo alcanzado! No puedes agregar más imágenes
              </p>
            </div>
          )}

          {/* Errores de Validación (Condicional) */}
          {Object.values(imageErrors).length > 0 && (
            <div className="mb-3 p-3 bg-red-50 border-2 border-red-300 rounded-lg transition-all duration-200">
              <p className="text-xs font-bold text-red-800 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Errores de Validación
              </p>
              <ul className="space-y-0.5">
                {Object.values(imageErrors).map((error, idx) => (
                  <li key={idx} className="text-[10px] text-red-700">• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botón Upload */}
          <button
            type="submit"
            disabled={archivos.length < MIN_IMAGENES || !pacienteEncontrado || loading || Object.values(imageErrors).length > 0}
            className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
              archivos.length >= MIN_IMAGENES && pacienteEncontrado && !loading && Object.values(imageErrors).length === 0
                ? "bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-60"
            }`}
            title={archivos.length < MIN_IMAGENES ? `Requiere mínimo ${MIN_IMAGENES} imágenes y paciente validado` : "Cargar todos los EKGs"}
          >
            {loading ? (
              <>
                <div className="animate-spin">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-sm">Subiendo...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="text-sm">Cargar {archivos.length} EKG{archivos.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>

          {/* Footer Info */}
          <p className="text-[10px] text-gray-500 text-center mt-2">
            Los archivos se procesarán en paralelo
          </p>
        </div>

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
      </form>

      {/* Mobile/Tablet: Existing Layout */}
      <form onSubmit={handleSubmit} className="xl:hidden flex flex-col flex-1 overflow-hidden gap-6 p-6 md:flex-row md:gap-0.5 md:p-1.5 md:overflow-y-auto">
        {/* LEFT PANEL - Paciente (Desktop: ancho completo | Tablet: 50%) - COMPRIMIDO PARA TABLET */}
        <div className="hidden md:flex md:flex-col md:w-1/2 w-full gap-1.5 md:gap-1.5 xl:gap-2 border-r-2 md:border-r border-gray-300 md:pr-2 xl:pr-0 overflow-y-auto md:overflow-y-visible">
          {/* Sección de Búsqueda de Paciente - v1.51.0 Desktop Compacto | Tablet Ultracompacto */}
          <div className="bg-blue-50 border-2 md:border border-blue-200 rounded-lg p-3 md:p-2 xl:p-3 xl:rounded-lg">
            <h3 className="text-sm md:text-xs xl:text-sm font-bold text-blue-900 mb-2 md:mb-1 xl:mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 md:w-3.5 md:h-3.5 xl:w-4 xl:h-4" />
              <span>Paciente</span>
            </h3>

            {/* DNI Input con type="tel" para teclado numérico */}
            <div>
              <label className="block text-xs md:text-xs xl:text-xs font-bold text-gray-800 mb-1 md:mb-0.5 xl:mb-1 uppercase tracking-wide">DNI</label>
              <div className="relative">
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  value={numDocPaciente}
                  onChange={(e) => setNumDocPaciente(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                  placeholder="8 dígitos"
                  maxLength="8"
                  disabled={searchingPaciente}
                  className="w-full px-3 py-2.5 md:py-1 xl:py-2 border-2 border-blue-400 rounded-lg md:rounded xl:rounded focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg md:text-xs xl:text-sm font-bold md:font-semibold xl:font-semibold"
                />
                <div className="absolute right-2 top-2.5 md:top-1.5 xl:top-2">
                  {searchingPaciente && (
                    <Loader className="w-4 h-4 md:w-3.5 md:h-3.5 animate-spin text-blue-600" />
                  )}
                  {pacienteEncontrado && !searchingPaciente && (
                    <CheckCircle className="w-4 h-4 md:w-3.5 md:h-3.5 text-green-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Datos Auto-cargados - Confirmación (Oculto en Desktop) - COMPRIMIDO TABLET */}
            {pacienteEncontrado ? (
              <div className="mt-1 md:mt-1 xl:hidden bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg p-2 md:p-2 border md:border border-green-600 shadow-md">
                <p className="text-xs md:text-xs font-bold text-green-900 mb-0.5 leading-tight">✅ CONFIRMADO</p>
                <div className="text-xs md:text-xs font-bold text-white leading-tight">
                  {datosCompletos.apellidos}
                </div>
              </div>
            ) : (
              <div className="mt-1 md:mt-1 xl:hidden bg-gray-200 rounded-lg p-2 md:p-2 text-xs text-gray-700 text-center font-medium leading-tight">
                👆 Ingresa DNI
              </div>
            )}
          </div>

          {/* Contador y Progreso (Oculto en Desktop) - COMPRIMIDO TABLET */}
          {archivos.length > 0 && (
            <div className="xl:hidden bg-indigo-50 border md:border border-indigo-300 rounded-lg p-1.5 md:p-1">
              <p className="text-xs md:text-xs font-bold text-indigo-900 mb-1 leading-tight">
                {getContadorMensaje()}
              </p>
              {/* Progress Bar */}
              <div className="w-full bg-gray-400 rounded-full h-1.5 md:h-1 overflow-hidden shadow-sm">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <p className="text-xs md:text-xs font-semibold text-indigo-800 mt-0.5">
                📸 {archivos.length}/{MIN_IMAGENES}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - Cámara (Desktop: ancho completo | Tablet: 50%) - COMPRIMIDO */}
        <div className="flex-1 md:flex-none md:w-1/2 w-full flex flex-col gap-1 md:gap-0.5 xl:gap-2 overflow-y-auto md:pl-1 xl:pl-0">

          {/* CAMERA BUTTON - Desktop: Compacto | Tablet: ULTRACOMPACTO */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={!pacienteEncontrado || loading}
            className={`w-full py-4 md:py-3 xl:hidden rounded-2xl md:rounded-xl font-black text-2xl md:text-base flex flex-col items-center justify-center gap-1 md:gap-0.5 transition transform active:scale-95 shadow-lg md:shadow ${
              pacienteEncontrado && !loading
                ? "bg-gradient-to-br from-cyan-500 via-teal-500 to-teal-600 hover:from-cyan-600 hover:via-teal-600 hover:to-teal-700 text-white hover:shadow-2xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
            }`}
            aria-label="Tomar foto del EKG"
          >
            <Camera className={`${pacienteEncontrado ? 'w-10 h-10' : 'w-8 h-8'} md:w-8 md:h-8`} strokeWidth={2} />
            <span className="md:text-sm md:leading-tight">TOMAR FOTO</span>
            <span className={`${pacienteEncontrado ? 'text-base' : 'text-sm'} font-bold text-white/95 md:text-sm`}>
              {archivos.length}/{MAX_IMAGENES}
            </span>
          </button>

          {/* Carrete/Carousel de Thumbnails (Oculto en Desktop) */}
          {archivos.length > 0 && (
            <div className="xl:hidden bg-white border-2 md:border border-gray-300 rounded-xl md:rounded-lg p-2 md:p-1.5 shadow-md md:shadow-sm">
              <p className="text-xs md:text-xs font-bold text-gray-800 mb-2 md:mb-1.5 uppercase tracking-wide">
                📸 Fotos ({archivos.length})
              </p>

              {/* Carousel Horizontal */}
              <div className="relative">
                <div className="flex gap-2 md:gap-1.5 overflow-x-auto pb-1.5 md:pb-1 scroll-smooth">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative flex-shrink-0 group">
                      <img
                        src={preview}
                        alt={`Captura ${index + 1}`}
                        onClick={() => setCarouselIndex(index)}
                        className={`w-20 h-20 md:w-24 md:h-24 rounded-lg md:rounded-lg object-cover cursor-pointer transition-all border-2 md:border-2 ${
                          carouselIndex === index
                            ? "border-blue-600 ring-4 ring-blue-400 shadow-2xl scale-105"
                            : "border-gray-400 hover:border-blue-400 hover:shadow-lg"
                        }`}
                      />
                      {/* Index Badge */}
                      <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs md:text-xs font-bold px-1.5 py-0.5 rounded-md shadow-md border border-white">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen Comprimido */}
              <div className="mt-1 md:mt-1 space-y-0.5 md:space-y-0.5">
                <div className="text-xs md:text-xs text-gray-600 space-y-0">
                  <p className="leading-tight">
                    <strong>Capturadas:</strong> {archivos.length}/{MAX_IMAGENES}
                  </p>
                  <p className="leading-tight">
                    <strong>Tamaño:</strong> {(archivos.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)}MB
                  </p>
                </div>

                {/* Botón Eliminar Foto Seleccionada */}
                {archivos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => removerArchivo(carouselIndex)}
                    disabled={loading}
                    className="w-full py-2 md:py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-sm md:text-xs rounded-lg md:rounded transition transform hover:scale-105 active:scale-95 shadow-md md:shadow-sm flex items-center justify-center gap-1 md:gap-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 md:w-3.5 h-4 md:h-3.5" />
                    <span>Eliminar Foto #{carouselIndex + 1}</span>
                  </button>
                )}
              </div>
            </div>
          )}


          {/* Seleccionar Imágenes del EKG - Desktop: Con título | Tablet/Mobile: Solo botón */}
          <div>
            {/* Título con contador - Desktop */}
            <h3 className="hidden xl:flex items-center gap-2 text-base font-bold text-purple-700 mb-2">
              <FileImage className="w-5 h-5" />
              Selecciona las Imágenes del EKG * ({archivos.length}/{MAX_IMAGENES})
            </h3>

            {/* Subtítulo - Desktop */}
            <p className="hidden xl:block text-sm font-semibold text-purple-600 mb-3">
              Mínimo {MIN_IMAGENES} imágenes requeridas
            </p>

            {/* Botón Seleccionar - Todos los dispositivos */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!pacienteEncontrado || loading || archivos.length >= MAX_IMAGENES}
              className={`w-full py-1.5 md:py-1.5 xl:py-3 rounded-lg md:rounded-lg font-bold text-base md:text-xs xl:text-sm flex items-center justify-center gap-1 md:gap-0.5 transition mb-0 md:mb-0 xl:mb-2 ${
                pacienteEncontrado && !loading && archivos.length < MAX_IMAGENES
                  ? "bg-gray-400 hover:bg-gray-500 text-gray-800 shadow-sm md:shadow-none"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed opacity-50"
              }`}
              aria-label="Buscar imágenes en galería"
            >
              <FileImage className="w-4 h-4 md:w-3.5 md:h-3.5 xl:w-5 xl:h-5" />
              <span className="hidden xl:inline">Seleccionar Imágenes ({MIN_IMAGENES}-{MAX_IMAGENES})</span>
              <span className="md:inline xl:hidden text-xs">Sel</span>
            </button>

            {/* Drop Zone - Solo Desktop */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`hidden xl:flex flex-col border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                pacienteEncontrado && !loading && archivos.length < MAX_IMAGENES
                  ? dragActive
                    ? "border-purple-600 bg-purple-50"
                    : "border-purple-400 bg-purple-50 hover:border-purple-500 hover:bg-purple-100"
                  : "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
              }`}
            >
              <Upload className={`w-12 h-12 mx-auto mb-2 ${
                pacienteEncontrado && !loading
                  ? "text-purple-600"
                  : "text-gray-400"
              }`} />
              <p className={`text-sm font-semibold mb-1 ${
                pacienteEncontrado && !loading
                  ? "text-purple-700"
                  : "text-gray-500"
              }`}>
                O arrastra tus archivos aquí
              </p>
              <p className={`text-xs ${
                pacienteEncontrado && !loading
                  ? "text-purple-600"
                  : "text-gray-400"
              }`}>
                JPEG o PNG • Máximo 5MB cada una
              </p>
            </div>
          </div>

          {/* Respuesta del Servidor */}
          {enviado && respuestaServidor && (
            <div className="bg-green-50 border md:border border-green-300 rounded-lg p-1.5 md:p-1">
              <div className="flex gap-1">
                <CheckCircle className="w-4 h-4 md:w-3.5 md:h-3.5 text-green-600 flex-shrink-0 mt-0" />
                <div className="flex-1">
                  <p className="font-bold text-green-800 text-xs md:text-xs leading-tight">✅ OK</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción - Desktop Compacto | Tablet Comprimido */}
          <div className="flex flex-col gap-1 md:gap-0.5 pt-1 md:pt-0 mt-0 md:mt-0 xl:gap-1.5 xl:pt-2 xl:mt-auto">
            <button
              type="submit"
              disabled={archivos.length < MIN_IMAGENES || loading || enviado || !pacienteEncontrado}
              className={`py-2 md:py-1.5 xl:py-2.5 rounded-lg md:rounded font-bold text-sm md:text-xs xl:text-sm flex items-center justify-center gap-1.5 md:gap-0.5 xl:gap-1 transition duration-200 shadow-sm md:shadow-none xl:shadow-md ${
                archivos.length < MIN_IMAGENES || loading || enviado || !pacienteEncontrado
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
              title={archivos.length < MIN_IMAGENES ? `Se requieren al menos ${MIN_IMAGENES} imágenes` : ""}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 md:w-4 md:h-4 xl:w-4 xl:h-4 animate-spin" />
                  <span className="hidden md:inline xl:inline text-xs md:text-xs">Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 md:w-4 md:h-4 xl:w-4 xl:h-4" />
                  <span className="hidden md:inline xl:inline text-xs md:text-xs">
                    {archivos.length >= MIN_IMAGENES ? `Cargar` : `Faltan ${MIN_IMAGENES - archivos.length}`}
                  </span>
                </>
              )}
            </button>

            {(archivos.length > 0 || enviado) && (
              <button
                type="button"
                onClick={resetFormulario}
                disabled={loading}
                className="py-1.5 md:py-1 xl:py-2 border-2 md:border border-red-300 rounded-lg md:rounded font-bold text-xs md:text-xs xl:text-xs text-red-700 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Hidden File Inputs - Mobile/Tablet */}
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
      </form>

      {/* Información de Ayuda - Footer (Solo Desktop - Oculto en Tablet para ahorrar espacio) */}
      <div className="hidden xl:flex bg-cyan-50 border-t border-cyan-200 px-4 py-2 text-xs text-cyan-800 space-y-0.5">
        <div className="flex gap-1.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-cyan-600" />
          <div className="space-y-0">
            <p className="font-bold text-cyan-900 text-[10px]">Información - PADOMI</p>
            <ul className="list-disc list-inside text-[9px] leading-tight space-y-0">
              <li><strong>Min {MIN_IMAGENES}</strong> imágenes requeridas</li>
              <li><strong>Máx {MAX_IMAGENES}</strong> imágenes permitidas</li>
              <li>JPEG y PNG (máx 5MB cada uno)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
