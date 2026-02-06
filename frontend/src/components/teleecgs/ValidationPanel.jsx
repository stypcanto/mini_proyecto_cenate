import React from "react";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";

/**
 * ValidationPanel - Right sticky panel with validation rules and upload button
 * Desktop Only: xl: 1280px+
 */
export default function ValidationPanel({
  fileCount = 0,
  isValid = false,
  errors = [],
  isLoading = false,
  minImages = 4,
  maxImages = 10,
  onSubmit,
  pacienteEncontrado = false
}) {
  const canUpload = fileCount >= minImages && fileCount <= maxImages && pacienteEncontrado && !isLoading;

  const getCounterColor = () => {
    if (fileCount < minImages) return "bg-red-100 text-red-800";
    if (fileCount === maxImages) return "bg-amber-100 text-amber-800";
    return "bg-blue-100 text-blue-800";
  };

  const getCounterMessage = () => {
    if (fileCount === 0) return "Sin archivos";
    if (fileCount < minImages) return `${minImages - fileCount} más requeridas`;
    if (fileCount === maxImages) return "¡Máximo alcanzado!";
    return `${fileCount}/${minImages} mínimo ✓`;
  };

  return (
    <div className="hidden xl:flex w-64 bg-white border-l border-gray-200 flex-col p-4 sticky top-0 h-full overflow-y-auto shadow-lg">
      {/* Title */}
      <h3 className="text-sm font-bold text-gray-900 mb-3">
        Reglas de Validación
      </h3>

      {/* Rules Section */}
      <div className="space-y-2 mb-3 flex-1">
        {/* Min Images Rule */}
        <div className={`p-2 rounded-lg border-2 transition-all ${
          fileCount >= minImages
            ? "border-green-300 bg-green-50"
            : "border-gray-300 bg-gray-50"
        }`}>
          <div className="flex items-center gap-1.5 mb-1">
            {fileCount >= minImages ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-xs font-semibold text-gray-900">Mínimo: {minImages} fotos</span>
          </div>
          <p className="text-[10px] text-gray-600">
            Ya tienes {fileCount} de {minImages} requeridas
          </p>
        </div>

        {/* Max Images Rule */}
        <div className={`p-2 rounded-lg border-2 transition-all ${
          fileCount <= maxImages
            ? "border-green-300 bg-green-50"
            : "border-red-300 bg-red-50"
        }`}>
          <div className="flex items-center gap-1.5 mb-1">
            {fileCount <= maxImages ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span className="text-xs font-semibold text-gray-900">Máximo: {maxImages} fotos</span>
          </div>
          <p className="text-[10px] text-gray-600">
            Has subido {fileCount} de {maxImages} permitidas
          </p>
        </div>

        {/* Formats Rule */}
        <div className="p-2 rounded-lg border-2 border-green-300 bg-green-50">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-gray-900">Formatos</span>
          </div>
          <p className="text-[10px] text-gray-600">
            ✓ JPEG (JPG)<br />
            ✓ PNG
          </p>
        </div>

        {/* File Size Rule */}
        <div className="p-2 rounded-lg border-2 border-green-300 bg-green-50">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-gray-900">Tamaño</span>
          </div>
          <p className="text-[10px] text-gray-600">
            Máximo 5MB cada uno<br />
            Se comprimen a ~1MB
          </p>
        </div>
      </div>

      {/* Smart Counter Badge */}
      <div className="mb-3 p-2 rounded-lg text-center">
        <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mb-1">
          Progreso
        </p>
        <div className={`px-3 py-2 rounded-lg font-bold text-center transition-all ${getCounterColor()}`}>
          <span className="text-xl">{fileCount}</span>
          <span className="text-[10px] block mt-0.5">{getCounterMessage()}</span>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-3 p-2 bg-red-50 border-2 border-red-300 rounded-lg">
          <p className="text-[10px] font-bold text-red-800 mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            Errores de Validación
          </p>
          <ul className="space-y-0.5">
            {errors.map((error, idx) => (
              <li key={idx} className="text-[10px] text-red-700">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Button (Sticky) */}
      <button
        onClick={onSubmit}
        disabled={!canUpload}
        className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
          canUpload
            ? "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 hover:shadow-lg transform hover:scale-105 active:scale-95"
            : "bg-gray-400 cursor-not-allowed opacity-60"
        }`}
        title={!canUpload ? `Requiere mínimo ${minImages} imágenes` : "Cargar todos los EKGs"}
      >
        {isLoading ? (
          <>
            <div className="animate-spin">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-sm">Subiendo...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span className="text-sm">Cargar EKGs</span>
          </>
        )}
      </button>

      {/* Footer Note */}
      <p className="text-[10px] text-gray-500 text-center mt-2">
        Los archivos se procesarán en paralelo
      </p>
    </div>
  );
}
