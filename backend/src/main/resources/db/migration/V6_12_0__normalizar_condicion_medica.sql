-- ============================================================================
-- V6_12_0: Normalizar condicion_medica a 4 valores canónicos
-- Valores objetivo: Atendido | Pendiente | Deserción | Anulado
-- Problemas encontrados:
--   - 'Anulada'    → 'Anulado'   (género incorrecto)
--   - 'Desercion'  → 'Deserción' (falta tilde)
--   - ''  (vacío)  → NULL        (cadena vacía sin sentido)
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-02
-- ============================================================================

UPDATE dim_solicitud_bolsa SET condicion_medica = 'Anulado'   WHERE condicion_medica = 'Anulada';
UPDATE dim_solicitud_bolsa SET condicion_medica = 'Deserción' WHERE condicion_medica = 'Desercion';
UPDATE dim_solicitud_bolsa SET condicion_medica = NULL        WHERE condicion_medica = '';

DO $$
DECLARE
    v_invalidos INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_invalidos
    FROM dim_solicitud_bolsa
    WHERE condicion_medica IS NOT NULL
      AND condicion_medica NOT IN ('Atendido', 'Pendiente', 'Deserción', 'Anulado');

    IF v_invalidos = 0 THEN
        RAISE NOTICE 'V6_12_0: ✅ condicion_medica normalizada — solo valores canónicos en BD';
    ELSE
        RAISE WARNING 'V6_12_0: % registros con valores fuera del catálogo canónico', v_invalidos;
    END IF;
END $$;
