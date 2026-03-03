-- ============================================================================
-- V6_20_0: Fix paciente_id NULL en dim_solicitud_bolsa (todos los tipos)
-- Problema: 364 registros tienen paciente_id = NULL en todos los formatos:
--           - Formato antiguo numérico (100001, 100002, ...)  → 287 registros
--           - BOLSA-20260302-xxxxx                           →  22 registros
--           - REC-xxxxxxxxxxxxxxx                            →   5 registros
--           - INT-xxxxxxxxxxxxxxx                            →   1 registro
-- Solución: UPDATE usando JOIN por paciente_dni = asegurados.doc_paciente
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-03
-- ============================================================================

-- ─── PASO 1: Diagnóstico previo ──────────────────────────────────────────────
DO $$
DECLARE
    v_total       INTEGER;
    v_corregibles INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM dim_solicitud_bolsa
    WHERE paciente_id IS NULL;

    SELECT COUNT(*) INTO v_corregibles
    FROM dim_solicitud_bolsa b
    JOIN asegurados a ON a.doc_paciente = b.paciente_dni
    WHERE b.paciente_id IS NULL;

    RAISE NOTICE 'V6_20_0 DIAGNÓSTICO:';
    RAISE NOTICE '  paciente_id NULL total    : %', v_total;
    RAISE NOTICE '  Corregibles (con asegurado): %', v_corregibles;
    RAISE NOTICE '  Sin asegurado (quedarán NULL): %', v_total - v_corregibles;
END $$;

-- ─── PASO 2: Corregir paciente_id usando pk_asegurado real ───────────────────
UPDATE dim_solicitud_bolsa b
SET paciente_id = a.pk_asegurado
FROM asegurados a
WHERE a.doc_paciente = b.paciente_dni
  AND b.paciente_id IS NULL;

-- ─── PASO 3: Verificación final ──────────────────────────────────────────────
DO $$
DECLARE
    v_restantes INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_restantes
    FROM dim_solicitud_bolsa
    WHERE paciente_id IS NULL;

    RAISE NOTICE 'V6_20_0 RESULTADO:';
    RAISE NOTICE '  paciente_id NULL restantes: %', v_restantes;

    IF v_restantes = 0 THEN
        RAISE NOTICE '  ✅ Todos los paciente_id están correctos';
    ELSE
        RAISE WARNING '  ⚠️  % registros sin fix (DNI no existe en tabla asegurados)', v_restantes;
    END IF;
END $$;
