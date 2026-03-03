-- ============================================================================
-- V6_13_0: Backfill id_ipress en dim_solicitud_bolsa desde cas_adscripcion
-- Problema: dim_solicitud_bolsa.id_ipress = NULL para algunos registros.
--           El JOIN con dim_ipress falla → el frontend muestra el código
--           numérico (ej: "160", "351") en lugar del nombre de la IPRESS.
-- Causa: Al crear la solicitud no se resolvió cas_adscripcion → id_ipress.
-- Solución: UPDATE usando asegurados.cas_adscripcion → dim_ipress.id_ipress
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-02
-- ============================================================================

-- PASO 1: Auditoría previa
DO $$
DECLARE v_null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_null_count
    FROM dim_solicitud_bolsa
    WHERE id_ipress IS NULL;
    RAISE NOTICE 'V6_13_0: Registros con id_ipress NULL antes del UPDATE: %', v_null_count;
END $$;

-- PASO 2: Backfill id_ipress resolviendo cas_adscripcion → cod_ipress → id_ipress
UPDATE dim_solicitud_bolsa sb
SET id_ipress = di.id_ipress
FROM asegurados da
JOIN dim_ipress di ON TRIM(da.cas_adscripcion) = di.cod_ipress
WHERE sb.paciente_dni = da.doc_paciente
  AND sb.id_ipress IS NULL
  AND da.cas_adscripcion IS NOT NULL
  AND TRIM(da.cas_adscripcion) <> '';

-- PASO 3: Verificación final
DO $$
DECLARE
    v_remaining  INTEGER;
    v_updated    INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_remaining
    FROM dim_solicitud_bolsa
    WHERE id_ipress IS NULL;

    RAISE NOTICE 'V6_13_0: Registros con id_ipress NULL después del UPDATE: %', v_remaining;

    IF v_remaining = 0 THEN
        RAISE NOTICE 'V6_13_0: ✅ Todos los id_ipress backfilleados correctamente';
    ELSE
        RAISE WARNING 'V6_13_0: % registros siguen con id_ipress NULL (el asegurado no tiene cas_adscripcion o el código no existe en dim_ipress)', v_remaining;
    END IF;
END $$;
