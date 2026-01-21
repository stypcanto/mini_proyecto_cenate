import React, { useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

/**
 * 🏥 Modal para Evaluación de ECGs
 * v3.0.0 - Sistema de dataset para ML training
 *
 * Médicos de CENATE evalúan cada ECG como NORMAL o ANORMAL
 * + descripción de POR QUÉ (dataset supervisado)
 *
 * Props:
 * - isOpen: boolean - Mostrar/ocultar modal
 * - ecg: object - Datos del ECG a evaluar
 * - onClose: function - Callback al cerrar
 * - onConfirm: function - Callback al guardar evaluación
 * - loading: boolean - Estado de carga
 */
export default function ModalEvaluacionECG({
  isOpen,
  ecg,
  onClose,
  onConfirm,
  loading,
}) {
  const [evaluacion, setEvaluacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [descargaError, setDescargaError] = useState(null);

  const handleConfirmar = async () => {
    // 1. Validar que haya seleccionado evaluación
    if (!evaluacion) {
      toast.error("Debes seleccionar NORMAL o ANORMAL");
      return;
    }

    // 2. Validar descripción
    if (!descripcion.trim()) {
      toast.error("Debes escribir una descripción");
      return;
    }

    if (descripcion.trim().length < 10) {
      toast.error("Descripción mínimo 10 caracteres");
      return;
    }

    if (descripcion.length > 1000) {
      toast.error("Descripción máximo 1000 caracteres");
      return;
    }

    // 3. Llamar callback
    await onConfirm(evaluacion, descripcion.trim());

    // 4. Limpiar formulario
    setEvaluacion("");
    setDescripcion("");
    setDescargaError(null);
  };

  const handleCerrar = () => {
    setEvaluacion("");
    setDescripcion("");
    setDescargaError(null);
    onClose();
  };

  if (!isOpen || !ecg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Evaluar Electrocardiograma</h2>
          </div>
          <button
            onClick={handleCerrar}
            className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información del ECG */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-3">Información del ECG</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Paciente:</p>
                <p className="font-semibold">{ecg.nombresPaciente} {ecg.apellidosPaciente}</p>
              </div>
              <div>
                <p className="text-gray-600">DNI:</p>
                <p className="font-semibold">{ecg.numDocPaciente}</p>
              </div>
              <div>
                <p className="text-gray-600">IPRESS:</p>
                <p className="font-semibold">{ecg.nombreIpress}</p>
              </div>
              <div>
                <p className="text-gray-600">Fecha de Envío:</p>
                <p className="font-semibold">{ecg.fechaEnvioFormato}</p>
              </div>
            </div>
          </div>

          {/* Selección de Evaluación */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">
              ¿Cómo evalúas este ECG? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Opción NORMAL */}
              <button
                onClick={() => setEvaluacion("NORMAL")}
                className={`p-4 rounded-lg border-2 transition font-semibold flex items-center gap-2 justify-center ${
                  evaluacion === "NORMAL"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-green-300"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                NORMAL
              </button>

              {/* Opción ANORMAL */}
              <button
                onClick={() => setEvaluacion("ANORMAL")}
                className={`p-4 rounded-lg border-2 transition font-semibold flex items-center gap-2 justify-center ${
                  evaluacion === "ANORMAL"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-red-300"
                }`}
              >
                <AlertCircle className="w-5 h-5" />
                ANORMAL
              </button>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Descripción - ¿Por qué? (Mínimo 10, Máximo 1000 caracteres) *
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Explica qué hallazgos encontraste. Ejemplos:
              <br />
              • NORMAL: "Ritmo sinusal regular, frecuencia 70 bpm, intervalo QT normal, sin arritmias"
              <br />
              • ANORMAL: "Taquicardia sinusal (110 bpm), cambios isquémicos en derivaciones V1-V3"
            </p>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Escribe aquí tu evaluación detallada..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="5"
            />
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-600">
                {descripcion.length}/1000 caracteres
              </p>
              {descripcion.trim().length < 10 && descripcion.length > 0 && (
                <p className="text-xs text-red-600">
                  Mínimo 10 caracteres requeridos
                </p>
              )}
            </div>
          </div>

          {/* Error si existe */}
          {descargaError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{descargaError}</p>
            </div>
          )}
        </div>

        {/* Footer - Botones */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={handleCerrar}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-gray-700 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={loading || !evaluacion || !descripcion.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Guardar Evaluación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
