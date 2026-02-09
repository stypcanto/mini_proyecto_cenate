import React from 'react';
import { Calendar } from 'lucide-react';

/**
 * Componente de filtros de período
 * Botones para cambiar entre semana, mes y año
 */
export default function FiltrosPeriodo({ periodo, onChange }) {
    const periodos = [
        { id: 'semana', label: 'Última Semana' },
        { id: 'mes', label: 'Último Mes' },
        { id: 'año', label: 'Último Año' }
    ];

    return (
        <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow">
            <Calendar className="text-gray-600" size={20} />
            <span className="text-gray-700 font-semibold">Período:</span>
            <div className="flex gap-2">
                {periodos.map(p => (
                    <button
                        key={p.id}
                        onClick={() => onChange(p.id)}
                        className={`px-4 py-2 rounded-lg transition ${
                            periodo === p.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
