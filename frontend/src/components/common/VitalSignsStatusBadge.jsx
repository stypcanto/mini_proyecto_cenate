// ========================================================================
// VitalSignsStatusBadge.jsx - Badge Inteligente de Estado de Signos Vitales
// ------------------------------------------------------------------------
// CENATE 2026 | Indicador con lógica clínica real - NO MÁS BADGES ENGAÑOSOS
// ========================================================================

import React from 'react';
import { evaluarEstadoGeneral, getEstiloSeveridad } from '../../utils/vitalSignsUtils';

/**
 * Badge inteligente que evalúa el estado real de los signos vitales
 * 
 * ANTES (❌ PELIGROSO):
 *   - Badge verde "Signos Vitales ✓" cuando PA = 150/95 (hipertensión grado 2)
 * 
 * AHORA (✅ SEGURO):
 *   - Badge ROJO "FUERA DE RANGO ⚠️" cuando PA = 150/95
 *   - Badge parpadeante "CRÍTICO 🚨" cuando PA >= 180/120
 *   - Badge verde solo cuando valores son realmente normales
 */
export default function VitalSignsStatusBadge({
    presionArterial,
    saturacionO2,
    temperatura,
    frecuenciaCardiaca,
    className = ''
}) {
    // Evaluar estado general basado en todos los signos vitales
    const evaluacion = evaluarEstadoGeneral({
        presionArterial,
        saturacionO2,
        temperatura,
        frecuenciaCardiaca
    });

    const estilo = getEstiloSeveridad(evaluacion.severidad);

    return (
        <span
            className={ `inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${estilo.badge} ${estilo.animate} ${className}` }
            title={ evaluacion.mensaje }
        >
            <span>{ evaluacion.icon }</span>
            <span>{ estilo.label }</span>
        </span>
    );
}
