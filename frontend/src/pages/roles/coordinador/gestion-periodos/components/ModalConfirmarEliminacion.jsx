import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function ModalConfirmarEliminacion({ periodo, onClose, onConfirmar, eliminando }) {
  if (!periodo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Confirmar Eliminación</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
            disabled={eliminando}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-semibold mb-2">
              ⚠️ Advertencia: Esta acción no se puede deshacer
            </p>
            <p className="text-sm text-red-700">
              Está a punto de eliminar permanentemente el siguiente período:
            </p>
          </div>

          {/* Información del período */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Período</p>
              <p className="text-base font-bold text-gray-900">{periodo.periodo}</p>
            </div>
            {periodo.descripcion && (
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Descripción</p>
                <p className="text-sm text-gray-900">{periodo.descripcion}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Estado</p>
              <p className="text-sm text-gray-900">{periodo.estado}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            ¿Está seguro de que desea continuar?
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={eliminando}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={eliminando}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {eliminando ? "Eliminando..." : "Sí, Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
