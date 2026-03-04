-- ============================================================================
-- V6_23_0: Trigger para sincronizar codigo_adscripcion desde id_ipress
--
-- Problema arquitectural:
--   dim_solicitud_bolsa tiene dos columnas que deberían ser una sola:
--     - id_ipress           FK → dim_ipress  (fuente de verdad)
--     - codigo_adscripcion  texto denormalizado (duplicado propenso a bugs)
--     - codigo_ipress       OTRO duplicado del código texto
--
-- Solución:
--   Trigger BEFORE INSERT/UPDATE: si se establece id_ipress,
--   auto-derivar codigo_adscripcion de dim_ipress.cod_ipress.
--   El código existente que lee codigo_adscripcion sigue funcionando,
--   pero la consistencia queda garantizada por la BD.
--
-- Fase B (futura): eliminar codigo_adscripcion y codigo_ipress una vez
--   que todo el código lea desde id_ipress + JOIN.
--
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-03
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCIÓN del trigger
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_sync_codigo_adscripcion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_ipress TEXT;
BEGIN
    -- Solo actuar si id_ipress cambió o fue establecido
    IF NEW.id_ipress IS NOT NULL AND (
        TG_OP = 'INSERT'
        OR OLD.id_ipress IS DISTINCT FROM NEW.id_ipress
    ) THEN
        SELECT cod_ipress INTO v_cod_ipress
        FROM dim_ipress
        WHERE id_ipress = NEW.id_ipress;

        IF v_cod_ipress IS NOT NULL THEN
            NEW.codigo_adscripcion := v_cod_ipress;
            -- codigo_ipress es duplicado exacto, mantenerlo sincronizado también
            NEW.codigo_ipress      := v_cod_ipress;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Eliminar trigger anterior si existe (idempotente)
-- ─────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_sync_codigo_adscripcion ON dim_solicitud_bolsa;

-- ─────────────────────────────────────────────────────────────────────────────
-- Crear trigger
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER trg_sync_codigo_adscripcion
BEFORE INSERT OR UPDATE OF id_ipress
ON dim_solicitud_bolsa
FOR EACH ROW
EXECUTE FUNCTION fn_sync_codigo_adscripcion();

-- ─────────────────────────────────────────────────────────────────────────────
-- Backfill: sincronizar registros existentes donde id_ipress ya está resuelto
-- pero codigo_adscripcion podría estar desincronizado o NULL
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE dim_solicitud_bolsa sb
SET
    codigo_adscripcion = di.cod_ipress,
    codigo_ipress      = di.cod_ipress
FROM dim_ipress di
WHERE sb.id_ipress = di.id_ipress
  AND (
        sb.codigo_adscripcion IS DISTINCT FROM di.cod_ipress
     OR sb.codigo_ipress IS DISTINCT FROM di.cod_ipress
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Verificación
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    v_desincronizados INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_desincronizados
    FROM dim_solicitud_bolsa sb
    JOIN dim_ipress di ON sb.id_ipress = di.id_ipress
    WHERE sb.codigo_adscripcion IS DISTINCT FROM di.cod_ipress;

    RAISE NOTICE '══════════════════════════════════════════════════════';
    RAISE NOTICE 'V6_23_0 - TRIGGER SINCRONIZACIÓN IPRESS';
    RAISE NOTICE '  Trigger creado  : trg_sync_codigo_adscripcion';
    RAISE NOTICE '  Función creada  : fn_sync_codigo_adscripcion()';
    RAISE NOTICE '  Desincronizados post-backfill: %', v_desincronizados;
    IF v_desincronizados = 0 THEN
        RAISE NOTICE '  ✅ codigo_adscripcion 100%% consistente con id_ipress';
    ELSE
        RAISE WARNING '  ⚠️  Quedan % registros desincronizados', v_desincronizados;
    END IF;
    RAISE NOTICE '══════════════════════════════════════════════════════';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTA ARQUITECTURAL:
--   codigo_adscripcion y codigo_ipress son ahora columnas DERIVADAS.
--   La única fuente de verdad es id_ipress → dim_ipress.
--   Fase B: cuando todo el código use id_ipress + JOIN, ejecutar:
--     ALTER TABLE dim_solicitud_bolsa DROP COLUMN codigo_adscripcion;
--     ALTER TABLE dim_solicitud_bolsa DROP COLUMN codigo_ipress;
-- ─────────────────────────────────────────────────────────────────────────────
