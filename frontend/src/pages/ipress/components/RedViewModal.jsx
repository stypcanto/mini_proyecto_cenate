// ========================================================================
// 👁️ RedViewModal.jsx – Modal de Visualización de Red
// ------------------------------------------------------------------------
// Muestra todos los detalles de una red en modo solo lectura
// ========================================================================

import React from "react";
import { X, Network, MapPin } from "lucide-react";

export default function RedViewModal({ red, onClose }) {
    if (!red) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */ }
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Network className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Detalles de Red</h2>
                                <p className="text-emerald-100 text-sm">Información completa de la red asistencial</p>
                            </div>
                        </div>
                        <button
                            onClick={ onClose }
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Cerrar"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */ }
                <div className="p-6 space-y-6">
                    {/* Información Básica */ }
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Network className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-lg font-semibold text-slate-900">Información Básica</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">
                                    Código de Red
                                </label>
                                <p className="text-slate-900 font-mono text-lg font-semibold">
                                    { red.codRed || "No especificado" }
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">
                                    ID Red
                                </label>
                                <p className="text-slate-900 font-mono text-lg font-semibold">
                                    { red.idRed || "No especificado" }
                                </p>
                            </div>

                            <div className="md:col-span-2 bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">
                                    Nombre de la Red
                                </label>
                                <p className="text-slate-900 font-medium text-base">
                                    { red.descRed || "No especificado" }
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Macrorregión */ }
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-slate-900">Macrorregión</h3>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide block mb-1">
                                Región Asignada
                            </label>
                            <p className="text-blue-900 font-medium text-lg">
                                { red.macroregion?.descMacro || "No especificada" }
                            </p>
                            { red.macroregion?.idMacro && (
                                <p className="text-xs text-blue-600 mt-2">
                                    ID Macrorregión: <span className="font-mono font-semibold">{ red.macroregion.idMacro }</span>
                                </p>
                            ) }
                        </div>
                    </section>

                    {/* Estado */ }
                    { red.activa !== undefined && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className={ `w-3 h-3 rounded-full ${red.activa ? 'bg-green-500' : 'bg-red-500'}` } />
                                <h3 className="text-lg font-semibold text-slate-900">Estado</h3>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                <span className={ `inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${red.activa
                                        ? 'bg-green-100 text-green-800 border border-green-300'
                                        : 'bg-red-100 text-red-800 border border-red-300'
                                    }` }>
                                    { red.activa ? 'Activa' : 'Inactiva' }
                                </span>
                            </div>
                        </section>
                    ) }
                </div>

                {/* Footer */ }
                <div className="bg-slate-50 px-6 py-4 rounded-b-2xl border-t border-slate-200">
                    <div className="flex justify-end">
                        <button
                            onClick={ onClose }
                            className="px-6 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700
                         transition-colors font-medium shadow-md"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
