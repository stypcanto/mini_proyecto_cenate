import React from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

/**
 * Componente de semáforo para mostrar adherencia al tratamiento
 * 
 * Niveles:
 * - ALTA (≥80%): Verde ✅
 * - MEDIA (50-79%): Amarillo ⚠️
 * - BAJA (<50%): Rojo ❌
 * - SIN_DATOS: Gris —
 * 
 * @param {Object} props
 * @param {number} props.porcentaje - Porcentaje de adherencia (0-100)
 * @param {string} props.nivel - ALTA | MEDIA | BAJA | SIN_DATOS
 * @param {number} props.dosisTomadas - Dosis efectivamente tomadas
 * @param {number} props.totalDosis - Total de dosis programadas
 * @param {boolean} props.compact - Modo compacto (solo semáforo sin detalles)
 */
export default function AdherenciaSemaforo({
    porcentaje,
    nivel,
    dosisTomadas,
    totalDosis,
    compact = false
}) {
    const getConfig = () => {
        switch (nivel) {
            case 'ALTA':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    borderColor: 'border-green-300',
                    label: 'Adherencia Alta',
                    emoji: '✅',
                    description: 'Excelente cumplimiento del tratamiento'
                };
            case 'MEDIA':
                return {
                    icon: AlertTriangle,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-100',
                    borderColor: 'border-yellow-300',
                    label: 'Adherencia Media',
                    emoji: '⚠️',
                    description: 'Cumplimiento moderado, puede mejorar'
                };
            case 'BAJA':
                return {
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    borderColor: 'border-red-300',
                    label: 'Adherencia Baja',
                    emoji: '❌',
                    description: 'Requiere intervención urgente'
                };
            default:
                return {
                    icon: HelpCircle,
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-100',
                    borderColor: 'border-gray-300',
                    label: 'Sin Datos',
                    emoji: '—',
                    description: 'No hay registros de adherencia'
                };
        }
    };

    const config = getConfig();
    const Icon = config.icon;

    // Si no hay datos y es modo compacto, no mostrar nada
    if (nivel === 'SIN_DATOS' && compact) {
        return null;
    }

    // Modo compacto: solo badge pequeño
    if (compact) {
        return (
            <div
                className={ `inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${config.bgColor} ${config.borderColor}` }
                title={ `${config.label}: ${porcentaje?.toFixed(0)}%` }
            >
                <Icon className={ `w-3.5 h-3.5 ${config.color}` } />
                <span className={ `text-xs font-semibold ${config.color}` }>
                    { porcentaje?.toFixed(0) }%
                </span>
            </div>
        );
    }

    // Modo completo: card con detalles
    return (
        <div className={ `p-4 rounded-xl border-2 ${config.borderColor} ${config.bgColor}` }>
            {/* Header */ }
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Activity className={ `w-5 h-5 ${config.color}` } />
                    <h4 className={ `font-bold ${config.color}` }>Adherencia al Tratamiento</h4>
                </div>
                <Icon className={ `w-6 h-6 ${config.color}` } />
            </div>

            {/* Porcentaje principal */ }
            { porcentaje !== null && porcentaje !== undefined ? (
                <>
                    <div className={ `text-4xl font-bold ${config.color} mb-1` }>
                        { porcentaje.toFixed(1) }%
                    </div>

                    {/* Label de nivel */ }
                    <div className={ `text-sm font-semibold ${config.color} mb-2` }>
                        { config.emoji } { config.label }
                    </div>

                    {/* Estadísticas */ }
                    <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">{ dosisTomadas }</span> de{ ' ' }
                        <span className="font-medium">{ totalDosis }</span> dosis tomadas
                    </div>

                    {/* Descripción */ }
                    <p className="text-xs text-gray-600 italic">
                        { config.description }
                    </p>
                </>
            ) : (
                <div className="text-center py-4">
                    <p className={ `text-sm font-medium ${config.color}` }>
                        { config.emoji } { config.label }
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        { config.description }
                    </p>
                </div>
            ) }
        </div>
    );
}
