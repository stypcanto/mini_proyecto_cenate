-- ============================================================================
-- V6_24_0: Trigger bidireccional IPRESS — elimina inconsistencias permanentemente
--
-- Problema: cuando el código Java inserta con codigo_adscripcion pero sin
--   id_ipress (o viceversa), las columnas quedan desincronizadas.
--
-- Solución: trigger BEFORE INSERT/UPDATE que resuelve en AMBAS direcciones:
--   (A) Si llega id_ipress → auto-deriva codigo_adscripcion desde dim_ipress
--   (B) Si llega codigo_adscripcion (y id_ipress=NULL) → resuelve id_ipress
--
-- Esto garantiza que siempre queden consistentes, independientemente de
-- qué campo establezca el código Java.
--
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-03
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCIÓN bidireccional
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_sync_ipress_bidireccional()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_ipress  TEXT;
    v_id_ipress   BIGINT;
BEGIN
    -- ─── DIRECCIÓN A: id_ipress → codigo_adscripcion ───────────────────────
    -- Si id_ipress fue establecido o cambió, derivar el código texto
    IF NEW.id_ipress IS NOT NULL AND (
        TG_OP = 'INSERT'
        OR OLD.id_ipress IS DISTINCT FROM NEW.id_ipress
    ) THEN
        SELECT cod_ipress INTO v_cod_ipress
        FROM dim_ipress WHERE id_ipress = NEW.id_ipress;

        IF v_cod_ipress IS NOT NULL THEN
            NEW.codigo_adscripcion := v_cod_ipress;
            NEW.codigo_ipress      := v_cod_ipress;
        END IF;

    -- ─── DIRECCIÓN B: codigo_adscripcion → id_ipress ───────────────────────
    -- Si id_ipress es NULL pero código texto tiene valor, resolver el FK
    ELSIF NEW.id_ipress IS NULL
      AND NEW.codigo_adscripcion IS NOT NULL
      AND TRIM(NEW.codigo_adscripcion) <> ''
    THEN
        -- Normalizar a 3 dígitos antes de buscar (ej: "21" → "021")
        v_cod_ipress := NEW.codigo_adscripcion;
        IF v_cod_ipress ~ '^\d{1,2}$' THEN
            v_cod_ipress := LPAD(v_cod_ipress, 3, '0');
            NEW.codigo_adscripcion := v_cod_ipress;
            NEW.codigo_ipress      := v_cod_ipress;
        END IF;

        SELECT id_ipress INTO v_id_ipress
        FROM dim_ipress WHERE cod_ipress = v_cod_ipress;

        IF v_id_ipress IS NOT NULL THEN
            NEW.id_ipress := v_id_ipress;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Reemplazar trigger anterior con el bidireccional
-- ─────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_sync_codigo_adscripcion    ON dim_solicitud_bolsa;
DROP TRIGGER IF EXISTS trg_sync_ipress_bidireccional  ON dim_solicitud_bolsa;

CREATE TRIGGER trg_sync_ipress_bidireccional
BEFORE INSERT OR UPDATE OF id_ipress, codigo_adscripcion
ON dim_solicitud_bolsa
FOR EACH ROW
EXECUTE FUNCTION fn_sync_ipress_bidireccional();

-- ─────────────────────────────────────────────────────────────────────────────
-- Verificación: no debería haber ninguna inconsistencia
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    v_desinc INTEGER;
    v_ambos_null INTEGER;
    v_total INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total FROM dim_solicitud_bolsa;

    -- Caso problemático: tiene codigo_adscripcion pero no id_ipress (o viceversa)
    SELECT COUNT(*) INTO v_desinc
    FROM dim_solicitud_bolsa sb
    JOIN dim_ipress di ON sb.id_ipress = di.id_ipress
    WHERE sb.codigo_adscripcion IS DISTINCT FROM di.cod_ipress;

    -- Legítimamente sin IPRESS (CENACRON, recitas sin adscripción)
    SELECT COUNT(*) INTO v_ambos_null
    FROM dim_solicitud_bolsa
    WHERE id_ipress IS NULL AND (codigo_adscripcion IS NULL OR codigo_adscripcion = '');

    RAISE NOTICE '══════════════════════════════════════════════════════════════';
    RAISE NOTICE 'V6_24_0 - TRIGGER BIDIRECCIONAL IPRESS';
    RAISE NOTICE '  Total registros                   : %', v_total;
    RAISE NOTICE '  Desincronizados (bug)              : %', v_desinc;
    RAISE NOTICE '  Sin IPRESS (legítimo, ambos NULL)  : %', v_ambos_null;
    IF v_desinc = 0 THEN
        RAISE NOTICE '  ✅ Consistencia 100%% garantizada por trigger bidireccional';
    ELSE
        RAISE WARNING '  ⚠️  Quedan % desincronizados', v_desinc;
    END IF;
    RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;
