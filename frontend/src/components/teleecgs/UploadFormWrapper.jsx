import React, { useState } from "react";
import { Upload, Image, FileCheck, AlertCircle, Info } from "lucide-react";
import UploadImagenECG from "./UploadImagenECG";

/**
 * 🎨 Upload Form Wrapper - UI/UX mejorado
 * Encapsula UploadImagenECG con mejor presentación visual
 */
export default function UploadFormWrapper({ onUploadSuccess, isWorkspace, isTablet }) {
  const [expandedInfo, setExpandedInfo] = useState(false);

  return (
    <div className="w-full">
      {/* Header con instrucciones */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              ✅ 3 Pasos para cargar tus EKGs
            </h3>
            <div className="space-y-1 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
                  1
                </span>
                <span>Ingresa el DNI del paciente</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
                  2
                </span>
                <span>Selecciona entre 4 y 10 imágenes ECG (JPEG o PNG)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
                  3
                </span>
                <span>Haz clic en "Cargar EKGs" y listo!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Form Content */}
        <div className={isTablet ? "p-4" : "p-6"}>
          <div className="flex items-center gap-2 mb-6">
            <Upload className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Cargar Electrocardiogramas
            </h2>
          </div>

          {/* Upload Component */}
          <UploadImagenECG
            onUploadSuccess={onUploadSuccess}
            isWorkspace={isWorkspace}
          />
        </div>
      </div>

      {/* Tips/Help Section */}
      <div className="mt-4 bg-amber-50 rounded-lg p-4 border border-amber-200">
        <button
          onClick={() => setExpandedInfo(!expandedInfo)}
          className="w-full flex items-center justify-between text-left hover:bg-amber-100 p-2 rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">
              💡 Consejos útiles
            </span>
          </div>
          <span className="text-xs text-amber-700">
            {expandedInfo ? "▼" : "▶"}
          </span>
        </button>

        {expandedInfo && (
          <div className="mt-3 pl-6 space-y-2 text-sm text-amber-900 border-t border-amber-200 pt-3">
            <div className="flex gap-2">
              <span className="text-amber-600">•</span>
              <span>
                Las imágenes deben estar en formato <strong>JPEG o PNG</strong>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-600">•</span>
              <span>
                Tamaño máximo por imagen: <strong>5 MB</strong>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-600">•</span>
              <span>
                Debes cargar entre <strong>4 y 10 imágenes</strong>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-600">•</span>
              <span>
                Las imágenes se comprimen automáticamente para optimizar
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-600">•</span>
              <span>
                Asegúrate que el DNI exista en el sistema antes de cargar
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
