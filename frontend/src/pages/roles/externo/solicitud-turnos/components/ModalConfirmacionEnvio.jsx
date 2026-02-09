import React, { useState } from 'react';
import { AlertTriangle, X, Send } from 'lucide-react';

const ModalConfirmacionEnvio = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  resumenSolicitud,
  loading = false
}) => {
  const [observacion, setObservacion] = useState('');
  const maxCaracteres = 500;

  const handleConfirm = () => {
    onConfirm(observacion.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-6 py-4 rounded-t-lg flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">¡Atención!</h2>
              <p className="text-sm opacity-90">Confirmación requerida</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Pregunta de confirmación */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-gray-800 font-medium mb-2">
              ¿Está seguro de que desea enviar el formulario?
            </p>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-semibold">Luego no se podrá modificar</span>
            </div>
          </div>

          {/* Resumen de solicitud */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-purple-800 mb-3">RESUMEN DE SOLICITUD</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Especialidades:</span>
                <span className="font-bold text-gray-800">{resumenSolicitud?.totalEspecialidades || 0}</span>
              </div>
              {resumenSolicitud?.turnosTM > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Turnos Mañana y Tarde:</span>
                  <span className="font-bold text-blue-600">{resumenSolicitud?.turnosTM || 0}</span>
                </div>
              )}
              {resumenSolicitud?.turnosMañana > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Turnos Solo Mañana:</span>
                  <span className="font-bold text-orange-600">{resumenSolicitud?.turnosMañana || 0}</span>
                </div>
              )}
              {resumenSolicitud?.turnosTarde > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Turnos Solo Tarde:</span>
                  <span className="font-bold text-purple-600">{resumenSolicitud?.turnosTarde || 0}</span>
                </div>
              )}
              <div className="border-t border-purple-200 pt-2 mt-3">
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Total Turnos:</span>
                  <span>{resumenSolicitud?.totalTurnos || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observación general */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observación General (Opcional)
            </label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Si requiere agregar una observación general, puede escribirla aquí..."
              className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              maxLength={maxCaracteres}
              disabled={loading}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {observacion.length} / {maxCaracteres} caracteres
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white font-semibold rounded-lg hover:from-[#0854A3] hover:to-[#1d4ed8] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirmar Envío
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacionEnvio;