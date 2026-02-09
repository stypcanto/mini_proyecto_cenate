import React from 'react';
import { X, FileText, Heart, User, Mail } from 'lucide-react';

/**
 * Modal con detalle de un médico específico
 * Muestra información completa y métricas detalladas
 */
export default function ModalDetalleMedico({ medico, onClose, fechaDesde, fechaHasta }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <User size={24} />
                        <div>
                            <h2 className="text-2xl font-bold">{medico.nombreMedico}</h2>
                            <p className="text-blue-100">{medico.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-blue-500 rounded transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-6">
                    {/* Estadísticas Principales */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Estadísticas Principales</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">Total Asignados</p>
                                <p className="text-3xl font-bold text-blue-600">{medico.totalAsignados}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">Atendidos</p>
                                <p className="text-3xl font-bold text-green-600">{medico.totalAtendidos}</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">Pendientes</p>
                                <p className="text-3xl font-bold text-orange-600">{medico.totalPendientes}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tasas y Ratios */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Indicadores de Desempeño</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">Tasa de Completación</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {medico.porcentajeAtencion?.toFixed(1) || '0'}%
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">Tasa de Deserción</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {medico.tasaDesercion?.toFixed(1) || '0'}%
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">Horas Promedio por Atención</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {medico.horasPromedioAtencion?.toFixed(2) || '—'}h
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">Deserciones</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {medico.totalDeserciones}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Métricas Especiales */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Métricas Especiales</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="border-l-4 border-purple-600 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Heart size={18} className="text-purple-600" />
                                    <p className="text-gray-600 text-sm">Pacientes Crónicos</p>
                                </div>
                                <p className="text-2xl font-bold text-purple-600">{medico.totalCronicos}</p>
                            </div>
                            <div className="border-l-4 border-teal-600 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={18} className="text-teal-600" />
                                    <p className="text-gray-600 text-sm">Recitas Generadas</p>
                                </div>
                                <p className="text-2xl font-bold text-teal-600">{medico.totalRecitas}</p>
                            </div>
                            <div className="border-l-4 border-indigo-600 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={18} className="text-indigo-600" />
                                    <p className="text-gray-600 text-sm">Interconsultas</p>
                                </div>
                                <p className="text-2xl font-bold text-indigo-600">{medico.totalInterconsultas}</p>
                            </div>
                        </div>
                    </div>

                    {/* Información del Período */}
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <strong>Período:</strong> {fechaDesde ? new Date(fechaDesde).toLocaleDateString('es-PE') : 'Sin filtro'}
                            {' '} a {' '}
                            {fechaHasta ? new Date(fechaHasta).toLocaleDateString('es-PE') : 'Sin filtro'}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 border-t flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
