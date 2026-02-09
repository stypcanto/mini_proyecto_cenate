import React, { useState } from 'react';
import { ChevronDown, Eye } from 'lucide-react';

/**
 * Tabla de estadísticas por médico
 * Muestra métricas de desempeño de cada médico
 */
export default function TablaMedicos({ medicos, onVerDetalle }) {
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRow = (idPers) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(idPers)) {
            newExpanded.delete(idPers);
        } else {
            newExpanded.add(idPers);
        }
        setExpandedRows(newExpanded);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Médico</th>
                        <th className="px-4 py-2 text-center">Asignados</th>
                        <th className="px-4 py-2 text-center">Atendidos</th>
                        <th className="px-4 py-2 text-center">Pendientes</th>
                        <th className="px-4 py-2 text-center">Deserciones</th>
                        <th className="px-4 py-2 text-center">% Atencion</th>
                        <th className="px-4 py-2 text-center">Horas Prom.</th>
                        <th className="px-4 py-2 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {medicos.map(medico => (
                        <React.Fragment key={medico.idPers}>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold">{medico.nombreMedico}</td>
                                <td className="px-4 py-3 text-center font-bold text-blue-600">
                                    {medico.totalAsignados}
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-green-600">
                                    {medico.totalAtendidos}
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-orange-600">
                                    {medico.totalPendientes}
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-red-600">
                                    {medico.totalDeserciones}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        {medico.porcentajeAtencion?.toFixed(1) || '0'}%
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {medico.horasPromedioAtencion?.toFixed(1) || '—'}h
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => onVerDetalle(medico)}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                    >
                                        <Eye size={16} />
                                        Ver
                                    </button>
                                </td>
                            </tr>
                            {expandedRows.has(medico.idPers) && (
                                <tr className="bg-gray-50 border-b">
                                    <td colSpan="8" className="px-4 py-3">
                                        <div className="grid grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Crónicos</p>
                                                <p className="font-bold text-purple-600">{medico.totalCronicos}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Recitas</p>
                                                <p className="font-bold text-teal-600">{medico.totalRecitas}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Interconsultas</p>
                                                <p className="font-bold text-indigo-600">{medico.totalInterconsultas}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Tasa Deserción</p>
                                                <p className="font-bold text-red-600">{medico.tasaDesercion?.toFixed(1) || '0'}%</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {medicos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No hay médicos en el área para el período seleccionado
                </div>
            )}
        </div>
    );
}
