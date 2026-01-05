import React from 'react';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';

/**
 * Componente para mostrar indicador de tendencia de signos vitales
 * Muestra flechas y colores según la evolución del paciente
 * 
 * @param {Object} props
 * @param {string} props.tendencia - MEJORANDO | EMPEORANDO | ESTABLE | SIN_DATOS
 * @param {string} props.valorAnterior - Valor anterior para tooltip
 * @param {number} props.diasDesdeAnterior - Días desde última medición
 * @param {string} props.label - Etiqueta del signo vital
 */
export default function TrendIndicator({
    tendencia,
    valorAnterior,
    diasDesdeAnterior,
    label
}) {
    // Si no hay datos anteriores, no mostrar nada
    if (!tendencia || tendencia === 'SIN_DATOS') {
        return null;
    }

    const getIndicatorConfig = () => {
        switch (tendencia) {
            case 'MEJORANDO':
                return {
                    icon: TrendingUp,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    borderColor: 'border-green-300',
                    label: 'Mejorando',
                    emoji: '✓'
                };
            case 'EMPEORANDO':
                return {
                    icon: TrendingDown,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    borderColor: 'border-red-300',
                    label: 'Empeorando',
                    emoji: '⚠️'
                };
            case 'ESTABLE':
                return {
                    icon: Minus,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    borderColor: 'border-gray-300',
                    label: 'Estable',
                    emoji: '→'
                };
            default:
                return {
                    icon: HelpCircle,
                    color: 'text-gray-400',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    label: 'Sin datos',
                    emoji: '—'
                };
        }
    };

    const config = getIndicatorConfig();
    const Icon = config.icon;

    // Tooltip text
    const tooltipText = valorAnterior
        ? `${label}: ${valorAnterior} hace ${diasDesdeAnterior} días → ${config.label}`
        : `${config.label}`;

    return (
        <div
            className={ `inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${config.bgColor} ${config.borderColor} border` }
            title={ tooltipText }
        >
            <Icon className={ `w-3 h-3 ${config.color}` } />
            <span className={ `text-xs font-semibold ${config.color}` }>
                { config.emoji }
            </span>
        </div>
    );
}
