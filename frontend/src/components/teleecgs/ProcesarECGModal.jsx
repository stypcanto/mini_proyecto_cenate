import React, { useState } from "react";
import { X, Send } from "lucide-react";
import toast from "react-hot-toast";

/**
 * ✅ Modal para procesar ECG con observaciones
 * Utilizado por: TeleECGRecibidas para solicitar notas/observaciones antes de aceptar
 */
export default function ProcesarECGModal({ ecg, onConfirm, onCancel }) {
  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!observaciones.trim()) {
      toast("Por favor ingresa al menos una observación", {
        icon: "⚠️",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(observaciones.trim());
    } catch (error) {
      toast.error("Error al procesar ECG");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setObservaciones("");
    onCancel();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Procesar ECG</h2>
            <p className="text-green-100 text-sm">
              {ecg.nombresPaciente} {ecg.apellidosPaciente}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones *
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: Imagen clara y de buena calidad. ECG válido para procesamiento..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
              rows="4"
              maxLength="500"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-2">
              {observaciones.length}/500 caracteres
            </p>
          </div>

          {/* Información del ECG */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div>
              <span className="text-gray-600 font-medium">DNI:</span>
              <span className="text-gray-800 ml-2">{ecg.numDocPaciente}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">IPRESS:</span>
              <span className="text-gray-800 ml-2">{ecg.nombreIpress}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Archivo:</span>
              <span className="text-gray-800 ml-2">{ecg.nombreArchivo}</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Procesar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
