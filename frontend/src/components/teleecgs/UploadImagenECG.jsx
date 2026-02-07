import React, { useState, useRef, useEffect } from "react";
import {
  Upload, X, CheckCircle, AlertCircle, FileImage,
  Loader, Heart, User, Trash2, Plus, Camera, WifiOff, Wifi, ChevronDown, ChevronUp
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

export default function UploadImagenEKG({ onSuccess, onUploadSuccess, isWorkspace }) {
  // No longer using useNavigate for redirect (handled by parent in workspace mode)

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
    telefono: "",
    ipress: "",
    edad: "",
  });
  const [searchingPaciente, setSearchingPaciente] = useState(false);
  const [pacienteEncontrado, setPacienteEncontrado] = useState(false);
  const [esUrgente, setEsUrgente] = useState(false);

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
  const [expandPatientInfo, setExpandPatientInfo] = useState(true); // Toggle sección paciente

  // Progress Bar States
  const [uploadProgress, setUploadProgress] = useState(0); // 0-100%
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

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
            setDatosCompletos(draft.datosCompletos || { apellidos: "", nombres: "", sexo: "", codigo: "", telefono: "", ipress: "", edad: "" });
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
          setDatosCompletos({ apellidos: "", nombres: "", sexo: "", codigo: "", telefono: "", ipress: "", edad: "" });
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
          telefono: paciente.telefono || paciente.telefonoContacto || "",
          ipress: paciente.ipress || paciente.descIpress || paciente.codIpress || "",
          edad: paciente.edad || paciente.edad_asegurado || paciente.edadAsegurado || "",
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

  // ✅ IMPORTANTE: Función sin side-effects para usar en render
  // Solo valida, sin mostrar toasts (evita "Cannot update component during render")
  const esFormularioValido = () => {
    if (!numDocPaciente.trim()) return false;
    if (!pacienteEncontrado) return false;
    if (archivos.length < MIN_IMAGENES) return false;
    if (archivos.length > MAX_IMAGENES) return false;
    return true;
  };

  // Función con toasts para usar en handleSubmit
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
      setUploadingFiles(true);
      setUploadProgress(0);
      setAseguradoNoExiste(false);

      const formData = new FormData();
      formData.append("numDocPaciente", numDocPaciente);
      formData.append("nombresPaciente", datosCompletos.nombres || "");
      formData.append("apellidosPaciente", datosCompletos.apellidos || "");
      // ✅ Enviar también el PK del asegurado para mejor validación en backend
      if (pkAsegurado) {
        formData.append("pkAsegurado", pkAsegurado);
      }

      // Simular progreso por archivo (10 archivos máx)
      const progressPerFile = 100 / archivos.length;

      for (let i = 0; i < archivos.length; i++) {
        formData.append("archivos", archivos[i]);
        setCurrentFileIndex(i + 1);
        setUploadProgress((i + 1) * progressPerFile);

        // Simulación de delay para mostrar progreso (remover en producción si upload es instantáneo)
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const respuesta = await teleekgService.subirMultiplesImagenes(formData);

      setRespuestaServidor(respuesta);
      setEnviado(true);
      setUploadProgress(100);
      toast.success(`✅ ${archivos.length} EKGs cargados exitosamente`);

      setTimeout(() => {
        resetFormulario();
        setUploadingFiles(false);
        if (onSuccess) onSuccess();

        // ✅ Si estamos en workspace, usar callback. Si no, redirigir a listar
        if (isWorkspace && onUploadSuccess) {
          // Modo workspace: pasar nuevas imágenes al padre para sincronización
          onUploadSuccess(respuesta?.data || []);
        } else {
          // Modo standalone: redirigir a listado
          window.location.href = "/teleekgs/listar";
        }
      }, 2000);

    } catch (error) {
      console.error("Error al cargar EKGs:", error);
      setUploadingFiles(false);

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
    setDatosCompletos({ apellidos: "", nombres: "", sexo: "", codigo: "", telefono: "", ipress: "", edad: "" });
    setEnviado(false);
    setRespuestaServidor(null);
    setPacienteEncontrado(false);
    setCarouselIndex(0);
    setEsUrgente(false); // ✅ Limpiar urgencia
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
    <div className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col h-screen ${
      isWorkspace
        ? 'xl:h-auto xl:w-auto' // Workspace: adaptarse al contenedor parent
        : 'xl:h-auto xl:w-[850px] xl:fixed xl:inset-0 xl:m-auto xl:max-h-[85vh]' // Standalone: modal centrado
    }`}>
      {/* Header Institucional - Más alto */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-5 flex items-center gap-3 relative">
        <div className="bg-white/15 p-2.5 rounded-lg">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Cargar Electrocardiogramas</h2>
          <p className="text-blue-100 text-xs font-medium">CENATE - Centro Nacional de Telemedicina</p>
        </div>
      </div>

      {/* Desktop: 3 Vertical Sections - Profesional y Compacto */}
      <form onSubmit={handleSubmit} className={`hidden xl:flex xl:flex-col flex-1 overflow-y-auto gap-3 p-5 bg-white border-l-4 transition-all duration-200 ${
        esUrgente ? 'border-red-600' : 'border-transparent'
      }`}>
        {/* Alert de Urgencia */}
        {esUrgente && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900">⚠️ Caso marcado como URGENTE</p>
              <p className="text-xs text-red-700">Este EKG será priorizado para evaluación inmediata</p>
            </div>
          </div>
        )}

        {/* Section 1: Patient Information */}
        <div className={`rounded-lg border p-3 transition-all duration-200 ${
          esUrgente
            ? 'bg-red-50 border-red-900/20'
            : 'bg-gray-50 border-blue-900/20'
        }`}>
          {/* Header con toggle */}
          <button
            type="button"
            onClick={() => setExpandPatientInfo(!expandPatientInfo)}
            className={`w-full flex items-center justify-between mb-2 ${
              esUrgente ? 'text-red-900' : 'text-blue-900'
            }`}
            title={expandPatientInfo ? "Ocultar" : "Expandir"}
          >
            <h3 className="text-sm font-bold flex items-center gap-2">
              <User className="w-4 h-4" />
              Información del Paciente
            </h3>
            {expandPatientInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandPatientInfo && (
            <>
              {/* Toggle de Urgencia - Compacto */}
              <div className="mb-2 flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Heart className={`w-4 h-4 flex-shrink-0 ${esUrgente ? 'text-red-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-semibold text-gray-900 text-xs leading-tight">¿Urgente?</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEsUrgente(!esUrgente)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all ${
                    esUrgente ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                  title="Marcar urgente"
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                      esUrgente ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* DNI Input */}
              <div className="mb-1.5">
                <label className="block text-xs font-bold text-gray-700 mb-1">🆔 DNI del Paciente *</label>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{8}"
                    value={numDocPaciente}
                    onChange={(e) => setNumDocPaciente(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                    placeholder="12345678"
                    maxLength="8"
                    disabled={searchingPaciente}
                    className="w-full px-3 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg font-bold text-center text-blue-900 placeholder:text-blue-200 transition-all disabled:bg-gray-100 disabled:opacity-60"
                  />
                  {searchingPaciente && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-blue-600" />}
                  {pacienteEncontrado && !searchingPaciente && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />}
                  {!pacienteEncontrado && numDocPaciente.length === 8 && !searchingPaciente && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />}
                </div>
              </div>

              {/* Patient Confirmation - Compacto */}
              {pacienteEncontrado ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-300">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-bold text-green-900">✅ PACIENTE CONFIRMADO</p>
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-2">
                    {datosCompletos.apellidos && datosCompletos.nombres
                      ? `${datosCompletos.apellidos.toUpperCase()}, ${datosCompletos.nombres.toUpperCase()}`
                      : 'Paciente identificado'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded p-2 border border-green-200">
                      <p className="font-bold text-green-700">DNI</p>
                      <p className="font-bold text-gray-900">{numDocPaciente}</p>
                    </div>
                    <div className="bg-white rounded p-2 border border-green-200">
                      <p className="font-bold text-green-700">Edad</p>
                      <p className="font-bold text-gray-900">{datosCompletos.edad ? `${datosCompletos.edad} años` : '—'}</p>
                    </div>
                    <div className="bg-white rounded p-2 border border-green-200">
                      <p className="font-bold text-green-700">Sexo</p>
                      <p className="font-bold text-gray-900">{datosCompletos.sexo === 'M' ? 'Masculino' : datosCompletos.sexo === 'F' ? 'Femenino' : '—'}</p>
                    </div>
                    {datosCompletos.telefono && <div className="bg-white rounded p-2 border border-green-200">
                      <p className="font-bold text-green-700">Teléfono</p>
                      <p className="font-bold text-gray-900 truncate">{datosCompletos.telefono}</p>
                    </div>}
                  </div>
                </div>
              ) : numDocPaciente.length > 0 && numDocPaciente.length < 8 ? (
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-2 text-center">
                  <p className="text-xs font-bold text-blue-900">⏳ Escribe {8 - numDocPaciente.length} dígito(s) más</p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-2 text-center">
                  <p className="text-xs font-bold text-gray-700">👆 Ingresa DNI (8 dígitos)</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Section 2: Image Selection - Compacto */}
        <div className={`rounded-lg border p-3 transition-all ${
          esUrgente ? 'bg-red-50 border-red-900/20' : 'bg-gray-50 border-blue-900/20'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-bold flex items-center gap-1.5 ${
              esUrgente ? 'text-red-900' : 'text-blue-900'
            }`}>
              <FileImage className="w-4 h-4" />
              Imágenes ({archivos.length}/{MAX_IMAGENES})
            </h3>
            <p className="text-xs text-gray-600">{MIN_IMAGENES}-{MAX_IMAGENES} fotos</p>
          </div>

          {/* Select Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!pacienteEncontrado || loading || archivos.length >= MAX_IMAGENES}
            className={`w-full py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-2 transition mb-2 ${
              pacienteEncontrado && !loading && archivos.length < MAX_IMAGENES
                ? "bg-blue-900 hover:bg-blue-800 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
            }`}
          >
            <FileImage className="w-3.5 h-3.5" />
            Seleccionar
          </button>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center border-4 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all min-h-[160px] mb-2 ${
              pacienteEncontrado && !loading && archivos.length < MAX_IMAGENES
                ? dragActive
                  ? "border-blue-600 bg-blue-50 scale-105"
                  : "border-blue-400 bg-blue-50 hover:border-blue-600"
                : "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
            }`}
          >
            <div className={`rounded-full p-3 mb-2 ${dragActive ? 'bg-blue-600 animate-pulse' : 'bg-blue-100'}`}>
              <Upload className={`w-10 h-10 ${
                pacienteEncontrado && !loading ? dragActive ? 'text-white' : 'text-blue-900' : 'text-gray-400'
              }`} />
            </div>
            <p className={`text-sm font-bold ${pacienteEncontrado && !loading ? 'text-blue-900' : 'text-gray-500'}`}>
              {dragActive ? '¡Suelta aquí!' : '📂 Arrastra o haz clic'}
            </p>
            <p className="text-xs text-gray-600 mt-1">JPEG, PNG • máx 5MB • {MIN_IMAGENES}-{MAX_IMAGENES} fotos</p>
          </div>

          {/* Image Grid */}
          {archivos.length > 0 && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`EKG ${index + 1}`}
                      className="w-full h-24 rounded-lg object-cover border-2 border-gray-300 hover:border-blue-500 transition-all"
                    />
                    <div className="absolute top-1 right-1 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-0.5 rounded font-medium">
                      {archivos[index]?.size ? `${(archivos[index].size / 1024).toFixed(0)}KB` : '—'}
                    </div>
                    <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removerArchivo(index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploadingFiles && (
          <div className={`rounded-lg p-3 mb-2 ${esUrgente ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <p className={`text-xs font-bold ${esUrgente ? 'text-red-900' : 'text-blue-900'}`}>
                📤 {currentFileIndex}/{archivos.length} archivos
              </p>
              <p className={`text-xs font-semibold ${esUrgente ? 'text-red-700' : 'text-blue-700'}`}>
                {Math.round(uploadProgress)}%
              </p>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${esUrgente ? 'bg-red-200' : 'bg-blue-200'}`}>
              <div
                className={`h-full transition-all duration-300 ${esUrgente ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          type="submit"
          disabled={!esFormularioValido() || loading || uploadingFiles}
          className={`w-full py-4 px-4 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 ${
            esFormularioValido() && !loading && !uploadingFiles
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading || uploadingFiles ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Cargando...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Cargar {archivos.length} EKGs</span>
            </>
          )}
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
      </form>

      {/* Mobile/Tablet: Existing Layout */}
      <form onSubmit={handleSubmit} className="xl:hidden flex flex-col flex-1 overflow-hidden gap-6 p-6 md:grid md:grid-cols-3 md:gap-3 md:p-3 md:overflow-hidden">
        {/* LEFT PANEL - Paciente (Tablet: 66% | Desktop: ancho completo) - SPLIT VIEW v1.52.0 */}
        <div className="md:flex md:col-span-2 md:flex-col w-full gap-2 border-r-2 border-gray-300 md:pr-3 overflow-y-auto">
          {/* Sección de Búsqueda de Paciente - v1.51.0 Desktop Compacto | Tablet Ultracompacto */}
          <div className="bg-blue-50 border-2 md:border border-blue-200 rounded-lg p-3 md:p-2">
            <h3 className="text-sm md:text-xs font-bold text-blue-900 mb-2 md:mb-1 flex items-center gap-1.5">
              <User className="w-4 h-4 md:w-3.5 md:h-3.5" />
              <span>Paciente</span>
            </h3>

            {/* DNI Input con type="tel" para teclado numérico */}
            <div>
              <label className="block text-xs md:text-xs font-bold text-gray-800 mb-1 md:mb-0.5 uppercase tracking-wide">DNI</label>
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
                  className="w-full px-3 py-2.5 md:py-1 border-2 border-blue-400 rounded-lg md:rounded focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg md:text-xs font-bold md:font-semibold"
                />
                <div className="absolute right-2 top-2.5 md:top-1.5">
                  {searchingPaciente && (
                    <Loader className="w-4 h-4 md:w-3.5 md:h-3.5 animate-spin text-blue-600" />
                  )}
                  {pacienteEncontrado && !searchingPaciente && (
                    <CheckCircle className="w-4 h-4 md:w-3.5 md:h-3.5 text-green-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Datos Auto-cargados - Confirmación Expandida (Tablet/Mobile) v1.52.0 */}
            {pacienteEncontrado ? (
              <div className="mt-2 md:mt-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg p-3 md:p-3 border md:border border-green-600 shadow-md space-y-2">
                <p className="text-xs md:text-xs font-bold text-green-900 leading-tight">✅ CONFIRMADO</p>

                {/* Nombre completo */}
                <div className="bg-white/20 rounded-lg p-2 space-y-0.5">
                  <p className="text-xs font-bold text-green-700">Paciente</p>
                  <p className="text-sm md:text-sm font-bold text-white leading-tight">
                    {datosCompletos.apellidos} {datosCompletos.nombres}
                  </p>
                </div>

                {/* DNI + Edad */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/20 rounded-lg p-2">
                    <p className="text-xs font-bold text-green-700">DNI</p>
                    <p className="text-xs md:text-sm font-bold text-white">{numDocPaciente}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">
                    <p className="text-xs font-bold text-green-700">Edad</p>
                    <p className="text-xs md:text-sm font-bold text-white">{datosCompletos.edad || "-"}</p>
                  </div>
                </div>

                {/* Teléfono */}
                {datosCompletos.telefono && (
                  <div className="bg-white/20 rounded-lg p-2">
                    <p className="text-xs font-bold text-green-700">Teléfono</p>
                    <p className="text-xs md:text-sm font-bold text-white">{datosCompletos.telefono}</p>
                  </div>
                )}

                {/* IPRESS */}
                {datosCompletos.ipress && (
                  <div className="bg-white/20 rounded-lg p-2">
                    <p className="text-xs font-bold text-green-700">IPRESS</p>
                    <p className="text-xs md:text-sm font-bold text-white line-clamp-2">{datosCompletos.ipress}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2 md:mt-2 bg-gray-200 rounded-lg p-3 md:p-3 text-xs text-gray-700 text-center font-medium leading-tight">
                👆 Ingresa DNI (8 dígitos)
              </div>
            )}
          </div>

          {/* Contador y Progreso (Oculto en Desktop) - COMPRIMIDO TABLET */}
          {archivos.length > 0 && (
            <div className="bg-indigo-50 border md:border border-indigo-300 rounded-lg p-1.5 md:p-1">
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

        {/* RIGHT PANEL - Cámara (Tablet: 34% | Desktop: ancho completo) - SPLIT VIEW v1.52.0 */}
        <div className="flex-1 md:col-span-1 w-full flex flex-col gap-2 overflow-hidden md:flex-col md:justify-between">

          {/* CAMERA BUTTON - Optimizado Tablet (menos altura) - SPLIT VIEW v1.52.1 */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={!pacienteEncontrado || loading}
            className={`w-full py-6 md:py-8 rounded-2xl md:rounded-2xl font-black text-2xl md:text-3xl flex flex-col items-center justify-center gap-2 md:gap-2 transition transform active:scale-95 shadow-xl md:shadow-2xl ${
              pacienteEncontrado && !loading
                ? "bg-gradient-to-br from-cyan-500 via-teal-500 to-teal-600 hover:from-cyan-600 hover:via-teal-600 hover:to-teal-700 text-white hover:shadow-2xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
            }`}
            aria-label="Tomar foto del EKG"
          >
            <Camera className={`${pacienteEncontrado ? 'w-14 h-14' : 'w-10 h-10'} md:w-16 md:h-16`} strokeWidth={1.5} />
            <div className="flex flex-col items-center gap-0.5 md:gap-1">
              <span className="md:text-2xl">TOMAR FOTO</span>
              <span className={`font-bold text-white/95 md:text-xl`}>
                {archivos.length}/{MAX_IMAGENES}
              </span>
            </div>
          </button>

          {/* Carrete Horizontal Inferior - Split View v1.52.0 */}
          {archivos.length > 0 && (
            <div className="bg-white border-t-2 md:border-t border-gray-300 pt-2 md:pt-2 mt-auto md:mt-0">
              <p className="text-xs font-bold text-gray-700 mb-1.5 px-1">📸 Fotos ({archivos.length}/{MAX_IMAGENES})</p>

              {/* Carousel Horizontal Compacto */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 px-1 scroll-smooth">
                {previews.map((preview, index) => (
                  <div key={index} className="relative flex-shrink-0 group">
                    <img
                      src={preview}
                      alt={`Captura ${index + 1}`}
                      onClick={() => setCarouselIndex(index)}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover cursor-pointer transition-all border-2 ${
                        carouselIndex === index
                          ? "border-blue-600 ring-2 ring-blue-400 shadow-lg"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    />
                    <div className="absolute bottom-0.5 left-0.5 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-sm shadow-md">
                      {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removerArchivo(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      title="Eliminar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Seleccionar Imágenes del EKG - Desktop: Con título | Tablet/Mobile: Solo botón */}
          <div>
            {/* Botón Seleccionar - Todos los dispositivos */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!pacienteEncontrado || loading || archivos.length >= MAX_IMAGENES}
              className={`w-full py-1.5 md:py-1.5 rounded-lg md:rounded-lg font-bold text-base md:text-xs flex items-center justify-center gap-1 md:gap-0.5 transition mb-0 md:mb-0 ${
                pacienteEncontrado && !loading && archivos.length < MAX_IMAGENES
                  ? "bg-gray-400 hover:bg-gray-500 text-gray-800 shadow-sm md:shadow-none"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed opacity-50"
              }`}
              aria-label="Buscar imágenes en galería"
            >
              <FileImage className="w-4 h-4 md:w-3.5 md:h-3.5" />
              <span className="md:inline text-xs">Sel</span>
            </button>
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
          <div className="flex flex-col gap-1 md:gap-0.5 pt-1 md:pt-0 mt-0 md:mt-0">
            <button
              type="submit"
              disabled={archivos.length < MIN_IMAGENES || loading || enviado || !pacienteEncontrado}
              className={`py-2 md:py-1.5 rounded-lg md:rounded font-bold text-sm md:text-xs flex items-center justify-center gap-1.5 md:gap-0.5 transition duration-200 shadow-sm md:shadow-none ${
                archivos.length < MIN_IMAGENES || loading || enviado || !pacienteEncontrado
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
              title={archivos.length < MIN_IMAGENES ? `Se requieren al menos ${MIN_IMAGENES} imágenes` : ""}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 md:w-4 md:h-4 animate-spin" />
                  <span className="hidden md:inline text-xs md:text-xs">Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="hidden md:inline text-xs md:text-xs">
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
                className="py-1.5 md:py-1 border-2 md:border border-red-300 rounded-lg md:rounded font-bold text-xs md:text-xs text-red-700 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Limpiar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Información de Ayuda - Footer Desktop Only */}
      <div className="hidden xl:flex bg-blue-50 border-t border-blue-200 px-6 py-3 text-xs text-blue-800">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
          <div className="space-y-0.5">
            <p className="font-bold text-blue-900 text-xs">Información - PADOMI</p>
            <ul className="list-disc list-inside text-xs leading-tight space-y-0.5">
              <li><strong>Mínimo {MIN_IMAGENES}</strong> imágenes requeridas</li>
              <li><strong>Máximo {MAX_IMAGENES}</strong> imágenes permitidas</li>
              <li>JPEG y PNG (máximo 5MB cada uno)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
