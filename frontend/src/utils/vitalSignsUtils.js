// ========================================================================
// vitalSignsUtils.js - Utilidades para Cálculo de Estados de Signos Vitales
// ------------------------------------------------------------------------
// CENATE 2026 | Lógica clínica para evaluación de signos vitales
// ========================================================================

/**
 * Rangos clínicos para presión arterial según JNC 8 / AHA Guidelines
 */
const RANGOS_PRESION_ARTERIAL = {
    HIPOTENSION: { sistolica: [0, 90], diastolica: [0, 60] },
    NORMAL: { sistolica: [90, 120], diastolica: [60, 80] },
    ELEVADA: { sistolica: [120, 130], diastolica: [60, 80] },
    HIPERTENSION_GRADO_1: { sistolica: [130, 140], diastolica: [80, 90] },
    HIPERTENSION_GRADO_2: { sistolica: [140, 180], diastolica: [90, 120] },
    CRISIS_HIPERTENSIVA: { sistolica: [180, 999], diastolica: [120, 999] }
};

/**
 * Rangos clínicos para saturación de oxígeno
 */
const RANGOS_SATURACION_O2 = {
    CRITICO: [0, 88],      // Hipoxemia severa
    BAJO: [88, 94],        // Hipoxemia
    NORMAL: [94, 100]      // Normal
};

/**
 * Rangos clínicos para temperatura corporal (°C)
 */
const RANGOS_TEMPERATURA = {
    HIPOTERMIA: [0, 36],
    NORMAL: [36, 37.5],
    FEBRICULA: [37.5, 38],
    FIEBRE: [38, 39],
    FIEBRE_ALTA: [39, 999]
};

/**
 * Rangos clínicos para frecuencia cardíaca (lpm)
 */
const RANGOS_FRECUENCIA_CARDIACA = {
    BRADICARDIA: [0, 60],
    NORMAL: [60, 100],
    TAQUICARDIA: [100, 999]
};

/**
 * Evaluar estado de presión arterial
 * @param {string} presionArterial - Formato "120/80"
 * @returns {object} { estado, severidad, mensaje, sistolica, diastolica }
 */
export function evaluarPresionArterial(presionArterial) {
    if (!presionArterial) {
        return { estado: 'SIN_DATOS', severidad: 'none', mensaje: 'Sin datos' };
    }

    const [sis, dia] = presionArterial.split('/').map(v => parseInt(v.trim()));

    if (isNaN(sis) || isNaN(dia)) {
        return { estado: 'INVALIDO', severidad: 'none', mensaje: 'Dato inválido' };
    }

    // Crisis hipertensiva (CRÍTICO)
    if (sis >= 180 || dia >= 120) {
        return {
            estado: 'CRISIS_HIPERTENSIVA',
            severidad: 'critical',
            mensaje: 'Crisis Hipertensiva - Atención Inmediata',
            sistolica: sis,
            diastolica: dia,
            color: 'red',
            icon: '🚨'
        };
    }

    // Hipertensión Grado 2 (PELIGRO)
    if (sis >= 140 || dia >= 90) {
        return {
            estado: 'HIPERTENSION_GRADO_2',
            severidad: 'danger',
            mensaje: 'Hipertensión Grado 2',
            sistolica: sis,
            diastolica: dia,
            color: 'red',
            icon: '⚠️'
        };
    }

    // Hipertensión Grado 1 (ADVERTENCIA)
    if (sis >= 130 || dia >= 80) {
        return {
            estado: 'HIPERTENSION_GRADO_1',
            severidad: 'warning',
            mensaje: 'Hipertensión Grado 1',
            sistolica: sis,
            diastolica: dia,
            color: 'yellow',
            icon: '⚡'
        };
    }

    // Presión Elevada
    if (sis >= 120 && sis < 130 && dia < 80) {
        return {
            estado: 'ELEVADA',
            severidad: 'borderline',
            mensaje: 'Presión Elevada',
            sistolica: sis,
            diastolica: dia,
            color: 'yellow',
            icon: '⚡'
        };
    }

    // Hipotensión
    if (sis < 90 || dia < 60) {
        return {
            estado: 'HIPOTENSION',
            severidad: 'warning',
            mensaje: 'Hipotensión',
            sistolica: sis,
            diastolica: dia,
            color: 'orange',
            icon: '⚠️'
        };
    }

    // Normal
    return {
        estado: 'NORMAL',
        severidad: 'normal',
        mensaje: 'Normal',
        sistolica: sis,
        diastolica: dia,
        color: 'green',
        icon: '✓'
    };
}

/**
 * Evaluar estado de saturación de oxígeno
 */
export function evaluarSaturacionO2(saturacion) {
    if (saturacion === null || saturacion === undefined) {
        return { estado: 'SIN_DATOS', severidad: 'none', mensaje: 'Sin datos' };
    }

    if (saturacion < 88) {
        return {
            estado: 'CRITICO',
            severidad: 'critical',
            mensaje: 'Hipoxemia Severa',
            valor: saturacion,
            color: 'red',
            icon: '🚨'
        };
    }

    if (saturacion < 94) {
        return {
            estado: 'BAJO',
            severidad: 'danger',
            mensaje: 'Hipoxemia',
            valor: saturacion,
            color: 'red',
            icon: '⚠️'
        };
    }

    return {
        estado: 'NORMAL',
        severidad: 'normal',
        mensaje: 'Normal',
        valor: saturacion,
        color: 'green',
        icon: '✓'
    };
}

/**
 * Evaluar estado de temperatura
 */
export function evaluarTemperatura(temperatura) {
    if (!temperatura) {
        return { estado: 'SIN_DATOS', severidad: 'none', mensaje: 'Sin datos' };
    }

    const temp = parseFloat(temperatura);

    if (temp >= 39) {
        return {
            estado: 'FIEBRE_ALTA',
            severidad: 'danger',
            mensaje: 'Fiebre Alta',
            valor: temp,
            color: 'red',
            icon: '🔥'
        };
    }

    if (temp >= 38) {
        return {
            estado: 'FIEBRE',
            severidad: 'warning',
            mensaje: 'Fiebre',
            valor: temp,
            color: 'yellow',
            icon: '⚡'
        };
    }

    if (temp >= 37.5) {
        return {
            estado: 'FEBRICULA',
            severidad: 'borderline',
            mensaje: 'Febrícula',
            valor: temp,
            color: 'yellow',
            icon: '⚡'
        };
    }

    if (temp < 36) {
        return {
            estado: 'HIPOTERMIA',
            severidad: 'warning',
            mensaje: 'Hipotermia',
            valor: temp,
            color: 'orange',
            icon: '⚠️'
        };
    }

    return {
        estado: 'NORMAL',
        severidad: 'normal',
        mensaje: 'Normal',
        valor: temp,
        color: 'green',
        icon: '✓'
    };
}

/**
 * Evaluar estado de frecuencia cardíaca
 */
export function evaluarFrecuenciaCardiaca(fc) {
    if (fc === null || fc === undefined) {
        return { estado: 'SIN_DATOS', severidad: 'none', mensaje: 'Sin datos' };
    }

    if (fc < 60) {
        return {
            estado: 'BRADICARDIA',
            severidad: 'warning',
            mensaje: 'Bradicardia',
            valor: fc,
            color: 'yellow',
            icon: '⚡'
        };
    }

    if (fc > 100) {
        return {
            estado: 'TAQUICARDIA',
            severidad: 'warning',
            mensaje: 'Taquicardia',
            valor: fc,
            color: 'yellow',
            icon: '⚡'
        };
    }

    return {
        estado: 'NORMAL',
        severidad: 'normal',
        mensaje: 'Normal',
        valor: fc,
        color: 'green',
        icon: '✓'
    };
}

/**
 * Evaluar estado general de todos los signos vitales
 * Retorna el peor estado encontrado
 */
export function evaluarEstadoGeneral(signosVitales) {
    const evaluaciones = [];

    if (signosVitales.presionArterial) {
        evaluaciones.push(evaluarPresionArterial(signosVitales.presionArterial));
    }

    if (signosVitales.saturacionO2 !== null && signosVitales.saturacionO2 !== undefined) {
        evaluaciones.push(evaluarSaturacionO2(signosVitales.saturacionO2));
    }

    if (signosVitales.temperatura) {
        evaluaciones.push(evaluarTemperatura(signosVitales.temperatura));
    }

    if (signosVitales.frecuenciaCardiaca !== null && signosVitales.frecuenciaCardiaca !== undefined) {
        evaluaciones.push(evaluarFrecuenciaCardiaca(signosVitales.frecuenciaCardiaca));
    }

    // Si no hay datos
    if (evaluaciones.length === 0) {
        return {
            estado: 'SIN_SIGNOS_VITALES',
            severidad: 'none',
            mensaje: 'Sin signos vitales registrados',
            color: 'gray',
            icon: '—'
        };
    }

    // Prioridad: critical > danger > warning > borderline > normal
    const prioridad = ['critical', 'danger', 'warning', 'borderline', 'normal', 'none'];

    let peorEvaluacion = evaluaciones[0];
    for (const evaluacion of evaluaciones) {
        if (prioridad.indexOf(evaluacion.severidad) < prioridad.indexOf(peorEvaluacion.severidad)) {
            peorEvaluacion = evaluacion;
        }
    }

    return peorEvaluacion;
}

/**
 * Obtener configuración de estilo según severidad
 */
export function getEstiloSeveridad(severidad) {
    const estilos = {
        critical: {
            bg: 'bg-red-600',
            text: 'text-white',
            border: 'border-red-600',
            badge: 'bg-red-600 text-white',
            animate: 'animate-pulse',
            label: 'CRÍTICO'
        },
        danger: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-300',
            badge: 'bg-red-500 text-white',
            animate: '',
            label: 'FUERA DE RANGO'
        },
        warning: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-300',
            badge: 'bg-yellow-500 text-white',
            animate: '',
            label: 'ADVERTENCIA'
        },
        borderline: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-700',
            border: 'border-yellow-200',
            badge: 'bg-yellow-400 text-yellow-900',
            animate: '',
            label: 'ELEVADO'
        },
        normal: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300',
            badge: 'bg-green-500 text-white',
            animate: '',
            label: 'NORMAL'
        },
        none: {
            bg: 'bg-gray-100',
            text: 'text-gray-600',
            border: 'border-gray-300',
            badge: 'bg-gray-400 text-white',
            animate: '',
            label: 'SIN DATOS'
        }
    };

    return estilos[severidad] || estilos.none;
}
