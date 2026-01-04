-- ========================================================================
-- Script de Datos de Prueba para Dashboard CENACRON
-- ------------------------------------------------------------------------
-- CENATE 2026 | Testing de Dashboard de Evolución Crónica
-- ========================================================================

-- NOTA: Este script asume que ya existen:
-- - Paciente con PK (ajustar según tu BD)
-- - Profesional con ID (ajustar según tu BD)
-- - Estrategia CENACRON con ID = 2

-- =====================================================================
-- EJEMPLO: Crear atenciones de prueba para paciente hipertenso
-- =====================================================================

-- Variables (ajustar según tu BD)
-- @pk_paciente: '12345678' (ejemplo)
-- @id_profesional: 1 (ejemplo)
-- @id_estrategia_cenacron: 2

-- Atención 1: 3 meses atrás - PA descontrolada
INSERT INTO atencion_clinica (
    pk_asegurado,
    fecha_atencion,
    presion_arterial,
    saturacion_o2,
    temperatura,
    frecuencia_cardiaca,
    peso_kg,
    talla_cm,
    imc,
    diagnostico,
    cie10_codigo,
    cie10_descripcion,
    recomendaciones,
    tratamiento_indicado,
    id_personal_creador,
    id_estrategia,
    estado_atencion
) VALUES (
    '12345678',  -- Ajustar PK del paciente
    NOW() - INTERVAL '90 days',
    '170/100',
    95,
    36.8,
    88,
    85.0,
    165,
    31.2,
    'Hipertensión arterial esencial (primaria). Paciente con presión elevada y sobrepeso.',
    'I10',
    'Hipertensión esencial (primaria)',
    'Control estricto de presión arterial. Dieta hiposódica. Ejercicio moderado 30 min diarios.',
    'Enalapril 10mg VO c/12h. Hidroclorotiazida 25mg VO c/24h. Control en 30 días.',
    1,  -- Ajustar ID del profesional
    2,  -- ID estrategia CENACRON
    'FINALIZADA'
);

-- Atención 2: 2 meses atrás - PA mejoró un poco
INSERT INTO atencion_clinica (
    pk_asegurado,
    fecha_atencion,
    presion_arterial,
    saturacion_o2,
    temperatura,
    frecuencia_cardiaca,
    peso_kg,
    talla_cm,
    imc,
    diagnostico,
    cie10_codigo,
    cie10_descripcion,
    recomendaciones,
    tratamiento_indicado,
    id_personal_creador,
    id_estrategia,
    estado_atencion
) VALUES (
    '12345678',
    NOW() - INTERVAL '60 days',
    '160/95',
    96,
    36.9,
    85,
    84.5,
    165,
    31.0,
    'Hipertensión arterial en tratamiento. Leve mejoría de PA.',
    'I10',
    'Hipertensión esencial (primaria)',
    'Continuar con tratamiento. Reforzar dieta baja en sal. Aumentar actividad física.',
    'Enalapril 10mg VO c/12h. Hidroclorotiazida 25mg VO c/24h. Control en 30 días.',
    1,
    2,
    'FINALIZADA'
);

-- Atención 3: 1 mes atrás - PA mejor controlada
INSERT INTO atencion_clinica (
    pk_asegurado,
    fecha_atencion,
    presion_arterial,
    saturacion_o2,
    temperatura,
    frecuencia_cardiaca,
    peso_kg,
    talla_cm,
    imc,
    diagnostico,
    cie10_codigo,
    cie10_descripcion,
    recomendaciones,
    tratamiento_indicado,
    id_personal_creador,
    id_estrategia,
    estado_atencion
) VALUES (
    '12345678',
    NOW() - INTERVAL '30 days',
    '145/90',
    97,
    37.0,
    80,
    83.8,
    165,
    30.8,
    'Hipertensión arterial. Mejoría progresiva con tratamiento.',
    'I10',
    'Hipertensión esencial (primaria)',
    'Continuar tratamiento actual. Felicitar por adherencia. Mantener cambios en estilo de vida.',
    'Enalapril 10mg VO c/12h. Hidroclorotiazida 25mg VO c/24h. Control en 30 días.',
    1,
    2,
    'FINALIZADA'
);

-- Atención 4: Hace 15 días - PA casi en objetivo
INSERT INTO atencion_clinica (
    pk_asegurado,
    fecha_atencion,
    presion_arterial,
    saturacion_o2,
    temperatura,
    frecuencia_cardiaca,
    peso_kg,
    talla_cm,
    imc,
    diagnostico,
    cie10_codigo,
    cie10_descripcion,
    recomendaciones,
    tratamiento_indicado,
    id_personal_creador,
    id_estrategia,
    estado_atencion
) VALUES (
    '12345678',
    NOW() - INTERVAL '15 days',
    '135/85',
    98,
    37.1,
    78,
    83.0,
    165,
    30.5,
    'Hipertensión arterial en buen control. PA cerca del objetivo.',
    'I10',
    'Hipertensión esencial (primaria)',
    'Excelente progreso. Continuar con tratamiento y estilo de vida saludable.',
    'Enalapril 10mg VO c/12h. Hidroclorotiazida 25mg VO c/24h. Control en 60 días.',
    1,
    2,
    'FINALIZADA'
);

-- Atención 5: Hoy - PA en objetivo
INSERT INTO atencion_clinica (
    pk_asegurado,
    fecha_atencion,
    presion_arterial,
    saturacion_o2,
    temperatura,
    frecuencia_cardiaca,
    peso_kg,
    talla_cm,
    imc,
    diagnostico,
    cie10_codigo,
    cie10_descripcion,
    recomendaciones,
    tratamiento_indicado,
    id_personal_creador,
    id_estrategia,
    estado_atencion
) VALUES (
    '12345678',
    NOW(),
    '128/78',
    98,
    37.0,
    75,
    82.5,
    165,
    30.3,
    'Hipertensión arterial controlada. PA en objetivo terapéutico.',
    'I10',
    'Hipertensión esencial (primaria)',
    'Mantener tratamiento actual. Felicitar por excelente control. Continuar con dieta y ejercicio.',
    'Enalapril 10mg VO c/12h. Hidroclorotiazida 25mg VO c/24h. Control en 90 días.',
    1,
    2,
    'FINALIZADA'
);

-- =====================================================================
-- Verificación de elegibilidad
-- =====================================================================

-- Verificar que el paciente ahora es elegible:
-- 1. Tiene atenciones de estrategia CENACRON (id_estrategia = 2) ✓
-- 2. Tiene diagnóstico CIE-10 de HTA (I10) ✓

-- Consulta de verificación:
-- SELECT COUNT(*) FROM atencion_clinica 
-- WHERE pk_asegurado = '12345678' 
--   AND id_estrategia = 2 
--   AND cie10_codigo LIKE 'I1%';

COMMIT;

-- =====================================================================
-- EJEMPLO: Paciente diabético (opcional)
-- =====================================================================

-- Descomentar para crear paciente diabético:
/*
INSERT INTO atencion_clinica (
    pk_asegurado, fecha_atencion, presion_arterial, peso_kg, talla_cm, imc,
    diagnostico, cie10_codigo, cie10_descripcion, recomendaciones, tratamiento_indicado,
    id_personal_creador, id_estrategia, estado_atencion
) VALUES (
    '87654321',
    NOW() - INTERVAL '30 days',
    '125/80', 95.0, 170, 32.9,
    'Diabetes Mellitus tipo 2. Glucemia no controlada.',
    'E11',
    'Diabetes mellitus tipo 2',
    'Control de glucemia. Dieta diabética estricta.',
    'Metformina 850mg VO c/12h. Glibenclamida 5mg VO c/24h.',
    1, 2, 'FINALIZADA'
);
*/

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
