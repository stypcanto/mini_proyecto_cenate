import React, { useState, useRef, useEffect } from "react";
import { Upload, X, AlertCircle, CheckCircle, Loader, Heart, FileText, User, Trash2, Send } from "lucide-react";
import teleeckgService from "../../services/teleecgService";
import gestionPacientesService from "../../services/gestionPacientesService";

/**
 * 📤 Formulario Profesional de Envío de ECG
 * - Búsqueda automática de paciente por DNI
 * - Información del paciente auto-cargada (solo lectura)
 * - Interfaz médica y profesional
 */
export default function UploadECGForm({ onUpload, onClose }) {
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
  const [numDocPaciente, setNumDocPaciente] = useState("");
  const [datosCompletos, setDatosCompletos] = useState({
    apellidos: "",
    nombres: "",
    sexo: "",
    codigo: "",
  });
  const [loading, setLoading] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchingPaciente, setSearchingPaciente] = useState(false);
  const [pacienteEncontrado, setPacienteEncontrado] = useState(false);
  const inputRef = useRef(null);

  // Buscar paciente por DNI cuando cambia
  useEffect(() => {
    if (numDocPaciente.length === 8) {
      buscarPacientePorDni();
    } else {
      // Limpiar si borra el DNI
      if (numDocPaciente.length === 0) {
        setDatosCompletos({ apellidos: "", nombres: "", sexo: "", codigo: "" });
        setPacienteEncontrado(false);
        setError("");
      }
    }
  }, [numDocPaciente]);

  const buscarPacientePorDni = async () => {
    try {
      setSearchingPaciente(true);
      setError("");

      const response = await gestionPacientesService.buscarAseguradoPorDni(numDocPaciente);

      if (response && response.numDoc) {
        const paciente = response;

        // El formato es "APELLIDOS NOMBRES" en el campo apellidosNombres
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
        setPacienteEncontrado(true);
        console.log("✅ Paciente encontrado:", {
          nombres,
          apellidos,
          sexo: paciente.sexo,
          codigo: paciente.pkAsegurado || paciente.numDoc
        });
      } else {
        setDatosCompletos({ apellidos: "", nombres: "", sexo: "", codigo: "" });
        setPacienteEncontrado(false);
        setError("⚠️ No se encontraron datos disponibles para este DNI en el sistema");
      }
    } catch (err) {
      setDatosCompletos({ apellidos: "", nombres: "", sexo: "", codigo: "" });
      setPacienteEncontrado(false);
      setError("⚠️ No se encontraron datos disponibles para este DNI en el sistema");
      console.error("❌ Error al buscar paciente:", {
        message: err.message,
        error: err
      });
    } finally {
      setSearchingPaciente(false);
    }
  };

  const validarArchivo = (file) => {
    const tiposValidos = ["image/jpeg", "image/png"];
    const tamañoMax = 5 * 1024 * 1024; // 5MB

    if (!tiposValidos.includes(file.type)) {
      setError("Solo se permiten imágenes JPEG o PNG");
      return false;
    }

    if (file.size > tamañoMax) {
      setError("El archivo no debe superar 5MB");
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const agregarImagen = (file) => {
    if (!validarArchivo(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const nuevaImagen = {
        id: Date.now(),
        archivo: file,
        preview: e.target.result,
        nombre: file.name,
        tamaño: (file.size / 1024 / 1024).toFixed(2) + " MB",
        estado: "Pendiente"
      };
      setImagenesSeleccionadas([...imagenesSeleccionadas, nuevaImagen]);
      setError("");
      console.log("✅ Imagen agregada:", nuevaImagen.nombre);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...e.dataTransfer.files];
    if (files.length > 0) {
      agregarImagen(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = [...e.target.files];
    if (files.length > 0) {
      agregarImagen(files[0]);
    }
  };

  const eliminarImagen = (id) => {
    setImagenesSeleccionadas(imagenesSeleccionadas.filter(img => img.id !== id));
  };

  const enviarImagenIndividual = async (imagen) => {
    if (!pacienteEncontrado) {
      setError("👤 Primero busca un paciente válido");
      return;
    }

    try {
      setLoading({ ...loading, [imagen.id]: true });
      setError("");

      const response = await teleeckgService.subirImagenECG(
        imagen.archivo,
        numDocPaciente,
        datosCompletos.nombres,
        datosCompletos.apellidos
      );

      // Actualizar estado a "Enviada"
      setImagenesSeleccionadas(
        imagenesSeleccionadas.map(img =>
          img.id === imagen.id ? { ...img, estado: "Enviada" } : img
        )
      );

      console.log("✅ Imagen enviada:", imagen.nombre);
    } catch (err) {
      setError(err.response?.data?.error || "❌ Error al subir la imagen");
    } finally {
      setLoading({ ...loading, [imagen.id]: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (imagenesSeleccionadas.length === 0) {
      setError("🖼️ Por favor selecciona al menos una imagen");
      return;
    }
    if (!pacienteEncontrado) {
      setError("👤 Primero busca un paciente válido ingresando su DNI");
      return;
    }

    // Enviar todas las imágenes pendientes
    for (const imagen of imagenesSeleccionadas.filter(img => img.estado === "Pendiente")) {
      await enviarImagenIndividual(imagen);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            ¡Imagen subida exitosamente!
          </h3>
          <p className="text-gray-600 mb-4">
            Tu ECG ha sido registrado y está pendiente de revisión
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Envío de Electrocardiograma</h2>
              <p className="text-blue-100 text-xs mt-0.5">Centro Nacional de Telemedicina - EsSalud</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 1️⃣ Sección de Búsqueda de Paciente */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Datos del Paciente
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
                {/* Apellidos */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Apellidos</label>
                  <div className="bg-white border-2 border-green-300 rounded-lg px-3 py-2">
                    <p className="text-sm font-semibold text-gray-800">{datosCompletos.apellidos}</p>
                  </div>
                </div>

                {/* Nombres */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nombres</label>
                  <div className="bg-white border-2 border-green-300 rounded-lg px-3 py-2">
                    <p className="text-sm font-semibold text-gray-800">{datosCompletos.nombres}</p>
                  </div>
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sexo</label>
                  <div className="bg-white border-2 border-green-300 rounded-lg px-3 py-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {datosCompletos.sexo === "M" ? "Masculino" : datosCompletos.sexo === "F" ? "Femenino" : datosCompletos.sexo}
                    </p>
                  </div>
                </div>

                {/* Código */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Código Asegurado</label>
                  <div className="bg-white border-2 border-green-300 rounded-lg px-3 py-2">
                    <p className="text-xs font-mono text-gray-700">{datosCompletos.codigo}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje si no se encuentra */}
            {!searchingPaciente && !pacienteEncontrado && numDocPaciente && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">⚠️ Ingresa un DNI válido para buscar los datos del paciente</p>
              </div>
            )}
          </div>

          {/* 2️⃣ Sección de Carga de Archivo */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Electrocardiograma (ECG)
            </h3>

            {/* Área de Drag and Drop */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-indigo-600 bg-indigo-100 scale-102"
                  : "border-indigo-300 hover:border-indigo-600"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleChange}
                disabled={!pacienteEncontrado}
                className="hidden"
              />

              <div className="space-y-2">
                <Upload className="w-12 h-12 text-indigo-400 mx-auto" />
                <p className="text-sm font-semibold text-indigo-900">
                  {pacienteEncontrado ? "Carga tu electrocardiograma" : "Busca un paciente primero"}
                </p>
                <p className="text-xs text-indigo-700">
                  Arrastra aquí o haz clic • JPEG o PNG • Máximo 5MB
                </p>
              </div>
            </div>

            {/* Lista de Imágenes Cargadas */}
            {imagenesSeleccionadas.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-indigo-900">Imágenes Cargadas ({imagenesSeleccionadas.length})</p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {imagenesSeleccionadas.map((imagen) => (
                    <div
                      key={imagen.id}
                      className="bg-white border border-indigo-200 rounded-lg p-3 flex items-center gap-3"
                    >
                      {/* Previsualización */}
                      <div className="flex-shrink-0">
                        <img
                          src={imagen.preview}
                          alt="preview"
                          className="w-20 h-20 object-cover rounded border border-indigo-300"
                        />
                      </div>

                      {/* Información */}
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {imagen.nombre}
                        </p>
                        <p className="text-xs text-gray-600">{imagen.tamaño}</p>
                        <div className="mt-1 inline-block">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            imagen.estado === "Pendiente"
                              ? "bg-amber-100 text-amber-800"
                              : imagen.estado === "Enviada"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {imagen.estado}
                          </span>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {imagen.estado === "Pendiente" && (
                          <button
                            type="button"
                            onClick={() => enviarImagenIndividual(imagen)}
                            disabled={loading[imagen.id] || !pacienteEncontrado}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Enviar imagen"
                          >
                            {loading[imagen.id] ? (
                              <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                              <Send className="w-5 h-5" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => eliminarImagen(imagen.id)}
                          disabled={loading[imagen.id]}
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar imagen"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="flex gap-3 bg-red-50 border-l-4 border-red-600 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Error</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!pacienteEncontrado || imagenesSeleccionadas.length === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              <Upload className="w-4 h-4" />
              Enviar Todo ECG ({imagenesSeleccionadas.filter(img => img.estado === "Pendiente").length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
