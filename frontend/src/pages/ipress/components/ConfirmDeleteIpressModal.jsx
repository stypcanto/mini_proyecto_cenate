// Modal de Confirmación de Eliminación de IPRESS
import React from 'react';
import { AlertTriangle, Trash2, Building2, AlertCircle, Info } from 'lucide-react';

const ConfirmDeleteIpressModal = ({ ipress, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header Rojo con Advertencia */}
        <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-white">
            <h2 className="text-xl font-bold">Confirmar Eliminación</h2>
            <p className="text-sm text-red-100">Esta acción no se puede deshacer</p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">

          {/* Información de la IPRESS */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{ipress?.descIpress || 'IPRESS sin nombre'}</h3>
              <p className="text-sm text-gray-600">Código: {ipress?.codIpress || 'N/A'}</p>
              <div className="flex gap-4 mt-1 text-xs text-gray-500">
                <span>Red: <strong>{ipress?.red?.descRed || ipress?.nombreRed || 'N/A'}</strong></span>
                <span>Estado: <strong>{ipress?.statIpress === 'A' ? 'Activo' : 'Inactivo'}</strong></span>
              </div>
            </div>
          </div>

          {/* Advertencia Crítica */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 mb-1">Advertencia Crítica</h4>
              <p className="text-sm text-amber-800">
                Estás a punto de eliminar permanentemente esta IPRESS del sistema.
              </p>
            </div>
          </div>

          {/* Lista de lo que se eliminará */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="font-bold text-red-900">IMPORTANTE - Datos que se eliminarán:</h4>
            </div>
            <ul className="space-y-2 text-sm text-red-800">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Toda la información de la institución</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Ubicación geográfica y coordenadas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Modalidad de atención configurada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Referencias y asociaciones con usuarios</span>
              </li>
              <li className="flex items-start gap-2 font-bold text-red-900">
                <span className="text-red-600 mt-0.5">•</span>
                <span>Esta acción es IRREVERSIBLE</span>
              </li>
            </ul>
          </div>

          {/* Sugerencia */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">💡 Sugerencia:</p>
              <p className="text-blue-800">
                Si solo deseas desactivar temporalmente esta IPRESS, considera cambiar su estado a "Inactivo" en lugar de eliminarla.
                Esto preservará los datos y permitirá reactivarla en el futuro.
              </p>
            </div>
          </div>

        </div>

        {/* Botones */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-xl transition-all font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium shadow-lg flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Sí, Eliminar IPRESS
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteIpressModal;
