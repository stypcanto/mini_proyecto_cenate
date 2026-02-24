-- ============================================================
-- V6_1_0: Fix DNIs con menos de 8 dígitos
-- Enfermera id_personal=490 (DNI usuario: 44888440)
-- Los pacientes de dim_solicitud_bolsa con DNIs de 7 dígitos
-- no se encuentran en la tabla asegurados (que los guarda
-- con cero a la izquierda: ej. 5273317 → 05273317).
-- Esta migración corrige todos los registros con < 8 dígitos
-- que sean numéricos, paddeando con ceros a la izquierda.
-- ============================================================

-- 1. Mostrar cuántos registros se van a corregir (para el log)
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM dim_solicitud_bolsa
    WHERE id_personal = 490
      AND LENGTH(TRIM(paciente_dni)) < 8
      AND paciente_dni ~ '^\d+$';

    RAISE NOTICE 'Registros a corregir en dim_solicitud_bolsa (id_personal=490): %', v_count;
END $$;

-- 2. Corregir DNIs en dim_solicitud_bolsa para todos los pacientes
--    de la enfermera 490 con DNI < 8 dígitos (solo numéricos)
UPDATE dim_solicitud_bolsa
SET paciente_dni = LPAD(TRIM(paciente_dni), 8, '0')
WHERE id_personal = 490
  AND LENGTH(TRIM(paciente_dni)) < 8
  AND paciente_dni ~ '^\d+$';

-- 3. Corrección global: aplica a TODOS los profesionales con DNIs cortos
--    para evitar el mismo error en otras enfermeras/médicos
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM dim_solicitud_bolsa
    WHERE LENGTH(TRIM(paciente_dni)) < 8
      AND paciente_dni ~ '^\d+$';

    RAISE NOTICE 'Registros adicionales a corregir (todos los profesionales): %', v_count;
END $$;

UPDATE dim_solicitud_bolsa
SET paciente_dni = LPAD(TRIM(paciente_dni), 8, '0')
WHERE LENGTH(TRIM(paciente_dni)) < 8
  AND paciente_dni ~ '^\d+$';

-- 4. Verificación final
DO $$
DECLARE
    v_restantes INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_restantes
    FROM dim_solicitud_bolsa
    WHERE LENGTH(TRIM(paciente_dni)) < 8
      AND paciente_dni ~ '^\d+$';

    RAISE NOTICE '✅ Corrección completada. Registros aún con DNI < 8 dígitos: %', v_restantes;
END $$;
