import React, { useState } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

/**
 * 👁️ Modal para visualizar imágenes EKG con zoom y rotación
 * Soporta múltiples imágenes por paciente
 */
export default function VisorEKGModal({ ecg, imagenes = [], onClose, onDescargar }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [indiceActual, setIndiceActual] = useState(0);

  // Si es array, usar imagenes; si es objeto individual, envolver en array
  const todasLasImagenes = Array.isArray(imagenes) && imagenes.length > 0
    ? imagenes
    : (ecg ? [ecg] : []);

  const imagenActual = todasLasImagenes[indiceActual];

  const siguiente = () => {
    setIndiceActual((prev) => (prev + 1) % todasLasImagenes.length);
    setScale(1);
    setRotation(0);
  };

  const anterior = () => {
    setIndiceActual((prev) => (prev - 1 + todasLasImagenes.length) % todasLasImagenes.length);
    setScale(1);
    setRotation(0);
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  // Convertir bytes a URL de imagen
  const imageUrl = imagenActual?.contenidoImagen
    ? `data:${imagenActual.tipoContenido};base64,${imagenActual.contenidoImagen}`
    : null;

  // Detectar si la imagen está cargando
  const estaCargando = imagenActual && !imageUrl;

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              EKG de {imagenActual?.nombresPaciente} {imagenActual?.apellidosPaciente}
            </h2>
            <p className="text-blue-100 text-sm">
              DNI: {imagenActual?.numDocPaciente} | Fecha: {formatearFecha(imagenActual?.fechaEnvio)}
              {todasLasImagenes.length > 1 && ` | ${indiceActual + 1}/${todasLasImagenes.length}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Visor principal */}
        <div className="flex-1 min-h-[400px] overflow-auto flex items-center justify-center bg-gray-100 p-4 relative">
          {estaCargando ? (
            // 🔄 Loader mientras se carga la imagen
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" strokeWidth={1.5} />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">Cargando imagen</p>
                <p className="text-xs text-gray-500">
                  {indiceActual + 1} / {todasLasImagenes.length}
                </p>
              </div>
            </div>
          ) : imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt="EKG"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transition: "transform 0.2s",
                  maxWidth: "90%",
                  maxHeight: "90%",
                  width: "auto",
                  height: "auto",
                }}
                className="object-contain"
              />

              {/* Botones de navegación */}
              {todasLasImagenes.length > 1 && (
                <>
                  <button
                    onClick={anterior}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                    title="Imagen anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={siguiente}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                    title="Siguiente imagen"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-sm">❌ No hay imagen disponible</p>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="bg-gray-100 border-t border-gray-300 p-4 flex items-center justify-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reducir zoom"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>

          <span className="text-sm font-medium text-gray-700 px-3">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          <button
            onClick={handleRotate}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            title="Rotar"
          >
            <RotateCw className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 hover:bg-white rounded-lg transition-colors text-sm font-medium text-gray-700"
            title="Restaurar"
          >
            Restaurar
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          <button
            onClick={onDescargar}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar
          </button>
        </div>

        {/* Información */}
        <div className="bg-white border-t border-gray-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Archivo</p>
            <p className="text-gray-800">{imagenActual?.nombreArchivo}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Tamaño</p>
            <p className="text-gray-800">
              {imagenActual?.tamanioByte ? (imagenActual.tamanioByte / 1024 / 1024).toFixed(2) + " MB" : "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Tipo</p>
            <p className="text-gray-800">{imagenActual?.tipoContenido}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Estado</p>
            {/* v3.0.0: Mostrar estado transformado si está disponible */}
            <p className={`font-semibold ${
              (imagenActual?.estadoTransformado || imagenActual?.estado) === "ATENDIDA" ? "text-green-600" :
              (imagenActual?.estadoTransformado || imagenActual?.estado) === "ENVIADA" || (imagenActual?.estadoTransformado || imagenActual?.estado) === "PENDIENTE" ? "text-yellow-600" :
              (imagenActual?.estadoTransformado || imagenActual?.estado) === "OBSERVADA" ? "text-purple-600" :
              (imagenActual?.estadoTransformado || imagenActual?.estado) === "RECHAZADA" ? "text-red-600" :
              "text-gray-600"
            }`}>
              {imagenActual?.estadoTransformado || imagenActual?.estado}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
