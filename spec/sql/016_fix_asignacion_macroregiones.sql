-- ========================================================================
-- Script de Corrección: Asignación de Redes a Macroregiones
-- ========================================================================
-- Problema: Todas las redes están asignadas a LIMA ORIENTE (id_macro = 1)
-- Solución: Reasignar según ubicación geográfica real
-- ========================================================================

BEGIN;

-- ========================================================================
-- LIMA ORIENTE (id_macro = 1) - Redes de Lima + Loreto + Huaraz
-- ========================================================================
UPDATE dim_red SET id_macro = 1
WHERE desc_red IN (
    'RED ASISTENCIAL ALMENARA',
    'RED ASISTENCIAL REBAGLIATI',
    'RED ASISTENCIAL SABOGAL',
    'AFESSALUD',
    'CENTRO NACIONAL DE SALUD RENAL',
    'INSTIT. NACIONAL CARDIOVASCULAR',
    'RED ASISTENCIAL LORETO',
    'RED ASISTENCIAL HUARAZ'
);

-- ========================================================================
-- CENTRO (id_macro = 2) - Sierra y Costa Centro
-- ========================================================================
UPDATE dim_red SET id_macro = 2 
WHERE desc_red IN (
    'RED ASISTENCIAL JUNIN',
    'RED ASISTENCIAL HUANCAVELICA',
    'RED ASISTENCIAL HUANUCO',
    'RED ASISTENCIAL PASCO',
    'RED ASISTENCIAL AYACUCHO',
    'RED ASISTENCIAL ICA'
);

-- ========================================================================
-- NORTE (id_macro = 3) - Costa y Selva Norte
-- ========================================================================
UPDATE dim_red SET id_macro = 3
WHERE desc_red IN (
    'RED ASISTENCIAL LA LIBERTAD',
    'RED ASISTENCIAL LAMBAYEQUE',
    'RED ASISTENCIAL PIURA',
    'RED ASISTENCIAL TUMBES',
    'RED ASISTENCIAL CAJAMARCA',
    'RED ASISTENCIAL AMAZONAS',
    'RED ASISTENCIAL ANCASH',
    'RED ASISTENCIAL JAEN',
    'RED ASISTENCIAL UCAYALI',
    'MICRORED ASISTENCIAL MOYOBAMBA',
    'MICRORED ASISTENCIAL TARAPOTO'
);

-- ========================================================================
-- SUR (id_macro = 4) - Sierra y Costa Sur
-- ========================================================================
UPDATE dim_red SET id_macro = 4 
WHERE desc_red IN (
    'RED ASISTENCIAL AREQUIPA',
    'RED ASISTENCIAL CUSCO',
    'RED ASISTENCIAL PUNO',
    'RED ASISTENCIAL JULIACA',
    'RED ASISTENCIAL TACNA',
    'RED ASISTENCIAL MOQUEGUA',
    'RED ASISTENCIAL APURIMAC',
    'RED ASISTENCIAL MADRE DE DIOS'
);

-- Verificar resultado
SELECT 
    m.desc_macro,
    COUNT(r.id_red) as total_redes
FROM dim_macroregion m
LEFT JOIN dim_red r ON r.id_macro = m.id_macro
WHERE m.stat_macro = 'A'
GROUP BY m.id_macro, m.desc_macro
ORDER BY m.desc_macro;

COMMIT;
