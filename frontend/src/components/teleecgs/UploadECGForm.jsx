import React, { useState, useRef, useEffect } from "react";
import { Upload, X, AlertCircle, CheckCircle, Loader, Search } from "lucide-react";
import teleeckgService from "../../services/teleecgService";
import gestionPacientesService from "../../services/gestionPacientesService";

/**
 * 📤 Componente para subir ECGs con drag-and-drop
 * Busca automáticamente datos del paciente por DNI
 */
export default function UploadECGForm({ onUpload, onClose }) {
  const [archivo, setArchivo] = useState(null);
  const [numDocPaciente, setNumDocPaciente] = useState("");
  const [nombresPaciente, setNombresPaciente] = useState("");
  const [apellidosPaciente, setApellidosPaciente] = useState("");
  const [loading, setLoading] = useState(false);
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
        setNombresPaciente("");
        setApellidosPaciente("");
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

      if (response.data) {
        const paciente = response.data;
        setNombresPaciente(paciente.nombreAsegurado || paciente.nombres || "");
        setApellidosPaciente(paciente.apellidoAsegurado || paciente.apellidos || "");
        setPacienteEncontrado(true);
      } else {
        setError("No se encontró paciente con este DNI");
        setPacienteEncontrado(false);
        setNombresPaciente("");
        setApellidosPaciente("");
      }
    } catch (err) {
      // No mostrar error si el paciente no existe, solo limpiar los campos
      setNombresPaciente("");
      setApellidosPaciente("");
      setPacienteEncontrado(false);
      console.log("ℹ️ Paciente no encontrado o error en búsqueda:", err.message);
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

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...e.dataTransfer.files];
    if (files.length > 0 && validarArchivo(files[0])) {
      setArchivo(files[0]);
      setError("");
    }
  };

  const handleChange = (e) => {
    const files = [...e.target.files];
    if (files.length > 0 && validarArchivo(files[0])) {
      setArchivo(files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!archivo) {
      setError("Por favor selecciona una imagen");
      return;
    }
    if (!numDocPaciente) {
      setError("El DNI del paciente es requerido");
      return;
    }
    if (!nombresPaciente) {
      setError("Los nombres del paciente son requeridos");
      return;
    }
    if (!apellidosPaciente) {
      setError("Los apellidos del paciente son requeridos");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await teleeckgService.subirImagenECG(
        archivo,
        numDocPaciente,
        nombresPaciente,
        apellidosPaciente
      );

      setSuccess(true);
      setTimeout(() => {
        onUpload(response.data);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Error al subir la imagen");
    } finally {
      setLoading(false);
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
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600" />
            Subir Electrocardiograma
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DNI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DNI del Paciente *
            </label>
            <div className="relative">
              <input
                type="text"
                value={numDocPaciente}
                onChange={(e) => setNumDocPaciente(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Ej: 12345678"
                maxLength="8"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {searchingPaciente && (
                <Loader className="absolute right-3 top-2.5 w-5 h-5 animate-spin text-blue-600" />
              )}
              {pacienteEncontrado && !searchingPaciente && (
                <CheckCircle className="absolute right-3 top-2.5 w-5 h-5 text-green-600" />
              )}
            </div>
          </div>

          {/* Nombres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombres {pacienteEncontrado && <span className="text-xs text-green-600">(Autocargado)</span>}
            </label>
            <input
              type="text"
              value={nombresPaciente}
              onChange={(e) => setNombresPaciente(e.target.value)}
              placeholder="Ej: Juan Carlos"
              readOnly={pacienteEncontrado}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                pacienteEncontrado
                  ? "border-green-300 bg-green-50 cursor-not-allowed"
                  : "border-gray-300 focus:ring-blue-600"
              }`}
            />
          </div>

          {/* Apellidos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellidos {pacienteEncontrado && <span className="text-xs text-green-600">(Autocargado)</span>}
            </label>
            <input
              type="text"
              value={apellidosPaciente}
              onChange={(e) => setApellidosPaciente(e.target.value)}
              placeholder="Ej: García López"
              readOnly={pacienteEncontrado}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                pacienteEncontrado
                  ? "border-green-300 bg-green-50 cursor-not-allowed"
                  : "border-gray-300 focus:ring-blue-600"
              }`}
            />
          </div>

          {/* Drag & Drop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen ECG (JPEG o PNG) *
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 hover:border-blue-600"
              }`}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleChange}
                className="hidden"
              />

              {archivo ? (
                <>
                  <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600 font-medium">{archivo.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(archivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Arrastra tu imagen aquí o haz clic
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG o PNG, máximo 5MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !archivo}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                "Subir ECG"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
