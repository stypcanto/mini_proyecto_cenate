-- ============================================================
-- V6_5_0: Unificar Bolsa Mesa de Ayuda → Bolsa Reprogramación
-- ============================================================
-- v1.78.6 (2026-02-27)
-- Contexto: Los 251 registros de "Bolsa de mesa de ayuda" (id=13)
-- deben consolidarse en "Bolsas Reprogramación" (id=6).
-- A partir de ahora, cuando Mesa de Ayuda envía a bolsa,
-- los registros van directamente al id=6.
-- ============================================================

-- 1. Reasignar registros de Bolsa Mesa de Ayuda → Bolsa Reprogramación
UPDATE dim_solicitud_bolsa
SET id_bolsa = 6
WHERE id_bolsa = 13;

-- 2. Inactivar la bolsa "Mesa de Ayuda" del catálogo (ya no se usará)
UPDATE dim_tipos_bolsas
SET stat_tipo_bolsa = 'I'
WHERE id_tipo_bolsa = 13
  AND cod_tipo_bolsa = 'BOLSA_MESA_DE_AYUDA';

-- Verificación (informativa, no bloquea)
DO $$
DECLARE
    v_count_reasignados INTEGER;
    v_count_id13 INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count_reasignados FROM dim_solicitud_bolsa WHERE id_bolsa = 6;
    SELECT COUNT(*) INTO v_count_id13 FROM dim_solicitud_bolsa WHERE id_bolsa = 13;
    RAISE NOTICE '✅ Bolsa Reprogramación (id=6) ahora tiene % registros', v_count_reasignados;
    RAISE NOTICE '✅ Bolsa Mesa de Ayuda (id=13) tiene % registros restantes (debe ser 0)', v_count_id13;
END $$;
