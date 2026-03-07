-- =============================================================================
-- V6_33_0 - Trigger auto-poblar paciente_id en dim_solicitud_bolsa
-- =============================================================================
-- Problema: Procesos externos (scripts DBA, cron jobs) insertan registros en
--           dim_solicitud_bolsa sin poblar paciente_id, rompiendo el JOIN con
--           paciente_estrategia y haciendo que los pacientes Maraton pierdan
--           su etiqueta aunque siguen ACTIVO en paciente_estrategia.
--
-- Solucion:
--   1. Trigger BEFORE INSERT: si paciente_id es NULL, lo busca en asegurados
--      por doc_paciente = NEW.paciente_dni.
--   2. Backfill de los registros actuales con paciente_id IS NULL.
--
-- Fecha   : 2026-03-06
-- Version : V6_33_0
-- =============================================================================

-- -----------------------------------------------------------------------
-- 1. Funcion del trigger
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_auto_populate_paciente_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo actua si paciente_id esta vacio y hay un DNI disponible
    IF (NEW.paciente_id IS NULL OR NEW.paciente_id = '') AND NEW.paciente_dni IS NOT NULL THEN
        SELECT pk_asegurado
          INTO NEW.paciente_id
          FROM asegurados
         WHERE doc_paciente = NEW.paciente_dni
         LIMIT 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------
-- 2. Trigger en dim_solicitud_bolsa (BEFORE INSERT)
-- -----------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_auto_populate_paciente_id ON dim_solicitud_bolsa;

CREATE TRIGGER trg_auto_populate_paciente_id
    BEFORE INSERT ON dim_solicitud_bolsa
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_populate_paciente_id();

-- -----------------------------------------------------------------------
-- 3. Backfill: corregir registros existentes con paciente_id IS NULL
--    (todos los registros activos de cualquier bolsa)
-- -----------------------------------------------------------------------
UPDATE dim_solicitud_bolsa dsb
   SET paciente_id = a.pk_asegurado,
       updated_at  = NOW()
  FROM asegurados a
 WHERE dsb.paciente_id IS NULL
   AND dsb.paciente_dni IS NOT NULL
   AND a.doc_paciente   = dsb.paciente_dni;

-- Verificacion final (informativa)
DO $$
DECLARE
    v_sin_id BIGINT;
BEGIN
    SELECT COUNT(*) INTO v_sin_id
      FROM dim_solicitud_bolsa
     WHERE id_bolsa = 17 AND activo = true AND paciente_id IS NULL;

    RAISE NOTICE 'V6_33_0 aplicado. Registros aun sin paciente_id en bolsa 17: %', v_sin_id;
    RAISE NOTICE 'Trigger trg_auto_populate_paciente_id activo en dim_solicitud_bolsa';
END;
$$;
