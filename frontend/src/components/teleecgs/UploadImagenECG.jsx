import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, X, CheckCircle, AlertCircle, FileImage,
  Loader, Heart, User, Trash2, Plus
} from "lucide-react";
import toast from "react-hot-toast";
import teleekgService from "../../services/teleekgService";
import gestionPacientesService from "../../services/gestionPacientesService";
import CrearAseguradoForm from "./CrearAseguradoForm";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MIN_IMAGENES = 4;  // Mínimo de imágenes (PADOMI requirement)
const MAX_IMAGENES = 10; // Máximo de imágenes (PADOMI requirement)

export default function UploadImagenEKG({ onSuccess }) {
  // Router navigation
  const navigate = useNavigate();

  // Archivos
  const [archivos, setArchivos] = useState([]);
  const [previews, setPreviews] = useState([]);

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
  const fileInputRef = useRef(null);

  // Buscar paciente por DNI cuando cambia
  useEffect(() => {
    if (numDocPaciente.length === 8) {
      buscarPacientePorDni();
    } else {
      if (numDocPaciente.length === 0) {
        setDatosCompletos({ apellidos: "", nombres: "", sexo: "", codigo: "" });
        setPacienteEncontrado(false);
      }
    }
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

  const agregarArchivos = (nuevosArchivos) => {
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
        archivosValidos.push(file);
        contador++;

        const reader = new FileReader();
        reader.onload = (event) => {
          nuevosPreviews.push(event.target?.result);
          if (nuevosPreviews.length === archivosValidos.length) {
            setArchivos([...archivos, ...archivosValidos]);
            setPreviews([...previews, ...nuevosPreviews]);
            toast.success(`✅ ${contador} imagen(es) agregada(s)`);
          }
        };
        reader.readAsDataURL(file);
      }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header Profesional */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5 flex items-center gap-3">
        <div className="bg-white/20 p-2.5 rounded-lg">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Cargar Electrocardiograma</h2>
          <p className="text-blue-100 text-xs mt-0.5">Centro Nacional de Telemedicina - EsSalud</p>
        </div>
      </div>

      {/* Contenido */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
        {/* 1️⃣ Sección de Búsqueda de Paciente */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Información del Paciente
          </h3>

          {/* DNI Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              DNI del Paciente *
            </label>
            <div className="relative">
              <input
                type="text"
                value={numDocPaciente}
                onChange={(e) => setNumDocPaciente(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Ingresa 8 dígitos"
                maxLength="8"
                disabled={searchingPaciente}
                className="w-full px-4 py-2.5 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg font-semibold"
              />
              <div className="absolute right-3 top-2.5">
                {searchingPaciente && (
                  <Loader className="w-5 h-5 animate-spin text-blue-600" />
                )}
                {pacienteEncontrado && !searchingPaciente && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>
          </div>

          {/* Datos Auto-cargados */}
          {pacienteEncontrado && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Apellidos</label>
                <div className="bg-white border-2 border-green-300 rounded-lg px-3 py-2">
                  <p className="text-sm font-semibold text-gray-800">{datosCompletos.apellidos}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombres</label>
                <div className="bg-white border-2 border-green-300 rounded-lg px-3 py-2">
                  <p className="text-sm font-semibold text-gray-800">{datosCompletos.nombres}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sexo</label>
                <div className="bg-white border-2 border-green-300 rounded-lg px-3 py-2">
                  <p className="text-sm font-semibold text-gray-800">
                    {datosCompletos.sexo === "M" ? "Masculino" : datosCompletos.sexo === "F" ? "Femenino" : datosCompletos.sexo}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Código Asegurado</label>
                <div className="bg-white border-2 border-green-300 rounded-lg px-3 py-2">
                  <p className="text-xs font-mono text-gray-700">{datosCompletos.codigo}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2️⃣ Sección de Carga de Archivo */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            Selecciona las Imágenes del EKG * ({archivos.length}/{MAX_IMAGENES})
          </h3>
          <p className="text-xs text-indigo-700 mb-3">Mínimo {MIN_IMAGENES} imágenes requeridas</p>

          {archivos.length === 0 ? (
            <div className="space-y-3">
              {/* ✅ Primary CTA: File Picker Button (Mobile-First / Thumb-Zone Optimized) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!pacienteEncontrado}
                className={`w-full h-14 rounded-lg font-semibold text-base flex items-center justify-center gap-3 transition ${
                  pacienteEncontrado
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg active:scale-95"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                aria-label="Seleccionar imágenes de electrocardiograma"
              >
                <FileImage className="w-6 h-6" />
                <span>Seleccionar Imágenes ({MIN_IMAGENES}-{MAX_IMAGENES})</span>
              </button>

              {/* ✅ Secondary: Drag Zone (Desktop/Tablet only - hidden on mobile <768px) */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`hidden md:block border-2 border-dashed rounded-lg p-6 text-center transition ${
                  dragActive
                    ? "border-indigo-600 bg-indigo-100"
                    : "border-indigo-300"
                }`}
              >
                <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <p className="text-sm text-indigo-700">
                  O arrastra tus archivos aquí
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  JPEG o PNG • Máximo 5MB cada una
                </p>
              </div>

              {/* Mobile Hint (<768px) */}
              <p className="md:hidden text-xs text-center text-indigo-700 font-medium">
                📸 JPEG o PNG • Máximo 5MB cada una • {MIN_IMAGENES}-{MAX_IMAGENES} imágenes requeridas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ✅ Grilla de previews - Responsive (1 col móvil, 2-4 cols desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {/* ✅ Always visible delete button on mobile, hover on desktop */}
                    <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/40 transition rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removerArchivo(index)}
                        className="md:opacity-0 md:group-hover:opacity-100 transition bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-lg shadow-lg"
                        disabled={loading}
                        aria-label={`Eliminar imagen ${index + 1}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Image index badge */}
                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">
                      {index + 1}
                    </div>
                  </div>
                ))}

                {/* Botón agregar más */}
                {archivos.length < MAX_IMAGENES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-300 rounded-lg p-4 aspect-square flex items-center justify-center hover:border-indigo-600 hover:bg-indigo-100 transition"
                    disabled={loading}
                  >
                    <Plus className="w-6 h-6 text-indigo-400" />
                  </button>
                )}
              </div>

              {/* Resumen */}
              <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-3">
                <p className="text-sm font-semibold text-indigo-900">
                  {archivos.length} imagen(es) seleccionada(s)
                </p>
                <p className="text-xs text-indigo-700 mt-1">
                  Tamaño total: {(archivos.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)}MB
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleArchivoSeleccionado}
            className="hidden"
            disabled={loading || archivos.length >= MAX_IMAGENES}
          />
        </div>

        {/* Respuesta del Servidor */}
        {enviado && respuestaServidor && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-green-800">¡{archivos.length} EKGs Cargados Exitosamente!</p>
                <p className="text-sm text-green-700 mt-2">
                  Todas las imágenes han sido asociadas al paciente DNI: {numDocPaciente}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={archivos.length < MIN_IMAGENES || loading || enviado || !pacienteEncontrado}
            className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition duration-200 ${
              archivos.length < MIN_IMAGENES || loading || enviado || !pacienteEncontrado
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
            title={archivos.length < MIN_IMAGENES ? `Se requieren al menos ${MIN_IMAGENES} imágenes` : ""}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span className="flex items-center gap-2">
                  Cargando {archivos.length} imágenes...
                  <span className="inline-block">
                    <span className="animate-bounce" style={{animationDelay: "0s"}}>●</span>
                    <span className="animate-bounce" style={{animationDelay: "0.1s"}}>●</span>
                    <span className="animate-bounce" style={{animationDelay: "0.2s"}}>●</span>
                  </span>
                </span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Cargar {archivos.length > 0 ? `${archivos.length} EKGs` : "EKGs"}
              </>
            )}
          </button>
          {(archivos.length > 0 || enviado) && (
            <button
              type="button"
              onClick={resetFormulario}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpiar
            </button>
          )}
        </div>
      </form>

      {/* Información de Ayuda */}
      <div className="bg-blue-50 border-t border-blue-200 p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          Información Importante - PADOMI
        </h4>
        <ul className="text-xs text-blue-800 space-y-1 ml-5">
          <li>• <strong>Mínimo {MIN_IMAGENES} imágenes</strong> requeridas por envío</li>
          <li>• <strong>Máximo {MAX_IMAGENES} imágenes</strong> permitidas por envío</li>
          <li>• Todas las imágenes se asociarán al mismo paciente</li>
          <li>• Solo se aceptan archivos JPEG y PNG (máx 5MB cada uno)</li>
        </ul>
      </div>
    </div>
  );
}
