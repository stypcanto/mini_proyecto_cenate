// ========================================================================
// VitalSignBadge.jsx - Badge Individual para Signo Vital
// ------------------------------------------------------------------------
// CENATE 2026 | Muestra un signo vital específico con estado clínico
// ========================================================================

import React from 'react';
import { getEstiloSeveridad } from '../../utils/vitalSignsUtils';
import TrendIndicator from './TrendIndicator';

/**
 * Badge para mostrar un signo vital individual con su estado clínico
 * 
 * Ejemplo:
 *   PA: 150/95 mmHg ⚠️ FUERA DE RANGO ↓ Mejorando
 *   SpO2: 89% 🚨 CRÍTICO ↓ Empeorando
 *   Temp: 37.2°C ✓ NORMAL → Estable
 */
export default function VitalSignBadge({
    label,
    value,
    unit,
    evaluacion,
    showReference = false,
    reference = '',
    // Props para tendencia
    tendencia = null,
    valorAnterior = null,
    diasDesdeAnterior = null
}) {
    if (!evaluacion || !value) {
        return null;
    }

    const estilo = getEstiloSeveridad(evaluacion.severidad);

    return (
        <div className={ `p-3 rounded-lg border-2 ${estilo.border} ${estilo.bg} ${estilo.animate}` }>
            {/* Label */ }
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">{ label }</span>
                <span className={ `text-xs font-bold ${estilo.text}` }>
                    { evaluacion.icon } { evaluacion.mensaje }
                </span>
            </div>

            {/* Valor + Tendencia */ }
            <div className="flex items-center gap-2">
                <div className={ `text-2xl font-bold ${estilo.text}` }>
                    { value }
                    { unit && <span className="text-sm ml-1 font-normal">{ unit }</span> }
                </div>
                { tendencia && (
                    <TrendIndicator
                        tendencia={ tendencia }
                        valorAnterior={ valorAnterior }
                        diasDesdeAnterior={ diasDesdeAnterior }
                        label={ label }
                    />
                ) }
            </div>

            {/* Referencia (opcional) */ }
            { showReference && reference && (
                <div className="text-xs text-gray-500 mt-1">
                    Referencia: { reference }
                </div>
            ) }
        </div>
    );
}
