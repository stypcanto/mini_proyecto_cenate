// ========================================================================
// 📤 UploadImagenECG.jsx – Componente para Cargar ECGs
// ✅ VERSIÓN 1.0.0 - CENATE 2026
// ========================================================================

import React, { useState, useRef } from "react";
import {
  Upload, X, CheckCircle, AlertCircle, FileImage,
  Loader, Eye, Download, Plus
} from "lucide-react";
import toast from "react-hot-toast";
import teleekgService from "../../services/teleekgService";
import CrearAseguradoForm from "./CrearAseguradoForm";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export default function UploadImagenECG({ onSuccess }) {
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
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

  const handleArchivoSeleccionado = (e) => {
    const file = e.target.files?.[0];
    if (file && validarArchivo(file)) {
      setArchivo(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
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
    const file = e.dataTransfer.files?.[0];
    if (file && validarArchivo(file)) {
      setArchivo(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
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

    if (!archivo) {
      toast.error("Debes seleccionar una imagen");
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
      formData.append("nombresPaciente", nombresPaciente || "");
      formData.append("apellidosPaciente", apellidosPaciente || "");
      formData.append("archivo", archivo);

      const respuesta = await teleekgService.subirImagenECG(formData);

      setRespuestaServidor(respuesta);
      setEnviado(true);
      toast.success("✅ ECG cargado exitosamente");

      // Reset form
      setTimeout(() => {
        resetFormulario();
        if (onSuccess) onSuccess();
      }, 2000);

    } catch (error) {
      console.error("Error al cargar ECG:", error);

      // Verificar si es error de asegurado no existe
      if (error.response?.status === 404 || error.message?.includes("asegurado")) {
        setAseguradoNoExiste(true);
        toast.error("El asegurado no existe. Por favor créalo primero.");
        setMostrarCrearAsegurado(true);
      } else {
        toast.error(error.response?.data?.message || "Error al cargar el ECG");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetFormulario = () => {
    setArchivo(null);
    setPreview(null);
    setNumDocPaciente("");
    setNombresPaciente("");
    setApellidosPaciente("");
    setEnviado(false);
    setRespuestaServidor(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

          {/* Selector de Archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona la Imagen del ECG *
            </label>

            {!archivo ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">
                  Arrastra tu imagen aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500">JPEG o PNG | Máximo 5MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                {preview && (
                  <div className="relative w-full max-h-96 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setArchivo(null);
                        setPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                      disabled={enviado || loading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{archivo.name}</p>
                    <p className="text-sm text-gray-600">
                      {(archivo.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-blue-600 hover:text-blue-700 font-medium py-2"
                  disabled={enviado || loading}
                >
                  Cambiar archivo
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleArchivoSeleccionado}
              className="hidden"
              disabled={enviado || loading}
            />
          </div>

          {/* Respuesta del Servidor */}
          {enviado && respuestaServidor && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">¡ECG Cargado Exitosamente!</p>
                  <p className="text-sm text-green-700 mt-1">
                    ID: {respuestaServidor.idImagen}
                  </p>
                  <p className="text-sm text-green-700">
                    Estado: {respuestaServidor.estado}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!archivo || loading || enviado}
              className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                loading || !archivo
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Cargar ECG
                </>
              )}
            </button>
            {(archivo || enviado) && (
              <button
                type="button"
                onClick={resetFormulario}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
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
          Información Importante
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• Las imágenes se retienen por 30 días automáticamente</li>
          <li>• El DNI debe tener exactamente 8 dígitos</li>
          <li>• Se te notificará por correo cuando el ECG sea procesado</li>
          <li>• Solo se aceptan archivos JPEG y PNG</li>
        </ul>
      </div>
    </div>
  );
}
