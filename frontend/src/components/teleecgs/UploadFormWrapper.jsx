import React, { useState } from "react";
import { Upload, Zap, AlertCircle, ChevronDown, ChevronUp, X } from "lucide-react";
import UploadImagenECG from "./UploadImagenECG";

/**
 * 🏥 Upload Form Wrapper - Diseño Profesional Médico
 * Forma minimalista y elegante para carga de electrocardiogramas
 */
export default function UploadFormWrapper({ onUploadSuccess, isWorkspace, isTablet }) {
  const [expandedSteps, setExpandedSteps] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState(false);

  return (
    <div className="w-full space-y-4">
      {/* Quick Steps Banner - Compacto y profesional */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="p-1.5 bg-emerald-500 rounded-lg">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-900">
              3 pasos: DNI → Seleccionar → Cargar
            </p>
            <p className="text-xs text-emerald-700">4-10 imágenes de alta calidad</p>
          </div>
        </div>

        {/* Expandir detalles */}
        <button
          onClick={() => setExpandedSteps(!expandedSteps)}
          className="p-1 hover:bg-emerald-200/50 rounded transition-colors flex-shrink-0"
        >
          {expandedSteps ? (
            <ChevronUp className="w-4 h-4 text-emerald-700" />
          ) : (
            <ChevronDown className="w-4 h-4 text-emerald-700" />
          )}
        </button>
      </div>

      {/* Pasos expandidos */}
      {expandedSteps && (
        <div className="bg-white border border-emerald-100 rounded-lg p-4 space-y-2.5">
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex-shrink-0">1</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Ingresa DNI del paciente</p>
              <p className="text-xs text-gray-600">Exactamente 8 dígitos</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex-shrink-0">2</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Selecciona imágenes ECG</p>
              <p className="text-xs text-gray-600">4-10 imágenes (JPEG, PNG)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex-shrink-0">3</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Confirma y carga</p>
              <p className="text-xs text-gray-600">El sistema procesará automáticamente</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Container - Minimalista */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header compacto */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-600" strokeWidth={2} />
          <h2 className="text-base font-semibold text-gray-900">Cargar Electrocardiogramas</h2>
        </div>

        {/* Form Content */}
        <div className="p-6">
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
