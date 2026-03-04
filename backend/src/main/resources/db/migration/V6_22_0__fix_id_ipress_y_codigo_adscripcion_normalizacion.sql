-- ============================================================================
-- V6_22_0: Normalización completa de id_ipress y codigo_adscripcion
--
-- Problema arquitectural identificado:
--   dim_solicitud_bolsa tiene 3 formas de referenciar la IPRESS de adscripción:
--     (1) codigo_adscripcion TEXT  → código numérico como texto ("21", "407")
--     (2) codigo_ipress TEXT       → DUPLICADO de (1), mismo dato distinto nombre
--     (3) id_ipress BIGINT         → FK a dim_ipress (muchos en NULL)
--
--   La fuente de verdad es dim_ipress.cod_ipress (siempre 3 dígitos: "021", "407")
--   El problema: codigo_adscripcion guarda SIN leading zeros ("21" en vez de "021")
--   → el JOIN falla y id_ipress queda NULL
--
-- Solución en 3 pasos:
--   PASO 1: Normalizar codigo_adscripcion a 3 dígitos (LPAD)
--   PASO 2: Backfill id_ipress usando codigo_adscripcion normalizado (directo, sin pasar por asegurados)
--   PASO 3: Segundo intento via asegurados para los que aún faltan
--
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-03
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- AUDITORÍA PREVIA
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    v_null_ipress         INTEGER;
    v_cod_sin_normalizar  INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_null_ipress
    FROM dim_solicitud_bolsa
    WHERE id_ipress IS NULL;

    SELECT COUNT(*) INTO v_cod_sin_normalizar
    FROM dim_solicitud_bolsa
    WHERE codigo_adscripcion IS NOT NULL
      AND codigo_adscripcion ~ '^\d{1,2}$';   -- solo 1 o 2 dígitos (sin leading zero)

    RAISE NOTICE '══════════════════════════════════════════════════════';
    RAISE NOTICE 'V6_22_0 - ESTADO INICIAL';
    RAISE NOTICE '  id_ipress NULL              : %', v_null_ipress;
    RAISE NOTICE '  codigo_adscripcion sin LPAD : %', v_cod_sin_normalizar;
    RAISE NOTICE '══════════════════════════════════════════════════════';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1: Normalizar codigo_adscripcion a 3 dígitos con leading zeros
--   "21"  → "021"
--   "7"   → "007"
--   "407" → "407"  (sin cambio, ya correcto)
--   "ABC" → "ABC"  (alfanumérico, no tocar)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE dim_solicitud_bolsa
SET codigo_adscripcion = LPAD(codigo_adscripcion, 3, '0')
WHERE codigo_adscripcion IS NOT NULL
  AND codigo_adscripcion ~ '^\d{1,2}$';   -- solo 1 o 2 dígitos numéricos

DO $$
DECLARE v_norm INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_norm
    FROM dim_solicitud_bolsa
    WHERE codigo_adscripcion IS NOT NULL
      AND codigo_adscripcion ~ '^\d{1,2}$';
    RAISE NOTICE 'PASO 1 completo — registros aún sin normalizar: %', v_norm;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2: Backfill id_ipress directo desde codigo_adscripcion
--   No depende de la tabla asegurados → cubre PADOMI y otros con paciente_id=NULL
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE dim_solicitud_bolsa sb
SET id_ipress = di.id_ipress
FROM dim_ipress di
WHERE sb.id_ipress IS NULL
  AND sb.codigo_adscripcion IS NOT NULL
  AND TRIM(sb.codigo_adscripcion) = di.cod_ipress;

DO $$
DECLARE v_remain INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_remain FROM dim_solicitud_bolsa WHERE id_ipress IS NULL;
    RAISE NOTICE 'PASO 2 completo — id_ipress NULL restantes: %', v_remain;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3: Segundo intento vía asegurados para los que aún faltan
--   (pacientes con codigo_adscripcion=NULL pero DNI en tabla asegurados)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE dim_solicitud_bolsa sb
SET
    id_ipress          = di.id_ipress,
    codigo_adscripcion = di.cod_ipress   -- también poblar codigo_adscripcion si era NULL
FROM asegurados a
JOIN dim_ipress di ON di.cod_ipress = LPAD(TRIM(a.cas_adscripcion), 3, '0')
WHERE sb.paciente_dni = a.doc_paciente
  AND sb.id_ipress IS NULL
  AND a.cas_adscripcion IS NOT NULL
  AND TRIM(a.cas_adscripcion) <> '';

-- ─────────────────────────────────────────────────────────────────────────────
-- REPORTE FINAL
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    v_null_final         INTEGER;
    v_resueltos          INTEGER;
    v_total              INTEGER;
    v_sin_adscripcion    INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total        FROM dim_solicitud_bolsa;
    SELECT COUNT(*) INTO v_null_final   FROM dim_solicitud_bolsa WHERE id_ipress IS NULL;
    SELECT COUNT(*) INTO v_resueltos    FROM dim_solicitud_bolsa WHERE id_ipress IS NOT NULL;
    SELECT COUNT(*) INTO v_sin_adscripcion
    FROM dim_solicitud_bolsa
    WHERE id_ipress IS NULL AND codigo_adscripcion IS NULL;

    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════';
    RAISE NOTICE 'V6_22_0 - REPORTE FINAL';
    RAISE NOTICE '  Total registros            : %', v_total;
    RAISE NOTICE '  id_ipress resueltos        : %', v_resueltos;
    RAISE NOTICE '  id_ipress aún NULL         : %', v_null_final;
    RAISE NOTICE '  (de los NULL: sin codigo_adscripcion ni asegurado): %', v_sin_adscripcion;
    RAISE NOTICE '══════════════════════════════════════════════════════';

    IF v_null_final > 0 AND v_null_final > v_sin_adscripcion THEN
        RAISE WARNING 'Quedan % registros con id_ipress=NULL pero con codigo_adscripcion. Revisar si el código existe en dim_ipress.', (v_null_final - v_sin_adscripcion);
    END IF;
END $$;
