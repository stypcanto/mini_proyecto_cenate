-- ============================================================================
-- V6_10_0: Normalizar especialidades — eliminar sufijos entre paréntesis
-- Problema: dim_solicitud_bolsa.especialidad tiene variantes como
--           "ENFERMERIA (SIN ATENCIÓN)", "MEDICINA GENERAL (SIN TRATAMIENTO)",
--           "PSICOLOGIA (SIN ATENCIÓN)", etc., que deben unificarse con el
--           nombre base para consistencia en reportes y filtros.
-- Solución: REGEXP_REPLACE elimina cualquier sufijo " (xxx)" al final del
--           campo especialidad en todos los registros activos e inactivos.
-- Afectados: ~700 registros con 33 variantes distintas
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-02
-- ============================================================================

-- PASO 1: Auditoría previa (registro de cuántas filas serán afectadas)
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM dim_solicitud_bolsa
    WHERE especialidad LIKE '%(%)%';

    RAISE NOTICE 'V6_10_0: Registros con paréntesis en especialidad antes del UPDATE: %', v_count;
END $$;

-- PASO 2: Normalizar — quitar sufijo " (lo que sea)" al final del campo
UPDATE dim_solicitud_bolsa
SET especialidad = TRIM(REGEXP_REPLACE(especialidad, '\s*\([^)]*\)\s*$', ''))
WHERE especialidad LIKE '%(%)%'
  AND especialidad IS NOT NULL;

-- PASO 3: Verificación final
DO $$
DECLARE
    v_remaining INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_remaining
    FROM dim_solicitud_bolsa
    WHERE especialidad LIKE '%(%)%';

    RAISE NOTICE 'V6_10_0: Registros con paréntesis en especialidad después del UPDATE: %', v_remaining;

    IF v_remaining > 0 THEN
        RAISE WARNING 'V6_10_0: Quedaron % registros sin normalizar (pueden tener doble paréntesis)', v_remaining;
    ELSE
        RAISE NOTICE 'V6_10_0: ✅ Normalización completada exitosamente';
    END IF;
END $$;
