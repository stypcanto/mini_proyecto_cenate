import React from "react";
import { Upload, X, AlertCircle, CheckCircle } from "lucide-react";

/**
 * ImageGridPanel - Main content area with Dropzone + Image Grid
 * Desktop: 4-column grid | Tablet: 2-column | Mobile: Carousel
 */
export default function ImageGridPanel({
  previews = [],
  archivos = [],
  dragActive = false,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  onRemove,
  validationStates = {},
  imageErrors = {},
  pacienteEncontrado = false,
  loading = false
}) {
  const MAX_IMAGENES = 10;
  // ✅ v1.100.3: Reducido MIN_IMAGENES de 4 a 3 por requerimiento del usuario
  const MIN_IMAGENES = 3;

  const getBorderClass = (index) => {
    const state = validationStates[index];
    return {
      valid: "border-blue-500 shadow-lg shadow-blue-200",
      error: "border-red-500 shadow-lg shadow-red-200",
      processing: "border-amber-500 shadow-lg shadow-amber-200"
    }[state] || "border-gray-300";
  };

  const getStateIcon = (index) => {
    const state = validationStates[index];
    if (state === "valid") return <CheckCircle className="w-4 h-4 text-blue-500" />;
    if (state === "error") return <AlertCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="flex-1 flex flex-col gap-3 p-5 overflow-y-auto">
      {/* Title & Instructions */}
      <div className="mb-2">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Selecciona tus Electrocardiogramas
        </h2>
        <p className="text-xs text-gray-600">
          Sube entre {MIN_IMAGENES} y {MAX_IMAGENES} imágenes para procesarlas
        </p>
      </div>

      {/* Dropzone Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onClick}
        className={`border-3 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
          pacienteEncontrado && !loading && archivos.length < MAX_IMAGENES
            ? dragActive
              ? "border-cyan-600 bg-cyan-50 shadow-lg"
              : "border-cyan-400 bg-cyan-50 hover:shadow-md hover:border-cyan-500"
            : "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
        }`}
      >
        <Upload className={`w-12 h-12 mx-auto mb-2 ${
          pacienteEncontrado && !loading
            ? "text-cyan-600"
            : "text-gray-400"
        }`} />
        <h3 className={`text-base font-bold mb-1 ${
          pacienteEncontrado && !loading
            ? "text-cyan-900"
            : "text-gray-500"
        }`}>
          Arrastra tus archivos aquí
        </h3>
        <p className={`text-xs ${
          pacienteEncontrado && !loading
            ? "text-cyan-700"
            : "text-gray-500"
        }`}>
          o haz clic para buscar en tu computadora
        </p>
        <p className={`text-xs mt-2 ${
          pacienteEncontrado && !loading
            ? "text-cyan-600"
            : "text-gray-400"
        }`}>
          JPEG o PNG • Máximo 5MB cada una
        </p>
      </div>

      {/* Image Grid */}
      {archivos.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            Imágenes Cargadas ({archivos.length}/{MAX_IMAGENES})
          </h3>

          <div className="hidden xl:grid grid-cols-4 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                {/* Image Container */}
                <div className={`border-2 ${getBorderClass(index)} rounded-lg overflow-hidden bg-white transition-transform duration-200 hover:scale-105`}>
                  <img
                    src={preview}
                    alt={`EKG ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onRemove?.(index)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                      title="Eliminar imagen"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* State Icon */}
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                    {getStateIcon(index)}
                  </div>
                </div>

                {/* Info Below Image */}
                <div className="mt-1 text-center">
                  <p className="text-[10px] font-semibold text-gray-800 truncate">
                    {archivos[index]?.name || `EKG ${index + 1}`}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {archivos[index]?.size
                      ? `${(archivos[index].size / 1024 / 1024).toFixed(2)}MB`
                      : "~1MB"}
                  </p>

                  {/* Progress Bar */}
                  {validationStates[index] === "processing" && (
                    <div className="mt-1 bg-gray-300 h-0.5 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full animate-pulse"></div>
                    </div>
                  )}

                  {/* Error Message */}
                  {imageErrors[index] && (
                    <p className="text-[10px] text-red-600 font-medium mt-0.5">
                      {imageErrors[index]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tablet Layout (2 columns) */}
          <div className="hidden md:grid xl:hidden grid-cols-2 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className={`border-2 ${getBorderClass(index)} rounded-lg overflow-hidden bg-white`}>
                  <img
                    src={preview}
                    alt={`EKG ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </div>
                <p className="text-xs font-semibold text-gray-800 mt-1 truncate">
                  {archivos[index]?.name || `EKG ${index + 1}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
