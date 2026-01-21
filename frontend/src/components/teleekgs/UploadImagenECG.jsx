// ========================================================================
// 📤 UploadImagenECG.jsx – Componente para Cargar ECGs
// ✅ VERSIÓN 1.0.0 - CENATE 2026
// ========================================================================

import React, { useState, useRef } from "react";
import {
  Upload, X, CheckCircle, AlertCircle, FileImage,
  Loader, Eye, Download, Plus, Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import teleekgService from "../../services/teleekgService";
import CrearAseguradoForm from "./CrearAseguradoForm";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MIN_IMAGENES = 4;  // Mínimo de imágenes (PADOMI requirement)
const MAX_IMAGENES = 10; // Máximo de imágenes (PADOMI requirement)

export default function UploadImagenECG({ onSuccess }) {
  const [archivos, setArchivos] = useState([]); // Array de archivos
  const [previews, setPreviews] = useState([]); // Array de previews
  const [numDocPaciente, setNumDocPaciente] = useState("");
  const [nombresPaciente, setNombresPaciente] = useState("");
  const [apellidosPaciente, setApellidosPaciente] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [respuestaServidor, setRespuestaServidor] = useState(null);
  const [mostrarCrearAsegurado, setMostrarCrearAsegurado] = useState(false);
  const [aseguradoNoExiste, setAseguradoNoExiste] = useState(false);
  const fileInputRef = useRef(null);

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
      toast.error(`El archivo no debe superar 5MB (Tu archivo: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return false;
    }

    return true;
  };

  const agregarArchivos = (nuevosArchivos) => {
    const archivosValidos = [];
    const nuevosPreviews = [];

    for (let file of nuevosArchivos) {
      // Verificar que no esté duplicado
      if (archivos.some(a => a.name === file.name && a.size === file.size)) {
        toast.error(`"${file.name}" ya fue seleccionado`);
        continue;
      }

      if (validarArchivo(file)) {
        if (archivos.length + archivosValidos.length >= MAX_IMAGENES) {
          toast.error(`Máximo ${MAX_IMAGENES} imágenes permitidas`);
          break;
        }

        archivosValidos.push(file);

        // Crear preview
        const reader = new FileReader();
        reader.onload = (event) => {
          nuevosPreviews.push(event.target?.result);
          if (nuevosPreviews.length === archivosValidos.length) {
            setArchivos([...archivos, ...archivosValidos]);
            setPreviews([...previews, ...nuevosPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleArchivoSeleccionado = (e) => {
    const files = Array.from(e.target.files || []);
    agregarArchivos(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
    const files = Array.from(e.dataTransfer.files || []);
    agregarArchivos(files);
  };

  const validarFormulario = () => {
    if (!numDocPaciente.trim()) {
      toast.error("El DNI es requerido");
      return false;
    }

    if (numDocPaciente.length !== 8) {
      toast.error("El DNI debe tener exactamente 8 dígitos");
      return false;
    }

    if (archivos.length < MIN_IMAGENES) {
      toast.error(`Debe seleccionar al menos ${MIN_IMAGENES} imágenes (PADOMI requirement)`);
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

      // Crear FormData con múltiples archivos
      const formData = new FormData();
      formData.append("numDocPaciente", numDocPaciente);
      formData.append("nombresPaciente", nombresPaciente || "");
      formData.append("apellidosPaciente", apellidosPaciente || "");

      // Agregar todos los archivos
      archivos.forEach((archivo, index) => {
        formData.append(`archivos`, archivo);
      });

      // Usar nuevo método para múltiples imágenes
      const respuesta = await teleekgService.subirMultiplesImagenes(formData);

      setRespuestaServidor(respuesta);
      setEnviado(true);
      toast.success(`✅ ${archivos.length} ECGs cargados exitosamente`);

      // Reset form
      setTimeout(() => {
        resetFormulario();
        if (onSuccess) onSuccess();
      }, 2000);

    } catch (error) {
      console.error("Error al cargar ECGs:", error);

      // Verificar si es error de asegurado no existe
      if (error.response?.status === 404 || error.message?.includes("asegurado")) {
        setAseguradoNoExiste(true);
        toast.error("El asegurado no existe. Por favor créalo primero.");
        setMostrarCrearAsegurado(true);
      } else {
        toast.error(error.response?.data?.message || "Error al cargar los ECGs");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetFormulario = () => {
    setArchivos([]);
    setPreviews([]);
    setNumDocPaciente("");
    setNombresPaciente("");
    setApellidosPaciente("");
    setEnviado(false);
    setRespuestaServidor(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removerArchivo = (index) => {
    const nuevosArchivos = archivos.filter((_, i) => i !== index);
    const nuevosPreviews = previews.filter((_, i) => i !== index);
    setArchivos(nuevosArchivos);
    setPreviews(nuevosPreviews);
    toast.success("Imagen removida");
  };

  if (mostrarCrearAsegurado && aseguradoNoExiste) {
    return (
      <CrearAseguradoForm
        numDocPaciente={numDocPaciente}
        nombresPaciente={nombresPaciente}
        apellidosPaciente={apellidosPaciente}
        onCancel={() => setMostrarCrearAsegurado(false)}
        onSuccess={() => {
          setMostrarCrearAsegurado(false);
          setAseguradoNoExiste(false);
          toast.success("Asegurado creado. Intenta cargar el ECG nuevamente.");
        }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Tarjeta Principal */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Upload className="w-6 h-6 text-blue-600" />
          Cargar Electrocardiograma
        </h2>
        <p className="text-gray-600 mb-6">Máximo 5MB | Formatos: JPEG, PNG</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Paciente */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Información del Paciente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DNI *
                </label>
                <input
                  type="text"
                  maxLength="8"
                  placeholder="12345678"
                  value={numDocPaciente}
                  onChange={(e) => setNumDocPaciente(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={enviado || loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombres
                </label>
                <input
                  type="text"
                  placeholder="Juan"
                  value={nombresPaciente}
                  onChange={(e) => setNombresPaciente(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={enviado || loading}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos
              </label>
              <input
                type="text"
                placeholder="Pérez García"
                value={apellidosPaciente}
                onChange={(e) => setApellidosPaciente(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={enviado || loading}
              />
            </div>
          </div>

          {/* Selector de Múltiples Archivos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona las Imágenes del ECG * ({archivos.length}/{MAX_IMAGENES})
              <span className="text-red-600 text-xs ml-2">Mínimo {MIN_IMAGENES} imágenes requeridas</span>
            </label>

            {archivos.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">
                  Arrastra tus imágenes aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500">JPEG o PNG | Máximo 5MB cada una | {MIN_IMAGENES}-{MAX_IMAGENES} imágenes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Grilla de previews */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removerArchivo(index)}
                          className="opacity-0 group-hover:opacity-100 transition bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                          disabled={enviado || loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute top-1 right-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {index + 1}
                      </div>
                    </div>
                  ))}

                  {/* Botón agregar más (si no alcanzó máximo) */}
                  {archivos.length < MAX_IMAGENES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 aspect-square flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition"
                      disabled={enviado || loading}
                    >
                      <Plus className="w-6 h-6 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Resumen */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">
                    {archivos.length} imagen(es) seleccionada(s)
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
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
              disabled={enviado || loading || archivos.length >= MAX_IMAGENES}
            />
          </div>

          {/* Respuesta del Servidor */}
          {enviado && respuestaServidor && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-green-800">¡{archivos.length} ECGs Cargados Exitosamente!</p>
                  <p className="text-sm text-green-700 mt-2">
                    Todas las imágenes han sido asociadas al paciente DNI: {respuestaServidor.numDocPaciente || numDocPaciente}
                  </p>
                  {respuestaServidor.idImagenes && (
                    <div className="text-xs text-green-600 mt-2 bg-white rounded p-2 max-h-20 overflow-y-auto">
                      IDs: {Array.isArray(respuestaServidor.idImagenes) ? respuestaServidor.idImagenes.join(", ") : respuestaServidor.idImagenes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={archivos.length < MIN_IMAGENES || loading || enviado}
              className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition duration-200 ${
                archivos.length < MIN_IMAGENES || loading || enviado
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
                  Cargar {archivos.length > 0 ? `${archivos.length} ECGs` : "ECGs"}
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
      </div>

      {/* Información de Ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Información Importante - PADOMI
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• <strong>Mínimo {MIN_IMAGENES} imágenes</strong> requeridas por envío</li>
          <li>• <strong>Máximo {MAX_IMAGENES} imágenes</strong> permitidas por envío</li>
          <li>• Las imágenes se retienen por 30 días automáticamente</li>
          <li>• El DNI debe tener exactamente 8 dígitos</li>
          <li>• Todas las imágenes se asociarán al mismo paciente</li>
          <li>• Se te notificará por correo cuando los ECGs sean procesados</li>
          <li>• Solo se aceptan archivos JPEG y PNG (máx 5MB cada uno)</li>
          <li>• Visualiza todas las imágenes en formato carrusel en la sección "Ver"</li>
        </ul>
      </div>
    </div>
  );
}
