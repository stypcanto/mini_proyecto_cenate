// ========================================================================
// 🗑️ ConfirmDeleteRedModal.jsx – Modal de Confirmación de Eliminación
// ------------------------------------------------------------------------
// Modal para confirmar la eliminación de una red asistencial
// ========================================================================

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDeleteRedModal = ({ red, onConfirm, onCancel }) => {
    if (!red) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */ }
                <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-xl font-bold">Eliminar Red</h2>
                            <p className="text-sm text-red-100">Esta acción no se puede deshacer</p>
                        </div>
                    </div>
                    <button
                        onClick={ onCancel }
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */ }
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-slate-700 mb-3">
                            ¿Estás seguro de que deseas eliminar la siguiente red asistencial?
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-red-300">
                            <p className="text-sm text-slate-600 mb-1">Código:</p>
                            <p className="font-mono font-semibold text-slate-900">{ red.codRed }</p>
                            <p className="text-sm text-slate-600 mb-1 mt-2">Nombre:</p>
                            <p className="font-semibold text-slate-900">{ red.descRed }</p>
                            <p className="text-sm text-slate-600 mb-1 mt-2">Macrorregión:</p>
                            <p className="font-semibold text-slate-900">
                                { red.macroregion?.descMacro || 'No especificada' }
                            </p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            <strong>⚠️ Advertencia:</strong> Esta acción eliminará permanentemente la red y podría afectar a las IPRESS asociadas.
                        </p>
                    </div>
                </div>

                {/* Footer */ }
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        onClick={ onCancel }
                        className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 rounded-xl transition-all font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={ onConfirm }
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium shadow-lg"
                    >
                        Eliminar Red
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteRedModal;
