-- ============================================================================
-- V6_11_0: Normalizar estado de dim_solicitud_bolsa a UPPERCASE
-- Problema: 10 registros tienen estado = 'Observado' (capitalización mixta)
--           conviviendo con 1,147 registros con 'OBSERVADO' (correcto).
-- Solución: Convertir todos los estados a UPPERCASE para consistencia.
-- Afectados: 10 registros (estado = 'Observado')
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-02
-- ============================================================================

UPDATE dim_solicitud_bolsa
SET estado = UPPER(estado)
WHERE estado != UPPER(estado)
  AND estado IS NOT NULL;

DO $$
DECLARE
    v_remaining INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_remaining
    FROM dim_solicitud_bolsa
    WHERE estado != UPPER(estado) AND estado IS NOT NULL;

    IF v_remaining = 0 THEN
        RAISE NOTICE 'V6_11_0: ✅ Todos los estados normalizados a UPPERCASE';
    ELSE
        RAISE WARNING 'V6_11_0: Quedaron % registros con estado en minúsculas', v_remaining;
    END IF;
END $$;
