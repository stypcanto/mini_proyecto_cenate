-- ============================================================
-- V6_17_0: Deduplicar registros con DNI con/sin cero inicial
-- Problema: mismo paciente aparece duplicado en dim_solicitud_bolsa
--   con DNIs distintos (ej: 1045003 vs 01045003)
-- Solución:
--   1. Normalizar todos los DNIs cortos a 8 dígitos (LPAD)
--   2. Eliminar duplicados manteniendo el registro más reciente
--      (mayor id_solicitud) por combinación (id_bolsa, paciente_dni)
-- ============================================================

-- PASO 1: Normalizar DNIs con < 8 dígitos en dim_solicitud_bolsa
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM dim_solicitud_bolsa
    WHERE LENGTH(TRIM(paciente_dni)) < 8
      AND paciente_dni ~ '^\d+$';
    RAISE NOTICE 'Registros con DNI < 8 dígitos a normalizar: %', v_count;
END $$;

UPDATE dim_solicitud_bolsa
SET paciente_dni = LPAD(TRIM(paciente_dni), 8, '0')
WHERE LENGTH(TRIM(paciente_dni)) < 8
  AND paciente_dni ~ '^\d+$';

-- PASO 2: Normalizar paciente_id también si contiene el DNI en formato corto
UPDATE dim_solicitud_bolsa
SET paciente_id = LPAD(TRIM(paciente_id), 8, '0')
WHERE paciente_id ~ '^\d+$'
  AND LENGTH(TRIM(paciente_id)) < 8
  AND EXISTS (
      SELECT 1 FROM asegurados a WHERE a.doc_paciente = LPAD(TRIM(dim_solicitud_bolsa.paciente_id), 8, '0')
  );

-- PASO 3: Normalizar doc_paciente en solicitud_cita
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM solicitud_cita
    WHERE LENGTH(TRIM(doc_paciente)) < 8
      AND doc_paciente ~ '^\d+$';
    RAISE NOTICE 'Registros en solicitud_cita con DNI < 8 dígitos: %', v_count;
END $$;

UPDATE solicitud_cita
SET doc_paciente = LPAD(TRIM(doc_paciente), 8, '0')
WHERE LENGTH(TRIM(doc_paciente)) < 8
  AND doc_paciente ~ '^\d+$';

-- PASO 4: Eliminar duplicados en dim_solicitud_bolsa
-- Mantener el registro con mayor id_solicitud (más reciente) por (id_bolsa, paciente_dni)
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM dim_solicitud_bolsa dsb
    WHERE dsb.id_solicitud NOT IN (
        SELECT MAX(id_solicitud)
        FROM dim_solicitud_bolsa
        GROUP BY id_bolsa, paciente_dni
    );
    RAISE NOTICE 'Registros duplicados (a eliminar): %', v_count;
END $$;

DELETE FROM dim_solicitud_bolsa
WHERE id_solicitud NOT IN (
    SELECT MAX(id_solicitud)
    FROM dim_solicitud_bolsa
    GROUP BY id_bolsa, paciente_dni
);

-- PASO 5: Verificación final
DO $$
DECLARE
    v_dni_cortos  INTEGER;
    v_duplicados  INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_dni_cortos
    FROM dim_solicitud_bolsa
    WHERE LENGTH(TRIM(paciente_dni)) < 8
      AND paciente_dni ~ '^\d+$';

    SELECT COUNT(*) INTO v_duplicados
    FROM (
        SELECT id_bolsa, paciente_dni, COUNT(*) AS cnt
        FROM dim_solicitud_bolsa
        GROUP BY id_bolsa, paciente_dni
        HAVING COUNT(*) > 1
    ) sub;

    RAISE NOTICE '✅ Resultado: DNIs aún cortos=%, grupos duplicados restantes=%', v_dni_cortos, v_duplicados;
END $$;
