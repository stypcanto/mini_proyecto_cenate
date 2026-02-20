-- V5_1_0__fix_ipress_atencion_bolsa_padomi.sql
-- 🏥 Fix IPRESS ATENCIÓN nula en Bolsa Pacientes derivados de PADOMI
-- Fecha: 2026-02-20
--
-- Problema:
--   Los registros de la bolsa PADOMI tienen id_ipress_atencion = NULL
--   → El frontend muestra "N/A" en la columna IPRESS ATENCIÓN
--
-- Solución:
--   Asignar id_ipress_atencion = 396 (PROGRAMA DE ATENCION DOMICILIARIA-PADOMI)
--   a todos los registros PADOMI donde este campo sea NULL
--
-- IPRESS destino: id_ipress=413, cod_ipress=396 = PROGRAMA DE ATENCION DOMICILIARIA-PADOMI

BEGIN;

-- Verificar que la IPRESS 396 existe antes de actualizar
DO $$
DECLARE
    v_desc_ipress TEXT;
    v_total_afectados INT;
BEGIN
    -- Verificar IPRESS ID 396
    SELECT desc_ipress INTO v_desc_ipress
    FROM dim_ipress
    WHERE id_ipress = 413;

    IF v_desc_ipress IS NULL THEN
        RAISE EXCEPTION 'ERROR: No existe la IPRESS con id_ipress = 413 en dim_ipress. Migración cancelada.';
    END IF;

    RAISE NOTICE '✅ IPRESS encontrada: ID=413 → %', v_desc_ipress;

    -- Contar registros a actualizar
    SELECT COUNT(*) INTO v_total_afectados
    FROM dim_solicitud_bolsa sb
    JOIN dim_tipos_bolsas tb ON sb.id_bolsa = tb.id_tipo_bolsa
    WHERE (LOWER(tb.desc_tipo_bolsa) LIKE '%padomi%' OR LOWER(tb.desc_tipo_bolsa) LIKE '%derivado%')
      AND sb.id_ipress_atencion IS NULL;

    RAISE NOTICE '📋 Registros PADOMI con id_ipress_atencion NULL: %', v_total_afectados;

    IF v_total_afectados = 0 THEN
        RAISE NOTICE '⚠️  No hay registros que actualizar. Puede que ya estén corregidos.';
    END IF;
END $$;

-- Actualizar id_ipress_atencion = 413 para todos los registros PADOMI donde sea NULL
UPDATE dim_solicitud_bolsa sb
SET
    id_ipress_atencion = 413,
    updated_at = CURRENT_TIMESTAMP
FROM dim_tipos_bolsas tb
WHERE sb.id_bolsa = tb.id_tipo_bolsa
  AND (LOWER(tb.desc_tipo_bolsa) LIKE '%padomi%' OR LOWER(tb.desc_tipo_bolsa) LIKE '%derivado%')
  AND sb.id_ipress_atencion IS NULL;

-- Reporte final
DO $$
DECLARE
    v_actualizados INT;
    v_pendientes   INT;
BEGIN
    SELECT COUNT(*) INTO v_actualizados
    FROM dim_solicitud_bolsa sb
    JOIN dim_tipos_bolsas tb ON sb.id_bolsa = tb.id_tipo_bolsa
    WHERE (LOWER(tb.desc_tipo_bolsa) LIKE '%padomi%' OR LOWER(tb.desc_tipo_bolsa) LIKE '%derivado%')
      AND sb.id_ipress_atencion = 413;

    SELECT COUNT(*) INTO v_pendientes
    FROM dim_solicitud_bolsa sb
    JOIN dim_tipos_bolsas tb ON sb.id_bolsa = tb.id_tipo_bolsa
    WHERE (LOWER(tb.desc_tipo_bolsa) LIKE '%padomi%' OR LOWER(tb.desc_tipo_bolsa) LIKE '%derivado%')
      AND sb.id_ipress_atencion IS NULL;

    RAISE NOTICE '';
    RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║   FIX IPRESS ATENCIÓN - BOLSA PADOMI (V5_1_0)               ║';
    RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║  Registros con id_ipress_atencion = 413 : %', LPAD(v_actualizados::TEXT, 10);
    RAISE NOTICE '║  Registros con id_ipress_atencion NULL  : %', LPAD(v_pendientes::TEXT, 10);
    RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';

    IF v_pendientes > 0 THEN
        RAISE WARNING '⚠️  Quedan % registros PADOMI sin IPRESS ATENCIÓN asignada.', v_pendientes;
    ELSE
        RAISE NOTICE '✅ Todos los registros PADOMI tienen IPRESS ATENCIÓN asignada.';
    END IF;
END $$;

COMMIT;
