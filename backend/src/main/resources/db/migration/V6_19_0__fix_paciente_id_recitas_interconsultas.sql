-- ============================================================================
-- V6_19_0: Fix paciente_id en REC/INT de dim_solicitud_bolsa
-- Problema: En recitas (REC-) e interconsultas (INT-) el campo paciente_id
--           tiene valores incorrectos:
--           a) NULL          — workaround de anoche para evitar FK violation
--           b) UUID          — valor copiado de otra entidad (antes del fix)
--           c) DNI sin cero  — ej: "9831026" en lugar de "09831026"
-- Solución: Actualizar paciente_id = asegurados.pk_asegurado
--           haciendo JOIN por paciente_dni = asegurados.doc_paciente
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-03
-- ============================================================================

-- ─── PASO 1: Diagnóstico ─────────────────────────────────────────────────────
DO $$
DECLARE
    v_null_count   INTEGER;
    v_uuid_count   INTEGER;
    v_short_count  INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_null_count
    FROM dim_solicitud_bolsa
    WHERE (numero_solicitud LIKE 'REC-%' OR numero_solicitud LIKE 'INT-%')
      AND paciente_id IS NULL;

    SELECT COUNT(*) INTO v_uuid_count
    FROM dim_solicitud_bolsa
    WHERE (numero_solicitud LIKE 'REC-%' OR numero_solicitud LIKE 'INT-%')
      AND paciente_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

    SELECT COUNT(*) INTO v_short_count
    FROM dim_solicitud_bolsa
    WHERE (numero_solicitud LIKE 'REC-%' OR numero_solicitud LIKE 'INT-%')
      AND paciente_id IS NOT NULL
      AND paciente_id ~ '^\d+$'
      AND LENGTH(TRIM(paciente_id)) < 8;

    RAISE NOTICE 'V6_19_0 DIAGNÓSTICO (REC + INT):';
    RAISE NOTICE '  paciente_id NULL         : %', v_null_count;
    RAISE NOTICE '  paciente_id UUID         : %', v_uuid_count;
    RAISE NOTICE '  paciente_id DNI sin cero : %', v_short_count;
END $$;

-- ─── PASO 2: Corregir paciente_id usando pk_asegurado real ───────────────────
UPDATE dim_solicitud_bolsa b
SET paciente_id = a.pk_asegurado
FROM asegurados a
WHERE a.doc_paciente = b.paciente_dni
  AND (b.numero_solicitud LIKE 'REC-%' OR b.numero_solicitud LIKE 'INT-%')
  AND (
      b.paciente_id IS NULL
      OR b.paciente_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      OR (b.paciente_id ~ '^\d+$' AND LENGTH(TRIM(b.paciente_id)) < 8)
  );

-- ─── PASO 3: Verificación final ──────────────────────────────────────────────
DO $$
DECLARE
    v_restantes INTEGER;
    v_total     INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM dim_solicitud_bolsa
    WHERE numero_solicitud LIKE 'REC-%' OR numero_solicitud LIKE 'INT-%';

    SELECT COUNT(*) INTO v_restantes
    FROM dim_solicitud_bolsa
    WHERE (numero_solicitud LIKE 'REC-%' OR numero_solicitud LIKE 'INT-%')
      AND (
          paciente_id IS NULL
          OR paciente_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          OR (paciente_id ~ '^\d+$' AND LENGTH(TRIM(paciente_id)) < 8)
      );

    RAISE NOTICE 'V6_19_0 RESULTADO:';
    RAISE NOTICE '  Total REC+INT            : %', v_total;
    RAISE NOTICE '  paciente_id aún inválidos: %', v_restantes;

    IF v_restantes = 0 THEN
        RAISE NOTICE '  ✅ Todos los paciente_id de REC/INT están correctos';
    ELSE
        RAISE WARNING '  ⚠️  % registros sin fix (DNI no existe en tabla asegurados)', v_restantes;
    END IF;
END $$;
